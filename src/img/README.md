# Imágenes

Todavía no hay fotos ni logo. Esta carpeta queda lista para recibirlos.

## Formato esperado

- Fotos: `.webp` o `.avif` (con `.jpg` de respaldo si hace falta), ancho máximo 1600 px, peso menor a 200 KB.
- Logo: `.svg` (preferido) o `.png` con fondo transparente.
- Logos de patrocinadores: `.svg` o `.png`, alto normalizado a 80 px.
- Imagen para redes (Open Graph): `og.png` de 1200×630 px. Hoy el build genera una provisoria de color sólido; al poner una real aquí, el build la copia y reemplaza la provisoria.
- Nombres en minúsculas, sin espacios ni acentos: `hero-entrada.webp`, `logo.svg`, `patrocinador-1.svg`.

## Texto alternativo (obligatorio)

Cada imagen que informa algo lleva `alt` descriptivo, en el idioma de la página. Describe lo que importa para quien no la ve: "Sendero de tierra entre árboles altos, con una baranda de madera a la izquierda". Si la imagen es solo decorativa, va `alt=""`.

El cliente debe entregar, junto a cada foto, una frase de descripción para el `alt`.

## Dónde se usan

- Hero de la Home: variable `--hero-image` en `src/css/style.css` y clase `com-foto` en la `div.hero` de `src/templates/home.html`.
- Patrocinadores: lista en `src/templates/sponsors.html`.
