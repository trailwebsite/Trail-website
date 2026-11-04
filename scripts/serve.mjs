// serve.mjs — servidor estático mínimo para desenvolvimento local, sem dependências
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

// servir — sobe o servidor na pasta dada e devolve a instância; porta 0 escolhe uma livre
export function servir(pasta, porta = 0) {
  const servidor = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://local')
    let caminho = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
    let arquivo = join(pasta, caminho)
    try {
      let info = await stat(arquivo)
      if (info.isDirectory()) {
        if (!caminho.endsWith('/')) {
          res.writeHead(301, { Location: `${caminho}/` })
          return res.end()
        }
        arquivo = join(arquivo, 'index.html')
        info = await stat(arquivo)
      }
      const corpo = await readFile(arquivo)
      res.writeHead(200, { 'Content-Type': TIPOS[extname(arquivo)] || 'application/octet-stream' })
      res.end(corpo)
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Não encontrado')
    }
  })
  return new Promise((resolve) => servidor.listen(porta, '127.0.0.1', () => resolve(servidor)))
}

const executadoDireto = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (executadoDireto) {
  const pasta = join(dirname(fileURLToPath(import.meta.url)), '..', 'site')
  const servidor = await servir(pasta, Number(process.env.PORT) || 8080)
  console.log(`Servindo ${pasta} em http://127.0.0.1:${servidor.address().port}/`)
}
