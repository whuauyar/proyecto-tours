import { useEffect, type ReactNode } from 'react'
import { useI18n } from '../i18n'
import { IconX } from './Icons'

/** Ventana modal accesible: se cierra con Esc, clic fuera o el botón */
export default function Modal({ title, onClose, children, wide = false, actions }: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
  actions?: ReactNode
}) {
  const { t } = useI18n()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal__box ${wide ? 'modal__box--wide' : ''}`}>
        <header className="modal__head">
          <strong>{title}</strong>
          <div className="modal__actions">
            {actions}
            <button type="button" className="modal__close" onClick={onClose} aria-label={t('close')}><IconX /></button>
          </div>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}
