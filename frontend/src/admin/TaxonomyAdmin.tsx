import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../api'
import { trValue } from '../i18n'
import { useFetch, useSite } from '../site'
import type { Lang, Tr } from '../types'
import { Field, ImageInput, LangTabs, MissingBadges, TrInput, TrList, missingLangs, useToast } from './ui'

interface Item {
  id?: number
  slug?: string
  name: Tr
  summary?: Tr
  description?: Tr
  highlights?: Tr<string[]>
  region?: string | null
  imageKey: string | null
  imageUrl?: string | null
  sortOrder: number
  isActive: boolean
  isFeatured?: boolean
  toursCount?: number
}

/**
 * Administración de destinos y tipos de experiencia (misma estructura,
 * los destinos tienen además resumen, destacados, región y "mostrar en portada").
 */
export default function TaxonomyAdmin({ kind }: { kind: 'destinations' | 'categories' }) {
  const isDest = kind === 'destinations'
  const label = isDest ? 'Destinos' : 'Tipos de experiencia'
  const { data: rows, setData } = useFetch<Item[]>(`/api/admin/${kind}`)
  const [draft, setDraft] = useState<Item | null>(null)
  const [lang, setLang] = useState<Lang>('es')
  const toast = useToast()
  const { reload, site } = useSite()
  const set = (patch: Partial<Item>) => setDraft((d) => (d ? { ...d, ...patch } : d))

  const trFields = (d: Item) => [d.name, d.summary, d.description, d.highlights]

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!draft) return
    const { id, imageUrl: _u, toursCount: _c, ...body } = draft
    const payload: Record<string, unknown> = { ...body, sortOrder: Number(body.sortOrder ?? 0) }
    if (!isDest) {
      delete payload.summary; delete payload.highlights; delete payload.region; delete payload.isFeatured
    }
    try {
      const saved = await api<Item>(id ? `/api/admin/${kind}/${id}` : `/api/admin/${kind}`, { method: id ? 'PUT' : 'POST', json: payload })
      setData((list) => {
        const l = list ?? []
        return id ? l.map((c) => (c.id === id ? { ...c, ...saved } : c)) : [...l, { ...saved, toursCount: 0 }]
      })
      setDraft(null)
      reload()
      toast('Guardado')
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Error', 'error')
    }
  }

  const remove = async (c: Item) => {
    if (!window.confirm(`¿Eliminar "${trValue(c.name, 'es')}"? Sus tours quedarán sin ${isDest ? 'destino' : 'tipo'}.`)) return
    await api(`/api/admin/${kind}/${c.id}`, { method: 'DELETE' })
    setData((l) => l?.filter((x) => x.id !== c.id) ?? null)
    reload()
    toast('Eliminado')
  }

  const empty: Item = { name: {}, summary: {}, description: {}, highlights: {}, region: '', imageKey: null, sortOrder: (rows?.length ?? 0), isActive: true, isFeatured: true }

  return (
    <>
      <div className="admin-head">
        <h1>{label}</h1>
        <button className="btn btn--primary" onClick={() => { setDraft({ ...empty }); setLang('es') }}>+ Nuevo</button>
      </div>
      {isDest && <p className="muted">Los destinos forman el menú principal y la sección "Explora nuestros destinos" de la portada.</p>}

      {draft && (
        <form className="card cat-form" onSubmit={save}>
          <h2>{draft.id ? 'Editar' : 'Nuevo'}: {trValue(draft.name, 'es') || '—'}</h2>
          <LangTabs lang={lang} onChange={setLang} missing={missingLangs(trFields(draft))} enabled={site?.languages} />
          <div className="two-col">
            <div>
              <TrInput label="Nombre" value={draft.name} onChange={(name) => set({ name })} lang={lang} required />
              {isDest && <TrInput label="Resumen corto" value={draft.summary} onChange={(summary) => set({ summary })} lang={lang} maxLength={200} />}
              <TrInput label="Descripción" value={draft.description} onChange={(description) => set({ description })} lang={lang} multiline rows={isDest ? 5 : 2} hint={isDest ? 'Separa párrafos con una línea en blanco' : undefined} />
              {isDest && (<><span className="field-label">Lo más destacado</span><TrList value={draft.highlights} onChange={(highlights) => set({ highlights })} lang={lang} /></>)}
            </div>
            <div>
              <ImageInput label="Imagen" folder={kind} value={draft.imageKey} url={draft.imageUrl} onChange={(imageKey, imageUrl) => set({ imageKey, imageUrl })} aspect="4/3" />
              <div className="two-col">
                <Field label="Orden"><input type="number" value={draft.sortOrder} onChange={(e) => set({ sortOrder: Number(e.target.value) })} /></Field>
                {isDest && <Field label="Región"><input value={draft.region ?? ''} onChange={(e) => set({ region: e.target.value })} /></Field>}
              </div>
              <Field label="URL (slug)" hint="Se genera del nombre en español si lo dejas vacío"><input value={draft.slug ?? ''} onChange={(e) => set({ slug: e.target.value })} /></Field>
              <label className="check"><input type="checkbox" checked={draft.isActive} onChange={(e) => set({ isActive: e.target.checked })} /> Visible</label>
              {isDest && <label className="check"><input type="checkbox" checked={!!draft.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} /> Mostrar en portada</label>}
            </div>
          </div>
          <div className="row-actions">
            <button className="btn btn--primary">Guardar</button>
            <button type="button" className="btn" onClick={() => setDraft(null)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="cat-admin-grid">
        {rows?.map((c) => (
          <div key={c.id} className={`card cat-admin ${c.isActive ? '' : 'is-muted'}`}>
            {c.imageUrl ? <img src={c.imageUrl} alt="" /> : <div className="img-fallback" />}
            <div>
              <strong>{trValue(c.name, 'es')}</strong>
              <div className="muted small">{c.toursCount ?? 0} tours {c.isActive ? '' : '· oculto'}</div>
              <MissingBadges values={trFields(c)} />
            </div>
            <div className="row-actions">
              <button className="btn btn--sm" onClick={() => { setDraft({ ...empty, ...c }); setLang('es') }}>Editar</button>
              <button className="btn btn--sm btn--danger-ghost" onClick={() => remove(c)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
