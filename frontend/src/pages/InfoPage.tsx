import { useParams } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useFetch } from '../site'
import type { PageItem } from '../types'
import Img from '../components/Img'
import { L, Paragraphs } from '../components/common'
import NotFound from './NotFound'

export default function InfoPage() {
  const { slug } = useParams()
  const { t, tr } = useI18n()
  const { data: page, loading, error } = useFetch<PageItem>(`/api/pages/${slug}`)
  if (loading) return <div className="container section muted">{t('loading')}</div>
  if (error || !page) return <NotFound />
  return (
    <>
      <section className="page-head">
        <div className="container">
          <nav className="crumbs crumbs--light"><L to="/">{t('home')}</L> / <span>{t('usefulInfo')}</span></nav>
          <h1>{tr(page.title)}</h1>
          {tr(page.summary) && <p>{tr(page.summary)}</p>}
        </div>
      </section>
      <article className="section container prose">
        {page.imageUrl && <Img src={page.imageUrl} alt="" className="prose__img" />}
        <Paragraphs text={tr(page.body)} />
        <p><L to="/contacto" className="btn btn--primary">{t('contact')}</L></p>
      </article>
    </>
  )
}
