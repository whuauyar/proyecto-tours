import env from '#start/env'
import drive from '@adonisjs/drive/services/main'
import { cuid } from '@adonisjs/core/helpers'
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import type { MultipartFile } from '@adonisjs/core/bodyparser'

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
  await drive.use().put(key, output, { contentType: 'image/webp' })
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
