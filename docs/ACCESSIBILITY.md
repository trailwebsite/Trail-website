# Accesibilidad

Objetivo: WCAG 2.2 nivel AA, verificable. El sitio está pensado para personas ciegas que lo recorren con lector de pantalla; la accesibilidad manda sobre la estética.

## Qué se implementó

- **Un documento por idioma**, con `<html lang>` correcto y `<title>` propio. Nada de dos idiomas en el mismo HTML.
- **Landmarks**: `header`, `nav` con `aria-label` traducido, `main`, `footer`. Un solo `h1` por página; `h2` sin saltos.
- **Saltar al contenido**: primer elemento enfocable, visible al recibir foco, lleva a `main#contenido` con `tabindex="-1"`.
- **Menú**: enlaces nativos, `aria-current="page"` en la página actual. En móvil, botón "Menú" con `aria-expanded` y `aria-controls`.
- **Selector de idiomas**: patrón disclosure (botón + lista de enlaces). Cada opción con su nombre en su propio idioma, `lang` y `hreflang`; la actual con `aria-current="true"` y texto oculto "(idioma actual)". Sin `role="menu"`.
- **Teclado**: Escape cierra y devuelve el foco al botón; al salir con Tab el panel se cierra sin atrapar el foco. Clic fuera también cierra.
- **Foco visible**: `outline` sólido de 3 px con `outline-offset`; blanco sobre el hero oscuro. Ningún `outline: none`.
- **Barra fija de 64 px** con `scroll-padding-top` para que el elemento enfocado no quede tapado (WCAG 2.4.11).
- **Tamaños**: texto base 18 px; nada por debajo de 14 px (el más pequeño es 14,4 px en la marca del menú móvil). Objetivos de 44×44 px o más en enlaces del menú, botones, opciones de idioma y campos (48 px).
- **Zoom**: viewport sin `maximum-scale` ni `user-scalable=no`. Sin scroll horizontal a 320 px.
- **Idiomas CJK**: sin `text-transform` ni `letter-spacing`; interlineado 1,85.
- **Formulario**: `label` visible con `for`/`id`, "(obligatorio)" en texto, `autocomplete`, errores en texto junto al campo vinculados con `aria-describedby` + `aria-invalid="true"`, foco al primer campo con error, resumen en `role="alert"`, confirmación y estado de envío en `aria-live="polite"` con foco movido al mensaje. Todo el texto dinámico se inserta con `textContent`.
- **Movimiento**: aparición al cargar (CSS, estado final visible), fundido entre páginas de 250 ms, hover de 0,22 s. Con `prefers-reduced-motion: reduce` todo queda estático y solo cambia el color.
- **Sin imágenes, emojis ni iconos decorativos.** Cuando haya fotos: `alt` descriptivo o `alt=""`.
- **Enlaces externos**: si algún día se abren en otra pestaña, llevan `rel="noopener noreferrer"` y el aviso traducido oculto visualmente. Hoy no hay ninguno.

## Tabla de contrastes

Umbral AA: 4,5:1 para texto normal, 3:1 para texto grande y bordes de controles.

| Uso | Color | Fondo | Relación |
|---|---|---|---|
| Texto principal | `#1a1a1a` | `#ffffff` | 17,40 |
| Texto secundario (menú, pie) | `#333333` | `#ffffff` | 12,63 |
| Notas y "(obligatorio)" | `#444444` | `#ffffff` | 9,74 |
| Descripción en enlaces de bloque | `#555555` | `#ffffff` | 7,46 |
| Títulos y enlaces | `#1b5e20` | `#ffffff` | 7,87 |
| Acento (hover, líneas) | `#2e7d32` | `#ffffff` | 5,13 |
| Mensajes de error | `#b3261e` | `#ffffff` | 6,54 |
| Borde de campos y botones | `#767676` | `#ffffff` | 4,54 |
| Texto del hero y botón de envío | `#ffffff` | `#1b5e20` | 7,87 |
| Botón de envío en hover | `#ffffff` | `#2e7d32` | 5,13 |
| Texto principal sobre fondo suave | `#1a1a1a` | `#f2f8f2` | 16,15 |
| Texto secundario sobre fondo suave | `#333333` | `#f2f8f2` | 11,72 |
| Notas sobre fondo suave | `#444444` | `#f2f8f2` | 9,04 |
| Texto terciario sobre fondo suave | `#555555` | `#f2f8f2` | 6,92 |
| Títulos sobre fondo suave | `#1b5e20` | `#f2f8f2` | 7,30 |
| Acento sobre fondo suave | `#2e7d32` | `#f2f8f2` | 4,76 |
| Error sobre fondo suave | `#b3261e` | `#f2f8f2` | 6,06 |
| Anillo de foco | `#1b5e20` | `#ffffff` | 7,87 |
| Anillo de foco en el hero | `#ffffff` | `#1b5e20` | 7,87 |

