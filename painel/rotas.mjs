// rotas — tudo o que muda o site passa por aqui e exige sessão, menos o acesso
import { mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import {
  emailValido, textoPlano, textoRico, textoVisivel, chaveValida, segredoIgual,
  aplicarPadraoTexto, chaveTituloDaNav, tituloAPartirDaNav,
} from './sanitizar.mjs'
import {
  temDono, lerDono, criarDono, chaveDeTexto, textosDaChave, gravarTextos, idiomas,
  listarPendentes, lerImagem, salvarImagem, criarImagem, galeriaExiste, inserirItemDepois, excluirItem,
  listaVoluntarios, gravarListaVoluntarios, listaAfiliados, gravarListaAfiliados, antesDeMudar, desfazer, listarVersoes, lerVersao, restaurar, auditar,
} from './banco.mjs'
import {
  hashSenha, senhaConfere, criarSessao, lerSessao, apagarSessao, emitirCodigo, consumirCodigo,
  codigoVigente, tokenUrl, estaBloqueado, registrarFalha, zerarFalhas,
} from './auth.mjs'
import { processarImagem, validarVideo, gravarMidia, apagarOrfao } from './midia.mjs'
import { detectarIdioma, traduzirTodos, manterFormato } from './traducao.mjs'
import { enviarAoDono } from './correio.mjs'
import * as paginas from './paginas.mjs'

const SITE_NAME = (() => {
  try {
    const bruto = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'site.json'), 'utf8')
    return JSON.parse(bruto).siteName || 'Inca Braille Trail'
  } catch {
    return 'Inca Braille Trail'
  }
})()

const SESSAO_MS = 4 * 60 * 60 * 1000
const LINK_MS = 20 * 60 * 1000
const PARTE = 512 * 1024

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
}

function esperar(inicio, ms = 650) {
  const falta = ms - (Date.now() - inicio)
  return falta > 0 ? new Promise((r) => setTimeout(r, falta)) : Promise.resolve()
}

function cookie(nome, valor, seguro, maxAge, httpOnly = true) {
  const partes = [`${nome}=${encodeURIComponent(valor)}`, 'Path=/', 'SameSite=Strict']
  if (httpOnly) partes.push('HttpOnly')
  if (maxAge != null) partes.push(`Max-Age=${maxAge}`)
  if (seguro) partes.push('Secure')
  return partes.join('; ')
}

function csrfConfere(ctx, informado) {
  const guardado = ctx.cookies.painel_csrf || ''
  return segredoIgual(informado || '', guardado)
}

function novaCsrf(ctx, res, seguro) {
  const valor = crypto.randomBytes(24).toString('base64url')
  res.setHeader('Set-Cookie', cookie('painel_csrf', valor, seguro, 60 * 30))
  return valor
}

function html(res, status, corpo, extra = []) {
  const cookies = Array.isArray(extra) ? extra : [extra]
  if (cookies.length) res.setHeader('Set-Cookie', cookies.length === 1 ? cookies[0] : cookies)
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
  })
  res.end(corpo)
}

function json(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
  })
  res.end(JSON.stringify(obj))
}

function ir(res, destino, cookies) {
  res.writeHead(303, {
    Location: destino,
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'Set-Cookie': cookies,
  })
  res.end()
}

async function sessaoPlena(ctx) {
  return lerSessao(ctx.db, ctx.cookies.painel_sessao, ctx.segredo, 'plena')
}

function ipChave(ctx) {
  return `ip:${ctx.ip}`
}

export async function tratar(ctx) {
  const { caminho, metodo } = ctx
  if (!caminho.startsWith('/panel')) return false
  if (caminho === '/panel/acesso.css' && metodo === 'GET') return false
  try {
    if (caminho === '/panel/editor.js' || caminho === '/panel/editor.css') return await editorEstatico(ctx)
    if (caminho === '/panel/login') return await login(ctx)
    if (caminho === '/panel/logout' && metodo === 'POST') return await sair(ctx)
    if (caminho === '/panel/olvide') return await olvide(ctx)
    if (caminho.startsWith('/panel/senha/')) return await senha(ctx)
    if (caminho.startsWith('/panel/setup/')) return await registro(ctx)
    if (caminho.startsWith('/panel/api/')) return await api(ctx)
    return nao(ctx, 404)
  } catch (erro) {
    if (erro.codigo === 'grande') return json(ctx.res, 413, { erro: 'grande', mensagem: MSG.grande })
    auditar(ctx.db, 'erro', ctx.ip, erro.message || 'erro')
    return json(ctx.res, 500, { erro: 'guardar', mensagem: MSG.guardar })
  }
}

