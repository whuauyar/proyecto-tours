import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LANG_META, useI18n } from '../i18n'
import { useSite } from '../site'
import type { Lang } from '../types'
import Img from './Img'
import { INFO_ICONS, IconChevron, IconGlobe, IconInfo, IconMail, IconMenu, IconPhone, IconWhatsApp, IconX, SOCIAL_ICONS } from './Icons'
import { L, waLink } from './common'
import ChatBot from './ChatBot'
import { useAnalytics } from '../seo'

function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onClose()
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])
  return ref
}

function LangSwitcher() {
  const { lang, t } = useI18n()
  const { site } = useSite()
  const [open, setOpen] = useState(false)
  const ref = useOutsideClose(() => setOpen(false))
  const loc = useLocation()
  const nav = useNavigate()
  const langs = site?.languages ?? (['es'] as Lang[])
  if (langs.length < 2) return null
  const change = (l: Lang) => {
    setOpen(false)
    nav(loc.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, `/${l}`) + loc.search)
  }
  return (
    <div className="lang" ref={ref}>
      <button className="lang__btn" onClick={() => setOpen(!open)} aria-label={t('language')} aria-expanded={open}>
        <IconGlobe /> {LANG_META[lang].short} <IconChevron />
      </button>
      {open && (
        <ul className="lang__menu" role="menu">
          {langs.map((l) => (
            <li key={l}>
              <button role="menuitem" className={l === lang ? 'active' : ''} onClick={() => change(l)} lang={LANG_META[l].locale}>
                <span>{LANG_META[l].flag}</span> {LANG_META[l].label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Dropdown({ label, children, to, toLabel, wide = false }: { label: string; children: React.ReactNode; to?: string; toLabel?: string; wide?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClose(() => setOpen(false))
  const loc = useLocation()
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => setOpen(false), [loc.pathname])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  // Con mouse: se abre al pasar y el clic no lo cierra (antes el clic cerraba lo que el hover abría).
  // En pantallas táctiles: el toque abre/cierra.
  const canHover = () => window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
  const show = () => { window.clearTimeout(timer.current); setOpen(true) }
  const hideSoon = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(false), 250) }
  return (
    <div
      className={`dd ${wide ? 'dd--wide' : ''} ${open ? 'is-open' : ''}`}
      ref={ref}
      onMouseEnter={() => canHover() && show()}
      onMouseLeave={() => canHover() && hideSoon()}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      <button className="dd__btn" onClick={() => (canHover() ? show() : setOpen(!open))} aria-expanded={open}>
        {label} <IconChevron />
      </button>
      <div className="dd__panel">
        {children}
        {to && <L to={to} className="dd__all">{toLabel ?? label} →</L>}
      </div>
    </div>
  )
}

/** Íconos de redes: las 4 principales + las adicionales con imagen propia (Configuración → Redes sociales) */
export function SocialLinks({ className = 'social-icons', withWhatsapp = false }: { className?: string; withWhatsapp?: boolean }) {
  const { site } = useSite()
  const { t } = useI18n()
  if (!site) return null
  const main = (['facebook', 'instagram', 'youtube', 'tiktok'] as const).filter((k) => site[k])
  const extras = (site.extraSocials ?? []).filter((x) => x.url)
  if (!main.length && !extras.length && !(withWhatsapp && site.whatsapp)) return null
  return (
    <div className={className} aria-label={t('followUs')}>
      {main.map((k) => {
        const Icon = SOCIAL_ICONS[k]
        return <a key={k} href={site[k]} target="_blank" rel="noreferrer" title={k} aria-label={k} className={`social social--${k}`}><Icon /></a>
      })}
      {extras.map((x, i) => (
        <a key={i} href={x.url} target="_blank" rel="noreferrer" title={x.name} aria-label={x.name} className="social social--img">
          {x.imageUrl ? <img src={x.imageUrl} alt="" /> : <span>{x.name.slice(0, 2)}</span>}
        </a>
      ))}
      {withWhatsapp && site.whatsapp && (
        <a href={waLink(site.whatsapp, t('helloGeneral'))} target="_blank" rel="noreferrer" title="WhatsApp" aria-label="WhatsApp" className="social social--whatsapp"><IconWhatsApp /></a>
      )}
    </div>
  )
}

function TopBar() {
  const { site } = useSite()
  const { tr } = useI18n()
  if (!site) return null
  return (
    <div className="topbar">
      <div className="container topbar__inner">
        {site.phone && <a href={`tel:${site.phone.replace(/\s/g, '')}`}><IconPhone /> {site.phone}</a>}
        {site.email && <a href={`mailto:${site.email}`}><IconMail /> {site.email}</a>}
        <span className="topbar__hours">{tr(site.officeHours)}</span>
        <SocialLinks className="social-icons social-icons--top" />
      </div>
    </div>
  )
}

/** Mega-menú "Info útil": grupos con ícono + columna "Lo más destacado" con imágenes */
function InfoMenu() {
  const { t, tr } = useI18n()
  const { site, nav } = useSite()
  const groups = site?.infoGroups ?? []
  const known = new Set(groups.map((g) => g.key))
  const byGroup = (key: string) => nav.pages.filter((p) => p.menuGroup === key)
  const loose = nav.pages.filter((p) => !p.menuGroup || !known.has(p.menuGroup))
  const highlights = nav.pages.filter((p) => p.isHighlighted).slice(0, 4)

  const list = (pages: typeof nav.pages) => {
    let lastSub = ''
    return (
      <ul className="info-mega__list">
        {pages.map((p) => {
          const sub = tr(p.menuSubgroup) ?? ''
          const showSub = sub && sub !== lastSub
          lastSub = sub || lastSub
          return (
            <li key={p.id}>
              {showSub && <span className="info-mega__sub">{sub}</span>}
              <L to={`/info/${p.slug}`}>{tr(p.title)}</L>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="container info-mega">
      <div className="info-mega__groups">
        {groups.map((g) => {
          const pages = byGroup(g.key)
          if (!pages.length) return null
          const Icon = INFO_ICONS[g.icon] ?? IconInfo
          return (
            <section key={g.key} className="info-mega__group">
              <h4><Icon /> {tr(g.title)}</h4>
              {list(pages)}
            </section>
          )
        })}
        <section className="info-mega__group">
          <h4><IconInfo /> {t('usefulInfo')}</h4>
          {list(loose)}
          <ul className="info-mega__list"><li><L to="/contacto#faq">{t('faq')}</L></li></ul>
        </section>
      </div>
      {highlights.length > 0 && (
        <aside className="info-mega__highlights">
          <h4>{t('highlightedInfo')}</h4>
          {highlights.map((p) => (
            <L key={p.id} to={`/info/${p.slug}`} className="info-mega__card">
              <Img src={p.imageUrl} alt="" />
              <span>{tr(p.title)}</span>
            </L>
          ))}
        </aside>
      )}
    </div>
  )
}

function Header() {
  const { t, tr } = useI18n()
  const { site, nav } = useSite()
  const [open, setOpen] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)
  const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])
  useEffect(() => setLogoFailed(false), [site?.logoUrl])
  // Logo (si existe y carga) + nombre del negocio. El logo lleva alt vacío para que,
  // si falla, el navegador no repita el nombre como texto alternativo.
  const showLogo = !!site?.logoUrl && !logoFailed
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <L to="/" className="brand">
          {showLogo
            ? <img src={site!.logoUrl!} alt="" onError={() => setLogoFailed(true)} />
            : <span className="brand__mark" aria-hidden="true">▲</span>}
          <span className="brand__name">{site?.name ?? ''}</span>
        </L>

        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Principal">
          {/* Destino principal (el primero en Admin → Destinos) con acceso directo */}
          {nav.destinations[0] && (
            <NavLink to={`/${loc.pathname.split('/')[1]}/destino/${nav.destinations[0].slug}`} className="nav-primary">
              {tr(nav.destinations[0].name)}
            </NavLink>
          )}
          <Dropdown label={t('destinations')} to="/tours" toLabel={t('allTours')}>
            <div className="mega">
              {nav.destinations.map((d) => (
                <L key={d.id} to={`/destino/${d.slug}`} className="mega__item">
                  <Img src={d.imageUrl} alt="" />
                  <span><strong>{tr(d.name)}</strong><small>{d.toursCount} {t('tours').toLowerCase()}</small></span>
                </L>
              ))}
            </div>
          </Dropdown>
          <Dropdown label={t('experiences')} to="/tours" toLabel={t('allTours')}>
            <ul className="dd__list">
              {nav.categories.map((c) => (
                <li key={c.id}><L to={`/tours?tipo=${c.slug}`}>{tr(c.name)} <small>({c.toursCount})</small></L></li>
              ))}
            </ul>
          </Dropdown>
          {nav.pages.length > 0 && (
            <Dropdown label={t('usefulInfo')} wide>
              <InfoMenu />
            </Dropdown>
          )}
          <NavLink to={`/${loc.pathname.split('/')[1]}/contacto`}>{t('contact')}</NavLink>
        </nav>

        <div className="site-header__actions">
          <LangSwitcher />
          <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  const { t, tr } = useI18n()
  const { site, nav } = useSite()
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <div className="brand brand--light"><span className="brand__mark">▲</span><span>{site?.name}</span></div>
          <p>{tr(site?.tagline)}</p>
          <SocialLinks className="social-icons social-icons--footer" withWhatsapp />
          {(site?.legalName || site?.ruc) && (
            <p className="legal">{site?.legalName}{site?.ruc && ` · RUC ${site.ruc}`}</p>
          )}
        </div>
        <div>
          <h4>{t('destinations')}</h4>
          <ul>{nav.destinations.map((d) => <li key={d.id}><L to={`/destino/${d.slug}`}>{tr(d.name)}</L></li>)}</ul>
        </div>
        <div>
          <h4>{t('usefulInfo')}</h4>
          <ul>
            {nav.pages.filter((p) => p.isHighlighted || !p.menuGroup).slice(0, 8).map((p) => <li key={p.id}><L to={`/info/${p.slug}`}>{tr(p.title)}</L></li>)}
            <li><L to="/contacto#faq">{t('faq')}</L></li>
          </ul>
        </div>
        <div>
          <h4>{t('contact')}</h4>
          <ul>
            {site?.phone && <li>{site.phone}</li>}
            {site?.phone2 && <li>{site.phone2}</li>}
            {site?.email && <li><a href={`mailto:${site.email}`}>{site.email}</a></li>}
            {site?.address && <li>{site.address}</li>}
            {site && tr(site.officeHours) && <li>{tr(site.officeHours)}</li>}
          </ul>
        </div>
      </div>
      <div className="container site-footer__bottom">© {new Date().getFullYear()} {site?.name}. {t('rights')}.</div>
    </footer>
  )
}

export default function Layout() {
  const { site } = useSite()
  useAnalytics(site?.gaMeasurementId)
  const { t } = useI18n()
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return (
    <>
      <TopBar />
      <Header />
      <main><Outlet /></main>
      <Footer />
      {site?.whatsapp && (
        <a className={`wa-float ${site.chatbotEnabled ? 'wa-float--stacked' : ''}`} href={waLink(site.whatsapp, t('helloGeneral'))} target="_blank" rel="noreferrer" aria-label={t('writeUs')}>
          <span className="wa-float__label">{t('writeUs')}</span>
          <span className="wa-float__icon"><IconWhatsApp /></span>
        </a>
      )}
      {site?.chatbotEnabled && <ChatBot />}
    </>
  )
}
