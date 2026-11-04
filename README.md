# Sitio del santuario

Sitio estático de 3 páginas en 6 idiomas, construido primero para lectores de pantalla (TalkBack, VoiceOver, NVDA). Sin frameworks, sin dependencias en tiempo de ejecución, sin trackers.

Estado: **esqueleto con textos provisionales**. Falta la información real del cliente (ver "Datos pendientes").

## Estructura

| Carpeta / archivo | Qué es |
|---|---|
| `src/templates/` | Plantillas HTML: `layout.html` (casco común) y una por página |
| `src/i18n/*.json` | Textos de cada idioma: `es`, `en`, `pt`, `ko`, `ja`, `zh` |
| `src/site.json` | Un solo lugar para `baseUrl`, nombre del santuario, `formspreeId` y `robotsNoindex` |
| `src/css/style.css` | Único archivo de estilos |
| `src/js/` | `flag.js` (marca que hay JavaScript) y `site.js` (menú, idiomas, formulario) |
| `src/fonts/` | Montserrat variable autoalojada (latin y latin-ext), licencia OFL |
| `src/img/` | Imágenes (vacía; ver su README) |
| `build.mjs` | Script de build, Node sin dependencias |
| `scripts/serve.mjs` | Servidor local |
| `scripts/check.mjs` | Verificación automática del sitio generado |
| `site/` | **Salida generada. Se commitea.** Cloudflare Pages publica esta carpeta sin comando de build |
| `docs/DEPLOY.md` | Publicación en Cloudflare Pages y cambio al dominio definitivo |
| `docs/ACCESSIBILITY.md` | Tabla de contrastes, decisiones y guía de prueba manual con lectores de pantalla |

## Comandos

Requiere Node 18 o superior. No hay `npm install`.

```
npm run build   # genera /site
npm run dev     # genera y sirve en http://127.0.0.1:8080/
npm run check   # genera y verifica (URLs, enlaces, ids, alt, inline, CSS sin uso)
```

## URLs

Español en la raíz; los demás idiomas con prefijo. 18 páginas en total.

| Página | es | en | pt | ko | ja | zh |
|---|---|---|---|---|---|---|
| Home | `/` | `/en/` | `/pt/` | `/ko/` | `/ja/` | `/zh/` |
| Cómo ayudar | `/volunteer/` | `/en/volunteer/` | `/pt/volunteer/` | `/ko/volunteer/` | `/ja/volunteer/` | `/zh/volunteer/` |
| Patrocinadores | `/sponsors/` | `/en/sponsors/` | `/pt/sponsors/` | `/ko/sponsors/` | `/ja/sponsors/` | `/zh/sponsors/` |

## Cómo reemplazar cada cosa

**Textos.** Editar `src/i18n/<idioma>.json`. Cada clave aparece en los 6 archivos con la misma estructura. `{siteName}` dentro de un texto se reemplaza por el nombre de `site.json`. Después: `npm run build`.

**Traducciones.** Las traducciones a en, pt, ko, ja y zh son provisionales, hechas por el equipo de desarrollo. **Requieren revisión profesional** antes de publicar.

**Nombre del santuario.** `siteName` en `src/site.json`. Aparece en el título de cada página, el hero, la marca del menú y el pie.

**Imágenes y logo.** Ver `src/img/README.md`. Resumen: poner los archivos en `src/img/`, usar `alt` descriptivo en el idioma de la página si la imagen informa algo, `alt=""` si es decorativa. Para el hero: definir `--hero-image` en `src/css/style.css` y añadir la clase `com-foto` a la `div.hero` en `src/templates/home.html`.

**Patrocinadores.** Lista `sponsors.items` en cada JSON de idioma. Si llevan logo, editar la lista en `src/templates/sponsors.html` (hay un comentario en el lugar exacto).

**baseUrl.** `src/site.json` → `baseUrl`, sin barra final. De ahí salen `canonical`, `hreflang`, Open Graph, `sitemap.xml` y `robots.txt`. Nunca escribir el dominio a mano en otro archivo.

**Indexación.** Mientras `robotsNoindex` sea `true`, cada página lleva `<meta name="robots" content="noindex">`. Pasar a `false` el día del lanzamiento y rebuild.

**Formulario (Formspree).** Hoy `formspreeId` es el placeholder `FORMSPREE_ID` y **el formulario no envía nada**. Para activarlo:

1. Crear una cuenta en [formspree.io](https://formspree.io) con el correo que va a recibir los mensajes.
2. Crear un formulario nuevo y copiar su ID (si la URL es `formspree.io/f/abcd1234`, el ID es `abcd1234`).
3. Pegarlo en `src/site.json` → `formspreeId` y hacer `npm run build`.

Campos que llegan: `nombre`, `email`, `ayuda` (`tiempo` / `conocimientos` / `manos`), `mensaje`, `_language`. El campo `_gotcha` es el honeypot anti-spam; si llega lleno, Formspree descarta el envío. No se reutilizó ningún ID de otro proyecto.

## Decisiones tomadas

- **Un HTML por página y por idioma.** El lector de pantalla depende del `lang` del documento y de un `<title>` en el idioma correcto. No hay traducción por JavaScript.
- **Sin estilos ni scripts inline.** La CSP de `site/_headers` lo prohíbe. El escalonado de la animación de entrada usa clases `atraso-1…5` que fijan `--i`, no atributos `style`.
- **Mejora progresiva.** Sin JavaScript el cabezal deja de ser fijo, los botones de menú e idioma se ocultan y las listas quedan visibles. El formulario envía por POST normal a Formspree.
- **Animación solo al cargar.** `@keyframes` con estado final visible. Si CSS o las animaciones fallan, el contenido se ve. Con `prefers-reduced-motion` no hay animación ni transición.
- **Transición entre páginas** con `@view-transition` (fundido de 250 ms). Donde no hay soporte, navegación normal.
- **Fuente autoalojada.** Montserrat variable descargada del paquete `@fontsource-variable/montserrat` (licencia OFL en `src/fonts/`). Solo latin y latin-ext. Para coreano, japonés y chino se usa la pila del sistema. En esos idiomas no se aplica `text-transform` ni `letter-spacing`.
- **Imagen Open Graph provisional.** El build genera `site/img/og.png` (1200×630, color sólido) hasta que exista `src/img/og.png` real.
- **Scripts de verificación en `scripts/`** porque forman parte del flujo de build del proyecto, no son diagnóstico puntual.
- **Honeypot** con `aria-hidden="true"` en el contenedor y `tabindex="-1"` en el campo, fuera del flujo visual.

## Pruebas

`npm run check` cubre: 18 HTML con `lang` y `title` correctos, un solo `h1`, encabezados sin saltos, ids únicos, imágenes con `alt`, enlaces internos existentes, ningún `localhost`/`pages.dev` fuera de `baseUrl`, 7 `hreflang` por página, sin inline, sin `console.log`, sin CSS sin uso, sin archivos duplicados, y cada URL respondiendo 200.

En el último ciclo se corrió además axe-core (16 combinaciones página × ancho: 0 violaciones) y Lighthouse (accesibilidad 100, buenas prácticas 100; SEO baja solo por el `noindex` deliberado). Revisión manual a 1280, 375 y 320 px, con `prefers-reduced-motion` y sin JavaScript.

**Las pruebas automáticas detectan solo una parte de los problemas.** Falta la prueba manual con TalkBack (Chrome/Android), VoiceOver (Safari/iPhone) y NVDA (Firefox o Chrome/Windows), idealmente con 2 o 3 personas ciegas reales. La guía está en `docs/ACCESSIBILITY.md`.

## Datos pendientes del cliente

- Textos reales de las 3 páginas (Home, Cómo ayudar, Patrocinadores).
- Revisión profesional de las traducciones (en, pt, ko, ja, zh).
- Nombre definitivo y logo (SVG).
- Fotos reales, cada una con una frase de descripción para el `alt`.
- Lista de patrocinadores y apoyadores (nombre, logo, enlace si corresponde).
- Confirmación de campos del formulario y correo que recibe los mensajes (para crear la cuenta de Formspree).
- Dominio definitivo y en qué cuenta de Cloudflare se registra (debe ser la misma cuenta que el proyecto de Pages; ver `docs/DEPLOY.md`).
- **Donaciones: Fase 2.** No hay botón ni enlace de pago. Cuando llegue, se hará con el checkout alojado del proveedor (por ejemplo PayPal). El sitio nunca maneja datos de tarjeta.

## Seguridad

- Sin secretos en el código ni en el historial. `.gitignore` excluye `.env*`, claves y `node_modules`.
- `site/_headers` define CSP estricta, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y HSTS. Cloudflare Pages los aplica tal cual.
- Cero dependencias en tiempo de ejecución. Sin analytics ni trackers.
