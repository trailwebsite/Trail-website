// servidor — entrega o site e o painel; o HTML público sai com o conteúdo do banco
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { dirname, join, normalize, resolve, extname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { abrirBanco, semear, textosDoIdioma, imagensMapa, galeriasCompletas, listaVoluntarios, listaAfiliados } from './banco.mjs'
import { lerSessao } from './auth.mjs'
import { aplicarConteudo, injetarEditor, injetarVer } from './conteudo.mjs'
import { tratar, limparUploadsVelhos } from './rotas.mjs'

const RAIZ = dirname(fileURLToPath(import.meta.url))
const PROJETO = dirname(RAIZ)

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.ico': 'image/x-icon',
}

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self'",
  "connect-src 'self' https://formspree.io https://formsubmit.co",
  "form-action 'self' https://formspree.io https://formsubmit.co",
  "frame-src https://docs.google.com",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join('; ')

function carregarEnv(arquivo) {
  if (!existsSync(arquivo)) return
  for (const linha of readFileSync(arquivo, 'utf8').split('\n')) {
    const limpa = linha.trim()
    if (!limpa || limpa.startsWith('#')) continue
    const i = limpa.indexOf('=')
    if (i < 1) continue
    const chave = limpa.slice(0, i).trim()
    let valor = limpa.slice(i + 1).trim()
    if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) valor = valor.slice(1, -1)
    if (!(chave in process.env)) process.env[chave] = valor
  }
}

function garantirSegredos() {
  carregarEnv(join(PROJETO, '.env'))
  const local = join(RAIZ, 'segredos.local')
  carregarEnv(local)
  const faltam = []
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = cryptoRandom()
    faltam.push(`SESSION_SECRET=${process.env.SESSION_SECRET}`)
  }
  if (!process.env.SETUP_TOKEN) {
    process.env.SETUP_TOKEN = cryptoRandom()
    faltam.push(`SETUP_TOKEN=${process.env.SETUP_TOKEN}`)
  }
  if (faltam.length) {
    const anterior = existsSync(local) ? readFileSync(local, 'utf8') : ''
    writeSegredos(local, `${anterior}${anterior.endsWith('\n') || !anterior ? '' : '\n'}${faltam.join('\n')}\n`)
  }
}

function cryptoRandom() {
  return randomBytes(32).toString('hex')
}

function writeSegredos(arquivo, texto) {
  writeFileSync(arquivo, texto, { mode: 0o600 })
}

function cookiesDe(req) {
  const saida = {}
  for (const parte of (req.headers.cookie || '').split(';')) {
    const i = parte.indexOf('=')
    if (i > 0) saida[parte.slice(0, i).trim()] = decodeURIComponent(parte.slice(i + 1).trim())
  }
  return saida
}

function lerLimitado(req, max) {
  return new Promise((resolve, reject) => {
    const pedacos = []
    let total = 0
    req.on('data', (bloco) => {
      total += bloco.length
      if (total > max) {
        const erro = new Error('grande')
        erro.codigo = 'grande'
        reject(erro)
        req.destroy()
        return
      }
      pedacos.push(bloco)
    })
    req.on('end', () => resolve(Buffer.concat(pedacos)))
    req.on('error', reject)
  })
}

function idiomaDaUrl(pathname) {
  const m = pathname.match(/^\/(es|pt|ko|ja|zh)(\/|$)/)
  return m ? m[1] : 'en'
}

function caminhoSite(siteDir, pathname) {
  const limpo = decodeURIComponent(pathname.split('?')[0])
  if (limpo.includes('\0')) return null
  const relativo = limpo.replace(/^\/+/, '')
  const absoluto = normalize(join(siteDir, relativo))
  const base = resolve(siteDir)
  if (absoluto !== base && !absoluto.startsWith(`${base}/`)) return null
  if (existsSync(absoluto) && statSync(absoluto).isDirectory()) {
    const indice = join(absoluto, 'index.html')
    return existsSync(indice) ? indice : null
  }
  if (existsSync(absoluto) && statSync(absoluto).isFile()) return absoluto
  if (!extname(absoluto)) {
    const indice = join(absoluto, 'index.html')
    if (existsSync(indice)) return indice
  }
  return null
}

