// trocar-email.mjs — troca o e-mail do único dono; só roda no servidor, não tem página
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { abrirBanco, trocarEmailDono, temDono } from './banco.mjs'
import { emailValido } from './sanitizar.mjs'

const email = emailValido(process.argv[2] || '')
if (!email) {
  console.error('Uso: node painel/trocar-email.mjs novo@email.com')
  process.exit(1)
}
const db = abrirBanco(resolve(fileURLToPath(new URL('.', import.meta.url)), 'dados.sqlite'))
if (!temDono(db)) {
  console.error('Ainda não existe dono.')
  process.exit(1)
}
trocarEmailDono(db, email)
console.log('E-mail do dono atualizado. As sessões foram encerradas.')