function nao(ctx, status) {
  ctx.res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' })
  ctx.res.end(status === 404 ? 'No encontrado' : 'No autorizado')
  return true
}

async function editorEstatico(ctx) {
  const sessao = await sessaoPlena(ctx)
  if (!sessao) return nao(ctx, 404)
  return false
}

async function login(ctx) {
  if (ctx.metodo === 'GET') {
    const csrf = novaCsrf(ctx, ctx.res, ctx.seguro)
    html(ctx.res, 200, paginas.paginaLogin(csrf, ''))
    return true
  }
  if (ctx.metodo !== 'POST') return nao(ctx, 404)
  const inicio = Date.now()
  const form = await ctx.lerForm()
  if (!csrfConfere(ctx, form.csrf)) {
    const csrf = novaCsrf(ctx, ctx.res, ctx.seguro)
    html(ctx.res, 403, paginas.paginaLogin(csrf, ''))
    return true
  }
  const email = emailValido(form.email)
  const bloqueado = estaBloqueado(ctx.db, ipChave(ctx)) || (email && estaBloqueado(ctx.db, `email:${email}`))
  const dono = lerDono(ctx.db)
  const okSenha = await senhaConfere(dono, email || 'correo-invalido@local', form.senha)
  const ok = !bloqueado && !!email && okSenha
  if (ok) {
    zerarFalhas(ctx.db, ipChave(ctx))
    zerarFalhas(ctx.db, `email:${email}`)
    const sessao = criarSessao(ctx.db, 'plena', ctx.segredo, SESSAO_MS)
    auditar(ctx.db, 'login', ctx.ip, 'sesión abierta')
    await esperar(inicio)
    ir(ctx.res, '/', [
      cookie('painel_sessao', sessao.token, ctx.seguro, SESSAO_MS / 1000),
      cookie('painel_csrf', sessao.csrf, ctx.seguro, SESSAO_MS / 1000),
    ])
    return true
  }
  if (email) registrarFalha(ctx.db, `email:${email}`)
  registrarFalha(ctx.db, ipChave(ctx))
  auditar(ctx.db, 'login-falha', ctx.ip, 'credencial rechazada')
  await esperar(inicio)
  const csrf = novaCsrf(ctx, ctx.res, ctx.seguro)
  html(ctx.res, 401, paginas.paginaLogin(csrf, bloqueado ? MSG.bloqueio : MSG.credencial))
  return true
}

async function sair(ctx) {
  const sessao = await sessaoPlena(ctx)
  const form = await ctx.lerJson().catch(() => ({}))
  if (!sessao || !segredoIgual(ctx.req.headers['x-csrf'] || form.csrf || '', sessao.csrf)) {
    return json(ctx.res, 401, { erro: 'sessao', mensagem: MSG.sessao })
  }
  apagarSessao(ctx.db, ctx.cookies.painel_sessao, ctx.segredo, 'plena')
  auditar(ctx.db, 'logout', ctx.ip, 'sesión cerrada')
  ir(ctx.res, '/panel/login', [
    cookie('painel_sessao', '', ctx.seguro, 0),
    cookie('painel_csrf', '', ctx.seguro, 0),
  ])
  return true
}

