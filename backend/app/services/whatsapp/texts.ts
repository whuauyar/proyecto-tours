import type { Lang } from '#services/i18n'

/** Textos del bot de WhatsApp (los títulos de botones y filas tienen límites de 20/24 caracteres) */
const es = {
  greet: (name: string, bot: string, agency: string) => `Hola${name ? ` ${name}` : ''}, soy ${bot}, el asistente de ${agency}. ¿En qué te ayudo?`,
  menuBtn: 'Ver opciones', menuTitle: 'Menú',
  mDest: 'Tours por destino', mPopular: 'Tours populares', mFaq: 'Preguntas frecuentes', mQuote: 'Cotizar mi viaje', mAgent: 'Hablar con asesor', mLang: 'Idioma / Language',
  pickDest: '¿Qué destino te interesa?', destBtn: 'Ver destinos', toursIn: (d: string) => `Tours en ${d}. Elige uno para ver el detalle:`, toursBtn: 'Ver tours',
  popular: 'Los tours que más reservan nuestros viajeros:', from: 'desde',
  bQuote: 'Cotizar este', bMenu: 'Menú', bAgent: 'Asesor', more: 'Más información',
  faqIntro: 'Elige una pregunta:', faqBtn: 'Ver preguntas', question: 'Pregunta',
  anything: '¿Te ayudo con algo más?',
  qIntro: (t: string) => `Armemos tu cotización${t ? ` para *${t}*` : ''}. Son 4 datos rápidos.`,
  askDate: 'Escribe la fecha de viaje (dd/mm/aaaa) o elige una opción:', noDate: 'Aún no sé',
  badDate: 'No entendí la fecha. Escríbela como 15/07/2027 o toca "Aún no sé".',
  askAdults: '¿Cuántos adultos viajan?', askChildren: '¿Y cuántos niños?', none: 'Ninguno', adultsBtn: 'Elegir', people: 'personas',
  askName: (n: string) => `¿Registro la consulta a nombre de *${n}*?`, yesName: 'Sí, es correcto', otherName: 'Otro nombre', typeName: 'Escribe tu nombre completo:',
  askEmail: '¿A qué correo te enviamos la propuesta? (o toca Omitir)', skip: 'Omitir', badEmail: 'Ese correo no parece válido. Escríbelo de nuevo o toca Omitir.',
  summary: 'Resumen de tu consulta', tour: 'Tour', custom: 'Viaje a medida', date: 'Fecha', travelers: 'Viajeros', adults: 'adultos', children: 'niños', estimate: 'Total estimado',
  send: 'Enviar consulta', restart: 'Corregir',
  sent: 'Listo, registramos tu consulta. Un asesor te escribirá por este mismo chat en horario de atención.',
  agent: 'Te comunico con un asesor. Te responderá por este chat en horario de atención. Si quieres volver al asistente, escribe *menú*.',
  notFound: 'No encontré una respuesta exacta. ¿Quieres hablar con un asesor o ver el menú?',
  found: 'Esto es lo que encontré:', viewOnline: 'Ver en la web',
  langPick: 'Elige tu idioma:',
}
type Dict = typeof es

const en: Dict = {
  greet: (name, bot, agency) => `Hi${name ? ` ${name}` : ''}, I'm ${bot}, the assistant of ${agency}. How can I help?`,
  menuBtn: 'See options', menuTitle: 'Menu',
  mDest: 'Tours by destination', mPopular: 'Popular tours', mFaq: 'FAQ', mQuote: 'Get a quote', mAgent: 'Talk to an advisor', mLang: 'Idioma / Language',
  pickDest: 'Which destination are you interested in?', destBtn: 'Destinations', toursIn: (d) => `Tours in ${d}. Pick one to see details:`, toursBtn: 'See tours',
  popular: 'Our travelers’ favourite tours:', from: 'from',
  bQuote: 'Quote this', bMenu: 'Menu', bAgent: 'Advisor', more: 'More info',
  faqIntro: 'Choose a question:', faqBtn: 'See questions', question: 'Question',
  anything: 'Anything else I can help with?',
  qIntro: (t) => `Let's build your quote${t ? ` for *${t}*` : ''}. Just 4 quick questions.`,
  askDate: 'Type your travel date (dd/mm/yyyy) or choose an option:', noDate: "Don't know yet",
  badDate: "I didn't get the date. Type it like 15/07/2027 or tap \"Don't know yet\".",
  askAdults: 'How many adults?', askChildren: 'And how many children?', none: 'None', adultsBtn: 'Choose', people: 'people',
  askName: (n) => `Shall I register the enquiry under *${n}*?`, yesName: "Yes, that's right", otherName: 'Other name', typeName: 'Type your full name:',
  askEmail: 'Which email should we send the proposal to? (or tap Skip)', skip: 'Skip', badEmail: "That email doesn't look valid. Type it again or tap Skip.",
  summary: 'Your enquiry', tour: 'Tour', custom: 'Tailor-made trip', date: 'Date', travelers: 'Travelers', adults: 'adults', children: 'children', estimate: 'Estimated total',
  send: 'Send enquiry', restart: 'Edit',
  sent: 'Done, we registered your enquiry. An advisor will write to you in this chat during office hours.',
  agent: "I'm connecting you with an advisor, who will reply in this chat during office hours. To go back to the assistant, type *menu*.",
  notFound: "I couldn't find an exact answer. Would you like to talk to an advisor or see the menu?",
  found: "Here's what I found:", viewOnline: 'See it online',
  langPick: 'Choose your language:',
}

