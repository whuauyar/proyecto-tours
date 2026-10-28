import env from '#start/env'
import Setting from '#models/setting'
import { mediaUrl } from '#services/media'
import { LANGS, type Lang, type Tr } from '#services/i18n'

export interface SiteSettings {
  // Identidad
  name: string
  legalName: string
  ruc: string
  logoKey: string | null
  /** Icono de la pestaña del navegador (si falta se usa el logo) */
  faviconKey: string | null
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
  /** Otras redes: el icono es una imagen subida en el panel */
  extraSocials: Array<{ name: string; url: string; imageKey: string | null }>
  // Bloques de la portada
  /** Sección "¿Es una agencia confiable?" + "¿Por qué viajar con nosotros?" */
  trustTitle: Tr
  trustText: Tr
  whyTitle: Tr
  features: Array<{ icon: string; imageKey?: string | null; title: Tr; text: Tr }>
  /** Sección "Pasajeros felices" con publicaciones de redes sociales */
  happyEyebrow: Tr
  happyTitle: Tr
  happyText: Tr
  awardImageKey: string | null
  awardTitle: Tr
  awardText: Tr
  awardUrl: string
  socialPosts: Array<{ imageKey: string | null; network: string; account: string; caption: Tr; url: string }>
  /** Videos cortos (máx. 20) en carrusel de 4 por página */
  videosTitle: Tr
  videos: Array<{ videoKey: string | null; posterKey: string | null; title: Tr }>
  /** Grupos del mega-menú "Info útil" */
  infoGroups: Array<{ key: string; icon: string; title: Tr }>
  steps: Array<{ title: Tr; text: Tr }>
  testimonials: Array<{ name: string; country: string; rating: number; text: Tr }>
  partners: Array<{ name: string; imageKey: string | null; url: string; pdfKey?: string | null }>
  // Asistente virtual (chatbot guiado)
  chatbotEnabled: boolean
  chatbotName: string
  chatbotGreeting: Tr
}

const t = (es: string, en: string, pt: string, zh: string): Tr => ({ es, en, pt, zh })

