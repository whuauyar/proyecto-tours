import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Category from '#models/category'
import Destination from '#models/destination'
import TourImage from '#models/tour_image'
import Faq from '#models/faq'
import { mediaUrl } from '#services/media'
import { jsonCol, moneyCol, type Tr } from '#services/i18n'

export type ItineraryDay = { title: string; description?: string }

export default class Tour extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare destinationId: number | null
  @column() declare categoryId: number | null
  @column() declare slug: string
  @column(jsonCol()) declare title: Tr
  @column(jsonCol()) declare summary: Tr
  @column(jsonCol()) declare description: Tr
  @column(jsonCol()) declare highlights: Tr<string[]>
  @column(jsonCol()) declare itinerary: Tr<ItineraryDay[]>
  @column(jsonCol()) declare includes: Tr<string[]>
  @column(jsonCol()) declare excludes: Tr<string[]>
  @column(jsonCol()) declare recommendations: Tr<string[]>
  @column() declare durationDays: number
  @column() declare durationNights: number
  @column() declare durationHours: number | null
  @column(moneyCol) declare price: number
  @column(moneyCol) declare offerPrice: number | null
  @column(moneyCol) declare childPrice: number | null
  @column() declare currency: string
  @column() declare difficulty: string
  @column() declare groupType: string
  @column(moneyCol) declare rating: number | null
  @column() declare reviewsCount: number
  @column() declare location: string | null
  @column() declare coverKey: string | null
  @column() declare isFeatured: boolean
  @column() declare isActive: boolean
  @column() declare sortOrder: number

  @belongsTo(() => Destination) declare destination: BelongsTo<typeof Destination>
  @belongsTo(() => Category) declare category: BelongsTo<typeof Category>
  @hasMany(() => TourImage, { onQuery: (q) => q.orderBy('sort_order', 'asc') })
  declare images: HasMany<typeof TourImage>
  @hasMany(() => Faq, { onQuery: (q) => q.orderBy('sort_order', 'asc') })
  declare faqs: HasMany<typeof Faq>

  @computed() get coverUrl() {
    return mediaUrl(this.coverKey)
  }

  /** % de descuento de la oferta, para el distintivo "-15%" */
  @computed() get discountPercent() {
    if (this.offerPrice === null || this.offerPrice >= this.price || !this.price) return null
    return Math.round((1 - this.offerPrice / this.price) * 100)
  }

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
