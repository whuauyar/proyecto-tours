import { useState } from 'react'
import { api, ApiError } from '../api'
import { useFetch, useSite } from '../site'
import type { Review } from '../types'
import { LANG_META } from '../i18n'
import { useToast } from './ui'

const fmt = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })

/** Reseñas publicadas por visitantes con Google: el administrador puede corregir, ocultar o eliminar */
export default function ReviewsAdmin() {
  const { data: rows, setData } = useFetch<Review[]>('/api/admin/reviews')
  const { site } = useSite()
  const [edit, setEdit] = useState<Review | null>(null)
  const [filter, setFilter] = useState<'' | 'visible' | 'hidden'>('')
  const toast = useToast()

  const patch = async (r: Review, body: Partial<Review>, msg: string) => {
    try {
      const saved = await api<Review>(`/api/admin/reviews/${r.id}`, { method: 'PATCH', json: body })
      setData((l) => l?.map((x) => (x.id === r.id ? saved : x)) ?? null)
      toast(msg)
      return true
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Error', 'error')
      return false
    }
  }
  const remove = async (r: Review) => {
    if (!window.confirm(`¿Eliminar definitivamente el testimonio de ${r.name}?`)) return
    await api(`/api/admin/reviews/${r.id}`, { method: 'DELETE' })
    setData((l) => l?.filter((x) => x.id !== r.id) ?? null)
  }

  const list = (rows ?? []).filter((r) => (filter === 'visible' ? r.isVisible : filter === 'hidden' ? !r.isVisible : true))
  const visible = (rows ?? []).filter((r) => r.isVisible)
  const avg = visible.length ? visible.reduce((a, r) => a + r.rating, 0) / visible.length : 0

  return (
    <>
      <div className="admin-head">
        <h1>Testimonios de viajeros</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="">Todas ({rows?.length ?? 0})</option>
          <option value="visible">Publicadas ({visible.length})</option>
          <option value="hidden">Ocultas ({(rows?.length ?? 0) - visible.length})</option>
        </select>
      </div>
      <p className="muted">Los visitantes los escriben en la portada (sección "Lo que dicen nuestros viajeros") y se publican al instante. Puedes corregir nombre, país, texto o estrellas, ocultarlos o eliminarlos. Promedio publicado: <strong>{avg ? avg.toFixed(1) : '—'} ★</strong></p>
      {!site?.googleClientId && (
        <p className="muted small">Opcional: con la variable <code>GOOGLE_CLIENT_ID</code> en el backend, el visitante puede además entrar con Google para mostrar su foto (verificado ✓).</p>
      )}

      <div className="reviews-admin">
        {list.map((r) => (
          <div key={r.id} className={`card review-admin ${r.isVisible ? '' : 'is-muted'}`}>
            <div className="review-admin__head">
              {r.pictureUrl ? <img src={r.pictureUrl} alt="" referrerPolicy="no-referrer" /> : <span className="review-admin__letter">{r.name[0]}</span>}
              <div>
                <strong>{r.name}{r.country && <span className="muted"> · {r.country}</span>}</strong>
                <small className="muted">{r.source === 'google' ? `Google ✓ ${r.email ?? ''}` : 'Formulario web'} · {fmt.format(new Date(r.createdAt))} · {LANG_META[r.locale]?.short ?? r.locale}</small>
              </div>
              <span className="review-admin__stars">{'★'.repeat(r.rating)}<span className="muted">{'★'.repeat(5 - r.rating)}</span></span>
            </div>
            {edit?.id === r.id ? (
              <form
                className="stack"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (await patch(r, { name: edit.name, country: edit.country, rating: edit.rating, text: edit.text }, 'Testimonio actualizado')) setEdit(null)
                }}
              >
                <div className="three-col">
                  <input value={edit.name} placeholder="Nombre" onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
                  <input value={edit.country ?? ''} placeholder="País" onChange={(e) => setEdit({ ...edit, country: e.target.value || null })} />
                  <select value={edit.rating} onChange={(e) => setEdit({ ...edit, rating: Number(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
                  </select>
                </div>
                <textarea rows={5} value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} />
                <div className="row-actions">
                  <button className="btn btn--sm btn--primary">Guardar</button>
                  <button type="button" className="btn btn--sm" onClick={() => setEdit(null)}>Cancelar</button>
                </div>
              </form>
            ) : (
              <p className="review-admin__text">{r.text}</p>
            )}
            <div className="row-actions">
              {r.editedByAdmin && <span className="pill pill--soft">Editada</span>}
              {!r.isVisible && <span className="pill pill--soft">Oculta</span>}
              <span style={{ flex: 1 }} />
              {edit?.id !== r.id && <button className="btn btn--sm" onClick={() => setEdit({ ...r })}>Editar</button>}
              <button className="btn btn--sm" onClick={() => patch(r, { isVisible: !r.isVisible }, r.isVisible ? 'Testimonio oculto' : 'Testimonio publicado')}>
                {r.isVisible ? 'Ocultar' : 'Publicar'}
              </button>
              <button className="btn btn--sm btn--danger-ghost" onClick={() => remove(r)}>Eliminar</button>
            </div>
          </div>
        ))}
        {rows && !list.length && <p className="muted">Aún no hay testimonios.</p>}
      </div>
    </>
  )
}