El borde decorativo `#e8e8e8` no transmite información; los bordes de controles usan `#767676`.

## Resultado de las pruebas automáticas

- `npm run check`: OK (18 páginas, 26 URLs, sin inline, sin enlaces rotos).
- axe-core 4.x, reglas WCAG 2.x A/AA + buenas prácticas, en 8 páginas × 2 anchos (1280 y 375 px): **0 violaciones**. Nota: si axe corre antes de que termine la animación de entrada (unos 1,2 s), marca contraste bajo en los bloques que todavía están apareciendo; es el fundido, no el estado final.
- Lighthouse: accesibilidad 100, buenas prácticas 100 en Home y Voluntarios (es y ja). SEO 66 solo por el `noindex` deliberado de la fase de prueba.
- Revisión manual: orden de encabezados, foco con Tab, Escape en los dos disclosures, errores del formulario, 375 y 320 px sin scroll horizontal, `prefers-reduced-motion`, sin JavaScript.

Las pruebas automáticas no reemplazan a una persona usando el sitio.

## Guía de prueba manual con lectores de pantalla

Hacerla en las 3 páginas, al menos en español y en un idioma CJK. Ideal: 2 o 3 personas ciegas reales, cada una con el dispositivo que usa a diario.

### TalkBack (Android, Chrome)

1. Activar TalkBack: Ajustes → Accesibilidad → TalkBack.
2. Abrir la página. Comprobar que anuncia el título en el idioma correcto.
3. Deslizar a la derecha desde el inicio: lo primero debe ser "Saltar al contenido, enlace". Doble toque: el foco debe pasar al contenido principal.
4. Recorrer el menú: cada enlace se anuncia con su nombre; la página actual dice "actual" o "página actual".
5. Botón "Menú" (móvil): debe decir "contraído"; tras doble toque, "expandido". Los enlaces aparecen a continuación.
6. Botón de idioma: dice "Idioma: Español, contraído". Al abrir, las opciones se leen en su propio idioma (TalkBack cambia de voz si tiene el idioma instalado). La actual dice "idioma actual".
7. Formulario: cada campo anuncia etiqueta + "obligatorio". Enviar vacío: debe anunciarse el resumen de error y el foco caer en "Nombre" con su mensaje de error.
8. Lectura continua (menú de TalkBack → "Leer desde el siguiente elemento"): el orden debe tener sentido y no leer nada oculto.

### VoiceOver (iPhone, Safari)

1. Activar: Ajustes → Accesibilidad → VoiceOver.
2. Rotor → "Encabezados": debe listar un `h1` y los `h2` en orden.
3. Rotor → "Puntos de referencia": cabecera, navegación, principal, pie.
4. Rotor → "Enlaces": todos descriptivos, ninguno "aquí".
5. Repetir los pasos 3–8 de TalkBack con gestos de VoiceOver.
6. Cambiar de idioma por el selector: la nueva página debe leerse con la voz del idioma elegido.

### NVDA (Windows, Firefox o Chrome)

1. Iniciar NVDA. Abrir la página.
2. `H` para saltar entre encabezados, `D` entre regiones, `K` entre enlaces, `F` entre campos de formulario. Comprobar orden y nombres.
3. `Insert + F7`: lista de elementos; revisar enlaces y encabezados.
4. Tab por toda la página: el foco debe ser visible y seguir el orden visual; Escape en los disclosures devuelve el foco al botón.
5. En el formulario, modo foco: errores anunciados al enviar; el mensaje de confirmación se lee solo (región activa).

### Qué anotar

Para cada problema: página, idioma, lector y dispositivo, qué esperaba la persona y qué pasó. Esa lista es la que se corrige antes del lanzamiento.
