import env from '#start/env'
import drive from '@adonisjs/drive/services/main'
import { cuid } from '@adonisjs/core/helpers'
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import type { MultipartFile } from '@adonisjs/core/bodyparser'

/** Traduce errores del bucket (S3) a un mensaje claro para el panel */
async function putSafe(key: string, data: Buffer, contentType: string) {
  try {
    await drive.use().put(key, data, { contentType })
  } catch (error: any) {
    const cause = error?.cause?.name ?? error?.cause?.Code ?? ''
    if (/SignatureDoesNotMatch|InvalidAccessKeyId|AccessDenied/.test(cause)) {
      throw new Error(
        'El almacenamiento de imágenes rechazó las credenciales (bucket). Revisa ACCESS_KEY_ID y SECRET_ACCESS_KEY del backend en Railway y vuelve a desplegar.'
      )
    }
    if (/NoSuchBucket/.test(cause)) {
      throw new Error('El bucket de imágenes no existe. Revisa la variable BUCKET del backend en Railway.')
    }
    throw error
  }
}

/** Convierte una key almacenada en la URL pública servida por /media/* */
export function mediaUrl(key: string | null | undefined): string | null {
  if (!key) return null
  if (/^https?:\/\//.test(key)) return key // permite URLs externas (datos de ejemplo)
  return `${env.get('APP_URL').replace(/\/$/, '')}/media/${key}`
}

/**
 * Optimiza la imagen (máx. 1920px, WebP) y la guarda en el disco configurado.
 * Devuelve la key relativa.
 */
export async function storeImage(file: MultipartFile, folder = 'uploads'): Promise<string> {
  const input = await readFile(file.tmpPath!)
  const output = await sharp(input)
    .rotate()
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()
  const now = new Date()
  const key = `${folder}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${cuid()}.webp`
  await putSafe(key, output, 'image/webp')
  return key
}

const RAW_TYPES: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm', gif: 'image/gif' }

/** Guarda el archivo sin transformar (videos y GIF animados conservan su movimiento) */
export async function storeRaw(file: MultipartFile, folder: string, ext: string): Promise<string> {
  const now = new Date()
  const key = `${folder}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${cuid()}.${ext}`
  await putSafe(key, await readFile(file.tmpPath!), RAW_TYPES[ext] ?? 'application/octet-stream')
  return key
}

/** Elimina una imagen sin fallar si no existe o si es una URL externa */
export async function deleteImage(key: string | null | undefined) {
  if (!key || /^https?:\/\//.test(key)) return
  try {
    await drive.use().delete(key)
  } catch {
    // se ignora: el archivo pudo haber sido eliminado antes
  }
}
