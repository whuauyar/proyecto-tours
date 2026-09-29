import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { jsonCol, type Tr } from '#services/i18n'

/** Pregunta frecuente: global (tourId = null) o de un tour específico */
export default class Faq extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare tourId: number | null
  @column(jsonCol()) declare question: Tr
  @column(jsonCol()) declare answer: Tr
  @column() declare sortOrder: number
  @column() declare isActive: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
