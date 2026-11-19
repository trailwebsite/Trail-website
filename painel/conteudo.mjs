// conteudo — aplica o que está no banco em cima do HTML estático, sem mudar o desenho
import { escapar, htmlDeTexto, aplicarPadraoTexto, textoVisivel, alinharTitulosDaNav } from './sanitizar.mjs'

function textoDaChave(chave, valor) {
  return aplicarPadraoTexto(chave, htmlDeTexto(valor))
}

function itemGaleria(item, legenda, indice, abrir) {
  const id = escapar(item.id)
  const src = escapar(item.src)
  const legendaHtml = `<span data-edit-key="${escapar(item.legenda_chave)}" data-edit-type="text">${textoDaChave(item.legenda_chave, legenda)}</span>`
  const rotulo = `${escapar(abrir)} ${indice}`
  const w = item.largura ? ` width="${Number(item.largura)}"` : ''
  const h = item.altura ? ` height="${Number(item.altura)}"` : ''
  if (item.tipo === 'video') {
    const poster = item.poster ? ` poster="${escapar(item.poster)}"` : ''
    const mime = item.src.endsWith('.webm') ? 'video/webm' : 'video/mp4'
    return `<li class="galeria-item" data-item-id="${id}">
              <button class="galeria-botao" type="button" data-tipo="video" data-src="${src}" data-legenda="${escapar(legenda)}" data-legenda-chave="${escapar(item.legenda_chave)}" aria-label="${rotulo}">
                <video muted playsinline preload="metadata" tabindex="-1" aria-hidden="true"${poster}><source src="${src}#t=0.1" type="${mime}"></video>
              </button>
              <figure class="galeria-cheia">
                <video controls playsinline preload="metadata"${poster}${w}${h} aria-label="${escapar(legenda)}"><source src="${src}" type="${mime}"></video>
                <figcaption>${legendaHtml}</figcaption>
              </figure>
            </li>`
  }
  const webp = item.webp && item.webp !== item.src ? `<source type="image/webp" srcset="${escapar(item.webp)}">` : ''
  const foto = `${webp}<img src="${src}"${w}${h} alt="">`
  const fotoCheia = `${webp}<img src="${src}"${w}${h} alt="${escapar(legenda)}">`
  return `<li class="galeria-item" data-item-id="${id}">
              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="${src}" data-legenda="${escapar(legenda)}" data-legenda-chave="${escapar(item.legenda_chave)}" aria-label="${rotulo}">
                <picture>${foto}</picture>
              </button>
              <figure class="galeria-cheia">
                <picture>${fotoCheia}</picture>
                <figcaption>${legendaHtml}</figcaption>
              </figure>
            </li>`
}

export function aplicarGalerias(html, galerias, textos) {
  const mapa = new Map(galerias.map((g) => [g.chave, g]))
  return html.replace(/<ul class="galeria"[^>]*\bdata-edit-key="([^"]+)"[^>]*>[\s\S]*?<\/ul>/g, (bloco, chave) => {
    const g = mapa.get(chave)
    if (!g) return bloco
    const abrirChave = g.abrir_chave || bloco.match(/\bdata-abrir-chave="([^"]+)"/)?.[1] || ''
    const abrir = abrirChave && textos[abrirChave] ? textos[abrirChave] : ''
    const abrirAttr = abrirChave ? ` data-abrir-chave="${escapar(abrirChave)}"` : ''
    const itens = g.itens.map((item, i) => itemGaleria(item, textos[item.legenda_chave] || '', i + 1, abrir)).join('\n            ')
    return `<ul class="galeria" data-edit-key="${escapar(chave)}" data-edit-type="gallery"${abrirAttr}>${itens}</ul>`
  })
}

