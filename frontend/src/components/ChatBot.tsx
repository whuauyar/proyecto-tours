import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../api'
import { formatPrice, useI18n } from '../i18n'
import { useSite } from '../site'
import type { Faq, Tour } from '../types'
import { BOT_TEXT } from './chatbot-i18n'
import { L, useDuration, waLink } from './common'
import Img from './Img'
import { IconWhatsApp, IconX } from './Icons'

/* =====================================================================
   Asistente virtual guiado (sin IA): navega el catálogo real, responde
   preguntas frecuentes, arma una cotización paso a paso, la registra en
   "Consultas" del panel y ofrece continuar por WhatsApp.
   ===================================================================== */

type Option = { label: string; run: () => void; kind?: 'primary' | 'wa' }
type Msg = {
  id: number
  from: 'bot' | 'user'
  text?: string
  tours?: Tour[]
  node?: ReactNode
  options?: Option[]
}
type Step = 'date' | 'adults' | 'children' | 'name' | 'email' | 'phone' | 'confirm' | null
interface Quote {
  tour: Tour | null
  date: string
  adults: number
  children: number
  name: string
  email: string
  phone: string
}
const EMPTY_QUOTE: Quote = { tour: null, date: '', adults: 2, children: 0, name: '', email: '', phone: '' }

