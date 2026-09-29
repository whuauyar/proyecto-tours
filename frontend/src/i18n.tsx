import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { LANGS, type Lang, type Tr } from './types'

export const LANG_META: Record<Lang, { label: string; short: string; locale: string; flag: string }> = {
  es: { label: 'Español', short: 'ES', locale: 'es-PE', flag: '🇵🇪' },
  en: { label: 'English', short: 'EN', locale: 'en-US', flag: '🇺🇸' },
  pt: { label: 'Português', short: 'PT', locale: 'pt-BR', flag: '🇧🇷' },
  zh: { label: '中文', short: '中文', locale: 'zh-CN', flag: '🇨🇳' },
}

/* Textos fijos de la interfaz. El contenido (tours, destinos…) se edita en el panel. */
const es = {
  home: 'Inicio', tours: 'Tours', destinations: 'Destinos', experiences: 'Tipos de experiencia', usefulInfo: 'Info útil',
  contact: 'Contacto', allTours: 'Todos los tours', faq: 'Preguntas frecuentes', language: 'Idioma',
  from: 'Desde', perPerson: 'por persona', child: 'Niño', adult: 'Adulto', adults: 'Adultos', children: 'Niños',
  days: 'días', day: 'día', nights: 'noches', night: 'noche', hours: 'horas', fullDay: 'Día completo',
  seeMore: 'Ver tour', bookNow: 'Reservar / consultar', reviews: 'reseñas', toursIn: 'Tours en',
  featured: 'Tours más populares', exploreDest: 'Explora nuestros destinos', whyUs: '¿Por qué viajar con nosotros?',
  years: 'años de experiencia', travelers: 'viajeros satisfechos', avgRating: 'calificación promedio', seeTripadvisor: 'Ver en TripAdvisor',
  testimonials: 'Lo que dicen nuestros viajeros', customTrip: 'Personaliza tu viaje', customTripText: 'Cuéntanos fechas, presupuesto e intereses y te enviamos una propuesta sin compromiso.',
  itinerary: 'Itinerario', includes: 'Incluye', excludes: 'No incluye', recommendations: 'Qué llevar', highlights: 'Lo más destacado',
  overview: 'Descripción', difficulty: 'Dificultad', duration: 'Duración', location: 'Ubicación', group: 'Servicio',
  facil: 'Fácil', moderada: 'Moderada', exigente: 'Exigente', compartido: 'Compartido', privado: 'Privado',
  name: 'Nombre completo', email: 'Correo electrónico', phone: 'Teléfono / WhatsApp', country: 'País',
  travelDate: 'Fecha de viaje', message: 'Mensaje', send: 'Enviar consulta', sending: 'Enviando…',
  sent: '¡Gracias! Te responderemos en menos de 24 horas.', formError: 'Revisa los datos del formulario.',
  writeUs: 'Escríbenos por WhatsApp', askTitle: '¿Tienes preguntas? Escríbenos', estimated: 'Total estimado',
  noTours: 'No encontramos tours con esos filtros.', notFound: 'Página no encontrada', back: 'Volver al inicio',
  search: '¿Qué quieres conocer?', searchBtn: 'Buscar', anyDestination: 'Todos los destinos', anyType: 'Todos los tipos',
  anyDuration: 'Cualquier duración', oneDay: 'Un día o menos', multiDay: 'Varios días',
  sortBy: 'Ordenar', sortDefault: 'Recomendados', sortPriceAsc: 'Precio: menor a mayor', sortPriceDesc: 'Precio: mayor a menor', sortDuration: 'Duración',
  related: 'También te puede interesar', loading: 'Cargando…', rights: 'Todos los derechos reservados',
  partners: 'Certificaciones y aliados', officeHours: 'Horario de atención', results: 'resultados', off: 'dcto.',
  bestOf: 'Lo mejor de',
  extendTrip: 'Extiende tu viaje: Titicaca y más',
  hello: 'Hola, me interesa el tour', helloGeneral: 'Hola, quisiera información sobre sus tours',
}
type Dict = typeof es
export type DictKey = keyof Dict

