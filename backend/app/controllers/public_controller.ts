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

export default class PublicController {
  async settings() {
    return withUrls(await getSite())
  }

  /** Menú y datos globales: destinos, tipos y páginas de "Info útil" en una sola llamada */
  async navigation() {
    const [destinations, categories, pages] = await Promise.all([
      Destination.query().where('is_active', true).orderBy('sort_order').withCount('tours', activeTours),
      Category.query().where('is_active', true).orderBy('sort_order').withCount('tours', activeTours),
      Page.query().where('is_active', true).where('show_in_menu', true).orderBy('sort_order').select('id', 'slug', 'title', 'sort_order', 'show_in_menu', 'is_active'),
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
    if (q) query.whereRaw(`title::text ILIKE ?`, [`%${String(q).trim()}%`])

    const effective = 'COALESCE(offer_price, price)'
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
