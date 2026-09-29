import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { uploadImage } from '../api'
import { LANG_META } from '../i18n'
import { LANGS, type Lang, type Tr } from '../types'

/* ---------- Avisos (toasts) ---------- */
type Toast = { id: number; text: string; kind: 'ok' | 'error' }
const ToastCtx = createContext<(text: string, kind?: Toast['kind']) => void>(() => {})
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = (text: string, kind: Toast['kind'] = 'ok') => {
    const id = Date.now() + Math.random()
    setItems((x) => [...x, { id, text, kind }])
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 3500)
  }
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status">
        {items.map((t) => <div key={t.id} className={`toast toast--${t.kind}`}>{t.text}</div>)}
      </div>
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

/* ---------- Carga de una imagen ---------- */
export function ImageInput({
  value, url, onChange, folder, label, aspect = '16/9',
}: {
  value: string | null
  url?: string | null
  onChange: (key: string | null, url: string | null) => void
  folder: string
  label: string
  aspect?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const pick = async (file?: File) => {
    if (!file) return
    setBusy(true)
    try {
      const r = await uploadImage(file, folder)
      onChange(r.key, r.url)
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
      if (ref.current) ref.current.value = ''
    }
  }
  return (
    <div className="image-input">
      <span className="field-label">{label}</span>
      <div
        className="image-input__box"
        style={{ aspectRatio: aspect }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]) }}
      >
        {url && value ? <img src={url} alt="" /> : <span className="muted">Arrastra una imagen o haz clic en “Subir”</span>}
        {busy && <div className="image-input__busy">Subiendo…</div>}
      </div>
      <div className="image-input__actions">
        <button type="button" className="btn btn--sm" onClick={() => ref.current?.click()} disabled={busy}>
          {value ? 'Cambiar imagen' : 'Subir'}
        </button>
        {value && <button type="button" className="btn btn--sm btn--danger-ghost" onClick={() => onChange(null, null)}>Quitar</button>}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  )
}

/* ---------- Carga de un video (portada) ---------- */
export function VideoInput({ url, onChange, folder = 'site' }: { url: string; onChange: (url: string) => void; folder?: string }) {
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const pick = async (file?: File) => {
    if (!file) return
    if (file.size > 50 * 1024 * 1024) return toast('El video puede pesar hasta 50 MB (recomendado: menos de 8 MB)', 'error')
    setBusy(true)
    try {
      const r = await uploadImage(file, folder)
      onChange(r.url)
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
      if (ref.current) ref.current.value = ''
    }
  }
  return (
    <div className="image-input">
      <span className="field-label">Video de fondo (opcional)</span>
      <div className="image-input__box" style={{ aspectRatio: '16/9' }}>
        {url ? <video src={url} muted loop autoPlay playsInline /> : <span className="muted">MP4 o WebM, 8–15 s en bucle, sin audio</span>}
        {busy && <div className="image-input__busy">Subiendo…</div>}
      </div>
      <div className="image-input__actions">
        <button type="button" className="btn btn--sm" onClick={() => ref.current?.click()} disabled={busy}>{url ? 'Cambiar video' : 'Subir video'}</button>
        {url && <button type="button" className="btn btn--sm btn--danger-ghost" onClick={() => onChange('')}>Quitar</button>}
      </div>
      <small className="muted">Si hay video, la imagen de portada se muestra mientras carga y a quienes tienen activado "reducir movimiento".</small>
      <input ref={ref} type="file" accept="video/mp4,video/webm" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  )
}

/* ---------- Editor de listas de texto (incluye / no incluye) ---------- */
export function ListEditor({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div className="list-editor">
      {value.map((item, i) => (
        <div key={i} className="list-editor__row">
          <input value={item} placeholder={placeholder} onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))} />
          <button type="button" className="icon-btn" title="Quitar" onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="btn btn--sm" onClick={() => onChange([...value, ''])}>+ Agregar</button>
    </div>
  )
}

/* ---------- Editor de itinerario ---------- */
type Day = { title: string; description?: string | null }
export function ItineraryEditor({ value, onChange }: { value: Day[]; onChange: (v: Day[]) => void }) {
  const set = (i: number, patch: object) => onChange(value.map((d, j) => (j === i ? { ...d, ...patch } : d)))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= value.length) return
    const copy = [...value]
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    onChange(copy)
  }
  return (
    <div className="itinerary-editor">
      {value.map((d, i) => (
        <div key={i} className="itinerary-editor__day">
          <div className="itinerary-editor__head">
            <strong>Día {i + 1}</strong>
            <div>
              <button type="button" className="icon-btn" onClick={() => move(i, -1)} title="Subir">↑</button>
              <button type="button" className="icon-btn" onClick={() => move(i, 1)} title="Bajar">↓</button>
              <button type="button" className="icon-btn" onClick={() => onChange(value.filter((_, j) => j !== i))} title="Quitar">✕</button>
            </div>
          </div>
          <input placeholder="Título del día" value={d.title} onChange={(e) => set(i, { title: e.target.value })} />
          <textarea placeholder="Descripción" rows={3} value={d.description ?? ''} onChange={(e) => set(i, { description: e.target.value })} />
        </div>
      ))}
      <button type="button" className="btn btn--sm" onClick={() => onChange([...value, { title: '', description: '' }])}>+ Agregar día</button>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <small className="muted">{hint}</small>}
    </label>
  )
}

