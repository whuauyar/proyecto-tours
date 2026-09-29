import Setting from '#models/setting'
import { mediaUrl } from '#services/media'
import { LANGS, type Lang, type Tr } from '#services/i18n'

export interface SiteSettings {
  // Identidad
  name: string
  legalName: string
  ruc: string
  logoKey: string | null
  primaryColor: string
  accentColor: string
  // Idiomas
  languages: Lang[]
  defaultLanguage: Lang
  // Portada
  tagline: Tr
  heroImageKey: string | null
  heroVideoUrl: string
  heroTitle: Tr
  heroSubtitle: Tr
  // Confianza
  about: Tr
  yearsExperience: number
  travelersCount: number
  ratingAverage: number
  tripadvisorUrl: string
  // Contacto
  phone: string
  phone2: string
  whatsapp: string
  email: string
  email2: string
  address: string
  mapUrl: string
  officeHours: Tr
  facebook: string
  instagram: string
  youtube: string
  tiktok: string
  // Bloques de la portada
  features: Array<{ icon: string; title: Tr; text: Tr }>
  steps: Array<{ title: Tr; text: Tr }>
  testimonials: Array<{ name: string; country: string; rating: number; text: Tr }>
  partners: Array<{ name: string; imageKey: string | null; url: string }>
}

const t = (es: string, en: string, pt: string, zh: string): Tr => ({ es, en, pt, zh })

export const DEFAULT_SITE: SiteSettings = {
  name: 'Andes & Titicaca Travel',
  legalName: 'Andes & Titicaca Travel E.I.R.L.',
  ruc: '',
  logoKey: null,
  primaryColor: '#b4532a',
  accentColor: '#1f5f7a',
  languages: [...LANGS],
  defaultLanguage: 'es',
  tagline: t('Agencia de viajes en Cusco', 'Travel agency in Cusco', 'Agência de viagens em Cusco', '库斯科旅行社'),
  heroImageKey: null,
  heroVideoUrl: '',
  heroTitle: t(
    'Cusco y Machu Picchu, a tu manera',
    'Cusco & Machu Picchu, your way',
    'Cusco e Machu Picchu, do seu jeito',
    '库斯科与马丘比丘，随心而行'
  ),
  heroSubtitle: t(
    'Experiencias auténticas con guías locales, en grupo o privadas',
    'Authentic experiences with local guides, shared or private',
    'Experiências autênticas com guias locais, em grupo ou privadas',
    '本地导游带您体验地道之旅，拼团或私人定制'
  ),
  about: t(
    'Somos operadores locales en Cusco y Puno. Diseñamos cada viaje con guías de la zona y proveedores de confianza.',
    'We are local operators in Cusco and Puno. We design every trip with local guides and trusted suppliers.',
    'Somos operadores locais em Cusco e Puno. Planejamos cada viagem com guias da região e fornecedores de confiança.',
    '我们是库斯科和普诺的本地旅行运营商，每一次旅程都由当地导游和可靠的合作伙伴共同打造。'
  ),
  yearsExperience: 10,
  travelersCount: 5000,
  ratingAverage: 4.8,
  tripadvisorUrl: '',
  phone: '+51 984 000 000',
  phone2: '',
  whatsapp: '51984000000',
  email: 'reservas@ejemplo.pe',
  email2: '',
  address: 'Cusco, Perú',
  mapUrl: '',
  officeHours: t('Lun a Sáb 8:00 – 20:00', 'Mon to Sat 8:00 – 20:00', 'Seg a Sáb 8:00 – 20:00', '周一至周六 8:00 – 20:00'),
  facebook: '',
  instagram: '',
  youtube: '',
  tiktok: '',
  features: [
    { icon: 'guide', title: t('Guías locales', 'Local guides', 'Guias locais', '本地导游'), text: t('Guías certificados nacidos en la región.', 'Certified guides born in the region.', 'Guias certificados nascidos na região.', '当地出生的持证导游。') },
    { icon: 'price', title: t('Precio directo', 'Direct price', 'Preço direto', '直销价格'), text: t('Sin intermediarios: reservas con el operador.', 'No middlemen: book with the operator.', 'Sem intermediários: reserve com o operador.', '无中间商，直接向运营商预订。') },
    { icon: 'support', title: t('Atención 24/7', '24/7 support', 'Atendimento 24/7', '全天候服务'), text: t('Te acompañamos antes y durante el viaje.', 'We support you before and during your trip.', 'Acompanhamos você antes e durante a viagem.', '旅行前后全程为您服务。') },
    { icon: 'shield', title: t('Viaje seguro', 'Safe travel', 'Viagem segura', '安全出行'), text: t('Transporte formal y seguros de viaje.', 'Licensed transport and travel insurance.', 'Transporte formal e seguro-viagem.', '正规交通与旅行保险。') },
    { icon: 'leaf', title: t('Turismo responsable', 'Responsible tourism', 'Turismo responsável', '负责任旅游'), text: t('Trabajamos con comunidades locales.', 'We work with local communities.', 'Trabalhamos com comunidades locais.', '与当地社区合作。') },
    { icon: 'calendar', title: t('Salidas diarias', 'Daily departures', 'Saídas diárias', '每日出发'), text: t('Fechas flexibles todo el año.', 'Flexible dates all year round.', 'Datas flexíveis o ano todo.', '全年灵活安排日期。') },
  ],
  steps: [
    { title: t('Elige', 'Choose', 'Escolha', '选择'), text: t('Explora destinos y tours.', 'Explore destinations and tours.', 'Explore destinos e passeios.', '浏览目的地和行程。') },
    { title: t('Personaliza', 'Customize', 'Personalize', '定制'), text: t('Cuéntanos fechas y preferencias.', 'Tell us your dates and preferences.', 'Conte suas datas e preferências.', '告诉我们您的日期和偏好。') },
    { title: t('Disfruta', 'Enjoy', 'Aproveite', '享受'), text: t('Nosotros nos encargamos del resto.', 'We take care of the rest.', 'Nós cuidamos do resto.', '其余的交给我们。') },
  ],
  testimonials: [],
  partners: [],
}

export async function getSite(): Promise<SiteSettings> {
  const row = await Setting.find('site')
  return { ...DEFAULT_SITE, ...(row?.value ?? {}) }
}

export async function saveSite(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const value = { ...(await getSite()), ...data }
  await Setting.updateOrCreate({ key: 'site' }, { key: 'site', value })
  return value
}

export function withUrls(site: SiteSettings) {
  return {
    ...site,
    logoUrl: mediaUrl(site.logoKey),
    heroImageUrl: mediaUrl(site.heroImageKey),
    partners: site.partners.map((p) => ({ ...p, imageUrl: mediaUrl(p.imageKey) })),
  }
}
