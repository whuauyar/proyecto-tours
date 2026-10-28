import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Review from '#models/review'
import { reviewAdminValidator, reviewValidator } from '#validators/catalog'
import { verifyGoogleCredential } from '#services/google_identity'
import { createHash } from 'node:crypto'
import env from '#start/env'

/** Huella anónima de la IP (no se guarda la IP) para limitar envíos repetidos */
const ipHash = (ip: string) => createHash('sha256').update(`${ip}|${env.get('APP_KEY')}`).digest('hex')

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

  /**
   * POST /api/reviews — se publica de inmediato (el administrador puede editar, ocultar o eliminar).
   * Con `credential` (Google) se toman nombre y foto de la cuenta; sin él, el nombre escrito.
   */
  async store({ request, response }: HttpContext) {
    const { credential, name, country, website, rating, text, locale } = await request.validateUsing(reviewValidator)
    if (website) return response.created({ ok: true }) // honeypot: bots

    const hash = ipHash(request.ip())
    const since = DateTime.now().minus({ hours: 1 }).toSQL()!
    if (await Review.query().where('ip_hash', hash).where('created_at', '>', since).first()) {
      return response.tooManyRequests({ message: 'Ya registraste un testimonio hace poco. ¡Gracias por tu opinión!' })
    }

    let author: { googleSub: string | null; name: string; email: string | null; pictureUrl: string | null; source: 'google' | 'web' }
    if (credential) {
      try {
        const p = await verifyGoogleCredential(credential)
        author = { googleSub: p.sub, name: p.name, email: p.email, pictureUrl: p.picture, source: 'google' }
      } catch (error) {
        return response.unauthorized({ message: (error as Error).message })
      }
      const recent = await Review.query()
        .where('google_sub', author.googleSub!)
        .where('created_at', '>', DateTime.now().minus({ hours: 24 }).toSQL()!)
        .first()
      if (recent) return response.tooManyRequests({ message: 'Ya registraste un testimonio hoy. ¡Gracias por tu opinión!' })
    } else {
      if (!name) return response.unprocessableEntity({ errors: [{ field: 'name', message: 'Escribe tu nombre' }] })
      author = { googleSub: null, name, email: null, pictureUrl: null, source: 'web' }
    }

    const review = await Review.create({
      ...author,
      country: country || null,
      ipHash: hash,
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
      (data.name !== undefined && data.name !== review.name) ||
      (data.country !== undefined && data.country !== review.country)
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
