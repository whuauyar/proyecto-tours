import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import Inquiry from '#models/inquiry'

const statusValidator = vine.compile(vine.object({ status: vine.enum(['nuevo', 'atendido', 'cerrado']) }))

export default class InquiriesController {
  async index({ request }: HttpContext) {
    const { status, page = 1 } = request.qs()
    const q = Inquiry.query().preload('tour').orderBy('created_at', 'desc')
    if (status) q.where('status', status)
    return q.paginate(Number(page) || 1, 25)
  }

  async update({ params, request }: HttpContext) {
    const inquiry = await Inquiry.findOrFail(params.id)
    inquiry.merge(await request.validateUsing(statusValidator))
    await inquiry.save()
    return inquiry
  }

  async destroy({ params, response }: HttpContext) {
    await (await Inquiry.findOrFail(params.id)).delete()
    return response.noContent()
  }

  async stats() {
    const [row] = await Inquiry.query().where('status', 'nuevo').count('* as total')
    return { nuevas: Number(row.$extras.total) }
  }
}
