import { DateTime } from 'luxon'
import { BaseModel, column, computed, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Tour from '#models/tour'
import { mediaUrl } from '#services/media'
import { jsonCol, type Tr } from '#services/i18n'

export default class Destination extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare slug: string
  @column(jsonCol()) declare name: Tr
  @column(jsonCol()) declare summary: Tr
  @column(jsonCol()) declare description: Tr
  @column(jsonCol()) declare highlights: Tr<string[]>
  @column() declare region: string | null
  @column() declare imageKey: string | null
  @column() declare sortOrder: number
  @column() declare isFeatured: boolean
  @column() declare isActive: boolean

  @hasMany(() => Tour) declare tours: HasMany<typeof Tour>

  @computed() get imageUrl() {
    return mediaUrl(this.imageKey)
  }

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
