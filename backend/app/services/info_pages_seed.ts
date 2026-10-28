import Page from '#models/page'
import type { Tr } from '#services/i18n'

/**
 * Contenido inicial del mega-menú "Info útil" (textos propios, breves y generales).
 * El administrador los amplía y traduce desde Panel → Páginas "Info útil".
 * Solo se ejecuta una vez: cuando ninguna página tiene grupo asignado.
 */
type Def = {
  slug: string
  group: string
  sub?: Tr
  highlight?: boolean
  title: Tr
  body: Tr
}

const t = (es: string, en: string, pt: string, zh: string): Tr => ({ es, en, pt, zh })
const b = (es: string, en: string): Tr => ({ es, en })

const MONTHS = {
  enefeb: t('Enero - Febrero', 'January - February', 'Janeiro - Fevereiro', '一月 - 二月'),
  marabr: t('Marzo - Abril', 'March - April', 'Março - Abril', '三月 - 四月'),
  mayjun: t('Mayo - Junio', 'May - June', 'Maio - Junho', '五月 - 六月'),
  julago: t('Julio - Agosto', 'July - August', 'Julho - Agosto', '七月 - 八月'),
  sepoct: t('Septiembre - Octubre', 'September - October', 'Setembro - Outubro', '九月 - 十月'),
  novdic: t('Noviembre - Diciembre', 'November - December', 'Novembro - Dezembro', '十一月 - 十二月'),
}

