import { useEffect, useRef, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api'
import { useI18n } from '../../i18n'
import { useFetch, useSite } from '../../site'
import type { Review } from '../../types'
import Modal from '../Modal'
import { IconCheck, IconStar } from '../Icons'
import { Stars } from '../common'
import { CarouselArrows, CarouselDots } from './CarouselNav'
import { usePager, usePerPage } from './usePager'

/* ---------- Google Identity Services ("Continuar con Google") ---------- */
type GoogleId = {
  accounts: {
    id: {
      initialize: (cfg: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string; locale?: string }) => void
      renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void
      disableAutoSelect: () => void
    }
  }
}
declare global {
  interface Window { google?: GoogleId }
}

let gsiPromise: Promise<void> | null = null
function loadGsi() {
  if (window.google?.accounts?.id) return Promise.resolve()
  gsiPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => { gsiPromise = null; reject(new Error('gsi')) }
    document.head.appendChild(s)
  })
  return gsiPromise
}

/** Lee nombre y foto del token (solo para mostrarlos; el servidor lo valida de verdad) */
function decodeProfile(credential: string): { name: string; picture?: string } | null {
  try {
    const part = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(atob(part).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
    const data = JSON.parse(json)
    return { name: data.name ?? data.email, picture: data.picture }
  } catch {
    return null
  }
}

/* ---------- Fecha: "hace 2 meses" + fecha y hora exactas ---------- */
function useDates() {
  const { locale } = useI18n()
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const full = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' })
  return (iso: string) => {
    const d = new Date(iso)
    const secs = (d.getTime() - Date.now()) / 1000
    const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]
    const [unit, size] = units.find(([, s]) => Math.abs(secs) >= s) ?? ['minute', 60]
    return { relative: rtf.format(Math.round(secs / size), unit), exact: full.format(d) }
  }
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) return <img className="review__avatar" src={src} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
  return <span className="review__avatar review__avatar--letter" aria-hidden="true">{name.trim()[0]?.toUpperCase()}</span>
}

function ReviewCard({ r }: { r: Review }) {
  const { t } = useI18n()
  const fmt = useDates()
  const [open, setOpen] = useState(false)
  const long = r.text.length > 180
  const when = fmt(r.createdAt)
  return (
    <article className="review">
      <header className="review__head">
        <Avatar name={r.name} src={r.pictureUrl} />
        <div>
          <strong>{r.name}{r.country && <span className="review__country"> · {r.country}</span>}</strong>
          <small title={when.exact}><time dateTime={r.createdAt}>{when.relative} · {when.exact}</time></small>
        </div>
      </header>
      <div className="review__stars">
        <Stars value={r.rating} />
        {r.source === 'google' && <span className="review__verified" title={t('verifiedGoogle')}><IconCheck /></span>}
      </div>
      <p className={`review__text ${open ? 'is-open' : ''}`}>{r.text}</p>
      {long && <button type="button" className="review__more" onClick={() => setOpen(!open)}>{open ? t('readLess') : t('readMore')}</button>}
    </article>
  )
}

