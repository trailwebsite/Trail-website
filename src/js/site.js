// site.js — comportamento acessível: menu, submenus, idioma, caixas, galeria, voluntariado, doação e cópia das contas
;(async () => {
  'use strict'

  // página original — o cookie continua, mas esta aba não volta para o editor
  const verOriginal = new URLSearchParams(location.search).get('painel') === 'ver'
  if (verOriginal) {
    document.addEventListener('click', (evento) => {
      const link = evento.target.closest?.('a[href]')
      if (!link || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
      let url
      try { url = new URL(link.getAttribute('href'), location.href) } catch { return }
      if (url.origin !== location.origin) return
      if (url.pathname.startsWith('/panel') || url.pathname.startsWith('/interno')) return
      url.searchParams.set('painel', 'ver')
      evento.preventDefault()
      if (link.target === '_blank') window.open(url.href, '_blank', 'noopener')
      else location.href = url.href
    }, true)
  }

  // editor — só carrega se o login deixou o cookie; o visitante segue sem o painel
  const csrfPainel = (document.cookie.match(/(?:^|; )painel_csrf=([^;]*)/) || [])[1]
  if (!verOriginal && csrfPainel) {
    try {
      const resposta = await fetch('/panel/api/replica?caminho=' + encodeURIComponent(location.pathname), { credentials: 'same-origin' })
      if (resposta.ok) {
        const doc = new DOMParser().parseFromString(await resposta.text(), 'text/html')
        if (doc.body) document.body.innerHTML = doc.body.innerHTML
        if (doc.title) document.title = doc.title
      }
    } catch { /* sem a cópia, o editor abre em cima do que já está publicado */ }
  }
  if (!verOriginal && csrfPainel && !document.querySelector('meta[name="painel-csrf"]')) {
    const meta = document.createElement('meta')
    meta.name = 'painel-csrf'
    meta.content = decodeURIComponent(csrfPainel)
    document.head.appendChild(meta)
    const estilo = document.createElement('link')
    estilo.rel = 'stylesheet'
    estilo.href = '/panel/editor.css'
    document.head.appendChild(estilo)
    const codigo = document.createElement('script')
    codigo.src = '/panel/editor.js'
    document.body.appendChild(codigo)
  }

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

  // submenus da barra — no computador o ponteiro abre; no toque, o toque na opção abre e só fecha no toque de novo ou fora
  function submenus() {
    const itens = Array.from(document.querySelectorAll('.tem-menu'))
    if (!itens.length) return
    const hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    function sincronizar(item) {
      const botao = item.querySelector('.submenu-botao')
      const visivel = item.classList.contains('aberto')
        || (hover && (item.contains(document.activeElement) || item.matches(':hover')))
      botao.setAttribute('aria-expanded', String(visivel))
      const link = item.querySelector(':scope > a')
      if (!hover && link) link.setAttribute('aria-expanded', String(visivel))
    }

    function alternar(item) {
      const abrir = !item.classList.contains('aberto')
      for (const outro of itens) outro.classList.remove('aberto')
      item.classList.toggle('aberto', abrir)
      for (const outro of itens) sincronizar(outro)
    }

    for (const item of itens) {
      const botao = item.querySelector('.submenu-botao')
      const link = item.querySelector(':scope > a')
      const lista = item.querySelector('.submenu')
      sincronizar(item)

      // no toque, a palavra abre a caixa; o link da página já está dentro, então não duplica
      if (!hover && link && lista) {
        const href = link.getAttribute('href')
        if (!lista.querySelector(`a[href="${href}"]`)) {
          const copia = link.cloneNode(true)
          copia.classList.remove('maiusculas')
          copia.removeAttribute('aria-expanded')
          const embrulho = document.createElement('li')
          embrulho.append(copia)
          lista.prepend(embrulho)
        }
        link.setAttribute('role', 'button')
        link.addEventListener('click', (evento) => {
          evento.preventDefault()
          alternar(item)
        })
      }

      botao.addEventListener('click', () => alternar(item))

      item.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
          evento.preventDefault()
          item.classList.remove('aberto')
          sincronizar(item)
          botao.focus()
        }
      })

      if (hover) {
        item.addEventListener('focusout', (evento) => {
          if (evento.relatedTarget && !item.contains(evento.relatedTarget)) {
            item.classList.remove('aberto')
            sincronizar(item)
          }
        })
        item.addEventListener('focusin', () => {
          for (const outro of itens) if (outro !== item) outro.classList.remove('aberto')
          for (const outro of itens) sincronizar(outro)
        })
        item.addEventListener('mouseenter', () => {
          for (const outro of itens) if (outro !== item) outro.classList.remove('aberto')
          for (const outro of itens) sincronizar(outro)
        })
        item.addEventListener('mouseleave', () => sincronizar(item))
      }
    }

    document.addEventListener('click', (evento) => {
      for (const item of itens) {
        if (!item.contains(evento.target)) item.classList.remove('aberto')
        sincronizar(item)
      }
    })
  }

  // caixas — só uma aberta por página; data-aberta deixa essa começar aberta
  const botoesCaixa = Array.from(document.querySelectorAll('.caixa-botao'))

  function definirCaixa(botao, aberta) {
    botao.setAttribute('aria-expanded', String(aberta))
    const painel = document.getElementById(botao.getAttribute('aria-controls'))
    if (painel) painel.hidden = !aberta
  }

  for (const botao of botoesCaixa) {
    definirCaixa(botao, botao.hasAttribute('data-aberta'))
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

  // resposta do FormSubmit: success vem como texto "true" ou "false"; ativação ainda não clicada não é sucesso
  async function envioAceito(resposta) {
    const dados = await resposta.json().catch(() => null)
    const ok = dados && (dados.success === true || dados.success === 'true')
    if (!resposta.ok || !ok) {
      const texto = dados && dados.message ? String(dados.message) : ''
      const erro = new Error(texto || `HTTP ${resposta.status}`)
      erro.ativar = /activat/i.test(texto)
      throw erro
    }
  }

  // formulário de voluntariado — validação própria, foco no primeiro erro e envio ao Gmail de recepção
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
        await envioAceito(resposta)
        form.hidden = true
        mostrarEstado(msg.msgSuccess)
        estado.focus()
      } catch (erro) {
        estado.hidden = true
        mostrarAlerta(erro && erro.ativar ? msg.msgActivate : msg.msgNetwork)
        alerta.focus()
        botaoEnviar.disabled = false
        botaoEnviar.textContent = rotuloEnviar
      }
    })
  }

  // doação — coleta os dados e envia ao Gmail; as contas já estão na página
  function doacao() {
    const form = document.getElementById('form-doacao')
    if (!form) return

    const alerta = document.getElementById('form-doacao-alerta')
    const estado = document.getElementById('form-doacao-estado')
    const contas = document.getElementById('contas-doacao')
    const tituloContas = document.getElementById('contas-titulo')
    const botaoEnviar = form.querySelector('.botao')
    const rotuloEnviar = botaoEnviar.textContent
    const msg = form.dataset
    const opcoes = Array.from(form.querySelectorAll('input[name="publish"]'))
    const escolhaErro = document.getElementById('d-escolha-erro')
    const campos = () => Array.from(form.querySelectorAll('#d-nome, #d-pais, #d-data, #d-valor'))
    form.noValidate = true

    function limparEscolha() {
      escolhaErro.textContent = ''
      escolhaErro.hidden = true
      for (const opcao of opcoes) opcao.removeAttribute('aria-invalid')
    }

    function marcarEscolha() {
      escolhaErro.textContent = msg.msgRequired
      escolhaErro.hidden = false
      for (const opcao of opcoes) opcao.setAttribute('aria-invalid', 'true')
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

    function validar() {
      const comErro = []
      limparEscolha()
      for (const campo of campos()) {
        limparErro(campo)
        if (!campo.value.trim()) {
          marcarErro(campo, msg.msgRequired)
          comErro.push(campo)
        } else if (campo.type === 'date' && campo.validity.badInput) {
          marcarErro(campo, msg.msgDate)
          comErro.push(campo)
        }
      }
      if (!opcoes.some((opcao) => opcao.checked)) {
        marcarEscolha()
        comErro.push(opcoes[0])
      }
      return comErro
    }

    for (const opcao of opcoes) {
      opcao.addEventListener('change', () => { if (opcao.checked) limparEscolha() })
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
        await envioAceito(resposta)
        form.hidden = true
        contas.hidden = false
        mostrarEstado(msg.msgSuccess)
        tituloContas.focus()
      } catch (erro) {
        estado.hidden = true
        mostrarAlerta(erro && erro.ativar ? msg.msgActivate : msg.msgNetwork)
        alerta.focus()
        botaoEnviar.disabled = false
        botaoEnviar.textContent = rotuloEnviar
      }
    })
  }

  // contas — o clique copia o número; se a área de transferência falhar, o número continua no botão
  function copiarContas() {
    const raiz = document.getElementById('contas-doacao')
    if (!raiz) return
    const aviso = document.getElementById('copia-estado')

    for (const botao of raiz.querySelectorAll('.botao-copia')) {
      botao.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(botao.dataset.numero)
          aviso.textContent = botao.dataset.copiado
        } catch {
          aviso.textContent = raiz.dataset.falha
        }
        aviso.hidden = false
      })
    }
  }

  // galeria — o dropdown mostra miniaturas; o clique abre o visor branco
  function montarGaleria(raiz, visor) {

    const botoes = Array.from(raiz.querySelectorAll('.galeria-botao'))
    const foto = visor.querySelector('.visor-foto')
    const filme = visor.querySelector('.visor-filme')
    const legenda = visor.querySelector('.visor-legenda')
    const faixa = visor.querySelector('.visor-faixa')
    const fechar = visor.querySelector('.visor-fechar')
    let indice = 0
    let origem = null

    const minis = botoes.map((botao, i) => {
      const mini = document.createElement('button')
      mini.type = 'button'
      mini.className = 'visor-mini'
      mini.setAttribute('aria-label', botao.getAttribute('aria-label') || '')
      const previa = botao.querySelector('img')
      if (previa) {
        const img = document.createElement('img')
        img.src = previa.currentSrc || previa.src
        img.alt = ''
        mini.append(img)
      } else {
        const video = document.createElement('video')
        video.muted = true
        video.playsInline = true
        video.preload = 'metadata'
        video.tabIndex = -1
        video.setAttribute('aria-hidden', 'true')
        video.src = `${botao.dataset.src}#t=0.1`
        mini.append(video)
      }
      mini.addEventListener('click', () => mostrar(i))
      faixa.append(mini)
      return mini
    })

    function pararFilme() {
      filme.pause()
      filme.removeAttribute('src')
      filme.load()
    }

    function mostrar(n) {
      indice = (n + botoes.length) % botoes.length
      const botao = botoes[indice]
      const texto = botao.dataset.legenda || ''
      legenda.textContent = texto
      if (botao.dataset.tipo === 'video') {
        foto.hidden = true
        foto.removeAttribute('src')
        foto.alt = ''
        filme.hidden = false
        if (filme.getAttribute('src') !== botao.dataset.src) {
          filme.src = botao.dataset.src
        }
      } else {
        pararFilme()
        filme.hidden = true
        foto.hidden = false
        foto.src = botao.dataset.src
        foto.alt = ''
      }
      minis.forEach((mini, i) => {
        const ativo = i === indice
        mini.classList.toggle('ativo', ativo)
        if (ativo) mini.setAttribute('aria-current', 'true')
        else mini.removeAttribute('aria-current')
      })
    }

    function fundo(ligado) {
      for (const el of document.querySelectorAll('body > header, body > footer, #contenido > .pagina-topo, #contenido > .conteudo')) {
        el.inert = ligado
      }
    }

    function abrir(i, botao) {
      origem = botao
      visor.hidden = false
      document.body.classList.add('visor-aberto')
      fundo(true)
      mostrar(i)
      fechar.focus()
    }

    function cerrar() {
      if (visor.hidden) return
      pararFilme()
      visor.hidden = true
      document.body.classList.remove('visor-aberto')
      fundo(false)
      if (origem) origem.focus()
    }

    botoes.forEach((botao, i) => botao.addEventListener('click', () => abrir(i, botao)))
    visor.querySelector('.visor-anterior').addEventListener('click', () => mostrar(indice - 1))
    visor.querySelector('.visor-proximo').addEventListener('click', () => mostrar(indice + 1))
    fechar.addEventListener('click', cerrar)

    document.addEventListener('keydown', (evento) => {
      if (visor.hidden) return
      if (evento.key === 'Escape') {
        evento.preventDefault()
        cerrar()
      } else if (evento.target !== filme && evento.key === 'ArrowLeft') {
        evento.preventDefault()
        mostrar(indice - 1)
      } else if (evento.target !== filme && evento.key === 'ArrowRight') {
        evento.preventDefault()
        mostrar(indice + 1)
      }
    })
  }

  function galerias() {
    for (const raiz of document.querySelectorAll('[data-galeria]')) {
      const visor = document.getElementById(raiz.dataset.galeria)
      if (visor) montarGaleria(raiz, visor)
    }
  }

  // retratos — a miniatura abre a foto à esquerda e a biografia à direita
  function retratos() {
    const visor = document.getElementById('visor-voluntarios')
    const botoes = Array.from(document.querySelectorAll('.voluntario-mini'))
    if (!visor || !botoes.length) return
    const foto = visor.querySelector('.visor-foto')
    const nome = visor.querySelector('.visor-bio-nome')
    const texto = visor.querySelector('.visor-bio-texto')
    const fechar = visor.querySelector('.visor-fechar')
    let indice = 0
    let origem = null

    function mostrar(n) {
      indice = (n + botoes.length) % botoes.length
      const item = botoes[indice].closest('.voluntario')
      const previa = botoes[indice].querySelector('img')
      foto.src = previa.currentSrc || previa.src
      foto.alt = previa.alt || ''
      nome.textContent = item.querySelector('.voluntario-nome')?.textContent?.trim() || ''
      texto.replaceChildren()
      for (const paragrafo of item.querySelectorAll('.voluntario-bio p')) {
        const copia = document.createElement('p')
        copia.textContent = paragrafo.textContent
        texto.append(copia)
      }
      visor.classList.remove('visor-bio-viva')
      void visor.offsetWidth
      visor.classList.add('visor-bio-viva')
      const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      nome.style.animationDelay = reduzir ? '0s' : '.15s'
      texto.querySelectorAll('p').forEach((el, i) => {
        el.style.animationDelay = reduzir ? '0s' : `${0.5 + i * 0.5}s`
      })
    }

    function fundo(ligado) {
      for (const el of document.querySelectorAll('body > header, body > footer, #contenido > .pagina-topo, #contenido > .conteudo')) {
        el.inert = ligado
      }
    }

    function abrir(i, botao) {
      origem = botao
      visor.hidden = false
      document.body.classList.add('visor-aberto')
      fundo(true)
      mostrar(i)
      fechar.focus()
    }

    function cerrar() {
      if (visor.hidden) return
      visor.hidden = true
      visor.classList.remove('visor-bio-viva')
      document.body.classList.remove('visor-aberto')
      fundo(false)
      if (origem) origem.focus()
    }

    botoes.forEach((botao, i) => botao.addEventListener('click', () => abrir(i, botao)))
    visor.querySelector('.visor-anterior').addEventListener('click', () => mostrar(indice - 1))
    visor.querySelector('.visor-proximo').addEventListener('click', () => mostrar(indice + 1))
    fechar.addEventListener('click', cerrar)
    document.addEventListener('keydown', (evento) => {
      if (visor.hidden) return
      if (evento.key === 'Escape') {
        evento.preventDefault()
        cerrar()
      } else if (evento.key === 'ArrowLeft') {
        evento.preventDefault()
        mostrar(indice - 1)
      } else if (evento.key === 'ArrowRight') {
        evento.preventDefault()
        mostrar(indice + 1)
      }
    })
  }

  // inscrição — desce até o formulário e abre a caixa; vale para o botão e para o menu
  function abrirInscricao() {
    const botao = document.getElementById('caixa-form-botao')
    const alvo = document.getElementById('inscricao')
    if (!botao || !alvo) return
    for (const outro of botoesCaixa) definirCaixa(outro, outro === botao)
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    alvo.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' })
  }

  function inscricaoCabeca() {
    for (const link of document.querySelectorAll('.cabeca-inscricao, .nav-inscricao')) {
      link.addEventListener('click', (evento) => {
        if (!document.getElementById('caixa-form-botao')) return
        evento.preventDefault()
        abrirInscricao()
      })
    }
    if (location.hash === '#inscricao') abrirInscricao()
  }

  // cabeçalho — a faixa fica em 1920×590; foto maior corta, menor deixa vazio
  function enquadrarCabeca(img) {
    const caixa = img.closest('.cabeca-foto')
    if (!caixa || !img.naturalWidth) return
    const escala = caixa.getBoundingClientRect().width / 1920
    img.style.width = `${img.naturalWidth * escala}px`
    img.style.height = `${img.naturalHeight * escala}px`
  }

  // cabeçalho — o título começa 0,5s depois da foto; a frase, 0,5s depois do título
  function cabeca() {
    const raiz = document.querySelector('.cabeca')
    if (!raiz) return
    const img = raiz.querySelector('.cabeca-foto img')
    if (!img) return
    const pronta = () => raiz.classList.add('cabeca-pronta')
    const medir = () => enquadrarCabeca(img)
    img.addEventListener('load', () => {
      medir()
      pronta()
    })
    if (img.complete && img.naturalWidth) {
      medir()
      pronta()
    }
    if (window.ResizeObserver) new ResizeObserver(medir).observe(img.closest('.cabeca-foto'))
    else window.addEventListener('resize', medir)
  }

  cabeca()
  inscricaoCabeca()
  submenus()
  galerias()
  retratos()
  voluntariado()
  doacao()
  copiarContas()
})()
