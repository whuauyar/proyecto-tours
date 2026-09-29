import { useState } from 'react'

/** Imagen con carga diferida y fondo de respaldo si falta o falla */
export default function Img({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <div className={`img-fallback ${className ?? ''}`} role="img" aria-label={alt} />
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />
}
