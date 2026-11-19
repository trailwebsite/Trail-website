// arquivo.mjs — valida imagem e vídeo pelo conteúdo, sem gravar em disco
const MAX_LADO = 8000

export function nomeAleatorio(ext) {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return `${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')}${ext}`
}

export function tipoImagem(buffer) {
  if (!buffer || buffer.length < 12) return ''
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpeg'
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'png'
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  const inicio = buffer.subarray(0, Math.min(200, buffer.length)).toString('utf8').trimStart().toLowerCase()
  if (inicio.startsWith('<svg') || inicio.startsWith('<?xml')) return 'svg'
  return ''
}

export function tipoVideo(buffer) {
  if (!buffer || buffer.length < 12) return ''
  if (buffer.toString('ascii', 4, 8) === 'ftyp') return 'mp4'
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) return 'webm'
  return ''
}

export function sanitizarSvg(texto) {
  const cru = String(texto || '')
  if (cru.length > 500000) return ''
  if (!/<svg[\s>]/i.test(cru)) return ''
  if (/<!entity|<!doctype|foreignobject|<script|javascript:|data:text\/html|\son[a-z]+\s*=/i.test(cru)) return ''
  const limpo = cru
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
  if (/<script|on[a-z]+\s*=|javascript:/i.test(limpo)) return ''
  return limpo
}

function dimensoes(buffer, tipo) {
  if (tipo === 'png' && buffer.length >= 24) return { largura: buffer.readUInt32BE(16), altura: buffer.readUInt32BE(20) }
  if (tipo === 'jpeg') {
    let i = 2
    while (i < buffer.length - 8) {
      if (buffer[i] !== 0xff) { i += 1; continue }
      const marca = buffer[i + 1]
      const tam = buffer.readUInt16BE(i + 2)
      if (marca >= 0xc0 && marca <= 0xc3) return { altura: buffer.readUInt16BE(i + 5), largura: buffer.readUInt16BE(i + 7) }
      if (tam < 2) break
      i += 2 + tam
    }
  }
  return { largura: 0, altura: 0 }
}

export async function processarImagemNuvem(buffer, limite) {
  if (buffer.length > limite) return { erro: 'grande' }
  const tipo = tipoImagem(buffer)
  if (!tipo) return { erro: 'formato' }
  if (tipo === 'svg') {
    const limpo = sanitizarSvg(buffer.toString('utf8'))
    if (!limpo) return { erro: 'formato' }
    return { ext: '.svg', tipo: 'image/svg+xml', buffer: Buffer.from(limpo), largura: 0, altura: 0 }
  }
  const bruto = dimensoes(buffer, tipo)
  if ((bruto.largura || 0) > MAX_LADO || (bruto.altura || 0) > MAX_LADO) return { erro: 'formato' }
  const ext = tipo === 'jpeg' ? '.jpg' : `.${tipo}`
  return { ext, tipo: `image/${tipo === 'jpeg' ? 'jpeg' : tipo}`, buffer, ...bruto }
}

export function validarVideoNuvem(buffer, limite) {
  if (buffer.length > limite) return { erro: 'grande' }
  const tipo = tipoVideo(buffer)
  if (!tipo) return { erro: 'formato' }
  return { ext: tipo === 'mp4' ? '.mp4' : '.webm', tipo: tipo === 'mp4' ? 'video/mp4' : 'video/webm' }
}
