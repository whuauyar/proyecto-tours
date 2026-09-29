import type { HttpContext } from '@adonisjs/core/http'
import { DEFAULT_SITE, getSite, saveSite, withUrls } from '#services/site_settings'
import { deleteImage } from '#services/media'
import { LANGS } from '#services/i18n'

export default class SettingsController {
  async show() {
    return withUrls(await getSite())
  }

  async update({ request, response }: HttpContext) {
    const keys = Object.keys(DEFAULT_SITE) as Array<keyof typeof DEFAULT_SITE>
    const input: Record<string, any> = request.only(keys)

    // Idiomas: solo los soportados, el español siempre activo
    if (input.languages) {
      const langs = (input.languages as string[]).filter((l) => (LANGS as readonly string[]).includes(l))
      input.languages = LANGS.filter((l) => l === 'es' || langs.includes(l))
    }
    if (input.defaultLanguage && !(input.languages ?? LANGS).includes(input.defaultLanguage)) {
      return response.unprocessableEntity({ errors: [{ field: 'defaultLanguage', message: 'El idioma por defecto debe estar activo' }] })
    }
    for (const c of ['primaryColor', 'accentColor']) {
      if (input[c] && !/^#[0-9a-f]{6}$/i.test(input[c])) delete input[c]
    }
    if (input.partners) {
      input.partners = input.partners.map((p: any) => ({ name: p.name ?? '', imageKey: p.imageKey ?? null, url: p.url ?? '' }))
    }

    const current = await getSite()
    const oldKeys = [current.logoKey, current.heroImageKey, ...current.partners.map((p) => p.imageKey)]
    const saved = await saveSite(input)
    const newKeys = new Set([saved.logoKey, saved.heroImageKey, ...saved.partners.map((p) => p.imageKey)])
    await Promise.all(oldKeys.filter((k) => k && !newKeys.has(k)).map((k) => deleteImage(k)))
    return withUrls(saved)
  }
}
