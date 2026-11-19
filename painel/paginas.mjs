// paginas — telas de acesso do dono, em inglês simples, sem script inline
import { escapar } from './sanitizar.mjs'

function casca(titulo, corpo) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${escapar(titulo)}</title>
  <link rel="stylesheet" href="/panel/acesso.css">
</head>
<body>
  <main>
    <h1>${escapar(titulo)}</h1>
    ${corpo}
  </main>
</body>
</html>`
}

function alerta(texto) {
  if (!texto) return ''
  return `<p class="erro" role="alert">${escapar(texto)}</p>`
}

export function paginaRegistro(csrf, erro) {
  return casca('Create access', `
    <p>This page is used once. The email you save will be the only one that can edit the site.</p>
    ${alerta(erro)}
    <form method="post">
      <input type="hidden" name="csrf" value="${escapar(csrf)}">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="username" required>
      <label for="senha">Password (at least 12 characters)</label>
      <input id="senha" name="senha" type="password" autocomplete="new-password" minlength="12" required>
      <label for="senha2">Repeat the password</label>
      <input id="senha2" name="senha2" type="password" autocomplete="new-password" minlength="12" required>
      <button type="submit">Save access</button>
    </form>`)
}

export function paginaLogin(csrf, erro) {
  return casca('Sign in to edit', `
    <p>Sign in with the email and password from registration. It works on any computer.</p>
    ${alerta(erro)}
    <form method="post" action="/panel/login">
      <input type="hidden" name="csrf" value="${escapar(csrf)}">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="username" required>
      <label for="senha">Password</label>
      <input id="senha" name="senha" type="password" autocomplete="current-password" required>
      <button type="submit">Sign in</button>
    </form>
    <p><a href="/panel/olvide">I forgot my password</a></p>`)
}

export function paginaOlvide(csrf, aviso) {
  return casca('New password', `
    ${aviso ? `<p role="status">${escapar(aviso)}</p>` : '<p>Enter the owner email. If it matches, we send a link.</p>'}
    <form method="post" action="/panel/olvide">
      <input type="hidden" name="csrf" value="${escapar(csrf)}">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="username" required>
      <button type="submit">Send link</button>
    </form>`)
}

export function paginaNovaSenha(csrf, erro) {
  return casca('Choose a password', `
    ${alerta(erro)}
    <form method="post">
      <input type="hidden" name="csrf" value="${escapar(csrf)}">
      <label for="senha">New password (at least 12 characters)</label>
      <input id="senha" name="senha" type="password" autocomplete="new-password" minlength="12" required>
      <label for="senha2">Repeat the password</label>
      <input id="senha2" name="senha2" type="password" autocomplete="new-password" minlength="12" required>
      <button type="submit">Save</button>
    </form>`)
}

export function paginaLinkMorto() {
  return casca('Link expired', `<p>This link no longer works. Ask for another one from the sign-in page.</p><p><a href="/panel/login">Back</a></p>`)
}