/** Formulario del testimonio: nombre, país, estrellas y texto. Google es opcional (aporta nombre y foto). */
function ReviewForm({ clientId, onDone, onClose }: { clientId?: string | null; onDone: (r: Review) => void; onClose: () => void }) {
  const { t, lang } = useI18n()
  const btn = useRef<HTMLDivElement>(null)
  const [credential, setCredential] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const profile = credential ? decodeProfile(credential) : null

  useEffect(() => {
    if (!clientId || credential) return
    let alive = true
    loadGsi()
      .then(() => {
        if (!alive || !btn.current || !window.google) return
        window.google.accounts.id.initialize({ client_id: clientId, callback: (r) => setCredential(r.credential), locale: lang })
        window.google.accounts.id.renderButton(btn.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: lang })
      })
      .catch(() => {}) // si Google no carga, queda el formulario simple
    return () => { alive = false }
  }, [clientId, credential, lang])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const json = credential
        ? { credential, country, rating, text, locale: lang, website }
        : { name, country, rating, text, locale: lang, website }
      onDone(await api<Review>('/api/reviews', { method: 'POST', json }))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('formError'))
      if (err instanceof ApiError && err.status === 401) setCredential(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={t('writeReview')} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        {credential ? (
          <div className="review-form__who">
            <Avatar name={profile?.name ?? '?'} src={profile?.picture ?? null} />
            <span>{t('signedAs')} <strong>{profile?.name}</strong></span>
            <button type="button" className="link-btn" onClick={() => { window.google?.accounts.id.disableAutoSelect(); setCredential(null) }}>{t('signOut')}</button>
          </div>
        ) : (
          <>
            {clientId && (
              <div className="review-form__google">
                <small className="muted">{t('reviewIntro')}</small>
                <div ref={btn} />
                <span className="review-form__or">{t('orFillIn')}</span>
              </div>
            )}
            <label>{t('yourName')}<input value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={80} required autoComplete="name" /></label>
          </>
        )}
        <label>{t('yourCountry')}<input value={country} onChange={(e) => setCountry(e.target.value)} maxLength={60} autoComplete="country-name" /></label>
        <input className="hp" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} aria-hidden="true" />
        <fieldset className="star-pick" onMouseLeave={() => setHover(0)}>
          <legend>{t('yourRating')}</legend>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={(hover || rating) >= n ? 'on' : ''}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              aria-label={`${n} / 5`}
              aria-pressed={rating === n}
            >
              <IconStar />
            </button>
          ))}
        </fieldset>
        <textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={t('reviewPlaceholder')} minLength={10} maxLength={1500} required />
        {error && <p className="alert alert--error">{error}</p>}
        <button className="btn btn--primary" disabled={busy || text.trim().length < 10 || (!credential && name.trim().length < 2)}>{busy ? t('publishing') : t('publish')}</button>
      </form>
    </Modal>
  )
}

/** Testimonios de viajeros en carrusel (3 por página) + botón para que el visitante deje el suyo */
export default function Reviews() {
  const { t } = useI18n()
  const { site } = useSite()
  const { data, setData } = useFetch<{ items: Review[]; total: number; average: number | null }>('/api/reviews')
  const perPage = usePerPage([[1024, 3], [680, 2]], 1)
  const items = data?.items ?? []
  const pager = usePager(items.length, perPage)
  const [writing, setWriting] = useState(false)
  const [thanks, setThanks] = useState(false)
  const clientId = site?.googleClientId
  if (!data) return null

  const done = (r: Review) => {
    setData((d) => d && { ...d, items: [r, ...d.items], total: d.total + 1 })
    pager.setPage(0)
    setWriting(false)
    setThanks(true)
  }

  return (
    <section className="section container reviews" id="opiniones">
      <div className="section__head">
        <div>
          <h2>{t('testimonials')}</h2>
          {data.average !== null && (
            <p className="reviews__summary"><strong>{data.average.toFixed(1)}</strong> <Stars value={data.average} /> <span className="muted">{data.total} {t('reviewsCount')}</span></p>
          )}
        </div>
        <button type="button" className="btn btn--primary" onClick={() => { setThanks(false); setWriting(true) }}>{t('writeReview')}</button>
      </div>
      {thanks && <p className="alert alert--ok">{t('reviewThanks')}</p>}
      {items.length ? (
        <>
          <div className="carousel">
            <div className="carousel__track" style={{ gridTemplateColumns: `repeat(${perPage}, 1fr)` }}>
              {pager.slice(items).map((r) => <ReviewCard key={r.id} r={r} />)}
            </div>
            <CarouselArrows onPrev={pager.prev} onNext={pager.next} hidden={pager.pages < 2} />
          </div>
          <CarouselDots pages={pager.pages} page={pager.page} onChange={pager.setPage} />
        </>
      ) : (
        <p className="muted">{t('noReviews')}</p>
      )}
      {writing && <ReviewForm clientId={clientId} onDone={done} onClose={() => setWriting(false)} />}
    </section>
  )
}
