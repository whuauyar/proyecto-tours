import { DateTime } from 'luxon'
import env from '#start/env'
import Tour from '#models/tour'
import Destination from '#models/destination'
import Faq from '#models/faq'
import Inquiry from '#models/inquiry'
import WhatsappSession, { type WaState } from '#models/whatsapp_session'
import { getSite } from '#services/site_settings'
import { LANGS, trText, type Lang } from '#services/i18n'
import { DEST_PRIORITY } from '#controllers/public_controller'
import { wa, type Row } from './client.js'
import { WA_TEXT, guessLang } from './texts.js'

/* =====================================================================
   Bot de WhatsApp: misma lógica que el asistente web (menú, catálogo,
   preguntas frecuentes, cotización → Consultas, derivación a asesor).
   ===================================================================== */

export interface Incoming {
  waId: string
  messageId: string
  profileName?: string
  text?: string // mensaje escrito
  replyId?: string // id del botón o fila elegida
}

const LOCALES: Record<Lang, string> = { es: 'es-PE', en: 'en-US', pt: 'pt-BR', zh: 'zh-CN' }
const DUR: Record<Lang, { h: string; d: string; n: string; full: string }> = {
  es: { h: 'horas', d: 'días', n: 'noches', full: 'Día completo' },
  en: { h: 'hours', d: 'days', n: 'nights', full: 'Full day' },
  pt: { h: 'horas', d: 'dias', n: 'noites', full: 'Dia inteiro' },
  zh: { h: '小时', d: '天', n: '晚', full: '一日游' },
}
const MENU_WORDS = /^(menu|menú|inicio|start|hola|hello|hi|ola|olá|oi|buenas|菜单|你好|开始)(?=$|[\s!.,?¡¿])/iu
const AGENT_WORDS = /asesor|humano|persona|agente|advisor|human|agent|consultor|atendente|顾问|人工|客服/i
const QUOTE_WORDS = /cotiz|precio|cuanto cuesta|reserv|quote|price|how much|book|orcamento|orçamento|preco|preço|报价|价格|多少钱|预订/i

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const allText = (v: unknown) => (v && typeof v === 'object' ? Object.values(v).flat().map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ') : '')
const siteUrl = () => (env.get('SITE_URL') || '').replace(/\/$/, '')

const unit = (t: Tour) => (t.offerPrice !== null && t.offerPrice < t.price ? t.offerPrice : t.price)
const money = (n: number, cur: string, lang: Lang) =>
  new Intl.NumberFormat(LOCALES[lang], { style: 'currency', currency: cur, maximumFractionDigits: n % 1 === 0 ? 0 : 2 }).format(n)
const duration = (t: Tour, lang: Lang) => {
  const w = DUR[lang]
  if (t.durationDays === 1 && t.durationHours) return `${t.durationHours} ${w.h}`
  if (t.durationDays === 1 && !t.durationNights) return w.full
  return `${t.durationDays} ${w.d}${t.durationNights ? ` / ${t.durationNights} ${w.n}` : ''}`
}

/** Fecha dd/mm/aaaa, dd-mm-aaaa o aaaa-mm-dd; debe ser hoy o futura */
function parseDate(s: string): string | null {
  const m = s.trim().match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/) || null
  let d: DateTime | null = null
  if (m) d = DateTime.fromObject({ day: +m[1], month: +m[2], year: m[3].length === 2 ? 2000 + +m[3] : +m[3] })
  else if (/^\d{4}-\d{2}-\d{2}$/.test(s.trim())) d = DateTime.fromISO(s.trim())
  if (!d || !d.isValid || d < DateTime.now().startOf('day')) return null
  return d.toISODate()
}

export async function handleIncoming(msg: Incoming) {
  // Sesión (una por número) y deduplicación: Meta puede reenviar el mismo mensaje
  let session = await WhatsappSession.find(msg.waId)
  if (session?.lastMessageId === msg.messageId) return
  const isNew = !session
  if (!session) {
    session = new WhatsappSession()
    session.waId = msg.waId
    session.lang = guessLang(msg.text ?? '')
    session.state = {}
  }
  session.lastMessageId = msg.messageId
  if (msg.profileName) session.name = msg.profileName

  const text = (msg.text ?? '').trim()
  const id = msg.replyId ?? ''

  // Modo asesor: el bot calla hasta que el cliente escriba "menú" o pasen 24 h
  if (session.humanUntil && session.humanUntil > DateTime.now() && !MENU_WORDS.test(text) && id !== 'menu') {
    await session.save()
    return
  }
  if (MENU_WORDS.test(text) || id === 'menu') session.humanUntil = null

  const bot = new Bot(session)
  await wa.markRead(msg.messageId).catch(() => {})
  try {
    if (isNew || MENU_WORDS.test(text) || id === 'menu') await bot.menu(true)
    else if (id) await bot.onReply(id)
    else await bot.onText(text)
  } finally {
    await session.save()
  }
}

