/** Cliente HTTP mínimo para la API de AdonisJS */
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3333').replace(/\/$/, '')

const TOKEN_KEY = 'tours_admin_token'

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set: (t: string | null) => {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t)
      else localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* almacenamiento no disponible */
    }
  },
}

export class ApiError extends Error {
  status: number
  errors: Array<{ field?: string; message: string }>
  constructor(status: number, message: string, errors: ApiError['errors'] = []) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export async function api<T = unknown>(path: string, options: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  const token = tokenStore.get()
  if (token && path.startsWith('/api/admin')) headers.set('Authorization', `Bearer ${token}`)
  let body = options.body
  if (options.json !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.json)
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers, body })
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && path.startsWith('/api/admin')) {
      tokenStore.set(null)
      window.dispatchEvent(new Event('admin:logout'))
    }
    const errors = data.errors ?? []
    throw new ApiError(res.status, errors[0]?.message || data.message || 'Error de servidor', errors)
  }
  return data as T
}

export async function uploadImage(file: File, folder = 'uploads'): Promise<{ key: string; url: string }> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  return api('/api/admin/uploads', { method: 'POST', body: fd })
}
