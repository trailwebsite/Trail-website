// nuvem.mjs — painel no Cloudflare Pages: um e-mail, uma senha, o site no mesmo endereço
import {
  emailValido, textoPlano, textoRico, textoVisivel, chaveValida, segredoIgual, escapar,
  aplicarPadraoTexto, chaveTituloDaNav, tituloAPartirDaNav,
} from './sanitizar.mjs'
import { hashSenhaNuvem, senhaConfereHash } from './chave.mjs'
import { processarImagemNuvem, validarVideoNuvem, nomeAleatorio } from './arquivo.mjs'
import { aplicarConteudo, injetarEditor, injetarVer } from './conteudo.mjs'
import { detectarIdioma, traduzirTodos, manterFormato } from './traducao.mjs'
import * as paginas from './paginas.mjs'
import { publicar } from './publicar.mjs'
import semente from '../site/painel-semente.json'

const SITE_NAME = 'Inca Braille Trail'

const SESSAO_MS = 4 * 60 * 60 * 1000
const LIMITE_IMAGEM = 8 * 1024 * 1024
const LIMITE_VIDEO = 20 * 1024 * 1024
const PEDACO = 500 * 1024
const MSG = {
  curto: 'The password needs at least 12 characters.',
  distinta: 'The two passwords do not match.',
  correo: 'Check the email. It does not look valid.',
  grande: 'The file is too large.',
  formato: 'That file will not work. For photos use JPG, PNG, WebP, or SVG.',
  video: 'The video is too large or the format will not work. Use MP4 or WebM up to 20 MB.',
  guardar: 'We could not save. Try again.',
  sessao: 'Your session ended. Sign in again.',
  csrf: 'This page is out of date. Reload and try again.',
  bloqueio: 'Too many attempts. Wait a few minutes.',
  credencial: 'The email or the password is not correct.',
  cheio: 'There is no room for more files. Delete some photos or videos and try again.',
}

const TETO_BYTES = 9 * 1024 * 1024 * 1024

let falso = null
async function hashFalso() {
  if (!falso) falso = await hashSenhaNuvem('painel-enchimento-nao-e-senha')
  return falso
}

function banco(env) {
  const d1 = env.DB
  const ligar = (sql, args) => (args.length ? d1.prepare(sql).bind(...args) : d1.prepare(sql))
  return {
    async get(sql, ...args) {
      return (await ligar(sql, args).first()) ?? null
    },
    async all(sql, ...args) {
      const r = await ligar(sql, args).all()
      return r.results || []
    },
    async run(sql, ...args) {
      const r = await ligar(sql, args).run()
      return { changes: r.meta?.changes ?? 0 }
    },
    async batch(itens) {
      if (!itens.length) return
      const lote = 40
      for (let i = 0; i < itens.length; i += lote) {
        const fatia = itens.slice(i, i + lote)
        await d1.batch(fatia.map(([sql, args]) => ligar(sql, args || [])))
      }
    },
  }
}

function cookiesDe(request) {
  const saida = {}
  for (const parte of (request.headers.get('cookie') || '').split(';')) {
    const i = parte.indexOf('=')
    if (i > 0) saida[parte.slice(0, i).trim()] = decodeURIComponent(parte.slice(i + 1).trim())
  }
  return saida
}

function cookie(nome, valor, maxAge) {
  const partes = [`${nome}=${encodeURIComponent(valor)}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Secure']
  if (maxAge != null) partes.push(`Max-Age=${maxAge}`)
  return partes.join('; ')
}

function cabecas(extra) {
  const h = new Headers(extra || {})
  h.set('content-security-policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; connect-src 'self' https://formspree.io https://formsubmit.co; form-action 'self' https://formspree.io https://formsubmit.co; frame-src https://docs.google.com; base-uri 'self'; object-src 'none'; frame-ancestors 'none'")
  h.set('x-content-type-options', 'nosniff')
  h.set('x-frame-options', 'DENY')
  h.set('referrer-policy', 'strict-origin-when-cross-origin')
  h.set('x-robots-tag', 'noindex, nofollow')
  h.set('cache-control', 'no-store')
  return h
}

function html(status, corpo, cookies = []) {
  const h = cabecas({ 'content-type': 'text/html; charset=utf-8' })
  for (const c of cookies) h.append('set-cookie', c)
  return new Response(corpo, { status, headers: h })
}

function json(status, obj, cookies = []) {
  const h = cabecas({ 'content-type': 'application/json; charset=utf-8' })
  for (const c of cookies) h.append('set-cookie', c)
  return new Response(JSON.stringify(obj), { status, headers: h })
}

function ir(destino, cookies) {
  const h = cabecas({ location: destino })
  for (const c of cookies) h.append('set-cookie', c)
  return new Response(null, { status: 303, headers: h })
}

function texto(status, corpo) {
  return new Response(corpo, { status, headers: cabecas({ 'content-type': 'text/plain; charset=utf-8' }) })
}

async function sha256(valor, segredo) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${segredo}\0${valor}`))
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function aleatorio() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

async function senhaOk(dono, email, senha) {
  const hash = dono ? dono.senha_hash : await hashFalso()
  const ok = await senhaConfereHash(String(senha ?? ''), hash)
  if (!dono || !ok) return false
  const a = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(dono.email))
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email))
  const ua = new Uint8Array(a)
  const ub = new Uint8Array(b)
  let diff = 0
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i]
  return diff === 0
}

async function criarSessao(db, segredo) {
  const token = aleatorio()
  const csrf = aleatorio()
  const agora = Date.now()
  await db.run(`DELETE FROM sessao WHERE tipo = 'plena'`)
  await db.run('INSERT INTO sessao (token_hash, tipo, csrf, expira, criada) VALUES (?, ?, ?, ?, ?)', await sha256(token, segredo), 'plena', csrf, agora + SESSAO_MS, agora)
  return { token, csrf }
}

