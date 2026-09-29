import type { HttpContext } from '@adonisjs/core/http'
import type { LucidModel } from '@adonisjs/lucid/types/model'
import type { VineValidator } from '@vinejs/vine'
import { slugify } from '#services/slug'
import { deleteImage } from '#services/media'

interface Options {
  /** Campo traducible del que se genera el slug (si el modelo tiene slug) */
  slugFrom?: string
  /** Relaciones cuyo conteo se devuelve en el listado (p. ej. tours) */
  countRelation?: string
  orderBy?: Array<[string, 'asc' | 'desc']>
}

/**
 * Crea un controlador CRUD de administración para entidades simples
 * (destinos, tipos de tour, páginas y preguntas frecuentes).
 */
export function crudController(Model: LucidModel, validator: VineValidator<any, any>, opts: Options = {}) {
  const order = opts.orderBy ?? [['sort_order', 'asc'], ['id', 'asc']]

  async function uniqueSlug(base: string, ignoreId?: number) {
    const root = slugify(base) || 'item'
    let slug = root
    for (let n = 2; ; n++) {
      const q = Model.query().where('slug', slug)
      if (ignoreId) q.whereNot('id', ignoreId)
      if (!(await q.first())) return slug
      slug = `${root}-${n}`
    }
  }

  async function payload(data: Record<string, any>, id?: number) {
    if (!opts.slugFrom) return data
    return { ...data, slug: await uniqueSlug(data.slug || data[opts.slugFrom]?.es, id) }
  }

  return class CrudController {
    async index({ request }: HttpContext) {
      const q = Model.query()
      for (const [col, dir] of order) q.orderBy(col, dir)
      if (opts.countRelation) q.withCount(opts.countRelation as never)
      const { tourId } = request.qs()
      if (tourId === 'null') q.whereNull('tour_id')
      else if (tourId) q.where('tour_id', tourId)
      const rows = await q
      return rows.map((r) => ({
        ...r.serialize(),
        ...(opts.countRelation ? { toursCount: Number(r.$extras[`${opts.countRelation}_count`]) } : {}),
      }))
    }

    async show({ params }: HttpContext) {
      return Model.findOrFail(params.id)
    }

    async store({ request, response }: HttpContext) {
      const data = await request.validateUsing(validator)
      const row = await Model.create(await payload(data))
      return response.created(row)
    }

    async update({ params, request }: HttpContext) {
      const row: any = await Model.findOrFail(params.id)
      const data = await request.validateUsing(validator)
      if ('imageKey' in data && row.imageKey && data.imageKey !== row.imageKey) await deleteImage(row.imageKey)
      row.merge(await payload(data, row.id))
      await row.save()
      return row
    }

    async destroy({ params, response }: HttpContext) {
      const row: any = await Model.findOrFail(params.id)
      if (row.imageKey) await deleteImage(row.imageKey)
      await row.delete()
      return response.noContent()
    }
  }
}
