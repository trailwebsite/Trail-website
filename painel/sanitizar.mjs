// sanitizar — texto plano e um HTML curto (negrito, itálico, tamanho, alinhamento)
import crypto from 'node:crypto'
export function escapar(texto) {
  return String(texto ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

const TAMANHOS = new Set(['12', '14', '16', '18', '20', '24', '28', '32', '40', '48'])
const ALINHA = new Set(['tx-esq', 'tx-centro', 'tx-dir'])

function decodificar(texto) {
  return String(texto)
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
}

function classesSpan(tag) {
  const achado = tag.match(/\bclass\s*=\s*"([^"]*)"/i)
  if (!achado) return ''
  let tamanho = ''
  let lado = ''
  for (const nome of achado[1].split(/\s+/)) {
    if (nome.startsWith('tx-') && TAMANHOS.has(nome.slice(3))) tamanho = nome
    else if (ALINHA.has(nome)) lado = nome
  }
  return [tamanho, lado].filter(Boolean).join(' ')
}

// htmlSeguro — só b, i, br e span com as classes do painel; o resto vira texto
export function htmlSeguro(entrada, max = 200000) {
  let bruto = String(entrada ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  if (bruto.includes('\0')) return { erro: 'nulo' }
  if (bruto.length > max) return { erro: 'largo' }
  bruto = bruto.replace(/<div\b[^>]*>/gi, '').replace(/<\/div>/gi, '\n')
  bruto = bruto.replace(/<p\b[^>]*>/gi, '').replace(/<\/p>/gi, '\n')
  const re = /<\/?(b|i|strong|em|span|br)\b[^>]*?>/gi
  const pilha = []
  let html = ''
  let i = 0
  let m
  const texto = (pedaco) => {
    html += escapar(decodificar(pedaco)).replaceAll('\n', '<br>')
  }
  while ((m = re.exec(bruto))) {
    texto(bruto.slice(i, m.index))
    i = m.index + m[0].length
    const fecha = m[0].startsWith('</')
    const nome = m[1].toLowerCase() === 'strong' ? 'b' : m[1].toLowerCase() === 'em' ? 'i' : m[1].toLowerCase()
    if (nome === 'br') {
      if (!fecha) html += '<br>'
      continue
    }
    if (!fecha) {
      if (nome === 'span') {
        const classe = classesSpan(m[0])
        if (!classe) { pilha.push(''); continue }
        html += `<span class="${classe}">`
        pilha.push('span')
      } else {
        html += `<${nome}>`
        pilha.push(nome)
      }
      continue
    }
    const onde = pilha.lastIndexOf(nome)
    if (onde < 0) continue
    while (pilha.length - 1 > onde) {
      const topo = pilha.pop()
      if (topo) html += `</${topo}>`
    }
    pilha.pop()
    html += `</${nome}>`
  }
  texto(bruto.slice(i))
  while (pilha.length) {
    const topo = pilha.pop()
    if (topo) html += `</${topo}>`
  }
  return { html }
}

export function htmlDeTexto(valor) {
  const r = htmlSeguro(valor)
  if (r.erro || r.html == null) return escapar(valor).replaceAll('\n', '<br>')
  return r.html
}

export function textoRico(entrada, max = 200000) {
  const r = htmlSeguro(entrada, max)
  if (r.erro) return r
  return { valor: r.html }
}

// perfilPadrao — nav e cabeçalho de página guardam só negrito/itálico; o tamanho vem do CSS
export function perfilPadrao(chave) {
  const k = String(chave || '')
  if (/^t\.nav\./.test(k) || k === 't.volunteer.signNow') return 'nav'
  if (/^t\.(educational|sensory|volunteer|donations|sponsors)\.(h1|heroLine)$/.test(k)) return 'cabeca'
  return 'livre'
}

const NAV_PARA_TITULO = {
  't.nav.educational': 't.educational.title',
  't.nav.sensory': 't.sensory.title',
  't.nav.volunteer': 't.volunteer.title',
  't.nav.sponsors': 't.sponsors.title',
  't.nav.donations': 't.donations.title',
  't.nav.app': 't.app.title',
}

export function chaveTituloDaNav(chaveNav) {
  return NAV_PARA_TITULO[chaveNav] || ''
}

// aplicarPadraoTexto — tira tamanho/alinhamento (e quebras na nav) sem mexer em b/i
export function aplicarPadraoTexto(chave, html) {
  const perfil = perfilPadrao(chave)
  if (perfil === 'livre') return String(html ?? '')
  let saida = String(html ?? '')
  saida = saida.replace(/<span\b([^>]*)>/gi, (tag, attrs) => {
    const achado = attrs.match(/\bclass\s*=\s*"([^"]*)"/i)
    if (!achado) return '<span>'
    const keep = achado[1].split(/\s+/).filter((nome) => {
      if (!nome) return false
      if (nome.startsWith('tx-') && TAMANHOS.has(nome.slice(3))) return false
      if (ALINHA.has(nome)) return false
      return true
    })
    if (!keep.length) return '<span>'
    return `<span class="${keep.join(' ')}">`
  })
  // spans sem classe viram só o miolo
  let anterior
  do {
    anterior = saida
    saida = saida.replace(/<span>([\s\S]*?)<\/span>/gi, '$1')
  } while (saida !== anterior)
  if (perfil === 'nav') {
    saida = saida.replace(/<br\s*\/?>/gi, ' ')
    saida = saida.replace(/[ \t\f\v]+/g, ' ')
    saida = saida.replace(/ *\n */g, ' ').trim()
  }
  return saida
}

export function tituloAPartirDaNav(nomeVisivel, siteName) {
  const nome = String(nomeVisivel ?? '').replace(/\s+/g, ' ').trim()
  const marca = String(siteName ?? '').trim() || 'Inca Braille Trail'
  if (!nome) return marca
  return `${nome} — ${marca}`
}

// alinharTitulosDaNav — a aba do navegador segue o rótulo da nav, mesmo com dado antigo no banco
export function alinharTitulosDaNav(textos, siteName = 'Inca Braille Trail') {
  const saida = { ...(textos || {}) }
  for (const [nav, titulo] of Object.entries(NAV_PARA_TITULO)) {
    if (!Object.prototype.hasOwnProperty.call(saida, nav)) continue
    const nome = textoVisivel(aplicarPadraoTexto(nav, saida[nav]))
    saida[titulo] = tituloAPartirDaNav(nome, siteName)
  }
  return saida
}

export function textoVisivel(html) {
  return String(html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
}

export function textoPlano(entrada, max = 200000) {
  const valor = String(entrada ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  if (valor.includes('\0')) return { erro: 'nulo' }
  if (valor.length > max) return { erro: 'largo' }
  return { valor }
}

export function emailValido(entrada) {
  const email = String(entrada ?? '').trim().toLowerCase()
  if (email.length < 6 || email.length > 200) return ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return ''
  return email
}

export function chaveValida(chave) {
  return typeof chave === 'string' && /^[a-zA-Z0-9._-]{1,180}$/.test(chave)
}

export function segredoIgual(recebido, esperado) {
  const a = Buffer.from(String(recebido ?? ''))
  const b = Buffer.from(String(esperado ?? ''))
  if (!esperado || a.length !== b.length) {
    crypto.timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32))
    return false
  }
  return crypto.timingSafeEqual(a, b)
}
