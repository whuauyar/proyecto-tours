import type { Tour } from '../types'
import { formatPrice, useI18n } from '../i18n'
import Img from './Img'
import { IconClock, IconPin } from './Icons'
import { L, Stars, useDuration } from './common'

export default function TourCard({ tour }: { tour: Tour }) {
  const { t, tr, locale } = useI18n()
  const duration = useDuration()
  const title = tr(tour.title) ?? ''
  const final = tour.discountPercent ? tour.offerPrice! : tour.price
  return (
    <article className="tour-card">
      <L to={`/tour/${tour.slug}`} className="tour-card__media">
        <Img src={tour.coverUrl} alt={title} />
        {tour.discountPercent && <span className="badge badge--offer">-{tour.discountPercent}%</span>}
        {tour.category && <span className="badge badge--cat">{tr(tour.category.name)}</span>}
      </L>
      <div className="tour-card__body">
        <div className="tour-card__meta">
          {tour.destination && <span><IconPin /> {tr(tour.destination.name)}</span>}
          <span><IconClock /> {duration(tour)}</span>
        </div>
        <h3><L to={`/tour/${tour.slug}`}>{title}</L></h3>
        {tour.rating ? (
          <div className="tour-card__rating">
            <Stars value={tour.rating} size={14} /> <strong>{tour.rating.toFixed(1)}</strong>
            {tour.reviewsCount > 0 && <span className="muted">({tour.reviewsCount} {t('reviews')})</span>}
          </div>
        ) : null}
        <p className="tour-card__summary">{tr(tour.summary)}</p>
        <div className="tour-card__foot">
          <div className="price">
            <small>{t('from')}</small>
            {tour.discountPercent && <s>{formatPrice(tour.price, tour.currency, locale)}</s>}
            <strong>{formatPrice(final, tour.currency, locale)}</strong>
          </div>
          <L to={`/tour/${tour.slug}`} className="btn btn--ghost">{t('seeMore')}</L>
        </div>
      </div>
    </article>
  )
}
