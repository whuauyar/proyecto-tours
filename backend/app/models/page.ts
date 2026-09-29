import { DateTime } from 'luxon'
import { BaseModel, column, computed } from '@adonisjs/lucid/orm'
import { mediaUrl } from '#services/media'
import { jsonCol, type Tr } from '#services/i18n'

/** Páginas de contenido "Info útil": clima, boletos, transporte, términos… */
export default class Page extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare slug: string
  @column(jsonCol()) declare title: Tr
  @column(jsonCol()) declare summary: Tr
  @column(jsonCol()) declare body: Tr
  @column() declare imageKey: string | null
  @column() declare showInMenu: boolean
  @column() declare sortOrder: number
  @column() declare isActive: boolean

  @computed() get imageUrl() {
    return mediaUrl(this.imageKey)
  }

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
