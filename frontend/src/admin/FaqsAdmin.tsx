import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../api'
import { trValue } from '../i18n'
import { useFetch, useSite } from '../site'
import type { Faq, Lang } from '../types'
import { LangTabs, MissingBadges, TrInput, missingLangs, useToast } from './ui'

export default function FaqsAdmin() {
  const { data: rows, setData } = useFetch<Faq[]>('/api/admin/faqs?tourId=null')
  const [draft, setDraft] = useState<Faq | null>(null)
  const [lang, setLang] = useState<Lang>('es')
  const toast = useToast()
  const { site } = useSite()

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!draft) return
    const { id, createdAt: _a, updatedAt: _b, ...body } = draft as Faq & { createdAt?: string; updatedAt?: string }
    try {
      const saved = await api<Faq>(id ? `/api/admin/faqs/${id}` : '/api/admin/faqs', { method: id ? 'PUT' : 'POST', json: { ...body, tourId: null } })
      setData((l) => (id ? (l ?? []).map((x) => (x.id === id ? saved : x)) : [...(l ?? []), saved]))
      setDraft(null)
      toast('Pregunta guardada')
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Error', 'error')
    }
  }
  const remove = async (f: Faq) => {
    if (!window.confirm('¿Eliminar esta pregunta?')) return
    await api(`/api/admin/faqs/${f.id}`, { method: 'DELETE' })
    setData((l) => l?.filter((x) => x.id !== f.id) ?? null)
  }

  return (
    <>
      <div className="admin-head">
        <h1>Preguntas frecuentes</h1>
        <button className="btn btn--primary" onClick={() => { setDraft({ question: {}, answer: {}, sortOrder: rows?.length ?? 0, isActive: true }); setLang('es') }}>+ Nueva pregunta</button>
      </div>
      <p className="muted">Se muestran en la portada (las 6 primeras) y en Contacto. Las preguntas propias de un tour se editan dentro del tour.</p>
      {draft && (
        <form className="card cat-form" onSubmit={save}>
          <LangTabs lang={lang} onChange={setLang} missing={missingLangs([draft.question, draft.answer])} enabled={site?.languages} />
          <TrInput label="Pregunta" value={draft.question} onChange={(question) => setDraft({ ...draft, question })} lang={lang} required />
          <TrInput label="Respuesta" value={draft.answer} onChange={(answer) => setDraft({ ...draft, answer })} lang={lang} multiline rows={4} required />
          <div className="row-actions">
            <label className="check"><input type="checkbox" checked={!!draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} /> Visible</label>
            <label className="field inline">Orden <input type="number" value={draft.sortOrder ?? 0} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} /></label>
          </div>
          <div className="row-actions">
            <button className="btn btn--primary">Guardar</button>
            <button type="button" className="btn" onClick={() => setDraft(null)}>Cancelar</button>
          </div>
        </form>
      )}
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>#</th><th>Pregunta</th><th>Traducción</th><th></th></tr></thead>
          <tbody>
            {rows?.map((f) => (
              <tr key={f.id} className={f.isActive ? '' : 'is-muted'}>
                <td>{f.sortOrder}</td>
                <td data-label="Pregunta"><strong>{trValue(f.question, 'es')}</strong><div className="muted small">{trValue(f.answer, 'es')?.slice(0, 110)}</div></td>
                <td data-label="Traducción"><MissingBadges values={[f.question, f.answer]} /></td>
                <td className="nowrap">
                  <button className="btn btn--sm" onClick={() => { setDraft({ ...f }); setLang('es') }}>Editar</button>{' '}
                  <button className="btn btn--sm btn--danger-ghost" onClick={() => remove(f)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
