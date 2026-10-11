import { BaseSchema } from '@adonisjs/lucid/schema'

/** Estado de cada conversación del bot de WhatsApp (un registro por número) */
export default class extends BaseSchema {
  protected tableName = 'whatsapp_sessions'

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.string('wa_id', 32).primary()
      t.string('name', 150).nullable()
      t.string('lang', 5).notNullable().defaultTo('es')
      t.jsonb('state').notNullable().defaultTo('{}')
      t.string('last_message_id', 128).nullable()
      t.timestamp('human_until').nullable()
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