export function aplicarImagens(html, imagens, textos) {
  let saida = html.replace(/<picture\b([^>]*\bdata-edit-key="([^"]+)"[^>]*)>([\s\S]*?)<\/picture>/g, (tudo, attrs, chave, inner) => {
    const im = imagens[chave]
    if (!im) return tudo
    const altChave = attrs.match(/\bdata-alt-key="([^"]+)"/)?.[1] || im.alt_chave
    const altAtual = inner.match(/\salt="([^"]*)"/)?.[1] || ''
    const alt = altChave && Object.prototype.hasOwnProperty.call(textos, altChave) ? textos[altChave] : altAtual
    const w = im.largura || inner.match(/\bwidth="(\d+)"/)?.[1] || ''
    const h = im.altura || inner.match(/\bheight="(\d+)"/)?.[1] || ''
    const dims = `${w ? ` width="${w}"` : ''}${h ? ` height="${h}"` : ''}`
    const pressa = /fetchpriority="high"/.test(inner) ? ' fetchpriority="high"' : ''
    const webp = im.webp && im.webp !== im.src ? `<source type="image/webp" srcset="${escapar(im.webp)}">` : ''
    return `<picture${attrs}>${webp}<img src="${escapar(im.src)}"${dims} alt="${escapar(alt)}"${pressa}></picture>`
  })
  saida = saida.replace(/<img\b[^>]*\bdata-edit-key="([^"]+)"[^>]*>/g, (tag, chave) => {
    const im = imagens[chave]
    if (!im) return tag
    let novo = tag.replace(/\ssrc="[^"]*"/, ` src="${escapar(im.src)}"`)
    const altChave = tag.match(/\bdata-alt-key="([^"]+)"/)?.[1] || im.alt_chave
    if (altChave && Object.prototype.hasOwnProperty.call(textos, altChave)) {
      novo = novo.replace(/\salt="[^"]*"/, ` alt="${escapar(textos[altChave])}"`)
    }
    return novo
  })
  return saida
}

export function aplicarTextos(html, textos) {
  return html.replace(/(<([a-zA-Z0-9]+)\b[^>]*\bdata-edit-key="([^"]+)"[^>]*\bdata-edit-type="text"[^>]*>)([\s\S]*?)(<\/\2>)/g, (tudo, abre, _tag, chave, _miolo, fecha) => {
    if (!Object.prototype.hasOwnProperty.call(textos, chave)) return tudo
    if (abre.includes('data-edit="locked"')) return tudo
    return `${abre}${textoDaChave(chave, textos[chave])}${fecha}`
  })
}

export function aplicarMeta(html, textos) {
  let saida = html.replace(/<title\b([^>]*)>([^<]*)<\/title>/g, (tudo, attrs, _texto) => {
    const chave = attrs.match(/\bdata-edit-key="([^"]+)"/)?.[1]
    if (!chave || !Object.prototype.hasOwnProperty.call(textos, chave)) return tudo
    return `<title${attrs}>${escapar(textoVisivel(textos[chave]))}</title>`
  })
  saida = saida.replace(/<meta\b[^>]*\bname="description"[^>]*>/g, (tag) => {
    const chave = tag.match(/\bdata-edit-key="([^"]+)"/)?.[1]
    if (!chave || !Object.prototype.hasOwnProperty.call(textos, chave)) return tag
    return tag.replace(/\bcontent="[^"]*"/, `content="${escapar(textoVisivel(textos[chave]))}"`)
  })
  saida = saida.replace(/<([a-zA-Z0-9]+)\b([^>]*\bdata-numero-chave="([^"]+)"[^>]*)>/g, (tudo, tag, attrs, chave) => {
    if (!Object.prototype.hasOwnProperty.call(textos, chave)) return tudo
    const novos = attrs.replace(/\bdata-numero="[^"]*"/, `data-numero="${escapar(textos[chave])}"`)
    return `<${tag}${novos}>`
  })
  saida = saida.replace(/<a\b([^>]*\bdata-href-chave="([^"]+)"[^>]*)>/g, (tudo, attrs, chave) => {
    if (!Object.prototype.hasOwnProperty.call(textos, chave)) return tudo
    const prefixo = attrs.match(/\bdata-href-prefixo="([^"]*)"/)?.[1] || ''
    const href = `${prefixo}${String(textos[chave]).replaceAll(' ', '')}`
    const novos = attrs.replace(/\bhref="[^"]*"/, `href="${escapar(href)}"`)
    return `<a${novos}>`
  })
  return saida
}