export const DEFAULT_SITE: SiteSettings = {
  name: 'Andes & Titicaca Travel',
  legalName: 'Andes & Titicaca Travel E.I.R.L.',
  ruc: '',
  logoKey: null,
  faviconKey: null,
  primaryColor: '#0474b2',
  accentColor: '#013e56',
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
  extraSocials: [],
  trustTitle: t(
    '¿Cómo saber si somos una agencia de viajes confiable?',
    'How do you know we are a trustworthy travel agency?',
    'Como saber se somos uma agência de viagens confiável?',
    '如何确认我们是一家可靠的旅行社？'
  ),
  trustText: t(
    'Somos una agencia formal, registrada ante las autoridades de turismo. Nuestros viajeros y sus opiniones son la mejor muestra de un servicio organizado, responsable y confiable.',
    'We are a formally registered agency with the tourism authorities. Our travelers and their reviews are the best proof of an organized, responsible and reliable service.',
    'Somos uma agência formal, registrada junto às autoridades de turismo. Nossos viajantes e suas opiniões são a melhor prova de um serviço organizado, responsável e confiável.',
    '我们是在旅游主管部门正式注册的旅行社。旅客的评价是我们服务有序、负责、可靠的最好证明。'
  ),
  whyTitle: t('¿Por qué viajar con nosotros?', 'Why travel with us?', 'Por que viajar conosco?', '为什么选择我们？'),
  happyEyebrow: t('Nuestros viajeros', 'Our travelers', 'Nossos viajantes', '我们的旅客'),
  happyTitle: t('Pasajeros felices', 'Happy travelers', 'Passageiros felizes', '快乐的旅客'),
  happyText: t(
    'Nuestros viajeros nos recomiendan porque confían en nuestra experiencia para vivir Cusco de forma auténtica. Te acompañamos con una atención personalizada antes, durante y después del viaje.',
    'Our travelers recommend us because they trust our experience to live Cusco authentically. We support you personally before, during and after your trip.',
    'Nossos viajantes nos recomendam porque confiam na nossa experiência para viver Cusco de forma autêntica. Acompanhamos você com atendimento personalizado antes, durante e depois da viagem.',
    '旅客推荐我们，是因为信赖我们带他们体验最地道的库斯科。旅行前、中、后，我们都提供贴心服务。'
  ),
  awardImageKey: null,
  awardTitle: {},
  awardText: {},
  awardUrl: '',
  socialPosts: [],
  videosTitle: t('Viajeros en Machu Picchu', 'Travelers at Machu Picchu', 'Viajantes em Machu Picchu', '马丘比丘的旅客'),
  videos: [],
  infoGroups: [
    { key: 'viajero', icon: 'info', title: t('Datos para el viajero', 'Traveler tips', 'Dicas para o viajante', '旅行须知') },
    { key: 'clima', icon: 'cloud', title: t('Geografía y climas', 'Geography & climate', 'Geografia e clima', '地理与气候') },
    { key: 'boletos', icon: 'ticket', title: t('Boletos turísticos', 'Tourist tickets', 'Ingressos turísticos', '景点门票') },
    { key: 'transporte', icon: 'plane', title: t('Vuelos - trenes - buses', 'Flights - trains - buses', 'Voos - trens - ônibus', '航班 - 火车 - 巴士') },
    { key: 'emergencia', icon: 'firstaid', title: t('Directorio para emergencia', 'Emergency directory', 'Contatos de emergência', '紧急联络') },
    { key: 'festividades', icon: 'calendar', title: t('Festividades y eventos', 'Festivals & events', 'Festas e eventos', '节庆与活动') },
  ],
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
  chatbotEnabled: true,
  chatbotName: 'Inti',
  chatbotGreeting: t(
    'Hola, soy Inti, tu asistente de viaje. ¿Qué te gustaría conocer de Cusco?',
    "Hi, I'm Inti, your travel assistant. What would you like to discover in Cusco?",
    'Olá, sou o Inti, seu assistente de viagem. O que você gostaria de conhecer em Cusco?',
    '你好，我是Inti，你的旅行助手。你想了解库斯科的哪些行程？'
  ),
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
    faviconUrl: mediaUrl(site.faviconKey ?? site.logoKey),
    heroImageUrl: mediaUrl(site.heroImageKey),
    awardImageUrl: mediaUrl(site.awardImageKey),
    features: site.features.map((f) => ({ ...f, imageUrl: mediaUrl(f.imageKey) })),
    partners: site.partners.map((p) => ({ ...p, imageUrl: mediaUrl(p.imageKey), pdfUrl: mediaUrl(p.pdfKey) })),
    extraSocials: site.extraSocials.map((x) => ({ ...x, imageUrl: mediaUrl(x.imageKey) })),
    socialPosts: site.socialPosts.map((x) => ({ ...x, imageUrl: mediaUrl(x.imageKey) })),
    videos: site.videos.map((v) => ({ ...v, videoUrl: mediaUrl(v.videoKey), posterUrl: mediaUrl(v.posterKey) })),
    /** Público por diseño: el Client ID de Google no es secreto */
    googleClientId: env.get('GOOGLE_CLIENT_ID') || null,
  }
}

/** Todas las keys de archivos referenciadas por la configuración (para borrar las que se reemplazan) */
export function fileKeys(site: SiteSettings): string[] {
  return [
    site.logoKey,
    site.faviconKey,
    site.heroImageKey,
    site.awardImageKey,
    ...site.features.map((f) => f.imageKey),
    ...site.partners.flatMap((p) => [p.imageKey, p.pdfKey]),
    ...site.extraSocials.map((x) => x.imageKey),
    ...site.socialPosts.map((x) => x.imageKey),
    ...site.videos.flatMap((v) => [v.videoKey, v.posterKey]),
  ].filter((k): k is string => !!k)
}
