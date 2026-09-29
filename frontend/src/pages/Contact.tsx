import { useI18n } from '../i18n'
import { useFetch, useSite } from '../site'
import type { Faq } from '../types'
import InquiryForm from '../components/InquiryForm'
import { FaqList, waLink } from '../components/common'

export default function Contact() {
  const { t, tr } = useI18n()
  const { site } = useSite()
  const { data: faqs } = useFetch<Faq[]>('/api/faqs')
  return (
    <>
      <section className="page-head"><div className="container"><h1>{t('contact')}</h1><p>{t('customTripText')}</p></div></section>
      <section className="section container contact">
        <div className="card"><h2>{t('askTitle')}</h2><InquiryForm /></div>
        <div className="contact__info">
          {site?.phone && <p><strong>{t('phone')}</strong><br />{site.phone}{site.phone2 && <><br />{site.phone2}</>}</p>}
          {site?.email && <p><strong>{t('email')}</strong><br /><a href={`mailto:${site.email}`}>{site.email}</a>{site.email2 && <><br /><a href={`mailto:${site.email2}`}>{site.email2}</a></>}</p>}
          {site?.address && <p><strong>{t('location')}</strong><br />{site.address}</p>}
          {site && tr(site.officeHours) && <p><strong>{t('officeHours')}</strong><br />{tr(site.officeHours)}</p>}
          {site?.whatsapp && <a className="btn btn--wa" href={waLink(site.whatsapp, t('helloGeneral'))} target="_blank" rel="noreferrer">{t('writeUs')}</a>}
          {site?.mapUrl && <iframe className="map" src={site.mapUrl} title="map" loading="lazy" />}
        </div>
      </section>
      {!!faqs?.length && (
        <section className="section section--tint" id="faq">
          <div className="container narrow-wrap"><h2>{t('faq')}</h2><FaqList items={faqs} /></div>
        </section>
      )}
    </>
  )
}