async function olvide(ctx) {
  if (ctx.metodo === 'GET') {
    const csrf = novaCsrf(ctx, ctx.res, ctx.seguro)
    html(ctx.res, 200, paginas.paginaOlvide(csrf, ''))
    return true
  }
  const inicio = Date.now()
  const form = await ctx.lerForm()
  if (!csrfConfere(ctx, form.csrf)) return nao(ctx, 403)
  const email = emailValido(form.email)
  const dono = lerDono(ctx.db)
  const ok = email && dono && segredoIgual(email, dono.email) === false
    ? false
    : email && dono && email === dono.email && !estaBloqueado(ctx.db, ipChave(ctx))
  if (ok) {
    const token = tokenUrl()
    emitirCodigo(ctx.db, 'senha', token, ctx.segredo, Date.now() + LINK_MS)
    const base = process.env.PAINEL_URL || `http://${ctx.req.headers.host}`
    void enviarAoDono(dono.email, 'Nueva contraseña — Inca Braille Trail', `Abre este enlace para elegir una contraseña nueva. Caduca en 20 minutos:\n${base}/panel/senha/${token}\nSi no fuiste tú, ignora este mensaje.`)
    auditar(ctx.db, 'senha-link', ctx.ip, 'enlace enviado')
  } else if (email) {
    registrarFalha(ctx.db, ipChave(ctx))
  }
  await esperar(inicio)
  const csrf = novaCsrf(ctx, ctx.res, ctx.seguro)
  html(ctx.res, 200, paginas.paginaOlvide(csrf, 'Si el correo es el del dueño, enviamos un enlace.'))
  return true
}

async function senha(ctx) {
  const token = decodeURIComponent(caminhoToken(ctx.caminho, '/panel/senha/'))
  if (!token) return nao(ctx, 404)
  if (ctx.metodo === 'GET') {
    if (!codigoVigente(ctx.db, 'senha', token, ctx.segredo)) {
      html(ctx.res, 404, paginas.paginaLinkMorto())
      return true
    }
    const csrf = novaCsrf(ctx, ctx.res, ctx.seguro)
    html(ctx.res, 200, paginas.paginaNovaSenha(csrf, ''))
    return true
  }
  const form = await ctx.lerForm()
  if (!csrfConfere(ctx, form.csrf)) return nao(ctx, 403)
  if (!codigoVigente(ctx.db, 'senha', token, ctx.segredo)) {
    html(ctx.res, 404, paginas.paginaLinkMorto())
    return true
  }
  if (String(form.senha || '').length < 12) {
    html(ctx.res, 400, paginas.paginaNovaSenha(form.csrf, MSG.curto))
    return true
  }
  if (form.senha !== form.senha2) {
    html(ctx.res, 400, paginas.paginaNovaSenha(form.csrf, MSG.distinta))
    return true
  }
  if (!consumirCodigo(ctx.db, 'senha', token, ctx.segredo)) {
    html(ctx.res, 404, paginas.paginaLinkMorto())
    return true
  }
  const hash = await hashSenha(form.senha)
  ctx.db.prepare('UPDATE dono SET senha_hash = ? WHERE id = 1').run(hash)
  ctx.db.prepare('DELETE FROM sessao').run()
  auditar(ctx.db, 'senha', ctx.ip, 'contraseña cambiada')
  ir(ctx.res, '/panel/login', cookie('painel_sessao', '', ctx.seguro, 0))
  return true
}

function caminhoToken(caminho, prefixo) {
  if (!caminho.startsWith(prefixo)) return ''
  return caminho.slice(prefixo.length).replace(/\/$/, '')
}

async function registro(ctx) {
  const token = caminhoToken(ctx.caminho, '/panel/setup/')
  const inicio = Date.now()
  if (!segredoIgual(token, ctx.setup) || temDono(ctx.db)) {
    await esperar(inicio, 200)
    return nao(ctx, 404)
  }
  if (ctx.metodo === 'GET') {
    const csrf = novaCsrf(ctx, ctx.res, ctx.seguro)
    html(ctx.res, 200, paginas.paginaRegistro(csrf, ''))
    return true
  }
  if (ctx.metodo !== 'POST') return nao(ctx, 404)
  const form = await ctx.lerForm()
  if (!csrfConfere(ctx, form.csrf)) return nao(ctx, 403)
  const email = emailValido(form.email)
  if (!email) {
    html(ctx.res, 400, paginas.paginaRegistro(form.csrf, MSG.correo))
    return true
  }
  if (String(form.senha || '').length < 12) {
    html(ctx.res, 400, paginas.paginaRegistro(form.csrf, MSG.curto))
    return true
  }
  if (form.senha !== form.senha2) {
    html(ctx.res, 400, paginas.paginaRegistro(form.csrf, MSG.distinta))
    return true
  }
  const hash = await hashSenha(form.senha)
  const criou = criarDono(ctx.db, email, hash)
  if (!criou) return nao(ctx, 404)
  auditar(ctx.db, 'registro', ctx.ip, 'dueño creado')
  ir(ctx.res, '/panel/login', cookie('painel_csrf', '', ctx.seguro, 0))
  return true
}

