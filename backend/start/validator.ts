/**
 * Mensajes de validación en español para el panel y los formularios
 */
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider(
  {
    'required': 'El campo {{ field }} es obligatorio',
    'string': 'El campo {{ field }} debe ser texto',
    'number': 'El campo {{ field }} debe ser un número',
    'boolean': 'El campo {{ field }} debe ser verdadero o falso',
    'email': 'Ingresa un correo válido',
    'minLength': 'El campo {{ field }} debe tener al menos {{ min }} caracteres',
    'maxLength': 'El campo {{ field }} no debe superar {{ max }} caracteres',
    'min': 'El campo {{ field }} debe ser como mínimo {{ min }}',
    'max': 'El campo {{ field }} debe ser como máximo {{ max }}',
    'enum': 'El valor de {{ field }} no es válido',
    'date': 'La fecha no es válida',
    'confirmed': 'Las contraseñas no coinciden',
  },
  {
    'name.es': 'nombre (español)',
    'title.es': 'título (español)',
    'question.es': 'pregunta (español)',
    'answer.es': 'respuesta (español)',
    'price': 'precio',
  }
)
