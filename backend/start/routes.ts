/*
|--------------------------------------------------------------------------
| Rutas HTTP
|--------------------------------------------------------------------------
*/
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const PublicController = () => import('#controllers/public_controller')
const MediaController = () => import('#controllers/media_controller')
const AuthController = () => import('#controllers/auth_controller')
const UploadsController = () => import('#controllers/admin/uploads_controller')
const CategoriesController = () => import('#controllers/admin/categories_controller')
const DestinationsController = () => import('#controllers/admin/destinations_controller')
const PagesController = () => import('#controllers/admin/pages_controller')
const FaqsController = () => import('#controllers/admin/faqs_controller')
const ToursController = () => import('#controllers/admin/tours_controller')
const SettingsController = () => import('#controllers/admin/settings_controller')
const InquiriesController = () => import('#controllers/admin/inquiries_controller')

router.get('/', async () => ({ name: 'tours-api', status: 'ok' }))
router.get('/health', async () => ({ status: 'ok' }))
router.get('/media/*', [MediaController, 'show'])

/** API pública (sitio web) */
router
  .group(() => {
    router.get('settings', [PublicController, 'settings'])
    router.get('navigation', [PublicController, 'navigation'])
    router.get('destinations/:slug', [PublicController, 'destination'])
    router.get('faqs', [PublicController, 'faqs'])
    router.get('pages/:slug', [PublicController, 'page'])
    router.get('tours', [PublicController, 'tours'])
    router.get('tours/:slug', [PublicController, 'tour'])
    router.post('inquiries', [PublicController, 'storeInquiry'])
    router.post('auth/login', [AuthController, 'login'])
  })
  .prefix('/api')

/** API del panel administrador (requiere token) */
router
  .group(() => {
    router.get('auth/me', [AuthController, 'me'])
    router.post('auth/logout', [AuthController, 'logout'])
    router.put('auth/password', [AuthController, 'changePassword'])

    router.post('uploads', [UploadsController, 'store'])

    router.resource('destinations', DestinationsController).apiOnly()
    router.resource('categories', CategoriesController).apiOnly()
    router.resource('pages', PagesController).apiOnly()
    router.resource('faqs', FaqsController).apiOnly()
    router.resource('tours', ToursController).apiOnly()
    router.patch('tours/:id/quick', [ToursController, 'patch'])

    router.get('settings', [SettingsController, 'show'])
    router.put('settings', [SettingsController, 'update'])

    router.get('inquiries/stats', [InquiriesController, 'stats'])
    router.get('inquiries', [InquiriesController, 'index'])
    router.patch('inquiries/:id', [InquiriesController, 'update'])
    router.delete('inquiries/:id', [InquiriesController, 'destroy'])
  })
  .prefix('/api/admin')
  .use(middleware.auth({ guards: ['api'] }))
