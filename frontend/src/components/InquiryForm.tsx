import { useState, type FormEvent } from 'react'
import { api } from '../api'
import { formatPrice, useI18n } from '../i18n'
import type { Tour } from '../types'

export default function InquiryForm({ tour, compact = false }: { tour?: Tour; compact?: boolean }) {
  const { t, lang, locale } = useI18n()
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState(false)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  const unit = tour ? (tour.discountPercent ? tour.offerPrice! : tour.price) : 0
  const childUnit = tour?.childPrice ?? unit
  const total = tour ? adults * unit + children * childUnit : 0

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload: Record<string, unknown> = { tourId: tour?.id ?? null, locale: lang, adults, children }
    fd.forEach((v, k) => {
      if (v !== '') payload[k] = v
    })
    setState('sending')
    setError(false)
    try {
      await api('/api/inquiries', { method: 'POST', json: payload })
      setState('sent')
    } catch {
      setError(true)
      setState('idle')
    }
  }

  if (state === 'sent') return <div className="alert alert--ok">{t('sent')}</div>

  return (
    <form className={`form ${compact ? 'form--compact' : ''}`} onSubmit={submit}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <div className="form__row">
        <label>{t('adults')}
          <input type="number" min={1} max={100} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))} />
        </label>
        <label>{t('children')}
          <input type="number" min={0} max={100} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))} />
        </label>
      </div>
      {tour && total > 0 && (
        <div className="estimate">
          <span>{t('estimated')}</span>
          <strong>{formatPrice(total, tour.currency, locale)}</strong>
        </div>
      )}
      <label>{t('travelDate')}<input name="travelDate" type="date" min={new Date().toISOString().slice(0, 10)} /></label>
      <label>{t('name')}<input name="name" required minLength={2} /></label>
      <label>{t('email')}<input name="email" type="email" required /></label>
      <div className="form__row">
        <label>{t('phone')}<input name="phone" /></label>
        <label>{t('country')}<input name="country" /></label>
      </div>
      <label>{t('message')}<textarea name="message" rows={compact ? 3 : 4} /></label>
      {error && <div className="alert alert--error">{t('formError')}</div>}
      <button className="btn btn--primary btn--block" disabled={state === 'sending'}>
        {state === 'sending' ? t('sending') : t('send')}
      </button>
    </form>
  )
}
