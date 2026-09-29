import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'

/** Sirve las imágenes guardadas (disco local o Railway Bucket privado) */
export default class MediaController {
  async show({ params, response }: HttpContext) {
    const key = (params['*'] as string[]).join('/')
    if (key.includes('..')) return response.badRequest()
    const disk = drive.use()
    if (!(await disk.exists(key))) return response.notFound({ message: 'Archivo no encontrado' })
    const ext = key.split('.').pop()?.toLowerCase()
    const types: Record<string, string> = {
      webp: 'image/webp',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      svg: 'image/svg+xml',
    }
    response.header('Content-Type', types[ext ?? ''] ?? 'application/octet-stream')
    // Las keys son únicas (cuid), por eso se pueden cachear "para siempre"
    response.header('Cache-Control', 'public, max-age=31536000, immutable')
    return response.stream(await disk.getStream(key))
  }
}
