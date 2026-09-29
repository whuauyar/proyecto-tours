import { Route, Routes } from 'react-router-dom'
import './admin.css'
import { AuthProvider } from './auth'
import { ToastProvider } from './ui'
import AdminLayout from './AdminLayout'
import Login from './Login'
import Dashboard from './Dashboard'
import ToursAdmin from './ToursAdmin'
import TourForm from './TourForm'
import TaxonomyAdmin from './TaxonomyAdmin'
import FaqsAdmin from './FaqsAdmin'
import PagesAdmin from './PagesAdmin'
import SettingsAdmin from './SettingsAdmin'
import InquiriesAdmin from './InquiriesAdmin'
import Account from './Account'

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tours" element={<ToursAdmin />} />
            <Route path="tours/:id" element={<TourForm />} />
            <Route path="destinos" element={<TaxonomyAdmin key="d" kind="destinations" />} />
            <Route path="tipos" element={<TaxonomyAdmin key="c" kind="categories" />} />
            <Route path="faq" element={<FaqsAdmin />} />
            <Route path="paginas" element={<PagesAdmin />} />
            <Route path="configuracion" element={<SettingsAdmin />} />
            <Route path="consultas" element={<InquiriesAdmin />} />
            <Route path="cuenta" element={<Account />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
