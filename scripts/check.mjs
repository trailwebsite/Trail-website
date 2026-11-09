// check.mjs — verificação do site gerado: URLs, links internos, ids, alt, inline, console.log, CSS sem uso
import { readFile, readdir, stat } from 'node:fs/promises'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { servir } from './serve.mjs'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = join(RAIZ, 'site')
const site = JSON.parse(await readFile(join(RAIZ, 'src', 'site.json'), 'utf8'))

// inglês na raiz; 5 páginas × 6 idiomas
const ESPERADO = {}
const LANGS = { '': 'en', '/es': 'es', '/pt': 'pt-BR', '/ko': 'ko', '/ja': 'ja', '/zh': 'zh-Hans' }
for (const [prefixo, lang] of Object.entries(LANGS)) {
  for (const rota of ['', 'trails/', 'volunteer/', 'donations/', 'audio-video/']) ESPERADO[`${prefixo}/${rota}`] = [lang]
}

const falhas = []
const falha = (msg) => falhas.push(msg)

async function listar(pasta) {
  const saida = []
  for (const nome of await readdir(pasta)) {
    const caminho = join(pasta, nome)
    if ((await stat(caminho)).isDirectory()) saida.push(...(await listar(caminho)))
    else saida.push(caminho)
  }
  return saida
}

async function existe(caminho) {
  try { await stat(caminho); return true } catch { return false }
}

const arquivos = await listar(SITE)
const htmls = arquivos.filter((a) => a.endsWith('.html'))
if (htmls.length !== 30) falha(`Esperava 30 HTML, encontrei ${htmls.length}`)

const titulos = new Set()
const textoCss = await readFile(join(SITE, 'css', 'style.css'), 'utf8')
const textoJs = (await Promise.all(arquivos.filter((a) => a.endsWith('.js')).map((a) => readFile(a, 'utf8')))).join('\n')
let todoHtml = ''

for (const arquivo of htmls) {
  // comentários não contam: são instruções para quem edita, não conteúdo entregue
  const html = (await readFile(arquivo, 'utf8')).replace(/<!--[\s\S]*?-->/g, '')
  todoHtml += html
  const rel = '/' + relative(SITE, dirname(arquivo)).split('\\').join('/')
  const url = rel === '/.' || rel === '/' ? '/' : `${rel}/`
  const rotulo = `[${url}]`

  // lang e title
  const lang = html.match(/<html lang="([^"]*)">/)?.[1]
  if (!ESPERADO[url]) falha(`${rotulo} URL fora da lista esperada`)
  else if (lang !== ESPERADO[url][0]) falha(`${rotulo} lang="${lang}", esperado "${ESPERADO[url][0]}"`)
  const titulo = html.match(/<title>([^<]*)<\/title>/)?.[1]
  if (!titulo) falha(`${rotulo} sem <title>`)
  else if (titulos.has(`${lang}|${titulo}`)) falha(`${rotulo} título repetido no mesmo idioma: ${titulo}`)
  titulos.add(`${lang}|${titulo}`)

  // um h1, encabeçados sem salto
  const h1 = (html.match(/<h1[\s>]/g) || []).length
  if (h1 !== 1) falha(`${rotulo} tem ${h1} h1`)
  const niveis = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]))
  for (let i = 1; i < niveis.length; i++) if (niveis[i] > niveis[i - 1] + 1) falha(`${rotulo} salto de encabeçado h${niveis[i - 1]} → h${niveis[i]}`)

  // ids duplicados
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])
  const vistos = new Set()
  for (const id of ids) {
    if (vistos.has(id)) falha(`${rotulo} id duplicado: ${id}`)
    vistos.add(id)
  }

  // imagens sem alt
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) falha(`${rotulo} <img> sem alt: ${m[0]}`)

  // inline proibido pela CSP
  if (/<script\b[^>]*>[^<]*\S[^<]*<\/script>/.test(html)) falha(`${rotulo} <script> com conteúdo inline`)
  if (/<style\b/.test(html)) falha(`${rotulo} <style> inline`)
  if (/\sstyle="/.test(html)) falha(`${rotulo} atributo style inline`)
  if (/\son[a-z]+="/i.test(html)) falha(`${rotulo} manipulador on* inline`)

  // hrefs e srcs internos
  for (const m of html.matchAll(/\s(?:href|src|action)="([^"]*)"/g)) {
    const alvo = m[1]
    if (alvo.startsWith(site.baseUrl)) continue
    if (/localhost|pages\.dev/.test(alvo)) falha(`${rotulo} endereço escrito à mão: ${alvo}`)
    if (alvo.startsWith('/')) {
      const semHash = alvo.split('#')[0]
      const destino = join(SITE, semHash, semHash.endsWith('/') ? 'index.html' : '')
      if (!(await existe(destino))) falha(`${rotulo} link interno quebrado: ${alvo}`)
    } else if (alvo.startsWith('#')) {
      if (!ids.includes(alvo.slice(1))) falha(`${rotulo} âncora sem destino: ${alvo}`)
    }
  }

  // alternates: 6 idiomas + x-default
  const alternates = (html.match(/rel="alternate" hreflang=/g) || []).length
  if (alternates !== 7) falha(`${rotulo} esperava 7 hreflang, encontrei ${alternates}`)
  if (!/rel="canonical" href="https:\/\//.test(html)) falha(`${rotulo} canonical ausente ou relativo`)
  if (!/\(.*\)/.test(html) && /target="_blank"/.test(html)) falha(`${rotulo} target=_blank sem aviso textual`)
  for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener[^"]*noreferrer|rel="[^"]*noreferrer[^"]*noopener/.test(m[0])) falha(`${rotulo} _blank sem rel noopener noreferrer`)
  }
}

