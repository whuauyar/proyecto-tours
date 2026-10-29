import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from './i18n'
import { useSite } from './site'

/**
 * SEO básico por página: título, descripción, Open Graph (WhatsApp/Facebook),
 * URL canónica, versiones por idioma (hreflang) y datos estructurados (JSON-LD).
 */
export function useSeo(opts: { title?: string | null; description?: string | null; image?: string | null; jsonLd?: object | null } = {}) {
  const { site } = useSite()
  const { tr, lang } = useI18n()
  const { pathname } = useLocation()
  const { title, description, image, jsonLd } = opts
  const ld = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    if (!site) return
    const name = site.name
    const fullTitle = title ? `${title} | ${name}` : tr(site.seoTitle) || `${name} – ${tr(site.tagline) ?? ''}`.replace(/ – $/, '')
    const desc = (description || tr(site.seoDescription) || tr(site.heroSubtitle) || '').replace(/\s+/g, ' ').trim().slice(0, 160)
    const img = image || site.heroImageUrl || site.logoUrl || ''
    const url = window.location.origin + pathname

    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:site_name', name)
    setMeta('property', 'og:image', img)
    setMeta('property', 'og:locale', lang === 'zh' ? 'zh_CN' : lang === 'pt' ? 'pt_BR' : lang === 'en' ? 'en_US' : 'es_PE')
    setMeta('name', 'twitter:card', img ? 'summary_large_image' : 'summary')
    setLink('canonical', url)

    // Versiones en otros idiomas de esta misma página
    document.querySelectorAll('link[data-hreflang]').forEach((n) => n.remove())
    const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')
    for (const l of site.languages) addAlt(l === 'zh' ? 'zh-Hans' : l, `${window.location.origin}/${l}${rest}`)
    addAlt('x-default', `${window.location.origin}/${site.defaultLanguage}${rest}`)

    let s = document.getElementById('ld-json') as HTMLScriptElement | null
    if (ld) {
      if (!s) {
        s = document.createElement('script')
        s.id = 'ld-json'
        s.type = 'application/ld+json'
        document.head.appendChild(s)
      }
      s.textContent = ld
    } else s?.remove()
  }, [site, title, description, image, ld, pathname, lang, tr])
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!value) return el?.remove()
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]:not([data-hreflang])`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function addAlt(hreflang: string, href: string) {
  const el = document.createElement('link')
  el.rel = 'alternate'
  el.hreflang = hreflang
  el.href = href
  el.dataset.hreflang = '1'
  document.head.appendChild(el)
}

/** Google Analytics 4 (opcional, ID configurable en el panel) con vistas de página en la SPA */
export function useAnalytics(measurementId?: string | null) {
  const { pathname } = useLocation()
  useEffect(() => {
    if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId)) return
    const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void }
    if (!document.getElementById('ga4')) {
      const s = document.createElement('script')
      s.id = 'ga4'
      s.async = true
      s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
      document.head.appendChild(s)
      w.dataLayer = w.dataLayer || []
      w.gtag = function gtag() { w.dataLayer.push(arguments) } // eslint-disable-line prefer-rest-params
      w.gtag('js', new Date())
    }
    w.gtag('config', measurementId, { page_path: pathname })
  }, [measurementId, pathname])
}