/* ================= Multilenguaje ================= */

const filled = (v: unknown) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)

/**
 * Idiomas a los que les falta traducción: un campo cuenta como pendiente
 * cuando tiene contenido en español pero no en ese idioma.
 */
export function missingLangs(values: Array<Tr<unknown> | null | undefined>): Lang[] {
  return LANGS.filter((l) => l !== 'es' && values.some((v) => v && filled(v.es) && !filled(v[l])))
}

export function LangTabs({ lang, onChange, missing = [], enabled = [...LANGS] }: {
  lang: Lang; onChange: (l: Lang) => void; missing?: Lang[]; enabled?: Lang[]
}) {
  return (
    <div className="tabs lang-tabs" role="tablist">
      {LANGS.map((l) => (
        <button key={l} type="button" role="tab" aria-selected={l === lang} className={l === lang ? 'active' : ''} onClick={() => onChange(l)}>
          {LANG_META[l].flag} {LANG_META[l].label}
          {l !== 'es' && enabled.includes(l) && (
            <span className={`dot ${missing.includes(l) ? 'dot--warn' : 'dot--ok'}`} title={missing.includes(l) ? 'Falta traducir' : 'Completo'} />
          )}
          {!enabled.includes(l) && <span className="muted small"> (inactivo)</span>}
        </button>
      ))}
    </div>
  )
}

/** Badges compactos para listados: muestra qué idiomas faltan */
export function MissingBadges({ values }: { values: Array<Tr<unknown> | null | undefined> }) {
  const miss = missingLangs(values)
  if (!miss.length) return <span className="tr-ok" title="Traducido en todos los idiomas">✓ 4 idiomas</span>
  return <span className="tr-miss" title="Falta traducir">{miss.map((l) => l.toUpperCase()).join(' · ')}</span>
}

/** Campo de texto traducible (edita el idioma activo) */
export function TrInput({ label, value, onChange, lang, multiline = false, rows = 3, required = false, hint, maxLength }: {
  label: string; value: Tr | undefined; onChange: (v: Tr) => void; lang: Lang
  multiline?: boolean; rows?: number; required?: boolean; hint?: string; maxLength?: number
}) {
  const v = value ?? {}
  const set = (text: string) => onChange({ ...v, [lang]: text })
  const ref = lang !== 'es' ? v.es : undefined
  return (
    <label className="field">
      <span className="field-label">{label} <span className="lang-chip">{LANG_META[lang].short}</span></span>
      {multiline
        ? <textarea rows={rows} value={v[lang] ?? ''} maxLength={maxLength} required={required && lang === 'es'} onChange={(e) => set(e.target.value)} lang={LANG_META[lang].locale} />
        : <input value={v[lang] ?? ''} maxLength={maxLength} required={required && lang === 'es'} onChange={(e) => set(e.target.value)} lang={LANG_META[lang].locale} />}
      {ref && <small className="ref-text" title="Texto en español como referencia">ES: {ref.length > 160 ? ref.slice(0, 160) + '…' : ref}</small>}
      {hint && <small className="muted">{hint}</small>}
    </label>
  )
}

/** Lista traducible (incluye, no incluye, qué llevar, destacados) */
export function TrList({ value, onChange, lang }: { value: Tr<string[]> | undefined; onChange: (v: Tr<string[]>) => void; lang: Lang }) {
  const v = value ?? {}
  const items = v[lang] ?? []
  const es = v.es ?? []
  return (
    <>
      {lang !== 'es' && items.length === 0 && es.length > 0 && (
        <button type="button" className="btn btn--sm copy-btn" onClick={() => onChange({ ...v, [lang]: [...es] })}>
          Copiar {es.length} elementos del español para traducir
        </button>
      )}
      <ListEditor value={items} onChange={(list) => onChange({ ...v, [lang]: list })} />
      {lang !== 'es' && es.length > 0 && <small className="ref-text">ES: {es.join(' · ')}</small>}
    </>
  )
}

export function TrItinerary({ value, onChange, lang }: { value: Tr<Day[]> | undefined; onChange: (v: Tr<Day[]>) => void; lang: Lang }) {
  const v = value ?? {}
  const days = v[lang] ?? []
  const es = v.es ?? []
  return (
    <>
      {lang !== 'es' && days.length === 0 && es.length > 0 && (
        <button type="button" className="btn btn--sm copy-btn" onClick={() => onChange({ ...v, [lang]: es.map((d) => ({ ...d })) })}>
          Copiar los {es.length} días del español para traducir
        </button>
      )}
      <ItineraryEditor value={days} onChange={(list) => onChange({ ...v, [lang]: list })} />
    </>
  )
}