const PAGES: Def[] = [
  /* ---------- Datos para el viajero ---------- */
  {
    slug: 'salud-y-altura', group: 'viajero',
    title: t('Salud y cuidado en la altura', 'Health & altitude care', 'Saúde e cuidados com a altitude', '健康与高原反应'),
    body: b(
      'Cusco está a más de 3 300 m de altitud. Es normal sentir cansancio, dolor de cabeza o falta de aire los primeros días.\n\nRecomendaciones: descansa la tarde de llegada, toma agua y mate de coca, come ligero y evita el alcohol las primeras 24 horas. Si tienes una condición médica, consulta a tu médico antes de viajar.',
      'Cusco sits above 3,300 m. Tiredness, headaches or shortness of breath are common during the first days.\n\nTips: rest on your arrival afternoon, drink water and coca tea, eat light and avoid alcohol for the first 24 hours. If you have a medical condition, check with your doctor before travelling.'
    ),
  },
  {
    slug: 'consejos-huayna-picchu', group: 'viajero',
    title: t('Consejos para subir la montaña Huayna Picchu', 'Tips for climbing Huayna Picchu', 'Dicas para subir a montanha Huayna Picchu', '攀登瓦纳比丘山的建议'),
    body: b(
      'El sendero es empinado y con escalones de piedra estrechos; no se recomienda a personas con vértigo.\n\nReserva con anticipación (los cupos por día son limitados), llega a tu horario de ingreso, lleva agua, calzado con buena suela y deja la mochila grande en el depósito.',
      'The trail is steep with narrow stone steps; it is not recommended for people with vertigo.\n\nBook early (daily slots are limited), arrive on time for your entry slot, bring water and shoes with good grip, and leave large backpacks in storage.'
    ),
  },
  {
    slug: 'preguntas-camino-inca', group: 'viajero',
    title: t('Preguntas frecuentes sobre el Camino Inca', 'Inca Trail FAQ', 'Perguntas frequentes sobre a Trilha Inca', '印加古道常见问题'),
    body: b(
      '¿Necesito permiso? Sí, y solo lo tramitan agencias autorizadas con tu pasaporte.\n\n¿Cuándo está cerrado? Cada febrero, por mantenimiento.\n\n¿Qué tan difícil es? Exigente por la altura (hasta unos 4 200 m en el paso más alto), pero accesible para personas activas con buena aclimatación.',
      'Do I need a permit? Yes, and only licensed agencies can request it with your passport.\n\nWhen is it closed? Every February, for maintenance.\n\nHow hard is it? Demanding due to altitude (around 4,200 m at the highest pass), but doable for active people who acclimatize well.'
    ),
  },
  {
    slug: 'antes-del-camino-inca', group: 'viajero',
    title: t('Qué saber antes de hacer el Camino Inca', 'What to know before the Inca Trail', 'O que saber antes da Trilha Inca', '走印加古道前须知'),
    body: b(
      'Llega a Cusco al menos dos días antes para aclimatarte. Viaja con el mismo pasaporte con el que reservaste.\n\nLleva ropa en capas, poncho de lluvia, linterna, bloqueador y repelente. Los porteadores cargan el equipo de campamento; tú llevas una mochila de día.',
      'Arrive in Cusco at least two days early to acclimatize. Travel with the same passport you booked with.\n\nPack layers, a rain poncho, a headlamp, sunscreen and insect repellent. Porters carry the camping gear; you carry a daypack.'
    ),
  },
  {
    slug: 'tiempo-en-machu-picchu', group: 'viajero',
    title: t('¿Cuánto tiempo se puede estar en Machu Picchu?', 'How long can you stay at Machu Picchu?', 'Quanto tempo se pode ficar em Machu Picchu?', '马丘比丘可以停留多久？'),
    body: b(
      'El ingreso es por horario y por circuito, y la visita sigue un recorrido de una sola dirección. En general dura entre 2 y 4 horas según el circuito elegido.\n\nNo se permite reingresar con el mismo boleto. Si quieres más tiempo, combina circuitos o añade una montaña.',
      'Entry is by time slot and circuit, and the visit follows a one-way route. It usually lasts 2 to 4 hours depending on the circuit.\n\nRe-entry with the same ticket is not allowed. For more time, combine circuits or add a mountain.'
    ),
  },

  /* ---------- Geografía y climas ---------- */
  {
    slug: 'clima-costa', group: 'clima',
    title: t('Clima en la costa', 'Climate on the coast', 'Clima no litoral', '沿海气候'),
    body: b(
      'La costa peruana es desértica y casi no llueve. De diciembre a marzo es verano: soleado y caluroso.\n\nDe junio a septiembre el cielo suele estar nublado y hay una llovizna fina (garúa), sobre todo en Lima.',
      'The Peruvian coast is a desert with almost no rain. December to March is summer: sunny and hot.\n\nFrom June to September skies are usually grey with a fine drizzle (garúa), especially in Lima.'
    ),
  },
  {
    slug: 'clima-sierra', group: 'clima',
    title: t('Clima en la sierra: Cusco y Machu Picchu', 'Highlands climate: Cusco & Machu Picchu', 'Clima na serra: Cusco e Machu Picchu', '山区气候：库斯科与马丘比丘'),
    body: b(
      'Temporada seca de abril a octubre: días soleados y noches frías. Temporada de lluvias de noviembre a marzo, con aguaceros por la tarde.\n\nMachu Picchu está más bajo que Cusco y es más templado y húmedo. Lleva ropa en capas todo el año.',
      'Dry season from April to October: sunny days and cold nights. Rainy season from November to March, with afternoon showers.\n\nMachu Picchu is lower than Cusco, milder and more humid. Pack layers all year round.'
    ),
  },
  {
    slug: 'clima-selva', group: 'clima',
    title: t('Clima en la selva', 'Climate in the rainforest', 'Clima na selva', '雨林气候'),
    body: b(
      'Cálido y húmedo todo el año. Las lluvias son más intensas de diciembre a abril.\n\nLleva ropa ligera de manga larga, repelente y botas o zapatos que puedan mojarse.',
      'Warm and humid all year. Rains are heavier from December to April.\n\nBring light long-sleeved clothing, insect repellent and footwear that can get wet.'
    ),
  },

  /* ---------- Boletos turísticos ---------- */
  {
    slug: 'boleto-huayna-picchu', group: 'boletos', highlight: true,
    title: t('Boleto para montaña Huayna Picchu', 'Huayna Picchu mountain ticket', 'Ingresso para a montanha Huayna Picchu', '瓦纳比丘山门票'),
    body: b(
      'Se compra junto con el ingreso a Machu Picchu y tiene cupos diarios limitados por horario. En temporada alta se agota con semanas o meses de anticipación.\n\nEscríbenos y te ayudamos a reservarlo con tu tour.',
      'It is bought together with Machu Picchu entry and has limited daily slots per time. In high season it sells out weeks or months ahead.\n\nWrite to us and we will help you book it with your tour.'
    ),
  },
  {
    slug: 'boleto-montana-machu-picchu', group: 'boletos',
    title: t('Boleto para Machu Picchu Montaña', 'Machu Picchu Mountain ticket', 'Ingresso para a Montanha Machu Picchu', '马丘比丘山门票'),
    body: b(
      'Es la montaña más alta del santuario, con un camino de escalones largo pero menos expuesto que Huayna Picchu. Ofrece una vista completa de la ciudadela.\n\nTambién tiene cupos por horario; reserva con tiempo.',
      'It is the highest mountain in the sanctuary, with a long stepped path that is less exposed than Huayna Picchu. It offers a full view of the citadel.\n\nIt also has timed slots; book early.'
    ),
  },
  {
    slug: 'boleto-circuito-religioso', group: 'boletos',
    title: t('Boleto del circuito religioso', 'Religious circuit ticket', 'Ingresso do circuito religioso', '宗教路线门票'),
    body: b(
      'Permite visitar varios templos y museos religiosos del centro histórico de Cusco, como la Catedral y el templo de San Blas.\n\nRevisa los horarios de cada recinto: algunos cierran en horas de misa.',
      'It lets you visit several churches and religious museums in Cusco’s historic center, such as the Cathedral and San Blas church.\n\nCheck each site’s hours: some close during mass.'
    ),
  },

  /* ---------- Vuelos - trenes - buses ---------- */
  {
    slug: 'vuelos-a-cusco', group: 'transporte',
    title: t('Vuelos a Cusco', 'Flights to Cusco', 'Voos para Cusco', '飞往库斯科的航班'),
    body: b(
      'Hay vuelos diarios desde Lima y otras ciudades del Perú. El trayecto desde Lima dura alrededor de una hora y cuarto.\n\nPrefiere los vuelos de la mañana: el clima en Cusco suele ser más estable a esa hora.',
      'There are daily flights from Lima and other Peruvian cities. The flight from Lima takes about an hour and a quarter.\n\nPrefer morning flights: weather in Cusco is usually more stable then.'
    ),
  },
  {
    slug: 'trenes-a-machu-picchu', group: 'transporte',
    title: t('Trenes a Machu Picchu', 'Trains to Machu Picchu', 'Trens para Machu Picchu', '前往马丘比丘的火车'),
    body: b(
      'Los trenes salen de Cusco (según temporada) u Ollantaytambo hacia Aguas Calientes, el pueblo al pie de Machu Picchu. Hay servicios turísticos de distintas categorías.\n\nLleva solo equipaje de mano: los trenes tienen límite de peso y tamaño.',
      'Trains leave from Cusco (depending on the season) or Ollantaytambo to Aguas Calientes, the town below Machu Picchu. There are tourist services in several classes.\n\nTravel with hand luggage only: trains have weight and size limits.'
    ),
  },
  {
    slug: 'buses-a-cusco', group: 'transporte',
    title: t('Buses a Cusco', 'Buses to Cusco', 'Ônibus para Cusco', '前往库斯科的巴士'),
    body: b(
      'Hay buses desde Lima, Arequipa y Puno. Entre Puno y Cusco existen buses turísticos de día con paradas en sitios de interés.\n\nElige empresas formales y, para viajes largos, servicios con asiento cama.',
      'There are buses from Lima, Arequipa and Puno. Between Puno and Cusco there are daytime tourist buses with stops at points of interest.\n\nChoose licensed companies and, for long trips, services with fully reclining seats.'
    ),
  },
  {
    slug: 'buses-a-machu-picchu', group: 'transporte',
    title: t('Buses de subida a Machu Picchu', 'Shuttle buses up to Machu Picchu', 'Ônibus de subida a Machu Picchu', '上山巴士'),
    body: b(
      'Desde Aguas Calientes, buses de ida y vuelta suben a la entrada de la ciudadela en unos 25 a 30 minutos por una carretera de curvas.\n\nTambién se puede subir caminando (aprox. 1 h 30 min, cuesta empinada).',
      'From Aguas Calientes, round-trip shuttles reach the citadel entrance in about 25–30 minutes along a winding road.\n\nYou can also hike up (about 1 h 30 min, steep).'
    ),
  },

  /* ---------- Emergencias ---------- */
  {
    slug: 'telefonos-de-emergencia', group: 'emergencia',
    title: t('Teléfonos de emergencia', 'Emergency phone numbers', 'Telefones de emergência', '紧急电话'),
    body: b(
      'Policía: 105\nBomberos: 116\nAmbulancia (SAMU): 106\n\nGuarda también el número de tu agencia y de tu embajada. Verifica estos números al llegar al Perú.',
      'Police: 105\nFire department: 116\nAmbulance (SAMU): 106\n\nAlso save your agency’s and your embassy’s numbers. Double-check these numbers when you arrive in Peru.'
    ),
  },

  /* ---------- Festividades ---------- */
  {
    slug: 'ano-nuevo-en-cusco', group: 'festividades', sub: MONTHS.enefeb,
    title: t('Año Nuevo en Cusco', 'New Year in Cusco', 'Ano-Novo em Cusco', '库斯科跨年'),
    body: b(
      'La Plaza de Armas se llena de gente a medianoche. Es tradición vestir algo amarillo para atraer buena suerte.\n\nReserva hotel con anticipación: es una fecha de mucha demanda.',
      'The Plaza de Armas fills with people at midnight. Wearing something yellow for good luck is a tradition.\n\nBook your hotel early: demand is high on these dates.'
    ),
  },
  {
    slug: 'virgen-de-la-candelaria', group: 'festividades', sub: MONTHS.enefeb,
    title: t('Virgen de la Candelaria', 'Virgen de la Candelaria', 'Virgem da Candelária', '圣烛节圣母节'),
    body: b(
      'Gran fiesta de Puno en febrero, con miles de danzantes y músicos. Es Patrimonio Cultural Inmaterial de la Humanidad.\n\nCombínala con una visita al Lago Titicaca.',
      'Puno’s great festival in February, with thousands of dancers and musicians. It is UNESCO Intangible Cultural Heritage.\n\nCombine it with a visit to Lake Titicaca.'
    ),
  },
  {
    slug: 'senor-de-los-temblores', group: 'festividades', sub: MONTHS.marabr,
    title: t('El Señor de los Temblores', 'Lord of the Earthquakes', 'Senhor dos Tremores', '地震之主节'),
    body: b(
      'Procesión del patrón de Cusco el Lunes Santo. La imagen recorre el centro y los fieles le lanzan flores de ñucchu.',
      'Procession of Cusco’s patron on Holy Monday. The image is carried through the center while devotees throw red ñucchu flowers.'
    ),
  },
  {
    slug: 'semana-santa-en-cusco', group: 'festividades', sub: MONTHS.marabr,
    title: t('Semana Santa en Cusco', 'Holy Week in Cusco', 'Semana Santa em Cusco', '库斯科圣周'),
    body: b(
      'Procesiones, misas y la tradición de los doce platos el Viernes Santo. Es temporada de alta demanda nacional.',
      'Processions, masses and the twelve-dish tradition on Good Friday. It is a high-demand season for domestic travel.'
    ),
  },
  {
    slug: 'qoyllur-riti', group: 'festividades', sub: MONTHS.mayjun,
    title: t('El Señor de Qoyllur Rit’i', 'Lord of Qoyllur Rit’i', 'Senhor de Qoyllur Rit’i', '雪星节'),
    body: b(
      'Peregrinación andina a gran altura cerca del nevado Ausangate, antes de Corpus Christi. Une tradiciones católicas y andinas.\n\nRequiere buena condición física y ropa para frío extremo.',
      'High-altitude Andean pilgrimage near Ausangate mountain, before Corpus Christi. It blends Catholic and Andean traditions.\n\nIt requires good fitness and clothing for extreme cold.'
    ),
  },
  {
    slug: 'inti-raymi', group: 'festividades', sub: MONTHS.mayjun,
    title: t('Inti Raymi – Fiesta del Sol', 'Inti Raymi – Festival of the Sun', 'Inti Raymi – Festa do Sol', '太阳节'),
    body: b(
      'Cada 24 de junio se escenifica la ceremonia inca al Sol en Qoricancha, la Plaza de Armas y Sacsayhuamán.\n\nEs la fecha más concurrida del año: reserva tours, hotel y entradas con meses de anticipación.',
      'Every 24 June the Inca ceremony to the Sun is staged at Qoricancha, the Plaza de Armas and Sacsayhuaman.\n\nIt is the busiest date of the year: book tours, hotel and seats months ahead.'
    ),
  },
  {
    slug: 'virgen-del-carmen', group: 'festividades', sub: MONTHS.julago,
    title: t('Virgen del Carmen', 'Virgen del Carmen', 'Virgem do Carmo', '卡门圣母节'),
    body: b(
      'A mediados de julio, Paucartambo celebra a la Mamacha Carmen con comparsas de danzas y máscaras muy coloridas.',
      'In mid-July, Paucartambo celebrates Mamacha Carmen with dance troupes and colorful masks.'
    ),
  },
  {
    slug: 'senor-de-los-milagros', group: 'festividades', sub: MONTHS.sepoct,
    title: t('Señor de los Milagros', 'Lord of Miracles', 'Senhor dos Milagres', '奇迹之主节'),
    body: b(
      'En octubre, el “mes morado”, se realizan multitudinarias procesiones, sobre todo en Lima.',
      'In October, the “purple month”, huge processions take place, especially in Lima.'
    ),
  },
  {
    slug: 'santurantikuy', group: 'festividades', sub: MONTHS.novdic,
    title: t('Santurantikuy', 'Santurantikuy', 'Santurantikuy', '圣像集市'),
    body: b(
      'Cada 24 de diciembre la Plaza de Armas de Cusco se convierte en una gran feria de artesanía navideña: niños Manuelitos, nacimientos y figuras talladas.',
      'Every 24 December Cusco’s Plaza de Armas becomes a large Christmas craft fair: Niño Manuelito figures, nativity scenes and carvings.'
    ),
  },
]