class Bot {
  constructor(private s: WhatsappSession) {}

  get lang() { return this.s.lang }
  get T() { return WA_TEXT[this.s.lang] }
  get to() { return this.s.waId }
  get st(): WaState { return this.s.state ?? {} }
  set st(v: WaState) { this.s.state = { ...v } }

  /* ---------- menú principal ---------- */
  async menu(greet = false) {
    this.st = {}
    const site = await getSite()
    const T = this.T
    const body = greet ? T.greet(this.s.name?.split(' ')[0] ?? '', site.chatbotName || 'Inti', site.name) : T.anything
    await wa.list(this.to, body, T.menuBtn, [
      { id: 'menu:dest', title: T.mDest },
      { id: 'menu:popular', title: T.mPopular },
      { id: 'menu:faq', title: T.mFaq },
      { id: 'menu:quote', title: T.mQuote },
      { id: 'menu:agent', title: T.mAgent },
      { id: 'menu:lang', title: T.mLang },
    ], T.menuTitle)
  }

  /* ---------- respuestas a botones y listas ---------- */
  async onReply(id: string) {
    const [kind, arg] = id.split(':')
    switch (kind) {
      case 'menu':
        if (arg === 'dest') return this.destinations()
        if (arg === 'popular') return this.popular()
        if (arg === 'faq') return this.faqs()
        if (arg === 'quote') return this.startQuote(null)
        if (arg === 'agent') return this.agent()
        if (arg === 'lang') return this.pickLang()
        return this.menu()
      case 'lang':
        if ((LANGS as readonly string[]).includes(arg)) this.s.lang = arg as Lang
        return this.menu(true)
      case 'dest': return this.toursOf(Number(arg))
      case 'tour': return this.tourDetail(Number(arg))
      case 'faq': return this.faqAnswer(Number(arg))
      case 'quote': return this.startQuote(Number(arg) || null)
      case 'date': return this.afterDate('')
      case 'adults': return this.afterAdults(Number(arg))
      case 'children': return this.afterChildren(Number(arg))
      case 'name':
        if (arg === 'yes') return this.askEmail()
        this.st = { ...this.st, step: 'name' }
        return wa.text(this.to, this.T.typeName)
      case 'email': return this.summary('')
      case 'confirm':
        if (arg === 'send') return this.sendInquiry()
        return this.startQuote(this.st.tourId ?? null)
    }
    return this.menu()
  }

