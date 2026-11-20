// publicar — o botão Publish: regenera o HTML do snapshot em chamadas curtas e cria um deployment no Pages
import { IDIOMAS, PAGINAS, caminho, montarFontes, gerarPaginaBase } from './base-site.mjs'
import { hashArquivoPages } from './blake3.mjs'
import { aplicarConteudo } from './conteudo.mjs'
import manifesto from './manifesto-estatico.json'
import templatesSite from './templates-site.json'
import siteJson from '../src/site.json'
import i18nEn from '../src/i18n/en.json'
import i18nEs from '../src/i18n/es.json'

// identidade do projeto no Cloudflare (não é segredo; o segredo é env.PUBLISH_TOKEN)
const API = 'https://api.cloudflare.com/client/v4'
const CONTA = '47fefac47b94a1d88bf43e36dc50b902'
const PROJETO = 'incabrailletrail'
const D1_ID = '9783d82c-d1f7-463d-87e6-46389938503d'
const R2_NOME = 'incabraille-midia'
// igual ao wrangler.toml; o metadata do deployment precisa repetir
const COMPAT_DATE = '2025-11-17'
const COMPAT_FLAGS = ['nodejs_compat']

const PRAZO_MS = 3 * 60 * 1000
const LOTE_ARQUIVOS = 10
const LOTE_BYTES = 2_500_000
const MSG = {
  par: 'The panel was updated and needs a manual deploy first. Ask the team.',
  curso: 'A publish is already in progress. Wait a few minutes and try again.',
  estado: 'This publish expired. Start again with the Publish button.',
  falha: 'We could not publish. Try again in a few minutes.',
}

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}

// fontes do render ficam em cache no isolate; cada chamada só gera uma página
let fontesCache = null
function fontes() {
  if (!fontesCache) {
    fontesCache = montarFontes(
      siteJson,
      { en: i18nEn, es: i18nEs },
      templatesSite.layout,
      templatesSite.templates,
    )
  }
  return fontesCache
}

async function lerPublicacao(dbx) {
  const row = await dbx.get(`SELECT valor FROM meta WHERE chave = 'publicar'`)
  return row ? JSON.parse(row.valor) : null
}

