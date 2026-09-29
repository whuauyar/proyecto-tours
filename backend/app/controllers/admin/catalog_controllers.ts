import Destination from '#models/destination'
import Category from '#models/category'
import Page from '#models/page'
import Faq from '#models/faq'
import { crudController } from '#services/crud'
import { categoryValidator, destinationValidator, faqValidator, pageValidator } from '#validators/catalog'

export const DestinationsController = crudController(Destination, destinationValidator, {
  slugFrom: 'name',
  countRelation: 'tours',
})
export const CategoriesController = crudController(Category, categoryValidator, {
  slugFrom: 'name',
  countRelation: 'tours',
})
export const PagesController = crudController(Page, pageValidator, { slugFrom: 'title' })
export const FaqsController = crudController(Faq, faqValidator)