  /* ---------- texto libre (o respuesta a un paso de la cotización) ---------- */
  async onText(text: string) {
    const T = this.T
    switch (this.st.step) {
      case 'date': {
        const d = parseDate(text)
        if (!d) return wa.buttons(this.to, T.badDate, [{ id: 'date:skip', title: T.noDate }])
        return this.afterDate(d)
      }
      case 'adults':
      case 'children': {
        const n = Number.parseInt(text, 10)
        if (Number.isFinite(n) && n >= 0 && n <= 50) return this.st.step === 'adults' ? this.afterAdults(Math.max(1, n)) : this.afterChildren(n)
        break
      }
      case 'name':
        if (text.length >= 2) { this.st = { ...this.st, name: text.slice(0, 150) }; return this.askEmail() }
        return wa.text(this.to, T.typeName)
      case 'email':
        if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text)) return this.summary(text.slice(0, 254))
        return wa.buttons(this.to, T.badEmail, [{ id: 'email:skip', title: T.skip }])
    }
    if (AGENT_WORDS.test(text)) return this.agent()
    return this.search(text)
  }

  /* ---------- catálogo ---------- */
  async destinations() {
    const T = this.T
    const dests = await Destination.query().where('is_active', true).orderBy('sort_order').withCount('tours', (q) => q.where('is_active', true))
    const rows: Row[] = dests.filter((d) => Number(d.$extras.tours_count) > 0)
      .map((d) => ({ id: `dest:${d.id}`, title: trText(d.name, this.lang), description: `${d.$extras.tours_count} tours · ${trText(d.summary, this.lang)}` }))
    return wa.list(this.to, T.pickDest, T.destBtn, rows, T.mDest)
  }

  private tourRows(tours: Tour[]): Row[] {
    return tours.slice(0, 10).map((t) => ({
      id: `tour:${t.id}`,
      title: trText(t.title, this.lang),
      description: `${duration(t, this.lang)} · ${this.T.from} ${money(unit(t), t.currency, this.lang)}`,
    }))
  }

  async toursOf(destId: number) {
    const d = await Destination.find(destId)
    const tours = await Tour.query().where('is_active', true).where('destination_id', destId).orderBy('is_featured', 'desc').orderBy('sort_order')
    if (!d || !tours.length) return this.menu()
    return wa.list(this.to, this.T.toursIn(trText(d.name, this.lang)), this.T.toursBtn, this.tourRows(tours), trText(d.name, this.lang))
  }

  async popular() {
    let tours = await Tour.query().where('is_active', true).where('is_featured', true).orderByRaw(DEST_PRIORITY).orderBy('sort_order')
    if (!tours.length) tours = await Tour.query().where('is_active', true).orderBy('sort_order').limit(10)
    return wa.list(this.to, this.T.popular, this.T.toursBtn, this.tourRows(tours), this.T.mPopular)
  }

  async tourDetail(tourId: number) {
    const t = await Tour.query().where('id', tourId).where('is_active', true).first()
    if (!t) return this.menu()
    const T = this.T
    const link = siteUrl() ? `\n\n${T.viewOnline}: ${siteUrl()}/${this.lang}/tour/${t.slug}` : ''
    const body = `*${trText(t.title, this.lang)}*\n${trText(t.summary, this.lang)}\n\n${duration(t, this.lang)} · ${T.from} *${money(unit(t), t.currency, this.lang)}*${link}`
    return wa.buttons(this.to, body, [
      { id: `quote:${t.id}`, title: T.bQuote },
      { id: 'menu:agent', title: T.bAgent },
      { id: 'menu', title: T.bMenu },
    ])
  }

  /* ---------- preguntas frecuentes ---------- */
  async faqs() {
    const T = this.T
    const faqs = await Faq.query().whereNull('tour_id').where('is_active', true).orderBy('sort_order').limit(10)
    // El título de fila admite 24 caracteres: la pregunta completa va en la descripción
    const rows = faqs.map((f, i) => ({ id: `faq:${f.id}`, title: `${T.question} ${i + 1}`, description: trText(f.question, this.lang) }))
    return wa.list(this.to, T.faqIntro, T.faqBtn, rows, T.mFaq)
  }

  async faqAnswer(faqId: number) {
    const f = await Faq.find(faqId)
    if (!f) return this.menu()
    await wa.text(this.to, `*${trText(f.question, this.lang)}*\n${trText(f.answer, this.lang)}`)
    return this.menu()
  }

  /* ---------- cotización ---------- */
  async startQuote(tourId: number | null) {
    const T = this.T
    const t = tourId ? await Tour.find(tourId) : null
    this.st = { step: 'date', tourId: t?.id ?? null, adults: 2, children: 0 }
    await wa.text(this.to, T.qIntro(t ? trText(t.title, this.lang) : ''))
    return wa.buttons(this.to, T.askDate, [{ id: 'date:skip', title: T.noDate }])
  }

  async afterDate(date: string) {
    this.st = { ...this.st, date, step: 'adults' }
    const T = this.T
    return wa.list(this.to, T.askAdults, T.adultsBtn, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ id: `adults:${n}`, title: String(n) })), T.adults)
  }

  async afterAdults(n: number) {
    this.st = { ...this.st, adults: n, step: 'children' }
    const T = this.T
    return wa.list(this.to, T.askChildren, T.adultsBtn, [0, 1, 2, 3, 4, 5, 6].map((c) => ({ id: `children:${c}`, title: c === 0 ? T.none : String(c) })), T.children)
  }

  async afterChildren(n: number) {
    this.st = { ...this.st, children: n }
    const T = this.T
    if (this.s.name) {
      this.st = { ...this.st, name: this.s.name, step: 'name' }
      return wa.buttons(this.to, T.askName(this.s.name), [{ id: 'name:yes', title: T.yesName }, { id: 'name:other', title: T.otherName }])
    }
    this.st = { ...this.st, step: 'name' }
    return wa.text(this.to, T.typeName)
  }

  async askEmail() {
    this.st = { ...this.st, step: 'email' }
    return wa.buttons(this.to, this.T.askEmail, [{ id: 'email:skip', title: this.T.skip }])
  }

  async summary(email: string) {
    this.st = { ...this.st, email, step: 'confirm' }
    const T = this.T
    const q = this.st
    const t = q.tourId ? await Tour.find(q.tourId) : null
    const adults = q.adults ?? 2
    const children = q.children ?? 0
    const total = t ? adults * unit(t) + children * (t.childPrice ?? unit(t)) : 0
    const lines = [
      `*${T.summary}*`,
      `${T.tour}: ${t ? trText(t.title, this.lang) : T.custom}`,
      `${T.date}: ${q.date || '—'}`,
      `${T.travelers}: ${adults} ${T.adults}${children ? `, ${children} ${T.children}` : ''}`,
      `Email: ${email || '—'}`,
      ...(t && total ? [`${T.estimate}: *${money(total, t.currency, this.lang)}*`] : []),
    ]
    return wa.buttons(this.to, lines.join('\n'), [
      { id: 'confirm:send', title: T.send },
      { id: 'confirm:restart', title: T.restart },
      { id: 'menu:agent', title: T.bAgent },
    ])
  }

  async sendInquiry() {
    const q = this.st
    const t = q.tourId ? await Tour.find(q.tourId) : null
    await Inquiry.create({
      tourId: t?.id ?? null,
      name: q.name || this.s.name || `WhatsApp ${this.to}`,
      email: q.email || '',
      phone: `+${this.to}`,
      travelDate: q.date ? DateTime.fromISO(q.date) : null,
      adults: q.adults ?? 2,
      children: q.children ?? 0,
      message: `[WhatsApp] ${t ? trText(t.title, 'es') : 'Viaje a medida'}`,
      locale: this.lang,
      status: 'nuevo',
    })
    this.st = {}
    // Tras registrar la consulta, el asesor continúa la conversación
    this.s.humanUntil = DateTime.now().plus({ hours: 24 })
    return wa.text(this.to, this.T.sent)
  }

  /* ---------- asesor humano ---------- */
  async agent() {
    this.st = {}
    this.s.humanUntil = DateTime.now().plus({ hours: 24 })
    await Inquiry.create({
      tourId: null,
      name: this.s.name || `WhatsApp ${this.to}`,
      email: '',
      phone: `+${this.to}`,
      travelDate: null,
      adults: 1,
      children: 0,
      message: '[WhatsApp] Pide hablar con un asesor',
      locale: this.lang,
      status: 'nuevo',
    })
    return wa.text(this.to, this.T.agent)
  }

  async pickLang() {
    return wa.list(this.to, this.T.langPick, 'Idioma', [
      { id: 'lang:es', title: 'Español' },
      { id: 'lang:en', title: 'English' },
      { id: 'lang:pt', title: 'Português' },
      { id: 'lang:zh', title: '中文' },
    ], 'Idioma / Language')
  }

  /* ---------- búsqueda en tours y preguntas frecuentes ---------- */
  async search(q: string) {
    const T = this.T
    const nq = norm(q)
    const cjk = /[㐀-鿿]/.test(q)
    const terms = cjk
      ? Array.from({ length: Math.max(1, q.length - 1) }, (_, i) => q.slice(i, i + 2)).filter((x) => /[㐀-鿿]/.test(x))
      : nq.split(/[^a-z0-9]+/).filter((w) => w.length >= 3)
    const score = (hay: string) => terms.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0)

    const tours = await Tour.query().where('is_active', true).preload('destination').preload('category')
    const tourHits = tours
      .map((t) => ({ t, s: score(norm([allText(t.title), allText(t.summary), allText(t.destination?.name), allText(t.category?.name), t.location ?? ''].join(' '))) }))
      .filter((x) => x.s > 0).sort((a, b) => b.s - a.s)
    const faqs = await Faq.query().whereNull('tour_id').where('is_active', true)
    const faqHits = faqs
      .map((f) => ({ f, s: score(norm(allText(f.question))) * 2 + score(norm(allText(f.answer))) }))
      .filter((x) => x.s > 0).sort((a, b) => b.s - a.s)

    if (QUOTE_WORDS.test(nq)) return this.startQuote(tourHits.length === 1 ? tourHits[0].t.id : null)
    if (!tourHits.length && !faqHits.length) {
      return wa.buttons(this.to, T.notFound, [{ id: 'menu:agent', title: T.bAgent }, { id: 'menu', title: T.bMenu }])
    }
    if (faqHits.length) await wa.text(this.to, trText(faqHits[0].f.answer, this.lang))
    if (tourHits.length) return wa.list(this.to, T.found, T.toursBtn, this.tourRows(tourHits.slice(0, 5).map((x) => x.t)), T.found.slice(0, 24))
    return this.menu()
  }
}
