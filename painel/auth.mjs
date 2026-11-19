// auth — senha, sessão, código de uso único e bloqueio por tentativas
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'

export function rodadas() {
  const n = Number(process.env.BCRYPT_ROUNDS || 12)
  return n >= 4 && n <= 14 ? n : 12
}

let falso
function hashFalso() {
  if (!falso) falso = bcrypt.hashSync('painel-enchimento-nao-e-senha', rodadas())
  return falso
}

export function hashSenha(senha) {
  return bcrypt.hash(senha, rodadas())
}

function emailsIguais(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

// compara sempre um hash, mesmo quando o e-mail não é o do dono
export async function senhaConfere(dono, email, senha) {
  const hash = dono ? dono.senha_hash : hashFalso()
  const ok = await bcrypt.compare(String(senha ?? ''), hash)
  if (!dono || !ok) return false
  return emailsIguais(dono.email, email)
}

export function hashOpaco(valor, segredo) {
  return crypto.createHash('sha256').update(String(segredo)).update('\0').update(String(valor)).digest('hex')
}

export function criarSessao(db, tipo, segredo, duracaoMs) {
  const token = crypto.randomBytes(32).toString('base64url')
  const csrf = crypto.randomBytes(24).toString('base64url')
  const agora = Date.now()
  if (tipo === 'plena') db.prepare(`DELETE FROM sessao WHERE tipo = 'plena'`).run()
  if (tipo === 'pendente') db.prepare(`DELETE FROM sessao WHERE tipo = 'pendente'`).run()
  db.prepare('INSERT INTO sessao (token_hash, tipo, csrf, expira, criada) VALUES (?, ?, ?, ?, ?)')
    .run(hashOpaco(token, segredo), tipo, csrf, agora + duracaoMs, agora)
  return { token, csrf, expira: agora + duracaoMs }
}

export function lerSessao(db, token, segredo, tipo) {
  if (!token || !segredo) return null
  const row = db.prepare('SELECT * FROM sessao WHERE token_hash = ? AND tipo = ?').get(hashOpaco(token, segredo), tipo)
  if (!row || row.expira < Date.now()) return null
  return row
}

export function apagarSessao(db, token, segredo, tipo) {
  if (!token) return
  db.prepare('DELETE FROM sessao WHERE token_hash = ? AND tipo = ?').run(hashOpaco(token, segredo), tipo)
}

export function emitirCodigo(db, proposito, codigo, segredo, expira) {
  db.prepare('UPDATE codigo SET usado = 1 WHERE proposito = ? AND usado = 0').run(proposito)
  db.prepare('INSERT INTO codigo (proposito, codigo_hash, expira, usado) VALUES (?, ?, ?, 0)')
    .run(proposito, hashOpaco(codigo, segredo), expira)
}

export function codigoVigente(db, proposito, codigo, segredo, agora = Date.now()) {
  const row = db.prepare(`SELECT id FROM codigo
    WHERE proposito = ? AND codigo_hash = ? AND usado = 0 AND expira > ?
    ORDER BY id DESC LIMIT 1`).get(proposito, hashOpaco(codigo, segredo), agora)
  return !!row
}

export function consumirCodigo(db, proposito, codigo, segredo, agora = Date.now()) {
  const row = db.prepare(`SELECT id FROM codigo
    WHERE proposito = ? AND codigo_hash = ? AND usado = 0 AND expira > ?
    ORDER BY id DESC LIMIT 1`).get(proposito, hashOpaco(codigo, segredo), agora)
  if (!row) return false
  const r = db.prepare('UPDATE codigo SET usado = 1 WHERE id = ? AND usado = 0').run(row.id)
  return r.changes === 1
}

export function tokenUrl() {
  return crypto.randomBytes(32).toString('base64url')
}

const JANELA = 15 * 60 * 1000
const BLOQUEIO = 15 * 60 * 1000
const MAXIMO = 5

export function estaBloqueado(db, chave, agora = Date.now()) {
  const row = db.prepare('SELECT bloqueado_ate FROM limite WHERE chave = ?').get(chave)
  return !!(row && row.bloqueado_ate > agora)
}

export function registrarFalha(db, chave, agora = Date.now()) {
  const row = db.prepare('SELECT * FROM limite WHERE chave = ?').get(chave)
  if (!row || agora - row.janela > JANELA) {
    db.prepare(`INSERT INTO limite (chave, falhas, janela, bloqueado_ate) VALUES (?, 1, ?, 0)
      ON CONFLICT(chave) DO UPDATE SET falhas = 1, janela = excluded.janela, bloqueado_ate = 0`).run(chave, agora)
    return false
  }
  const falhas = row.falhas + 1
  const ate = falhas >= MAXIMO ? agora + BLOQUEIO : 0
  db.prepare('UPDATE limite SET falhas = ?, bloqueado_ate = ? WHERE chave = ?').run(falhas, ate, chave)
  return ate > agora
}

export function zerarFalhas(db, chave) {
  db.prepare('DELETE FROM limite WHERE chave = ?').run(chave)
}
