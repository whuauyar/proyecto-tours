import { useState } from 'react'
import { useI18n } from '../../i18n'
import { useSite } from '../../site'
import type { Partner } from '../../types'
import Modal from '../Modal'
import { IconFile } from '../Icons'

/**
 * Logos de certificaciones y aliados. Si el logo tiene un PDF adjunto (constancia,
 * licencia…), al hacer clic se abre la vista previa del documento dentro del sitio.
 */
export default function Certifications() {
  const { t } = useI18n()
  const { site } = useSite()
  const [doc, setDoc] = useState<Partner | null>(null)
  if (!site?.partners.length) return null

  return (
    <section className="section container partners">
      <h2 className="partners__title">{t('partners')}</h2>
      <div className="partners__row">
        {site.partners.map((p, i) => {
          const img = p.imageUrl ? <img src={p.imageUrl} alt={p.name} loading="lazy" /> : <span>{p.name}</span>
          if (p.pdfUrl) {
            return (
              <button key={i} type="button" className="partner partner--doc" title={`${p.name} · ${t('viewDocument')}`} onClick={() => setDoc(p)}>
                {img}
                <small><IconFile /> {t('viewDocument')}</small>
              </button>
            )
          }
          return p.url
            ? <a key={i} className="partner" href={p.url} target="_blank" rel="noreferrer" title={p.name}>{img}</a>
            : <div key={i} className="partner" title={p.name}>{img}</div>
        })}
      </div>

      {doc?.pdfUrl && (
        <Modal
          title={doc.name || t('viewDocument')}
          onClose={() => setDoc(null)}
          wide
          actions={<a className="btn btn--sm" href={doc.pdfUrl} target="_blank" rel="noreferrer">{t('openPdf')} ↗</a>}
        >
          <iframe className="pdf-frame" src={`${doc.pdfUrl}#view=FitH`} title={doc.name} />
          {/* Algunos móviles no muestran PDF dentro de la página */}
          <p className="pdf-fallback"><a href={doc.pdfUrl} target="_blank" rel="noreferrer">{t('openPdf')} ↗</a></p>
        </Modal>
      )}
    </section>
  )
}
