import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { createHmac, timingSafeEqual } from 'node:crypto'
import env from '#start/env'
import { handleIncoming, type Incoming } from '#services/whatsapp/bot'
import { isEnabled } from '#services/whatsapp/client'

/** Webhook de la WhatsApp Cloud API: GET para verificación, POST para mensajes entrantes */
export default class WhatsappController {
  /** Meta llama una vez con hub.challenge al registrar el webhook */
  async verify({ request, response }: HttpContext) {
    const mode = request.input('hub.mode')
    const token = request.input('hub.verify_token')
    const challenge = request.input('hub.challenge')
    const expected = env.get('WHATSAPP_VERIFY_TOKEN')
    if (mode === 'subscribe' && expected && token === expected) return response.type('text/plain').send(String(challenge))
    return response.forbidden('verify token inválido')
  }

  async receive({ request, response }: HttpContext) {
    // Firma X-Hub-Signature-256 (HMAC SHA-256 del cuerpo con el App Secret)
    const secret = env.get('WHATSAPP_APP_SECRET')
    if (secret) {
      const signature = request.header('x-hub-signature-256') ?? ''
      const expected = 'sha256=' + createHmac('sha256', secret).update(request.raw() ?? '').digest('hex')
      const ok = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
      if (!ok) return response.unauthorized('firma inválida')
    }

    const messages: Incoming[] = []
    for (const entry of request.input('entry', []) as any[]) {
      for (const change of entry.changes ?? []) {
        const value = change.value ?? {}
        const names = Object.fromEntries((value.contacts ?? []).map((c: any) => [c.wa_id, c.profile?.name]))
        for (const m of value.messages ?? []) {
          const reply = m.interactive?.button_reply ?? m.interactive?.list_reply ?? null
          messages.push({
            waId: m.from,
            messageId: m.id,
            profileName: names[m.from],
            text: m.type === 'text' ? m.text?.body : m.type === 'button' ? m.button?.text : undefined,
            replyId: reply?.id,
          })
        }
      }
    }

    // Se responde 200 de inmediato (Meta reintenta si tarda) y se procesa en segundo plano
    if (isEnabled()) {
      for (const msg of messages) {
        handleIncoming(msg).catch((error) => logger.error({ err: error, waId: msg.waId }, 'WhatsApp: error procesando mensaje'))
      }
    }
    return response.ok({ received: messages.length })
  }
}
