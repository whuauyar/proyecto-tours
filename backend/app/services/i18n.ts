/** Idiomas soportados por la plataforma */
export const LANGS = ['es', 'en', 'pt', 'zh'] as const
export type Lang = (typeof LANGS)[number]

export type Tr<T = string> = Partial<Record<Lang, T>>

/** Opciones de columna para JSONB (Lucid) */
export const jsonCol = (fallback: unknown = {}) => ({
  prepare: (v: unknown) => JSON.stringify(v ?? fallback),
  consume: (v: unknown) => (typeof v === 'string' ? JSON.parse(v) : (v ?? fallback)),
})

export const moneyCol = {
  consume: (v: unknown) => (v === null || v === undefined ? null : Number(v)),
}

/** Texto en el idioma pedido con respaldo en español */
export function trText(value: Tr | null | undefined, lang: Lang = 'es'): string {
  if (!value) return ''
  return value[lang] || value.es || Object.values(value).find(Boolean) || ''
}
