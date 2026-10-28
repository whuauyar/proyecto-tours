import { useI18n } from '../i18n'
import { useFetch, useSite } from '../site'
import type { Faq, Tour } from '../types'
import TourCard from '../components/TourCard'
import Img from '../components/Img'
import InquiryForm from '../components/InquiryForm'
import { IconStar } from '../components/Icons'
import { FaqList, L, waLink } from '../components/common'
import HeroSearch from '../components/HeroSearch'
import HappyTravelers from '../components/home/HappyTravelers'
import WhyUs from '../components/home/WhyUs'
import ShortVideos from '../components/home/ShortVideos'
import Reviews from '../components/home/Reviews'
import Certifications from '../components/home/Certifications'

function Hero() {
  const { tr } = useI18n()
  const { site } = useSite()
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
        <HeroSearch />
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

      <HappyTravelers />

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

      <WhyUs />

      <ShortVideos />

      <Reviews />

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

      <Certifications />
    </>
  )
}
