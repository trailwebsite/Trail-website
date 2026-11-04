# Despliegue

## Local

```
npm run dev
```

Sirve `site/` en `http://127.0.0.1:8080/`. Variable `PORT` para cambiar el puerto.

## Cloudflare Pages (prueba)

Destino: `https://<proyecto>.pages.dev`, con HTTPS automático. Guía oficial: <https://developers.cloudflare.com/pages/get-started/git-integration/>. Los nombres exactos de los botones pueden variar con el tiempo.

1. Entrar al panel de Cloudflare con la cuenta del cliente (conviene que el proyecto viva ahí desde el inicio; ver "Dominio definitivo").
2. **Workers & Pages → Create → Pages → Connect to Git.**
3. Autorizar GitHub y elegir el repositorio `trailwebsite/trail-sanctuary-site`.
4. Configuración del build:
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: **vacío** (la carpeta `site/` ya viene generada y commiteada)
   - Build output directory: `site`
5. **Save and Deploy.** En uno o dos minutos la URL `https://<proyecto>.pages.dev` responde.
6. Cada `git push` a `main` republica. Las ramas distintas de `main` generan URLs de vista previa.

Los encabezados de seguridad salen de `site/_headers`; Cloudflare los aplica sin configuración extra.

Después del primer deploy, poner la URL real en `src/site.json` → `baseUrl` (sin barra final), hacer `npm run build`, commit y push. Así `canonical`, `hreflang`, Open Graph y `sitemap.xml` apuntan al sitio publicado.

## Dominio definitivo

Requisitos previos:

- El dominio debe ser una **zona en la misma cuenta de Cloudflare** que el proyecto de Pages. Si el dominio está en otra cuenta o registrador, primero moverlo o apuntar sus nameservers a Cloudflare dentro de la cuenta del cliente.
- **No crear el registro CNAME a mano** antes de asociar el dominio en Pages: produce error 522. Pages lo crea solo.
- Si el dominio tiene registros **CAA**, deben permitir certificados de Cloudflare (`letsencrypt.org`, `pki.goog`, `ssl.com` o, simplemente, no tener CAA restrictivo). Si no, el certificado no se emite.

Pasos:

1. En el proyecto de Pages: **Custom domains → Set up a domain.**
2. Escribir el dominio (por ejemplo `santuario.org`) y confirmar. Repetir para `www.santuario.org` si se quiere que ambos funcionen.
3. Cloudflare crea los registros DNS y emite el certificado. Esperar a que el estado sea **Active**.

## Checklist del día del cambio

- [ ] Dominio en estado Active en Pages.
- [ ] HTTPS verificado con y sin `www`; redirección de uno al otro decidida y funcionando.
- [ ] `baseUrl` actualizada al dominio definitivo en `src/site.json`, `npm run build`, commit y push.
- [ ] `robotsNoindex: false` en `src/site.json`, rebuild, commit y push.
- [ ] Revisar en el navegador el código fuente de una página: `canonical`, `hreflang`, `og:url`, sin `noindex`.
- [ ] `/sitemap.xml` y `/robots.txt` abren y muestran el dominio definitivo.
- [ ] Los 18 enlaces del selector de idiomas funcionan; el menú funciona en móvil.
- [ ] Formulario probado de punta a punta: envío real, llegada del correo, mensaje de confirmación leído por el lector de pantalla.
- [ ] Alta en Google Search Console (propiedad de dominio) y envío de `/sitemap.xml`.
- [ ] Repaso final con TalkBack en un Android real sobre las 3 páginas en español (guía en `ACCESSIBILITY.md`).

## Donaciones (Fase 2)

Fuera de alcance por ahora. Cuando se implemente: checkout alojado del proveedor (por ejemplo PayPal). El sitio solo enlaza al proveedor; nunca recibe ni guarda datos de tarjeta. Habrá que ampliar `form-action` y `connect-src` en `site/_headers` solo con el dominio del proveedor elegido.
