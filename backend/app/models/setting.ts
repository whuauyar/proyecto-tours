import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Setting extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare key: string

  @column({
    prepare: (v: unknown) => JSON.stringify(v ?? {}),
    consume: (v: unknown) => (typeof v === 'string' ? JSON.parse(v) : (v ?? {})),
  })
  declare value: Record<string, any>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