async function lerSessao(db, token, segredo) {
  if (!token || !segredo) return null
  const row = await db.get('SELECT * FROM sessao WHERE token_hash = ? AND tipo = ?', await sha256(token, segredo), 'plena')
  if (!row || row.expira < Date.now()) return null
  return row
}

async function auditar(db, acao, ip, detalhe) {
  await db.run('INSERT INTO auditoria (quando, acao, ip, detalhe) VALUES (?, ?, ?, ?)', Date.now(), acao, String(ip || ''), String(detalhe || '').slice(0, 300))
}

async function bloqueado(db, chave) {
  const row = await db.get('SELECT bloqueado_ate FROM limite WHERE chave = ?', chave)
  return !!(row && row.bloqueado_ate > Date.now())
}

async function falha(db, chave) {
  const agora = Date.now()
  const janela = 15 * 60 * 1000
  const row = await db.get('SELECT * FROM limite WHERE chave = ?', chave)
  if (!row || agora - row.janela > janela) {
    await db.run(`INSERT INTO limite (chave, falhas, janela, bloqueado_ate) VALUES (?, 1, ?, 0)
      ON CONFLICT(chave) DO UPDATE SET falhas = 1, janela = excluded.janela, bloqueado_ate = 0`, chave, agora)
    return false
  }
  const n = row.falhas + 1
  const ate = n >= 5 ? agora + janela : 0
  await db.run('UPDATE limite SET falhas = ?, bloqueado_ate = ? WHERE chave = ?', n, ate, chave)
  return ate > agora
}

async function zerar(db, chave) {
  await db.run('DELETE FROM limite WHERE chave = ?', chave)
}

async function temDono(db) {
  return !!(await db.get('SELECT id FROM dono WHERE id = 1'))
}

async function lerDono(db) {
  return db.get('SELECT id, email, senha_hash FROM dono WHERE id = 1')
}

async function criarDono(db, email, senhaHash) {
  const r = await db.run(`INSERT INTO dono (id, email, senha_hash, criado)
    SELECT 1, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM dono WHERE id = 1)`, email, senhaHash, Date.now())
  return r.changes === 1
}

async function semear(env) {
  const dbx = banco(env)
  const ja = await dbx.get(`SELECT valor FROM meta WHERE chave = 'semeada'`)
  // imagens e textos novos da semente entram mesmo depois do primeiro seed
  const itens = []
  for (const im of semente.imagens || []) {
    itens.push(['INSERT OR IGNORE INTO imagem (chave, src, webp, alt_chave, largura, altura) VALUES (?, ?, ?, ?, ?, ?)', [im.chave, im.src, im.webp || '', im.altChave || '', im.largura || 0, im.altura || 0]])
  }
  for (const [chave, porIdioma] of Object.entries(semente.textos || {})) {
    for (const [idioma, valor] of Object.entries(porIdioma)) {
      itens.push(['INSERT OR IGNORE INTO texto (chave, idioma, valor, pendente) VALUES (?, ?, ?, 0)', [chave, idioma, String(valor)]])
    }
  }
  if (ja) {
    if (itens.length) await dbx.batch(itens)
    return
  }
  const idiomas = semente.idiomas.join(',')
  itens.push([`INSERT INTO meta (chave, valor) VALUES ('idiomas', ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, [idiomas]])
  for (const g of semente.galerias || []) {
    itens.push(['INSERT OR IGNORE INTO galeria (chave, abrir_chave) VALUES (?, ?)', [g.chave, g.abrir || '']])
    g.itens.forEach((it, i) => {
      itens.push([`INSERT OR IGNORE INTO galeria_item (id, galeria, ordem, tipo, src, webp, poster, legenda_chave, largura, altura) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [it.id, g.chave, i + 1, it.tipo, it.src, it.webp || '', it.poster || '', it.legenda, it.largura || 0, it.altura || 0]])
    })
  }
  itens.push([`INSERT INTO meta (chave, valor) VALUES ('semeada', '1') ON CONFLICT(chave) DO NOTHING`, []])
  await dbx.batch(itens)
}