function cabecalhos(res, seguro) {
  res.setHeader('Content-Security-Policy', CSP)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('X-Robots-Tag', 'noindex')
  if (seguro) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
}

function enviarStream(req, res, arquivo, tipo) {
  const tamanho = statSync(arquivo).size
  const faixa = req.headers.range
  if (faixa && tipo.startsWith('video/')) {
    const m = /bytes=(\d+)-(\d*)/.exec(faixa)
    if (!m) {
      res.writeHead(416)
      res.end()
      return
    }
    const ini = Number(m[1])
    const fim = m[2] ? Number(m[2]) : tamanho - 1
    if (ini > fim || fim >= tamanho) {
      res.writeHead(416)
      res.end()
      return
    }
    res.writeHead(206, {
      'Content-Type': tipo,
      'Content-Range': `bytes ${ini}-${fim}/${tamanho}`,
      'Content-Length': fim - ini + 1,
      'Accept-Ranges': 'bytes',
    })
    createReadStream(arquivo, { start: ini, end: fim }).pipe(res)
    return
  }
  res.setHeader('Content-Type', tipo)
  res.setHeader('Content-Length', tamanho)
  res.setHeader('Accept-Ranges', 'bytes')
  createReadStream(arquivo).pipe(res)
}

export function criarServidor(opcoes) {
  const siteDir = opcoes.siteDir
  const db = opcoes.db
  const segredo = opcoes.segredo
  const setup = opcoes.setup
  const publico = opcoes.publico
  const limiteImagem = opcoes.limiteImagem
  const limiteVideo = opcoes.limiteVideo

  return createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://local')
    const seguro = opcoes.seguro(req)
    cabecalhos(res, seguro)
    const ctx = {
      req, res, url,
      caminho: url.pathname,
      metodo: req.method || 'GET',
      db, segredo, setup, seguro,
      ip: req.socket.remoteAddress || '',
      cookies: cookiesDe(req),
      pastaMidia: opcoes.pastaMidia,
      pastaCopia: opcoes.pastaCopia,
      pastaTmp: opcoes.pastaTmp,
      limiteImagem, limiteVideo,
      lerRaw: (max) => lerLimitado(req, max),
      lerForm: async () => {
        const bruto = (await lerLimitado(req, 100_000)).toString('utf8')
        return Object.fromEntries(new URLSearchParams(bruto))
      },
      lerJson: async () => JSON.parse((await lerLimitado(req, 4_000_000)).toString('utf8') || '{}'),
    }
    try {
      const tratado = await tratar(ctx)
      if (tratado !== false) return
      if (url.pathname === '/panel/acesso.css' || url.pathname === '/panel/editor.css' || url.pathname === '/panel/editor.js' || url.pathname === '/panel/ver.js') {
        const nome = url.pathname.slice('/panel/'.length)
        const arquivo = join(publico, nome === 'acesso.css' ? 'acesso.css' : nome)
        if (!existsSync(arquivo)) {
          res.writeHead(404)
          res.end()
          return
        }
        res.setHeader('Cache-Control', 'no-store')
        enviarStream(req, res, arquivo, TIPOS[extname(arquivo)] || 'application/octet-stream')
        return
      }
      if (url.pathname.startsWith('/midia/')) {
        const nome = url.pathname.slice('/midia/'.length)
        if (!/^[\da-f]{32}\.[a-z0-9]+$/.test(nome)) {
          res.writeHead(404)
          res.end()
          return
        }
        const arquivo = join(opcoes.pastaMidia, nome)
        if (!existsSync(arquivo)) {
          res.writeHead(404)
          res.end()
          return
        }
        res.setHeader('Cache-Control', 'public, max-age=86400')
        if (extname(nome) === '.svg') res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox")
        enviarStream(req, res, arquivo, TIPOS[extname(nome)] || 'application/octet-stream')
        return
      }
      const arquivo = caminhoSite(siteDir, url.pathname)
      if (!arquivo) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('No encontrado')
        return
      }
      if (arquivo.endsWith('.html')) {
        const idioma = idiomaDaUrl(url.pathname)
        let html = readFileSync(arquivo, 'utf8')
        html = aplicarConteudo(html, {
          textos: textosDoIdioma(db, idioma),
          imagens: imagensMapa(db),
          galerias: galeriasCompletas(db),
          voluntarios: listaVoluntarios(db),
          afiliados: listaAfiliados(db),
        })
        const sessao = lerSessao(db, ctx.cookies.painel_sessao, segredo, 'plena')
        if (sessao && url.searchParams.get('painel') === 'ver') html = injetarVer(html)
        else if (sessao) html = injetarEditor(html, sessao.csrf)
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Cache-Control', 'private, no-store')
        res.setHeader('Vary', 'Cookie')
        res.end(html)
        return
      }
      res.setHeader('Cache-Control', 'public, max-age=300')
      enviarStream(req, res, arquivo, TIPOS[extname(arquivo)] || 'application/octet-stream')
    } catch (erro) {
      if (res.headersSent) return
      const status = erro.codigo === 'grande' ? 413 : 500
      res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end(status === 413 ? 'Demasiado grande' : 'Error')
    }
  })
}

