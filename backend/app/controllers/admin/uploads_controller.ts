import type { HttpContext } from '@adonisjs/core/http'
import { mediaUrl, storeImage } from '#services/media'

export default class UploadsController {
  /** POST /api/admin/uploads (multipart, campo "file") -> { key, url } */
  async store({ request, response }: HttpContext) {
    const file = request.file('file', {
      size: '12mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'JPG', 'JPEG', 'PNG'],
    })
    if (!file) return response.badRequest({ message: 'Adjunta una imagen en el campo "file"' })
    if (!file.isValid) return response.unprocessableEntity({ errors: file.errors })
    const folder = String(request.input('folder', 'uploads')).replace(/[^a-z0-9-]/gi, '') || 'uploads'
    const key = await storeImage(file, folder)
    return response.created({ key, url: mediaUrl(key) })
  }
}
