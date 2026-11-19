// build.mjs — gera o site estático em /site: 7 páginas × 6 idiomas, redirects, sitemap, robots, headers e ativos
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
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
  { id: 'educational', rota: 'educational-trail' },
  { id: 'sensory', rota: 'sensory-trail' },
  { id: 'volunteer', rota: 'volunteer' },
  { id: 'sponsors', rota: 'sponsors' },
  { id: 'donations', rota: 'donations' },
  { id: 'app', rota: 'app' },
]
// barra larga: Home abre as trilhas (e a própria Home); Patrocinadores abre Doações
// soMovel: no celular essas páginas entram só na caixa do Home
const MENU = [
  {
    id: 'home',
    filhos: [
      { id: 'home' },
      { id: 'educational' },
      { id: 'sensory' },
      { id: 'volunteer', soMovel: true },
      { inscricao: true, soMovel: true },
      { id: 'sponsors', soMovel: true },
      { id: 'donations', soMovel: true },
      { id: 'app', soMovel: true },
    ],
  },
  { id: 'volunteer', soLargo: true, filhos: [{ id: 'volunteer' }, { inscricao: true }] },
  {
    id: 'sponsors',
    soLargo: true,
    filhos: [
      { id: 'sponsors' },
      { id: 'donations' },
    ],
  },
  { id: 'app', filhos: [] },
]
const POR_ID = Object.fromEntries(PAGINAS.map((p) => [p.id, p]))
const OG_LOCALE = { en: 'en_US', es: 'es_PE', pt: 'pt_BR', ko: 'ko_KR', ja: 'ja_JP', zh: 'zh_CN' }
const GOOGLE_HL = { en: 'en', es: 'es', pt: 'pt', ko: 'ko', ja: 'ja', zh: 'zh-CN' }

// formulário Google — o hl troca o idioma das frases do próprio Google
function googleFormComIdioma(url, codigo) {
  if (!url) return ''
  try {
    const u = new URL(url)
    u.searchParams.set('embedded', 'true')
    u.searchParams.set('hl', GOOGLE_HL[codigo] || 'en')
    return u.href
  } catch {
    return url
  }
}

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

// texto de menu — rótulos que o dono não edita (botão do menu, idioma)
function textoTravado(valor) {
  return `<span data-edit="locked">${escapar(valor)}</span>`
}

// rótulo clicável do menu — o painel pergunta se é para editar ou abrir a página
function textoMenu(chave, valor) {
  const seguro = escapar(valor).replaceAll('\n', '<br>')
  return `<span data-edit-key="${escapar(chave)}" data-edit-type="text" data-edit-nav="1">${seguro}</span>`
}

// texto que o dono pode editar; chave estável por idioma
function textoEditavel(chave, valor) {
  const seguro = escapar(valor).replaceAll('\n', '<br>')
  if (chave.startsWith('t.nav.')) return textoTravado(valor)
  if (!/^(t\.|contas\.|contato\.)/.test(chave)) return seguro
  return `<span data-edit-key="${escapar(chave)}" data-edit-type="text">${seguro}</span>`
}

// o miolo do elemento, fora de title e de atributo
function editavelAqui(template, index) {
  const ate = template.slice(0, index)
  const fecha = ate.lastIndexOf('>')
  const abre = fecha >= 0 ? ate.lastIndexOf('<', fecha) : -1
  if (abre >= 0 && ate.lastIndexOf('<') > fecha) return false
  const tag = abre >= 0 ? ate.slice(abre, fecha + 1) : ''
  if (tag.includes('data-edit-key')) return false
  const titulo = ate.lastIndexOf('<title')
  const tituloFim = ate.lastIndexOf('</title>')
  if (titulo > tituloFim) return false
  return true
}

function buscar(obj, chave) {
  return chave.split('.').reduce((acc, parte) => (acc == null ? undefined : acc[parte]), obj)
}

// render — troca {{chave}} (escapado) e {{{chave}}} (HTML cru); chave ausente derruba o build
function render(template, ctx) {
  return template.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}|\{\{\s*([\w.]+)\s*\}\}/g, (trecho, cru, esc, offset) => {
    const chave = cru || esc
    const valor = buscar(ctx, chave)
    if (valor === undefined) throw new Error(`Chave ausente no template: ${chave}`)
    if (cru) return String(valor)
    const texto = String(valor)
    if (!editavelAqui(template, offset)) return escapar(texto)
    return textoEditavel(chave, texto)
  })
}