async function api(ctx) {
  const sessao = await sessaoPlena(ctx)
  if (!sessao) return json(ctx.res, 401, { erro: 'sessao', mensagem: MSG.sessao })
  if (ctx.metodo !== 'GET' && ctx.metodo !== 'HEAD') {
    const header = ctx.req.headers['x-csrf'] || ''
    if (!segredoIgual(header, sessao.csrf) || !segredoIgual(ctx.cookies.painel_csrf || '', sessao.csrf)) {
      return json(ctx.res, 403, { erro: 'csrf', mensagem: MSG.csrf })
    }
  }
  const rota = ctx.caminho
  if (rota === '/panel/api/texto' && ctx.metodo === 'GET') return apiLerTexto(ctx)
  if (rota === '/panel/api/texto' && ctx.metodo === 'POST') return apiTexto(ctx)
  if (rota === '/panel/api/correcao' && ctx.metodo === 'POST') return apiCorrecao(ctx)
  if (rota === '/panel/api/imagem' && ctx.metodo === 'POST') return apiImagem(ctx)
  if (rota === '/panel/api/voluntario' && ctx.metodo === 'POST') return apiVoluntario(ctx)
  if (rota === '/panel/api/afiliado' && ctx.metodo === 'POST') return apiAfiliado(ctx)
  if (rota === '/panel/api/galeria/excluir' && ctx.metodo === 'POST') return apiExcluir(ctx)
  if (rota === '/panel/api/galeria/arquivo' && ctx.metodo === 'POST') return apiArquivo(ctx)
  if (rota === '/panel/api/upload/iniciar' && ctx.metodo === 'POST') return apiIniciar(ctx)
  if (rota === '/panel/api/upload/parte' && ctx.metodo === 'PUT') return apiParte(ctx)
  if (rota === '/panel/api/upload/concluir' && ctx.metodo === 'POST') return apiConcluir(ctx)
  if (rota === '/panel/api/desfazer' && ctx.metodo === 'POST') return apiDesfazer(ctx)
  if (rota === '/panel/api/historico' && ctx.metodo === 'GET') return apiHistorico(ctx)
  if (rota === '/panel/api/restaurar' && ctx.metodo === 'POST') return apiRestaurar(ctx)
  if (rota === '/panel/api/traducao/repetir' && ctx.metodo === 'POST') return apiRepetir(ctx)
  return nao(ctx, 404)
}

async function apiLerTexto(ctx) {
  const chave = ctx.url.searchParams.get('chave') || ''
  if (!chaveValida(chave) || !chaveDeTexto(ctx.db, chave)) return json(ctx.res, 404, { erro: 'guardar', mensagem: MSG.guardar })
  json(ctx.res, 200, { chave, idiomas: textosDaChave(ctx.db, chave) })
  return true
}

async function paresDeTraducao(ctx, chave, valor, idiomaPagina) {
  const lista = idiomas(ctx.db)
  const fonte = detectarIdioma(valor, idiomaPagina || 'en')
  const mapa = await traduzirTodos(valor, lista.includes(fonte) ? fonte : (idiomaPagina || 'en'), lista)
  return Object.entries(mapa).map(([idioma, info]) => ({ idioma, valor: info.valor, pendente: info.pendente }))
}

async function apiTexto(ctx) {
  const corpo = await ctx.lerJson()
  const chave = corpo.chave
  const plano = textoRico(corpo.valor)
  if (!chaveValida(chave) || !chaveDeTexto(ctx.db, chave)) return json(ctx.res, 400, { erro: 'guardar', mensagem: MSG.guardar })
  if (plano.erro) return json(ctx.res, 400, { erro: plano.erro, mensagem: plano.erro === 'largo' ? 'El texto es demasiado largo.' : MSG.guardar })
  const limpo = aplicarPadraoTexto(chave, plano.valor)
  antesDeMudar(ctx.db, ctx.pastaCopia, `texto:${chave}`)
  const visivel = textoVisivel(limpo)
  const pares = manterFormato(await paresDeTraducao(ctx, chave, visivel, corpo.idiomaPagina), visivel, limpo, corpo.idiomaPagina)
    .map((p) => ({ ...p, valor: aplicarPadraoTexto(chave, p.valor) }))
  gravarTextos(ctx.db, chave, pares)
  const tituloChave = chaveTituloDaNav(chave)
  if (tituloChave && chaveDeTexto(ctx.db, tituloChave)) {
    gravarTextos(ctx.db, tituloChave, pares.map((p) => ({
      idioma: p.idioma,
      valor: tituloAPartirDaNav(textoVisivel(p.valor), SITE_NAME),
      pendente: p.pendente,
    })))
  }
  auditar(ctx.db, 'texto', ctx.ip, chave)
  const pendente = pares.some((p) => p.pendente)
  json(ctx.res, 200, { ok: true, pendente, mensagem: pendente ? 'Guardado. La traducción quedó pendiente y se puede reintentar.' : 'Guardado.' })
  return true
}

