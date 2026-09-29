import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../api'
import { trValue } from '../i18n'
import { useFetch, useSite } from '../site'
import type { Lang, PageItem } from '../types'
import { Field, ImageInput, LangTabs, MissingBadges, TrInput, missingLangs, useToast } from './ui'

type Draft = Omit<PageItem, 'id' | 'slug'> & { id?: number; slug?: string }

export default function PagesAdmin() {
  const { data: rows, setData } = useFetch<PageItem[]>('/api/admin/pages')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [lang, setLang] = useState<Lang>('es')
  const toast = useToast()
  const { reload, site } = useSite()
  const set = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d))

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!draft) return
    const { id, imageUrl: _u, ...body } = draft
    try {
      const saved = await api<PageItem>(id ? `/api/admin/pages/${id}` : '/api/admin/pages', { method: id ? 'PUT' : 'POST', json: body })
      setData((l) => (id ? (l ?? []).map((x) => (x.id === id ? saved : x)) : [...(l ?? []), saved]))
      setDraft(null)
      reload()
      toast('Página guardada')
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Error', 'error')
    }
  }
  const remove = async (p: PageItem) => {
    if (!window.confirm(`¿Eliminar la página "${trValue(p.title, 'es')}"?`)) return
    await api(`/api/admin/pages/${p.id}`, { method: 'DELETE' })
    setData((l) => l?.filter((x) => x.id !== p.id) ?? null)
    reload()
  }

  return (
    <>
      <div className="admin-head">
        <h1>Páginas "Info útil"</h1>
        <button className="btn btn--primary" onClick={() => { setDraft({ title: {}, summary: {}, body: {}, imageKey: null, showInMenu: true, sortOrder: rows?.length ?? 0, isActive: true }); setLang('es') }}>+ Nueva página</button>
      </div>
      <p className="muted">Clima, boletos, transporte, términos y condiciones… Las marcadas "en menú" aparecen en el menú Info útil y en el pie de página.</p>
      {draft && (
        <form className="card cat-form" onSubmit={save}>
          <LangTabs lang={lang} onChange={setLang} missing={missingLangs([draft.title, draft.summary, draft.body])} enabled={site?.languages} />
          <div className="two-col">
            <div>
              <TrInput label="Título" value={draft.title} onChange={(title) => set({ title })} lang={lang} required />
              <TrInput label="Resumen" value={draft.summary} onChange={(summary) => set({ summary })} lang={lang} />
              <TrInput label="Contenido" value={draft.body} onChange={(body) => set({ body })} lang={lang} multiline rows={12} hint="Separa párrafos con una línea en blanco" />
            </div>
            <div>
              <ImageInput label="Imagen (opcional)" folder="pages" value={draft.imageKey} url={draft.imageUrl} onChange={(imageKey, imageUrl) => set({ imageKey, imageUrl })} aspect="21/9" />
              <Field label="URL (slug)" hint="Se genera del título si lo dejas vacío"><input value={draft.slug ?? ''} onChange={(e) => set({ slug: e.target.value })} /></Field>
              <Field label="Orden"><input type="number" value={draft.sortOrder} onChange={(e) => set({ sortOrder: Number(e.target.value) })} /></Field>
              <label className="check"><input type="checkbox" checked={draft.showInMenu} onChange={(e) => set({ showInMenu: e.target.checked })} /> Mostrar en el menú</label>
              <label className="check"><input type="checkbox" checked={draft.isActive} onChange={(e) => set({ isActive: e.target.checked })} /> Publicada</label>
            </div>
          </div>
          <div className="row-actions">
            <button className="btn btn--primary">Guardar</button>
            <button type="button" className="btn" onClick={() => setDraft(null)}>Cancelar</button>
          </div>
        </form>
      )}
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>Página</th><th>URL</th><th>Menú</th><th>Traducción</th><th></th></tr></thead>
          <tbody>
            {rows?.map((p) => (
              <tr key={p.id} className={p.isActive ? '' : 'is-muted'}>
                <td data-label="Página"><strong>{trValue(p.title, 'es')}</strong></td>
                <td data-label="URL" className="muted small">/info/{p.slug}</td>
                <td data-label="Menú">{p.showInMenu ? 'Sí' : 'No'}</td>
                <td data-label="Traducción"><MissingBadges values={[p.title, p.body]} /></td>
                <td className="nowrap">
                  <button className="btn btn--sm" onClick={() => { setDraft({ ...p }); setLang('es') }}>Editar</button>{' '}
                  <button className="btn btn--sm btn--danger-ghost" onClick={() => remove(p)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
