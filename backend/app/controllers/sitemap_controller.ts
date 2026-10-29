import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import Destination from '#models/destination'
import Tour from '#models/tour'
import Page from '#models/page'
import { getSite } from '#services/site_settings'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * GET /sitemap.xml — mapa del sitio para Google: portada, listados, destinos, tours y
 * páginas "Info útil" en cada idioma activo, con sus versiones alternativas (hreflang).
 * Las URLs apuntan al frontend (SITE_URL).
 */
export default class SitemapController {
  async show({ response }: HttpContext) {
    const base = (env.get('SITE_URL') || env.get('CORS_ORIGIN') || '').split(',')[0].trim().replace(/\/$/, '')
    const site = await getSite()
    const [dests, tours, pages] = await Promise.all([
      Destination.query().where('is_active', true).select('slug', 'updated_at'),
      Tour.query().where('is_active', true).select('slug', 'updated_at'),
      Page.query().where('is_active', true).select('slug', 'updated_at'),
    ])
    const paths: Array<{ path: string; lastmod?: string; priority: string }> = [
      { path: '', priority: '1.0' },
      { path: '/tours', priority: '0.8' },
      { path: '/contacto', priority: '0.5' },
      ...dests.map((d) => ({ path: `/destino/${d.slug}`, lastmod: d.updatedAt?.toISODate() ?? undefined, priority: '0.8' })),
      ...tours.map((t) => ({ path: `/tour/${t.slug}`, lastmod: t.updatedAt?.toISODate() ?? undefined, priority: '0.9' })),
      ...pages.map((p) => ({ path: `/info/${p.slug}`, lastmod: p.updatedAt?.toISODate() ?? undefined, priority: '0.5' })),
    ]
    const hreflang = (l: string) => (l === 'zh' ? 'zh-Hans' : l)
    const urls = paths.flatMap((p) =>
      site.languages.map((lang) => {
        const alts = site.languages
          .map((l) => `    <xhtml:link rel="alternate" hreflang="${hreflang(l)}" href="${esc(`${base}/${l}${p.path}`)}"/>`)
          .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(`${base}/${site.defaultLanguage}${p.path}`)}"/>`)
          .join('\n')
        return `  <url>\n    <loc>${esc(`${base}/${lang}${p.path}`)}</loc>\n${p.lastmod ? `    <lastmod>${p.lastmod}</lastmod>\n` : ''}    <priority>${p.priority}</priority>\n${alts}\n  </url>`
      })
    )
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
    response.header('Content-Type', 'application/xml; charset=utf-8')
    response.header('Cache-Control', 'public, max-age=3600')
    return xml
  }
}
