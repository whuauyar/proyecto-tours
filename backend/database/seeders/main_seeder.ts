import { BaseSeeder } from '@adonisjs/lucid/seeders'
import drive from '@adonisjs/drive/services/main'
import env from '#start/env'
import User from '#models/user'
import Destination from '#models/destination'
import Category from '#models/category'
import Tour from '#models/tour'
import Faq from '#models/faq'
import Page from '#models/page'
import { saveSite } from '#services/site_settings'
import { sceneryImage } from '#services/demo_scenery'
import type { Tr } from '#services/i18n'

/** Atajo para textos en 4 idiomas: es, en, pt, zh */
const t = (es: string, en: string, pt: string, zh: string): Tr => ({ es, en, pt, zh })
const tl = <T,>(es: T[], en: T[], pt: T[], zh: T[]) => ({ es, en, pt, zh })
const d = (title: string, description = '') => ({ title, description })

let seed = 0
async function demoImage(folder: string) {
  const key = `${folder}/demo/${folder}-${++seed}.webp`
  await drive.use().put(key, await sceneryImage(seed), { contentType: 'image/webp' })
  return key
}

const INCLUDES = tl(
  ['Guía profesional bilingüe', 'Transporte turístico', 'Recojo del hotel', 'Asistencia 24/7'],
  ['Professional bilingual guide', 'Tourist transport', 'Hotel pickup', '24/7 assistance'],
  ['Guia profissional bilíngue', 'Transporte turístico', 'Busca no hotel', 'Assistência 24/7'],
  ['专业双语导游', '旅游交通', '酒店接送', '24小时协助']
)
const EXCLUDES = tl(
  ['Propinas', 'Gastos personales'],
  ['Tips', 'Personal expenses'],
  ['Gorjetas', 'Despesas pessoais'],
  ['小费', '个人消费']
)
const BRING = tl(
  ['Pasaporte original', 'Ropa abrigadora y bloqueador', 'Agua y snacks'],
  ['Original passport', 'Warm clothes and sunscreen', 'Water and snacks'],
  ['Passaporte original', 'Roupas quentes e protetor solar', 'Água e lanches'],
  ['护照原件', '保暖衣物和防晒霜', '饮用水和零食']
)