async function listaVoluntarios(dbx) {
  const row = await dbx.get(`SELECT valor FROM meta WHERE chave = 'voluntarios'`)
  if (row?.valor) {
    try {
      const lista = JSON.parse(row.valor)
      if (Array.isArray(lista) && lista.length) return lista.filter((id) => /^[a-z][a-z0-9-]{0,40}$/.test(id))
    } catch { /* lista antiga inválida */ }
  }
  const imgs = await dbx.all(`SELECT chave FROM imagem WHERE chave LIKE 'img.volunteer.%' AND chave != 'img.volunteer.cabeca'`)
  const ids = imgs.map((r) => String(r.chave).replace(/^img\.volunteer\./, '')).filter((id) => /^[a-z][a-z0-9-]{0,40}$/.test(id))
  const ordem = ['matias', 'patrick', 'pamella']
  ids.sort((a, b) => {
    const ia = ordem.indexOf(a)
    const ib = ordem.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
  if (ids.length) {
    await dbx.run(`INSERT INTO meta (chave, valor) VALUES ('voluntarios', ?)
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, JSON.stringify(ids))
  }
  return ids
}

async function listaAfiliados(dbx) {
  const row = await dbx.get(`SELECT valor FROM meta WHERE chave = 'afiliados'`)
  if (!row?.valor) return []
  try {
    const lista = JSON.parse(row.valor)
    if (!Array.isArray(lista)) return []
    return lista.filter((item) => item && typeof item.src === 'string' && typeof item.url === 'string').slice(0, 24)
  } catch {
    return []
  }
}

async function estado(dbx, idioma) {
  const textos = {}
  for (const row of await dbx.all('SELECT chave, valor FROM texto WHERE idioma = ?', idioma)) textos[row.chave] = row.valor
  const imagens = {}
  for (const row of await dbx.all('SELECT * FROM imagem')) imagens[row.chave] = row
  const galerias = []
  for (const g of await dbx.all('SELECT * FROM galeria')) {
    galerias.push({ ...g, itens: await dbx.all('SELECT * FROM galeria_item WHERE galeria = ? ORDER BY ordem, id', g.chave) })
  }
  return { textos, imagens, galerias, voluntarios: await listaVoluntarios(dbx), afiliados: await listaAfiliados(dbx) }
}

function idiomaDaUrl(pathname) {
  const m = pathname.match(/^\/(es)(\/|$)/)
  return m ? m[1] : 'en'
}

async function fotografar(dbx) {
  return {
    textos: await dbx.all('SELECT chave, idioma, valor, pendente FROM texto'),
    imagens: await dbx.all('SELECT chave, src, webp, alt_chave, largura, altura FROM imagem'),
    galerias: await dbx.all('SELECT chave, abrir_chave FROM galeria'),
    itens: await dbx.all('SELECT id, galeria, ordem, tipo, src, webp, poster, legenda_chave, largura, altura FROM galeria_item'),
    meta: await dbx.all(`SELECT chave, valor FROM meta WHERE chave IN ('voluntarios', 'afiliados', 'bytes_midia')`),
  }
}

async function antes(dbx, acao) {
  const snap = JSON.stringify(await fotografar(dbx))
  await dbx.run('INSERT INTO versao (quando, acao, snapshot) VALUES (?, ?, ?)', Date.now(), acao, snap)
  await dbx.run('DELETE FROM versao WHERE id NOT IN (SELECT id FROM versao ORDER BY id DESC LIMIT 30)')
}

async function restaurar(dbx, snap) {
  const itens = [
    ['DELETE FROM texto', []],
    ['DELETE FROM imagem', []],
    ['DELETE FROM galeria_item', []],
    ['DELETE FROM galeria', []],
  ]
  for (const t of snap.textos) itens.push(['INSERT INTO texto (chave, idioma, valor, pendente) VALUES (?, ?, ?, ?)', [t.chave, t.idioma, t.valor, t.pendente || 0]])
  for (const im of snap.imagens) itens.push(['INSERT INTO imagem (chave, src, webp, alt_chave, largura, altura) VALUES (?, ?, ?, ?, ?, ?)', [im.chave, im.src, im.webp || '', im.alt_chave || '', im.largura || 0, im.altura || 0]])
  for (const g of snap.galerias) itens.push(['INSERT INTO galeria (chave, abrir_chave) VALUES (?, ?)', [g.chave, g.abrir_chave || '']])
  for (const it of snap.itens) itens.push([`INSERT INTO galeria_item (id, galeria, ordem, tipo, src, webp, poster, legenda_chave, largura, altura) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [it.id, it.galeria, it.ordem, it.tipo, it.src, it.webp || '', it.poster || '', it.legenda_chave, it.largura || 0, it.altura || 0]])
  for (const m of snap.meta || []) {
    itens.push([`INSERT INTO meta (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, [m.chave, m.valor]])
  }
  await dbx.batch(itens)
}

// bytesUsados — conta pelo meta; evita listar o R2 inteiro a cada upload
async function bytesUsados(dbx) {
  const row = await dbx.get(`SELECT valor FROM meta WHERE chave = 'bytes_midia'`)
  const n = Number(row?.valor || 0)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

async function somarBytes(dbx, delta) {
  const atual = await bytesUsados(dbx)
  const proximo = Math.max(0, atual + delta)
  await dbx.run(`INSERT INTO meta (chave, valor) VALUES ('bytes_midia', ?)
    ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, String(proximo))
}

async function guardarMidia(env, dbx, ext, buffer, tipo) {
  if (!env.MIDIA) return { erro: 'guardar' }
  if ((await bytesUsados(dbx)) + buffer.length > TETO_BYTES) return { erro: 'cheio' }
  const nome = nomeAleatorio(ext)
  try {
    await env.MIDIA.put(nome, buffer, { httpMetadata: { contentType: tipo } })
  } catch {
    return { erro: 'guardar' }
  }
  await somarBytes(dbx, buffer.length)
  return { src: `/midia/${nome}` }
}

async function apagarMidia(dbx, env, src) {
  if (!src || !src.startsWith('/midia/')) return
  const nome = src.slice('/midia/'.length)
  if (!/^[\da-f]{32}\.[a-z0-9]+$/.test(nome)) return
  const usoA = await dbx.get('SELECT COUNT(*) AS n FROM galeria_item WHERE src = ? OR webp = ? OR poster = ?', src, src, src)
  const usoB = await dbx.get('SELECT COUNT(*) AS n FROM imagem WHERE src = ? OR webp = ?', src, src)
  if ((usoA?.n || 0) + (usoB?.n || 0) > 0) return
  let tamanho = 0
  if (env.MIDIA) {
    const obj = await env.MIDIA.head(nome)
    tamanho = obj?.size || 0
    await env.MIDIA.delete(nome)
  }
  if (tamanho) await somarBytes(dbx, -tamanho)
  await dbx.run('DELETE FROM midia WHERE nome = ?', nome)
}

async function gravarTextos(dbx, chave, pares) {
  await dbx.batch(pares.map((p) => [`INSERT INTO texto (chave, idioma, valor, pendente) VALUES (?, ?, ?, ?)
    ON CONFLICT(chave, idioma) DO UPDATE SET valor = excluded.valor, pendente = excluded.pendente`, [chave, p.idioma, p.valor, p.pendente ? 1 : 0]]))
}

async function idiomas(dbx) {
  const row = await dbx.get(`SELECT valor FROM meta WHERE chave = 'idiomas'`)
  return row ? row.valor.split(',').filter(Boolean) : ['en', 'es']
}

// repetirPendentes — nova tentativa só no login, ao abrir o editor ou ao salvar; lote curto para não estourar CPU
const LOTE_PENDENTE = 6

async function repetirPendentes(dbx, env) {
  const fila = await dbx.all('SELECT chave, idioma FROM texto WHERE pendente = 1 LIMIT ?', LOTE_PENDENTE)
  let feitos = 0
  for (const row of fila) {
    const todos = await dbx.all('SELECT idioma, valor, pendente FROM texto WHERE chave = ?', row.chave)
    const fonte = todos.find((item) => !item.pendente && item.valor)
    if (!fonte) continue
    const mapa = await traduzirTodos(fonte.valor, fonte.idioma, [row.idioma], env)
    const info = mapa[row.idioma]
    if (!info || info.pendente) continue
    await gravarTextos(dbx, row.chave, [{ idioma: row.idioma, valor: info.valor, pendente: 0 }])
    feitos += 1
  }
  return feitos
}

async function chaveExiste(dbx, chave) {
  return !!(await dbx.get('SELECT 1 AS n FROM texto WHERE chave = ? LIMIT 1', chave))
}

async function paresTraducao(env, valor, idiomaPagina) {
  const lista = await idiomas(banco(env))
  const fonte = detectarIdioma(valor, idiomaPagina || 'en')
  const mapa = await traduzirTodos(valor, lista.includes(fonte) ? fonte : (idiomaPagina || 'en'), lista, env)
  return Object.entries(mapa).map(([idioma, info]) => ({ idioma, valor: info.valor, pendente: info.pendente }))
}

async function exigir(dbx, request, env) {
  const cookies = cookiesDe(request)
  const sessao = await lerSessao(dbx, cookies.painel_sessao, env.SESSION_SECRET)
  if (!sessao) return { erro: json(401, { erro: 'sessao', mensagem: MSG.sessao }) }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const header = request.headers.get('x-csrf') || ''
    if (!segredoIgual(header, sessao.csrf) || !segredoIgual(cookies.painel_csrf || '', sessao.csrf)) {
      return { erro: json(403, { erro: 'csrf', mensagem: MSG.csrf }) }
    }
  }
  return { sessao, cookies }
}

async function corpoBytes(request, max) {
  const buf = Buffer.from(await request.arrayBuffer())
  if (buf.length > max) {
    const erro = new Error('grande')
    erro.codigo = 'grande'
    throw erro
  }
  return buf
}

export async function atender(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const caminho = url.pathname
  try {
    // mídia do painel — só R2, sem reescrever o site
    if (caminho.startsWith('/midia/')) return await servirMidia(env, caminho)

    // painel e arquivos internos — aí sim usa D1 e CPU
    if (caminho.startsWith('/interno/') || caminho.startsWith('/panel')) {
      if (!env.DB || !env.SESSION_SECRET || !env.SETUP_TOKEN) return texto(500, 'The panel is not configured')
      const dbx = banco(env)
      await semear(env)
      return await painel(context, dbx, url)
    }

    // site público — HTML estático já bakeado; não reescreve (evita Error 1102 de CPU)
    return context.next()
  } catch (erro) {
    if (erro.codigo === 'grande') return json(413, { erro: 'grande', mensagem: MSG.grande })
    return json(500, { erro: 'guardar', mensagem: MSG.guardar })
  }
}

async function servirMidia(env, caminho) {
  const nome = caminho.slice('/midia/'.length)
  if (!/^[\da-f]{32}\.[a-z0-9]+$/.test(nome) || !env.MIDIA) return texto(404, 'Not found')
  const obj = await env.MIDIA.get(nome)
  if (!obj) return texto(404, 'Not found')
  const tipo = obj.httpMetadata?.contentType || 'application/octet-stream'
  const headers = cabecas({ 'content-type': tipo, 'cache-control': 'public, max-age=86400' })
  if (nome.endsWith('.svg')) headers.set('content-security-policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox")
  return new Response(obj.body, { status: 200, headers })
}

async function painel(context, dbx, url) {
  const { request, env } = context
  const caminho = url.pathname
  const metodo = request.method
  const ip = request.headers.get('cf-connecting-ip') || ''
  const cookies = cookiesDe(request)
  if (caminho === '/panel/acesso.css' || caminho === '/interno/acesso.css') {
    const asset = await context.env.ASSETS.fetch(new Request(new URL('/interno/acesso.css', request.url)))
    return asset
  }
  if (caminho === '/panel/editor.js' || caminho === '/panel/editor.css' || caminho === '/panel/ver.js') {
    const sessao = await lerSessao(dbx, cookies.painel_sessao, env.SESSION_SECRET)
    if (!sessao) return texto(404, 'Not found')
    const nome = caminho.endsWith('.css') ? 'editor.css' : caminho.endsWith('ver.js') ? 'ver.js' : 'editor.js'
    if (nome === 'editor.js') {
      try { await repetirPendentes(dbx, env) } catch { /* a fila fica para a próxima entrada */ }
    }
    const asset = await env.ASSETS.fetch(new Request(new URL(`/interno/${nome}`, request.url)))
    const headers = new Headers(asset.headers)
    headers.set('cache-control', 'no-store')
    return new Response(asset.body, { status: asset.status, headers })
  }
  if (caminho === '/panel/login') return login(request, dbx, env, ip, cookies)
  if (caminho === '/panel/logout' && metodo === 'POST') return sair(request, dbx, env, ip, cookies)
  if (caminho.startsWith('/panel/setup/')) return registro(request, dbx, env, ip, caminho)
  if (caminho.startsWith('/panel/api/')) return api(request, dbx, env, url, ip)
  return texto(404, 'Not found')
}

async function login(request, dbx, env, ip, cookies) {
  if (request.method === 'GET') {
    const csrf = aleatorio()
    return html(200, paginas.paginaLogin(csrf, ''), [cookie('painel_csrf', csrf, 1800)])
  }
  const form = Object.fromEntries(new URLSearchParams(await request.text()))
  if (!segredoIgual(form.csrf || '', cookies.painel_csrf || '')) {
    const csrf = aleatorio()
    return html(403, paginas.paginaLogin(csrf, ''), [cookie('painel_csrf', csrf, 1800)])
  }
  const email = emailValido(form.email)
  const trava = await bloqueado(dbx, `ip:${ip}`) || (email && await bloqueado(dbx, `email:${email}`))
  const dono = await lerDono(dbx)
  const ok = !trava && !!email && await senhaOk(dono, email, form.senha)
  if (ok) {
    await zerar(dbx, `ip:${ip}`)
    await zerar(dbx, `email:${email}`)
    const sessao = await criarSessao(dbx, env.SESSION_SECRET)
    await auditar(dbx, 'login', ip, 'sesión abierta')
    try { await repetirPendentes(dbx, env) } catch { /* a fila fica para a próxima entrada */ }
    return ir('/', [
      cookie('painel_sessao', sessao.token, SESSAO_MS / 1000),
      cookie('painel_csrf', sessao.csrf, SESSAO_MS / 1000),
    ])
  }
  if (email) await falha(dbx, `email:${email}`)
  await falha(dbx, `ip:${ip}`)
  await auditar(dbx, 'login-falha', ip, 'credencial rechazada')
  const csrf = aleatorio()
  return html(401, paginas.paginaLogin(csrf, trava ? MSG.bloqueio : MSG.credencial), [cookie('painel_csrf', csrf, 1800)])
}

async function sair(request, dbx, env, ip, cookies) {
  const sessao = await lerSessao(dbx, cookies.painel_sessao, env.SESSION_SECRET)
  if (!sessao || !segredoIgual(request.headers.get('x-csrf') || '', sessao.csrf)) return json(401, { erro: 'sessao', mensagem: MSG.sessao })
  await dbx.run('DELETE FROM sessao WHERE token_hash = ?', await sha256(cookies.painel_sessao, env.SESSION_SECRET))
  await auditar(dbx, 'logout', ip, 'sesión cerrada')
  return ir('/panel/login', [cookie('painel_sessao', '', 0), cookie('painel_csrf', '', 0)])
}

async function registro(request, dbx, env, ip, caminho) {
  const token = decodeURIComponent(caminho.slice('/panel/setup/'.length).replace(/\/$/, ''))
  if (!segredoIgual(token, env.SETUP_TOKEN) || await temDono(dbx)) return texto(404, 'Not found')
  if (request.method === 'GET') {
    const csrf = aleatorio()
    return html(200, paginas.paginaRegistro(csrf, ''), [cookie('painel_csrf', csrf, 1800)])
  }
  const form = Object.fromEntries(new URLSearchParams(await request.text()))
  const cookies = cookiesDe(request)
  if (!segredoIgual(form.csrf || '', cookies.painel_csrf || '')) return texto(403, 'Not allowed')
  const email = emailValido(form.email)
  if (!email) return html(400, paginas.paginaRegistro(form.csrf, MSG.correo))
  if (String(form.senha || '').length < 12) return html(400, paginas.paginaRegistro(form.csrf, MSG.curto))
  if (form.senha !== form.senha2) return html(400, paginas.paginaRegistro(form.csrf, MSG.distinta))
  const criou = await criarDono(dbx, email, await hashSenhaNuvem(form.senha))
  if (!criou) return texto(404, 'Not found')
  await auditar(dbx, 'registro', ip, 'dueño creado')
  return ir('/panel/login', [cookie('painel_csrf', '', 0)])
}

async function api(request, dbx, env, url, ip) {
  const porta = await exigir(dbx, request, env)
  if (porta.erro) return porta.erro
  const rota = url.pathname
  // o Publish tem orquestração própria em chamadas curtas; não retraduz pendentes aqui
  if (rota.startsWith('/panel/api/publicar/')) return publicar(request, dbx, env, rota, ip, { lerEstado: estado, auditar })
  if (request.method === 'POST') {
    try { await repetirPendentes(dbx, env) } catch { /* o salvamento segue mesmo se a fila falhar */ }
  }
  if (rota === '/panel/api/texto' && request.method === 'GET') {
    const chave = url.searchParams.get('chave') || ''
    if (!chaveValida(chave) || !await chaveExiste(dbx, chave)) return json(404, { erro: 'guardar', mensagem: MSG.guardar })
    const mapa = {}
    for (const row of await dbx.all('SELECT idioma, valor, pendente FROM texto WHERE chave = ?', chave)) mapa[row.idioma] = { valor: row.valor, pendente: row.pendente }
    return json(200, { chave, idiomas: mapa })
  }
  if (rota === '/panel/api/texto' && request.method === 'POST') {
    const corpo = await request.json()
    const plano = textoRico(corpo.valor)
    if (!chaveValida(corpo.chave) || !await chaveExiste(dbx, corpo.chave) || plano.erro) return json(400, { erro: 'guardar', mensagem: MSG.guardar })
    const limpo = aplicarPadraoTexto(corpo.chave, plano.valor)
    await antes(dbx, `texto:${corpo.chave}`)
    const visivel = textoVisivel(limpo)
    const pares = manterFormato(await paresTraducao(env, visivel, corpo.idiomaPagina), visivel, limpo, corpo.idiomaPagina)
      .map((p) => ({ ...p, valor: aplicarPadraoTexto(corpo.chave, p.valor) }))
    await gravarTextos(dbx, corpo.chave, pares)
    const tituloChave = chaveTituloDaNav(corpo.chave)
    if (tituloChave && await chaveExiste(dbx, tituloChave)) {
      await gravarTextos(dbx, tituloChave, pares.map((p) => ({
        idioma: p.idioma,
        valor: tituloAPartirDaNav(textoVisivel(p.valor), SITE_NAME),
        pendente: p.pendente,
      })))
    }
    await auditar(dbx, 'texto', ip, corpo.chave)
    const pendente = pares.some((p) => p.pendente)
    return json(200, { ok: true, pendente, mensagem: pendente ? 'Saved. The translation is still pending.' : 'Saved.' })
  }
  if (rota === '/panel/api/correcao' && request.method === 'POST') {
    const corpo = await request.json()
    const plano = textoPlano(corpo.valor)
    const lista = await idiomas(dbx)
    if (!chaveValida(corpo.chave) || !lista.includes(corpo.idioma) || !await chaveExiste(dbx, corpo.chave) || plano.erro) return json(400, { erro: 'guardar', mensagem: MSG.guardar })
    await antes(dbx, `correcao:${corpo.chave}`)
    await gravarTextos(dbx, corpo.chave, [{ idioma: corpo.idioma, valor: plano.valor, pendente: 0 }])
    await auditar(dbx, 'correcao', ip, `${corpo.chave}:${corpo.idioma}`)
    return json(200, { ok: true, mensagem: 'Translation saved.' })
  }
  if (rota === '/panel/api/imagem' && request.method === 'POST') {
    const chave = request.headers.get('x-chave') || ''
    const imagem = chaveValida(chave) ? await dbx.get('SELECT * FROM imagem WHERE chave = ?', chave) : null
    if (!imagem) return json(404, { erro: 'guardar', mensagem: MSG.guardar })
    const buffer = await corpoBytes(request, LIMITE_IMAGEM)
    const pronto = await processarImagemNuvem(buffer, LIMITE_IMAGEM)
    if (pronto.erro) return json(400, { erro: pronto.erro, mensagem: pronto.erro === 'grande' ? MSG.grande : MSG.formato })
    const guardado = await guardarMidia(env, dbx, pronto.ext, pronto.buffer, pronto.tipo)
    if (guardado.erro) return json(400, { erro: guardado.erro, mensagem: guardado.erro === 'cheio' ? MSG.cheio : MSG.guardar })
    const src = guardado.src
    await antes(dbx, `imagem:${chave}`)
    const anterior = imagem.src
    await dbx.run('UPDATE imagem SET src = ?, webp = ?, largura = ?, altura = ? WHERE chave = ?', src, '', pronto.largura || 0, pronto.altura || 0, chave)
    await apagarMidia(dbx, env, anterior)
    const alt = request.headers.get('x-alt') ? decodeURIComponent(request.headers.get('x-alt')) : ''
    if (alt && imagem.alt_chave && await chaveExiste(dbx, imagem.alt_chave)) {
      const plano = textoPlano(alt)
      if (!plano.erro) await gravarTextos(dbx, imagem.alt_chave, await paresTraducao(env, plano.valor, request.headers.get('x-idioma') || 'en'))
    }
    await auditar(dbx, 'imagem', ip, chave)
    return json(200, { ok: true, mensagem: 'Imagen guardada.' })
  }
  if (rota === '/panel/api/afiliado' && request.method === 'POST') {
    const url = decodeURIComponent(request.headers.get('x-url') || '').trim()
    if (!/^https:\/\/[^\s<>"']+$/i.test(url) || url.length > 300) return json(400, { erro: 'guardar', mensagem: 'Use a full https link.' })
    const buffer = await corpoBytes(request, LIMITE_IMAGEM)
    const pronto = await processarImagemNuvem(buffer, LIMITE_IMAGEM)
    if (pronto.erro) return json(400, { erro: pronto.erro, mensagem: pronto.erro === 'grande' ? MSG.grande : MSG.formato })
    const guardado = await guardarMidia(env, dbx, pronto.ext, pronto.buffer, pronto.tipo)
    if (guardado.erro) return json(400, { erro: guardado.erro, mensagem: guardado.erro === 'cheio' ? MSG.cheio : MSG.guardar })
    const lista = await listaAfiliados(dbx)
    if (lista.length >= 24) return json(400, { erro: 'cheio', mensagem: MSG.cheio })
    await antes(dbx, 'afiliados')
    lista.push({ id: `a${aleatorio().slice(0, 8).toLowerCase().replace(/[^a-z0-9]/g, 'x')}`, src: guardado.src, url })
    await dbx.run(`INSERT INTO meta (chave, valor) VALUES ('afiliados', ?)
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, JSON.stringify(lista))
    await auditar(dbx, 'afiliado', ip, guardado.src)
    return json(200, { ok: true, mensagem: 'Partner added.' })
  }
  if (rota === '/panel/api/voluntario' && request.method === 'POST') {
    const nomePlano = textoPlano(decodeURIComponent(request.headers.get('x-nome') || ''), 120)
    const bio = textoRico(decodeURIComponent(request.headers.get('x-bio') || ''))
    const idiomaPagina = request.headers.get('x-idioma') || 'en'
    if (nomePlano.erro || !nomePlano.valor.trim() || bio.erro) return json(400, { erro: 'guardar', mensagem: MSG.guardar })
    const buffer = await corpoBytes(request, LIMITE_IMAGEM)
    const pronto = await processarImagemNuvem(buffer, LIMITE_IMAGEM)
    if (pronto.erro) return json(400, { erro: pronto.erro, mensagem: pronto.erro === 'grande' ? MSG.grande : MSG.formato })
    const guardado = await guardarMidia(env, dbx, pronto.ext, pronto.buffer, pronto.tipo)
    if (guardado.erro) return json(400, { erro: guardado.erro, mensagem: guardado.erro === 'cheio' ? MSG.cheio : MSG.guardar })
    const id = `v${aleatorio().slice(0, 10).toLowerCase().replace(/[^a-z0-9]/g, 'x')}`
    const chaveImg = `img.volunteer.${id}`
    const base = `t.volunteer.media.${id}`
    await antes(dbx, `voluntario:${id}`)
    const lista = await listaVoluntarios(dbx)
    lista.push(id)
    await dbx.run(`INSERT INTO meta (chave, valor) VALUES ('voluntarios', ?)
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, JSON.stringify(lista))
    await dbx.run('INSERT INTO imagem (chave, src, webp, alt_chave, largura, altura) VALUES (?, ?, ?, ?, ?, ?)',
      chaveImg, guardado.src, '', `${base}.alt`, pronto.largura || 0, pronto.altura || 0)
    const alt = `${nomePlano.valor.trim()} smiles in a volunteer photo.`
    await gravarTextos(dbx, `${base}.name`, await paresTraducao(env, nomePlano.valor.trim(), idiomaPagina))
    await gravarTextos(dbx, `${base}.alt`, await paresTraducao(env, alt, idiomaPagina))
    const visivel = textoVisivel(bio.valor)
    await gravarTextos(dbx, `${base}.who`, manterFormato(await paresTraducao(env, visivel, idiomaPagina), visivel, bio.valor, idiomaPagina))
    const vazio = (await idiomas(dbx)).map((idioma) => ({ idioma, valor: '', pendente: 0 }))
    await gravarTextos(dbx, `${base}.work`, vazio)
    await gravarTextos(dbx, `${base}.why`, vazio)
    await auditar(dbx, 'voluntario', ip, id)
    return json(200, { ok: true, id, mensagem: 'Volunteer added.' })
  }
  if (rota === '/panel/api/galeria/excluir' && request.method === 'POST') {
    const corpo = await request.json()
    if (!chaveValida(corpo.galeria) || !chaveValida(corpo.id)) return json(400, { erro: 'guardar', mensagem: MSG.guardar })
    const item = await dbx.get('SELECT * FROM galeria_item WHERE id = ? AND galeria = ?', corpo.id, corpo.galeria)
    if (!item) return json(404, { erro: 'guardar', mensagem: MSG.guardar })
    await antes(dbx, `excluir:${corpo.id}`)
    await dbx.run('DELETE FROM galeria_item WHERE id = ?', corpo.id)
    const restantes = await dbx.all('SELECT id FROM galeria_item WHERE galeria = ? ORDER BY ordem, id', corpo.galeria)
    await dbx.batch(restantes.map((row, i) => ['UPDATE galeria_item SET ordem = ? WHERE id = ?', [i + 1, row.id]]))
    for (const src of [item.src, item.webp, item.poster]) await apagarMidia(dbx, env, src)
    await auditar(dbx, 'galeria-excluir', ip, corpo.id)
    return json(200, { ok: true, mensagem: 'Item removed. You can undo.' })
  }
  if (rota === '/panel/api/galeria/arquivo' && request.method === 'POST') {
    const galeria = request.headers.get('x-galeria') || ''
    const depois = request.headers.get('x-depois') || ''
    if (!chaveValida(galeria) || !await dbx.get('SELECT 1 AS n FROM galeria WHERE chave = ?', galeria)) return json(400, { erro: 'guardar', mensagem: MSG.guardar })
    const buffer = await corpoBytes(request, LIMITE_IMAGEM)
    const pronto = await processarImagemNuvem(buffer, LIMITE_IMAGEM)
    if (pronto.erro) return json(400, { erro: pronto.erro, mensagem: pronto.erro === 'grande' ? MSG.grande : MSG.formato })
    const guardado = await guardarMidia(env, dbx, pronto.ext, pronto.buffer, pronto.tipo)
    if (guardado.erro) return json(400, { erro: guardado.erro, mensagem: guardado.erro === 'cheio' ? MSG.cheio : MSG.guardar })
    const src = guardado.src
    const id = `novo-${aleatorio().slice(0, 12)}`
    const legenda = `galeria.${galeria}.${id}`.replace(/[^a-zA-Z0-9._-]/g, '')
    await antes(dbx, `galeria:${galeria}`)
    await gravarTextos(dbx, legenda, (await idiomas(dbx)).map((idioma) => ({ idioma, valor: '', pendente: 0 })))
    await inserirDepois(dbx, { id, galeria, tipo: 'imagem', src, legenda, largura: pronto.largura || 0, altura: pronto.altura || 0 }, depois)
    await auditar(dbx, 'galeria-novo', ip, id)
    return json(200, { ok: true, mensagem: 'Photo added.' })
  }
  if (rota === '/panel/api/upload/iniciar' && request.method === 'POST') {
    const corpo = await request.json()
    const tamanho = Number(corpo.tamanho)
    if (!chaveValida(corpo.galeria) || !await dbx.get('SELECT 1 AS n FROM galeria WHERE chave = ?', corpo.galeria)) return json(400, { erro: 'guardar', mensagem: MSG.guardar })
    if (!Number.isFinite(tamanho) || tamanho <= 0 || tamanho > LIMITE_VIDEO) return json(400, { erro: 'grande', mensagem: MSG.video })
    if ((await bytesUsados(dbx)) + tamanho > TETO_BYTES) return json(400, { erro: 'cheio', mensagem: MSG.cheio })
    const id = nomeAleatorio('').slice(0, 32)
    return json(200, { id, partes: Math.ceil(tamanho / PEDACO), parte: PEDACO, galeria: corpo.galeria, depoisDe: corpo.depoisDe || '' })
  }
  if (rota === '/panel/api/upload/parte' && request.method === 'PUT') {
    const id = url.searchParams.get('id') || ''
    const indice = Number(url.searchParams.get('i'))
    if (!/^[\da-f]{32}$/.test(id) || !Number.isInteger(indice)) return json(400, { erro: 'guardar', mensagem: MSG.guardar })
    const buffer = await corpoBytes(request, PEDACO + 1024)
    await env.MIDIA.put(`partes/${id}/${indice}`, buffer)
    return json(200, { ok: true })
  }
  if (rota === '/panel/api/upload/concluir' && request.method === 'POST') {
    const corpo = await request.json()
    const id = corpo.id || ''
    if (!/^[\da-f]{32}$/.test(id)) return json(400, { erro: 'guardar', mensagem: MSG.video })
    const pedacos = []
    for (let i = 0; i < 80; i++) {
      const parte = await env.MIDIA.get(`partes/${id}/${i}`)
      if (!parte) break
      pedacos.push(Buffer.from(await parte.arrayBuffer()))
    }
    if (!pedacos.length) return json(400, { erro: 'formato', mensagem: MSG.video })
    const buffer = Buffer.concat(pedacos)
    const video = validarVideoNuvem(buffer, LIMITE_VIDEO)
    if (video.erro) return json(400, { erro: video.erro, mensagem: MSG.video })
    const guardado = await guardarMidia(env, dbx, video.ext, buffer, video.tipo)
    if (guardado.erro) return json(400, { erro: guardado.erro, mensagem: guardado.erro === 'cheio' ? MSG.cheio : MSG.video })
    const src = guardado.src
    let poster = ''
    if (corpo.poster) {
      const cru = Buffer.from(String(corpo.poster).replace(/^data:image\/\w+;base64,/, ''), 'base64')
      const img = await processarImagemNuvem(cru, LIMITE_IMAGEM)
      if (!img.erro) {
        const mini = await guardarMidia(env, dbx, img.ext, img.buffer, img.tipo)
        if (mini.src) poster = mini.src
      }
    }
    const galeria = corpo.galeria
    const depois = corpo.depoisDe || ''
    if (!chaveValida(galeria)) return json(400, { erro: 'guardar', mensagem: MSG.guardar })
    const itemId = `novo-${aleatorio().slice(0, 12)}`
    const legenda = `galeria.${galeria}.${itemId}`.replace(/[^a-zA-Z0-9._-]/g, '')
    await antes(dbx, `video:${galeria}`)
    await gravarTextos(dbx, legenda, (await idiomas(dbx)).map((idioma) => ({ idioma, valor: '', pendente: 0 })))
    await inserirDepois(dbx, { id: itemId, galeria, tipo: 'video', src, poster, legenda, largura: 0, altura: 0 }, depois)
    for (let i = 0; i < pedacos.length; i++) await env.MIDIA.delete(`partes/${id}/${i}`)
    await auditar(dbx, 'galeria-video', ip, itemId)
    return json(200, { ok: true, mensagem: 'Video added.' })
  }
  if (rota === '/panel/api/desfazer' && request.method === 'POST') {
    const row = await dbx.get('SELECT id, snapshot FROM versao ORDER BY id DESC LIMIT 1')
    if (!row) return json(400, { ok: false, mensagem: 'There is nothing to undo.' })
    await restaurar(dbx, JSON.parse(row.snapshot))
    await dbx.run('DELETE FROM versao WHERE id = ?', row.id)
    await auditar(dbx, 'desfazer', ip, 'restaurado')
    return json(200, { ok: true, mensagem: 'Change undone.' })
  }
  if (rota === '/panel/api/historico' && request.method === 'GET') {
    const lista = (await dbx.all('SELECT id, quando, acao FROM versao ORDER BY id DESC LIMIT 30')).map((v) => ({ id: v.id, quando: new Date(v.quando).toISOString(), acao: v.acao }))
    return json(200, { lista })
  }
  if (rota === '/panel/api/restaurar' && request.method === 'POST') {
    const corpo = await request.json()
    const row = await dbx.get('SELECT id, snapshot FROM versao WHERE id = ?', Number(corpo.id))
    if (!row) return json(404, { erro: 'guardar', mensagem: MSG.guardar })
    await antes(dbx, 'antes-de-restaurar')
    await restaurar(dbx, JSON.parse(row.snapshot))
    await auditar(dbx, 'restaurar', ip, String(corpo.id))
    return json(200, { ok: true, mensagem: 'Version restored.' })
  }
  return texto(404, 'Not found')
}

async function inserirDepois(dbx, item, depoisDe) {
  const atuais = (await dbx.all('SELECT id FROM galeria_item WHERE galeria = ? ORDER BY ordem, id', item.galeria)).map((r) => r.id)
  const idx = atuais.indexOf(depoisDe)
  atuais.splice(idx === -1 ? atuais.length : idx + 1, 0, item.id)
  await dbx.run(`INSERT INTO galeria_item (id, galeria, ordem, tipo, src, webp, poster, legenda_chave, largura, altura) VALUES (?, ?, 0, ?, ?, '', ?, ?, ?, ?)`, item.id, item.galeria, item.tipo, item.src, item.poster || '', item.legenda, item.largura || 0, item.altura || 0)
  await dbx.batch(atuais.map((id, i) => ['UPDATE galeria_item SET ordem = ? WHERE id = ?', [i + 1, id]]))
}
