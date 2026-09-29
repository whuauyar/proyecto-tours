import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import { loginValidator, passwordValidator } from '#validators/catalog'

export default class AuthController {
  async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user, ['*'], { expiresIn: '7 days' })
    return { token: token.value!.release(), user }
  }

  async me({ auth }: HttpContext) {
    return auth.getUserOrFail()
  }

  async logout({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    return { ok: true }
  }

  async changePassword({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { currentPassword, newPassword } = await request.validateUsing(passwordValidator)
    if (!(await hash.verify(user.password, currentPassword))) {
      return response.unprocessableEntity({
        errors: [{ field: 'currentPassword', message: 'La contraseña actual no es correcta' }],
      })
    }
    user.password = newPassword
    await user.save()
    return { ok: true }
  }
}
