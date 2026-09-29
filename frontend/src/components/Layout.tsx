import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LANG_META, useI18n } from '../i18n'
import { useSite } from '../site'
import type { Lang } from '../types'
import Img from './Img'
import { IconChevron, IconGlobe, IconMail, IconMenu, IconPhone, IconWhatsApp, IconX } from './Icons'
import { L, waLink } from './common'

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

function Dropdown({ label, children, to, toLabel }: { label: string; children: React.ReactNode; to?: string; toLabel?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClose(() => setOpen(false))
  const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])
  return (
    <div className={`dd ${open ? 'is-open' : ''}`} ref={ref} onMouseLeave={() => setOpen(false)}>
      <button className="dd__btn" onClick={() => setOpen(!open)} onMouseEnter={() => setOpen(true)} aria-expanded={open}>
        {label} <IconChevron />
      </button>
      <div className="dd__panel">
        {children}
        {to && <L to={to} className="dd__all">{toLabel ?? label} →</L>}
      </div>
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
      </div>
    </div>
  )
}

function Header() {
  const { t, tr } = useI18n()
  const { site, nav } = useSite()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <L to="/" className="brand">
          {site?.logoUrl ? <img src={site.logoUrl} alt={site.name} /> : <span className="brand__mark">▲</span>}
          <span>{site?.name ?? ''}</span>
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
            <Dropdown label={t('usefulInfo')}>
              <ul className="dd__list">
                {nav.pages.map((p) => <li key={p.id}><L to={`/info/${p.slug}`}>{tr(p.title)}</L></li>)}
                <li><L to="/contacto#faq">{t('faq')}</L></li>
              </ul>
            </Dropdown>
          )}
          <NavLink to={`/${loc.pathname.split('/')[1]}/contacto`}>{t('contact')}</NavLink>
        </nav>

        <div className="site-header__actions">
          <LangSwitcher />
          {site?.whatsapp && (
            <a className="btn btn--wa btn--sm header-wa" href={waLink(site.whatsapp)} target="_blank" rel="noreferrer">
              <IconWhatsApp /> <span>WhatsApp</span>
            </a>
          )}
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
  const socials = (['facebook', 'instagram', 'youtube', 'tiktok'] as const).filter((k) => site?.[k])
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <div className="brand brand--light"><span className="brand__mark">▲</span><span>{site?.name}</span></div>
          <p>{tr(site?.tagline)}</p>
          {socials.length > 0 && (
            <div className="socials">
              {socials.map((k) => <a key={k} href={site![k]} target="_blank" rel="noreferrer">{k}</a>)}
            </div>
          )}
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
            {nav.pages.map((p) => <li key={p.id}><L to={`/info/${p.slug}`}>{tr(p.title)}</L></li>)}
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
        <a className="wa-float" href={waLink(site.whatsapp, t('helloGeneral'))} target="_blank" rel="noreferrer" aria-label={t('writeUs')}>
          <IconWhatsApp />
        </a>
      )}
    </>
  )
}
