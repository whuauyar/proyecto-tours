import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { formatPrice, useI18n } from '../i18n'
import { useSite } from '../site'
import type { Tour } from '../types'
import Img from './Img'
import { IconSearch } from './Icons'

/**
 * Buscador de la portada con sugerencias mientras se escribe.
 * El servidor busca cada palabra (sin tildes) al inicio de palabra en título,
 * resumen, destino y tipo; aquí se muestran las 6 primeras coincidencias.
 */
export default function HeroSearch() {
  const { t, tr, path, locale } = useI18n()
  const { nav } = useSite()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [dest, setDest] = useState('')
  const [items, setItems] = useState<Tour[] | null>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const box = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const text = q.trim()
    if (text.length < 2) {
      setItems(null)
      return
    }
    let alive = true
    const timer = setTimeout(() => {
      const p = new URLSearchParams({ q: text, limit: '6' })
      if (dest) p.set('destination', dest)
      api<Tour[]>(`/api/tours?${p}`)
        .then((r) => alive && (setItems(r), setActive(-1)))
        .catch(() => alive && setItems([]))
    }, 220)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [q, dest])

  useEffect(() => {
    const close = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const goAll = () => {
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    if (dest) p.set('destino', dest)
    navigate(`${path('/tours')}?${p}`)
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (open && items && active >= 0 && items[active]) return navigate(path(`/tour/${items[active].slug}`))
    goAll()
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!items?.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, -1))
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }
  const show = open && q.trim().length >= 2 && items !== null

  return (
    <form className="hero__search" onSubmit={submit} ref={box} role="search">
      <IconSearch />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        placeholder={t('search')}
        aria-label={t('search')}
        aria-autocomplete="list"
        aria-expanded={show}
        aria-controls="hero-suggest"
        autoComplete="off"
      />
      <select value={dest} onChange={(e) => setDest(e.target.value)} aria-label={t('destinations')}>
        <option value="">{t('anyDestination')}</option>
        {nav.destinations.map((d) => <option key={d.id} value={d.slug}>{tr(d.name)}</option>)}
      </select>
      <button className="btn btn--primary">{t('searchBtn')}</button>

      {show && (
        <div className="suggest" id="hero-suggest" role="listbox">
          {items!.length === 0 ? (
            <p className="suggest__empty">{t('noSuggestions')}</p>
          ) : (
            <>
              {items!.map((tour, i) => {
                const price = tour.discountPercent ? tour.offerPrice! : tour.price
                return (
                  <button
                    type="button"
                    key={tour.id}
                    role="option"
                    aria-selected={i === active}
                    className={`suggest__item ${i === active ? 'is-active' : ''}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => navigate(path(`/tour/${tour.slug}`))}
                  >
                    <Img src={tour.coverUrl} alt="" />
                    <span>
                      <strong>{tr(tour.title)}</strong>
                      <small>{tr(tour.destination?.name)} · {t('from')} {formatPrice(price, tour.currency, locale)}</small>
                    </span>
                  </button>
                )
              })}
              <button type="button" className="suggest__all" onClick={goAll}>{t('seeAllResults')} →</button>
            </>
          )}
        </div>
      )}
    </form>
  )
}
