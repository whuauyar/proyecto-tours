import { useI18n } from '../i18n'
import { L } from '../components/common'

export default function NotFound() {
  const { t } = useI18n()
  return (
    <section className="section container empty">
      <h1>404</h1>
      <p>{t('notFound')}</p>
      <L to="/" className="btn btn--primary">{t('back')}</L>
    </section>
  )
}
