export const LANGS = ['es', 'en', 'pt', 'zh'] as const
export type Lang = (typeof LANGS)[number]
/** Valor traducible: una clave por idioma */
export type Tr<T = string> = Partial<Record<Lang, T>>

export interface Destination {
  id: number
  slug: string
  name: Tr
  summary: Tr
  description: Tr
  highlights: Tr<string[]>
  region: string | null
  imageKey: string | null
  imageUrl: string | null
  sortOrder: number
  isFeatured: boolean
  isActive: boolean
  toursCount?: number
}

export interface Category {
  id: number
  slug: string
  name: Tr
  description: Tr
  imageKey: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  toursCount?: number
}

export interface PageItem {
  id: number
  slug: string
  title: Tr
  summary: Tr
  body: Tr
  imageKey: string | null
  imageUrl?: string | null
  showInMenu: boolean
  sortOrder: number
  isActive: boolean
}

export interface Faq {
  id?: number
  tourId?: number | null
  question: Tr
  answer: Tr
  sortOrder?: number
  isActive?: boolean
}

export interface ItineraryDay {
  title: string
  description?: string | null
}

export interface TourImage {
  id?: number
  imageKey: string
  url?: string | null
  alt: Tr
}

export interface Tour {
  id: number
  destinationId: number | null
  categoryId: number | null
  slug: string
  title: Tr
  summary: Tr
  description: Tr
  highlights: Tr<string[]>
  itinerary: Tr<ItineraryDay[]>
  includes: Tr<string[]>
  excludes: Tr<string[]>
  recommendations: Tr<string[]>
  durationDays: number
  durationNights: number
  durationHours: number | null
  price: number
  offerPrice: number | null
  childPrice: number | null
  currency: 'USD' | 'PEN'
  difficulty: 'facil' | 'moderada' | 'exigente'
  groupType: 'compartido' | 'privado'
  rating: number | null
  reviewsCount: number
  location: string | null
  coverKey: string | null
  coverUrl: string | null
  discountPercent: number | null
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
  category?: Category | null
  destination?: Destination | null
  images?: TourImage[]
  faqs?: Faq[]
  related?: Tour[]
}

export interface Feature { icon: string; title: Tr; text: Tr }
export interface Step { title: Tr; text: Tr }
export interface Testimonial { name: string; country: string; rating: number; text: Tr }
export interface Partner { name: string; imageKey: string | null; imageUrl?: string | null; url: string }

export interface SiteSettings {
  name: string
  legalName: string
  ruc: string
  logoKey: string | null
  logoUrl?: string | null
  primaryColor: string
  accentColor: string
  languages: Lang[]
  defaultLanguage: Lang
  tagline: Tr
  heroImageKey: string | null
  heroImageUrl?: string | null
  heroVideoUrl: string
  heroTitle: Tr
  heroSubtitle: Tr
  about: Tr
  yearsExperience: number
  travelersCount: number
  ratingAverage: number
  tripadvisorUrl: string
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
  features: Feature[]
  steps: Step[]
  testimonials: Testimonial[]
  partners: Partner[]
}

export interface Navigation {
  destinations: Destination[]
  categories: Category[]
  pages: Pick<PageItem, 'id' | 'slug' | 'title'>[]
}

export interface Inquiry {
  id: number
  tourId: number | null
  name: string
  email: string
  phone: string | null
  country: string | null
  travelDate: string | null
  adults: number
  children: number
  message: string | null
  locale: Lang
  status: 'nuevo' | 'atendido' | 'cerrado'
  createdAt: string
  tour?: Tour | null
}
