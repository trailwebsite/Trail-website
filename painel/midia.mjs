// midia — valida o arquivo pelo conteúdo, reprocessa imagem e guarda com nome aleatório
import crypto from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { usoDeArquivo } from './banco.mjs'

const MAX_LADO = 8000
const LADO_SAIDA = 2400

export function nomeAleatorio(ext) {
  return `${crypto.randomBytes(16).toString('hex')}${ext}`
}

export function tipoImagem(buffer) {
  if (!buffer || buffer.length < 12) return ''
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpeg'
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'png'
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  const inicio = buffer.subarray(0, 200).toString('utf8').trimStart().toLowerCase()
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
  if (tipo === 'png' && buffer.length >= 24) {
    return { largura: buffer.readUInt32BE(16), altura: buffer.readUInt32BE(20) }
  }
  if (tipo === 'jpeg') {
    let i = 2
    while (i < buffer.length - 8) {
      if (buffer[i] !== 0xff) { i += 1; continue }
      const marca = buffer[i + 1]
      const tam = buffer.readUInt16BE(i + 2)
      if (marca >= 0xc0 && marca <= 0xc3) {
        return { altura: buffer.readUInt16BE(i + 5), largura: buffer.readUInt16BE(i + 7) }
      }
      if (tam < 2) break
      i += 2 + tam
    }
  }
  return { largura: 0, altura: 0 }
}

async function sharpOuNull() {
  if (process.env.PAINEL_SHARP === '0') return null
  try {
    const mod = await import('sharp')
    return mod.default
  } catch {
    return null
  }
}

export async function processarImagem(buffer, limite) {
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
  const sharp = await sharpOuNull()
  if (!sharp) {
    const ext = tipo === 'jpeg' ? '.jpg' : `.${tipo}`
    return { ext, tipo: `image/${tipo === 'jpeg' ? 'jpeg' : tipo}`, buffer, ...bruto }
  }
  try {
    const saida = await sharp(buffer, { failOn: 'error', limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: LADO_SAIDA, height: LADO_SAIDA, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()
    const meta = await sharp(saida).metadata()
    return { ext: '.webp', tipo: 'image/webp', buffer: saida, largura: meta.width || 0, altura: meta.height || 0 }
  } catch {
    return { erro: 'formato' }
  }
}

export function validarVideo(buffer, limite) {
  if (buffer.length > limite) return { erro: 'grande' }
  const tipo = tipoVideo(buffer)
  if (!tipo) return { erro: 'formato' }
  return { ext: tipo === 'mp4' ? '.mp4' : '.webm', tipo: tipo === 'mp4' ? 'video/mp4' : 'video/webm' }
}

export function gravarMidia(pasta, ext, buffer) {
  mkdirSync(pasta, { recursive: true })
  const nome = nomeAleatorio(ext)
  writeFileSync(join(pasta, nome), buffer)
  return `/midia/${nome}`
}

export function apagarOrfao(db, pasta, src) {
  if (!src || !src.startsWith('/midia/')) return
  if (usoDeArquivo(db, src) > 0) return
  const nome = src.slice('/midia/'.length)
  if (!/^[\da-f]{32}\.[a-z0-9]+$/.test(nome)) return
  rmSync(join(pasta, nome), { force: true })
}

export function lerParte(pasta, id, indice) {
  return readFileSync(join(pasta, id, String(indice)))
}
