import type { JSX } from 'react'
const s = { width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
export const IconClock = () => (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>)
export const IconPin = () => (<svg viewBox="0 0 24 24" {...s}><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>)
export const IconMountain = () => (<svg viewBox="0 0 24 24" {...s}><path d="M3 20 10 7l4 7 2-3 5 9z" /></svg>)
export const IconCheck = () => (<svg viewBox="0 0 24 24" {...s}><path d="m5 12 5 5 9-10" /></svg>)
export const IconX = () => (<svg viewBox="0 0 24 24" {...s}><path d="M6 6l12 12M18 6 6 18" /></svg>)
export const IconMenu = () => (<svg viewBox="0 0 24 24" {...s}><path d="M4 7h16M4 12h16M4 17h16" /></svg>)
export const IconSearch = () => (<svg viewBox="0 0 24 24" {...s}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>)
export const IconShield = () => (<svg viewBox="0 0 24 24" {...s}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" /><path d="m9 12 2 2 4-4" /></svg>)
export const IconHeadset = () => (<svg viewBox="0 0 24 24" {...s}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></svg>)
export const IconTag = () => (<svg viewBox="0 0 24 24" {...s}><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.5" /></svg>)
export const IconStar = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.3L12 17.5 6.5 20.4l1-6.3L3 9.7l6.2-.9z" /></svg>)
export const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z" /></svg>
)
export const IconUsers = () => (<svg viewBox="0 0 24 24" {...s}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" /></svg>)
export const IconLeaf = () => (<svg viewBox="0 0 24 24" {...s}><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15" /><path d="M5 19 13 11" /></svg>)
export const IconCalendar = () => (<svg viewBox="0 0 24 24" {...s}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>)
export const IconGuide = () => (<svg viewBox="0 0 24 24" {...s}><path d="M4 21V4h11l-2 4 2 4H4" /></svg>)
export const IconHeart = () => (<svg viewBox="0 0 24 24" {...s}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>)
export const IconGlobe = () => (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>)
export const IconPhone = () => (<svg viewBox="0 0 24 24" {...s}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>)
export const IconMail = () => (<svg viewBox="0 0 24 24" {...s}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>)
export const IconChevron = () => (<svg viewBox="0 0 24 24" {...s} width={16} height={16}><path d="m6 9 6 6 6-6" /></svg>)
export const IconChevronLeft = () => (<svg viewBox="0 0 24 24" {...s}><path d="m15 6-6 6 6 6" /></svg>)
export const IconChevronRight = () => (<svg viewBox="0 0 24 24" {...s}><path d="m9 6 6 6-6 6" /></svg>)
export const IconInfo = () => (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></svg>)
export const IconCloud = () => (<svg viewBox="0 0 24 24" {...s}><path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7z" /></svg>)
export const IconTicket = () => (<svg viewBox="0 0 24 24" {...s}><path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4 2 2 0 0 0 0-4V6H3z" /><path d="M14 6v12" strokeDasharray="2 2" /></svg>)
export const IconPlane = () => (<svg viewBox="0 0 24 24" {...s}><path d="M10.5 13.5 3 11l1.5-1.5 7 1 4-4.5c1-1 2.6-1.4 3.2-.7.7.6.3 2.2-.7 3.2l-4.5 4 1 7L13 21l-2.5-7.5z" /></svg>)
export const IconFirstAid = () => (<svg viewBox="0 0 24 24" {...s}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5h6v2M12 10.5v6M9 13.5h6" /></svg>)
export const IconFile = () => (<svg viewBox="0 0 24 24" {...s}><path d="M14 3H6v18h12V7z" /><path d="M14 3v4h4M9 13h6M9 17h4" /></svg>)
export const IconHandshake = () => (<svg viewBox="0 0 24 24" {...s}><path d="m11 17 2 2a1.5 1.5 0 0 0 2-2l-3-3" /><path d="m14 16 1 1a1.5 1.5 0 0 0 2-2l-4-4-2.5 2a2 2 0 0 1-3-2.5L11 6h3l5 5 2-1" /><path d="M3 10l3-3 4 0M3 10l7 7a1.5 1.5 0 0 0 2-2" /></svg>)
export const IconAward = () => (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="9" r="6" /><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7" /><path d="m10 9 1.5 1.5L14.5 7.5" /></svg>)
export const IconSmile = () => (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><path d="M8 14a5 5 0 0 0 8 0M9 9.5v.5M15 9.5v.5" /></svg>)
export const IconPlay = () => (<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>)
export const IconHeartFill = () => (<svg viewBox="0 0 24 24" width="22" height="22" fill="#e0245e"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>)
export const IconComment = () => (<svg viewBox="0 0 24 24" {...s} width={22} height={22}><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z" /></svg>)
export const IconSend = () => (<svg viewBox="0 0 24 24" {...s} width={22} height={22}><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" /></svg>)
export const IconBookmark = () => (<svg viewBox="0 0 24 24" {...s} width={22} height={22}><path d="M6 3h12v18l-6-4-6 4z" /></svg>)

/* Redes sociales (formas simplificadas, monocromas) */
const f = { width: 18, height: 18, fill: 'currentColor' } as const
export const IconFacebook = () => (<svg viewBox="0 0 24 24" {...f}><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z" /></svg>)
export const IconInstagram = () => (<svg viewBox="0 0 24 24" {...s} width={18} height={18}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17 7v.01" /></svg>)
export const IconYoutube = () => (<svg viewBox="0 0 24 24" {...f}><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z" /></svg>)
export const IconTiktok = () => (<svg viewBox="0 0 24 24" {...f}><path d="M16.5 3a5 5 0 0 0 4 4.5v3.2a8 8 0 0 1-4-1.2V15a6 6 0 1 1-6-6h.5v3.3a2.8 2.8 0 1 0 2.3 2.7V3z" /></svg>)
export const SOCIAL_ICONS: Record<string, () => JSX.Element> = {
  facebook: IconFacebook, instagram: IconInstagram, youtube: IconYoutube, tiktok: IconTiktok, whatsapp: IconWhatsApp,
}

/** Iconos elegibles para los bloques "¿Por qué elegirnos?" */
export const FEATURE_ICONS: Record<string, () => JSX.Element> = {
  handshake: IconHandshake, award: IconAward, smile: IconSmile, users: IconUsers,
  guide: IconGuide, price: IconTag, support: IconHeadset, shield: IconShield, leaf: IconLeaf,
  calendar: IconCalendar, star: IconStar, heart: IconHeart, globe: IconGlobe,
}

/** Iconos de los grupos del menú "Info útil" */
export const INFO_ICONS: Record<string, () => JSX.Element> = {
  info: IconInfo, cloud: IconCloud, ticket: IconTicket, plane: IconPlane, firstaid: IconFirstAid,
  calendar: IconCalendar, pin: IconPin, mountain: IconMountain, star: IconStar, file: IconFile,
}
