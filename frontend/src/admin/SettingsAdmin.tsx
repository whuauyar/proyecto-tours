import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api'
import { LANG_META } from '../i18n'
import { useSite } from '../site'
import { LANGS, type Lang, type SiteSettings, type Tr } from '../types'
import { FEATURE_ICONS, INFO_ICONS } from '../components/Icons'
import { Field, FileInput, ImageInput, LangTabs, TrInput, VideoInput, missingLangs, useToast } from './ui'

const SECTIONS = [
  ['general', 'Identidad y colores'],
  ['idiomas', 'Idiomas'],
  ['portada', 'Portada'],
  ['confianza', 'Confianza y cifras'],
  ['contacto', 'Contacto'],
  ['redes', 'Redes sociales'],
  ['bloques', '¿Por qué elegirnos?'],
  ['felices', 'Pasajeros felices'],
  ['videos', 'Videos'],
  ['aliados', 'Certificaciones (PDF)'],
  ['infomenu', 'Menú Info útil'],
  ['chatbot', 'Asistente virtual'],
] as const
type Section = (typeof SECTIONS)[number][0]

const ICON_LABELS: Record<string, string> = {
  handshake: 'Apretón de manos', award: 'Medalla', smile: 'Satisfacción', users: 'Comunidad',
  guide: 'Guía', price: 'Precio', support: 'Soporte', shield: 'Seguridad', leaf: 'Sostenible',
  calendar: 'Calendario', star: 'Estrella', heart: 'Corazón', globe: 'Mundo',
}
const INFO_ICON_LABELS: Record<string, string> = {
  info: 'Información', cloud: 'Clima', ticket: 'Boleto', plane: 'Avión', firstaid: 'Emergencia',
  calendar: 'Calendario', pin: 'Ubicación', mountain: 'Montaña', star: 'Estrella', file: 'Documento',
}
const NETWORKS = ['instagram', 'facebook', 'tiktok', 'youtube']
type ListKey = 'features' | 'steps' | 'testimonials' | 'partners' | 'extraSocials' | 'socialPosts' | 'videos' | 'infoGroups'

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
  const setArr = <K extends ListKey>(k: K, i: number, patch: Partial<SiteSettings[K][number]>) =>
    set({ [k]: (s[k] as unknown[]).map((x, j) => (j === i ? { ...(x as object), ...patch } : x)) } as never)
  const removeArr = (k: ListKey, i: number) => set({ [k]: (s[k] as unknown[]).filter((_, j) => j !== i) } as never)
  const moveArr = (k: ListKey, i: number, dir: -1 | 1) => {
    const list = [...(s[k] as unknown[])]
    const j = i + dir
    if (j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    set({ [k]: list } as never)
  }
  const moveBtns = (k: ListKey, i: number) => (
    <>
      <button type="button" className="icon-btn" title="Mover antes" onClick={() => moveArr(k, i, -1)}>↑</button>
      <button type="button" className="icon-btn" title="Mover después" onClick={() => moveArr(k, i, 1)}>↓</button>
    </>
  )

  const allTr: Array<Tr | undefined> = [s.tagline, s.heroTitle, s.heroSubtitle, s.about, s.officeHours,
    s.chatbotGreeting, s.trustTitle, s.trustText, s.whyTitle, s.happyEyebrow, s.happyTitle, s.happyText, s.awardTitle, s.awardText, s.videosTitle,
    ...s.features.flatMap((f) => [f.title, f.text]), ...s.steps.flatMap((x) => [x.title, x.text]), ...s.testimonials.map((x) => x.text),
    ...s.socialPosts.map((x) => x.caption), ...s.videos.map((v) => v.title), ...s.infoGroups.map((g) => g.title)]
  const tabs = <LangTabs lang={lang} onChange={setLang} missing={missingLangs(allTr)} enabled={s.languages} />

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // El servidor ignora las URLs calculadas y guarda solo los campos conocidos
      setS(await api<SiteSettings>('/api/admin/settings', { method: 'PUT', json: s }))
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
            <div className="stack">
              <ImageInput label="Logo (PNG/SVG con fondo transparente)" folder="site" value={s.logoKey} url={s.logoUrl} aspect="3/1" onChange={(logoKey, logoUrl) => set({ logoKey, logoUrl })} />
              <ImageInput label="Ícono de la pestaña del navegador (cuadrado, 512×512 px)" folder="site" value={s.faviconKey} url={s.faviconKey ? s.faviconUrl : null} aspect="1/1" onChange={(faviconKey, faviconUrl) => set({ faviconKey, faviconUrl })} />
              <small className="muted">Si no subes un ícono, la pestaña muestra el logo.</small>
            </div>
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
            </div>
            <div className="stack">
              <ImageInput label="Imagen de portada (o GIF animado)" folder="site" value={s.heroImageKey} url={s.heroImageUrl} onChange={(heroImageKey, heroImageUrl) => set({ heroImageKey, heroImageUrl })} />
              <VideoInput url={s.heroVideoUrl} onChange={(heroVideoUrl) => set({ heroVideoUrl })} />
            </div>
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
              {text('mapUrl', 'Mapa (URL de inserción de Google Maps)', 'Google Maps → Compartir → Insertar un mapa → copia solo el valor de src="…"')}
              <p className="muted small">Las redes sociales se configuran en la pestaña "Redes sociales".</p>
            </div>
          </div>
        </div>
      )}

      {section === 'bloques' && (
        <div className="card settings-card">
          {tabs}
          <p className="muted">Sección de la portada con la pregunta de confianza y la franja de íconos. El botón "¿Por qué elegirnos?" de "Pasajeros felices" lleva aquí.</p>
          <TrInput label="Pregunta de confianza (título)" value={s.trustTitle} onChange={(trustTitle) => set({ trustTitle })} lang={lang} hint="Déjalo vacío para ocultar este bloque" />
          <TrInput label="Texto de confianza" value={s.trustText} onChange={(trustText) => set({ trustText })} lang={lang} multiline rows={3} />
          <TrInput label="Título de la franja" value={s.whyTitle} onChange={(whyTitle) => set({ whyTitle })} lang={lang} />
          <div className="admin-head">
            <h2>Íconos ({s.features.length})</h2>
            <button type="button" className="btn btn--sm" onClick={() => set({ features: [...s.features, { icon: 'star', title: {}, text: {} }] })}>+ Agregar</button>
          </div>
          <div className="blocks-grid">
            {s.features.map((f, i) => {
              const Icon = FEATURE_ICONS[f.icon]
              return (
                <div key={i} className="block-editor">
                  <div className="block-editor__head">
                    <span className="block-editor__icon">{f.imageUrl ? <img src={f.imageUrl} alt="" /> : Icon && <Icon />}</span>
                    <select value={f.icon} onChange={(e) => setArr('features', i, { icon: e.target.value })} disabled={!!f.imageKey}>
                      {Object.keys(FEATURE_ICONS).map((k) => <option key={k} value={k}>{ICON_LABELS[k] ?? k}</option>)}
                    </select>
                    {moveBtns('features', i)}
                    <button type="button" className="icon-btn" onClick={() => removeArr('features', i)}>✕</button>
                  </div>
                  <ImageInput label="Ícono propio (opcional, PNG transparente)" folder="site" value={f.imageKey ?? null} url={f.imageUrl} aspect="3/1" onChange={(imageKey, imageUrl) => setArr('features', i, { imageKey, imageUrl })} />
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

      {section === 'aliados' && (
        <div className="card settings-card">
          <div className="admin-head">
            <p className="muted">Logos de gremios y certificaciones. Si adjuntas un PDF, al hacer clic en el logo se abre la vista previa del documento. Usa solo los que la empresa tenga realmente.</p>
            <button type="button" className="btn btn--sm" onClick={() => set({ partners: [...s.partners, { name: '', imageKey: null, url: '', pdfKey: null }] })}>+ Agregar</button>
          </div>
          <div className="blocks-grid">
            {s.partners.map((p, i) => (
              <div key={i} className="block-editor">
                <ImageInput label="Logo" folder="partners" value={p.imageKey} url={p.imageUrl} aspect="3/2" onChange={(imageKey, imageUrl) => setArr('partners', i, { imageKey, imageUrl })} />
                <input placeholder="Nombre" value={p.name} onChange={(e) => setArr('partners', i, { name: e.target.value })} />
                <input placeholder="Enlace (opcional, si no hay PDF)" value={p.url} onChange={(e) => setArr('partners', i, { url: e.target.value })} />
                <FileInput label="Documento PDF (constancia, licencia…)" kind="pdf" folder="docs" value={p.pdfKey} url={p.pdfUrl} onChange={(pdfKey, pdfUrl) => setArr('partners', i, { pdfKey, pdfUrl })} />
                <div className="row-actions">{moveBtns('partners', i)}<button type="button" className="btn btn--sm btn--danger-ghost" onClick={() => removeArr('partners', i)}>Quitar</button></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'redes' && (
        <div className="card settings-card">
          <div className="two-col">
            <div>
              {text('facebook', 'Facebook (URL)')}
              {text('instagram', 'Instagram (URL)')}
              {text('youtube', 'YouTube (URL)')}
              {text('tiktok', 'TikTok (URL)')}
            </div>
            <div>
              <div className="admin-head">
                <h2>Otras redes ({s.extraSocials.length})</h2>
                <button type="button" className="btn btn--sm" onClick={() => set({ extraSocials: [...s.extraSocials, { name: '', url: '', imageKey: null }] })}>+ Agregar</button>
              </div>
              <p className="muted small">LinkedIn, Pinterest, X, TripAdvisor… Sube el ícono (PNG cuadrado) y el enlace. Aparecen en la barra superior y en el pie de página.</p>
              {s.extraSocials.map((x, i) => (
                <div key={i} className="block-editor social-editor">
                  <ImageInput label="Ícono" folder="site" value={x.imageKey} url={x.imageUrl} aspect="1/1" onChange={(imageKey, imageUrl) => setArr('extraSocials', i, { imageKey, imageUrl })} />
                  <div className="stack">
                    <input placeholder="Nombre (ej. LinkedIn)" value={x.name} onChange={(e) => setArr('extraSocials', i, { name: e.target.value })} />
                    <input placeholder="https://…" value={x.url} onChange={(e) => setArr('extraSocials', i, { url: e.target.value })} />
                    <div className="row-actions">{moveBtns('extraSocials', i)}<button type="button" className="btn btn--sm btn--danger-ghost" onClick={() => removeArr('extraSocials', i)}>Quitar</button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === 'felices' && (
        <div className="card settings-card">
          {tabs}
          <div className="two-col">
            <div>
              <TrInput label="Antetítulo" value={s.happyEyebrow} onChange={(happyEyebrow) => set({ happyEyebrow })} lang={lang} />
              <TrInput label="Título" value={s.happyTitle} onChange={(happyTitle) => set({ happyTitle })} lang={lang} hint="Déjalo vacío para ocultar la sección" />
              <TrInput label="Texto" value={s.happyText} onChange={(happyText) => set({ happyText })} lang={lang} multiline rows={6} hint="Separa párrafos con una línea en blanco" />
            </div>
            <div>
              <ImageInput label="Sello o premio (ej. Travelers' Choice)" folder="site" value={s.awardImageKey} url={s.awardImageUrl} aspect="1/1" onChange={(awardImageKey, awardImageUrl) => set({ awardImageKey, awardImageUrl })} />
              <TrInput label="Nombre del premio" value={s.awardTitle} onChange={(awardTitle) => set({ awardTitle })} lang={lang} />
              <TrInput label="Detalle (ej. 5 de 5 en 1 500 opiniones)" value={s.awardText} onChange={(awardText) => set({ awardText })} lang={lang} />
              {text('awardUrl', 'Enlace del premio (opcional)')}
            </div>
          </div>
          <div className="admin-head" style={{ marginTop: 16 }}>
            <h2>Publicaciones de redes ({s.socialPosts.length})</h2>
            <button type="button" className="btn btn--sm" onClick={() => set({ socialPosts: [...s.socialPosts, { imageKey: null, network: 'instagram', account: '', caption: {}, url: '' }] })}>+ Agregar</button>
          </div>
          <p className="muted small">Se muestran como una tarjeta de Instagram que rota cada 5 segundos; al hacer clic abre la publicación en la red social.</p>
          <div className="blocks-grid">
            {s.socialPosts.map((x, i) => (
              <div key={i} className="block-editor">
                <ImageInput label="Foto" folder="social" value={x.imageKey} url={x.imageUrl} aspect="1/1" onChange={(imageKey, imageUrl) => setArr('socialPosts', i, { imageKey, imageUrl })} />
                <div className="two-col">
                  <select value={x.network} onChange={(e) => setArr('socialPosts', i, { network: e.target.value })}>
                    {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <input placeholder="Cuenta (ej. gomachupicchuperu)" value={x.account} onChange={(e) => setArr('socialPosts', i, { account: e.target.value })} />
                </div>
                <input placeholder="Enlace a la publicación" value={x.url} onChange={(e) => setArr('socialPosts', i, { url: e.target.value })} />
                <TrInput label="Texto de la publicación" value={x.caption} onChange={(caption) => setArr('socialPosts', i, { caption })} lang={lang} />
                <div className="row-actions">{moveBtns('socialPosts', i)}<button type="button" className="btn btn--sm btn--danger-ghost" onClick={() => removeArr('socialPosts', i)}>Quitar</button></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'videos' && (
        <div className="card settings-card">
          {tabs}
          <TrInput label="Título de la sección" value={s.videosTitle} onChange={(videosTitle) => set({ videosTitle })} lang={lang} />
          <div className="admin-head">
            <p className="muted">Hasta 20 videos cortos verticales. En la portada se ven 4 por página en carrusel. Recomendado: MP4, menos de 15 MB y menos de 60 s.</p>
            <button type="button" className="btn btn--sm" disabled={s.videos.length >= 20} onClick={() => set({ videos: [...s.videos, { videoKey: null, posterKey: null, title: {} }] })}>+ Agregar ({s.videos.length}/20)</button>
          </div>
          <div className="blocks-grid blocks-grid--videos">
            {s.videos.map((v, i) => (
              <div key={i} className="block-editor">
                <div className="block-editor__head"><strong>Video {i + 1}</strong>{moveBtns('videos', i)}<button type="button" className="icon-btn" onClick={() => removeArr('videos', i)}>✕</button></div>
                <FileInput label="Video" kind="video" folder="videos" value={v.videoKey} url={v.videoUrl} poster={v.posterUrl} onChange={(videoKey, videoUrl) => setArr('videos', i, { videoKey, videoUrl })} />
                <ImageInput label="Portada (opcional)" folder="videos" value={v.posterKey} url={v.posterUrl} aspect="9/16" onChange={(posterKey, posterUrl) => setArr('videos', i, { posterKey, posterUrl })} />
                <TrInput label="Título (opcional)" value={v.title} onChange={(title) => setArr('videos', i, { title })} lang={lang} />
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'infomenu' && (
        <div className="card settings-card">
          {tabs}
          <div className="admin-head">
            <p className="muted">Columnas del menú "Info útil". Cada página se asigna a un grupo en Páginas "Info útil". Las páginas marcadas como destacadas se muestran con imagen a la derecha.</p>
            <button type="button" className="btn btn--sm" onClick={() => set({ infoGroups: [...s.infoGroups, { key: `grupo-${s.infoGroups.length + 1}`, icon: 'info', title: {} }] })}>+ Agregar grupo</button>
          </div>
          <div className="blocks-grid">
            {s.infoGroups.map((g, i) => {
              const Icon = INFO_ICONS[g.icon]
              return (
                <div key={i} className="block-editor">
                  <div className="block-editor__head">
                    <span className="block-editor__icon">{Icon && <Icon />}</span>
                    <select value={g.icon} onChange={(e) => setArr('infoGroups', i, { icon: e.target.value })}>
                      {Object.keys(INFO_ICONS).map((k) => <option key={k} value={k}>{INFO_ICON_LABELS[k] ?? k}</option>)}
                    </select>
                    {moveBtns('infoGroups', i)}
                    <button type="button" className="icon-btn" onClick={() => removeArr('infoGroups', i)}>✕</button>
                  </div>
                  <TrInput label="Título" value={g.title} onChange={(title) => setArr('infoGroups', i, { title })} lang={lang} />
                  <Field label="Clave interna" hint="Identifica al grupo; si la cambias, reasigna sus páginas"><input value={g.key} onChange={(e) => setArr('infoGroups', i, { key: e.target.value })} /></Field>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {section === 'chatbot' && (
        <div className="card settings-card narrow">
          {tabs}
          <label className="check"><input type="checkbox" checked={s.chatbotEnabled} onChange={(e) => set({ chatbotEnabled: e.target.checked })} /> Mostrar el asistente en el sitio</label>
          <p className="muted small">Si lo desactivas, vuelve el botón flotante de WhatsApp.</p>
          {text('chatbotName', 'Nombre del asistente')}
          <TrInput label="Saludo inicial" value={s.chatbotGreeting} onChange={(chatbotGreeting) => set({ chatbotGreeting })} lang={lang} multiline rows={2} />
          <p className="muted small">El asistente responde con los tours, precios y preguntas frecuentes publicados. Las cotizaciones que arma llegan a "Consultas" con la etiqueta [Chatbot].</p>
        </div>
      )}
    </form>
  )
}
