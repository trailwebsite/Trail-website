// blake3 — BLAKE3-256 em JS puro; mesmo hash que o Wrangler usa no manifesto do Pages
const IV = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19])
const PERMUTA = [2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8]
const INICIO_CHUNK = 1
const FIM_CHUNK = 2
const PAI = 4
const RAIZ = 8

function g(v, a, b, c, d, mx, my) {
  v[a] = v[a] + v[b] + mx
  v[d] = ((v[d] ^ v[a]) >>> 16) | ((v[d] ^ v[a]) << 16)
  v[c] = v[c] + v[d]
  v[b] = ((v[b] ^ v[c]) >>> 12) | ((v[b] ^ v[c]) << 20)
  v[a] = v[a] + v[b] + my
  v[d] = ((v[d] ^ v[a]) >>> 8) | ((v[d] ^ v[a]) << 24)
  v[c] = v[c] + v[d]
  v[b] = ((v[b] ^ v[c]) >>> 7) | ((v[b] ^ v[c]) << 25)
}

function comprimir(cv, bloco, contador, tamanho, flags) {
  const v = new Uint32Array(16)
  for (let i = 0; i < 8; i++) v[i] = cv[i]
  for (let i = 0; i < 4; i++) v[8 + i] = IV[i]
  v[12] = contador >>> 0
  v[13] = Math.floor(contador / 4294967296)
  v[14] = tamanho
  v[15] = flags
  let m = bloco
  for (let r = 0; r < 7; r++) {
    g(v, 0, 4, 8, 12, m[0], m[1])
    g(v, 1, 5, 9, 13, m[2], m[3])
    g(v, 2, 6, 10, 14, m[4], m[5])
    g(v, 3, 7, 11, 15, m[6], m[7])
    g(v, 0, 5, 10, 15, m[8], m[9])
    g(v, 1, 6, 11, 12, m[10], m[11])
    g(v, 2, 7, 8, 13, m[12], m[13])
    g(v, 3, 4, 9, 14, m[14], m[15])
    if (r < 6) {
      const n = new Uint32Array(16)
      for (let i = 0; i < 16; i++) n[i] = m[PERMUTA[i]]
      m = n
    }
  }
  const saida = new Uint32Array(16)
  for (let i = 0; i < 8; i++) {
    saida[i] = v[i] ^ v[i + 8]
    saida[i + 8] = v[i + 8] ^ cv[i]
  }
  return saida
}

function palavrasLE(bytes) {
  const palavras = new Uint32Array(16)
  for (let i = 0; i < bytes.length; i++) palavras[i >> 2] |= bytes[i] << ((i & 3) * 8)
  return palavras
}

function cvPai(esquerda, direita) {
  const bloco = new Uint32Array(16)
  for (let i = 0; i < 8; i++) {
    bloco[i] = esquerda[i]
    bloco[8 + i] = direita[i]
  }
  return comprimir(IV, bloco, 0, 64, PAI).subarray(0, 8)
}

// blake3Hex — hash BLAKE3-256 de um Uint8Array, em hexadecimal
export function blake3Hex(dados) {
  const n = dados.length
  const numChunks = Math.max(1, Math.ceil(n / 1024))
  const pilha = []
  let pendente = null
  for (let c = 0; c < numChunks; c++) {
    const pedaco = dados.subarray(c * 1024, Math.min((c + 1) * 1024, n))
    const blocos = Math.max(1, Math.ceil(pedaco.length / 64))
    let cv = IV
    for (let b = 0; b < blocos; b++) {
      const bb = pedaco.subarray(b * 64, Math.min((b + 1) * 64, pedaco.length))
      const palavras = palavrasLE(bb)
      const flags = (b === 0 ? INICIO_CHUNK : 0) | (b === blocos - 1 ? FIM_CHUNK : 0)
      if (c === numChunks - 1 && b === blocos - 1) {
        pendente = { cv, palavras, contador: c, tamanho: bb.length, flags }
        break
      }
      cv = comprimir(cv, palavras, c, bb.length, flags).subarray(0, 8)
    }
    if (c < numChunks - 1) {
      let total = c + 1
      while ((total & 1) === 0) {
        cv = cvPai(pilha.pop(), cv)
        total >>= 1
      }
      pilha.push(cv)
    }
  }
  while (pilha.length) {
    const cv = comprimir(pendente.cv, pendente.palavras, pendente.contador, pendente.tamanho, pendente.flags).subarray(0, 8)
    const esquerda = pilha.pop()
    const bloco = new Uint32Array(16)
    for (let i = 0; i < 8; i++) {
      bloco[i] = esquerda[i]
      bloco[8 + i] = cv[i]
    }
    pendente = { cv: IV, palavras: bloco, contador: 0, tamanho: 64, flags: PAI }
  }
  const raiz = comprimir(pendente.cv, pendente.palavras, 0, pendente.tamanho, pendente.flags | RAIZ)
  let hex = ''
  for (let i = 0; i < 8; i++) {
    const w = raiz[i]
    hex += (w & 0xff).toString(16).padStart(2, '0')
      + ((w >>> 8) & 0xff).toString(16).padStart(2, '0')
      + ((w >>> 16) & 0xff).toString(16).padStart(2, '0')
      + ((w >>> 24) & 0xff).toString(16).padStart(2, '0')
  }
  return hex
}

// hashArquivoPages — o hash de manifesto do Pages: BLAKE3 de base64(conteúdo)+extensão, 32 hex
export function hashArquivoPages(conteudo, extensao) {
  const base64 = Buffer.from(conteudo).toString('base64')
  const bytes = new TextEncoder().encode(base64 + extensao)
  return blake3Hex(bytes).slice(0, 32)
}
