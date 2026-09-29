import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './auth'

export default function Login() {
  const { user, login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/admin" replace />

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setBusy(true)
    setError(null)
    try {
      await login(String(fd.get('email')), String(fd.get('password')))
    } catch {
      setError('Correo o contraseña incorrectos')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="login">
      <form className="card login__card form" onSubmit={submit}>
        <h1>Panel administrador</h1>
        <label>Correo<input name="email" type="email" required autoFocus /></label>
        <label>Contraseña<input name="password" type="password" required /></label>
        {error && <div className="alert alert--error">{error}</div>}
        <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
    </div>
  )
}