export function preparar(opcoes = {}) {
  garantirSegredos()
  const db = abrirBanco(opcoes.db || process.env.PAINEL_DB || join(RAIZ, 'dados.sqlite'))
  const semente = join(opcoes.siteDir || join(PROJETO, 'site'), 'painel-semente.json')
  if (existsSync(semente)) semear(db, JSON.parse(readFileSync(semente, 'utf8')))
  const pastaTmp = join(RAIZ, 'tmp')
  limparUploadsVelhos(db, pastaTmp)
  return { db, segredo: process.env.SESSION_SECRET, setup: process.env.SETUP_TOKEN }
}

function principal() {
  if (!process.argv[1]) return false
  return import.meta.url === pathToFileURL(resolve(process.argv[1])).href
}

if (principal()) {
  if (Number(process.versions.node.split('.')[0]) < 22) {
    console.error('O painel precisa do Node 22.')
    process.exit(1)
  }
  const porta = Number(process.env.PORT || 8787)
  const prep = preparar()
  const servidor = criarServidor({
    db: prep.db,
    segredo: prep.segredo,
    setup: prep.setup,
    siteDir: join(PROJETO, 'site'),
    publico: join(RAIZ, 'publico'),
    pastaMidia: join(RAIZ, 'midia'),
    pastaCopia: join(RAIZ, 'copias'),
    pastaTmp: join(RAIZ, 'tmp'),
    limiteImagem: Number(process.env.UPLOAD_IMAGEM_MAX || 8 * 1024 * 1024),
    limiteVideo: Number(process.env.UPLOAD_VIDEO_MAX || 80 * 1024 * 1024),
    seguro: (req) => {
      if (process.env.PAINEL_SEGURO === '1') return true
      if (process.env.PAINEL_SEGURO === '0') return false
      return process.env.PAINEL_PROXY === '1' && req.headers['x-forwarded-proto'] === 'https'
    },
  })
  servidor.listen(porta, '127.0.0.1', () => {
    const base = process.env.PAINEL_URL || `http://127.0.0.1:${porta}`
    console.log(`Painel no ar: ${base}`)
    console.log(`Link do cliente: ${base}/panel/setup/${prep.setup}`)
    if (!process.env.SMTP_HOST && !process.env.RESEND_API_KEY) {
      console.log('Aviso: SMTP ainda não está configurado. O login não precisa de e-mail. Só "esqueci a senha" manda um link.')
    }
  })
}