// galerias — chave estável e id de cada item, sem mudar a ordem do HTML
function prepararGalerias(html) {
  return html.replace(/<ul class="galeria">([\s\S]*?)<\/ul>/g, (tudo, miolo, offset) => {
    const antes = html.slice(Math.max(0, offset - 900), offset)
    const marcas = [...antes.matchAll(/data-galeria="([^"]+)"/g)]
    const id = marcas.length ? marcas[marcas.length - 1][1] : 'galeria'
    const abrir = (miolo.match(/aria-label="\{\{\s*([^}]+?)\s*\}\}/) || [])[1] || ''
    let n = 0
    let corpo = miolo.replace(/<li class="galeria-item">/g, () => {
      n += 1
      return `<li class="galeria-item" data-item-id="${id}-${n}">`
    })
    corpo = corpo.replace(/data-legenda="\{\{\s*([^}]+?)\s*\}\}"/g, (_, chave) => {
      return `data-legenda="{{${chave}}}" data-legenda-chave="${chave}"`
    })
    const abrirAttr = abrir ? ` data-abrir-chave="${abrir}"` : ''
    return `<ul class="galeria" data-edit-key="galeria.${id}" data-edit-type="gallery"${abrirAttr}>${corpo}</ul>`
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

function linkNav(t, idioma, id, paginaAtual, classe, extra) {
  if (extra && extra.inscricao) {
    const cls = classe ? ` class="${classe} nav-inscricao"` : ' class="nav-inscricao"'
    return `<a${cls} href="${caminho(idioma, POR_ID.volunteer)}#inscricao">${textoMenu('t.volunteer.signNow', t.volunteer.signNow)}</a>`
  }
  const pagina = POR_ID[id]
  const atual = id === paginaAtual.id ? ' aria-current="page"' : ''
  const cls = classe ? ` class="${classe}"` : ''
  return `<a${cls} href="${caminho(idioma, pagina)}"${atual}>${textoMenu(`t.nav.${id}`, t.nav[id])}</a>`
}

function navHtml(t, idioma, paginaAtual) {
  return MENU.map((item) => {
    const filhos = item.filhos
    if (!filhos.length) return `<li class="so-largo">${linkNav(t, idioma, item.id, paginaAtual, 'maiusculas')}</li>`
    const naSecao = item.id === paginaAtual.id || filhos.some((filho) => !filho.soMovel && filho.id === paginaAtual.id)
    const largo = item.soLargo ? ' so-largo' : ''
    const secao = naSecao ? ` class="tem-menu secao-atual${largo}"` : ` class="tem-menu${largo}"`
    const itens = filhos.map((filho) => {
      const classe = filho.soMovel ? ' class="so-movel"' : ''
      if (filho.inscricao) return `<li${classe}>${linkNav(t, idioma, 'volunteer', paginaAtual, '', { inscricao: true })}</li>`
      return `<li${classe}>${linkNav(t, idioma, filho.id, paginaAtual, '')}</li>`
    }).join('')
    const rotulo = `${escapar(t.nav.open)}: ${escapar(t.nav[item.id])}`
    return `<li${secao}>${linkNav(t, idioma, item.id, paginaAtual, 'maiusculas')}<button class="submenu-botao" type="button" aria-expanded="false" aria-controls="submenu-${item.id}"><span class="oculto-visual">${rotulo}</span></button><ul class="submenu" id="submenu-${item.id}" aria-label="${escapar(t.nav[item.id])}">${itens}</ul></li>`
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

// redirects — /en/* era o inglês; a página única de trilhas abre na trilha educativa
function redirectsTxt() {
  const linhas = ['# Rotas antigas. Inglês saiu de /en/ para a raiz. /trails/ abre a trilha educativa.']
  for (const idioma of IDIOMAS) {
    const prefixo = idioma.prefix ? `/${idioma.prefix}` : ''
    const destino = `${prefixo}/educational-trail/`
    linhas.push(`${prefixo}/trails    ${destino}  301`)
    linhas.push(`${prefixo}/trails/   ${destino}  301`)
    linhas.push(`${prefixo}/trails/*  ${destino}  301`)
  }
  linhas.push('/en/trails    /educational-trail/  301')
  linhas.push('/en/trails/   /educational-trail/  301')
  linhas.push('/en/trails/*  /educational-trail/  301')
  linhas.push('/en     /  301')
  linhas.push('/en/    /  301')
  linhas.push('/en/*   /:splat  301')
  for (const idioma of IDIOMAS) {
    const prefixo = idioma.prefix ? `/${idioma.prefix}` : ''
    linhas.push(`${prefixo}/audio-video    ${prefixo || ''}/  301`)
    linhas.push(`${prefixo}/audio-video/   ${prefixo || ''}/  301`)
  }
  return linhas.join('\n') + '\n'
}

// blocoHtml — um item de conteúdo de caixa: parágrafo, destaque ou lista
function blocoHtml(item, chave) {
  if (typeof item === 'string') return `<p>${textoEditavel(chave, item)}</p>`
  if (item.lead) return `<p class="destaque">${textoEditavel(`${chave}.lead`, item.lead)}</p>`
  if (item.list) return `<ul class="lista">${item.list.map((i, n) => `<li>${textoEditavel(`${chave}.list.${n}`, i)}</li>`).join('')}</ul>`
  throw new Error(`Bloco de caixa desconhecido: ${JSON.stringify(item)}`)
}

// caixaHtml — caixa que abre e fecha: botão dentro de h2 e painel; o JS fecha ao carregar
function caixaHtml(id, titulo, chaveTitulo, corpo) {
  return `<section class="caixa">
      <h2 class="caixa-titulo"><button class="caixa-botao" type="button" id="${id}-botao" aria-expanded="true" aria-controls="${id}">${textoEditavel(chaveTitulo, titulo)}</button></h2>
      <div class="caixa-painel" id="${id}" role="region" aria-labelledby="${id}-botao">
        ${corpo}
      </div>
    </section>`
}

// caixasTexto — caixas só de texto, vindas do JSON de idioma (boxes[]); a ordem é a do arquivo
function caixasTexto(pagina, boxes) {
  return boxes.map((caixa, i) =>
    caixaHtml(
      `caixa-${pagina.id}-${i + 1}`,
      caixa.title,
      `t.${pagina.id}.boxes.${i}.title`,
      caixa.content.map((item, j) => blocoHtml(item, `t.${pagina.id}.boxes.${i}.content.${j}`)).join('\n        '),
    ),
  )
}

// por enquanto o cliente só quer info@; os outros endereços ficam fora da página
const EMAILS_DA_PAGINA = {
  home: ['info'],
  educational: ['info'],
  sensory: ['info'],
  volunteer: ['info'],
  sponsors: ['info'],
  donations: ['info'],
  app: ['info'],
}

function contatoHtml(t, site, pagina) {
  const c = t.contact
  const emails = EMAILS_DA_PAGINA[pagina.id].map((chave) =>
    `<li><span class="email" data-edit-key="contato.email.${chave}" data-edit-type="text">${escapar(site.contato.emails[chave])}</span></li>`,
  ).join('\n              ')
  return `<section class="contato" aria-labelledby="contato-titulo">
      <div class="contato-interno">
        <h2 id="contato-titulo">${textoEditavel('t.contact.heading', c.heading)}</h2>
        <dl class="contato-lista">
          <div>
            <dt>${textoEditavel('t.contact.placeLabel', c.placeLabel)}</dt>
            <dd>${textoEditavel('t.contact.place', c.place)}<br>
              <a class="botao botao-leve" href="${site.contato.mapa}" target="_blank" rel="noopener noreferrer">${textoEditavel('t.contact.mapButton', c.mapButton)} <span class="externo">${textoEditavel('t.external', t.external)}</span></a>
            </dd>
          </div>
          <div>
            <dt>${textoEditavel('t.contact.phoneLabel', c.phoneLabel)}</dt>
            <dd><a data-href-chave="contato.telefone" data-href-prefixo="tel:" href="tel:${site.contato.telefone.replaceAll(' ', '')}">${textoEditavel('contato.telefone', site.contato.telefone)}</a><br>
              <a href="${site.contato.whatsapp}" target="_blank" rel="noopener noreferrer">${textoEditavel('t.contact.whatsappLink', c.whatsappLink)} <span class="externo">${textoEditavel('t.external', t.external)}</span></a>
            </dd>
          </div>
          <div>
            <dt>${textoEditavel('t.contact.socialLabel', c.socialLabel)}</dt>
            <dd>Instagram: ${textoEditavel('t.contact.tbc', c.tbc)}<br>Facebook: ${textoEditavel('t.contact.tbc', c.tbc)}</dd>
          </div>
          <div>
            <dt>${textoEditavel('t.contact.emailsLabel', c.emailsLabel)}</dt>
            <dd><ul>${emails}</ul></dd>
          </div>
        </dl>
      </div>
    </section>`
}

const HEADERS = `/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://formspree.io https://formsubmit.co; form-action https://formspree.io https://formsubmit.co; frame-src https://docs.google.com; base-uri 'self'; object-src 'none'; frame-ancestors 'none'
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

// montarSemente — textos, imagens e galerias que o painel copia na primeira vez
function achatar(obj, prefixo, saida) {
  if (typeof obj === 'string') {
    saida[prefixo] = obj
    return
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => achatar(item, `${prefixo}.${i}`, saida))
    return
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) achatar(v, prefixo ? `${prefixo}.${k}` : k, saida)
  }
}

function extrairImagens(html, destino) {
  for (const m of html.matchAll(/<(picture|img)\b[^>]*\bdata-edit-key="([^"]+)"[^>]*>/g)) {
    const chave = m[2]
    if (destino.has(chave)) continue
    let pedaco = m[0]
    if (m[1] === 'picture') pedaco = html.slice(m.index, html.indexOf('</picture>', m.index))
    const src = pedaco.match(/<img\b[^>]*\ssrc="([^"]+)"/)?.[1]
    if (!src) continue
    destino.set(chave, {
      chave,
      src,
      webp: pedaco.match(/\ssrcset="([^"]+)"/)?.[1] || '',
      altChave: m[0].match(/\bdata-alt-key="([^"]+)"/)?.[1] || '',
      largura: Number(pedaco.match(/\bwidth="(\d+)"/)?.[1] || 0),
      altura: Number(pedaco.match(/\bheight="(\d+)"/)?.[1] || 0),
    })
  }
}

function extrairGalerias(html) {
  const lista = []
  for (const m of html.matchAll(/<ul class="galeria"[^>]*\bdata-edit-key="([^"]+)"[^>]*>([\s\S]*?)<\/ul>/g)) {
    const abrir = m[0].match(/\bdata-abrir-chave="([^"]+)"/)?.[1] || ''
    const itens = []
    for (const li of m[2].matchAll(/<li class="galeria-item"[^>]*\bdata-item-id="([^"]+)"[\s\S]*?<\/li>/g)) {
      const bloco = li[0]
      const src = bloco.match(/\bdata-src="([^"]+)"/)?.[1]
      const legenda = bloco.match(/\bdata-legenda-chave="([^"]+)"/)?.[1]
      if (!src || !legenda) continue
      const tipo = /data-tipo="video"/.test(bloco) ? 'video' : 'imagem'
      const webp = bloco.match(/\ssrcset="([^"]+\.webp)"/)?.[1] || ''
      itens.push({
        id: li[1],
        tipo,
        src,
        webp,
        poster: '',
        legenda,
        largura: Number(bloco.match(/\bwidth="(\d+)"/)?.[1] || 0),
        altura: Number(bloco.match(/\bheight="(\d+)"/)?.[1] || 0),
      })
    }
    lista.push({ chave: m[1], abrir, itens })
  }
  return lista
}

function montarSemente(site, traducoes) {
  const textos = {}
  for (const idioma of IDIOMAS) {
    const plano = {}
    achatar(traducoes[idioma.code], 't', plano)
    for (const [chave, valor] of Object.entries(plano)) {
      textos[chave] ??= {}
      textos[chave][idioma.code] = valor
    }
    const fixos = {
      'alt.img.logo': site.siteName,
      'contato.telefone': site.contato.telefone,
      'contas.soles.bcp': site.doacao.soles.bcp,
      'contas.soles.interbancaria': site.doacao.soles.interbancaria,
      'contas.dolares.bcp': site.doacao.dolares.bcp,
      'contas.dolares.interbancaria': site.doacao.dolares.interbancaria,
    }
    for (const [papel, email] of Object.entries(site.contato.emails)) fixos[`contato.email.${papel}`] = email
    for (const [chave, valor] of Object.entries(fixos)) {
      textos[chave] ??= {}
      textos[chave][idioma.code] = valor
    }
  }
  const imagens = new Map()
  const galerias = []
  const vistas = new Set()
  for (const pagina of PAGINAS) {
    const arquivo = join(SAIDA, IDIOMAS[0].prefix, pagina.rota, 'index.html')
    const html = readFileSync(arquivo, 'utf8')
    extrairImagens(html, imagens)
    for (const g of extrairGalerias(html)) {
      if (vistas.has(g.chave)) continue
      vistas.add(g.chave)
      galerias.push(g)
    }
  }
  return { idiomas: IDIOMAS.map((i) => i.code), textos, imagens: [...imagens.values()], galerias }
}

async function main() {
  const site = JSON.parse(await readFile(join(SRC, 'site.json'), 'utf8'))
  const layout = await readFile(join(SRC, 'templates', 'layout.html'), 'utf8')
  const templates = {}
  for (const p of PAGINAS) templates[p.id] = prepararGalerias(await readFile(join(SRC, 'templates', `${p.id}.html`), 'utf8'))

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
  const googleFormBase = site.googleForms && typeof site.googleForms.voluntario === 'string'
    ? site.googleForms.voluntario.trim()
    : ''
  const googleFormDoacaoBase = site.googleForms && typeof site.googleForms.doacao === 'string'
    ? site.googleForms.doacao.trim()
    : ''
  const googleFormAfiliadoBase = site.googleForms && typeof site.googleForms.afiliado === 'string'
    ? site.googleForms.afiliado.trim()
    : ''
  let gerados = 0

  for (const idioma of IDIOMAS) {
    const t = traducoes[idioma.code]
    for (const pagina of PAGINAS) {
      const ctx = {
        siteName: site.siteName,
        formAction,
        formsAtivos: String(formsAtivos),
        googleFormVoluntario: googleFormComIdioma(googleFormBase, idioma.code),
        googleFormDoacao: googleFormComIdioma(googleFormDoacaoBase, idioma.code),
        googleFormAfiliado: googleFormComIdioma(googleFormAfiliadoBase, idioma.code),
        contas: site.doacao,
        htmlLang: t.htmlLang,
        title: t[pagina.id].title,
        titleKey: `t.${pagina.id}.title`,
        description: t[pagina.id].description,
        descriptionKey: `t.${pagina.id}.description`,
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
          ? t.volunteer.boxes[0].content.map((item, j) => blocoHtml(item, `t.volunteer.boxes.0.content.${j}`)).join('\n          ')
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
  await cp(join(RAIZ, 'painel', 'publico'), join(SAIDA, 'interno'), { recursive: true })
  await cp(join(SRC, 'js'), join(SAIDA, 'js'), { recursive: true })
  await cp(join(SRC, 'fonts'), join(SAIDA, 'fonts'), { recursive: true })
  const temOgReal = await copiarImagens()
  if (!temOgReal) await writeFile(join(SAIDA, 'img', 'og.png'), pngSolido(1200, 630, [0x1b, 0x5e, 0x20]))
  await cp(join(SRC, 'video'), join(SAIDA, 'video'), { recursive: true })
  await writeFile(join(SAIDA, '_headers'), HEADERS)
  await writeFile(join(SAIDA, '_redirects'), redirectsTxt())
  await writeFile(join(SAIDA, 'sitemap.xml'), sitemapXml(site, traducoes))
  await writeFile(join(SAIDA, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /panel\n\nSitemap: ${site.baseUrl}/sitemap.xml\n`)
  await writeFile(join(SAIDA, 'painel-semente.json'), JSON.stringify(montarSemente(site, traducoes)))

  console.log(`Build concluído: ${gerados} páginas HTML em ${SAIDA}`)
  if (!formsAtivos) console.warn('Aviso: recepcao vazia em src/site.json. Os formulários não enviam.')
  if (site.robotsNoindex) console.warn('Aviso: robotsNoindex=true. O site pede aos buscadores para não indexar.')
}

main().catch((erro) => {
  console.error(`Build falhou: ${erro.message}`)
  process.exit(1)
})
