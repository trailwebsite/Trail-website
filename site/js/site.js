// site.js — comportamento acessível: menu móvel, seletor de idioma e envio do formulário de voluntariado
(() => {
  'use strict'

  // disclosure — botão com aria-expanded que abre/fecha um painel; Escape fecha e devolve o foco
  function disclosure(botao, painel, { abrir, fechar }) {
    if (!botao || !painel) return
    const raiz = botao.parentElement
    let aberto = false

    const definir = (estado) => {
      aberto = estado
      botao.setAttribute('aria-expanded', String(estado))
      if (estado) abrir(painel)
      else fechar(painel)
    }

    botao.addEventListener('click', () => definir(!aberto))

    raiz.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape' && aberto) {
        evento.preventDefault()
        definir(false)
        botao.focus()
      }
    })

    // foco saiu do componente: fecha sem mover o foco, para não prender ninguém
    raiz.addEventListener('focusout', (evento) => {
      if (aberto && evento.relatedTarget && !raiz.contains(evento.relatedTarget)) definir(false)
    })

    document.addEventListener('click', (evento) => {
      if (aberto && !raiz.contains(evento.target)) definir(false)
    })

    definir(false)
  }

  disclosure(document.querySelector('.menu-botao'), document.getElementById('menu-principal'), {
    abrir: (lista) => lista.classList.add('aberto'),
    fechar: (lista) => lista.classList.remove('aberto'),
  })

  disclosure(document.querySelector('.idioma-botao'), document.getElementById('lista-idiomas'), {
    abrir: (lista) => { lista.hidden = false },
    fechar: (lista) => { lista.hidden = true },
  })

  // formulário — validação com mensagens próprias, foco no primeiro erro e envio por fetch ao Formspree
  const form = document.getElementById('form-voluntario')
  if (!form) return

  const alerta = document.getElementById('form-alerta')
  const estado = document.getElementById('form-estado')
  const botaoEnviar = form.querySelector('.botao')
  const rotuloEnviar = botaoEnviar.textContent
  const msg = form.dataset
  form.noValidate = true

  const campos = () => Array.from(form.querySelectorAll('[required]'))

  function marcarErro(campo, texto) {
    const caixa = document.getElementById(`${campo.id}-erro`)
    campo.setAttribute('aria-invalid', 'true')
    if (caixa) {
      caixa.textContent = texto
      caixa.hidden = false
    }
  }

  function limparErro(campo) {
    const caixa = document.getElementById(`${campo.id}-erro`)
    campo.removeAttribute('aria-invalid')
    if (caixa) {
      caixa.textContent = ''
      caixa.hidden = true
    }
  }

  function validar() {
    const comErro = []
    for (const campo of campos()) {
      limparErro(campo)
      const valor = campo.value.trim()
      if (!valor) {
        marcarErro(campo, msg.msgRequired)
        comErro.push(campo)
      } else if (campo.type === 'email' && campo.validity.typeMismatch) {
        marcarErro(campo, msg.msgEmail)
        comErro.push(campo)
      }
    }
    return comErro
  }

  function mostrarAlerta(texto) {
    alerta.textContent = texto
    alerta.hidden = false
  }

  function esconderAlerta() {
    alerta.textContent = ''
    alerta.hidden = true
  }

  function mostrarEstado(texto) {
    estado.textContent = texto
    estado.hidden = false
  }

  for (const campo of campos()) {
    campo.addEventListener('input', () => {
      if (campo.getAttribute('aria-invalid') === 'true') limparErro(campo)
    })
  }

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault()
    esconderAlerta()

    const comErro = validar()
    if (comErro.length) {
      mostrarAlerta(msg.msgSummary)
      comErro[0].focus()
      return
    }

    botaoEnviar.disabled = true
    botaoEnviar.textContent = msg.msgSending
    mostrarEstado(msg.msgSending)

    try {
      const resposta = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
      form.hidden = true
      mostrarEstado(msg.msgSuccess)
      estado.focus()
    } catch {
      estado.hidden = true
      mostrarAlerta(msg.msgNetwork)
      alerta.focus()
      botaoEnviar.disabled = false
      botaoEnviar.textContent = rotuloEnviar
    }
  })
})()
