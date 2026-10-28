import env from '#start/env'

export interface GoogleProfile {
  sub: string
  name: string
  email: string | null
  picture: string | null
}

/**
 * Valida el token (ID token) que entrega "Continuar con Google" en el navegador.
 * Se usa el endpoint oficial tokeninfo de Google, que comprueba firma y vigencia;
 * aquí se verifica además que el token sea para NUESTRA app (aud = GOOGLE_CLIENT_ID).
 */
export async function verifyGoogleCredential(credential: string): Promise<GoogleProfile> {
  const clientId = env.get('GOOGLE_CLIENT_ID')
  if (!clientId) throw new Error('El inicio de sesión con Google no está configurado')

  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`).catch(() => null)
  if (!res || !res.ok) throw new Error('No se pudo validar tu sesión de Google. Vuelve a intentarlo.')
  const data = (await res.json()) as Record<string, string>

  const issuerOk = data.iss === 'accounts.google.com' || data.iss === 'https://accounts.google.com'
  const notExpired = Number(data.exp) * 1000 > Date.now()
  if (data.aud !== clientId || !issuerOk || !notExpired || !data.sub) {
    throw new Error('Sesión de Google no válida. Vuelve a iniciar sesión.')
  }
  return {
    sub: data.sub,
    name: (data.name || data.given_name || data.email?.split('@')[0] || 'Viajero').slice(0, 150),
    email: data.email_verified === 'true' ? data.email : null,
    picture: data.picture || null,
  }
}
