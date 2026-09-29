# Proyecto Tours v2 — Cusco + Puno, 4 idiomas

Sitio web de agencia de viajes que fusiona lo mejor de dos referentes del sur andino
(catálogo por destinos, confianza, FAQ y contacto directo de un operador de Puno; mega-menú,
"Personaliza tu viaje" e "Info útil" de un operador de Cusco), con panel administrador
y contenido en **Español, Inglés, Portugués y Chino mandarín**.

## Qué se tomó de cada referencia

| Elemento | Origen | Implementación |
|---|---|---|
| Navegación por destinos (Puno/Titicaca, Cusco, Arequipa, Bolivia) | Puno | Entidad **Destinos** + mega-menú con imagen y conteo |
| Tipos de experiencia (tradicional, privado, vivencial, aventura, paquetes) | Puno | Entidad **Tipos**, filtro en el listado |
| Tarjeta con calificación, reseñas, % de descuento y duración en horas | Puno | Campos `rating`, `reviewsCount`, `discountPercent`, `durationHours` |
| Formulario con adultos / niños y precio de niño | Puno | Cotizador con total estimado en el detalle |
| Cifras de confianza, "¿Por qué elegirnos?" (6), FAQ, razón social y RUC | Puno | Editable en Configuración / Preguntas frecuentes |
| Hero con video opcional y buscador | Cusco | Imagen o `.mp4` + buscador con destino |
| "Personaliza tu viaje" en 3 pasos | Cusco | Bloque editable |
| Guías de destino ("Conoce Perú") | Cusco | Página `/destino/:slug` con descripción, destacados y tours |
| "Info útil" (clima, boletos, transporte) | Cusco | Entidad **Páginas** con menú propio |
| Certificaciones / aliados | Ambos | Lista de logos editable |
| **Mejoras propias** | — | URLs por idioma (`/es`, `/en`, `/pt`, `/zh`), respaldo automático al español, indicador de traducciones pendientes, colores de marca configurables, calificación por tour (no la misma en todos), barra de reserva fija en móvil |

| Capa | Tecnología | Carpeta |
|---|---|---|
| Frontend | React 19 + Vite + TypeScript, responsive, ES/EN/PT/ZH | `frontend/` |
| Backend | AdonisJS 6 (API REST, Lucid ORM, tokens de acceso) | `backend/` |
| Base de datos | PostgreSQL | — |
| Imágenes | Railway Bucket (S3) en producción, carpeta `storage/` en local | — |

## Prioridad de Cusco (destino principal)

El destino que está **primero en Admin → Destinos** (campo *Orden*) se trata como destino principal. Hoy es **Cusco y Machu Picchu**:

- Aparece como acceso directo resaltado en el menú, antes de "Destinos".
- La portada abre con "Lo mejor de Cusco y Machu Picchu" (sus destacados primero, hasta 6) y luego "Extiende tu viaje: Titicaca y más" con los otros destinos.
- Todos los listados (tours, relacionados, panel) ordenan primero por el orden del destino y luego por el orden del tour.
- Portada, eslogan, preguntas frecuentes (Machu Picchu, Camino Inca, boleto turístico) y páginas "Info útil" están enfocados en Cusco.
- Datos de ejemplo: 11 tours de Cusco (Machu Picchu 1 y 2 días, Camino Inca 4D y 2D, Salkantay, Humantay, City tour, Valle Sagrado, Maras y Moray, Montaña de 7 Colores, paquete 6D), 5 de Puno y 1 de Arequipa.

Para priorizar otro destino en el futuro basta con cambiar el orden en el panel; no hay que tocar código.

## Qué puede hacer el administrador (`/admin`)

- **Tours y precios**: precio adulto, oferta y niño editables directamente en la tabla; publicar/ocultar, destacar en portada; indicador de idiomas sin traducir.
- **Formulario de tour** (pestañas ES / EN / PT / 中文, con el texto en español como referencia bajo cada campo y botón "copiar del español" para listas e itinerario): título, resumen, descripción, lo más destacado, itinerario por días, incluye / no incluye, qué llevar, FAQ propias del tour, destino, tipo, días/noches/horas, dificultad, compartido/privado, calificación y n.º de reseñas, imagen principal y galería.
- **Destinos** y **Tipos de experiencia**: nombre, textos, imagen, orden, visibilidad, "mostrar en portada".
- **Preguntas frecuentes** y **Páginas "Info útil"**: contenido en 4 idiomas.
- **Configuración del sitio** (8 secciones): identidad, logo y colores de marca · idiomas activos e idioma por defecto · portada (imagen, video, títulos) · cifras de confianza y TripAdvisor · contacto, horario, mapa y redes · bloques "¿Por qué elegirnos?" y "Personaliza tu viaje" · testimonios con estrellas · logos de certificaciones.
- **Consultas**: bandeja con adultos/niños, idioma del visitante y estado.
- **Mi cuenta**: cambio de contraseña.

### Cómo funciona el multilenguaje

