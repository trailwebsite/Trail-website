// correio — manda o código e o link de senha só para o e-mail do dono
import nodemailer from 'nodemailer'

let substituto = null

export function definirEnvio(fn) {
  substituto = fn
}

async function enviarSmtp(email, assunto, texto) {
  const host = process.env.SMTP_HOST
  if (!host || !process.env.SMTP_FROM) return false
  const transporte = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SEGURO === '1',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' } : undefined,
  })
  await transporte.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: assunto,
    text: texto,
  })
  return true
}

export async function enviarAoDono(email, assunto, texto) {
  if (substituto) return substituto(email, assunto, texto)
  if (process.env.RESEND_API_KEY && process.env.SMTP_FROM) {
    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.SMTP_FROM, to: [email], subject: assunto, text: texto }),
    })
    return resposta.ok
  }
  return enviarSmtp(email, assunto, texto).catch(() => false)
}

export function correioConfigurado() {
  return !!(process.env.SMTP_HOST || process.env.RESEND_API_KEY || substituto)
}
