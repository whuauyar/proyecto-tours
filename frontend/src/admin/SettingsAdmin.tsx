import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api'
import { LANG_META } from '../i18n'
import { useSite } from '../site'
import { LANGS, type Lang, type SiteSettings, type Tr } from '../types'
import { FEATURE_ICONS } from '../components/Icons'
import { Field, ImageInput, LangTabs, TrInput, missingLangs, useToast } from './ui'

const SECTIONS = [
  ['general', 'Identidad y colores'],
  ['idiomas', 'Idiomas'],
  ['portada', 'Portada'],
  ['confianza', 'Confianza y cifras'],
  ['contacto', 'Contacto y redes'],
  ['bloques', 'Bloques de portada'],
  ['testimonios', 'Testimonios'],
  ['aliados', 'Certificaciones'],
] as const
type Section = (typeof SECTIONS)[number][0]

const ICON_LABELS: Record<string, string> = {
  guide: 'Guía', price: 'Precio', support: 'Soporte', shield: 'Seguridad', leaf: 'Sostenible',
  calendar: 'Calendario', star: 'Estrella', heart: 'Corazón', users: 'Grupo', globe: 'Mundo',
}

export default function SettingsAdmin() {
  const [s, setS] = useState<SiteSettings | null>(null)
  const [section, setSection] = useState<Section>('general')
  const [lang, setLang] = useState<Lang>('es')
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const { reload } = useSite()
  useEffect(() => { api<SiteSettings>('/api/admin/settings').then(setS) }, [])
  if (!s) return <p className="muted">Cargando…</p>

  const set = (patch: Partial<SiteSettings>) => setS({ ...s, ...patch })
  const text = (k: keyof SiteSettings, label: string, hint?: string, type = 'text') => (
    <Field label={label} hint={hint}>
      <input type={type} value={(s[k] as string | number) ?? ''} onChange={(e) => set({ [k]: type === 'number' ? Number(e.target.value) : e.target.value } as never)} />
    </Field>
  )
  const setArr = <K extends 'features' | 'steps' | 'testimonials' | 'partners'>(k: K, i: number, patch: Partial<SiteSettings[K][number]>) =>
    set({ [k]: (s[k] as unknown[]).map((x, j) => (j === i ? { ...(x as object), ...patch } : x)) } as never)
  const removeArr = (k: 'features' | 'steps' | 'testimonials' | 'partners', i: number) => set({ [k]: (s[k] as unknown[]).filter((_, j) => j !== i) } as never)

  const allTr: Array<Tr | undefined> = [s.tagline, s.heroTitle, s.heroSubtitle, s.about, s.officeHours,
    ...s.features.flatMap((f) => [f.title, f.text]), ...s.steps.flatMap((x) => [x.title, x.text]), ...s.testimonials.map((x) => x.text)]
  const tabs = <LangTabs lang={lang} onChange={setLang} missing={missingLangs(allTr)} enabled={s.languages} />

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { logoUrl: _l, heroImageUrl: _h, ...body } = s
      setS(await api<SiteSettings>('/api/admin/settings', {
        method: 'PUT',
        json: { ...body, partners: body.partners.map(({ imageUrl: _u, ...p }) => p) },
      }))
      reload()
      toast('Configuración guardada')
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save}>
      <div className="admin-head">
        <h1>Configuración del sitio</h1>
        <button className="btn btn--primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
      </div>
      <div className="section-tabs">
        {SECTIONS.map(([k, label]) => (
          <button type="button" key={k} className={section === k ? 'active' : ''} onClick={() => setSection(k)}>{label}</button>
        ))}
      </div>

      {section === 'general' && (
        <div className="card settings-card">
          <div className="two-col">
            <div>
              {text('name', 'Nombre comercial')}
              {text('legalName', 'Razón social')}
              {text('ruc', 'RUC')}
              <div className="two-col">
                <Field label="Color principal"><div className="color-row"><input type="color" value={s.primaryColor} onChange={(e) => set({ primaryColor: e.target.value })} /><code>{s.primaryColor}</code></div></Field>
                <Field label="Color secundario"><div className="color-row"><input type="color" value={s.accentColor} onChange={(e) => set({ accentColor: e.target.value })} /><code>{s.accentColor}</code></div></Field>
              </div>
            </div>
            <ImageInput label="Logo (PNG/SVG con fondo transparente)" folder="site" value={s.logoKey} url={s.logoUrl} aspect="3/1" onChange={(logoKey, logoUrl) => set({ logoKey, logoUrl })} />
          </div>
        </div>
      )}

      {section === 'idiomas' && (
        <div className="card settings-card narrow">
          <p className="muted">Idiomas visibles en el selector del sitio. El español siempre está activo y es el respaldo cuando falta una traducción.</p>
          {LANGS.map((l) => (
            <label key={l} className="check">
              <input type="checkbox" disabled={l === 'es'} checked={s.languages.includes(l)}
                onChange={(e) => set({ languages: e.target.checked ? LANGS.filter((x) => x === l || s.languages.includes(x)) : s.languages.filter((x) => x !== l) })} />
              {LANG_META[l].flag} {LANG_META[l].label}
            </label>
          ))}
          <Field label="Idioma por defecto" hint="Se usa cuando el navegador del visitante no coincide con ningún idioma activo">
            <select value={s.defaultLanguage} onChange={(e) => set({ defaultLanguage: e.target.value as Lang })}>
              {s.languages.map((l) => <option key={l} value={l}>{LANG_META[l].label}</option>)}
            </select>
          </Field>
        </div>
      )}

      {section === 'portada' && (
        <div className="card settings-card">
          {tabs}
          <div className="two-col">
            <div>
              <TrInput label="Eslogan" value={s.tagline} onChange={(tagline) => set({ tagline })} lang={lang} />
              <TrInput label="Título principal" value={s.heroTitle} onChange={(heroTitle) => set({ heroTitle })} lang={lang} />
              <TrInput label="Subtítulo" value={s.heroSubtitle} onChange={(heroSubtitle) => set({ heroSubtitle })} lang={lang} multiline rows={2} />
              {text('heroVideoUrl', 'Video de fondo (opcional)', 'URL directa a un archivo .mp4 o .webm. La imagen se usa mientras carga y en móviles con ahorro de datos.')}
            </div>
            <ImageInput label="Imagen de portada" folder="site" value={s.heroImageKey} url={s.heroImageUrl} onChange={(heroImageKey, heroImageUrl) => set({ heroImageKey, heroImageUrl })} />
          </div>
        </div>
      )}

      {section === 'confianza' && (
        <div className="card settings-card">
          {tabs}
          <TrInput label='Texto "¿Por qué viajar con nosotros?"' value={s.about} onChange={(about) => set({ about })} lang={lang} multiline rows={3} />
          <div className="three-col">
            {text('yearsExperience', 'Años de experiencia', undefined, 'number')}
            {text('travelersCount', 'Viajeros atendidos', undefined, 'number')}
            <Field label="Calificación promedio"><input type="number" min={0} max={5} step="0.1" value={s.ratingAverage} onChange={(e) => set({ ratingAverage: Number(e.target.value) })} /></Field>
          </div>
          {text('tripadvisorUrl', 'Enlace a TripAdvisor', 'Recomendado: enlazar las reseñas reales da más confianza que mostrarlas solo en la web')}
        </div>
      )}

      {section === 'contacto' && (
        <div className="card settings-card">
          {tabs}
          <div className="two-col">
            <div>
              {text('phone', 'Teléfono principal')}
              {text('phone2', 'Teléfono 2')}
              {text('whatsapp', 'WhatsApp', 'Solo números con código de país, ej. 51984123456')}
              {text('email', 'Correo de reservas')}
              {text('email2', 'Correo 2')}
              {text('address', 'Dirección')}
              <TrInput label="Horario de atención" value={s.officeHours} onChange={(officeHours) => set({ officeHours })} lang={lang} />
            </div>
            <div>
              {text('facebook', 'Facebook (URL)')}
              {text('instagram', 'Instagram (URL)')}
              {text('youtube', 'YouTube (URL)')}
              {text('tiktok', 'TikTok (URL)')}
              {text('mapUrl', 'Mapa (URL de inserción de Google Maps)', 'Google Maps → Compartir → Insertar un mapa → copia solo el valor de src="…"')}
            </div>
          </div>
        </div>
      )}

      {section === 'bloques' && (
        <div className="card settings-card">
          {tabs}
          <div className="admin-head">
            <h2>¿Por qué elegirnos? ({s.features.length})</h2>
            <button type="button" className="btn btn--sm" onClick={() => set({ features: [...s.features, { icon: 'star', title: {}, text: {} }] })}>+ Agregar</button>
          </div>
          <div className="blocks-grid">
            {s.features.map((f, i) => {
              const Icon = FEATURE_ICONS[f.icon]
              return (
                <div key={i} className="block-editor">
                  <div className="block-editor__head">
                    <span className="block-editor__icon">{Icon && <Icon />}</span>
                    <select value={f.icon} onChange={(e) => setArr('features', i, { icon: e.target.value })}>
                      {Object.keys(FEATURE_ICONS).map((k) => <option key={k} value={k}>{ICON_LABELS[k] ?? k}</option>)}
                    </select>
                    <button type="button" className="icon-btn" onClick={() => removeArr('features', i)}>✕</button>
                  </div>
                  <TrInput label="Título" value={f.title} onChange={(title) => setArr('features', i, { title })} lang={lang} />
                  <TrInput label="Texto" value={f.text} onChange={(t) => setArr('features', i, { text: t })} lang={lang} multiline rows={2} />
                </div>
              )
            })}
          </div>
          <div className="admin-head" style={{ marginTop: 24 }}>
            <h2>Pasos "Personaliza tu viaje" ({s.steps.length})</h2>
            <button type="button" className="btn btn--sm" onClick={() => set({ steps: [...s.steps, { title: {}, text: {} }] })}>+ Agregar</button>
          </div>
          <div className="blocks-grid">
            {s.steps.map((st, i) => (
              <div key={i} className="block-editor">
                <div className="block-editor__head"><strong>Paso {i + 1}</strong><button type="button" className="icon-btn" onClick={() => removeArr('steps', i)}>✕</button></div>
                <TrInput label="Título" value={st.title} onChange={(title) => setArr('steps', i, { title })} lang={lang} />
                <TrInput label="Texto" value={st.text} onChange={(t) => setArr('steps', i, { text: t })} lang={lang} multiline rows={2} />
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'testimonios' && (
        <div className="card settings-card">
          {tabs}
          <div className="admin-head">
            <p className="muted">Publica solo opiniones reales de clientes, con su permiso.</p>
            <button type="button" className="btn btn--sm" onClick={() => set({ testimonials: [...s.testimonials, { name: '', country: '', rating: 5, text: {} }] })}>+ Agregar</button>
          </div>
          <div className="blocks-grid">
            {s.testimonials.map((r, i) => (
              <div key={i} className="block-editor">
                <div className="three-col">
                  <input placeholder="Nombre" value={r.name} onChange={(e) => setArr('testimonials', i, { name: e.target.value })} />
                  <input placeholder="País" value={r.country} onChange={(e) => setArr('testimonials', i, { country: e.target.value })} />
                  <select value={r.rating ?? 5} onChange={(e) => setArr('testimonials', i, { rating: Number(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
                  </select>
                </div>
                <TrInput label="Opinión" value={r.text} onChange={(t) => setArr('testimonials', i, { text: t })} lang={lang} multiline rows={3} />
                <button type="button" className="btn btn--sm btn--danger-ghost" onClick={() => removeArr('testimonials', i)}>Quitar</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'aliados' && (
        <div className="card settings-card">
          <div className="admin-head">
            <p className="muted">Logos de gremios, certificaciones y plataformas (MINCETUR, PromPerú, TripAdvisor…). Usa solo los que la empresa tenga realmente.</p>
            <button type="button" className="btn btn--sm" onClick={() => set({ partners: [...s.partners, { name: '', imageKey: null, url: '' }] })}>+ Agregar</button>
          </div>
          <div className="blocks-grid">
            {s.partners.map((p, i) => (
              <div key={i} className="block-editor">
                <ImageInput label="Logo" folder="partners" value={p.imageKey} url={p.imageUrl} aspect="3/2" onChange={(imageKey, imageUrl) => setArr('partners', i, { imageKey, imageUrl })} />
                <input placeholder="Nombre" value={p.name} onChange={(e) => setArr('partners', i, { name: e.target.value })} />
                <input placeholder="Enlace (opcional)" value={p.url} onChange={(e) => setArr('partners', i, { url: e.target.value })} />
                <button type="button" className="btn btn--sm btn--danger-ghost" onClick={() => removeArr('partners', i)}>Quitar</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  )
}
