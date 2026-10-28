import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Review from '#models/review'
import { reviewAdminValidator, reviewValidator } from '#validators/catalog'
import { verifyGoogleCredential } from '#services/google_identity'

export default class ReviewsController {
  /** GET /api/reviews — reseñas visibles, las más recientes primero */
  async index() {
    const rows = await Review.query().where('is_visible', true).orderBy('created_at', 'desc').limit(60)
    const stats = await Review.query().where('is_visible', true).avg('rating as avg').count('* as total').first()
    return {
      items: rows,
      total: Number(stats?.$extras.total ?? 0),
      average: stats?.$extras.avg ? Number(Number(stats.$extras.avg).toFixed(1)) : null,
    }
  }

  /** POST /api/reviews — publica de inmediato (el administrador puede editar u ocultar) */
  async store({ request, response }: HttpContext) {
    const { credential, rating, text, locale } = await request.validateUsing(reviewValidator)
    let profile
    try {
      profile = await verifyGoogleCredential(credential)
    } catch (error) {
      return response.unauthorized({ message: (error as Error).message })
    }

    // Anti-spam: una reseña por cuenta cada 24 horas
    const recent = await Review.query()
      .where('google_sub', profile.sub)
      .where('created_at', '>', DateTime.now().minus({ hours: 24 }).toSQL()!)
      .first()
    if (recent) {
      return response.tooManyRequests({ message: 'Ya registraste una reseña hoy. ¡Gracias por tu opinión!' })
    }

    const review = await Review.create({
      googleSub: profile.sub,
      name: profile.name,
      email: profile.email,
      pictureUrl: profile.picture,
      rating,
      text,
      locale: locale ?? 'es',
      isVisible: true,
      editedByAdmin: false,
    })
    return response.created(review)
  }

  /* ---------- Panel ---------- */

  async adminIndex() {
    const rows = await Review.query().orderBy('created_at', 'desc')
    // En el panel sí se muestra el correo para poder contactar al autor
    return rows.map((r) => ({ ...r.serialize(), email: r.email }))
  }

  async update({ params, request }: HttpContext) {
    const review = await Review.findOrFail(params.id)
    const data = await request.validateUsing(reviewAdminValidator)
    const contentChanged =
      (data.text !== undefined && data.text !== review.text) ||
      (data.rating !== undefined && data.rating !== review.rating) ||
      (data.name !== undefined && data.name !== review.name)
    review.merge(data)
    if (contentChanged) review.editedByAdmin = true
    await review.save()
    return { ...review.serialize(), email: review.email }
  }

  async destroy({ params, response }: HttpContext) {
    const review = await Review.findOrFail(params.id)
    await review.delete()
    return response.noContent()
  }
}
