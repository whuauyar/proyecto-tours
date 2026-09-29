import { useState } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { useI18n } from '../i18n'
import type { Faq, Tour } from '../types'
import { IconChevron, IconStar } from './Icons'

/** Link que antepone el idioma actual a la ruta */
export function L({ to, ...rest }: LinkProps & { to: string }) {
  const { path } = useI18n()
  return <Link to={path(to)} {...rest} />
}

export function waLink(number: string | undefined, text = '') {
  return `https://wa.me/${(number || '').replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="stars" aria-label={`${value} / 5`} style={{ fontSize: size }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(value) ? 'on' : 'off'}><IconStar /></span>
      ))}
    </span>
  )
}

export function useDuration() {
  const { t } = useI18n()
  return (tour: Pick<Tour, 'durationDays' | 'durationNights' | 'durationHours'>) => {
    if (tour.durationDays === 1 && tour.durationHours) return `${tour.durationHours} ${t('hours')}`
    if (tour.durationDays === 1 && !tour.durationNights) return t('fullDay')
    const d = `${tour.durationDays} ${tour.durationDays === 1 ? t('day') : t('days')}`
    return tour.durationNights ? `${d} / ${tour.durationNights} ${tour.durationNights === 1 ? t('night') : t('nights')}` : d
  }
}

export function FaqList({ items }: { items: Faq[] }) {
  const { tr } = useI18n()
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="faq">
      {items.map((f, i) => (
        <div key={f.id ?? i} className={`faq__item ${open === i ? 'is-open' : ''}`}>
          <button className="faq__q" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            <span>{tr(f.question)}</span>
            <IconChevron />
          </button>
          {open === i && <div className="faq__a">{tr(f.answer)}</div>}
        </div>
      ))}
    </div>
  )
}

/** Párrafos a partir de texto con líneas en blanco */
export function Paragraphs({ text }: { text?: string }) {
  if (!text) return null
  return <>{text.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</>
}
