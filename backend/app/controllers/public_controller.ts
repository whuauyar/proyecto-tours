import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Category from '#models/category'
import Destination from '#models/destination'
import Tour from '#models/tour'
import Faq from '#models/faq'
import Page from '#models/page'
import Inquiry from '#models/inquiry'
import { inquiryValidator } from '#validators/catalog'
import { getSite, withUrls } from '#services/site_settings'

const activeTours = (q: any) => q.where('is_active', true)

/**
 * Prioridad por destino: los tours heredan el orden de su destino
 * (el primero en Admin → Destinos, hoy Cusco, aparece antes en todos los listados).
 */
export const DEST_PRIORITY = '(SELECT d.sort_order FROM destinations d WHERE d.id = tours.destination_id) ASC NULLS LAST'

/* ---------- Búsqueda de tours ---------- */
const ACCENTS_FROM = 'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ'
const ACCENTS_TO = 'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC'
/** Valores de un campo traducible (sin las claves "es", "en"…) */
const vals = (col: string) => `COALESCE((SELECT string_agg(v, ' ') FROM jsonb_each_text(${col}) AS e(k, v)), '')`
/** Minúsculas, sin tildes y con la puntuación convertida en espacios */
const norm = (expr: string) =>
  `(' ' || regexp_replace(lower(translate(${expr}, '${ACCENTS_FROM}', '${ACCENTS_TO}')), '[^a-z0-9\u4e00-\u9fff]+', ' ', 'g'))`
const TITLE = norm(vals('tours.title'))
const HAYSTACK = norm(
  `${vals('tours.title')} || ' ' || ${vals('tours.summary')} || ' ' || COALESCE(tours.location, '') || ' ' ||
   COALESCE((SELECT ${vals('d.name')} FROM destinations d WHERE d.id = tours.destination_id), '') || ' ' ||
   COALESCE((SELECT ${vals('c.name')} FROM categories c WHERE c.id = tours.category_id), '')`
)
/** Palabras que no aportan a la búsqueda */
const STOPWORDS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'en', 'y', 'a', 'al', 'con', 'por', 'para', 'un', 'una', 'the', 'of', 'in', 'to', 'and', 'e', 'do', 'da', 'dos', 'das', 'o'])

export function searchTerms(q: string): string[] {
  return q
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fff]+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .slice(0, 8)
}

export default class PublicController {
  async settings() {
    return withUrls(await getSite())
  }

  /** Menú y datos globales: destinos, tipos y páginas de "Info útil" en una sola llamada */
  async navigation() {
    const [destinations, categories, pages] = await Promise.all([
      Destination.query().where('is_active', true).orderBy('sort_order').withCount('tours', activeTours),
      Category.query().where('is_active', true).orderBy('sort_order').withCount('tours', activeTours),
      Page.query()
        .where('is_active', true)
        .where('show_in_menu', true)
        .orderBy('sort_order')
        .orderBy('id')
        .select('id', 'slug', 'title', 'image_key', 'menu_group', 'menu_subgroup', 'is_highlighted', 'sort_order', 'show_in_menu', 'is_active'),
    ])
    const withCount = (rows: any[]) => rows.map((r) => ({ ...r.serialize(), toursCount: Number(r.$extras.tours_count) }))
    return { destinations: withCount(destinations), categories: withCount(categories), pages }
  }

  async destination({ params, response }: HttpContext) {
    const d = await Destination.query().where('slug', params.slug).where('is_active', true).first()
    if (!d) return response.notFound({ message: 'Destino no encontrado' })
    return d
  }

  async tours({ request }: HttpContext) {
    const { category, destination, featured, q, limit, sort, duration } = request.qs()
    const query = Tour.query().where('is_active', true).preload('category').preload('destination')

    if (destination) query.whereHas('destination', (d) => d.where('slug', destination))
    if (category) query.whereHas('category', (c) => c.where('slug', category))
    if (featured === '1' || featured === 'true') query.where('is_featured', true)
    if (duration === 'day') query.where('duration_days', 1)
    if (duration === 'multi') query.where('duration_days', '>', 1)
    // Cada palabra escrita debe aparecer como inicio de palabra en el título, resumen,
    // ubicación, destino o tipo (sin importar tildes ni mayúsculas). "machu 2 dias" → ambas.
    const terms = q ? searchTerms(String(q)) : []
    for (const term of terms) {
      // El chino no separa palabras con espacios: se busca como subcadena
      const pattern = /[\u4e00-\u9fff]/.test(term) ? `%${term}%` : `% ${term}%`
      query.whereRaw(`${HAYSTACK} LIKE ?`, [pattern])
    }

    const effective = 'COALESCE(offer_price, price)'
    if (terms.length && !sort) {
      // Relevancia: primero los que tienen las palabras en el título
      const score = terms.map(() => `(CASE WHEN ${TITLE} LIKE ? THEN 1 ELSE 0 END)`).join(' + ')
      query.orderByRaw(`(${score}) DESC`, terms.map((t) => (/[\u4e00-\u9fff]/.test(t) ? `%${t}%` : `% ${t}%`)))
    }
    if (sort === 'price_asc') query.orderByRaw(`${effective} ASC`)
    else if (sort === 'price_desc') query.orderByRaw(`${effective} DESC`)
    else if (sort === 'duration') query.orderBy('duration_days').orderBy('duration_hours')
    else query.orderByRaw(DEST_PRIORITY).orderBy('sort_order').orderBy('id', 'desc')

    if (limit) query.limit(Math.min(Number(limit) || 12, 100))
    return query
  }

  async tour({ params, response }: HttpContext) {
    const tour = await Tour.query()
      .where('slug', params.slug)
      .where('is_active', true)
      .preload('category')
      .preload('destination')
      .preload('images')
      .preload('faqs', (f) => f.where('is_active', true))
      .first()
    if (!tour) return response.notFound({ message: 'Tour no encontrado' })
    const related = await Tour.query()
      .where('is_active', true)
      .whereNot('id', tour.id)
      .where((w) => {
        if (tour.destinationId) w.where('destination_id', tour.destinationId)
        else if (tour.categoryId) w.where('category_id', tour.categoryId)
      })
      .preload('category')
      .preload('destination')
      .orderByRaw(DEST_PRIORITY)
      .orderBy('sort_order')
      .limit(3)
    return { ...tour.serialize(), related }
  }

  async faqs() {
    return Faq.query().whereNull('tour_id').where('is_active', true).orderBy('sort_order')
  }

  async page({ params, response }: HttpContext) {
    const page = await Page.query().where('slug', params.slug).where('is_active', true).first()
    if (!page) return response.notFound({ message: 'Página no encontrada' })
    return page
  }

  async storeInquiry({ request, response }: HttpContext) {
    const { website, travelDate, ...data } = await request.validateUsing(inquiryValidator)
    if (website) return response.created({ ok: true }) // honeypot
    await Inquiry.create({
      ...data,
      adults: data.adults ?? 1,
      children: data.children ?? 0,
      travelDate: travelDate ? DateTime.fromJSDate(travelDate) : null,
      locale: data.locale ?? 'es',
      status: 'nuevo',
    })
    return response.created({ ok: true })
  }
}