export default class MainSeeder extends BaseSeeder {
  async run() {
    const email = env.get('ADMIN_EMAIL')
    const password = env.get('ADMIN_PASSWORD')
    if (email && password) {
      await User.firstOrCreate({ email }, { email, password, fullName: 'Administrador' })
      console.log(`Administrador: ${email}`)
    }
    if (env.get('SEED_DEMO', true) === false) return console.log('SEED_DEMO=false: sin datos de ejemplo')
    if (await Tour.query().first()) return console.log('Ya existen tours: se omiten los datos de ejemplo')

    /* ---------- Configuración del sitio ---------- */
    await saveSite({
      heroImageKey: await demoImage('site'),
      tagline: t('Agencia de viajes en Cusco', 'Travel agency in Cusco', 'Agência de viagens em Cusco', '库斯科旅行社'),
      heroTitle: t('Cusco y Machu Picchu, a tu manera', 'Cusco & Machu Picchu, your way', 'Cusco e Machu Picchu, do seu jeito', '库斯科与马丘比丘，随心而行'),
      heroSubtitle: t(
        'Tours, Camino Inca y paquetes desde Cusco, con extensión al Lago Titicaca',
        'Tours, Inca Trail and packages from Cusco, with extensions to Lake Titicaca',
        'Passeios, Trilha Inca e pacotes saindo de Cusco, com extensão ao Lago Titicaca',
        '从库斯科出发的一日游、印加古道与套餐，可延伸至的的喀喀湖'
      ),
      testimonials: [
        { name: 'John D.', country: 'USA', rating: 5, text: t('Organización impecable de Cusco a Puno. Guías puntuales y muy preparados.', 'Flawless organization from Cusco to Puno. Punctual, knowledgeable guides.', 'Organização impecável de Cusco a Puno. Guias pontuais e muito preparados.', '从库斯科到普诺安排得无可挑剔，导游准时且专业。') },
        { name: 'Li W.', country: '中国', rating: 4, text: t('Muy buena experiencia; la altura es exigente, sigan los consejos del guía.', 'Great experience; the altitude is tough, follow the guide’s advice.', 'Ótima experiência; a altitude é exigente, sigam os conselhos do guia.', '体验很好。高海拔比较辛苦，请听从导游的建议。') },
        { name: 'Ana P.', country: 'Brasil', rating: 5, text: t('Nos atendieron en portugués por WhatsApp y ajustaron todo a nuestras fechas.', 'They answered us in Portuguese on WhatsApp and adapted everything to our dates.', 'Fomos atendidos em português pelo WhatsApp e ajustaram tudo às nossas datas.', '他们通过WhatsApp用葡萄牙语回复，并按我们的日期调整了行程。') },
        { name: 'Laura M.', country: 'España', rating: 5, text: t('La noche en Amantaní con la familia local fue lo mejor del viaje.', 'The night in Amantani with the local family was the highlight of our trip.', 'A noite em Amantaní com a família local foi o melhor da viagem.', '在阿曼塔尼岛与当地家庭共度的夜晚是整个旅程的亮点。') },
      ],
    })

    /* ---------- Destinos ---------- */
    const destData: Array<[string, Tr, Tr, string]> = [
      ['cusco-machu-picchu', t('Cusco y Machu Picchu', 'Cusco & Machu Picchu', 'Cusco e Machu Picchu', '库斯科与马丘比丘'), t('La capital inca, el Valle Sagrado y la ciudadela.', 'The Inca capital, the Sacred Valley and the citadel.', 'A capital inca, o Vale Sagrado e a cidadela.', '印加古都、圣谷与马丘比丘古城。'), 'Cusco'],
      ['puno-lago-titicaca', t('Puno y Lago Titicaca', 'Puno & Lake Titicaca', 'Puno e Lago Titicaca', '普诺与的的喀喀湖'), t('Islas flotantes de los Uros, Taquile y Amantaní.', 'Uros floating islands, Taquile and Amantani.', 'Ilhas flutuantes dos Uros, Taquile e Amantaní.', '乌罗斯浮岛、塔基莱岛和阿曼塔尼岛。'), 'Puno'],
      ['arequipa-colca', t('Arequipa y Cañón del Colca', 'Arequipa & Colca Canyon', 'Arequipa e Cânion do Colca', '阿雷基帕与科尔卡峡谷'), t('Ciudad blanca, cóndores y valles andinos.', 'The White City, condors and Andean valleys.', 'Cidade branca, condores e vales andinos.', '白色之城、秃鹰与安第斯山谷。'), 'Arequipa'],
      ['bolivia', t('Bolivia', 'Bolivia', 'Bolívia', '玻利维亚'), t('Copacabana, Isla del Sol y Salar de Uyuni.', 'Copacabana, Isla del Sol and Uyuni Salt Flats.', 'Copacabana, Ilha do Sol e Salar de Uyuni.', '科帕卡巴纳、太阳岛和乌尤尼盐沼。'), 'Bolivia'],
    ]
    const dest: Record<string, number> = {}
    for (const [i, [slug, name, summary, region]] of destData.entries()) {
      const row = await Destination.create({
        slug, name, summary, region, sortOrder: i, isActive: true, isFeatured: true,
        description: t(
          `${summary.es} Te ayudamos a planificar tu visita con tours compartidos o privados.`,
          `${summary.en} We help you plan your visit with shared or private tours.`,
          `${summary.pt} Ajudamos você a planejar sua visita com passeios compartilhados ou privados.`,
          `${summary.zh}我们为您规划拼团或私人行程。`
        ),
        highlights: tl(['Guías locales', 'Salidas diarias'], ['Local guides', 'Daily departures'], ['Guias locais', 'Saídas diárias'], ['本地导游', '每日出发']),
        imageKey: await demoImage('destinations'),
      })
      dest[slug] = row.id
    }

    /* ---------- Tipos de experiencia ---------- */
    const catData: Array<[string, Tr]> = [
      ['tradicional', t('Tours tradicionales', 'Classic tours', 'Passeios tradicionais', '经典游')],
      ['caminatas', t('Camino Inca y caminatas', 'Inca Trail & treks', 'Trilha Inca e caminhadas', '印加古道与徒步')],
      ['privado', t('Tours privados', 'Private tours', 'Passeios privados', '私人游')],
      ['vivencial', t('Turismo vivencial', 'Homestay experiences', 'Turismo de vivência', '民宿体验')],
      ['aventura', t('Aventura', 'Adventure', 'Aventura', '探险')],
      ['paquetes', t('Paquetes', 'Packages', 'Pacotes', '套餐')],
    ]
    const cat: Record<string, number> = {}
    for (const [i, [slug, name]] of catData.entries()) {
      cat[slug] = (await Category.create({ slug, name, description: {}, sortOrder: i, isActive: true, imageKey: null })).id
    }

    /* ---------- Tours ---------- */
    type Seed = {
      d: string; c: string; title: Tr; summary: Tr; days: number; nights: number; hours?: number
      price: number; offer?: number; child?: number; diff: string; group?: string; featured?: boolean
      rating?: number; reviews?: number; it: Tr<Array<{ title: string; description: string }>>
    }
    const tours: Seed[] = [

      { d: 'cusco-machu-picchu', c: 'tradicional', featured: true, days: 2, nights: 1, price: 520, offer: 489, child: 420, diff: 'facil', rating: 4.9, reviews: 51,
        title: t('Machu Picchu 2 días con noche en Aguas Calientes', 'Machu Picchu 2 Days with a Night in Aguas Calientes', 'Machu Picchu 2 dias com noite em Aguas Calientes', '马丘比丘两日游（入住热水镇）'),
        summary: t('Llega sin prisa y entra temprano a la ciudadela, con menos gente.', 'Arrive unhurried and enter the citadel early, with fewer crowds.', 'Chegue sem pressa e entre cedo na cidadela, com menos gente.', '从容抵达，清晨入园，游客更少。'),
        it: tl([d('Cusco – Aguas Calientes', 'Tren por el Valle Sagrado y noche en hotel.'), d('Machu Picchu – Cusco', 'Primer bus de subida, visita guiada y retorno en tren.')],
               [d('Cusco – Aguas Calientes', 'Train through the Sacred Valley and hotel night.'), d('Machu Picchu – Cusco', 'First bus up, guided tour and train back.')],
               [d('Cusco – Aguas Calientes', 'Trem pelo Vale Sagrado e noite no hotel.'), d('Machu Picchu – Cusco', 'Primeiro ônibus de subida, visita guiada e retorno de trem.')],
               [d('库斯科 – 热水镇', '乘火车穿越圣谷，入住酒店。'), d('马丘比丘 – 库斯科', '乘首班巴士上山，导游讲解后乘火车返回。')]) },
      { d: 'cusco-machu-picchu', c: 'caminatas', featured: true, days: 4, nights: 3, price: 790, child: 750, diff: 'exigente', rating: 5, reviews: 88,
        title: t('Camino Inca clásico 4D/3N', 'Classic Inca Trail 4D/3N', 'Trilha Inca clássica 4D/3N', '经典印加古道四日徒步'),
        summary: t('La ruta más famosa de Sudamérica, llegando a Machu Picchu por la Puerta del Sol.', "South America's most famous route, reaching Machu Picchu through the Sun Gate.", 'A rota mais famosa da América do Sul, chegando a Machu Picchu pela Porta do Sol.', '南美最著名的徒步路线，经太阳门抵达马丘比丘。'),
        it: tl([d('Km 82 – Wayllabamba', '12 km de caminata suave.'), d('Paso Warmiwañusca', 'El día más exigente, 4 215 m s. n. m.'), d('Sitios arqueológicos', 'Runkurakay, Sayacmarca y Wiñay Wayna.'), d('Machu Picchu', 'Ingreso por Inti Punku y visita guiada.')],
               [d('Km 82 – Wayllabamba', '12 km of easy hiking.'), d('Warmiwañusca Pass', 'The hardest day, 4,215 m a.s.l.'), d('Archaeological sites', 'Runkurakay, Sayacmarca and Wiñay Wayna.'), d('Machu Picchu', 'Entry through Inti Punku and guided tour.')],
               [d('Km 82 – Wayllabamba', '12 km de caminhada leve.'), d('Passo Warmiwañusca', 'O dia mais exigente, 4.215 m de altitude.'), d('Sítios arqueológicos', 'Runkurakay, Sayacmarca e Wiñay Wayna.'), d('Machu Picchu', 'Entrada por Inti Punku e visita guiada.')],
               [d('82公里处 – 瓦伊利亚班巴', '轻松徒步12公里。'), d('死女人山口', '最艰苦的一天，海拔4215米。'), d('考古遗址', '伦库拉凯、萨亚克马尔卡和温娜瓦伊纳。'), d('马丘比丘', '经太阳门进入并由导游讲解。')]) },
      { d: 'cusco-machu-picchu', c: 'caminatas', days: 2, nights: 1, price: 590, diff: 'moderada', rating: 4.8, reviews: 27,
        title: t('Camino Inca corto 2D/1N', 'Short Inca Trail 2D/1N', 'Trilha Inca curta 2D/1N', '印加古道短线两日游'),
        summary: t('Un día de caminata por el Camino Inca hasta Wiñay Wayna y Machu Picchu.', 'One day hiking the Inca Trail to Wiñay Wayna and Machu Picchu.', 'Um dia de caminhada pela Trilha Inca até Wiñay Wayna e Machu Picchu.', '徒步一天，经温娜瓦伊纳抵达马丘比丘。'),
        it: tl([d('Km 104 – Aguas Calientes', 'Caminata de 12 km pasando por Wiñay Wayna.'), d('Machu Picchu', 'Visita guiada y retorno en tren.')],
               [d('Km 104 – Aguas Calientes', '12 km hike via Wiñay Wayna.'), d('Machu Picchu', 'Guided tour and train back.')],
               [d('Km 104 – Aguas Calientes', 'Caminhada de 12 km passando por Wiñay Wayna.'), d('Machu Picchu', 'Visita guiada e retorno de trem.')],
               [d('104公里处 – 热水镇', '徒步12公里，途经温娜瓦伊纳。'), d('马丘比丘', '导游讲解后乘火车返回。')]) },
      { d: 'cusco-machu-picchu', c: 'caminatas', days: 5, nights: 4, price: 650, diff: 'exigente', rating: 4.9, reviews: 34,
        title: t('Trek Salkantay a Machu Picchu 5D/4N', 'Salkantay Trek to Machu Picchu 5D/4N', 'Trekking Salkantay a Machu Picchu 5D/4N', '萨尔坎泰徒步至马丘比丘五日游'),
        summary: t('Alternativa al Camino Inca: nevados, lagunas y selva alta.', 'The alternative to the Inca Trail: snow peaks, lakes and cloud forest.', 'Alternativa à Trilha Inca: montanhas nevadas, lagoas e selva alta.', '印加古道的替代路线：雪山、湖泊与云雾森林。'),
        it: tl([d('Cusco – Soraypampa', 'Laguna Humantay.'), d('Paso Salkantay', '4 600 m s. n. m.'), d('Selva alta', 'Descenso a Colpapampa.'), d('Llactapata – Aguas Calientes'), d('Machu Picchu')],
               [d('Cusco – Soraypampa', 'Humantay Lake.'), d('Salkantay Pass', '4,600 m a.s.l.'), d('Cloud forest', 'Descent to Colpapampa.'), d('Llactapata – Aguas Calientes'), d('Machu Picchu')],
               [d('Cusco – Soraypampa', 'Lagoa Humantay.'), d('Passo Salkantay', '4.600 m de altitude.'), d('Selva alta', 'Descida a Colpapampa.'), d('Llactapata – Aguas Calientes'), d('Machu Picchu')],
               [d('库斯科 – 索拉伊潘帕', '胡曼泰湖。'), d('萨尔坎泰山口', '海拔4600米。'), d('云雾森林', '下行至科尔帕潘帕。'), d('利亚克塔帕塔 – 热水镇'), d('马丘比丘')]) },
      { d: 'cusco-machu-picchu', c: 'caminatas', featured: true, days: 1, nights: 0, price: 40, child: 30, diff: 'exigente', rating: 4.8, reviews: 46,
        title: t('Laguna Humantay full day', 'Humantay Lake Full Day', 'Lagoa Humantay dia inteiro', '胡曼泰湖一日游'),
        summary: t('Laguna turquesa al pie del nevado Salkantay (4 200 m).', 'Turquoise lake at the foot of Salkantay mountain (4,200 m).', 'Lagoa turquesa aos pés do nevado Salkantay (4.200 m).', '萨尔坎泰雪山脚下的绿松石湖（海拔4200米）。'),
        it: tl([d('Humantay', 'Salida 4:30 a. m., desayuno en Mollepata y 1 h 30 min de subida.')], [d('Humantay', '4:30 a.m. departure, breakfast in Mollepata and a 1.5-hour climb.')], [d('Humantay', 'Saída às 4h30, café da manhã em Mollepata e 1h30 de subida.')], [d('胡曼泰湖', '凌晨4:30出发，在莫列帕塔用早餐，攀登约一个半小时。')]) },
      { d: 'cusco-machu-picchu', c: 'tradicional', days: 1, nights: 0, hours: 5, price: 25, child: 18, diff: 'facil', rating: 4.7, reviews: 58,
        title: t('City tour Cusco', 'Cusco City Tour', 'City tour Cusco', '库斯科城市游'),
        summary: t('Qoricancha, Catedral, Sacsayhuamán, Qenqo, Puca Pucara y Tambomachay.', 'Qoricancha, Cathedral, Sacsayhuaman, Qenqo, Puca Pucara and Tambomachay.', 'Qoricancha, Catedral, Sacsayhuamán, Qenqo, Puca Pucara e Tambomachay.', '太阳神殿、大教堂、萨克塞瓦曼、肯阔、普卡普卡拉和坦波马查伊。'),
        it: tl([d('Centro histórico y 4 sitios arqueológicos')], [d('Historic center and 4 archaeological sites')], [d('Centro histórico e 4 sítios arqueológicos')], [d('历史中心与四处考古遗址')]) },
      { d: 'cusco-machu-picchu', c: 'tradicional', days: 1, nights: 0, hours: 6, price: 35, diff: 'facil', rating: 4.8, reviews: 23,
        title: t('Maras y Moray', 'Maras & Moray', 'Maras e Moray', '马拉斯盐田与莫雷梯田'),
        summary: t('Salineras de Maras y los andenes circulares de Moray.', 'Maras salt pans and the circular terraces of Moray.', 'Salinas de Maras e os terraços circulares de Moray.', '马拉斯盐田与莫雷圆形梯田。'),
        it: tl([d('Moray – Maras', 'Visita guiada a ambos sitios y parada en Chinchero.')], [d('Moray – Maras', 'Guided visit to both sites and a stop in Chinchero.')], [d('Moray – Maras', 'Visita guiada aos dois sítios e parada em Chinchero.')], [d('莫雷 – 马拉斯', '导游讲解两处景点，途经钦切罗。')]) },
      { d: 'puno-lago-titicaca', c: 'tradicional', featured: true, days: 1, nights: 0, price: 45, offer: 38, child: 30, diff: 'facil', rating: 4.9, reviews: 22,
        title: t('Islas Uros y Taquile full day', 'Uros & Taquile Islands Full Day', 'Ilhas Uros e Taquile dia inteiro', '乌罗斯岛与塔基莱岛一日游'),
        summary: t('Navega el lago navegable más alto del mundo y conoce dos culturas vivas.', 'Sail the world’s highest navigable lake and meet two living cultures.', 'Navegue no lago navegável mais alto do mundo e conheça duas culturas vivas.', '畅游世界上海拔最高的可通航湖泊，探访两种鲜活的文化。'),
        it: tl([d('Islas flotantes de los Uros', 'Visita a una familia uro y paseo en balsa de totora.'), d('Isla Taquile', 'Caminata, almuerzo típico y textilería declarada Patrimonio UNESCO.')],
               [d('Uros floating islands', 'Visit a Uros family and ride a reed boat.'), d('Taquile Island', 'Hike, traditional lunch and UNESCO-listed textile art.')],
               [d('Ilhas flutuantes dos Uros', 'Visita a uma família uro e passeio em barco de totora.'), d('Ilha Taquile', 'Caminhada, almoço típico e tecelagem reconhecida pela UNESCO.')],
               [d('乌罗斯浮岛', '拜访乌罗斯家庭，乘坐芦苇船。'), d('塔基莱岛', '徒步、品尝传统午餐，欣赏联合国教科文组织认定的纺织艺术。')]) },
      { d: 'puno-lago-titicaca', c: 'tradicional', days: 1, nights: 0, hours: 3, price: 20, child: 15, diff: 'facil', rating: 4.8, reviews: 41,
        title: t('Islas flotantes de los Uros (medio día)', 'Uros Floating Islands (half day)', 'Ilhas flutuantes dos Uros (meio dia)', '乌罗斯浮岛半日游'),
        summary: t('Tour corto ideal para tu primer día en Puno.', 'A short tour, ideal for your first day in Puno.', 'Passeio curto, ideal para o primeiro dia em Puno.', '短途行程，适合抵达普诺的第一天。'),
        it: tl([d('Uros', 'Explicación de la construcción de las islas y tiempo libre.')], [d('Uros', 'How the islands are built and free time.')], [d('Uros', 'Como as ilhas são construídas e tempo livre.')], [d('乌罗斯', '了解浮岛的建造方式并自由活动。')]) },
      { d: 'puno-lago-titicaca', c: 'vivencial', days: 2, nights: 1, price: 69, child: 50, diff: 'moderada', rating: 5, reviews: 18,
        title: t('Vivencial Uros, Amantaní y Taquile 2D/1N', 'Uros, Amantani & Taquile Homestay 2D/1N', 'Vivência Uros, Amantaní e Taquile 2D/1N', '乌罗斯、阿曼塔尼与塔基莱民宿两日游'),
        summary: t('Duerme con una familia local y comparte su vida en la isla.', 'Sleep with a local family and share their island life.', 'Durma com uma família local e compartilhe a vida na ilha.', '入住当地家庭，体验岛上生活。'),
        it: tl([d('Uros – Amantaní', 'Almuerzo y cena con la familia anfitriona; noche de fiesta tradicional.'), d('Taquile – Puno', 'Caminata en Taquile y retorno a Puno.')],
               [d('Uros – Amantani', 'Lunch and dinner with the host family; traditional party night.'), d('Taquile – Puno', 'Hike on Taquile and return to Puno.')],
               [d('Uros – Amantaní', 'Almoço e jantar com a família anfitriã; noite de festa tradicional.'), d('Taquile – Puno', 'Caminhada em Taquile e retorno a Puno.')],
               [d('乌罗斯 – 阿曼塔尼', '与寄宿家庭共进午餐和晚餐，晚上参加传统聚会。'), d('塔基莱 – 普诺', '在塔基莱岛徒步后返回普诺。')]) },
      { d: 'puno-lago-titicaca', c: 'tradicional', days: 1, nights: 0, hours: 4, price: 25, diff: 'facil', rating: 4.7, reviews: 12,
        title: t('Chullpas de Sillustani', 'Sillustani Burial Towers', 'Chullpas de Sillustani', '西卢斯塔尼墓塔'),
        summary: t('Torres funerarias preincas junto a la laguna Umayo al atardecer.', 'Pre-Inca burial towers by Lake Umayo at sunset.', 'Torres funerárias pré-incas junto à lagoa Umayo ao pôr do sol.', '日落时分，乌马约湖畔的前印加墓塔。'),
        it: tl([d('Sillustani', 'Recorrido guiado y visita a una casa rural.')], [d('Sillustani', 'Guided walk and visit to a rural home.')], [d('Sillustani', 'Passeio guiado e visita a uma casa rural.')], [d('西卢斯塔尼', '导游讲解并参观乡村农家。')]) },
      { d: 'puno-lago-titicaca', c: 'aventura', days: 1, nights: 0, hours: 5, price: 55, diff: 'moderada', group: 'privado',
        title: t('Kayak en el Lago Titicaca', 'Kayaking on Lake Titicaca', 'Caiaque no Lago Titicaca', '的的喀喀湖皮划艇'),
        summary: t('Rema entre totorales hasta las islas de los Uros.', 'Paddle through reed beds to the Uros islands.', 'Reme entre os juncais até as ilhas dos Uros.', '穿过芦苇丛划向乌罗斯岛。'),
        it: tl([d('Llachón – Uros', 'Instrucción, 2 h de kayak y almuerzo.')], [d('Llachon – Uros', 'Briefing, 2 hours of kayaking and lunch.')], [d('Llachón – Uros', 'Instrução, 2 h de caiaque e almoço.')], [d('利亚琼 – 乌罗斯', '安全讲解、两小时皮划艇及午餐。')]) },
      { d: 'cusco-machu-picchu', c: 'tradicional', featured: true, days: 1, nights: 0, price: 389, offer: 359, diff: 'facil', rating: 4.9, reviews: 64,
        title: t('Machu Picchu full day en tren', 'Machu Picchu Full Day by Train', 'Machu Picchu dia inteiro de trem', '火车马丘比丘一日游'),
        summary: t('Visita guiada a la ciudadela inca en un solo día desde Cusco.', 'Guided visit to the Inca citadel in a single day from Cusco.', 'Visita guiada à cidadela inca em um só dia saindo de Cusco.', '从库斯科出发，一天游览印加古城。'),
        it: tl([d('Cusco – Machu Picchu – Cusco', 'Tren, bus de subida y 2 h de visita guiada.')], [d('Cusco – Machu Picchu – Cusco', 'Train, bus up and 2-hour guided tour.')], [d('Cusco – Machu Picchu – Cusco', 'Trem, ônibus de subida e 2 h de visita guiada.')], [d('库斯科 – 马丘比丘 – 库斯科', '乘火车和巴士上山，导游讲解两小时。')]) },
      { d: 'cusco-machu-picchu', c: 'tradicional', featured: true, days: 1, nights: 0, price: 75, offer: 65, diff: 'facil', rating: 4.8, reviews: 37,
        title: t('Valle Sagrado de los Incas', 'Sacred Valley of the Incas', 'Vale Sagrado dos Incas', '印加圣谷'),
        summary: t('Pisac, Ollantaytambo y Chinchero con almuerzo buffet.', 'Pisac, Ollantaytambo and Chinchero with buffet lunch.', 'Pisac, Ollantaytambo e Chinchero com almoço buffet.', '皮萨克、奥扬泰坦博和钦切罗，含自助午餐。'),
        it: tl([d('Valle Sagrado', 'Mercado de Pisac, fortaleza de Ollantaytambo y Chinchero.')], [d('Sacred Valley', 'Pisac market, Ollantaytambo fortress and Chinchero.')], [d('Vale Sagrado', 'Mercado de Pisac, fortaleza de Ollantaytambo e Chinchero.')], [d('圣谷', '皮萨克市场、奥扬泰坦博要塞和钦切罗。')]) },
      { d: 'cusco-machu-picchu', c: 'caminatas', days: 1, nights: 0, price: 45, diff: 'exigente', rating: 4.6, reviews: 29,
        title: t('Montaña de 7 Colores', 'Rainbow Mountain', 'Montanha das 7 Cores', '彩虹山'),
        summary: t('Caminata de alta montaña a Vinicunca (5 036 m).', 'High-altitude hike to Vinicunca (5,036 m).', 'Caminhada de alta montanha até Vinicunca (5.036 m).', '徒步登上海拔5036米的彩虹山。'),
        it: tl([d('Vinicunca', 'Salida 4:00 a. m., 2 h de subida y retorno por la tarde.')], [d('Vinicunca', '4:00 a.m. departure, 2-hour ascent, return in the afternoon.')], [d('Vinicunca', 'Saída às 4h, 2 h de subida e retorno à tarde.')], [d('彩虹山', '凌晨4点出发，攀登约两小时，下午返回。')]) },
      { d: 'arequipa-colca', c: 'tradicional', days: 2, nights: 1, price: 95, diff: 'moderada', rating: 4.8, reviews: 15,
        title: t('Cañón del Colca 2D/1N', 'Colca Canyon 2D/1N', 'Cânion do Colca 2D/1N', '科尔卡峡谷两日游'),
        summary: t('Baños termales y el vuelo del cóndor en la Cruz del Cóndor.', 'Hot springs and condors soaring at Cruz del Condor.', 'Águas termais e o voo do condor na Cruz del Cóndor.', '温泉与秃鹰十字观景台的秃鹰飞翔。'),
        it: tl([d('Arequipa – Chivay', 'Reserva de vicuñas y aguas termales.'), d('Cruz del Cóndor – Arequipa', 'Avistamiento de cóndores y retorno.')],
               [d('Arequipa – Chivay', 'Vicuña reserve and hot springs.'), d('Cruz del Condor – Arequipa', 'Condor watching and return.')],
               [d('Arequipa – Chivay', 'Reserva de vicunhas e águas termais.'), d('Cruz del Cóndor – Arequipa', 'Observação de condores e retorno.')],
               [d('阿雷基帕 – 奇瓦伊', '小羊驼保护区与温泉。'), d('秃鹰十字 – 阿雷基帕', '观赏秃鹰后返回。')]) },
      { d: 'cusco-machu-picchu', c: 'paquetes', featured: true, days: 6, nights: 5, price: 890, offer: 820, diff: 'moderada', rating: 4.9, reviews: 20,
        title: t('Cusco, Machu Picchu y Titicaca 6D/5N', 'Cusco, Machu Picchu & Titicaca 6D/5N', 'Cusco, Machu Picchu e Titicaca 6D/5N', '库斯科、马丘比丘与的的喀喀湖六日游'),
        summary: t('Lo mejor del sur andino en un solo viaje, con hoteles incluidos.', 'The best of the southern Andes in one trip, hotels included.', 'O melhor dos Andes do sul em uma só viagem, com hotéis incluídos.', '一次玩遍安第斯南部精华，含酒店。'),
        it: tl([d('Llegada a Cusco'), d('City tour'), d('Valle Sagrado'), d('Machu Picchu'), d('Bus turístico a Puno'), d('Uros y Taquile')],
               [d('Arrival in Cusco'), d('City tour'), d('Sacred Valley'), d('Machu Picchu'), d('Tourist bus to Puno'), d('Uros & Taquile')],
               [d('Chegada a Cusco'), d('City tour'), d('Vale Sagrado'), d('Machu Picchu'), d('Ônibus turístico a Puno'), d('Uros e Taquile')],
               [d('抵达库斯科'), d('城市游'), d('圣谷'), d('马丘比丘'), d('乘旅游巴士前往普诺'), d('乌罗斯与塔基莱')]) },
    ]

    // Prioridad: los tours se ordenan según el orden de su destino (Cusco primero)
    const rank = (slug: string) => destData.findIndex((x) => x[0] === slug)
    tours.sort((a, b) => rank(a.d) - rank(b.d))

    for (const [i, s] of tours.entries()) {
      const slug = s.title.es!.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const tour = await Tour.create({
        destinationId: dest[s.d], categoryId: cat[s.c], slug, title: s.title, summary: s.summary,
        description: t(
          `${s.summary.es}\n\nOperado por guías locales. Salidas todos los días, sujetas a disponibilidad y clima.`,
          `${s.summary.en}\n\nOperated by local guides. Daily departures, subject to availability and weather.`,
          `${s.summary.pt}\n\nOperado por guias locais. Saídas diárias, sujeitas a disponibilidade e clima.`,
          `${s.summary.zh}\n\n由本地导游带领。每日出发，视名额与天气而定。`
        ),
        highlights: tl([s.summary.es!], [s.summary.en!], [s.summary.pt!], [s.summary.zh!]),
        itinerary: s.it, includes: INCLUDES, excludes: EXCLUDES, recommendations: BRING,
        durationDays: s.days, durationNights: s.nights, durationHours: s.hours ?? null,
        price: s.price, offerPrice: s.offer ?? null, childPrice: s.child ?? null, currency: 'USD',
        difficulty: s.diff, groupType: s.group ?? 'compartido', rating: s.rating ?? null, reviewsCount: s.reviews ?? 0,
        location: destData.find((x) => x[0] === s.d)?.[3] ?? null, coverKey: await demoImage('tours'),
        isFeatured: !!s.featured, isActive: true, sortOrder: i,
      } as any)
      await tour.related('images').createMany([
        { imageKey: await demoImage('tours'), alt: {}, sortOrder: 0 },
        { imageKey: await demoImage('tours'), alt: {}, sortOrder: 1 },
      ] as any)
    }

    /* ---------- Preguntas frecuentes ---------- */
    const faqs: Array<[Tr, Tr]> = [
      [t('¿Con cuánta anticipación debo reservar Machu Picchu y el Camino Inca?', 'How far ahead should I book Machu Picchu and the Inca Trail?', 'Com quanta antecedência devo reservar Machu Picchu e a Trilha Inca?', '马丘比丘和印加古道需要提前多久预订？'),
       t('Machu Picchu: de 1 a 2 meses en temporada alta. Camino Inca: los permisos son limitados y suelen agotarse con 4 a 6 meses de anticipación; en febrero el camino está cerrado por mantenimiento.', 'Machu Picchu: 1–2 months ahead in high season. Inca Trail: permits are limited and usually sell out 4–6 months ahead; the trail is closed in February for maintenance.', 'Machu Picchu: de 1 a 2 meses na alta temporada. Trilha Inca: as licenças são limitadas e costumam esgotar com 4 a 6 meses de antecedência; em fevereiro a trilha fica fechada para manutenção.', '马丘比丘：旺季建议提前1至2个月。印加古道：许可证数量有限，通常提前4至6个月售罄；每年2月古道关闭维护。')],
      [t('¿Qué es el boleto turístico del Cusco?', 'What is the Cusco Tourist Ticket?', 'O que é o bilhete turístico de Cusco?', '什么是库斯科旅游通票？'),
       t('Es la entrada combinada a los sitios arqueológicos y museos de Cusco y el Valle Sagrado. En nuestros tours te indicamos si está incluido.', 'It is the combined entry to the archaeological sites and museums of Cusco and the Sacred Valley. Each tour states whether it is included.', 'É a entrada combinada para os sítios arqueológicos e museus de Cusco e do Vale Sagrado. Em cada passeio indicamos se está incluído.', '这是库斯科及圣谷考古遗址和博物馆的联票。每个行程都会注明是否包含。')],
      [t('¿Cuál es la mejor época para viajar?', 'When is the best time to travel?', 'Qual é a melhor época para viajar?', '什么时候去最好？'),
       t('De abril a octubre es temporada seca. En diciembre–marzo llueve más, pero los paisajes están verdes y hay menos gente.', 'April to October is the dry season. December–March is rainier, but greener and less crowded.', 'De abril a outubro é a estação seca. De dezembro a março chove mais, mas tudo fica verde e com menos turistas.', '4月至10月为旱季。12月至3月雨水较多，但风景更绿、游客较少。')],
      [t('¿Cómo evito el mal de altura?', 'How do I avoid altitude sickness?', 'Como evitar o mal de altitude?', '如何预防高原反应？'),
       t('Descansa el primer día, hidrátate, come ligero y evita el alcohol. Puno está a 3 800 m y Cusco a 3 400 m.', 'Rest on day one, drink water, eat light and avoid alcohol. Puno is at 3,800 m and Cusco at 3,400 m.', 'Descanse no primeiro dia, hidrate-se, coma leve e evite álcool. Puno fica a 3.800 m e Cusco a 3.400 m.', '第一天多休息、多喝水、饮食清淡、避免饮酒。普诺海拔3800米，库斯科3400米。')],
      [t('¿Qué medios de pago aceptan?', 'Which payment methods do you accept?', 'Quais formas de pagamento vocês aceitam?', '支持哪些付款方式？'),
       t('Transferencia bancaria, tarjeta y efectivo. Te enviamos el detalle al confirmar la reserva.', 'Bank transfer, card and cash. We send the details when your booking is confirmed.', 'Transferência bancária, cartão e dinheiro. Enviamos os detalhes ao confirmar a reserva.', '银行转账、银行卡和现金。确认预订后我们会发送详细信息。')],
      [t('¿Los tours incluyen recojo del hotel?', 'Do tours include hotel pickup?', 'Os passeios incluem busca no hotel?', '行程包含酒店接送吗？'),
       t('Sí, en hoteles del centro histórico. Para otras zonas coordinamos un punto de encuentro.', 'Yes, from hotels in the historic center. For other areas we arrange a meeting point.', 'Sim, em hotéis do centro histórico. Para outras áreas combinamos um ponto de encontro.', '是的，历史中心区的酒店可接送；其他区域我们会约定集合地点。')],
      [t('¿Puedo viajar con niños?', 'Can I travel with children?', 'Posso viajar com crianças?', '可以带孩子出行吗？'),
       t('Sí. Muchos tours tienen tarifa de niño; consúltanos por la altura y la duración de las caminatas.', 'Yes. Many tours have a child rate; ask us about altitude and hike length.', 'Sim. Muitos passeios têm tarifa infantil; consulte-nos sobre altitude e duração das caminhadas.', '可以。许多行程有儿童价格，请就海拔和徒步时长咨询我们。')],
      [t('¿Puedo cancelar o cambiar la fecha?', 'Can I cancel or change the date?', 'Posso cancelar ou mudar a data?', '可以取消或改期吗？'),
       t('Sí, según las condiciones de cada servicio. Los boletos de tren y Machu Picchu tienen reglas propias.', 'Yes, depending on each service’s terms. Train and Machu Picchu tickets have their own rules.', 'Sim, conforme as condições de cada serviço. Bilhetes de trem e de Machu Picchu têm regras próprias.', '可以，视各项服务条款而定。火车票和马丘比丘门票有各自的规定。')],
    ]
    for (const [i, [question, answer]] of faqs.entries()) await Faq.create({ question, answer, sortOrder: i, isActive: true, tourId: null })

    /* ---------- Páginas "Info útil" ---------- */
    const pages: Array<[string, Tr, Tr, boolean]> = [
      ['boleto-turistico-cusco', t('Boleto turístico del Cusco', 'Cusco Tourist Ticket', 'Bilhete turístico de Cusco', '库斯科旅游通票'), t('Incluye el ingreso a Sacsayhuamán, Qenqo, Pisac, Ollantaytambo, Moray, Chinchero y varios museos. Hay versión integral (10 días) y parciales por circuito.', 'It covers Sacsayhuaman, Qenqo, Pisac, Ollantaytambo, Moray, Chinchero and several museums. There is a full version (10 days) and partial circuit versions.', 'Inclui a entrada em Sacsayhuamán, Qenqo, Pisac, Ollantaytambo, Moray, Chinchero e vários museus. Há versão integral (10 dias) e parciais por circuito.', '包含萨克塞瓦曼、肯阔、皮萨克、奥扬泰坦博、莫雷、钦切罗及多座博物馆的门票。有全票（10天有效）和按线路划分的部分票。'), true],
      ['boletos-machu-picchu', t('Boletos a Machu Picchu', 'Machu Picchu tickets', 'Ingressos para Machu Picchu', '马丘比丘门票'), t('Los boletos tienen cupos por horario y circuito. Recomendamos reservar con 1 a 2 meses de anticipación.', 'Tickets are limited by time slot and circuit. We recommend booking 1–2 months ahead.', 'Os ingressos têm vagas por horário e circuito. Recomendamos reservar com 1 a 2 meses de antecedência.', '门票按时段和路线限量，建议提前1至2个月预订。'), true],
      ['camino-inca-permisos', t('Camino Inca: permisos y temporada', 'Inca Trail: permits & season', 'Trilha Inca: licenças e temporada', '印加古道：许可证与季节'), t('Solo agencias autorizadas pueden tramitar los permisos, que son nominales y con pasaporte. El camino cierra cada febrero. La mejor época es de mayo a septiembre.', 'Only licensed agencies can obtain permits, which are issued by name with a passport. The trail closes every February. The best season is May to September.', 'Somente agências autorizadas podem emitir as licenças, nominais e com passaporte. A trilha fecha todo mês de fevereiro. A melhor época é de maio a setembro.', '只有授权旅行社可以办理许可证，需实名并提供护照。古道每年2月关闭，最佳季节为5月至9月。'), true],
      ['clima-y-mejor-epoca', t('Clima y mejor época', 'Weather & best time', 'Clima e melhor época', '气候与最佳旅行时间'), t('Temporada seca de abril a octubre; lluvias de diciembre a marzo. Las noches en el altiplano son frías todo el año.', 'Dry season from April to October; rain from December to March. Nights on the high plateau are cold all year.', 'Estação seca de abril a outubro; chuvas de dezembro a março. As noites no altiplano são frias o ano todo.', '4月至10月为旱季，12月至3月为雨季。高原夜晚全年寒冷。'), true],
      ['como-llegar', t('Cómo llegar y transporte', 'Getting there & transport', 'Como chegar e transporte', '交通指南'), t('Vuelos a Cusco y Juliaca (para Puno). Entre Cusco y Puno hay buses turísticos de día y el tren Titicaca.', 'Flights to Cusco and Juliaca (for Puno). Between Cusco and Puno there are daytime tourist buses and the Titicaca train.', 'Voos para Cusco e Juliaca (para Puno). Entre Cusco e Puno há ônibus turísticos diurnos e o trem Titicaca.', '可飞往库斯科和胡利亚卡（前往普诺）。库斯科与普诺之间有白天的旅游巴士和的的喀喀火车。'), true],
      ['terminos-y-condiciones', t('Términos y condiciones', 'Terms & conditions', 'Termos e condições', '条款与条件'), t('Condiciones de reserva, pago y cancelación. Edita este texto desde el panel.', 'Booking, payment and cancellation terms. Edit this text from the admin panel.', 'Condições de reserva, pagamento e cancelamento. Edite este texto no painel.', '预订、付款与取消条款。请在后台编辑此内容。'), false],
    ]
    for (const [i, [slug, title, body, menu]] of pages.entries()) {
      await Page.create({ slug, title, summary: {}, body, showInMenu: menu, sortOrder: i, isActive: true, imageKey: menu ? await demoImage('pages') : null })
    }

    console.log(`Datos de ejemplo: ${destData.length} destinos, ${catData.length} tipos, ${tours.length} tours, ${faqs.length} FAQ, ${pages.length} páginas`)
  }
}