- Cada texto visible se guarda en PostgreSQL como JSONB: `{"es": "...", "en": "...", "pt": "...", "zh": "..."}`.
- Si falta una traducción, el sitio muestra el texto en español (nunca un hueco).
- Los textos fijos de la interfaz (botones, menús) están en `frontend/src/i18n.tsx`.
- La URL lleva el idioma (`/pt/tour/...`), así cada versión se puede compartir e indexar por separado.
- El chino carga fuentes Noto Sans/Serif SC solo cuando se elige 中文.

Las imágenes subidas se optimizan automáticamente (WebP, máx. 1920 px) y se sirven desde `GET /media/*` del backend, por lo que el bucket puede ser privado.

## Ejecutar en local

Requisitos: Node 22+ y PostgreSQL.

```bash
# 1) Base de datos
createdb tours

# 2) Backend
cd backend
cp .env.example .env          # ajusta DB_USER / DB_PASSWORD
node ace generate:key         # rellena APP_KEY
npm install
node ace migration:run
node ace db:seed              # crea el admin y datos de ejemplo
npm run dev                   # http://localhost:3333

# 3) Frontend (otra terminal)
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:3333
npm install
npm run dev                   # http://localhost:5173  -> panel en /admin
```

Usuario inicial: el definido en `ADMIN_EMAIL` / `ADMIN_PASSWORD` del `.env` del backend. Cámbialo desde "Mi cuenta" después del primer ingreso.

## Despliegue en Railway

Un proyecto con 4 piezas: **Postgres**, **Bucket**, **backend** y **frontend**. Sube este repositorio a GitHub y crea cada servicio desde el repo indicando su *Root Directory*.

1. **Postgres**: *New → Database → PostgreSQL*.
2. **Bucket**: *New → Bucket*. Anota su nombre de servicio (p. ej. `Bucket`).
3. **backend**: *New → GitHub Repo*, Root Directory = `/backend`. Configuración del servicio (Settings): Build `npm run build` · Start `node build/bin/server.js` · Pre-deploy `npm run release` (migraciones + seed) · Healthcheck `/health` · Watch paths `/backend/**`. Railway ya no recomienda `railway.json`, por eso esta configuración va en el servicio. Variables:

   ```
   NODE_ENV=production
   HOST=0.0.0.0
   LOG_LEVEL=info
   TZ=UTC
   APP_KEY=<node ace generate:key --show>
   APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
   CORS_ORIGIN=https://<dominio-del-frontend>
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   DRIVE_DISK=s3
   BUCKET=${{Bucket.BUCKET}}
   ACCESS_KEY_ID=${{Bucket.ACCESS_KEY_ID}}
   SECRET_ACCESS_KEY=${{Bucket.SECRET_ACCESS_KEY}}
   REGION=${{Bucket.REGION}}
   ENDPOINT=${{Bucket.ENDPOINT}}
   ADMIN_EMAIL=tu-correo@dominio.com
   ADMIN_PASSWORD=<clave-segura>
   SEED_DEMO=true          # false si no quieres tours de ejemplo
   ```
   Genera un dominio público en *Settings → Networking*.
   Si el bucket es antiguo y pide URLs estilo *path*, agrega `S3_FORCE_PATH_STYLE=true`.

4. **frontend**: *New → GitHub Repo*, Root Directory = `/frontend`. Build `npm run build` · Start `npm start` · Watch paths `/frontend/**`. Variable:

   ```
   VITE_API_URL=https://<dominio-del-backend>
   ```
   Se usa en el build, así que si cambia hay que redesplegar. Genera su dominio público y ponlo en `CORS_ORIGIN` del backend.

El seeder es idempotente: en cada deploy solo crea el admin si no existe y los datos de ejemplo si no hay tours.

## API (resumen)

Pública: `GET /api/settings`, `GET /api/navigation` (destinos, tipos, páginas), `GET /api/destinations/:slug`, `GET /api/tours?destination=&category=&duration=day|multi&sort=price_asc|price_desc|duration&featured=1&q=`, `GET /api/tours/:slug` (incluye relacionados), `GET /api/faqs`, `GET /api/pages/:slug`, `POST /api/inquiries`, `POST /api/auth/login`, `GET /media/*`.

Admin (Bearer token): `/api/admin/tours` (CRUD) + `PATCH /api/admin/tours/:id/quick` (precios/estado), CRUD de `/api/admin/destinations`, `/api/admin/categories`, `/api/admin/pages`, `/api/admin/faqs`, `POST /api/admin/uploads`, `GET|PUT /api/admin/settings`, `/api/admin/inquiries`, `PUT /api/admin/auth/password`.

## Pendientes sugeridos

- **Traducción profesional**: los textos de ejemplo en portugués y chino son de referencia; antes de publicar, que los revise un nativo (el chino, sobre todo, en nombres de lugares).
- Botón de traducción automática en el panel (DeepL / Google) como borrador para el traductor.

- Pagos en línea (Niubiz / Izipay / Culqi) y reservas con fecha.
- Aviso por correo o WhatsApp cuando llega una consulta.
- SEO: el frontend es una SPA; para posicionar tours en Google conviene prerender o SSR.
- Limpieza de imágenes subidas pero no guardadas en ningún tour.