/** Minúsculas y sin tildes, para comparar textos */
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const hasCjk = (s: string) => /[㐀-鿿]/.test(s)
const allText = (v: object | undefined | null) => (v ? Object.values(v).flat().map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ') : '')

const INTENT_WA = /whats|asesor|humano|persona|agente|advisor|human|agent|consultor|atendente|顾问|人工|客服/
const INTENT_QUOTE = /cotiz|precio|cuanto cuesta|reserv|quote|price|how much|book|orcamento|preco|quanto custa|报价|价格|多少钱|预订/

let seq = 0

export default function ChatBot() {
  const { lang, tr, locale } = useI18n()
  const { site, nav } = useSite()
  const T = BOT_TEXT[lang]
  const duration = useDuration()
  const loc = useLocation()

  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [tours, setTours] = useState<Tour[] | null>(null)
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [step, setStepState] = useState<Step>(null)
  // El paso actual también vive en un ref: las opciones guardan funciones creadas antes del cambio de estado
  const stepRef = useRef<Step>(null)
  const setStep = (s: Step) => { stepRef.current = s; setStepState(s) }
  const [input, setInput] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const quote = useRef<Quote>({ ...EMPTY_QUOTE })
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Tour de la página actual (si el visitante está viendo uno)
  const slug = loc.pathname.match(/\/tour\/([^/?#]+)/)?.[1]
  const currentTour = slug ? tours?.find((x) => x.slug === slug) ?? null : null

  /* ---------- carga perezosa de datos al abrir ---------- */
  useEffect(() => {
    if (!open || tours) return
    api<Tour[]>('/api/tours').then(setTours).catch(() => setTours([]))
    api<Faq[]>('/api/faqs').then(setFaqs).catch(() => {})
  }, [open, tours])

  // Arranque / cambio de idioma: reinicia la conversación
  useEffect(() => {
    if (open && tours) start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tours, lang])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (open && step !== 'adults' && step !== 'children' && step !== 'confirm') inputRef.current?.focus()
  }, [open, step, msgs.length])

  /* ---------- utilidades de conversación ---------- */
  const bot = (m: Omit<Msg, 'id' | 'from'>) => ({ ...m, id: ++seq, from: 'bot' as const })
  const say = (...m: Omit<Msg, 'id' | 'from'>[]) => setMsgs((prev) => [...prev, ...m.map(bot)])
  const user = (text: string) => setMsgs((prev) => [...prev, { id: ++seq, from: 'user', text }])
  const choose = (label: string, fn: () => void) => () => {
    user(label)
    setTimeout(fn, 250)
  }

  const unit = (t: Tour) => (t.discountPercent ? t.offerPrice! : t.price)
  const price = (t: Tour) => formatPrice(unit(t), t.currency, locale)

  const menuOptions = (): Option[] => {
    const o: Option[] = []
    if (currentTour) o.push({ label: `${T.quoteThis}: ${tr(currentTour.title)}`, run: choose(T.menuQuote, () => startQuote(currentTour)), kind: 'primary' })
    o.push(
      { label: T.menuDest, run: choose(T.menuDest, showDestinations) },
      { label: T.menuPopular, run: choose(T.menuPopular, showPopular) },
      { label: T.menuFaq, run: choose(T.menuFaq, showFaqs) },
      { label: T.menuQuote, run: choose(T.menuQuote, () => startQuote(null)), kind: currentTour ? undefined : 'primary' },
    )
    if (site?.whatsapp) o.push({ label: T.menuWhatsapp, run: choose(T.menuWhatsapp, () => showWhatsapp()), kind: 'wa' })
    return o
  }
  const backOption = (): Option => ({ label: T.back, run: choose(T.back, () => say({ text: T.anythingElse, options: menuOptions() })) })

  function start() {
    seq = 0
    setStep(null)
    quote.current = { ...EMPTY_QUOTE }
    setMsgs([bot({ text: tr(site?.chatbotGreeting) || T.anythingElse, options: menuOptions() })])
  }

  /* ---------- catálogo ---------- */
  function showDestinations() {
    say({
      text: T.pickDest,
      options: [
        ...nav.destinations.filter((d) => (d.toursCount ?? 0) > 0).map((d) => ({
          label: `${tr(d.name)} (${d.toursCount})`,
          run: choose(tr(d.name) ?? '', () => showTours(`${T.toursOf} ${tr(d.name)}:`, (tours ?? []).filter((x) => x.destinationId === d.id))),
        })),
        backOption(),
      ],
    })
  }
  function showPopular() {
    const list = (tours ?? []).filter((x) => x.isFeatured)
    showTours(T.popularIntro, list.length ? list : (tours ?? []).slice(0, 6))
  }
  function showTours(text: string, list: Tour[]) {
    say({ text, tours: list.slice(0, 6) }, { text: T.anythingElse, options: menuOptions() })
  }

  /* ---------- preguntas frecuentes ---------- */
  function showFaqs() {
    say({
      text: T.faqIntro,
      options: [...faqs.slice(0, 8).map((f) => ({ label: tr(f.question) ?? '', run: choose(tr(f.question) ?? '', () => answerFaq(f)) })), backOption()],
    })
  }
  function answerFaq(f: Faq) {
    say({ text: tr(f.answer) }, { text: T.anythingElse, options: [{ label: T.menuFaq, run: choose(T.menuFaq, showFaqs) }, ...menuOptions().slice(0, 4)] })
  }

  /* ---------- WhatsApp ---------- */
  function waText() {
    const q = quote.current
    const lines = [T.waMsg]
    if (q.tour) lines.push(`${T.waTour}: ${tr(q.tour.title)}`)
    if (q.date) lines.push(`${T.waDate}: ${q.date}`)
    if (q.tour || q.date) lines.push(`${T.waPeople}: ${q.adults} ${T.adults}${q.children ? `, ${q.children} ${T.children}` : ''}`)
    if (q.name) lines.push(q.name)
    return lines.join('\n')
  }
  function showWhatsapp() {
    say({
      text: T.waIntro,
      node: (
        <a className="btn btn--wa btn--block" href={waLink(site?.whatsapp, waText())} target="_blank" rel="noreferrer">
          <IconWhatsApp /> {T.openWa}
        </a>
      ),
      options: [backOption()],
    })
  }

  /* ---------- cotización paso a paso ---------- */
  function startQuote(t: Tour | null) {
    quote.current = { ...EMPTY_QUOTE, tour: t }
    say({ text: T.quoteIntro + (t ? `\n${T.quoteTour}${tr(t.title)}` : '') }, { text: T.askDate, options: [{ label: T.skipDate, run: () => answer(T.skipDate, '') }] })
    setStep('date')
  }

  /** Avanza el flujo de cotización con la respuesta del visitante */
  function answer(shown: string, value: string) {
    const q = quote.current
    setHint(null)
    user(shown)
    setInput('')
    const next = (s: Step, m: Omit<Msg, 'id' | 'from'>) => setTimeout(() => { setStep(s); say(m) }, 250)
    switch (stepRef.current) {
      case 'date':
        q.date = value
        return next('adults', { text: T.askAdults, options: [1, 2, 3, 4, 5, 6].map((n) => ({ label: String(n), run: () => answerNumber('adults', n) })) })
      case 'name':
        q.name = value
        return next('email', { text: T.askEmail })
      case 'email':
        q.email = value
        return next('phone', { text: T.askPhone, options: [{ label: T.skip, run: () => answerPhoneSkip() }] })
      case 'phone':
        q.phone = value
        return setTimeout(showSummary, 250)
    }
  }
  function answerNumber(field: 'adults' | 'children', n: number) {
    user(n === 0 ? T.none : String(n))
    quote.current[field] = n
    setTimeout(() => {
      if (field === 'adults') {
        setStep('children')
        say({ text: T.askChildren, options: [0, 1, 2, 3, 4].map((c) => ({ label: c === 0 ? T.none : String(c), run: () => answerNumber('children', c) })) })
      } else {
        setStep('name')
        say({ text: T.askName })
      }
    }, 250)
  }
  function answerPhoneSkip() {
    user(T.skip)
    quote.current.phone = ''
    setTimeout(showSummary, 250)
  }

  function showSummary() {
    const q = quote.current
    setStep('confirm')
    const t = q.tour
    const total = t ? q.adults * unit(t) + q.children * (t.childPrice ?? unit(t)) : 0
    say({
      node: (
        <div className="bot-summary">
          <strong>{T.summary}</strong>
          <dl>
            <dt>{T.waTour}</dt><dd>{t ? tr(t.title) : T.generalTrip}</dd>
            <dt>{T.date}</dt><dd>{q.date || '—'}</dd>
            <dt>{T.people}</dt><dd>{q.adults} {T.adults}{q.children ? `, ${q.children} ${T.children}` : ''}</dd>
            <dt>Email</dt><dd>{q.email}</dd>
          </dl>
          {t && total > 0 && <div className="bot-summary__total"><span>{T.estimate}</span><b>{formatPrice(total, t.currency, locale)}</b></div>}
        </div>
      ),
      options: [
        { label: T.send, run: () => sendInquiry(), kind: 'primary' },
        { label: T.edit, run: choose(T.edit, () => startQuote(q.tour)) },
      ],
    })
  }

  async function sendInquiry() {
    const q = quote.current
    user(T.send)
    setStep(null)
    try {
      await api('/api/inquiries', {
        method: 'POST',
        json: {
          tourId: q.tour?.id ?? null,
          name: q.name,
          email: q.email,
          phone: q.phone || null,
          travelDate: q.date || null,
          adults: q.adults,
          children: q.children,
          locale: lang,
          message: `[Chatbot] ${q.tour ? tr(q.tour.title) : T.generalTrip}`,
        },
      })
      say({
        text: T.sent,
        options: [
          ...(site?.whatsapp ? [{ label: T.continueWa, run: () => window.open(waLink(site.whatsapp, waText()), '_blank', 'noopener'), kind: 'wa' as const }] : []),
          backOption(),
        ],
      })
    } catch {
      say({ text: T.error, options: [{ label: T.send, run: () => sendInquiry(), kind: 'primary' }, ...(site?.whatsapp ? [{ label: T.menuWhatsapp, run: choose(T.menuWhatsapp, showWhatsapp), kind: 'wa' as const }] : [])] })
    }
  }

  /* ---------- texto libre: búsqueda en tours y preguntas frecuentes ---------- */
  function search(q: string) {
    const nq = norm(q)
    if (INTENT_WA.test(nq) && site?.whatsapp) return showWhatsapp()
    const terms = hasCjk(q)
      ? Array.from({ length: Math.max(1, q.length - 1) }, (_, i) => q.slice(i, i + 2)).filter((x) => hasCjk(x))
      : nq.split(/[^a-z0-9]+/).filter((w) => w.length >= 3)
    const score = (hay: string) => terms.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0)

    const tourHits = (tours ?? [])
      .map((t) => ({ t, s: score(norm([allText(t.title), allText(t.summary), allText(t.destination?.name), allText(t.category?.name), t.location ?? ''].join(' '))) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
    const faqHits = faqs
      .map((f) => ({ f, s: score(norm(allText(f.question))) * 2 + score(norm(allText(f.answer))) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)

    const wantsQuote = INTENT_QUOTE.test(nq)
    if (wantsQuote && tourHits.length === 1) return startQuote(tourHits[0].t)
    if (wantsQuote && !tourHits.length) return startQuote(currentTour)

    if (!tourHits.length && !faqHits.length) {
      return say({
        text: T.notFound,
        options: [
          ...(site?.whatsapp ? [{ label: T.menuWhatsapp, run: choose(T.menuWhatsapp, showWhatsapp), kind: 'wa' as const }] : []),
          { label: T.leaveInquiry, run: choose(T.leaveInquiry, () => startQuote(currentTour)), kind: 'primary' },
          backOption(),
        ],
      })
    }
    const out: Omit<Msg, 'id' | 'from'>[] = []
    if (faqHits.length) out.push({ text: tr(faqHits[0].f.answer) })
    if (tourHits.length) out.push({ text: T.found, tours: tourHits.slice(0, 3).map((x) => x.t) })
    out.push({ text: T.anythingElse, options: menuOptions() })
    say(...out)
  }

  /* ---------- envío del cuadro de texto ---------- */
  function submit(e: FormEvent) {
    e.preventDefault()
    const v = input.trim()
    const st = stepRef.current
    if (st === 'date') return answer(v || T.skipDate, v)
    if (!v) return
    if (st === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setHint(T.invalidEmail)
    if (st === 'name' || st === 'email' || st === 'phone') return answer(v, v)
    user(v)
    setInput('')
    setTimeout(() => search(v), 250)
  }

  if (!site) return null

  const last = msgs[msgs.length - 1]
  const inputType = step === 'date' ? 'date' : step === 'email' ? 'email' : step === 'phone' ? 'tel' : 'text'
  const showInput = step !== 'adults' && step !== 'children' && step !== 'confirm'

  return (
    <>
      {!open && (
        <button className="bot-launcher" onClick={() => setOpen(true)} aria-label={T.open}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 5h16v11H9l-5 4z" /><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" />
          </svg>
          <span className="bot-launcher__label">{site.chatbotName}</span>
        </button>
      )}
      {open && (
        <section className="bot" role="dialog" aria-label={site.chatbotName}>
          <header className="bot__head">
            <div className="bot__avatar" aria-hidden="true">{site.chatbotName.slice(0, 1)}</div>
            <div>
              <strong>{site.chatbotName}</strong>
              <small>{T.online}</small>
            </div>
            <button className="bot__close" onClick={() => setOpen(false)} aria-label={T.close}><IconX /></button>
          </header>

          <div className="bot__log" ref={logRef} aria-live="polite">
            {!tours && <div className="bot__typing"><span /><span /><span /></div>}
            {msgs.map((m) => (
              <div key={m.id} className={`bot__msg bot__msg--${m.from}`}>
                {m.text && <p>{m.text}</p>}
                {m.node}
                {m.tours && (
                  <div className="bot-tours">
                    {m.tours.map((t) => (
                      <article key={t.id} className="bot-tour">
                        <Img src={t.coverUrl} alt="" />
                        <div>
                          <strong>{tr(t.title)}</strong>
                          <small>{duration(t)} · {T.from} <b>{price(t)}</b></small>
                          <div className="bot-tour__actions">
                            <L to={`/tour/${t.slug}`} onClick={() => setOpen(window.innerWidth > 640)}>{T.viewTour}</L>
                            <button onClick={choose(`${T.quoteThis}: ${tr(t.title)}`, () => startQuote(t))}>{T.quoteThis}</button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                {m === last && m.options && (
                  <div className="bot__options">
                    {m.options.map((o, i) => (
                      <button key={i} className={`bot__opt ${o.kind ? `bot__opt--${o.kind}` : ''}`} onClick={o.run}>{o.label}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {showInput && (
            <form className="bot__input" onSubmit={submit} noValidate>
              {hint && <div className="bot__hint">{hint}</div>}
              <input
                ref={inputRef}
                type={inputType}
                value={input}
                min={step === 'date' ? new Date().toISOString().slice(0, 10) : undefined}
                onChange={(e) => setInput(e.target.value)}
                placeholder={step === 'name' ? T.askName : step === 'email' ? 'email@…' : step === 'phone' ? '+51 …' : T.placeholder}
                aria-label={T.placeholder}
                autoComplete={step === 'name' ? 'name' : step === 'email' ? 'email' : step === 'phone' ? 'tel' : 'off'}
              />
              <button type="submit" aria-label={T.sendMsg}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 11.5 21 3l-8.5 18-2-7.5z" /></svg>
              </button>
            </form>
          )}
        </section>
      )}
    </>
  )
}
