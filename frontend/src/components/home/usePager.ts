import { useEffect, useState } from 'react'

/** Cantidad de elementos por página según el ancho de pantalla: [[ancho mínimo, cantidad], ...] */
export function usePerPage(rules: Array<[number, number]>, fallback = 1) {
  const pick = () => {
    if (typeof window === 'undefined') return fallback
    for (const [min, n] of rules) if (window.innerWidth >= min) return n
    return fallback
  }
  const [n, setN] = useState(pick)
  useEffect(() => {
    const onResize = () => setN(pick())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return n
}

/** Paginación de un carrusel */
export function usePager(total: number, perPage: number) {
  const pages = Math.max(1, Math.ceil(total / perPage))
  const [page, setPage] = useState(0)
  useEffect(() => {
    if (page > pages - 1) setPage(pages - 1)
  }, [page, pages])
  return {
    page,
    pages,
    setPage,
    prev: () => setPage((p) => (p - 1 + pages) % pages),
    next: () => setPage((p) => (p + 1) % pages),
    slice: <T,>(items: T[]) => items.slice(page * perPage, page * perPage + perPage),
  }
}
