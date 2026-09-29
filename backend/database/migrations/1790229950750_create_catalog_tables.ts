import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Los campos de texto visibles al público son JSONB con una clave por idioma:
 *   { "es": "...", "en": "...", "pt": "...", "zh": "..." }
 * Las listas traducibles (itinerario, incluye, etc.) usan { "es": [...], ... }.
 */
export default class extends BaseSchema {
  async up() {
    const tr = (t: any, name: string) => t.jsonb(name).notNullable().defaultTo('{}')

    this.schema.createTable('destinations', (t) => {
      t.increments('id')
      t.string('slug', 120).notNullable().unique()
      tr(t, 'name')
      tr(t, 'summary')
      tr(t, 'description')
      tr(t, 'highlights')
      t.string('region', 80).nullable()
      t.string('image_key').nullable()
      t.integer('sort_order').notNullable().defaultTo(0)
      t.boolean('is_featured').notNullable().defaultTo(true)
      t.boolean('is_active').notNullable().defaultTo(true)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })

    this.schema.createTable('categories', (t) => {
      t.increments('id')
      t.string('slug', 120).notNullable().unique()
      tr(t, 'name')
      tr(t, 'description')
      t.string('image_key').nullable()
      t.integer('sort_order').notNullable().defaultTo(0)
      t.boolean('is_active').notNullable().defaultTo(true)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })

    this.schema.createTable('tours', (t) => {
      t.increments('id')
      t.integer('destination_id').unsigned().nullable().references('id').inTable('destinations').onDelete('SET NULL')
      t.integer('category_id').unsigned().nullable().references('id').inTable('categories').onDelete('SET NULL')
      t.string('slug', 160).notNullable().unique()
      tr(t, 'title')
      tr(t, 'summary')
      tr(t, 'description')
      tr(t, 'highlights')
      tr(t, 'itinerary')
      tr(t, 'includes')
      tr(t, 'excludes')
      tr(t, 'recommendations')
      t.integer('duration_days').notNullable().defaultTo(1)
      t.integer('duration_nights').notNullable().defaultTo(0)
      t.integer('duration_hours').nullable()
      t.decimal('price', 10, 2).notNullable().defaultTo(0)
      t.decimal('offer_price', 10, 2).nullable()
      t.decimal('child_price', 10, 2).nullable()
      t.string('currency', 3).notNullable().defaultTo('USD')
      t.string('difficulty', 20).notNullable().defaultTo('moderada')
      t.string('group_type', 20).notNullable().defaultTo('compartido')
      t.decimal('rating', 2, 1).nullable()
      t.integer('reviews_count').notNullable().defaultTo(0)
      t.string('location', 150).nullable()
      t.string('cover_key').nullable()
      t.boolean('is_featured').notNullable().defaultTo(false)
      t.boolean('is_active').notNullable().defaultTo(true)
      t.integer('sort_order').notNullable().defaultTo(0)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
      t.index(['is_active', 'destination_id'])
      t.index(['is_active', 'category_id'])
    })

    this.schema.createTable('tour_images', (t) => {
      t.increments('id')
      t.integer('tour_id').unsigned().notNullable().references('id').inTable('tours').onDelete('CASCADE')
      t.string('image_key').notNullable()
      tr(t, 'alt')
      t.integer('sort_order').notNullable().defaultTo(0)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })

    this.schema.createTable('faqs', (t) => {
      t.increments('id')
      t.integer('tour_id').unsigned().nullable().references('id').inTable('tours').onDelete('CASCADE')
      tr(t, 'question')
      tr(t, 'answer')
      t.integer('sort_order').notNullable().defaultTo(0)
      t.boolean('is_active').notNullable().defaultTo(true)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })

    this.schema.createTable('pages', (t) => {
      t.increments('id')
      t.string('slug', 120).notNullable().unique()
      tr(t, 'title')
      tr(t, 'summary')
      tr(t, 'body')
      t.string('image_key').nullable()
      t.boolean('show_in_menu').notNullable().defaultTo(true)
      t.integer('sort_order').notNullable().defaultTo(0)
      t.boolean('is_active').notNullable().defaultTo(true)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })

    this.schema.createTable('inquiries', (t) => {
      t.increments('id')
      t.integer('tour_id').unsigned().nullable().references('id').inTable('tours').onDelete('SET NULL')
      t.string('name', 150).notNullable()
      t.string('email', 254).notNullable()
      t.string('phone', 40).nullable()
      t.string('country', 80).nullable()
      t.date('travel_date').nullable()
      t.integer('adults').notNullable().defaultTo(1)
      t.integer('children').notNullable().defaultTo(0)
      t.text('message').nullable()
      t.string('locale', 5).notNullable().defaultTo('es')
      t.string('status', 20).notNullable().defaultTo('nuevo')
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })

    this.schema.createTable('settings', (t) => {
      t.string('key', 60).primary()
      t.jsonb('value').notNullable().defaultTo('{}')
      t.timestamp('updated_at').nullable()
    })
  }

  async down() {
    for (const name of ['settings', 'inquiries', 'pages', 'faqs', 'tour_images', 'tours', 'categories', 'destinations']) {
      this.schema.dropTableIfExists(name)
    }
  }
}
