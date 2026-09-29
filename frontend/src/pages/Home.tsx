import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useFetch, useSite } from '../site'
import type { Faq, Tour } from '../types'
import TourCard from '../components/TourCard'
import Img from '../components/Img'
import InquiryForm from '../components/InquiryForm'
import { FEATURE_ICONS, IconSearch, IconStar, IconUsers } from '../components/Icons'
import { FaqList, L, Stars, waLink } from '../components/common'

function Hero() {
  const { t, tr, path } = useI18n()
  const { site, nav } = useSite()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [dest, setDest] = useState('')
  const search = (e: FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (dest) p.set('destino', dest)
    navigate(`${path('/tours')}?${p}`)
  }
  // Respeta "reducir movimiento" y el modo de ahorro de datos: en esos casos solo imagen
  const calm = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    || (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
  const video = !calm && site?.heroVideoUrl && /\.(mp4|webm)(\?|$)/i.test(site.heroVideoUrl) ? site.heroVideoUrl : null
  return (
    <section className="hero">
      {video ? (
        <video className="hero__bg" src={video} autoPlay muted loop playsInline poster={site?.heroImageUrl ?? undefined} />
      ) : (
        <Img src={site?.heroImageUrl} alt="" className="hero__bg" />
      )}
      <div className="hero__shade" />
      <div className="container hero__content">
        <p className="eyebrow">{tr(site?.tagline)}</p>
        <h1>{tr(site?.heroTitle)}</h1>
        <p className="hero__lead">{tr(site?.heroSubtitle)}</p>
        <form className="hero__search" onSubmit={search}>
          <IconSearch />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} aria-label={t('search')} />
          <select value={dest} onChange={(e) => setDest(e.target.value)} aria-label={t('destinations')}>
            <option value="">{t('anyDestination')}</option>
            {nav.destinations.map((d) => <option key={d.id} value={d.slug}>{tr(d.name)}</option>)}
          </select>
          <button className="btn btn--primary">{t('searchBtn')}</button>
        </form>
      </div>
    </section>
  )
}

