import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/** Testimonio de un visitante (con cuenta de Google o desde el formulario simple) */
export default class Review extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column({ serializeAs: null }) declare googleSub: string | null
  @column() declare name: string
  @column() declare country: string | null
  /** 'google' (inició sesión) o 'web' (formulario sin cuenta) */
  @column() declare source: 'google' | 'web'
  @column({ serializeAs: null }) declare ipHash: string | null
  @column({ serializeAs: null }) declare email: string | null
  @column() declare pictureUrl: string | null
  @column() declare rating: number
  @column() declare text: string
  @column() declare locale: string
  @column() declare isVisible: boolean
  @column() declare editedByAdmin: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
