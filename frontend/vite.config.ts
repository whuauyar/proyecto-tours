import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * SEO en el build:
 * - robots.txt con el mapa del sitio (lo genera el backend en /sitemap.xml)
 * - meta de verificación de Google Search Console (VITE_GOOGLE_SITE_VERIFICATION),
 *   que Google exige en el HTML inicial
 */
function seoFiles(env: Record<string, string>): Plugin {
  const api = (env.VITE_API_URL || 'http://localhost:3333').replace(/\/$/, '')
  const verification = (env.VITE_GOOGLE_SITE_VERIFICATION || '').replace(/[^\w-]/g, '')
  return {
    name: 'seo-files',
    transformIndexHtml(html) {
      return verification ? html.replace('</head>', `    <meta name="google-site-verification" content="${verification}" />\n  </head>`) : html
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${api}/sitemap.xml\n`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv incluye también las variables VITE_* definidas en el entorno (Railway)
  const env = loadEnv(mode, '.', 'VITE_')
  return { plugins: [react(), seoFiles(env)] }
})
