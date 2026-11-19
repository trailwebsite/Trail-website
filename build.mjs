// build.mjs — gera o site estático em /site: 7 páginas × 6 idiomas, redirects, sitemap, robots, headers, ativos e o manifesto do Publish
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'
import { IDIOMAS, PAGINAS, caminho, montarFontes, gerarPaginaBase } from './painel/base-site.mjs'
import { hashArquivoPages } from './painel/blake3.mjs'

const RAIZ = dirname(fileURLToPath(import.meta.url))
const SRC = join(RAIZ, 'src')
const SAIDA = join(RAIZ, 'site')

// _routes.json — a Function só roda no painel e na mídia; o site público sai direto dos assets
const ROTAS_JSON = '{"version":1,"include":["/panel/*","/interno/*","/midia/*"],"exclude":[]}'

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

// manifesto estático — path, hash e tipo do que o Publish do painel não regenera (tudo menos o HTML das páginas)
const TIPOS = {
  css: 'text/css', html: 'text/html', jpg: 'image/jpeg', jpeg: 'image/jpeg', js: 'application/javascript',
  json: 'application/json', mp4: 'video/mp4', png: 'image/png', svg: 'image/svg+xml', txt: 'text/plain',
  webm: 'video/webm', webp: 'image/webp', woff2: 'font/woff2', xml: 'application/xml',
}
const FORA_DO_MANIFESTO = new Set(['_worker.js', '_headers', '_redirects', '_routes.json'])

async function montarManifestoEstatico() {
  const arquivos = {}
  async function andar(pasta, prefixo) {
    for (const nome of (await readdir(join(SAIDA, pasta), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const rel = pasta ? `${pasta}/${nome.name}` : nome.name
      if (nome.isDirectory()) { await andar(rel); continue }
      if (FORA_DO_MANIFESTO.has(rel) || rel.endsWith('.html')) continue
      const ext = rel.includes('.') ? rel.split('.').pop().toLowerCase() : ''
      const conteudo = readFileSync(join(SAIDA, rel))
      arquivos[`/${rel}`] = { h: hashArquivoPages(conteudo, ext), t: TIPOS[ext] || 'application/octet-stream', b: conteudo.length }
    }
  }
  await andar('')
  const especiais = { headers: HEADERS, redirects: redirectsTxt(), rotas: ROTAS_JSON }
  const versao = hashArquivoPages(Buffer.from(JSON.stringify({ arquivos, especiais })), 'json')
  const manifesto = { versao, arquivos, especiais }
  await writeFile(join(RAIZ, 'painel', 'manifesto-estatico.json'), JSON.stringify(manifesto))
  return manifesto
}

async function main() {
  const site = JSON.parse(await readFile(join(SRC, 'site.json'), 'utf8'))
  const layout = await readFile(join(SRC, 'templates', 'layout.html'), 'utf8')
  const templatesCrus = {}
  for (const p of PAGINAS) templatesCrus[p.id] = await readFile(join(SRC, 'templates', `${p.id}.html`), 'utf8')
  const i18nCrus = {}
  for (const idioma of IDIOMAS) i18nCrus[idioma.code] = JSON.parse(await readFile(join(SRC, 'i18n', `${idioma.code}.json`), 'utf8'))
  const fontes = montarFontes(site, i18nCrus, layout, templatesCrus)
  const traducoes = fontes.traducoes
  // o Publish do painel importa os templates como JSON (o bundle não aceita .html num arquivo só)
  await writeFile(join(RAIZ, 'painel', 'templates-site.json'), JSON.stringify({ layout, templates: templatesCrus }))

  await rm(SAIDA, { recursive: true, force: true })
  await mkdir(SAIDA, { recursive: true })

  const ano = new Date().getFullYear()
  const recepcao = typeof site.recepcao === 'string' ? site.recepcao.trim() : ''
  const formsAtivos = recepcao.includes('@')
  let gerados = 0

  for (const idioma of IDIOMAS) {
    for (const pagina of PAGINAS) {
      const html = gerarPaginaBase(fontes, idioma.code, pagina.id, ano)
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
  await writeFile(join(SAIDA, '_routes.json'), ROTAS_JSON)
  await writeFile(join(SAIDA, 'sitemap.xml'), sitemapXml(site, traducoes))
  await writeFile(join(SAIDA, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /panel\n\nSitemap: ${site.baseUrl}/sitemap.xml\n`)
  await writeFile(join(SAIDA, 'painel-semente.json'), JSON.stringify(montarSemente(site, traducoes)))
  await montarManifestoEstatico()

  console.log(`Build concluído: ${gerados} páginas HTML em ${SAIDA}`)
  if (!formsAtivos) console.warn('Aviso: recepcao vazia em src/site.json. Os formulários não enviam.')
  if (site.robotsNoindex) console.warn('Aviso: robotsNoindex=true. O site pede aos buscadores para não indexar.')
}

main().catch((erro) => {
  console.error(`Build falhou: ${erro.message}`)
  process.exit(1)
})