async function apiCorrecao(ctx) {
  const corpo = await ctx.lerJson()
  const plano = textoPlano(corpo.valor)
  const idioma = String(corpo.idioma || '')
  if (!chaveValida(corpo.chave) || !idiomas(ctx.db).includes(idioma) || !chaveDeTexto(ctx.db, corpo.chave)) {
    return json(ctx.res, 400, { erro: 'guardar', mensagem: MSG.guardar })
  }
  if (plano.erro) return json(ctx.res, 400, { erro: 'largo', mensagem: 'El texto es demasiado largo.' })
  antesDeMudar(ctx.db, ctx.pastaCopia, `correcao:${corpo.chave}`)
  gravarTextos(ctx.db, corpo.chave, [{ idioma, valor: plano.valor, pendente: 0 }])
  auditar(ctx.db, 'correcao', ctx.ip, `${corpo.chave}:${idioma}`)
  json(ctx.res, 200, { ok: true, mensagem: 'Traducción guardada.' })
  return true
}

async function apiImagem(ctx) {
  const chave = ctx.req.headers['x-chave'] || ''
  if (!chaveValida(chave)) return json(ctx.res, 400, { erro: 'guardar', mensagem: MSG.guardar })
  const imagem = lerImagem(ctx.db, chave)
  if (!imagem) return json(ctx.res, 404, { erro: 'guardar', mensagem: MSG.guardar })
  const buffer = await ctx.lerRaw(ctx.limiteImagem)
  const pronto = await processarImagem(buffer, ctx.limiteImagem)
  if (pronto.erro) {
    const mensagem = pronto.erro === 'grande' ? MSG.grande : MSG.formato
    return json(ctx.res, 400, { erro: pronto.erro, mensagem })
  }
  const src = gravarMidia(ctx.pastaMidia, pronto.ext, pronto.buffer)
  antesDeMudar(ctx.db, ctx.pastaCopia, `imagem:${chave}`)
  const anterior = imagem.src
  salvarImagem(ctx.db, chave, { src, webp: pronto.ext === '.webp' ? src : '', largura: pronto.largura, altura: pronto.altura })
  apagarOrfao(ctx.db, ctx.pastaMidia, anterior)
  const alt = ctx.req.headers['x-alt'] ? decodeURIComponent(ctx.req.headers['x-alt']) : ''
  if (alt && imagem.alt_chave && chaveDeTexto(ctx.db, imagem.alt_chave)) {
    const plano = textoPlano(alt)
    if (!plano.erro) {
      const pares = await paresDeTraducao(ctx, imagem.alt_chave, plano.valor, ctx.req.headers['x-idioma'] || 'en')
      gravarTextos(ctx.db, imagem.alt_chave, pares)
    }
  }
  auditar(ctx.db, 'imagem', ctx.ip, chave)
  json(ctx.res, 200, { ok: true, mensagem: 'Imagen guardada.' })
  return true
}

