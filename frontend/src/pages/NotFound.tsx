import { useI18n } from '../i18n'
import { useEffect } from 'react'
import { L } from '../components/common'

export default function NotFound() {
  const { t } = useI18n()
  // Que Google no indexe páginas inexistentes
  useEffect(() => {
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])
  return (
    <section className="section container empty">
      <h1>404</h1>
      <p>{t('notFound')}</p>
      <L to="/" className="btn btn--primary">{t('back')}</L>
    </section>
  )
}
