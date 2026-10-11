import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

/**
 * Cliente mínimo de la WhatsApp Cloud API (Meta).
 * Límites de la API que se respetan aquí: máx. 3 botones (título ≤ 20),
 * listas con máx. 10 filas (título ≤ 24, descripción ≤ 72), cuerpo ≤ 1024.
 */
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

export type Button = { id: string; title: string }
export type Row = { id: string; title: string; description?: string }

export function isEnabled() {
  return Boolean(env.get('WHATSAPP_TOKEN') && env.get('WHATSAPP_PHONE_NUMBER_ID'))
}

async function post(body: Record<string, unknown>) {
  if (!isEnabled()) return
  const base = env.get('WHATSAPP_API_BASE', 'https://graph.facebook.com').replace(/\/$/, '')
  const url = `${base}/${env.get('WHATSAPP_API_VERSION', 'v23.0')}/${env.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.get('WHATSAPP_TOKEN')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...body }),
  })
  if (!res.ok) logger.error({ status: res.status, body: await res.text() }, 'WhatsApp: error al enviar mensaje')
}

const send = (to: string, payload: Record<string, unknown>) => post({ recipient_type: 'individual', to, ...payload })

export const wa = {
  text: (to: string, body: string) => send(to, { type: 'text', text: { body: cut(body, 4096), preview_url: true } }),

  buttons: (to: string, body: string, buttons: Button[]) =>
    send(to, {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: cut(body, 1024) },
        action: { buttons: buttons.slice(0, 3).map((b) => ({ type: 'reply', reply: { id: b.id, title: cut(b.title, 20) } })) },
      },
    }),

  list: (to: string, body: string, button: string, rows: Row[], sectionTitle = 'Menu') =>
    send(to, {
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: cut(body, 1024) },
        action: {
          button: cut(button, 20),
          sections: [{
            title: cut(sectionTitle, 24),
            rows: rows.slice(0, 10).map((r) => ({ id: r.id, title: cut(r.title, 24), ...(r.description ? { description: cut(r.description, 72) } : {}) })),
          }],
        },
      },
    }),

  markRead: (messageId: string) => post({ status: 'read', message_id: messageId }),
}
