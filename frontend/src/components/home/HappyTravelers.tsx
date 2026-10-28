import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n'
import { useSite } from '../../site'
import { IconBookmark, IconComment, IconHeartFill, IconSend, SOCIAL_ICONS } from '../Icons'
import Img from '../Img'
import { Stars } from '../common'

/** Publicación de red social (estilo tarjeta de Instagram) que rota cada 5 s y enlaza a la red */
function SocialPostCard() {
  const { tr } = useI18n()
  const { site } = useSite()
  const posts = (site?.socialPosts ?? []).filter((p) => p.imageUrl)
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (posts.length < 2 || paused) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => setI((x) => (x + 1) % posts.length), 5000)
    return () => clearInterval(id)
  }, [posts.length, paused])
  if (!posts.length) return null
  const post = posts[i % posts.length]
  const Net = SOCIAL_ICONS[post.network]
  const body = (
    <>
      <header className="post__head">
        <span className="post__avatar">{site?.logoUrl ? <img src={site.logoUrl} alt="" /> : site?.name?.[0]}</span>
        <span className="post__account"><strong>{post.account || site?.name}</strong><small>{post.network}</small></span>
        {Net && <span className="post__net"><Net /></span>}
      </header>
      <Img src={post.imageUrl} alt={tr(post.caption) ?? ''} className="post__img" />
      <div className="post__icons" aria-hidden="true">
        <IconHeartFill /><IconComment /><IconSend />
        {posts.length > 1 && (
          <span className="post__dots">{posts.map((_, j) => <i key={j} className={j === i % posts.length ? 'on' : ''} />)}</span>
        )}
        <IconBookmark />
      </div>
      {tr(post.caption) && <p className="post__caption"><strong>{post.account || site?.name}</strong> {tr(post.caption)}</p>}
    </>
  )
  return (
    <div className="post-wrap" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {post.url ? <a className="post" href={post.url} target="_blank" rel="noreferrer">{body}</a> : <div className="post">{body}</div>}
    </div>
  )
}

/** Sección "Pasajeros felices" (texto + publicación de redes + premio + botón a "¿Por qué elegirnos?") */
export default function HappyTravelers() {
  const { t, tr } = useI18n()
  const { site } = useSite()
  if (!site || !tr(site.happyTitle)) return null
  const paragraphs = (tr(site.happyText) ?? '').split(/\n\s*\n/).filter(Boolean)
  const hasAward = site.awardImageUrl || tr(site.awardTitle)
  const award = (
    <>
      {site.awardImageUrl && <img src={site.awardImageUrl} alt={tr(site.awardTitle) ?? ''} loading="lazy" />}
      <span>
        {tr(site.awardTitle) && <strong>{tr(site.awardTitle)}</strong>}
        <Stars value={5} />
        {tr(site.awardText) && <small>{tr(site.awardText)}</small>}
      </span>
    </>
  )
  return (
    <section className="section container happy">
      <SocialPostCard />
      <div className="happy__text">
        {tr(site.happyEyebrow) && <p className="eyebrow eyebrow--dark">{tr(site.happyEyebrow)}</p>}
        <h2>{tr(site.happyTitle)}</h2>
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        {hasAward && (site.awardUrl
          ? <a className="award" href={site.awardUrl} target="_blank" rel="noreferrer">{award}</a>
          : <div className="award">{award}</div>)}
        {!!site.features.length && <a href="#por-que-elegirnos" className="btn btn--primary">{t('whyChooseUs')}</a>}
      </div>
    </section>
  )
}
