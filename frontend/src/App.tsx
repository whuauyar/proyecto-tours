import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { I18nProvider, isLang, preferredLang } from './i18n'
import { SiteProvider, useSite } from './site'
import Layout from './components/Layout'
import Home from './pages/Home'
import Tours from './pages/Tours'
import TourDetail from './pages/TourDetail'
import DestinationPage from './pages/DestinationPage'
import InfoPage from './pages/InfoPage'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import type { Lang } from './types'

// El panel se carga aparte para no pesar en el sitio público
const AdminApp = lazy(() => import('./admin/AdminApp'))

/** "/" -> "/<idioma preferido>" según navegador y los idiomas activos */
function RootRedirect() {
  const { site } = useSite()
  if (!site) return <div className="admin-loading">…</div>
  return <Navigate to={`/${preferredLang(site.languages, site.defaultLanguage)}`} replace />
}

/** Valida el prefijo de idioma de la URL */
function LangRoute() {
  const { lang } = useParams()
  const { site } = useSite()
  if (!isLang(lang)) return <Navigate to={`/${site?.defaultLanguage ?? 'es'}`} replace />
  if (site && !site.languages.includes(lang as Lang)) return <Navigate to={`/${site.defaultLanguage}`} replace />
  return (
    <I18nProvider lang={lang as Lang}>
      <Outlet />
    </I18nProvider>
  )
}

function AppRoutes() {
  // El panel se resuelve antes que las rutas con idioma: si no, "/admin/tours"
  // coincidiría con "/:lang/tours" (lang = "admin").
  const { pathname } = useLocation()
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return (
      <Routes>
        <Route path="/admin/*" element={<Suspense fallback={<div className="admin-loading">Cargando…</div>}><AdminApp /></Suspense>} />
      </Routes>
    )
  }
  return (
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/:lang" element={<LangRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="tours" element={<Tours />} />
              <Route path="tour/:slug" element={<TourDetail />} />
              <Route path="destino/:slug" element={<DestinationPage />} />
              <Route path="info/:slug" element={<InfoPage />} />
              <Route path="contacto" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <AppRoutes />
      </SiteProvider>
    </BrowserRouter>
  )
}