/** Tours del destino prioritario (el primero del orden configurado en el panel) */
function PrimaryDestination() {
  const { t, tr } = useI18n()
  const { nav } = useSite()
  const main = nav.destinations[0]
  const { data } = useFetch<Tour[]>(main ? `/api/tours?destination=${main.slug}` : null)
  if (!main || !data?.length) return null
  // Primero los destacados del destino, luego el resto, hasta 6
  const tours = [...data.filter((x) => x.isFeatured), ...data.filter((x) => !x.isFeatured)].slice(0, 6)
  return (
    <section className="section container">
      <div className="section__head">
        <div>
          <h2>{t('bestOf')} {tr(main.name)}</h2>
          <p className="muted section__sub">{tr(main.summary)}</p>
        </div>
        <L to={`/destino/${main.slug}`} className="link-arrow">{t('toursIn')} {tr(main.name)} ({main.toursCount}) →</L>
      </div>
      <div className="tour-grid">{tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>
    </section>
  )
}

export default function Home() {
  const { t, tr, locale } = useI18n()
  const { site, nav } = useSite()
  const { data: all } = useFetch<Tour[]>('/api/tours')
  const mainSlug = nav.destinations[0]?.slug
  // Tras el destino principal, se ofrecen extensiones a los demás destinos (destacados primero)
  const rest = all?.filter((x) => x.destination?.slug !== mainSlug) ?? []
  const others = [...rest.filter((x) => x.isFeatured), ...rest.filter((x) => !x.isFeatured)].slice(0, 4)
  const { data: faqs } = useFetch<Faq[]>('/api/faqs')

  return (
    <>
      <Hero />

      {site && (
        <section className="trust">
          <div className="container trust__inner">
            <div><strong>{site.yearsExperience}+</strong><span>{t('years')}</span></div>
            <div><strong>{new Intl.NumberFormat(locale).format(site.travelersCount)}+</strong><span>{t('travelers')}</span></div>
            <div><strong>{site.ratingAverage.toFixed(1)} <IconStar /></strong><span>{t('avgRating')}</span></div>
            {site.tripadvisorUrl && <a href={site.tripadvisorUrl} target="_blank" rel="noreferrer" className="trust__link">{t('seeTripadvisor')} ↗</a>}
          </div>
        </section>
      )}

      <PrimaryDestination />

      <section className="section section--tint">
        <div className="container">
        <div className="section__head"><h2>{t('exploreDest')}</h2><L to="/tours" className="link-arrow">{t('allTours')} →</L></div>
        <div className="dest-grid">
          {nav.destinations.filter((d) => d.isFeatured).map((d) => (
            <L key={d.id} to={`/destino/${d.slug}`} className="dest-tile">
              <Img src={d.imageUrl} alt={tr(d.name) ?? ''} />
              <div className="dest-tile__text">
                <h3>{tr(d.name)}</h3>
                <p>{tr(d.summary)}</p>
                <span className="dest-tile__count">{d.toursCount} {t('tours').toLowerCase()} →</span>
              </div>
            </L>
          ))}
        </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {others.length > 0 && (<>
            <div className="section__head"><h2>{t('extendTrip')}</h2><L to="/tours" className="link-arrow">{t('allTours')} →</L></div>
            <div className="tour-grid">{others.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>
          </>)}
          {nav.categories.length > 0 && (
            <div className="chips chips--center">
              {nav.categories.map((c) => <L key={c.id} to={`/tours?tipo=${c.slug}`} className="chip">{tr(c.name)}</L>)}
            </div>
          )}
        </div>
      </section>

      {!!site?.steps.length && (
        <section className="section container steps">
          <div className="steps__intro">
            <h2>{t('customTrip')}</h2>
            <p className="muted">{t('customTripText')}</p>
            <div className="row">
              <L to="/contacto" className="btn btn--primary">{t('contact')}</L>
              {site.whatsapp && <a className="btn btn--wa" href={waLink(site.whatsapp, t('helloGeneral'))} target="_blank" rel="noreferrer">WhatsApp</a>}
            </div>
          </div>
          <ol className="steps__list">
            {site.steps.map((s, i) => (
              <li key={i}><span className="steps__num">{i + 1}</span><div><h3>{tr(s.title)}</h3><p>{tr(s.text)}</p></div></li>
            ))}
          </ol>
        </section>
      )}

      {!!site?.features.length && (
        <section className="section section--dark">
          <div className="container">
            <div className="section__head section__head--center">
              <h2>{t('whyUs')}</h2>
              <p>{tr(site.about)}</p>
            </div>
            <div className="features">
              {site.features.map((f, i) => {
                const Icon = FEATURE_ICONS[f.icon] ?? IconUsers
                return (
                  <div key={i} className="feature">
                    <Icon />
                    <h3>{tr(f.title)}</h3>
                    <p>{tr(f.text)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {!!site?.testimonials.length && (
        <section className="section container">
          <div className="section__head"><h2>{t('testimonials')}</h2></div>
          <div className="testimonials">
            {site.testimonials.map((r, i) => (
              <figure key={i} className="testimonial">
                <Stars value={r.rating ?? 5} />
                <blockquote>“{tr(r.text)}”</blockquote>
                <figcaption>{r.name} · {r.country}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="section section--tint" id="faq">
        <div className="container faq-contact">
          <div>
            <h2>{t('faq')}</h2>
            {faqs && <FaqList items={faqs.slice(0, 6)} />}
          </div>
          <div className="card">
            <h2>{t('askTitle')}</h2>
            <InquiryForm compact />
          </div>
        </div>
      </section>

      {!!site?.partners.length && (
        <section className="section container partners">
          <h2 className="partners__title">{t('partners')}</h2>
          <div className="partners__row">
            {site.partners.map((p, i) => {
              const img = p.imageUrl ? <img src={p.imageUrl} alt={p.name} loading="lazy" /> : <span>{p.name}</span>
              return p.url
                ? <a key={i} href={p.url} target="_blank" rel="noreferrer" title={p.name}>{img}</a>
                : <div key={i} title={p.name}>{img}</div>
            })}
          </div>
        </section>
      )}
    </>
  )
}
