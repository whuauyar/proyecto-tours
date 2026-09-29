import { DateTime } from 'luxon'
import { BaseModel, column, computed } from '@adonisjs/lucid/orm'
import { mediaUrl } from '#services/media'
import { jsonCol, type Tr } from '#services/i18n'

export default class TourImage extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare tourId: number
  @column() declare imageKey: string
  @column(jsonCol()) declare alt: Tr
  @column() declare sortOrder: number

  @computed() get url() {
    return mediaUrl(this.imageKey)
  }

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
