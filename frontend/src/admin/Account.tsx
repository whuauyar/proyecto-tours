import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../api'
import { Field, useToast } from './ui'

export default function Account() {
  const toast = useToast()
  const [error, setError] = useState<string | null>(null)
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = Object.fromEntries(new FormData(form))
    setError(null)
    try {
      await api('/api/admin/auth/password', { method: 'PUT', json: fd })
      toast('Contraseña actualizada')
      form.reset()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error')
    }
  }
  return (
    <>
      <h1>Mi cuenta</h1>
      <form className="card form narrow" onSubmit={submit}>
        <h2>Cambiar contraseña</h2>
        <Field label="Contraseña actual"><input name="currentPassword" type="password" required /></Field>
        <Field label="Nueva contraseña" hint="Mínimo 8 caracteres"><input name="newPassword" type="password" minLength={8} required /></Field>
        <Field label="Repetir nueva contraseña"><input name="confirmPassword" type="password" minLength={8} required /></Field>
        {error && <div className="alert alert--error">{error}</div>}
        <button className="btn btn--primary">Actualizar</button>
      </form>
    </>
  )
}
