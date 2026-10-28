import { useI18n } from '../../i18n'
import { useSite } from '../../site'
import { FEATURE_ICONS, IconUsers } from '../Icons'

/**
 * "¿Cómo saber si somos una agencia confiable?" + franja "¿Por qué viajar con nosotros?"
 * con íconos circulares. Todo se configura en Panel → Configuración → ¿Por qué elegirnos?
 */
export default function WhyUs() {
  const { t, tr } = useI18n()
  const { site } = useSite()
  if (!site?.features.length) return null
  return (
    <section id="por-que-elegirnos" className="why">
      {tr(site.trustTitle) && (
        <div className="container why__trust">
          <h2>{tr(site.trustTitle)}</h2>
          {(tr(site.trustText) ?? '').split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}
      <div className="why__band">
        <div className="container">
          <h2>{tr(site.whyTitle) || t('whyUs')}</h2>
          {tr(site.about) && <p className="why__lead">{tr(site.about)}</p>}
          <div className="why__grid">
            {site.features.map((f, i) => {
              const Icon = FEATURE_ICONS[f.icon] ?? IconUsers
              return (
                <div key={i} className="why__item">
                  <span className="why__icon">{f.imageUrl ? <img src={f.imageUrl} alt="" /> : <Icon />}</span>
                  <h3>{tr(f.title)}</h3>
                  <p>{tr(f.text)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