const en: Dict = {
  home: 'Home', tours: 'Tours', destinations: 'Destinations', experiences: 'Experience types', usefulInfo: 'Travel info',
  contact: 'Contact', allTours: 'All tours', faq: 'FAQ', language: 'Language',
  from: 'From', perPerson: 'per person', child: 'Child', adult: 'Adult', adults: 'Adults', children: 'Children',
  days: 'days', day: 'day', nights: 'nights', night: 'night', hours: 'hours', fullDay: 'Full day',
  seeMore: 'View tour', bookNow: 'Book / enquire', reviews: 'reviews', toursIn: 'Tours in',
  featured: 'Most popular tours', exploreDest: 'Explore our destinations', whyUs: 'Why travel with us?',
  years: 'years of experience', travelers: 'happy travelers', avgRating: 'average rating', seeTripadvisor: 'See on TripAdvisor',
  testimonials: 'What our travelers say', customTrip: 'Customize your trip', customTripText: 'Tell us your dates, budget and interests and we will send you a free proposal.',
  itinerary: 'Itinerary', includes: 'Included', excludes: 'Not included', recommendations: 'What to bring', highlights: 'Highlights',
  overview: 'Overview', difficulty: 'Difficulty', duration: 'Duration', location: 'Location', group: 'Service',
  facil: 'Easy', moderada: 'Moderate', exigente: 'Challenging', compartido: 'Shared', privado: 'Private',
  name: 'Full name', email: 'Email', phone: 'Phone / WhatsApp', country: 'Country',
  travelDate: 'Travel date', message: 'Message', send: 'Send enquiry', sending: 'Sending…',
  sent: 'Thank you! We will reply within 24 hours.', formError: 'Please check the form fields.',
  writeUs: 'Chat with us on WhatsApp', askTitle: 'Questions? Write to us', estimated: 'Estimated total',
  noTours: 'No tours match those filters.', notFound: 'Page not found', back: 'Back to home',
  search: 'Where do you want to go?', searchBtn: 'Search', anyDestination: 'All destinations', anyType: 'All types',
  anyDuration: 'Any duration', oneDay: 'One day or less', multiDay: 'Multi-day',
  sortBy: 'Sort', sortDefault: 'Recommended', sortPriceAsc: 'Price: low to high', sortPriceDesc: 'Price: high to low', sortDuration: 'Duration',
  related: 'You may also like', loading: 'Loading…', rights: 'All rights reserved',
  partners: 'Certifications & partners', officeHours: 'Office hours', results: 'results', off: 'off',
  bestOf: 'The best of',
  extendTrip: 'Extend your trip: Titicaca and more',
  hello: 'Hi, I am interested in the tour', helloGeneral: 'Hi, I would like information about your tours',
}

const pt: Dict = {
  home: 'Início', tours: 'Passeios', destinations: 'Destinos', experiences: 'Tipos de experiência', usefulInfo: 'Informações úteis',
  contact: 'Contato', allTours: 'Todos os passeios', faq: 'Perguntas frequentes', language: 'Idioma',
  from: 'A partir de', perPerson: 'por pessoa', child: 'Criança', adult: 'Adulto', adults: 'Adultos', children: 'Crianças',
  days: 'dias', day: 'dia', nights: 'noites', night: 'noite', hours: 'horas', fullDay: 'Dia inteiro',
  seeMore: 'Ver passeio', bookNow: 'Reservar / consultar', reviews: 'avaliações', toursIn: 'Passeios em',
  featured: 'Passeios mais populares', exploreDest: 'Explore nossos destinos', whyUs: 'Por que viajar conosco?',
  years: 'anos de experiência', travelers: 'viajantes satisfeitos', avgRating: 'avaliação média', seeTripadvisor: 'Ver no TripAdvisor',
  testimonials: 'O que dizem nossos viajantes', customTrip: 'Personalize sua viagem', customTripText: 'Conte-nos datas, orçamento e interesses e enviaremos uma proposta sem compromisso.',
  itinerary: 'Roteiro', includes: 'Inclui', excludes: 'Não inclui', recommendations: 'O que levar', highlights: 'Destaques',
  overview: 'Descrição', difficulty: 'Dificuldade', duration: 'Duração', location: 'Localização', group: 'Serviço',
  facil: 'Fácil', moderada: 'Moderada', exigente: 'Exigente', compartido: 'Compartilhado', privado: 'Privado',
  name: 'Nome completo', email: 'E-mail', phone: 'Telefone / WhatsApp', country: 'País',
  travelDate: 'Data da viagem', message: 'Mensagem', send: 'Enviar consulta', sending: 'Enviando…',
  sent: 'Obrigado! Responderemos em até 24 horas.', formError: 'Verifique os dados do formulário.',
  writeUs: 'Fale conosco pelo WhatsApp', askTitle: 'Tem dúvidas? Escreva para nós', estimated: 'Total estimado',
  noTours: 'Não encontramos passeios com esses filtros.', notFound: 'Página não encontrada', back: 'Voltar ao início',
  search: 'O que você quer conhecer?', searchBtn: 'Buscar', anyDestination: 'Todos os destinos', anyType: 'Todos os tipos',
  anyDuration: 'Qualquer duração', oneDay: 'Um dia ou menos', multiDay: 'Vários dias',
  sortBy: 'Ordenar', sortDefault: 'Recomendados', sortPriceAsc: 'Preço: menor para maior', sortPriceDesc: 'Preço: maior para menor', sortDuration: 'Duração',
  related: 'Você também pode gostar', loading: 'Carregando…', rights: 'Todos os direitos reservados',
  partners: 'Certificações e parceiros', officeHours: 'Horário de atendimento', results: 'resultados', off: 'desc.',
  bestOf: 'O melhor de',
  extendTrip: 'Estenda sua viagem: Titicaca e mais',
  hello: 'Olá, tenho interesse no passeio', helloGeneral: 'Olá, gostaria de informações sobre os passeios',
}

