/*
|--------------------------------------------------------------------------
| Variables de entorno (validadas al arrancar)
|--------------------------------------------------------------------------
*/
import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),

  /** URL pública del backend, se usa para armar las URLs de imágenes */
  APP_URL: Env.schema.string(),
  /** Orígenes permitidos para CORS, separados por coma (URL del frontend) */
  CORS_ORIGIN: Env.schema.string.optional(),

  /** Base de datos: Railway entrega DATABASE_URL; en local se pueden usar DB_* */
  DATABASE_URL: Env.schema.string.optional(),
  DB_HOST: Env.schema.string.optional(),
  DB_PORT: Env.schema.number.optional(),
  DB_USER: Env.schema.string.optional(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string.optional(),
  DB_SSL: Env.schema.boolean.optional(),

  /** Almacenamiento de imágenes: fs (local) o s3 (Railway Bucket) */
  DRIVE_DISK: Env.schema.enum(['fs', 's3'] as const),
  BUCKET: Env.schema.string.optional(),
  ACCESS_KEY_ID: Env.schema.string.optional(),
  SECRET_ACCESS_KEY: Env.schema.string.optional(),
  REGION: Env.schema.string.optional(),
  ENDPOINT: Env.schema.string.optional(),
  S3_FORCE_PATH_STYLE: Env.schema.boolean.optional(),

  /** Usuario administrador inicial (lo crea el seeder) */
  ADMIN_EMAIL: Env.schema.string.optional(),
  ADMIN_PASSWORD: Env.schema.string.optional(),
  /** Bot de WhatsApp (WhatsApp Cloud API de Meta) */
  WHATSAPP_TOKEN: Env.schema.string.optional(),
  WHATSAPP_PHONE_NUMBER_ID: Env.schema.string.optional(),
  WHATSAPP_VERIFY_TOKEN: Env.schema.string.optional(),
  WHATSAPP_APP_SECRET: Env.schema.string.optional(),
  WHATSAPP_API_VERSION: Env.schema.string.optional(),
  WHATSAPP_API_BASE: Env.schema.string.optional(),
  /** URL pública del sitio (frontend), para los enlaces que envía el bot */
  SITE_URL: Env.schema.string.optional(),
  /** Inicio de sesión con Google para dejar reseñas (Client ID de Google Cloud) */
  GOOGLE_CLIENT_ID: Env.schema.string.optional(),
  /** Crear tours/categorías de ejemplo si la base está vacía (default: true) */
  SEED_DEMO: Env.schema.boolean.optional(),
})
