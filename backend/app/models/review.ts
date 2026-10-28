import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/** Reseña de un visitante que inició sesión con Google */
export default class Review extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column({ serializeAs: null }) declare googleSub: string
  @column() declare name: string
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
