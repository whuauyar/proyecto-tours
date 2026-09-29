import sharp from 'sharp'

/**
 * Genera ilustraciones de paisaje andino (montañas, sol, terrazas) como
 * imágenes de ejemplo, para no depender de fotos externas. El administrador
 * las reemplaza luego desde el panel.
 */
const PALETTES = [
  ['#f6d365', '#fda085', '#6a4c93', '#3d2c5e', '#1f1a38'],
  ['#a1c4fd', '#c2e9fb', '#4a7c59', '#2f5d3a', '#1b3a26'],
  ['#ffecd2', '#fcb69f', '#b5651d', '#7a3e12', '#3e1f0a'],
  ['#89f7fe', '#66a6ff', '#355c7d', '#2a3f5f', '#162438'],
  ['#fbc2eb', '#a6c1ee', '#6c5b7b', '#45395a', '#241d33'],
  ['#fddb92', '#d1fdff', '#5b8c5a', '#3b6b3a', '#203d20'],
]

function ridge(width: number, base: number, amp: number, seed: number, steps = 9) {
  let d = `M0 ${base}`
  for (let i = 0; i <= steps; i++) {
    const x = (width / steps) * i
    const y = base - Math.abs(Math.sin(seed * 1.7 + i * 1.3)) * amp - (i % 2 ? amp * 0.25 : 0)
    d += ` L${x.toFixed(0)} ${y.toFixed(0)}`
  }
  return `${d} L${width} 900 L0 900 Z`
}

export async function sceneryImage(seed: number): Promise<Buffer> {
  const [sky1, sky2, m1, m2, m3] = PALETTES[seed % PALETTES.length]
  const w = 1600
  const h = 900
  const sunX = 300 + ((seed * 263) % 1000)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${sky2}"/><stop offset="1" stop-color="${sky1}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#s)"/>
  <circle cx="${sunX}" cy="260" r="90" fill="#fff" opacity=".55"/>
  <path d="${ridge(w, 520, 300, seed)}" fill="${m1}" opacity=".85"/>
  <path d="${ridge(w, 650, 220, seed + 3)}" fill="${m2}"/>
  <path d="${ridge(w, 780, 140, seed + 7, 14)}" fill="${m3}"/>
  ${Array.from({ length: 6 })
    .map((_, i) => `<rect x="0" y="${800 + i * 16}" width="${w}" height="6" fill="#000" opacity=".08"/>`)
    .join('')}
</svg>`
  return sharp(Buffer.from(svg)).webp({ quality: 82 }).toBuffer()
}
