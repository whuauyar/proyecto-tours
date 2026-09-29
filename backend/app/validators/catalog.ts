import vine from '@vinejs/vine'

/* ---------- Tipos traducibles ---------- */
const s = () => vine.string().trim().optional().nullable()
/** Texto en 4 idiomas; con required=true el español es obligatorio */
const tr = (required = false) =>
  vine.object({
    es: required ? vine.string().trim().minLength(2) : s(),
    en: s(),
    pt: s(),
    zh: s(),
  })
const list = () => vine.array(vine.string().trim()).optional()
const trList = () => vine.object({ es: list(), en: list(), pt: list(), zh: list() }).optional()
const day = () =>
  vine.array(vine.object({ title: vine.string().trim(), description: vine.string().trim().optional().nullable() })).optional()
const trDays = () => vine.object({ es: day(), en: day(), pt: day(), zh: day() }).optional()

const common = {
  slug: vine.string().trim().maxLength(160).optional().nullable(),
  sortOrder: vine.number().optional(),
  isActive: vine.boolean().optional(),
  imageKey: s(),
}

export const destinationValidator = vine.compile(
  vine.object({
    ...common,
    name: tr(true),
    summary: tr().optional(),
    description: tr().optional(),
    highlights: trList(),
    region: s(),
    isFeatured: vine.boolean().optional(),
  })
)

export const categoryValidator = vine.compile(
  vine.object({ ...common, name: tr(true), description: tr().optional() })
)

export const pageValidator = vine.compile(
  vine.object({
    ...common,
    title: tr(true),
    summary: tr().optional(),
    body: tr().optional(),
    showInMenu: vine.boolean().optional(),
  })
)

export const faqValidator = vine.compile(
  vine.object({
    tourId: vine.number().optional().nullable(),
    question: tr(true),
    answer: tr(true),
    sortOrder: vine.number().optional(),
    isActive: vine.boolean().optional(),
  })
)

export const tourValidator = vine.compile(
  vine.object({
    destinationId: vine.number().optional().nullable(),
    categoryId: vine.number().optional().nullable(),
    slug: vine.string().trim().maxLength(160).optional().nullable(),
    title: tr(true),
    summary: tr().optional(),
    description: tr().optional(),
    highlights: trList(),
    itinerary: trDays(),
    includes: trList(),
    excludes: trList(),
    recommendations: trList(),
    durationDays: vine.number().min(1).max(60).optional(),
    durationNights: vine.number().min(0).max(60).optional(),
    durationHours: vine.number().min(1).max(24).optional().nullable(),
    price: vine.number().min(0),
    offerPrice: vine.number().min(0).optional().nullable(),
    childPrice: vine.number().min(0).optional().nullable(),
    currency: vine.enum(['USD', 'PEN']).optional(),
    difficulty: vine.enum(['facil', 'moderada', 'exigente']).optional(),
    groupType: vine.enum(['compartido', 'privado']).optional(),
    rating: vine.number().min(0).max(5).optional().nullable(),
    reviewsCount: vine.number().min(0).optional(),
    location: s(),
    coverKey: s(),
    isFeatured: vine.boolean().optional(),
    isActive: vine.boolean().optional(),
    sortOrder: vine.number().optional(),
    images: vine.array(vine.object({ imageKey: vine.string().trim(), alt: tr().optional() })).optional(),
    faqs: vine
      .array(vine.object({ question: tr(true), answer: tr(true) }))
      .optional(),
  })
)

/** Edición rápida desde el listado */
export const tourPatchValidator = vine.compile(
  vine.object({
    price: vine.number().min(0).optional(),
    offerPrice: vine.number().min(0).optional().nullable(),
    childPrice: vine.number().min(0).optional().nullable(),
    currency: vine.enum(['USD', 'PEN']).optional(),
    isFeatured: vine.boolean().optional(),
    isActive: vine.boolean().optional(),
    sortOrder: vine.number().optional(),
  })
)

export const inquiryValidator = vine.compile(
  vine.object({
    tourId: vine.number().optional().nullable(),
    name: vine.string().trim().minLength(2).maxLength(150),
    email: vine.string().trim().email().maxLength(254),
    phone: vine.string().trim().maxLength(40).optional().nullable(),
    country: vine.string().trim().maxLength(80).optional().nullable(),
    travelDate: vine.date({ formats: ['YYYY-MM-DD'] }).optional().nullable(),
    adults: vine.number().min(1).max(100).optional(),
    children: vine.number().min(0).max(100).optional(),
    message: vine.string().trim().maxLength(3000).optional().nullable(),
    locale: vine.enum(['es', 'en', 'pt', 'zh']).optional(),
    website: vine.string().optional().nullable(), // honeypot anti-spam
  })
)

export const loginValidator = vine.compile(
  vine.object({ email: vine.string().trim().email(), password: vine.string().minLength(6) })
)

export const passwordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string(),
    newPassword: vine.string().minLength(8).confirmed({ confirmationField: 'confirmPassword' }),
  })
)
