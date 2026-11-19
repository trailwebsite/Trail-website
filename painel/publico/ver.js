// ver.js — a janela da página original continua sem o editor ao mudar de página
(() => {
  const comVer = (href) => {
    let url
    try { url = new URL(href, location.href) } catch { return '' }
    if (url.origin !== location.origin) return ''
    if (url.pathname.startsWith('/panel') || url.pathname.startsWith('/interno')) return ''
    url.searchParams.set('painel', 'ver')
    return url.href
  }

  document.addEventListener('click', (evento) => {
    const link = evento.target.closest?.('a[href]')
    if (!link || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
    const destino = comVer(link.getAttribute('href'))
    if (!destino) return
    evento.preventDefault()
    if (link.target === '_blank') window.open(destino, '_blank', 'noopener')
    else location.href = destino
  }, true)
})()
