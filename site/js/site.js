// site.js — comportamento acessível: menu, idioma, caixas que abrem e fecham, formulário de voluntariado e escolha de doação
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

  // caixas — só uma aberta por página; sem JS ficam todas abertas, aqui fechamos e ligamos os botões
  const botoesCaixa = Array.from(document.querySelectorAll('.caixa-botao'))

  function definirCaixa(botao, aberta) {
    botao.setAttribute('aria-expanded', String(aberta))
    const painel = document.getElementById(botao.getAttribute('aria-controls'))
    if (painel) painel.hidden = !aberta
  }

  for (const botao of botoesCaixa) {
    definirCaixa(botao, false)
    botao.addEventListener('click', () => {
      const abrir = botao.getAttribute('aria-expanded') !== 'true'
      // guarda onde o botão está na tela: se uma caixa acima fechar, corrige a rolagem e o botão não pula
      const antes = botao.getBoundingClientRect().top
      for (const outro of botoesCaixa) if (outro !== botao) definirCaixa(outro, false)
      definirCaixa(botao, abrir)
      const desvio = botao.getBoundingClientRect().top - antes
      if (desvio) window.scrollBy(0, desvio)
    })
  }

  // erros de campo — mensagem ligada por aria-describedby ao elemento `${id}-erro`
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

  // formulário de voluntariado — validação própria, foco no primeiro erro e envio por fetch ao Formspree
  function voluntariado() {
    const form = document.getElementById('form-voluntario')
    if (!form) return

    const alerta = document.getElementById('form-alerta')
    const estado = document.getElementById('form-estado')
    const botaoEnviar = form.querySelector('.botao')
    const rotuloEnviar = botaoEnviar.textContent
    const msg = form.dataset
    form.noValidate = true

    const campos = () => Array.from(form.querySelectorAll('[required]'))

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

      // Formspree ainda não confirmado: nada sai daqui
      if (msg.ativo !== 'true') {
        mostrarAlerta(msg.msgInactive)
        alerta.focus()
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
  }

  // escolha de doação — mostra nome/valor conforme a opção; o controle do PayPal só aparece com o formulário válido
  function doacao() {
    const form = document.getElementById('form-doacao')
    if (!form) return

    const msg = form.dataset
    const opcoes = Array.from(form.querySelectorAll('input[name="publish"]'))
    const nome = document.getElementById('d-nome')
    const valor = document.getElementById('d-valor')
    const paypal = document.getElementById('paypal')
    form.noValidate = true

    const escolha = () => (opcoes.find((o) => o.checked) || {}).value || ''

    // campo fora da escolha fica escondido e desativado: não aparece nem viaja no envio
    function mostrarCampo(campo, mostrar) {
      campo.closest('.campo').hidden = !mostrar
      campo.required = mostrar
      campo.disabled = !mostrar
      if (!mostrar) limparErro(campo)
    }

    function valido() {
      const e = escolha()
      if (!e) return false
      if (nome.required && !nome.value.trim()) return false
      if (valor.required && !valor.value.trim()) return false
      return true
    }

    function atualizar() {
      const e = escolha()
      mostrarCampo(nome, e === 'name' || e === 'both')
      mostrarCampo(valor, e === 'amount' || e === 'both')
      paypal.hidden = !valido()
    }

    // registra a escolha no Formspree; sem ID, não há para onde mandar
    function registrarEscolha() {
      if (!msg.formspree) return
      fetch(`https://formspree.io/f/${msg.formspree}`, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        keepalive: true,
      }).catch(() => {})
    }

    // controle do PayPal: sem link, botão desativado e sem destino; com link, abre em nova aba e registra a escolha antes
    function montarPaypal() {
      if (!msg.paypal) {
        const botao = document.createElement('button')
        botao.type = 'button'
        botao.className = 'botao'
        botao.setAttribute('aria-disabled', 'true')
        botao.textContent = msg.msgPaypal
        paypal.append(botao)
        return
      }
      const link = document.createElement('a')
      link.className = 'botao'
      link.href = msg.paypal
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.textContent = `${msg.msgPaypal} `
      const externo = document.createElement('span')
      externo.className = 'externo'
      externo.textContent = msg.msgExternal
      link.append(externo)
      link.addEventListener('click', registrarEscolha)
      paypal.append(link)
    }

    for (const opcao of opcoes) opcao.addEventListener('change', atualizar)
    for (const campo of [nome, valor]) {
      campo.addEventListener('input', () => {
        if (campo.getAttribute('aria-invalid') === 'true') limparErro(campo)
        paypal.hidden = !valido()
      })
      campo.addEventListener('blur', () => {
        if (campo.required && !campo.value.trim()) marcarErro(campo, msg.msgRequired)
      })
    }

    // sem botão de envio próprio: Enter num campo não manda nada
    form.addEventListener('submit', (evento) => evento.preventDefault())

    montarPaypal()
    atualizar()
  }

  voluntariado()
  doacao()
})()
