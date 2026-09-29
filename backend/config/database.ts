import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const databaseUrl = env.get('DATABASE_URL')
const ssl = env.get('DB_SSL', false) ? { rejectUnauthorized: false } : false

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: databaseUrl
        ? { connectionString: databaseUrl, ssl }
        : {
            host: env.get('DB_HOST', '127.0.0.1'),
            port: env.get('DB_PORT', 5432),
            user: env.get('DB_USER', 'postgres'),
            password: env.get('DB_PASSWORD'),
            database: env.get('DB_DATABASE', 'tours'),
            ssl,
          },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
