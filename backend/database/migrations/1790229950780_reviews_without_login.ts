import { BaseSchema } from '@adonisjs/lucid/schema'

/** Testimonios sin inicio de sesión: país, origen y huella anónima de IP (anti-spam) */
export default class extends BaseSchema {
  protected tableName = 'reviews'

  async up() {
    this.schema.alterTable(this.tableName, (t) => {
      t.string('google_sub', 64).nullable().alter()
      t.string('country', 80).nullable()
      t.string('source', 10).notNullable().defaultTo('google')
      t.string('ip_hash', 64).nullable().index()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (t) => {
      t.dropColumns('country', 'source', 'ip_hash')
    })
  }
}
