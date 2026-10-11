import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { jsonCol, type Lang } from '#services/i18n'

export interface WaState {
  step?: 'date' | 'adults' | 'children' | 'name' | 'email' | 'confirm' | null
  tourId?: number | null
  date?: string
  adults?: number
  children?: number
  name?: string
  email?: string
}

export default class WhatsappSession extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true }) declare waId: string
  @column() declare name: string | null
  @column() declare lang: Lang
  @column(jsonCol()) declare state: WaState
  @column() declare lastMessageId: string | null
  @column.dateTime() declare humanUntil: DateTime | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
