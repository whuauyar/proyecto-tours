import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Tour from '#models/tour'
import TourImage from '#models/tour_image'
import Faq from '#models/faq'
import { tourPatchValidator, tourValidator } from '#validators/catalog'
import { slugify } from '#services/slug'
import { deleteImage } from '#services/media'
import { DEST_PRIORITY } from '#controllers/public_controller'

async function uniqueSlug(base: string, ignoreId?: number) {
  const root = slugify(base) || 'tour'
  let slug = root
  for (let n = 2; ; n++) {
    const q = Tour.query().where('slug', slug)
    if (ignoreId) q.whereNot('id', ignoreId)
    if (!(await q.first())) return slug
    slug = `${root}-${n}`
  }
}

export default class ToursController {
  async index({ request }: HttpContext) {
    const { q, category, destination } = request.qs()
    const query = Tour.query().preload('category').preload('destination').orderByRaw(DEST_PRIORITY).orderBy('sort_order').orderBy('id', 'desc')
    if (category) query.where('category_id', category)
    if (destination) query.where('destination_id', destination)
    if (q) query.whereRaw(`title::text ILIKE ?`, [`%${String(q).trim()}%`])
    return query
  }

  async show({ params }: HttpContext) {
    return Tour.query()
      .where('id', params.id)
      .preload('images')
      .preload('faqs')
      .preload('category')
      .preload('destination')
      .firstOrFail()
  }

  async store({ request, response }: HttpContext) {
    const { images, faqs, ...data } = await request.validateUsing(tourValidator)
    const tour = await db.transaction(async (trx) => {
      const t = new Tour().useTransaction(trx)
      t.merge({ ...data, slug: await uniqueSlug(data.slug || data.title.es!) } as any)
      await t.save()
      if (images?.length) await t.related('images').createMany(images.map((img, i) => ({ ...img, sortOrder: i })) as any)
      if (faqs?.length) await t.related('faqs').createMany(faqs.map((f, i) => ({ ...f, sortOrder: i, isActive: true })) as any)
      return t
    })
    await tour.load('images')
    await tour.load('faqs')
    return response.created(tour)
  }

  async update({ params, request }: HttpContext) {
    const tour = await Tour.query().where('id', params.id).preload('images').firstOrFail()
    const { images, faqs, ...data } = await request.validateUsing(tourValidator)
    const removed: string[] = []
    if (tour.coverKey && data.coverKey !== undefined && data.coverKey !== tour.coverKey) removed.push(tour.coverKey)

    await db.transaction(async (trx) => {
      tour.useTransaction(trx)
      tour.merge({ ...data, slug: await uniqueSlug(data.slug || data.title.es!, tour.id) } as any)
      await tour.save()
      // La galería y las FAQ del tour se sincronizan: lo enviado reemplaza lo existente
      if (images) {
        const keep = new Set(images.map((i) => i.imageKey))
        tour.images.filter((i) => !keep.has(i.imageKey)).forEach((i) => removed.push(i.imageKey))
        await TourImage.query({ client: trx }).where('tour_id', tour.id).delete()
        await tour.related('images').createMany(images.map((img, i) => ({ ...img, sortOrder: i })) as any)
      }
      if (faqs) {
        await Faq.query({ client: trx }).where('tour_id', tour.id).delete()
        await tour.related('faqs').createMany(faqs.map((f, i) => ({ ...f, sortOrder: i, isActive: true })) as any)
      }
    })

    await Promise.all(removed.map((k) => deleteImage(k)))
    await tour.load('images')
    await tour.load('faqs')
    return tour
  }

  async patch({ params, request }: HttpContext) {
    const tour = await Tour.findOrFail(params.id)
    tour.merge(await request.validateUsing(tourPatchValidator))
    await tour.save()
    return tour
  }

  async destroy({ params, response }: HttpContext) {
    const tour = await Tour.query().where('id', params.id).preload('images').firstOrFail()
    const keys = [tour.coverKey, ...tour.images.map((i) => i.imageKey)]
    await tour.delete()
    await Promise.all(keys.map((k) => deleteImage(k)))
    return response.noContent()
  }
}