async function gravarPublicacao(dbx, est) {
  await dbx.run(`INSERT INTO meta (chave, valor) VALUES ('publicar', ?)
    ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, JSON.stringify(est))
}

async function pegarJwt(env) {
  const r = await fetch(`${API}/accounts/${CONTA}/pages/projects/${PROJETO}/upload-token`, {
    headers: { authorization: `Bearer ${env.PUBLISH_TOKEN}` },
  })
  const d = await r.json()
  if (!r.ok || !d.success) throw new Error('upload-token')
  return d.result.jwt
}

async function apiAssets(rota, jwt, corpo) {
  const r = await fetch(`${API}${rota}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${jwt}` },
    body: JSON.stringify(corpo),
  })
  const d = await r.json()
  if (!r.ok || d.success === false) throw new Error(`assets ${rota}`)
  return d.result
}

// a cópia do R2 segue o site que está no ar; se ficou para trás, o próprio Publish a repõe
async function alinharBundle(request, env) {
  const versaoObj = await env.MIDIA.get('painel/worker-bundle.versao')
  const versaoR2 = versaoObj ? (await versaoObj.text()).trim() : ''
  if (versaoR2 === manifesto.versao) return true
  const asset = await env.ASSETS.fetch(new Request(new URL('/interno/worker-bundle.js', request.url)))
  if (!asset.ok) return false
  const codigo = await asset.text()
  if (!codigo.includes('function')) return false
  await env.MIDIA.put('painel/worker-bundle', codigo)
  await env.MIDIA.put('painel/worker-bundle.versao', manifesto.versao)
  return true
}

function todosOsHashes(est) {
  return [...Object.values(manifesto.arquivos).map((a) => a.h), ...Object.values(est.hashes)]
}

// iniciar — confere o par bundle+manifesto, trava a publicação e monta a fila de páginas
async function iniciar(request, dbx, env) {
  if (!env.PUBLISH_TOKEN) return json(500, { erro: 'config', mensagem: MSG.par })
  const corpo = await request.json().catch(() => ({}))
  const branch = corpo.branch === 'publish-test' ? 'publish-test' : 'main'
  const alinhou = await alinharBundle(request, env)
  if (!alinhou) return json(409, { erro: 'par', mensagem: MSG.par })
  const agora = Date.now()
  const atual = await lerPublicacao(dbx)
  if (atual && atual.expira > agora) return json(409, { erro: 'curso', mensagem: MSG.curso })
  const fila = []
  for (const idioma of IDIOMAS) {
    for (const pagina of PAGINAS) fila.push({ i: idioma.code, p: pagina.id, path: `${caminho(idioma, pagina)}index.html` })
  }
  const est = { branch, expira: agora + PRAZO_MS, etapa: 'paginas', fila, hashes: {}, faltam: null }
  await gravarPublicacao(dbx, est)
  return json(200, { ok: true, total: fila.length, etapa: 'paginas' })
}

// pagina — gera o HTML de uma página a partir do snapshot e guarda no rascunho do R2
async function pagina(dbx, env, lerEstado) {
  const est = await lerPublicacao(dbx)
  if (!est || est.etapa !== 'paginas' || est.expira < Date.now()) return json(409, { erro: 'estado', mensagem: MSG.estado })
  const alvo = est.fila[0]
  const base = gerarPaginaBase(fontes(), alvo.i, alvo.p, new Date().getFullYear())
  const estadoDb = await lerEstado(dbx, alvo.i)
  const html = aplicarConteudo(base, estadoDb)
  const hash = hashArquivoPages(Buffer.from(html), 'html')
  await env.MIDIA.put(`painel/rascunho/${hash}`, html)
  est.hashes[alvo.path] = hash
  est.fila.shift()
  if (!est.fila.length) est.etapa = 'enviar'
  est.expira = Date.now() + PRAZO_MS
  await gravarPublicacao(dbx, est)
  const feitos = Object.keys(est.hashes).length
  return json(200, { feitos, total: feitos + est.fila.length, etapa: est.etapa })
}

// enviar — pergunta o que falta no Pages e sobe os arquivos em lotes curtos
async function enviar(request, dbx, env) {
  const est = await lerPublicacao(dbx)
  if (!est || est.etapa !== 'enviar' || est.expira < Date.now()) return json(409, { erro: 'estado', mensagem: MSG.estado })
  est.expira = Date.now() + PRAZO_MS
  if (est.faltam === null) {
    const jwt = await pegarJwt(env)
    const faltam = await apiAssets('/pages/assets/check-missing', jwt, { hashes: todosOsHashes(est) })
    est.faltam = Array.isArray(faltam) ? faltam : []
    await gravarPublicacao(dbx, est)
    return json(200, { etapa: 'enviar', faltam: est.faltam.length })
  }
  if (est.faltam.length) {
    const jwt = await pegarJwt(env)
    const novoPorHash = {}
    for (const [path, h] of Object.entries(est.hashes)) novoPorHash[h] = path
    const estaticoPorHash = {}
    for (const [path, info] of Object.entries(manifesto.arquivos)) estaticoPorHash[info.h] = { path, ...info }
    const lote = []
    let bytes = 0
    for (const h of est.faltam) {
      const tam = estaticoPorHash[h] ? estaticoPorHash[h].b : 100_000
      if (lote.length && (bytes + tam > LOTE_BYTES || lote.length >= LOTE_ARQUIVOS)) break
      lote.push(h)
      bytes += tam
    }
    const payload = []
    for (const h of lote) {
      let conteudo
      let tipo
      if (novoPorHash[h]) {
        const obj = await env.MIDIA.get(`painel/rascunho/${h}`)
        if (!obj) return json(409, { erro: 'estado', mensagem: MSG.estado })
        conteudo = await obj.arrayBuffer()
        tipo = 'text/html'
      } else {
        const info = estaticoPorHash[h]
        if (!info) return json(409, { erro: 'estado', mensagem: MSG.estado })
        const resp = await env.ASSETS.fetch(new Request(new URL(info.path, request.url)))
        if (!resp.ok) return json(409, { erro: 'estado', mensagem: MSG.falha })
        conteudo = await resp.arrayBuffer()
        tipo = info.t
      }
      payload.push({ key: h, value: Buffer.from(conteudo).toString('base64'), metadata: { contentType: tipo }, base64: true })
    }
    await apiAssets('/pages/assets/upload', jwt, payload)
    est.faltam = est.faltam.filter((h) => !lote.includes(h))
    await gravarPublicacao(dbx, est)
    return json(200, { etapa: 'enviar', faltam: est.faltam.length })
  }
  const jwt = await pegarJwt(env)
  await apiAssets('/pages/assets/upsert-hashes', jwt, { hashes: todosOsHashes(est) })
  est.etapa = 'concluir'
  await gravarPublicacao(dbx, est)
  return json(200, { etapa: 'concluir', faltam: 0 })
}

// concluir — monta o deployment com o bundle do R2 e os campos que o Wrangler usa, e solta o lock
async function concluir(dbx, env, auditar, ip) {
  const est = await lerPublicacao(dbx)
  if (!est || est.etapa !== 'concluir' || est.expira < Date.now()) return json(409, { erro: 'estado', mensagem: MSG.estado })
  const bundleObj = await env.MIDIA.get('painel/worker-bundle')
  if (!bundleObj) return json(409, { erro: 'par', mensagem: MSG.par })
  const bundle = await bundleObj.text()
  const manifest = {}
  for (const [path, info] of Object.entries(manifesto.arquivos)) manifest[path] = info.h
  for (const [path, h] of Object.entries(est.hashes)) manifest[path] = h
  const metadata = {
    main_module: '_worker.js',
    bindings: [
      { name: 'DB', type: 'd1', id: D1_ID },
      { name: 'MIDIA', type: 'r2_bucket', bucket_name: R2_NOME },
    ],
    compatibility_date: COMPAT_DATE,
    compatibility_flags: COMPAT_FLAGS,
  }
  const interno = new FormData()
  interno.set('metadata', JSON.stringify(metadata))
  interno.set('_worker.js', new File([bundle], '_worker.js', { type: 'application/javascript+module' }))
  const blobInterno = await new Response(interno).blob()
  const form = new FormData()
  form.append('manifest', JSON.stringify(manifest))
  form.append('branch', est.branch)
  form.append('_headers', new File([manifesto.especiais.headers], '_headers'))
  form.append('_redirects', new File([manifesto.especiais.redirects], '_redirects'))
  form.append('_worker.bundle', new File([blobInterno], '_worker.bundle'))
  form.append('_routes.json', new File([manifesto.especiais.rotas], '_routes.json'))
  const r = await fetch(`${API}/accounts/${CONTA}/pages/projects/${PROJETO}/deployments`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.PUBLISH_TOKEN}` },
    body: form,
  })
  const d = await r.json().catch(() => null)
  if (!r.ok || !d || !d.success) return json(502, { erro: 'deploy', mensagem: MSG.falha })
  await env.MIDIA.delete(Object.values(est.hashes).map((h) => `painel/rascunho/${h}`))
  await dbx.run(`DELETE FROM meta WHERE chave = 'publicar'`)
  await auditar(dbx, 'publicar', ip, `${est.branch} ${d.result.id || ''}`)
  return json(200, { ok: true, url: d.result.url || '', branch: est.branch })
}

// publicar — roteia as quatro chamadas do botão; a sessão e o CSRF já foram exigidos antes
export async function publicar(request, dbx, env, rota, ip, deps) {
  if (request.method !== 'POST') return json(404, { erro: 'rota', mensagem: MSG.falha })
  try {
    if (rota === '/panel/api/publicar/iniciar') return await iniciar(request, dbx, env)
    if (rota === '/panel/api/publicar/pagina') return await pagina(dbx, env, deps.lerEstado)
    if (rota === '/panel/api/publicar/enviar') return await enviar(request, dbx, env)
    if (rota === '/panel/api/publicar/concluir') return await concluir(dbx, env, deps.auditar, ip)
  } catch {
    return json(502, { erro: 'publicar', mensagem: MSG.falha })
  }
  return json(404, { erro: 'rota', mensagem: MSG.falha })
}
