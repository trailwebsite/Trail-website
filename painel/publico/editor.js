// editor.js — camada de edição: moldura no hover, diálogo no clique, galeria no visor
(() => {
  const csrf = document.querySelector('meta[name="painel-csrf"]')?.content || ''
  document.body.classList.add('com-painel')

  const barra = document.createElement('div')
  barra.id = 'painel-barra'
  barra.innerHTML = `
    <button type="button" id="painel-sair">Sign out</button>
    <button type="button" id="painel-desfazer">Undo</button>
    <button type="button" id="painel-historico">History</button>
    <button type="button" id="painel-ver">Open original site</button>
    <label for="painel-idioma">Language
      <select id="painel-idioma"></select>
    </label>
    <p id="painel-estado" role="status"></p>`
  document.body.prepend(barra)

  const moldura = document.createElement('div')
  moldura.id = 'painel-moldura'
  const dica = document.createElement('div')
  dica.id = 'painel-dica'
  document.body.append(moldura, dica)

  const dialogo = document.createElement('div')
  dialogo.id = 'painel-dialogo'
  dialogo.innerHTML = `<div class="caixa" role="dialog" aria-modal="true" aria-labelledby="painel-titulo">
    <h2 id="painel-titulo"></h2>
    <div id="painel-miolo"></div>
  </div>`
  document.body.append(dialogo)

  const estado = document.getElementById('painel-estado')
  const miolo = document.getElementById('painel-miolo')
  const titulo = document.getElementById('painel-titulo')
  let devolverFoco = null

  const idiomas = [
    ['en', 'English', ''],
    ['es', 'Español', '/es'],
    ['pt', 'Português', '/pt'],
    ['ko', '한국어', '/ko'],
    ['ja', '日本語', '/ja'],
    ['zh', '中文', '/zh'],
  ]
  const select = document.getElementById('painel-idioma')
  const atual = location.pathname.match(/^\/(es|pt|ko|ja|zh)(\/|$)/)?.[1] || 'en'
  for (const [codigo, nome] of idiomas) {
    const op = document.createElement('option')
    op.value = codigo
    op.textContent = nome
    if (codigo === atual) op.selected = true
    select.append(op)
  }
  select.addEventListener('change', () => {
    const prefixo = idiomas.find((i) => i[0] === select.value)?.[2] || ''
    const resto = location.pathname.replace(/^\/(es|pt|ko|ja|zh)(?=\/|$)/, '') || '/'
    location.href = (prefixo + (resto.startsWith('/') ? resto : `/${resto}`)) || '/'
  })

  function dizer(texto) { estado.textContent = texto || '' }

  async function api(caminho, opcoes = {}) {
    const resposta = await fetch(caminho, {
      credentials: 'same-origin',
      ...opcoes,
      headers: { 'x-csrf': csrf, ...(opcoes.headers || {}) },
    })
    const tipo = resposta.headers.get('content-type') || ''
    const corpo = tipo.includes('json') ? await resposta.json() : null
    if (!resposta.ok) throw new Error(corpo?.mensagem || 'We could not finish that.')
    return corpo
  }

  function fechar() {
    dialogo.classList.remove('aberto')
    dialogo.hidden = true
    if (devolverFoco) devolverFoco.focus()
  }

  function abrir(tituloTexto, focar) {
    titulo.textContent = tituloTexto
    dialogo.hidden = false
    dialogo.classList.add('aberto')
    const caixa = dialogo.querySelector('.caixa')
    const lista = () => [...caixa.querySelectorAll('button, input, select, textarea, a, [contenteditable="true"]')].filter((el) => !el.disabled)
    if (!caixa.dataset.teclas) {
      caixa.dataset.teclas = '1'
      caixa.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') { evento.preventDefault(); fechar() }
        if (evento.key !== 'Tab') return
        const itens = lista()
        if (!itens.length) return
        const primeiro = itens[0]
        const ultimo = itens[itens.length - 1]
        if (evento.shiftKey && document.activeElement === primeiro) { evento.preventDefault(); ultimo.focus() }
        else if (!evento.shiftKey && document.activeElement === ultimo) { evento.preventDefault(); primeiro.focus() }
      })
    }
    ;(focar || lista()[0])?.focus()
  }

  function botao(texto, classe) {
    const el = document.createElement('button')
    el.type = 'button'
    el.textContent = texto
    if (classe) el.className = classe
    return el
  }

  document.getElementById('painel-ver').addEventListener('click', () => {
    const url = new URL(location.href)
    url.searchParams.set('painel', 'ver')
    window.open(url.href, '_blank', 'noopener')
  })
  document.getElementById('painel-sair').addEventListener('click', async () => {
    await fetch('/panel/logout', { method: 'POST', credentials: 'same-origin', headers: { 'x-csrf': csrf, 'content-type': 'application/json' }, body: '{}' })
    location.href = '/panel/login'
  })
  document.getElementById('painel-desfazer').addEventListener('click', async () => {
    try { await api('/panel/api/desfazer', { method: 'POST' }); location.reload() }
    catch (erro) { dizer(erro.message) }
  })
  document.getElementById('painel-historico').addEventListener('click', async () => {
    devolverFoco = document.activeElement
    miolo.replaceChildren()
    titulo.textContent = 'History'
    try {
      const { lista } = await api('/panel/api/historico')
      if (!lista.length) {
        const p = document.createElement('p')
        p.textContent = 'There are no changes yet.'
        miolo.append(p)
      }
      for (const item of lista) {
        const linha = document.createElement('p')
        const acao = document.createElement('span')
        acao.textContent = `${item.quando} — ${item.acao} `
        const restaurar = botao('Restore')
        restaurar.addEventListener('click', async () => {
          await api('/panel/api/restaurar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: item.id }) })
          location.reload()
        })
        linha.append(acao, restaurar)
        miolo.append(linha)
      }
    } catch (erro) {
      const p = document.createElement('p')
      p.textContent = erro.message
      miolo.append(p)
    }
    const cancelar = botao('Close', 'secundario')
    cancelar.addEventListener('click', fechar)
    miolo.append(cancelar)
    abrir('History', cancelar)
  })

  dialogo.addEventListener('click', (evento) => { if (evento.target === dialogo) fechar() })

  function alvoEditavel(no) {
    if (!no || !no.closest) return null
    if (no.closest('#painel-barra, #painel-dialogo, .painel-galeria-acoes, .voluntario-adicionar')) return null
    const el = no.closest('[data-edit-type]')
    if (!el || el.getAttribute('data-edit') === 'locked') return null
    if (el.dataset.editType === 'gallery') {
      if (no.closest('.galeria-botao, .galeria-item')) return null
      return el
    }
    if (el.dataset.editType === 'volunteers') return null
    return el
  }

  const nomes = { text: 'Text', image: 'Image', gallery: 'Gallery' }
  document.addEventListener('mousemove', (evento) => {
    const el = alvoEditavel(evento.target)
    if (!el) { moldura.style.display = 'none'; dica.style.display = 'none'; return }
    const r = el.getBoundingClientRect()
    moldura.style.display = 'block'
    moldura.style.left = `${r.left + window.scrollX}px`
    moldura.style.top = `${r.top + window.scrollY}px`
    moldura.style.width = `${r.width}px`
    moldura.style.height = `${r.height}px`
    dica.style.display = 'block'
    dica.textContent = nomes[el.dataset.editType] || 'Text'
    dica.style.left = `${r.left + window.scrollX}px`
    dica.style.top = `${r.top + window.scrollY - 22}px`
  })

  const CLASSES_TX = ['tx-12', 'tx-14', 'tx-16', 'tx-18', 'tx-20', 'tx-24', 'tx-28', 'tx-32', 'tx-40', 'tx-48', 'tx-esq', 'tx-centro', 'tx-dir']
  const TAMANHO_CLS = CLASSES_TX.slice(0, 10)
  const LADO_CLS = CLASSES_TX.slice(10)

  function faixaNa(area) {
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return null
    const faixa = sel.getRangeAt(0)
    if (!area.contains(faixa.commonAncestorContainer)) return null
    return faixa
  }

  function envolver(faixa, el) {
    try {
      faixa.surroundContents(el)
    } catch {
      el.append(faixa.extractContents())
      faixa.insertNode(el)
    }
  }

  function desfazerMarca(el) {
    const pai = el.parentNode
    while (el.firstChild) pai.insertBefore(el.firstChild, el)
    pai.removeChild(el)
  }

  // perfil da chave — nav e cabeçalho só permitem negrito/itálico; o tamanho fica no CSS do site
  function perfilChave(chave) {
    const k = String(chave || '')
    if (/^t\.nav\./.test(k) || k === 't.volunteer.signNow') return 'nav'
    if (/^t\.(educational|sensory|volunteer|donations|sponsors)\.(h1|heroLine)$/.test(k)) return 'cabeca'
    return 'livre'
  }

  // montarAreaTexto — barra Size/Bold/Italic/align + caixa editável com Ctrl+Z
  function montarAreaTexto(htmlAtual, rotulo, chave) {
    const perfil = perfilChave(chave)
    const bloco = document.createElement('div')
    bloco.className = 'painel-area-texto'
    if (rotulo) {
      const titulo = document.createElement('p')
      titulo.className = 'painel-rotulo'
      titulo.textContent = rotulo
      bloco.append(titulo)
    }
    const ferramentas = document.createElement('div')
    ferramentas.id = 'painel-ferramentas'
    const tamanho = document.createElement('select')
    tamanho.setAttribute('aria-label', 'Font size')
    const opcaoVazia = document.createElement('option')
    opcaoVazia.value = ''
    opcaoVazia.textContent = 'Size'
    tamanho.append(opcaoVazia)
    for (const n of [12, 14, 16, 18, 20, 24, 28, 32, 40, 48]) {
      const op = document.createElement('option')
      op.value = String(n)
      op.textContent = String(n)
      tamanho.append(op)
    }
    const negrito = botao('Bold', 'ferramenta')
    const italico = botao('Italic', 'ferramenta')
    const esquerda = botao('Left', 'ferramenta')
    const centro = botao('Center', 'ferramenta')
    const direita = botao('Right', 'ferramenta')
    if (perfil === 'livre') ferramentas.append(tamanho, negrito, italico, esquerda, centro, direita)
    else ferramentas.append(negrito, italico)
    const area = document.createElement('div')
    area.className = 'painel-texto'
    area.contentEditable = 'true'
    area.spellcheck = true
    area.setAttribute('aria-label', rotulo || 'Text')
    area.innerHTML = htmlAtual || ''
    const historico = [area.innerHTML]
    let passo = 0
    let digitando = null
    const lembrar = () => {
      const agora = area.innerHTML
      if (agora === historico[passo]) return
      historico.splice(passo + 1)
      historico.push(agora)
      if (historico.length > 80) historico.shift()
      passo = historico.length - 1
    }
    const voltar = () => {
      if (passo <= 0) return
      passo -= 1
      area.innerHTML = historico[passo]
    }
    const avancar = () => {
      if (passo >= historico.length - 1) return
      passo += 1
      area.innerHTML = historico[passo]
    }
    let faixaGuardada = null
    const guardar = () => {
      const faixa = faixaNa(area)
      if (faixa) faixaGuardada = faixa.cloneRange()
    }
    const restaurar = () => {
      area.focus()
      if (!faixaGuardada) return
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(faixaGuardada)
    }
    const prepararSelecao = () => {
      restaurar()
      let faixa = faixaNa(area)
      if (!faixa || faixa.collapsed) {
        faixa = document.createRange()
        faixa.selectNodeContents(area)
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(faixa)
      }
      return faixa
    }
    const marcar = (comando) => {
      lembrar()
      prepararSelecao()
      document.execCommand('styleWithCSS', false, false)
      document.execCommand(comando, false, null)
      lembrar()
    }
    const aplicarClasse = (nome, grupo) => {
      lembrar()
      const faixa = prepararSelecao()
      let no = faixa.commonAncestorContainer
      if (no.nodeType === 3) no = no.parentNode
      const atual = no.closest?.(`span.${nome}`)
      if (atual && area.contains(atual) && atual.contains(faixa.startContainer) && atual.contains(faixa.endContainer)) {
        atual.classList.remove(nome)
        if (!atual.classList.length) desfazerMarca(atual)
        lembrar()
        return
      }
      const span = document.createElement('span')
      span.className = nome
      envolver(faixa, span)
      for (const el of [...span.querySelectorAll('span')]) {
        for (const outra of grupo) el.classList.remove(outra)
        if (!el.classList.length) desfazerMarca(el)
      }
      lembrar()
    }
    ferramentas.addEventListener('mousedown', (evento) => {
      if (evento.target.closest('button')) evento.preventDefault()
      guardar()
    })
    if (perfil === 'livre') {
      tamanho.addEventListener('change', () => {
        if (!tamanho.value) return
        aplicarClasse(`tx-${tamanho.value}`, TAMANHO_CLS)
        tamanho.value = ''
      })
      esquerda.addEventListener('click', () => aplicarClasse('tx-esq', LADO_CLS))
      centro.addEventListener('click', () => aplicarClasse('tx-centro', LADO_CLS))
      direita.addEventListener('click', () => aplicarClasse('tx-dir', LADO_CLS))
    }
    negrito.addEventListener('click', () => marcar('bold'))
    italico.addEventListener('click', () => marcar('italic'))
    area.addEventListener('paste', (evento) => {
      evento.preventDefault()
      lembrar()
      const texto = evento.clipboardData?.getData('text/plain') || ''
      document.execCommand('insertText', false, texto)
      lembrar()
    })
    area.addEventListener('input', () => {
      clearTimeout(digitando)
      digitando = setTimeout(lembrar, 400)
    })
    area.addEventListener('keydown', (evento) => {
      const z = evento.key === 'z' || evento.key === 'Z'
      const y = evento.key === 'y' || evento.key === 'Y'
      if (!(evento.ctrlKey || evento.metaKey) || evento.altKey) return
      if (z && !evento.shiftKey) {
        evento.preventDefault()
        clearTimeout(digitando)
        voltar()
      } else if (y || (z && evento.shiftKey)) {
        evento.preventDefault()
        clearTimeout(digitando)
        avancar()
      }
    })
    bloco.append(ferramentas, area)
    return { bloco, area, ferramentas }
  }

  function abrirTexto(chave, htmlAtual) {
    devolverFoco = document.activeElement
    miolo.replaceChildren()
    const { bloco, area } = montarAreaTexto(htmlAtual, 'Text', chave)
    const perfil = perfilChave(chave)
    if (perfil === 'nav' || perfil === 'cabeca') {
      const aviso = document.createElement('p')
      aviso.className = 'painel-aviso-padrao'
      aviso.textContent = perfil === 'nav'
        ? 'Menu labels keep the site size and spacing. Bold and italic still work.'
        : 'Page header titles keep the site size and spacing. Bold and italic still work.'
      miolo.append(aviso)
    }
    const enviar = botao('Submit text')
    const cancelar = botao('Cancel', 'secundario')
    miolo.append(bloco, enviar, cancelar)
    enviar.addEventListener('click', async () => {
      enviar.disabled = true
      dizer('Saving…')
      try {
        const r = await api('/panel/api/texto', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ chave, valor: area.innerHTML, idiomaPagina: atual }),
        })
        dizer(r.mensagem)
        location.reload()
      } catch (erro) {
        enviar.disabled = false
        dizer(erro.message)
      }
    })
    cancelar.addEventListener('click', fechar)
    abrir('Text', area)
  }

  function abrirImagem(el) {
    devolverFoco = document.activeElement
    miolo.replaceChildren()
    const pergunta = document.createElement('p')
    pergunta.textContent = 'Do you want to change the image?'
    const file = document.createElement('input')
    file.type = 'file'
    file.accept = 'image/jpeg,image/png,image/webp,image/svg+xml'
    const escolher = document.createElement('label')
    escolher.className = 'arquivo'
    escolher.textContent = 'Choose file'
    escolher.append(file)
    file.hidden = true
    const previa = document.createElement('img')
    previa.alt = ''
    const confirmar = botao('Confirm')
    const cancelar = botao('Cancel', 'secundario')
    let arquivo = null
    file.addEventListener('change', () => {
      arquivo = file.files?.[0] || null
      if (!arquivo) return
      previa.src = URL.createObjectURL(arquivo)
    })
    confirmar.addEventListener('click', async () => {
      if (!arquivo) { dizer('Choose an image.'); return }
      confirmar.disabled = true
      dizer('Saving…')
      try {
        const resposta = await fetch('/panel/api/imagem', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'x-csrf': csrf, 'x-chave': el.dataset.editKey },
          body: arquivo,
        })
        const tipo = resposta.headers.get('content-type') || ''
        const corpo = tipo.includes('json') ? await resposta.json().catch(() => null) : null
        if (!resposta.ok) {
          confirmar.disabled = false
          dizer(corpo?.mensagem || `We could not save the image. (HTTP ${resposta.status})`)
          return
        }
        location.reload()
      } catch {
        confirmar.disabled = false
        dizer('We could not save the image. Check the connection and try again.')
      }
    })
    cancelar.addEventListener('click', fechar)
    miolo.append(pergunta, escolher, previa, confirmar, cancelar)
    abrir('Image', escolher)
  }

  function abrirNav(el, href) {
    devolverFoco = document.activeElement
    miolo.replaceChildren()
    const pergunta = document.createElement('p')
    pergunta.textContent = 'Change the label, or open this page?'
    const editar = botao('Change text')
    const ir = botao('Go to this page')
    const cancelar = botao('Cancel', 'secundario')
    editar.addEventListener('click', () => abrirTexto(el.dataset.editKey, el.innerHTML || ''))
    ir.addEventListener('click', () => { if (href) location.href = href })
    cancelar.addEventListener('click', fechar)
    if (!href) ir.disabled = true
    miolo.append(pergunta, editar, ir, cancelar)
    abrir('Navigation', editar)
  }

  document.addEventListener('click', (evento) => {
    if (evento.target.closest?.('#painel-barra, #painel-dialogo, .painel-galeria-acoes')) return
    const link = evento.target.closest?.('a')
    const rotulo = link?.querySelector('[data-edit-nav]')
    if (link && rotulo && link.contains(evento.target)) {
      evento.preventDefault()
      evento.stopPropagation()
      abrirNav(rotulo, link.getAttribute('href') || '')
      return
    }
    const el = alvoEditavel(evento.target)
    if (!el || el.dataset.editType === 'gallery' || el.dataset.editType === 'volunteers') return
    if (el.dataset.editType === 'text' || el.classList.contains('visor-legenda')) {
      evento.preventDefault()
      evento.stopPropagation()
      abrirTexto(el.dataset.editKey, el.innerHTML || '')
      return
    }
    if (el.dataset.editType === 'image') {
      evento.preventDefault()
      evento.stopPropagation()
      abrirImagem(el)
    }
  }, true)

  function visorAberto(visor) {
    const raiz = document.querySelector(`[data-galeria="${visor.id}"]`)
    if (!raiz) return null
    const botoes = [...raiz.querySelectorAll('.galeria-botao')]
    const minis = [...visor.querySelectorAll('.visor-mini')]
    const indice = minis.findIndex((m) => m.classList.contains('ativo'))
    const botao = botoes[indice]
    if (!botao) return null
    const legenda = visor.querySelector('.visor-legenda')
    if (legenda && botao.dataset.legendaChave) {
      legenda.dataset.editKey = botao.dataset.legendaChave
      legenda.dataset.editType = 'text'
    }
    return {
      galeria: raiz.querySelector('ul.galeria')?.dataset.editKey,
      id: botao.closest('.galeria-item')?.dataset.itemId,
    }
  }

  function montarAcoes(visor) {
    if (visor.querySelector('.painel-galeria-acoes')) return
    const caixa = document.createElement('div')
    caixa.className = 'painel-galeria-acoes'
    const apagar = botao('Delete')
    const novo = botao('Add new')
    const file = document.createElement('input')
    file.type = 'file'
    file.accept = 'image/jpeg,image/png,image/webp,video/mp4,video/webm'
    file.hidden = true
    const barraProg = document.createElement('div')
    barraProg.id = 'painel-progresso'
    barraProg.hidden = true
    const cheio = document.createElement('span')
    barraProg.append(cheio)
    apagar.addEventListener('click', async () => {
      const info = visorAberto(visor)
      if (!info?.id) return
      if (!window.confirm('Remove this item?')) return
      try {
        await api('/panel/api/galeria/excluir', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ galeria: info.galeria, id: info.id }),
        })
        location.reload()
      } catch (erro) { dizer(erro.message) }
    })
    novo.addEventListener('click', () => file.click())
    file.addEventListener('change', () => {
      const arquivo = file.files?.[0]
      file.value = ''
      if (!arquivo) return
      const info = visorAberto(visor)
      if (!info?.galeria) return
      if (arquivo.type.startsWith('video/')) enviarVideo(arquivo, info, cheio, barraProg)
      else enviarFoto(arquivo, info, cheio, barraProg)
    })
    caixa.append(apagar, novo, file, barraProg)
    visor.querySelector('.visor-corpo')?.append(caixa)
  }

  async function enviarFoto(arquivo, info, cheio, barraProg) {
    barraProg.hidden = false
    cheio.style.width = '30%'
    try {
      const resposta = await fetch('/panel/api/galeria/arquivo', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'x-csrf': csrf, 'x-galeria': info.galeria, 'x-depois': info.id },
        body: arquivo,
      })
      cheio.style.width = '100%'
      const tipo = resposta.headers.get('content-type') || ''
      const corpo = tipo.includes('json') ? await resposta.json().catch(() => null) : null
      if (!resposta.ok) {
        dizer(corpo?.mensagem || `We could not add the photo. (HTTP ${resposta.status})`)
        return
      }
      location.reload()
    } catch {
      dizer('We could not add the photo. Check the connection and try again.')
    }
  }

  async function posterDe(arquivo) {
    const url = URL.createObjectURL(arquivo)
    try {
      const video = document.createElement('video')
      video.src = url
      video.muted = true
      await new Promise((resolve, reject) => {
        video.onloadeddata = () => resolve()
        video.onerror = () => reject(new Error('formato'))
      })
      video.currentTime = Math.min(0.2, (video.duration || 1) / 2)
      await new Promise((resolve) => { video.onseeked = () => resolve() })
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 320
      canvas.height = video.videoHeight || 180
      canvas.getContext('2d').drawImage(video, 0, 0)
      return canvas.toDataURL('image/jpeg', 0.7)
    } catch {
      return ''
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  async function enviarVideo(arquivo, info, cheio, barraProg) {
    if (arquivo.size > 20 * 1024 * 1024) {
      dizer('The video is too large. The limit is 20 MB.')
      return
    }
    barraProg.hidden = false
    try {
      const inicio = await api('/panel/api/upload/iniciar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ galeria: info.galeria, depoisDe: info.id, tamanho: arquivo.size }),
      })
      for (let i = 0; i < inicio.partes; i++) {
        const ini = i * inicio.parte
        const pedaco = arquivo.slice(ini, ini + inicio.parte)
        const resposta = await fetch(`/panel/api/upload/parte?id=${inicio.id}&i=${i}`, {
          method: 'PUT',
          credentials: 'same-origin',
          headers: { 'x-csrf': csrf },
          body: pedaco,
        })
        if (!resposta.ok) throw new Error('The video is too large or the format will not work. Use MP4 or WebM.')
        cheio.style.width = `${((i + 1) / inicio.partes) * 100}%`
      }
      const poster = await posterDe(arquivo)
      await api('/panel/api/upload/concluir', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: inicio.id, poster, galeria: info.galeria, depoisDe: info.id }),
      })
      location.reload()
    } catch (erro) {
      dizer(erro.message)
    }
  }

  function abrirFormVoluntario() {
    devolverFoco = document.activeElement
    miolo.replaceChildren()
    const rotuloNome = document.createElement('p')
    rotuloNome.className = 'painel-rotulo'
    rotuloNome.textContent = 'Name'
    const nome = document.createElement('input')
    nome.type = 'text'
    nome.className = 'painel-campo'
    nome.maxLength = 120
    nome.placeholder = 'Name'
    nome.setAttribute('aria-label', 'Name')
    const rotuloFoto = document.createElement('p')
    rotuloFoto.className = 'painel-rotulo'
    rotuloFoto.textContent = 'Photo'
    const file = document.createElement('input')
    file.type = 'file'
    file.accept = 'image/jpeg,image/png,image/webp'
    const escolher = document.createElement('label')
    escolher.className = 'arquivo'
    escolher.textContent = 'Choose file'
    escolher.append(file)
    file.hidden = true
    const previa = document.createElement('img')
    previa.alt = ''
    const { bloco: blocoBio, area: bio } = montarAreaTexto('', 'Biography')
    const enviar = botao('Add volunteer')
    const cancelar = botao('Cancel', 'secundario')
    let arquivo = null
    file.addEventListener('change', () => {
      arquivo = file.files?.[0] || null
      if (!arquivo) return
      previa.src = URL.createObjectURL(arquivo)
    })
    enviar.addEventListener('click', async () => {
      if (!nome.value.trim()) { dizer('Write the name.'); return }
      if (!arquivo) { dizer('Choose an image.'); return }
      if (!bio.innerText.trim()) { dizer('Write the biography.'); return }
      enviar.disabled = true
      dizer('Saving…')
      try {
        const resposta = await fetch('/panel/api/voluntario', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'x-csrf': csrf,
            'x-nome': encodeURIComponent(nome.value.trim()),
            'x-bio': encodeURIComponent(bio.innerHTML),
            'x-idioma': atual,
          },
          body: arquivo,
        })
        const tipo = resposta.headers.get('content-type') || ''
        const corpo = tipo.includes('json') ? await resposta.json().catch(() => null) : null
        if (!resposta.ok) {
          enviar.disabled = false
          dizer(corpo?.mensagem || 'We could not add the volunteer.')
          return
        }
        location.reload()
      } catch {
        enviar.disabled = false
        dizer('We could not add the volunteer. Check the connection and try again.')
      }
    })
    cancelar.addEventListener('click', fechar)
    miolo.append(rotuloNome, nome, rotuloFoto, escolher, previa, blocoBio, enviar, cancelar)
    abrir('New volunteer', nome)
  }

  function perguntarVoluntario() {
    devolverFoco = document.activeElement
    miolo.replaceChildren()
    const pergunta = document.createElement('p')
    pergunta.textContent = 'Do you want to add a new volunteer?'
    const confirmar = botao('Confirm')
    const cancelar = botao('Cancel', 'secundario')
    confirmar.addEventListener('click', abrirFormVoluntario)
    cancelar.addEventListener('click', fechar)
    miolo.append(pergunta, confirmar, cancelar)
    abrir('Volunteer', confirmar)
  }

  function montarMaisVoluntario() {
    const lista = document.querySelector('ul.voluntarios[data-edit-type="volunteers"]')
    if (!lista || lista.querySelector('.voluntario-adicionar')) return
    const item = document.createElement('li')
    item.className = 'voluntario-adicionar'
    const mais = document.createElement('button')
    mais.type = 'button'
    mais.className = 'painel-mais-voluntario'
    mais.textContent = '+'
    mais.setAttribute('aria-label', 'Add volunteer')
    mais.addEventListener('click', perguntarVoluntario)
    item.append(mais)
    lista.append(item)
  }

  function abrirFormAfiliado() {
    devolverFoco = document.activeElement
    miolo.replaceChildren()
    const rotuloLogo = document.createElement('p')
    rotuloLogo.className = 'painel-rotulo'
    rotuloLogo.textContent = 'Logo'
    const file = document.createElement('input')
    file.type = 'file'
    file.accept = 'image/jpeg,image/png,image/webp,image/svg+xml'
    const escolher = document.createElement('label')
    escolher.className = 'arquivo'
    escolher.textContent = 'Choose file'
    escolher.append(file)
    file.hidden = true
    const previa = document.createElement('img')
    previa.alt = ''
    const rotuloUrl = document.createElement('p')
    rotuloUrl.className = 'painel-rotulo'
    rotuloUrl.textContent = 'Link'
    const campoUrl = document.createElement('input')
    campoUrl.type = 'url'
    campoUrl.className = 'painel-campo'
    campoUrl.placeholder = 'https://'
    campoUrl.setAttribute('aria-label', 'Link')
    const enviar = botao('Add partner')
    const cancelar = botao('Cancel', 'secundario')
    let arquivo = null
    file.addEventListener('change', () => {
      arquivo = file.files?.[0] || null
      if (!arquivo) return
      previa.src = URL.createObjectURL(arquivo)
    })
    enviar.addEventListener('click', async () => {
      const url = campoUrl.value.trim()
      if (!arquivo) { dizer('Choose an image.'); return }
      if (!/^https:\/\/\S+$/i.test(url)) { dizer('Write a full https link.'); return }
      enviar.disabled = true
      dizer('Saving…')
      try {
        const resposta = await fetch('/panel/api/afiliado', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'x-csrf': csrf, 'x-url': encodeURIComponent(url) },
          body: arquivo,
        })
        const tipo = resposta.headers.get('content-type') || ''
        const corpo = tipo.includes('json') ? await resposta.json().catch(() => null) : null
        if (!resposta.ok) {
          enviar.disabled = false
          dizer(corpo?.mensagem || 'We could not add the partner.')
          return
        }
        location.reload()
      } catch {
        enviar.disabled = false
        dizer('We could not add the partner. Check the connection and try again.')
      }
    })
    cancelar.addEventListener('click', fechar)
    miolo.append(rotuloLogo, escolher, previa, rotuloUrl, campoUrl, enviar, cancelar)
    abrir('Affiliate partner', campoUrl)
  }

  function montarMaisAfiliado() {
    const lista = document.querySelector('ul.afiliados[data-edit-type="partners"]')
    if (!lista) return
    for (const vazio of lista.querySelectorAll('.afiliado-vazio')) {
      if (vazio.querySelector('.painel-mais-afiliado')) continue
      const mais = document.createElement('button')
      mais.type = 'button'
      mais.className = 'painel-mais-afiliado'
      mais.textContent = '+'
      mais.setAttribute('aria-label', 'Add affiliate partner')
      mais.addEventListener('click', abrirFormAfiliado)
      vazio.append(mais)
    }
  }

  montarMaisVoluntario()
  montarMaisAfiliado()

  const visto = new WeakSet()
  const observar = new MutationObserver(() => {
    for (const visor of document.querySelectorAll('.visor')) {
      if (visor.hidden) continue
      if (!visto.has(visor)) {
        visto.add(visor)
        montarAcoes(visor)
      }
      visorAberto(visor)
    }
    montarMaisVoluntario()
    montarMaisAfiliado()
  })
  observar.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['hidden', 'class'] })
})()
