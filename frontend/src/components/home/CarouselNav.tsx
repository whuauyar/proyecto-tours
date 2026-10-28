import { useI18n } from '../../i18n'
import { IconChevronLeft, IconChevronRight } from '../Icons'

/** Flechas y puntos de un carrusel paginado */
export function CarouselArrows({ onPrev, onNext, hidden }: { onPrev: () => void; onNext: () => void; hidden?: boolean }) {
  const { t } = useI18n()
  if (hidden) return null
  return (
    <>
      <button type="button" className="carousel__arrow carousel__arrow--prev" onClick={onPrev} aria-label={t('prev')}><IconChevronLeft /></button>
      <button type="button" className="carousel__arrow carousel__arrow--next" onClick={onNext} aria-label={t('next')}><IconChevronRight /></button>
    </>
  )
}

export function CarouselDots({ pages, page, onChange }: { pages: number; page: number; onChange: (p: number) => void }) {
  if (pages < 2) return null
  return (
    <div className="carousel__dots">
      {Array.from({ length: pages }).map((_, i) => (
        <button key={i} type="button" className={i === page ? 'is-active' : ''} onClick={() => onChange(i)} aria-label={`${i + 1} / ${pages}`} aria-current={i === page} />
      ))}
    </div>
  )
}
