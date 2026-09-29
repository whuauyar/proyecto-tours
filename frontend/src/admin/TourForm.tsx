import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, ApiError, uploadImage } from '../api'
import { trValue } from '../i18n'
import { useFetch, useSite } from '../site'
import type { Category, Destination, Faq, Lang, Tour, TourImage } from '../types'
import { Field, ImageInput, LangTabs, TrInput, TrItinerary, TrList, missingLangs, useToast } from './ui'

type Form = Omit<Tour, 'id' | 'slug' | 'category' | 'destination' | 'coverUrl' | 'discountPercent' | 'related'> & {
  slug?: string
  coverUrl?: string | null
}

const EMPTY: Form = {
  destinationId: null, categoryId: null, title: {}, summary: {}, description: {}, highlights: {}, itinerary: {},
  includes: {}, excludes: {}, recommendations: {}, durationDays: 1, durationNights: 0, durationHours: null,
  price: 0, offerPrice: null, childPrice: null, currency: 'USD', difficulty: 'moderada', groupType: 'compartido',
  rating: null, reviewsCount: 0, location: '', coverKey: null, coverUrl: null, isFeatured: false, isActive: true,
  sortOrder: 0, images: [], faqs: [],
}

const num = (v: unknown) => (v === '' || v === null || v === undefined ? null : Number(v))