const zh: Dict = {
  home: '首页', tours: '行程', destinations: '目的地', experiences: '体验类型', usefulInfo: '旅行须知',
  contact: '联系我们', allTours: '全部行程', faq: '常见问题', language: '语言',
  from: '起价', perPerson: '每人', child: '儿童', adult: '成人', adults: '成人', children: '儿童',
  days: '天', day: '天', nights: '晚', night: '晚', hours: '小时', fullDay: '一日游',
  seeMore: '查看行程', bookNow: '预订 / 咨询', reviews: '条评价', toursIn: '行程：',
  featured: '热门行程', exploreDest: '探索目的地', whyUs: '为什么选择我们？',
  years: '年经验', travelers: '位满意游客', avgRating: '平均评分', seeTripadvisor: '在TripAdvisor查看',
  testimonials: '游客评价', customTrip: '定制您的旅程', customTripText: '告诉我们您的日期、预算和兴趣，我们将免费为您提供方案。',
  itinerary: '行程安排', includes: '费用包含', excludes: '费用不含', recommendations: '携带物品', highlights: '行程亮点',
  overview: '行程介绍', difficulty: '难度', duration: '时长', location: '地点', group: '服务类型',
  facil: '轻松', moderada: '适中', exigente: '较难', compartido: '拼团', privado: '私人',
  name: '姓名', email: '电子邮箱', phone: '电话 / WhatsApp', country: '国家',
  travelDate: '出行日期', message: '留言', send: '提交咨询', sending: '提交中…',
  sent: '谢谢！我们将在24小时内回复您。', formError: '请检查表单信息。',
  writeUs: '通过WhatsApp联系我们', askTitle: '有疑问？请给我们留言', estimated: '预估总价',
  noTours: '没有符合条件的行程。', notFound: '页面不存在', back: '返回首页',
  search: '您想去哪里？', searchBtn: '搜索', anyDestination: '全部目的地', anyType: '全部类型',
  anyDuration: '不限时长', oneDay: '一天以内', multiDay: '多日游',
  sortBy: '排序', sortDefault: '推荐', sortPriceAsc: '价格从低到高', sortPriceDesc: '价格从高到低', sortDuration: '时长',
  related: '您可能还喜欢', loading: '加载中…', rights: '版权所有',
  partners: '资质与合作伙伴', officeHours: '营业时间', results: '个结果', off: '优惠',
  bestOf: '精选 ·',
  extendTrip: '延伸您的旅程：的的喀喀湖及更多',
  hello: '您好，我想咨询行程', helloGeneral: '您好，我想了解你们的行程',
}

const DICTS: Record<Lang, Dict> = { es, en, pt, zh }

interface I18n {
  lang: Lang
  t: (k: DictKey) => string
  /** Texto traducible en el idioma actual, con respaldo en español */
  tr: <T = string>(value: Tr<T> | null | undefined) => T | undefined
  /** Antepone el idioma a una ruta interna: path('/tours') -> '/pt/tours' */
  path: (p: string) => string
  locale: string
}

const Ctx = createContext<I18n>(null!)

export function isLang(v: string | undefined): v is Lang {
  return !!v && (LANGS as readonly string[]).includes(v)
}

export function trValue<T>(value: Tr<T> | null | undefined, lang: Lang): T | undefined {
  if (!value) return undefined
  const has = (v: unknown) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)
  if (has(value[lang])) return value[lang]
  if (has(value.es)) return value.es
  return Object.values(value).find(has) as T | undefined
}

/** Carga las fuentes CJK solo cuando se usa chino */
function ensureCjkFont() {
  if (document.getElementById('font-zh')) return
  const link = document.createElement('link')
  link.id = 'font-zh'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@600;700&display=swap'
  document.head.appendChild(link)
}

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = LANG_META[lang].locale
    if (lang === 'zh') ensureCjkFont()
    try {
      localStorage.setItem('lang', lang)
    } catch {
      /* sin storage */
    }
  }, [lang])
  const value: I18n = {
    lang,
    t: (k) => DICTS[lang][k] ?? es[k],
    tr: (v) => trValue(v, lang),
    path: (p) => `/${lang}${p === '/' ? '' : p}`,
    locale: LANG_META[lang].locale,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useI18n = () => useContext(Ctx)

export function preferredLang(enabled: Lang[], fallback: Lang): Lang {
  try {
    const saved = localStorage.getItem('lang')
    if (isLang(saved ?? undefined) && enabled.includes(saved as Lang)) return saved as Lang
  } catch {
    /* sin storage */
  }
  const nav = (navigator.language || '').slice(0, 2).toLowerCase()
  return (enabled.find((l) => l === nav) ?? fallback) as Lang
}

export function formatPrice(value: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}