function itemVoluntario(id, textos, imagens) {
  const base = `t.volunteer.media.${id}`
  const nome = textos[`${base}.name`] || id
  const alt = textos[`${base}.alt`] || nome
  const im = imagens[`img.volunteer.${id}`] || {}
  const src = im.src || '/img/og.png'
  const webp = im.webp && im.webp !== src ? `<source type="image/webp" srcset="${escapar(im.webp)}">` : ''
  const w = im.largura || 768
  const h = im.altura || 1024
  const paragrafos = ['who', 'work', 'why']
    .map((campo) => {
      const chave = `${base}.${campo}`
      if (!Object.prototype.hasOwnProperty.call(textos, chave) && campo !== 'who') return ''
      const valor = textos[chave] || ''
      if (!valor && campo !== 'who') return ''
      return `<p><span data-edit-key="${escapar(chave)}" data-edit-type="text">${htmlDeTexto(valor)}</span></p>`
    })
    .filter(Boolean)
    .join('\n                ')
  return `<li class="voluntario" data-voluntario-id="${escapar(id)}">
            <div class="faixa" aria-hidden="true"></div>
            <h3 class="perfil-nome"><span data-edit-key="${escapar(`${base}.name`)}" data-edit-type="text">${htmlDeTexto(nome)}</span></h3>
            <button class="perfil-botao" type="button" id="caixa-${escapar(id)}-botao" aria-expanded="false" aria-controls="caixa-${escapar(id)}"><span data-edit-key="${escapar(`${base}.name`)}" data-edit-type="text">${htmlDeTexto(nome)}</span></button>
            <div class="voluntario-miolo perfil-miolo" id="caixa-${escapar(id)}">
              <figure class="perfil">
                <picture data-edit-key="img.volunteer.${escapar(id)}" data-edit-type="image" data-alt-key="${escapar(`${base}.alt`)}">
                  ${webp}<img src="${escapar(src)}" width="${Number(w)}" height="${Number(h)}" alt="${escapar(alt)}">
                </picture>
              </figure>
              <div class="perfil-info">
                ${paragrafos}
              </div>
            </div>
          </li>`
}

export function aplicarVoluntarios(html, voluntarios, textos, imagens) {
  if (!Array.isArray(voluntarios) || !voluntarios.length) return html
  return html.replace(/<ul class="voluntarios"[^>]*>[\s\S]*?<\/ul>/g, () => {
    const itens = voluntarios.map((id) => itemVoluntario(id, textos, imagens)).join('\n          ')
    return `<ul class="voluntarios" data-edit-key="lista.voluntarios" data-edit-type="volunteers">${itens}</ul>`
  })
}

function urlHttps(valor) {
  const url = String(valor || '').trim()
  if (!/^https:\/\/[^\s<>"']+$/i.test(url)) return ''
  return url
}

export function aplicarAfiliados(html, afiliados) {
  if (!html.includes('data-edit-type="partners"')) return html
  const lista = Array.isArray(afiliados) ? afiliados : []
  const validos = lista.filter((item) => urlHttps(item.url) && item.src)
  const cheios = validos.map((item) => {
    const url = escapar(urlHttps(item.url))
    const src = escapar(item.src)
    return `<li class="afiliado"><a class="afiliado-logo" href="${url}" target="_blank" rel="noopener noreferrer"><img src="${src}" alt=""></a></li>`
  }).join('')
  const buracos = '<li class="afiliado-vazio"></li>'.repeat(Math.max(0, 4 - validos.length))
  return html.replace(/<ul class="afiliados"[^>]*>[\s\S]*?<\/ul>/, `<ul class="afiliados" data-edit-key="lista.afiliados" data-edit-type="partners" aria-labelledby="afiliados-titulo">${cheios}${buracos}</ul>`)
}

export function aplicarConteudo(html, estado) {
  const textos = alinharTitulosDaNav(estado.textos)
  const { imagens, galerias, voluntarios, afiliados } = estado
  let saida = aplicarAfiliados(html, afiliados)
  saida = aplicarVoluntarios(saida, voluntarios, textos, imagens)
  saida = aplicarGalerias(saida, galerias, textos)
  saida = aplicarImagens(saida, imagens, textos)
  saida = aplicarTextos(saida, textos)
  saida = aplicarMeta(saida, textos)
  return saida
}

export function injetarEditor(html, csrf) {
  const cabeca = `<link rel="stylesheet" href="/panel/editor.css">\n<meta name="painel-csrf" content="${escapar(csrf)}">`
  const corpo = `<script src="/panel/editor.js" defer></script>`
  return html
    .replace('</head>', `${cabeca}\n</head>`)
    .replace('</body>', `${corpo}\n</body>`)
}

// página original — sem editor, e os links seguintes continuam sem editor
export function injetarVer(html) {
  return html.replace('</body>', `<script src="/panel/ver.js" defer></script>\n</body>`)
}
