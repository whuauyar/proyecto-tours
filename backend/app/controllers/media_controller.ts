import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import env from '#start/env'

const TYPES: Record<string, string> = {
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
}

/** Sirve los archivos guardados (disco local o Railway Bucket privado) */
export default class MediaController {
  async show({ params, response }: HttpContext) {
    const key = (params['*'] as string[]).join('/')
    if (key.includes('..')) return response.badRequest()
    const disk = drive.use()
    const ext = key.split('.').pop()?.toLowerCase() ?? ''

    // Videos desde el bucket: se redirige a una URL firmada temporal, porque el
    // navegador (sobre todo Safari/iPhone) pide el video por rangos (206) y el bucket los soporta.
    if ((ext === 'mp4' || ext === 'webm') && env.get('DRIVE_DISK') === 's3') {
      response.header('Cache-Control', 'public, max-age=3000')
      return response.redirect(await disk.getSignedUrl(key, { expiresIn: '1h' }))
    }

    if (!(await disk.exists(key))) return response.notFound({ message: 'Archivo no encontrado' })
    response.header('Content-Type', TYPES[ext] ?? 'application/octet-stream')
    // Las keys son únicas (cuid), por eso se pueden cachear "para siempre"
    response.header('Cache-Control', 'public, max-age=31536000, immutable')
    return response.stream(await disk.getStream(key))
  }
}
