import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { formatPrice, useI18n } from '../i18n'
import { useFetch, useSite } from '../site'
import type { Tour } from '../types'
import Img from '../components/Img'
import InquiryForm from '../components/InquiryForm'
import TourCard from '../components/TourCard'
import { IconCheck, IconClock, IconMountain, IconPin, IconUsers, IconX } from '../components/Icons'
import { FaqList, L, Paragraphs, Stars, useDuration, waLink } from '../components/common'
import NotFound from './NotFound'

export default function TourDetail() {
  const { slug } = useParams()
  const { t, tr, locale } = useI18n()
  const { site } = useSite()
  const duration = useDuration()
  const { data: tour, loading, error } = useFetch<Tour>(`/api/tours/${slug}`)
  const [active, setActive] = useState(0)

  if (loading) return <div className="container section muted">{t('loading')}</div>
  if (error || !tour) return <NotFound />

  const title = tr(tour.title) ?? ''
  const photos = [
    { url: tour.coverUrl, alt: title },
    ...(tour.images ?? []).map((i) => ({ url: i.url, alt: tr(i.alt) || title })),
  ].filter((p) => p.url)
  const final = tour.discountPercent ? tour.offerPrice! : tour.price
  const list = (v: Tour['includes']) => tr(v) ?? []
  const itinerary = tr(tour.itinerary) ?? []

  return (
    <article className="tour-detail">
      <div className="container">
        <nav className="crumbs">
          <L to="/">{t('home')}</L> /
          {tour.destination ? <L to={`/destino/${tour.destination.slug}`}>{tr(tour.destination.name)}</L> : <L to="/tours">{t('tours')}</L>}
          / <span>{title}</span>
        </nav>
        <h1>{title}</h1>
        <div className="tour-detail__sub">
          {tour.rating ? <span className="rating"><Stars value={tour.rating} /> <strong>{tour.rating.toFixed(1)}</strong> {tour.reviewsCount > 0 && <span className="muted">({tour.reviewsCount} {t('reviews')})</span>}</span> : null}
          <ul className="facts">
            <li><IconClock /> {duration(tour)}</li>
            <li><IconMountain /> {t(tour.difficulty)}</li>
            <li><IconUsers /> {t(tour.groupType)}</li>
            {tour.location && <li><IconPin /> {tour.location}</li>}
          </ul>
        </div>
      </div>

      <div className="container tour-detail__grid">
        <div className="tour-detail__main">
          <div className="gallery">
            <Img src={photos[active]?.url} alt={photos[active]?.alt ?? title} className="gallery__main" />
            {tour.discountPercent && <span className="badge badge--offer gallery__badge">-{tour.discountPercent}% {t('off')}</span>}
            {photos.length > 1 && (
              <div className="gallery__thumbs">
                {photos.map((p, i) => (
                  <button key={i} className={i === active ? 'active' : ''} onClick={() => setActive(i)} aria-label={`${i + 1}`}>
                    <Img src={p.url} alt={p.alt} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {list(tour.highlights).length > 0 && (
            <section className="block block--accent">
              <h2>{t('highlights')}</h2>
              <ul className="list-check">{list(tour.highlights).map((x, i) => <li key={i}><IconCheck /> {x}</li>)}</ul>
            </section>
          )}

          <section className="block">
            <h2>{t('overview')}</h2>
            <Paragraphs text={tr(tour.description)} />
          </section>

          {itinerary.length > 0 && (
            <section className="block">
              <h2>{t('itinerary')}</h2>
              <ol className="timeline">
                {itinerary.map((d, i) => (
                  <li key={i}>
                    {itinerary.length > 1 && <span className="timeline__day">{t('day')} {i + 1}</span>}
                    <h3>{d.title}</h3>
                    {d.description && <p>{d.description}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="block incl">
            {list(tour.includes).length > 0 && (
              <div><h2>{t('includes')}</h2><ul className="list-check">{list(tour.includes).map((x, i) => <li key={i}><IconCheck /> {x}</li>)}</ul></div>
            )}
            {list(tour.excludes).length > 0 && (
              <div><h2>{t('excludes')}</h2><ul className="list-x">{list(tour.excludes).map((x, i) => <li key={i}><IconX /> {x}</li>)}</ul></div>
            )}
          </section>

          {list(tour.recommendations).length > 0 && (
            <section className="block">
              <h2>{t('recommendations')}</h2>
              <ul className="list-dot">{list(tour.recommendations).map((x, i) => <li key={i}>{x}</li>)}</ul>
            </section>
          )}

          {!!tour.faqs?.length && (
            <section className="block"><h2>{t('faq')}</h2><FaqList items={tour.faqs} /></section>
          )}
        </div>

        <aside className="booking" id="reservar">
          <div className="booking__price">
            <small>{t('from')}</small>
            {tour.discountPercent && <s>{formatPrice(tour.price, tour.currency, locale)}</s>}
            <strong>{formatPrice(final, tour.currency, locale)}</strong>
            <small>{t('perPerson')}</small>
            {tour.childPrice !== null && <small className="booking__child">{t('child')}: {formatPrice(tour.childPrice, tour.currency, locale)}</small>}
          </div>
          <h3>{t('bookNow')}</h3>
          <InquiryForm tour={tour} compact />
          {site?.whatsapp && (
            <a className="btn btn--wa btn--block" target="_blank" rel="noreferrer" href={waLink(site.whatsapp, `${t('hello')}: ${title}`)}>
              {t('writeUs')}
            </a>
          )}
        </aside>
      </div>

      {!!tour.related?.length && (
        <section className="section container">
          <div className="section__head"><h2>{t('related')}</h2></div>
          <div className="tour-grid">{tour.related.map((x) => <TourCard key={x.id} tour={x} />)}</div>
        </section>
      )}

      <div className="mobile-book">
        <div className="price"><small>{t('from')}</small><strong>{formatPrice(final, tour.currency, locale)}</strong></div>
        <a href="#reservar" className="btn btn--primary">{t('bookNow')}</a>
      </div>
    </article>
  )
}