async function apiVoluntario(ctx) {
  const nomePlano = textoPlano(decodeURIComponent(ctx.req.headers['x-nome'] || ''), 120)
  const bio = textoRico(decodeURIComponent(ctx.req.headers['x-bio'] || ''))
  const idiomaPagina = ctx.req.headers['x-idioma'] || 'en'
  if (nomePlano.erro || !nomePlano.valor.trim() || bio.erro) return json(ctx.res, 400, { erro: 'guardar', mensagem: MSG.guardar })
  const buffer = await ctx.lerRaw(ctx.limiteImagem)
  const pronto = await processarImagem(buffer, ctx.limiteImagem)
  if (pronto.erro) {
    const mensagem = pronto.erro === 'grande' ? MSG.grande : MSG.formato
    return json(ctx.res, 400, { erro: pronto.erro, mensagem })
  }
  const src = gravarMidia(ctx.pastaMidia, pronto.ext, pronto.buffer)
  const id = `v${crypto.randomBytes(5).toString('hex')}`
  const chaveImg = `img.volunteer.${id}`
  const base = `t.volunteer.media.${id}`
  antesDeMudar(ctx.db, ctx.pastaCopia, `voluntario:${id}`)
  const lista = listaVoluntarios(ctx.db)
  lista.push(id)
  gravarListaVoluntarios(ctx.db, lista)
  criarImagem(ctx.db, chaveImg, {
    src,
    webp: pronto.ext === '.webp' ? src : '',
    alt_chave: `${base}.alt`,
    largura: pronto.largura || 0,
    altura: pronto.altura || 0,
  })
  const alt = `${nomePlano.valor.trim()} smiles in a volunteer photo.`
  gravarTextos(ctx.db, `${base}.name`, await paresDeTraducao(ctx, `${base}.name`, nomePlano.valor.trim(), idiomaPagina))
  gravarTextos(ctx.db, `${base}.alt`, await paresDeTraducao(ctx, `${base}.alt`, alt, idiomaPagina))
  const visivel = textoVisivel(bio.valor)
  gravarTextos(ctx.db, `${base}.who`, manterFormato(await paresDeTraducao(ctx, `${base}.who`, visivel, idiomaPagina), visivel, bio.valor, idiomaPagina))
  const vazio = idiomas(ctx.db).map((idioma) => ({ idioma, valor: '', pendente: 0 }))
  gravarTextos(ctx.db, `${base}.work`, vazio)
  gravarTextos(ctx.db, `${base}.why`, vazio)
  auditar(ctx.db, 'voluntario', ctx.ip, id)
  json(ctx.res, 200, { ok: true, id, mensagem: 'Volunteer added.' })
  return true
}

