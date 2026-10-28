import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * - Páginas "Info útil": grupo del mega-menú, subtítulo opcional (p. ej. "Enero - Febrero")
 *   y marca "Lo más destacado" (se muestra con imagen en el menú).
 * - Reseñas de visitantes identificados con Google.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('pages', (t) => {
      t.string('menu_group', 40).nullable()
      t.jsonb('menu_subgroup').notNullable().defaultTo('{}')
      t.boolean('is_highlighted').notNullable().defaultTo(false)
    })

    this.schema.createTable('reviews', (t) => {
      t.increments('id')
      t.string('google_sub', 64).notNullable().index()
      t.string('name', 150).notNullable()
      t.string('email', 254).nullable()
      t.string('picture_url', 500).nullable()
      t.smallint('rating').notNullable()
      t.text('text').notNullable()
      t.string('locale', 5).notNullable().defaultTo('es')
      t.boolean('is_visible').notNullable().defaultTo(true)
      t.boolean('edited_by_admin').notNullable().defaultTo(false)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTableIfExists('reviews')
    this.schema.alterTable('pages', (t) => {
      t.dropColumns('menu_group', 'menu_subgroup', 'is_highlighted')
    })
  }
}
