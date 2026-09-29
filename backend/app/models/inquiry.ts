import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tour from '#models/tour'

export default class Inquiry extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare tourId: number | null
  @column() declare name: string
  @column() declare email: string
  @column() declare phone: string | null
  @column() declare country: string | null
  @column.date() declare travelDate: DateTime | null
  @column() declare adults: number
  @column() declare children: number
  @column() declare message: string | null
  @column() declare locale: string
  @column() declare status: 'nuevo' | 'atendido' | 'cerrado'
  @belongsTo(() => Tour) declare tour: BelongsTo<typeof Tour>
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
