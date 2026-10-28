import type { HttpContext } from '@adonisjs/core/http'
import { DEFAULT_SITE, fileKeys, getSite, saveSite, withUrls } from '#services/site_settings'
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
    // Listas: se guardan solo los campos conocidos (se descartan las URLs calculadas)
    const str = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
    const key = (v: unknown) => (typeof v === 'string' && v && !/^https?:/.test(v) ? v : null)
    const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {})
    const arr = (v: unknown, max = 50) => (Array.isArray(v) ? v.slice(0, max) : [])
    if (input.partners) {
      input.partners = arr(input.partners).map((p: any) => ({ name: str(p.name, 120), imageKey: key(p.imageKey), url: str(p.url), pdfKey: key(p.pdfKey) }))
    }
    if (input.features) {
      input.features = arr(input.features, 12).map((f: any) => ({ icon: str(f.icon, 30) || 'star', imageKey: key(f.imageKey), title: obj(f.title), text: obj(f.text) }))
    }
    if (input.extraSocials) {
      input.extraSocials = arr(input.extraSocials, 12).map((x: any) => ({ name: str(x.name, 60), url: str(x.url), imageKey: key(x.imageKey) }))
    }
    if (input.socialPosts) {
      input.socialPosts = arr(input.socialPosts, 12).map((x: any) => ({
        imageKey: key(x.imageKey), network: str(x.network, 20) || 'instagram', account: str(x.account, 80), caption: obj(x.caption), url: str(x.url),
      }))
    }
    if (input.videos) {
      if (input.videos.length > 20) {
        return response.unprocessableEntity({ errors: [{ field: 'videos', message: 'Se permiten hasta 20 videos' }] })
      }
      input.videos = arr(input.videos, 20).map((v: any) => ({ videoKey: key(v.videoKey), posterKey: key(v.posterKey), title: obj(v.title) }))
    }
    if (input.infoGroups) {
      input.infoGroups = arr(input.infoGroups, 12)
        .map((g: any) => ({ key: str(g.key, 40).toLowerCase().replace(/[^a-z0-9-]/g, ''), icon: str(g.icon, 30) || 'info', title: obj(g.title) }))
        .filter((g: any) => g.key)
    }

    const current = await getSite()
    const saved = await saveSite(input)
    const keep = new Set(fileKeys(saved))
    await Promise.all(fileKeys(current).filter((k) => !keep.has(k)).map((k) => deleteImage(k)))
    return withUrls(saved)
  }
}
