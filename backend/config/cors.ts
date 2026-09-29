import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

const allowed = (env.get('CORS_ORIGIN') || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean)

const corsConfig = defineConfig({
  enabled: true,
  // Sin CORS_ORIGIN se permite cualquier origen (útil en desarrollo)
  origin: allowed.length ? allowed : true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: false,
  maxAge: 90,
})

export default corsConfig
