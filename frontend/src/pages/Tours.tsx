import { useSearchParams } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useFetch, useSite } from '../site'
import type { Tour } from '../types'
import TourCard from '../components/TourCard'

export default function Tours() {
  const [params, setParams] = useSearchParams()
  const { t, tr } = useI18n()
  const { nav } = useSite()
  const dest = params.get('destino') || ''
  const tipo = params.get('tipo') || ''
  const q = params.get('q') || ''
  const duration = params.get('duracion') || ''
  const sort = params.get('orden') || ''

  const qs = new URLSearchParams()
  if (dest) qs.set('destination', dest)
  if (tipo) qs.set('category', tipo)
  if (q) qs.set('q', q)
  if (duration) qs.set('duration', duration)
  if (sort) qs.set('sort', sort)
  const { data: tours, loading } = useFetch<Tour[]>(`/api/tours?${qs}`)

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p, { replace: true })
  }
  const destName = tr(nav.destinations.find((d) => d.slug === dest)?.name)
  const typeName = tr(nav.categories.find((c) => c.slug === tipo)?.name)

  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>{destName ?? typeName ?? t('allTours')}</h1>
          {q && <p>“{q}”</p>}
        </div>
      </section>
      <section className="section container">
        <div className="filters-bar">
          <input value={q} onChange={(e) => set('q', e.target.value)} placeholder={t('search')} aria-label={t('search')} />
          <select value={dest} onChange={(e) => set('destino', e.target.value)} aria-label={t('destinations')}>
            <option value="">{t('anyDestination')}</option>
            {nav.destinations.map((d) => <option key={d.id} value={d.slug}>{tr(d.name)}</option>)}
          </select>
          <select value={tipo} onChange={(e) => set('tipo', e.target.value)} aria-label={t('experiences')}>
            <option value="">{t('anyType')}</option>
            {nav.categories.map((c) => <option key={c.id} value={c.slug}>{tr(c.name)}</option>)}
          </select>
          <select value={duration} onChange={(e) => set('duracion', e.target.value)} aria-label={t('duration')}>
            <option value="">{t('anyDuration')}</option>
            <option value="day">{t('oneDay')}</option>
            <option value="multi">{t('multiDay')}</option>
          </select>
          <select value={sort} onChange={(e) => set('orden', e.target.value)} aria-label={t('sortBy')}>
            <option value="">{t('sortDefault')}</option>
            <option value="price_asc">{t('sortPriceAsc')}</option>
            <option value="price_desc">{t('sortPriceDesc')}</option>
            <option value="duration">{t('sortDuration')}</option>
          </select>
        </div>
        {loading ? <p className="muted">{t('loading')}</p> : tours?.length ? (
          <>
            <p className="muted small">{tours.length} {t('results')}</p>
            <div className="tour-grid">{tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>
          </>
        ) : <p className="muted">{t('noTours')}</p>}
      </section>
    </>
  )
}
