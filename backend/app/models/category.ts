import { DateTime } from 'luxon'
import { BaseModel, column, computed, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Tour from '#models/tour'
import { mediaUrl } from '#services/media'
import { jsonCol, type Tr } from '#services/i18n'

/** Tipo de experiencia: tradicional, privado, aventura, vivencial… */
export default class Category extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare slug: string
  @column(jsonCol()) declare name: Tr
  @column(jsonCol()) declare description: Tr
  @column() declare imageKey: string | null
  @column() declare sortOrder: number
  @column() declare isActive: boolean

  @hasMany(() => Tour) declare tours: HasMany<typeof Tour>

  @computed() get imageUrl() {
    return mediaUrl(this.imageKey)
  }

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
