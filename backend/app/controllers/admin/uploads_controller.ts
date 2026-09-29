import type { HttpContext } from '@adonisjs/core/http'
import { mediaUrl, storeImage, storeRaw } from '#services/media'

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'avif']
/** Se guardan tal cual (sin convertir): videos y GIF animados */
const RAW_EXT = ['mp4', 'webm', 'gif']

export default class UploadsController {
  /** POST /api/admin/uploads (multipart, campo "file") -> { key, url } */
  async store({ request, response }: HttpContext) {
    const file = request.file('file', {
      size: '50mb',
      extnames: [...IMAGE_EXT, ...RAW_EXT].flatMap((e) => [e, e.toUpperCase()]),
    })
    if (!file) return response.badRequest({ message: 'Adjunta un archivo en el campo "file"' })
    if (!file.isValid) return response.unprocessableEntity({ errors: file.errors })

    const ext = (file.extname ?? '').toLowerCase()
    if (IMAGE_EXT.includes(ext) && file.size > 12 * 1024 * 1024) {
      return response.unprocessableEntity({ errors: [{ message: 'Las imágenes pueden pesar hasta 12 MB' }] })
    }
    const folder = String(request.input('folder', 'uploads')).replace(/[^a-z0-9-]/gi, '') || 'uploads'
    const key = RAW_EXT.includes(ext) ? await storeRaw(file, folder, ext) : await storeImage(file, folder)
    return response.created({ key, url: mediaUrl(key) })
  }
}
