// chave.mjs — senha com PBKDF2, funciona no Node e no Worker
const ITER = 100000

function b64(bytes) {
  let s = ''
  const lista = new Uint8Array(bytes)
  for (const b of lista) s += String.fromCharCode(b)
  return btoa(s)
}

function deB64(texto) {
  const bin = atob(texto)
  const saida = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) saida[i] = bin.charCodeAt(i)
  return saida
}

async function derivar(senha, salt, iter) {
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(senha)), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, chave, 256)
  return new Uint8Array(bits)
}

export async function hashSenhaNuvem(senha) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const bits = await derivar(senha, salt, ITER)
  return `pbkdf2$${ITER}$${b64(salt)}$${b64(bits)}`
}

export async function senhaConfereHash(senha, hash) {
  const partes = String(hash || '').split('$')
  if (partes[0] !== 'pbkdf2' || partes.length !== 4) return false
  const iter = Number(partes[1])
  if (!iter) return false
  const bits = await derivar(senha, deB64(partes[2]), iter)
  const esperado = deB64(partes[3])
  if (bits.length !== esperado.length) return false
  let diff = 0
  for (let i = 0; i < bits.length; i++) diff |= bits[i] ^ esperado[i]
  return diff === 0
}