/** Páginas que ya existían en el sitio: se les asigna un grupo */
const EXISTING: Record<string, { group: string; highlight?: boolean }> = {
  'boleto-turistico-cusco': { group: 'boletos', highlight: true },
  'boletos-machu-picchu': { group: 'boletos', highlight: true },
  'camino-inca-permisos': { group: 'boletos', highlight: true },
  'clima-y-mejor-epoca': { group: 'clima' },
  'como-llegar': { group: 'transporte' },
}

export async function seedInfoPages(demoImage: (folder: string) => Promise<string>) {
  if (await Page.query().whereNotNull('menu_group').first()) return
  let order = 100
  for (const [slug, cfg] of Object.entries(EXISTING)) {
    const page = await Page.findBy('slug', slug)
    if (page) {
      page.merge({ menuGroup: cfg.group, isHighlighted: !!cfg.highlight })
      await page.save()
    }
  }
  let created = 0
  for (const def of PAGES) {
    order++
    if (await Page.findBy('slug', def.slug)) continue
    await Page.create({
      slug: def.slug,
      title: def.title,
      summary: {},
      body: def.body,
      menuGroup: def.group,
      menuSubgroup: def.sub ?? {},
      isHighlighted: !!def.highlight,
      imageKey: def.highlight ? await demoImage('pages') : null,
      showInMenu: true,
      sortOrder: order,
      isActive: true,
    })
    created++
  }
  console.log(`Info útil: ${created} páginas nuevas y grupos asignados`)
}
