// build.mjs — gera o site estático em /site: 5 páginas × 6 idiomas, redirects, sitemap, robots, headers e ativos
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const RAIZ = dirname(fileURLToPath(import.meta.url))
const SRC = join(RAIZ, 'src')
const SAIDA = join(RAIZ, 'site')

// inglês na raiz, sem prefixo; os demais idiomas com prefixo
const IDIOMAS = [
  { code: 'en', prefix: '' },
  { code: 'es', prefix: 'es' },
  { code: 'pt', prefix: 'pt' },
  { code: 'ko', prefix: 'ko' },
  { code: 'ja', prefix: 'ja' },
  { code: 'zh', prefix: 'zh' },
]
const PAGINAS = [
  { id: 'home', rota: '' },
  { id: 'trails', rota: 'trails' },
  { id: 'volunteer', rota: 'volunteer' },
  { id: 'donations', rota: 'donations' },
  { id: 'audiovideo', rota: 'audio-video' },
]
const OG_LOCALE = { en: 'en_US', es: 'es_PE', pt: 'pt_BR', ko: 'ko_KR', ja: 'ja_JP', zh: 'zh_CN' }

// caminho público — raiz do site, sempre com barra final
function caminho(idioma, pagina) {
  const partes = [idioma.prefix, pagina.rota].filter(Boolean)
  return partes.length ? `/${partes.join('/')}/` : '/'
}

function escapar(texto) {
  return String(texto)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

function buscar(obj, chave) {
  return chave.split('.').reduce((acc, parte) => (acc == null ? undefined : acc[parte]), obj)
}

// render — troca {{chave}} (escapado) e {{{chave}}} (HTML cru); chave ausente derruba o build
function render(template, ctx) {
  return template.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}|\{\{\s*([\w.]+)\s*\}\}/g, (_, cru, esc) => {
    const chave = cru || esc
    const valor = buscar(ctx, chave)
    if (valor === undefined) throw new Error(`Chave ausente no template: ${chave}`)
    return cru ? String(valor) : escapar(valor)
  })
}

// interpolar — substitui {siteName} e afins dentro das strings de tradução
function interpolar(valor, vars) {
  if (typeof valor === 'string') return valor.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m))
  if (Array.isArray(valor)) return valor.map((v) => interpolar(v, vars))
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, interpolar(v, vars)]))
  }
  return valor
}

function navHtml(t, idioma, paginaAtual) {
  return PAGINAS.map((p) => {
    const atual = p.id === paginaAtual.id ? ' aria-current="page"' : ''
    return `<li><a class="maiusculas" href="${caminho(idioma, p)}"${atual}>${escapar(t.nav[p.id])}</a></li>`
  }).join('\n          ')
}

function idiomasHtml(traducoes, idiomaAtual, pagina) {
  return IDIOMAS.map((idioma) => {
    const t = traducoes[idioma.code]
    const atual = idioma.code === idiomaAtual.code
    const marca = atual ? ` aria-current="true"` : ''
    const nota = atual ? ` <span class="oculto-visual">${escapar(t.lang.current)}</span>` : ''
    return `<li><a href="${caminho(idioma, pagina)}" lang="${t.htmlLang}" hreflang="${t.hreflang}"${marca}>${escapar(t.name)}${nota}</a></li>`
  }).join('\n              ')
}

function alternatesHtml(site, traducoes, pagina) {
  const linhas = IDIOMAS.map((idioma) => {
    const t = traducoes[idioma.code]
    return `<link rel="alternate" hreflang="${t.hreflang}" href="${site.baseUrl}${caminho(idioma, pagina)}">`
  })
  linhas.push(`<link rel="alternate" hreflang="x-default" href="${site.baseUrl}${caminho(IDIOMAS[0], pagina)}">`)
  return linhas.join('\n  ')
}

