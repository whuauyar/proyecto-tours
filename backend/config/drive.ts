import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

/**
 * Las imágenes se guardan como privadas y se sirven a través de la ruta
 * GET /media/* del backend. Así funciona igual con disco local y con
 * Railway Buckets (que son privados por defecto).
 */
const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK'),
  services: {
    fs: services.fs({
      location: app.makePath('storage'),
      serveFiles: false,
      visibility: 'private',
    }),
    s3: services.s3({
      credentials: {
        accessKeyId: env.get('ACCESS_KEY_ID', ''),
        secretAccessKey: env.get('SECRET_ACCESS_KEY', ''),
      },
      region: env.get('REGION', 'auto'),
      endpoint: env.get('ENDPOINT'),
      bucket: env.get('BUCKET', ''),
      forcePathStyle: env.get('S3_FORCE_PATH_STYLE', false),
      visibility: 'private',
    }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