// console.log esquecido
if (/console\.(log|debug)\(/.test(textoJs)) falha('console.log/debug esquecido em JS')

// classes CSS sem uso em HTML nem JS
const PREPARADAS = new Set()
const cssSemUrl = textoCss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\([^)]*\)/g, '')
const classes = new Set([...cssSemUrl.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]))
for (const classe of classes) {
  if (PREPARADAS.has(classe)) continue
  const usada = new RegExp(`class="[^"]*\\b${classe}\\b[^"]*"`).test(todoHtml) || textoJs.includes(`'${classe}'`) || textoJs.includes(`.${classe}`)
  if (!usada) falha(`classe CSS sem uso: .${classe}`)
}

// arquivos duplicados por conteúdo (fora os HTML, que são distintos por natureza)
const hashes = new Map()
for (const arquivo of arquivos.filter((a) => !a.endsWith('.html'))) {
  const conteudo = await readFile(arquivo)
  const chave = `${conteudo.length}:${conteudo.subarray(0, 512).toString('hex')}`
  if (hashes.has(chave) && conteudo.equals(await readFile(hashes.get(chave)))) falha(`arquivo duplicado: ${arquivo} = ${hashes.get(chave)}`)
  hashes.set(chave, arquivo)
}

// servidor local: toda URL deve responder 200
const servidor = await servir(SITE, 0)
const base = `http://127.0.0.1:${servidor.address().port}`
const urls = [...Object.keys(ESPERADO), '/css/style.css', '/js/site.js', '/js/flag.js', '/img/logo-inca-braille-trail.png', '/robots.txt', '/sitemap.xml', '/img/og.png', '/img/cartaz-inca-braille-trail.jpg', '/img/cartaz-inca-braille-trail.webp', '/fonts/montserrat-latin-wght-normal.woff2']
for (const url of urls) {
  const resposta = await fetch(base + url)
  if (resposta.status !== 200) falha(`HTTP ${resposta.status} em ${url}`)
}
servidor.close()

if (falhas.length) {
  console.error(`Verificação falhou (${falhas.length}):`)
  for (const f of falhas) console.error(` - ${f}`)
  process.exit(1)
}
console.log(`Verificação OK: ${htmls.length} páginas, ${urls.length} URLs respondendo, sem inline, sem link quebrado.`)
