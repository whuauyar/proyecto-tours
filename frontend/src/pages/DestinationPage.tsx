import { useParams } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useFetch } from '../site'
import type { Destination, Tour } from '../types'
import Img from '../components/Img'
import TourCard from '../components/TourCard'
import { IconCheck } from '../components/Icons'
import { L, Paragraphs } from '../components/common'
import NotFound from './NotFound'

export default function DestinationPage() {
  const { slug } = useParams()
  const { t, tr } = useI18n()
  const { data: dest, loading, error } = useFetch<Destination>(`/api/destinations/${slug}`)
  const { data: tours } = useFetch<Tour[]>(`/api/tours?destination=${slug}`)
  if (loading) return <div className="container section muted">{t('loading')}</div>
  if (error || !dest) return <NotFound />
  const highlights = tr(dest.highlights) ?? []
  return (
    <>
      <section className="dest-hero">
        <Img src={dest.imageUrl} alt={tr(dest.name) ?? ''} className="dest-hero__bg" />
        <div className="hero__shade" />
        <div className="container dest-hero__content">
          <nav className="crumbs crumbs--light"><L to="/">{t('home')}</L> / <span>{t('destinations')}</span></nav>
          <h1>{tr(dest.name)}</h1>
          <p>{tr(dest.summary)}</p>
        </div>
      </section>
      <section className="section container dest-intro">
        <div><Paragraphs text={tr(dest.description)} /></div>
        {highlights.length > 0 && (
          <ul className="list-check card">{highlights.map((h, i) => <li key={i}><IconCheck /> {h}</li>)}</ul>
        )}
      </section>
      <section className="section section--tint">
        <div className="container">
          <div className="section__head"><h2>{t('toursIn')} {tr(dest.name)}</h2></div>
          {tours?.length ? <div className="tour-grid">{tours.map((x) => <TourCard key={x.id} tour={x} />)}</div> : <p className="muted">{t('noTours')}</p>}
        </div>
      </section>
    </>
  )
}
