import { useRef, useState } from 'react'
import { useI18n } from '../../i18n'
import { useSite } from '../../site'
import { IconPlay } from '../Icons'
import { CarouselArrows, CarouselDots } from './CarouselNav'
import { usePager, usePerPage } from './usePager'

/** Un video corto vertical: muestra la portada y se reproduce al hacer clic */
function VideoCard({ src, poster, title, onPlay }: { src: string; poster?: string | null; title: string; onPlay: (v: HTMLVideoElement) => void }) {
  const { t } = useI18n()
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const play = () => {
    const v = ref.current
    if (!v) return
    onPlay(v)
    v.play().catch(() => {})
  }
  return (
    <figure className="vcard">
      <video
        ref={ref}
        // Sin portada se muestra el primer cuadro del video
        src={poster ? src : `${src}#t=0.1`}
        poster={poster ?? undefined}
        preload={poster ? 'none' : 'metadata'}
        playsInline
        controls={playing}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        aria-label={title || t('playVideo')}
      />
      {!playing && (
        <button type="button" className="vcard__play" onClick={play} aria-label={`${t('playVideo')}${title ? `: ${title}` : ''}`}>
          <span><IconPlay /></span>
        </button>
      )}
      {title && !playing && <figcaption>{title}</figcaption>}
    </figure>
  )
}

/** Carrusel de hasta 20 videos cortos, 4 por página (2 en tablet, 1 en móvil) */
export default function ShortVideos() {
  const { tr } = useI18n()
  const { site } = useSite()
  const videos = (site?.videos ?? []).filter((v) => v.videoUrl).slice(0, 20)
  const perPage = usePerPage([[1024, 4], [640, 2]], 1)
  const pager = usePager(videos.length, perPage)
  const current = useRef<HTMLVideoElement | null>(null)
  if (!videos.length) return null

  // Solo un video suena a la vez
  const onPlay = (v: HTMLVideoElement) => {
    if (current.current && current.current !== v) current.current.pause()
    current.current = v
  }
  const go = (fn: () => void) => {
    current.current?.pause()
    fn()
  }

  return (
    <section className="section section--tint">
      <div className="container">
        {tr(site?.videosTitle) && <div className="section__head section__head--center"><h2>{tr(site?.videosTitle)}</h2></div>}
        <div className="carousel">
          <div className="carousel__track" style={{ gridTemplateColumns: `repeat(${perPage}, 1fr)` }}>
            {pager.slice(videos).map((v, i) => (
              <VideoCard key={`${pager.page}-${i}-${v.videoKey}`} src={v.videoUrl!} poster={v.posterUrl} title={tr(v.title) ?? ''} onPlay={onPlay} />
            ))}
          </div>
          <CarouselArrows onPrev={() => go(pager.prev)} onNext={() => go(pager.next)} hidden={pager.pages < 2} />
        </div>
        <CarouselDots pages={pager.pages} page={pager.page} onChange={(p) => go(() => pager.setPage(p))} />
      </div>
    </section>
  )
}