export default function TourForm() {
  const { id } = useParams()
  const isNew = !id || id === 'nuevo'
  const nav = useNavigate()
  const toast = useToast()
  const { site } = useSite()
  const { data: cats } = useFetch<Category[]>('/api/admin/categories')
  const { data: dests } = useFetch<Destination[]>('/api/admin/destinations')
  const [f, setF] = useState<Form>(EMPTY)
  const [lang, setLang] = useState<Lang>('es')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!isNew) api<Tour>(`/api/admin/tours/${id}`).then((t) => setF({ ...EMPTY, ...t }))
  }, [id, isNew])

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }))
  const missing = missingLangs([f.title, f.summary, f.description, f.highlights, f.itinerary, f.includes, f.excludes, f.recommendations, ...(f.faqs ?? []).flatMap((q) => [q.question, q.answer])])

  const addGallery = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const uploaded: TourImage[] = []
      for (const file of Array.from(files)) {
        const r = await uploadImage(file, 'tours')
        uploaded.push({ imageKey: r.key, url: r.url, alt: {} })
      }
      setF((x) => ({ ...x, images: [...(x.images ?? []), ...uploaded] }))
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setUploading(false)
    }
  }
  const moveImg = (i: number, dir: -1 | 1) => {
    const imgs = [...(f.images ?? [])]
    const j = i + dir
    if (j < 0 || j >= imgs.length) return
    ;[imgs[i], imgs[j]] = [imgs[j], imgs[i]]
    set('images', imgs)
  }
  const setFaq = (i: number, patch: Partial<Faq>) => set('faqs', (f.faqs ?? []).map((q, j) => (j === i ? { ...q, ...patch } : q)))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrors([])
    const cleanList = (v: Form['includes']) => Object.fromEntries(Object.entries(v).map(([l, arr]) => [l, (arr ?? []).map((s) => s.trim()).filter(Boolean)]))
    const cleanDays = (v: Form['itinerary']) => Object.fromEntries(Object.entries(v).map(([l, arr]) => [l, (arr ?? []).filter((d) => d.title.trim())]))
    const payload = {
      destinationId: f.destinationId, categoryId: f.categoryId, slug: f.slug || null,
      title: f.title, summary: f.summary, description: f.description,
      highlights: cleanList(f.highlights), includes: cleanList(f.includes), excludes: cleanList(f.excludes),
      recommendations: cleanList(f.recommendations), itinerary: cleanDays(f.itinerary),
      durationDays: Number(f.durationDays), durationNights: Number(f.durationNights), durationHours: num(f.durationHours),
      price: Number(f.price), offerPrice: num(f.offerPrice), childPrice: num(f.childPrice), currency: f.currency,
      difficulty: f.difficulty, groupType: f.groupType, rating: num(f.rating), reviewsCount: Number(f.reviewsCount || 0),
      location: f.location, coverKey: f.coverKey, isFeatured: f.isFeatured, isActive: f.isActive, sortOrder: Number(f.sortOrder),
      images: (f.images ?? []).map(({ imageKey, alt }) => ({ imageKey, alt })),
      faqs: (f.faqs ?? []).filter((q) => q.question.es?.trim()).map(({ question, answer }) => ({ question, answer })),
    }
    try {
      const saved = await api<Tour>(isNew ? '/api/admin/tours' : `/api/admin/tours/${id}`, { method: isNew ? 'POST' : 'PUT', json: payload })
      toast('Tour guardado')
      if (isNew) nav(`/admin/tours/${saved.id}`, { replace: true })
      else setF({ ...EMPTY, ...saved })
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors.length ? err.errors.map((x) => x.message) : [err.message])
        toast(err.message, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="tour-form">
      <div className="admin-head">
        <h1>{isNew ? 'Nuevo tour' : trValue(f.title, 'es') || 'Editar tour'}</h1>
        <div className="row-actions">
          {!isNew && f.slug && <a className="btn" href={`/${lang}/tour/${f.slug}`} target="_blank" rel="noreferrer">Ver en el sitio ({lang.toUpperCase()}) ↗</a>}
          <button className="btn btn--primary" disabled={saving || uploading}>{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </div>
      {errors.length > 0 && <div className="alert alert--error">{errors.map((m, i) => <div key={i}>{m}</div>)}</div>}

      <div className="tour-form__grid">
        <div className="card">
          <LangTabs lang={lang} onChange={setLang} missing={missing} enabled={site?.languages} />
          {lang !== 'es' && <p className="muted small">Los campos vacíos se muestran en español en el sitio. Debajo de cada campo verás el texto en español como referencia.</p>}
          <TrInput label="Título" value={f.title} onChange={(v) => set('title', v)} lang={lang} required />
          <TrInput label="Resumen (tarjeta)" value={f.summary} onChange={(v) => set('summary', v)} lang={lang} multiline rows={2} maxLength={400} />
          <TrInput label="Descripción" value={f.description} onChange={(v) => set('description', v)} lang={lang} multiline rows={6} hint="Separa párrafos con una línea en blanco" />
          <h3>Lo más destacado</h3>
          <TrList value={f.highlights} onChange={(v) => set('highlights', v)} lang={lang} />
          <h3>Itinerario</h3>
          <TrItinerary value={f.itinerary} onChange={(v) => set('itinerary', v)} lang={lang} />
          <div className="two-col">
            <div><h3>Incluye</h3><TrList value={f.includes} onChange={(v) => set('includes', v)} lang={lang} /></div>
            <div><h3>No incluye</h3><TrList value={f.excludes} onChange={(v) => set('excludes', v)} lang={lang} /></div>
          </div>
          <h3>Qué llevar</h3>
          <TrList value={f.recommendations} onChange={(v) => set('recommendations', v)} lang={lang} />

          <h3>Preguntas frecuentes de este tour</h3>
          {(f.faqs ?? []).map((q, i) => (
            <div key={i} className="itinerary-editor__day">
              <div className="itinerary-editor__head">
                <strong>Pregunta {i + 1}</strong>
                <button type="button" className="icon-btn" onClick={() => set('faqs', (f.faqs ?? []).filter((_, j) => j !== i))}>✕</button>
              </div>
              <TrInput label="Pregunta" value={q.question} onChange={(v) => setFaq(i, { question: v })} lang={lang} />
              <TrInput label="Respuesta" value={q.answer} onChange={(v) => setFaq(i, { answer: v })} lang={lang} multiline rows={2} />
            </div>
          ))}
          <button type="button" className="btn btn--sm" onClick={() => set('faqs', [...(f.faqs ?? []), { question: {}, answer: {} }])}>+ Agregar pregunta</button>
        </div>

        <div className="stack">
          <div className="card">
            <h3>Precios</h3>
            <div className="two-col">
              <Field label="Adulto (regular)"><input type="number" min={0} step="0.01" required value={f.price} onChange={(e) => set('price', e.target.value as never)} /></Field>
              <Field label="Oferta" hint="Vacío = sin oferta"><input type="number" min={0} step="0.01" value={f.offerPrice ?? ''} onChange={(e) => set('offerPrice', e.target.value as never)} /></Field>
              <Field label="Niño" hint="Vacío = mismo precio"><input type="number" min={0} step="0.01" value={f.childPrice ?? ''} onChange={(e) => set('childPrice', e.target.value as never)} /></Field>
              <Field label="Moneda">
                <select value={f.currency} onChange={(e) => set('currency', e.target.value as Form['currency'])}>
                  <option value="USD">USD</option><option value="PEN">PEN (S/)</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="card">
            <h3>Clasificación</h3>
            <Field label="Destino">
              <select value={f.destinationId ?? ''} onChange={(e) => set('destinationId', e.target.value ? Number(e.target.value) : null)}>
                <option value="">Sin destino</option>
                {dests?.map((d) => <option key={d.id} value={d.id}>{trValue(d.name, 'es')}</option>)}
              </select>
            </Field>
            <Field label="Tipo de experiencia">
              <select value={f.categoryId ?? ''} onChange={(e) => set('categoryId', e.target.value ? Number(e.target.value) : null)}>
                <option value="">Sin tipo</option>
                {cats?.map((c) => <option key={c.id} value={c.id}>{trValue(c.name, 'es')}</option>)}
              </select>
            </Field>
            <div className="three-col">
              <Field label="Días"><input type="number" min={1} value={f.durationDays} onChange={(e) => set('durationDays', e.target.value as never)} /></Field>
              <Field label="Noches"><input type="number" min={0} value={f.durationNights} onChange={(e) => set('durationNights', e.target.value as never)} /></Field>
              <Field label="Horas" hint="Tours de medio día"><input type="number" min={1} max={24} value={f.durationHours ?? ''} onChange={(e) => set('durationHours', e.target.value as never)} /></Field>
            </div>
            <div className="two-col">
              <Field label="Dificultad">
                <select value={f.difficulty} onChange={(e) => set('difficulty', e.target.value as Form['difficulty'])}>
                  <option value="facil">Fácil</option><option value="moderada">Moderada</option><option value="exigente">Exigente</option>
                </select>
              </Field>
              <Field label="Servicio">
                <select value={f.groupType} onChange={(e) => set('groupType', e.target.value as Form['groupType'])}>
                  <option value="compartido">Compartido</option><option value="privado">Privado</option>
                </select>
              </Field>
            </div>
            <Field label="Ubicación"><input value={f.location ?? ''} onChange={(e) => set('location', e.target.value)} /></Field>
          </div>

          <div className="card">
            <h3>Reseñas</h3>
            <p className="muted small">Usa datos reales (TripAdvisor, Google). Si lo dejas vacío no se muestran estrellas.</p>
            <div className="two-col">
              <Field label="Calificación (0–5)"><input type="number" min={0} max={5} step="0.1" value={f.rating ?? ''} onChange={(e) => set('rating', e.target.value as never)} /></Field>
              <Field label="N.º de reseñas"><input type="number" min={0} value={f.reviewsCount} onChange={(e) => set('reviewsCount', e.target.value as never)} /></Field>
            </div>
          </div>

          <div className="card">
            <h3>Publicación</h3>
            <Field label="URL (slug)" hint="Se genera del título en español si lo dejas vacío"><input value={f.slug ?? ''} onChange={(e) => set('slug', e.target.value)} /></Field>
            <Field label="Orden" hint="Menor número = aparece primero"><input type="number" value={f.sortOrder} onChange={(e) => set('sortOrder', e.target.value as never)} /></Field>
            <label className="check"><input type="checkbox" checked={f.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Publicado</label>
            <label className="check"><input type="checkbox" checked={f.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} /> Destacado en portada</label>
          </div>

          <div className="card">
            <ImageInput label="Imagen principal" folder="tours" value={f.coverKey} url={f.coverUrl} onChange={(key, url) => setF((x) => ({ ...x, coverKey: key, coverUrl: url }))} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="admin-head">
          <h3>Galería ({f.images?.length ?? 0})</h3>
          <label className="btn btn--sm">
            {uploading ? 'Subiendo…' : '+ Agregar fotos'}
            <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={(e) => { addGallery(e.target.files); e.target.value = '' }} />
          </label>
        </div>
        <div className="gallery-editor">
          {f.images?.map((img, i) => (
            <div key={img.imageKey} className="gallery-editor__item">
              <img src={img.url ?? ''} alt="" />
              <input placeholder={`Texto alternativo (${lang.toUpperCase()})`} value={img.alt?.[lang] ?? ''}
                onChange={(e) => set('images', f.images!.map((x, j) => (j === i ? { ...x, alt: { ...x.alt, [lang]: e.target.value } } : x)))} />
              <div className="gallery-editor__actions">
                <button type="button" className="icon-btn" onClick={() => moveImg(i, -1)} title="Mover a la izquierda">←</button>
                <button type="button" className="icon-btn" onClick={() => moveImg(i, 1)} title="Mover a la derecha">→</button>
                <button type="button" className="icon-btn danger" onClick={() => set('images', f.images!.filter((_, j) => j !== i))} title="Quitar">✕</button>
              </div>
            </div>
          ))}
        </div>
        <p className="muted small">Los cambios en la galería se aplican al presionar "Guardar". Las imágenes se optimizan automáticamente (WebP, máx. 1920 px).</p>
      </div>
    </form>
  )
}