const pt: Dict = {
  greet: (name, bot, agency) => `Olá${name ? ` ${name}` : ''}, sou ${bot}, o assistente da ${agency}. Como posso ajudar?`,
  menuBtn: 'Ver opções', menuTitle: 'Menu',
  mDest: 'Passeios por destino', mPopular: 'Passeios populares', mFaq: 'Perguntas frequentes', mQuote: 'Fazer orçamento', mAgent: 'Falar c/ consultor', mLang: 'Idioma / Language',
  pickDest: 'Qual destino te interessa?', destBtn: 'Ver destinos', toursIn: (d) => `Passeios em ${d}. Escolha um para ver o detalhe:`, toursBtn: 'Ver passeios',
  popular: 'Os passeios mais reservados pelos nossos viajantes:', from: 'a partir de',
  bQuote: 'Orçar este', bMenu: 'Menu', bAgent: 'Consultor', more: 'Mais informações',
  faqIntro: 'Escolha uma pergunta:', faqBtn: 'Ver perguntas', question: 'Pergunta',
  anything: 'Posso ajudar em mais alguma coisa?',
  qIntro: (t) => `Vamos montar seu orçamento${t ? ` para *${t}*` : ''}. São só 4 perguntas.`,
  askDate: 'Escreva a data da viagem (dd/mm/aaaa) ou escolha uma opção:', noDate: 'Ainda não sei',
  badDate: 'Não entendi a data. Escreva como 15/07/2027 ou toque em "Ainda não sei".',
  askAdults: 'Quantos adultos?', askChildren: 'E quantas crianças?', none: 'Nenhuma', adultsBtn: 'Escolher', people: 'pessoas',
  askName: (n) => `Registro a consulta em nome de *${n}*?`, yesName: 'Sim, está certo', otherName: 'Outro nome', typeName: 'Escreva seu nome completo:',
  askEmail: 'Para qual e-mail enviamos a proposta? (ou toque em Pular)', skip: 'Pular', badEmail: 'Esse e-mail não parece válido. Escreva de novo ou toque em Pular.',
  summary: 'Resumo da sua consulta', tour: 'Passeio', custom: 'Viagem sob medida', date: 'Data', travelers: 'Viajantes', adults: 'adultos', children: 'crianças', estimate: 'Total estimado',
  send: 'Enviar consulta', restart: 'Corrigir',
  sent: 'Pronto, registramos sua consulta. Um consultor vai te escrever neste mesmo chat no horário de atendimento.',
  agent: 'Vou te conectar com um consultor, que responderá neste chat no horário de atendimento. Para voltar ao assistente, escreva *menu*.',
  notFound: 'Não encontrei uma resposta exata. Quer falar com um consultor ou ver o menu?',
  found: 'Encontrei isto:', viewOnline: 'Ver no site',
  langPick: 'Escolha seu idioma:',
}

const zh: Dict = {
  greet: (name, bot, agency) => `你好${name ? ` ${name}` : ''}，我是${agency}的助手${bot}。有什么可以帮你？`,
  menuBtn: '查看选项', menuTitle: '菜单',
  mDest: '按目的地查看', mPopular: '热门行程', mFaq: '常见问题', mQuote: '获取报价', mAgent: '联系顾问', mLang: 'Idioma / Language',
  pickDest: '你对哪个目的地感兴趣？', destBtn: '查看目的地', toursIn: (d) => `${d}的行程，选择一个查看详情：`, toursBtn: '查看行程',
  popular: '游客最常预订的行程：', from: '起',
  bQuote: '为此报价', bMenu: '菜单', bAgent: '顾问', more: '更多信息',
  faqIntro: '请选择一个问题：', faqBtn: '查看问题', question: '问题',
  anything: '还有什么可以帮你的吗？',
  qIntro: (t) => `我们来为你报价${t ? `：*${t}*` : ''}。只需4个简单问题。`,
  askDate: '请输入出行日期（日/月/年，如 15/07/2027）或选择：', noDate: '还不确定',
  badDate: '没看懂日期。请按 15/07/2027 的格式输入，或点击“还不确定”。',
  askAdults: '有几位成人？', askChildren: '有几位儿童？', none: '没有', adultsBtn: '选择', people: '人',
  askName: (n) => `以 *${n}* 的名义登记咨询吗？`, yesName: '是的', otherName: '其他姓名', typeName: '请输入你的全名：',
  askEmail: '我们将方案发送到哪个邮箱？（或点击跳过）', skip: '跳过', badEmail: '邮箱格式不正确，请重新输入或点击跳过。',
  summary: '咨询摘要', tour: '行程', custom: '定制行程', date: '日期', travelers: '人数', adults: '成人', children: '儿童', estimate: '预估总价',
  send: '提交咨询', restart: '修改',
  sent: '好的，已登记你的咨询。顾问会在营业时间内通过此对话联系你。',
  agent: '正在为你转接顾问，顾问会在营业时间内在此回复。如需返回助手，请输入 *menu*。',
  notFound: '没有找到确切答案。你想联系顾问还是查看菜单？',
  found: '我找到了这些：', viewOnline: '在网站查看',
  langPick: '请选择语言：',
}

export const WA_TEXT: Record<Lang, Dict> = { es, en, pt, zh }

/** Idioma probable del primer mensaje (el visitante puede cambiarlo desde el menú) */
export function guessLang(text: string): Lang {
  if (/[㐀-鿿]/.test(text)) return 'zh'
  const t = text.toLowerCase()
  if (/\b(ola|olá|obrigad|passeio|gostaria|quanto custa|bom dia|boa tarde)\b/.test(t)) return 'pt'
  if (/\b(hi|hello|hey|tour price|how much|please|thanks|i would|i'd like|good morning)\b/.test(t)) return 'en'
  return 'es'
}