function sitemapXml(site, traducoes) {
  const urls = []
  for (const pagina of PAGINAS) {
    for (const idioma of IDIOMAS) {
      const alternates = IDIOMAS.map((alt) =>
        `    <xhtml:link rel="alternate" hreflang="${traducoes[alt.code].hreflang}" href="${site.baseUrl}${caminho(alt, pagina)}"/>`,
      )
      alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${site.baseUrl}${caminho(IDIOMAS[0], pagina)}"/>`)
      urls.push(`  <url>\n    <loc>${site.baseUrl}${caminho(idioma, pagina)}</loc>\n${alternates.join('\n')}\n  </url>`)
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
}

// redirects — rotas antigas: /en/* era o inglês (agora raiz) e /sponsors/ virou /donations/ no mesmo idioma
function redirectsTxt() {
  const linhas = ['# Rotas antigas. Inglês saiu de /en/ para a raiz; sponsors virou donations.']
  for (const idioma of IDIOMAS) {
    const prefixoAntigo = idioma.code === 'es' ? '' : `/${idioma.code}`
    const prefixoNovo = idioma.prefix ? `/${idioma.prefix}` : ''
    const destino = `${prefixoNovo}/donations/`
    linhas.push(`${prefixoAntigo}/sponsors    ${destino}  301`)
    linhas.push(`${prefixoAntigo}/sponsors/   ${destino}  301`)
    linhas.push(`${prefixoAntigo}/sponsors/*  ${destino}  301`)
  }
  linhas.push('/en     /  301')
  linhas.push('/en/    /  301')
  linhas.push('/en/*   /:splat  301')
  return linhas.join('\n') + '\n'
}

// blocoHtml — um item de conteúdo de caixa: parágrafo, destaque ou lista
function blocoHtml(item) {
  if (typeof item === 'string') return `<p>${escapar(item)}</p>`
  if (item.lead) return `<p class="destaque">${escapar(item.lead)}</p>`
  if (item.list) return `<ul class="lista">${item.list.map((i) => `<li>${escapar(i)}</li>`).join('')}</ul>`
  throw new Error(`Bloco de caixa desconhecido: ${JSON.stringify(item)}`)
}

// caixaHtml — caixa que abre e fecha: botão dentro de h2 e painel; o JS fecha ao carregar
function caixaHtml(id, titulo, corpo) {
  return `<section class="caixa">
      <h2 class="caixa-titulo"><button class="caixa-botao" type="button" id="${id}-botao" aria-expanded="true" aria-controls="${id}">${escapar(titulo)}</button></h2>
      <div class="caixa-painel" id="${id}" role="region" aria-labelledby="${id}-botao">
        ${corpo}
      </div>
    </section>`
}

// caixasTexto — caixas só de texto, vindas do JSON de idioma (boxes[]); a ordem é a do arquivo
function caixasTexto(pagina, boxes) {
  return boxes.map((caixa, i) =>
    caixaHtml(`caixa-${pagina.id}-${i + 1}`, caixa.title, caixa.content.map(blocoHtml).join('\n        ')),
  )
}

// por enquanto o cliente só quer info@; os outros endereços ficam fora da página
const EMAILS_DA_PAGINA = {
  home: ['info'],
  trails: ['info'],
  volunteer: ['info'],
  donations: ['info'],
  audiovideo: ['info'],
}

function contatoHtml(t, site, pagina) {
  const c = t.contact
  const emails = EMAILS_DA_PAGINA[pagina.id].map((chave) =>
    `<li><span class="email">${escapar(site.contato.emails[chave])}</span></li>`,
  ).join('\n              ')
  return `<section class="contato" aria-labelledby="contato-titulo">
      <div class="contato-interno">
        <h2 id="contato-titulo">${escapar(c.heading)}</h2>
        <dl class="contato-lista">
          <div>
            <dt>${escapar(c.placeLabel)}</dt>
            <dd>${escapar(c.place)}<br>
              <a class="botao botao-leve" href="${site.contato.mapa}" target="_blank" rel="noopener noreferrer">${escapar(c.mapButton)} <span class="externo">${escapar(t.external)}</span></a>
            </dd>
          </div>
          <div>
            <dt>${escapar(c.phoneLabel)}</dt>
            <dd><a href="tel:${site.contato.telefone.replaceAll(' ', '')}">${escapar(site.contato.telefone)}</a><br>
              <a href="${site.contato.whatsapp}" target="_blank" rel="noopener noreferrer">${escapar(c.whatsappLink)} <span class="externo">${escapar(t.external)}</span></a>
            </dd>
          </div>
          <div>
            <dt>${escapar(c.socialLabel)}</dt>
            <dd>Instagram: ${escapar(c.tbc)}<br>Facebook: ${escapar(c.tbc)}</dd>
          </div>
          <div>
            <dt>${escapar(c.emailsLabel)}</dt>
            <dd><ul>${emails}</ul></dd>
          </div>
        </dl>
      </div>
    </section>`
}

const HEADERS = `/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://formspree.io https://formsubmit.co; form-action https://formspree.io https://formsubmit.co; base-uri 'self'; object-src 'none'; frame-ancestors 'none'
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
`

// pngSolido — imagem OG provisória (cor sólida), gerada sem dependências
function pngSolido(largura, altura, [r, g, b]) {
  const tabela = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabela[n] = c
  }
  const crc32 = (buf) => {
    let c = -1
    for (const byte of buf) c = tabela[(c ^ byte) & 0xff] ^ (c >>> 8)
    return (c ^ -1) >>> 0
  }
  const chunk = (tipo, dados) => {
    const tamanho = Buffer.alloc(4)
    tamanho.writeUInt32BE(dados.length)
    const corpo = Buffer.concat([Buffer.from(tipo, 'ascii'), dados])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(corpo))
    return Buffer.concat([tamanho, corpo, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(largura, 0)
  ihdr.writeUInt32BE(altura, 4)
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  const linha = Buffer.alloc(1 + largura * 3)
  for (let x = 0; x < largura; x++) { linha[1 + x * 3] = r; linha[2 + x * 3] = g; linha[3 + x * 3] = b }
  const bruto = Buffer.concat(Array.from({ length: altura }, () => linha))
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(bruto)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// copiarImagens — leva só arquivos de imagem para /site/img; devolve se já existe og.png real
async function copiarImagens() {
  const origem = join(SRC, 'img')
  const destino = join(SAIDA, 'img')
  await mkdir(destino, { recursive: true })
  let temOg = false
  for (const nome of await readdir(origem)) {
    if (!/\.(png|jpe?g|webp|avif|svg)$/i.test(nome)) continue
    await cp(join(origem, nome), join(destino, nome))
    if (nome === 'og.png') temOg = true
  }
  return temOg
}

async function main() {
  const site = JSON.parse(await readFile(join(SRC, 'site.json'), 'utf8'))
  const layout = await readFile(join(SRC, 'templates', 'layout.html'), 'utf8')
  const templates = {}
  for (const p of PAGINAS) templates[p.id] = await readFile(join(SRC, 'templates', `${p.id}.html`), 'utf8')

  const vars = { siteName: site.siteName, dominio: site.dominioPretendido }
  const traducoes = {}
  for (const idioma of IDIOMAS) {
    const bruto = JSON.parse(await readFile(join(SRC, 'i18n', `${idioma.code}.json`), 'utf8'))
    traducoes[idioma.code] = interpolar(bruto, vars)
  }

  await rm(SAIDA, { recursive: true, force: true })
  await mkdir(SAIDA, { recursive: true })

  const ano = new Date().getFullYear()
  const robots = site.robotsNoindex ? '<meta name="robots" content="noindex">' : ''
  const recepcao = typeof site.recepcao === 'string' ? site.recepcao.trim() : ''
  const formsAtivos = recepcao.includes('@')
  const formAction = formsAtivos ? `https://formsubmit.co/ajax/${recepcao}` : ''
  let gerados = 0

  for (const idioma of IDIOMAS) {
    const t = traducoes[idioma.code]
    for (const pagina of PAGINAS) {
      const ctx = {
        siteName: site.siteName,
        formAction,
        formsAtivos: String(formsAtivos),
        contas: site.doacao,
        htmlLang: t.htmlLang,
        title: t[pagina.id].title,
        description: t[pagina.id].description,
        canonical: `${site.baseUrl}${caminho(idioma, pagina)}`,
        ogImage: `${site.baseUrl}/img/og.png`,
        ogLocale: OG_LOCALE[idioma.code],
        robots,
        alternates: alternatesHtml(site, traducoes, pagina),
        year: ano,
        t,
        url: Object.fromEntries(PAGINAS.map((p) => [p.id, caminho(idioma, p)])),
        paginaId: pagina.id,
        navItems: navHtml(t, idioma, pagina),
        langItems: idiomasHtml(traducoes, idioma, pagina),
        contato: contatoHtml(t, site, pagina),
        apelo: pagina.id === 'home'
          ? t.volunteer.boxes[0].content.map(blocoHtml).join('\n          ')
          : '',
        doacaoTexto: pagina.id === 'donations'
          ? t.donations.boxes[0].content.map(blocoHtml).join('\n          ')
          : '',
        caixa: caixasTexto(pagina, t[pagina.id].boxes || []),
        cartaz: {
          jpg: `/img/${site.cartaz.arquivo}.jpg`,
          webp: `/img/${site.cartaz.arquivo}.webp`,
          largura: site.cartaz.largura,
          altura: site.cartaz.altura,
        },
        voluntarioAtivo: String(formsAtivos),
      }
      ctx.content = render(templates[pagina.id], ctx)
      const html = render(layout, ctx)
      const pasta = join(SAIDA, caminho(idioma, pagina))
      await mkdir(pasta, { recursive: true })
      await writeFile(join(pasta, 'index.html'), html)
      gerados++
    }
  }

  await cp(join(SRC, 'css'), join(SAIDA, 'css'), { recursive: true })
  await cp(join(SRC, 'js'), join(SAIDA, 'js'), { recursive: true })
  await cp(join(SRC, 'fonts'), join(SAIDA, 'fonts'), { recursive: true })
  const temOgReal = await copiarImagens()
  if (!temOgReal) await writeFile(join(SAIDA, 'img', 'og.png'), pngSolido(1200, 630, [0x1b, 0x5e, 0x20]))
  await writeFile(join(SAIDA, '_headers'), HEADERS)
  await writeFile(join(SAIDA, '_redirects'), redirectsTxt())
  await writeFile(join(SAIDA, 'sitemap.xml'), sitemapXml(site, traducoes))
  await writeFile(join(SAIDA, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.baseUrl}/sitemap.xml\n`)

  console.log(`Build concluído: ${gerados} páginas HTML em ${SAIDA}`)
  if (!formsAtivos) console.warn('Aviso: recepcao vazia em src/site.json. Os formulários não enviam.')
  if (site.robotsNoindex) console.warn('Aviso: robotsNoindex=true. O site pede aos buscadores para não indexar.')
}

main().catch((erro) => {
  console.error(`Build falhou: ${erro.message}`)
  process.exit(1)
})