async function apiAfiliado(ctx) {
  const url = decodeURIComponent(ctx.req.headers['x-url'] || '').trim()
  if (!/^https:\/\/[^\s<>"']+$/i.test(url) || url.length > 300) {
    return json(ctx.res, 400, { erro: 'guardar', mensagem: 'Use a full https link.' })
  }
  const buffer = await ctx.lerRaw(ctx.limiteImagem)
  const pronto = await processarImagem(buffer, ctx.limiteImagem)
  if (pronto.erro) {
    const mensagem = pronto.erro === 'grande' ? MSG.grande : MSG.formato
    return json(ctx.res, 400, { erro: pronto.erro, mensagem })
  }
  const src = gravarMidia(ctx.pastaMidia, pronto.ext, pronto.buffer)
  const lista = listaAfiliados(ctx.db)
  if (lista.length >= 24) return json(ctx.res, 400, { erro: 'cheio', mensagem: MSG.cheio })
  antesDeMudar(ctx.db, ctx.pastaCopia, 'afiliados')
  lista.push({ id: `a${crypto.randomBytes(4).toString('hex')}`, src, url })
  gravarListaAfiliados(ctx.db, lista)
  auditar(ctx.db, 'afiliado', ctx.ip, src)
  json(ctx.res, 200, { ok: true, mensagem: 'Partner added.' })
  return true
}

async function apiExcluir(ctx) {
  const corpo = await ctx.lerJson()
  if (!chaveValida(corpo.galeria) || !chaveValida(corpo.id) || !galeriaExiste(ctx.db, corpo.galeria)) {
    return json(ctx.res, 400, { erro: 'guardar', mensagem: MSG.guardar })
  }
  antesDeMudar(ctx.db, ctx.pastaCopia, `excluir:${corpo.id}`)
  const item = excluirItem(ctx.db, corpo.galeria, corpo.id)
  if (!item) return json(ctx.res, 404, { erro: 'guardar', mensagem: MSG.guardar })
  for (const src of [item.src, item.webp, item.poster]) apagarOrfao(ctx.db, ctx.pastaMidia, src)
  auditar(ctx.db, 'galeria-excluir', ctx.ip, corpo.id)
  json(ctx.res, 200, { ok: true, mensagem: 'Elemento quitado. Puedes deshacer.' })
  return true
}

async function apiArquivo(ctx) {
  const galeria = ctx.req.headers['x-galeria'] || ''
  const depois = ctx.req.headers['x-depois'] || ''
  if (!chaveValida(galeria) || !galeriaExiste(ctx.db, galeria) || (depois && !chaveValida(depois))) {
    return json(ctx.res, 400, { erro: 'guardar', mensagem: MSG.guardar })
  }
  const buffer = await ctx.lerRaw(ctx.limiteImagem)
  const pronto = await processarImagem(buffer, ctx.limiteImagem)
  if (pronto.erro) return json(ctx.res, 400, { erro: pronto.erro, mensagem: pronto.erro === 'grande' ? MSG.grande : MSG.formato })
  const src = gravarMidia(ctx.pastaMidia, pronto.ext, pronto.buffer)
  const id = `novo-${crypto.randomBytes(6).toString('hex')}`
  const legenda = `galeria.${galeria}.${id}`
  if (!chaveValida(legenda)) return json(ctx.res, 400, { erro: 'guardar', mensagem: MSG.guardar })
  antesDeMudar(ctx.db, ctx.pastaCopia, `galeria:${galeria}`)
  const pares = idiomas(ctx.db).map((idioma) => ({ idioma, valor: '', pendente: 0 }))
  gravarTextos(ctx.db, legenda, pares)
  inserirItemDepois(ctx.db, {
    id, galeria, tipo: 'imagem', src, webp: pronto.ext === '.webp' ? src : '', poster: '', legenda_chave: legenda,
    largura: pronto.largura, altura: pronto.altura,
  }, depois)
  auditar(ctx.db, 'galeria-novo', ctx.ip, id)
  json(ctx.res, 200, { ok: true, mensagem: 'Foto añadida.' })
  return true
}

async function apiIniciar(ctx) {
  const corpo = await ctx.lerJson()
  const tamanho = Number(corpo.tamanho)
  if (!chaveValida(corpo.galeria) || !galeriaExiste(ctx.db, corpo.galeria)) return json(ctx.res, 400, { erro: 'guardar', mensagem: MSG.guardar })
  if (!Number.isFinite(tamanho) || tamanho <= 0 || tamanho > ctx.limiteVideo) return json(ctx.res, 400, { erro: 'grande', mensagem: MSG.video })
  const id = crypto.randomBytes(16).toString('hex')
  const partes = Math.ceil(tamanho / PARTE)
  mkdirSync(join(ctx.pastaTmp, id), { recursive: true })
  ctx.db.prepare('INSERT INTO upload (id, galeria, depois_de, tipo, tamanho, partes, expira) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, corpo.galeria, corpo.depoisDe || '', 'video', tamanho, partes, Date.now() + 30 * 60 * 1000)
  json(ctx.res, 200, { id, partes, parte: PARTE })
  return true
}

async function apiParte(ctx) {
  const id = ctx.url.searchParams.get('id') || ''
  const indice = Number(ctx.url.searchParams.get('i'))
  if (!/^[a-f0-9]{32}$/.test(id) || !Number.isInteger(indice) || indice < 0) return json(ctx.res, 400, { erro: 'guardar', mensagem: MSG.guardar })
  const upload = ctx.db.prepare('SELECT * FROM upload WHERE id = ?').get(id)
  if (!upload || upload.expira < Date.now() || indice >= upload.partes) return json(ctx.res, 400, { erro: 'guardar', mensagem: MSG.guardar })
  const buffer = await ctx.lerRaw(PARTE + 64)
  writeFileSync(join(ctx.pastaTmp, id, String(indice)), buffer)
  json(ctx.res, 200, { ok: true })
  return true
}

async function apiConcluir(ctx) {
  const corpo = await ctx.lerJson()
  const id = corpo.id || ''
  if (!/^[a-f0-9]{32}$/.test(id)) return json(ctx.res, 400, { erro: 'guardar', mensagem: MSG.guardar })
  const upload = ctx.db.prepare('SELECT * FROM upload WHERE id = ?').get(id)
  if (!upload || upload.expira < Date.now()) return json(ctx.res, 400, { erro: 'guardar', mensagem: MSG.video })
  const pedacos = []
  for (let i = 0; i < upload.partes; i++) {
    try { pedacos.push(readFileSync(join(ctx.pastaTmp, id, String(i)))) }
    catch { return json(ctx.res, 400, { erro: 'formato', mensagem: MSG.video }) }
  }
  const buffer = Buffer.concat(pedacos)
  const video = validarVideo(buffer, ctx.limiteVideo)
  if (video.erro) return json(ctx.res, 400, { erro: video.erro, mensagem: MSG.video })
  let poster = ''
  if (corpo.poster) {
    const cru = Buffer.from(String(corpo.poster).replace(/^data:image\/\w+;base64,/, ''), 'base64')
    const img = await processarImagem(cru, ctx.limiteImagem)
    if (!img.erro) poster = gravarMidia(ctx.pastaMidia, img.ext, img.buffer)
  }
  const src = gravarMidia(ctx.pastaMidia, video.ext, buffer)
  const itemId = `novo-${crypto.randomBytes(6).toString('hex')}`
  const legenda = `galeria.${upload.galeria}.${itemId}`
  antesDeMudar(ctx.db, ctx.pastaCopia, `video:${upload.galeria}`)
  gravarTextos(ctx.db, legenda, idiomas(ctx.db).map((idioma) => ({ idioma, valor: '', pendente: 0 })))
  inserirItemDepois(ctx.db, {
    id: itemId, galeria: upload.galeria, tipo: 'video', src, webp: '', poster, legenda_chave: legenda, largura: 0, altura: 0,
  }, upload.depois_de)
  ctx.db.prepare('DELETE FROM upload WHERE id = ?').run(id)
  rmSync(join(ctx.pastaTmp, id), { recursive: true, force: true })
  auditar(ctx.db, 'galeria-video', ctx.ip, itemId)
  json(ctx.res, 200, { ok: true, mensagem: 'Video añadido.' })
  return true
}

async function apiDesfazer(ctx) {
  const ok = desfazer(ctx.db)
  auditar(ctx.db, 'desfazer', ctx.ip, ok ? 'restaurado' : 'vacio')
  json(ctx.res, ok ? 200 : 400, { ok, mensagem: ok ? 'Cambio deshecho.' : 'No hay nada que deshacer.' })
  return true
}

function apiHistorico(ctx) {
  const lista = listarVersoes(ctx.db).map((v) => ({
    id: v.id,
    quando: new Date(v.quando).toISOString(),
    acao: v.acao,
  }))
  json(ctx.res, 200, { lista })
  return true
}

async function apiRestaurar(ctx) {
  const corpo = await ctx.lerJson()
  const row = lerVersao(ctx.db, Number(corpo.id))
  if (!row) return json(ctx.res, 404, { erro: 'guardar', mensagem: MSG.guardar })
  antesDeMudar(ctx.db, ctx.pastaCopia, 'antes-de-restaurar')
  restaurar(ctx.db, JSON.parse(row.snapshot))
  auditar(ctx.db, 'restaurar', ctx.ip, String(corpo.id))
  json(ctx.res, 200, { ok: true, mensagem: 'Versión restaurada.' })
  return true
}

async function apiRepetir(ctx) {
  const pendentes = listarPendentes(ctx.db)
  let feitos = 0
  for (const row of pendentes) {
    const todos = textosDaChave(ctx.db, row.chave)
    const fonte = Object.entries(todos).find(([, info]) => !info.pendente)
    if (!fonte) continue
    const mapa = await traduzirTodos(fonte[1].valor, fonte[0], [row.idioma])
    const info = mapa[row.idioma]
    if (info && !info.pendente) {
      gravarTextos(ctx.db, row.chave, [{ idioma: row.idioma, valor: info.valor, pendente: 0 }])
      feitos += 1
    }
  }
  json(ctx.res, 200, { ok: true, feitos, mensagem: feitos ? 'Traducciones actualizadas.' : 'Siguen pendientes. Revisa la clave de traducción.' })
  return true
}

export function limparUploadsVelhos(db, pasta) {
  const agora = Date.now()
  for (const row of db.prepare('SELECT id FROM upload WHERE expira < ?').all(agora)) {
    rmSync(join(pasta, row.id), { recursive: true, force: true })
    db.prepare('DELETE FROM upload WHERE id = ?').run(row.id)
  }
  try { readdirSync(pasta) } catch { mkdirSync(pasta, { recursive: true }) }
}
