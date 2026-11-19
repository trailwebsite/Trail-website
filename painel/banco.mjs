// banco — SQLite do dono, dos textos e das galerias; uma linha de dono, no máximo
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import crypto from 'node:crypto'

const ESQUEMA = `
CREATE TABLE IF NOT EXISTS dono (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  criado INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS meta (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS texto (
  chave TEXT NOT NULL,
  idioma TEXT NOT NULL,
  valor TEXT NOT NULL,
  pendente INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (chave, idioma)
);
CREATE TABLE IF NOT EXISTS imagem (
  chave TEXT PRIMARY KEY,
  src TEXT NOT NULL,
  webp TEXT NOT NULL DEFAULT '',
  alt_chave TEXT NOT NULL DEFAULT '',
  largura INTEGER NOT NULL DEFAULT 0,
  altura INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS galeria (
  chave TEXT PRIMARY KEY,
  abrir_chave TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS galeria_item (
  id TEXT PRIMARY KEY,
  galeria TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  src TEXT NOT NULL,
  webp TEXT NOT NULL DEFAULT '',
  poster TEXT NOT NULL DEFAULT '',
  legenda_chave TEXT NOT NULL,
  largura INTEGER NOT NULL DEFAULT 0,
  altura INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS versao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quando INTEGER NOT NULL,
  acao TEXT NOT NULL,
  snapshot TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quando INTEGER NOT NULL,
  acao TEXT NOT NULL,
  ip TEXT NOT NULL,
  detalhe TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessao (
  token_hash TEXT PRIMARY KEY,
  tipo TEXT NOT NULL,
  csrf TEXT NOT NULL,
  expira INTEGER NOT NULL,
  criada INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS codigo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proposito TEXT NOT NULL,
  codigo_hash TEXT NOT NULL,
  expira INTEGER NOT NULL,
  usado INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS limite (
  chave TEXT PRIMARY KEY,
  falhas INTEGER NOT NULL,
  janela INTEGER NOT NULL,
  bloqueado_ate INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS upload (
  id TEXT PRIMARY KEY,
  galeria TEXT NOT NULL,
  depois_de TEXT NOT NULL DEFAULT '',
  tipo TEXT NOT NULL,
  tamanho INTEGER NOT NULL,
  partes INTEGER NOT NULL,
  expira INTEGER NOT NULL
);
`

export function abrirBanco(caminho) {
  mkdirSync(dirname(caminho), { recursive: true })
  const db = new DatabaseSync(caminho)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA busy_timeout = 5000')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(ESQUEMA)
  return db
}

export function temDono(db) {
  return !!db.prepare('SELECT id FROM dono WHERE id = 1').get()
}

export function lerDono(db) {
  return db.prepare('SELECT id, email, senha_hash FROM dono WHERE id = 1').get() || null
}

// criação atômica: duas chamadas ao mesmo tempo não criam dois donos
export function criarDono(db, email, senhaHash) {
  db.exec('BEGIN IMMEDIATE')
  try {
    if (db.prepare('SELECT id FROM dono WHERE id = 1').get()) {
      db.exec('ROLLBACK')
      return false
    }
    db.prepare('INSERT INTO dono (id, email, senha_hash, criado) VALUES (1, ?, ?, ?)').run(email, senhaHash, Date.now())
    db.exec('COMMIT')
    return true
  } catch {
    try { db.exec('ROLLBACK') } catch { /* já desfeito */ }
    return false
  }
}

export function trocarEmailDono(db, email) {
  const r = db.prepare('UPDATE dono SET email = ? WHERE id = 1').run(email)
  db.prepare('DELETE FROM sessao').run()
  return r.changes === 1
}

export function idiomas(db) {
  const row = db.prepare(`SELECT valor FROM meta WHERE chave = 'idiomas'`).get()
  return row ? row.valor.split(',').filter(Boolean) : ['en', 'es']
}

export function semear(db, semente) {
  const ja = db.prepare(`SELECT valor FROM meta WHERE chave = 'semeada'`).get()
  db.exec('BEGIN IMMEDIATE')
  try {
    db.prepare(`INSERT INTO meta (chave, valor) VALUES ('idiomas', ?)
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`).run(semente.idiomas.join(','))
    const ins = db.prepare('INSERT OR IGNORE INTO texto (chave, idioma, valor, pendente) VALUES (?, ?, ?, 0)')
    for (const [chave, porIdioma] of Object.entries(semente.textos || {})) {
      for (const [idioma, valor] of Object.entries(porIdioma)) ins.run(chave, idioma, String(valor))
    }
    if (!ja) {
      const img = db.prepare('INSERT OR IGNORE INTO imagem (chave, src, webp, alt_chave, largura, altura) VALUES (?, ?, ?, ?, ?, ?)')
      for (const im of semente.imagens || []) {
        img.run(im.chave, im.src, im.webp || '', im.altChave || '', im.largura || 0, im.altura || 0)
      }
      const gal = db.prepare('INSERT OR IGNORE INTO galeria (chave, abrir_chave) VALUES (?, ?)')
      const item = db.prepare(`INSERT OR IGNORE INTO galeria_item
        (id, galeria, ordem, tipo, src, webp, poster, legenda_chave, largura, altura)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      for (const g of semente.galerias || []) {
        gal.run(g.chave, g.abrir || '')
        g.itens.forEach((it, i) => item.run(it.id, g.chave, i + 1, it.tipo, it.src, it.webp || '', it.poster || '', it.legenda, it.largura || 0, it.altura || 0))
      }
      db.prepare(`INSERT INTO meta (chave, valor) VALUES ('semeada', '1')`).run()
    }
    db.exec('COMMIT')
  } catch (erro) {
    try { db.exec('ROLLBACK') } catch { /* já desfeito */ }
    throw erro
  }
}

export function chaveDeTexto(db, chave) {
  return !!db.prepare('SELECT 1 FROM texto WHERE chave = ? LIMIT 1').get(chave)
}

export function textosDoIdioma(db, idioma) {
  const mapa = {}
  for (const row of db.prepare('SELECT chave, valor FROM texto WHERE idioma = ?').all(idioma)) mapa[row.chave] = row.valor
  return mapa
}

export function textosDaChave(db, chave) {
  const mapa = {}
  for (const row of db.prepare('SELECT idioma, valor, pendente FROM texto WHERE chave = ?').all(chave)) {
    mapa[row.idioma] = { valor: row.valor, pendente: row.pendente }
  }
  return mapa
}

export function gravarTextos(db, chave, pares) {
  const st = db.prepare(`INSERT INTO texto (chave, idioma, valor, pendente) VALUES (?, ?, ?, ?)
    ON CONFLICT(chave, idioma) DO UPDATE SET valor = excluded.valor, pendente = excluded.pendente`)
  db.exec('BEGIN IMMEDIATE')
  try {
    for (const p of pares) st.run(chave, p.idioma, p.valor, p.pendente ? 1 : 0)
    db.exec('COMMIT')
  } catch (erro) {
    try { db.exec('ROLLBACK') } catch { /* já desfeito */ }
    throw erro
  }
}

export function listarPendentes(db) {
  return db.prepare('SELECT chave, idioma, valor FROM texto WHERE pendente = 1').all()
}

export function imagensMapa(db) {
  const mapa = {}
  for (const row of db.prepare('SELECT * FROM imagem').all()) mapa[row.chave] = row
  return mapa
}

export function lerImagem(db, chave) {
  return db.prepare('SELECT * FROM imagem WHERE chave = ?').get(chave) || null
}

export function salvarImagem(db, chave, dados) {
  db.prepare(`UPDATE imagem SET src = ?, webp = ?, largura = ?, altura = ? WHERE chave = ?`)
    .run(dados.src, dados.webp || '', dados.largura || 0, dados.altura || 0, chave)
}

export function galeriasCompletas(db) {
  return db.prepare('SELECT * FROM galeria').all().map((g) => ({
    ...g,
    itens: db.prepare('SELECT * FROM galeria_item WHERE galeria = ? ORDER BY ordem, id').all(g.chave),
  }))
}

export function galeriaExiste(db, chave) {
  return !!db.prepare('SELECT 1 FROM galeria WHERE chave = ?').get(chave)
}

export function itensDaGaleria(db, galeria) {
  return db.prepare('SELECT * FROM galeria_item WHERE galeria = ? ORDER BY ordem, id').all(galeria)
}

export function inserirItemDepois(db, item, depoisDe) {
  const atuais = db.prepare('SELECT id FROM galeria_item WHERE galeria = ? ORDER BY ordem, id').all(item.galeria).map((r) => r.id)
  const idx = atuais.indexOf(depoisDe)
  const pos = idx === -1 ? atuais.length : idx + 1
  atuais.splice(pos, 0, item.id)
  db.exec('BEGIN IMMEDIATE')
  try {
    db.prepare(`INSERT INTO galeria_item
      (id, galeria, ordem, tipo, src, webp, poster, legenda_chave, largura, altura)
      VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`).run(
      item.id, item.galeria, item.tipo, item.src, item.webp || '', item.poster || '', item.legenda_chave, item.largura || 0, item.altura || 0,
    )
    const ordem = db.prepare('UPDATE galeria_item SET ordem = ? WHERE id = ?')
    atuais.forEach((id, i) => ordem.run(i + 1, id))
    db.exec('COMMIT')
    return atuais
  } catch (erro) {
    try { db.exec('ROLLBACK') } catch { /* já desfeito */ }
    throw erro
  }
}

export function excluirItem(db, galeria, id) {
  const item = db.prepare('SELECT * FROM galeria_item WHERE id = ? AND galeria = ?').get(id, galeria)
  if (!item) return null
  db.exec('BEGIN IMMEDIATE')
  try {
    db.prepare('DELETE FROM galeria_item WHERE id = ?').run(id)
    db.prepare('DELETE FROM texto WHERE chave = ?').run(item.legenda_chave)
    const restantes = db.prepare('SELECT id FROM galeria_item WHERE galeria = ? ORDER BY ordem, id').all(galeria)
    const ordem = db.prepare('UPDATE galeria_item SET ordem = ? WHERE id = ?')
    restantes.forEach((row, i) => ordem.run(i + 1, row.id))
    db.exec('COMMIT')
    return item
  } catch (erro) {
    try { db.exec('ROLLBACK') } catch { /* já desfeito */ }
    throw erro
  }
}

export function listaVoluntarios(db) {
  const row = db.prepare(`SELECT valor FROM meta WHERE chave = 'voluntarios'`).get()
  if (row?.valor) {
    try {
      const lista = JSON.parse(row.valor)
      if (Array.isArray(lista) && lista.length) return lista.filter((id) => /^[a-z][a-z0-9-]{0,40}$/.test(id))
    } catch { /* lista antiga inválida */ }
  }
  const imgs = db.prepare(`SELECT chave FROM imagem WHERE chave LIKE 'img.volunteer.%' AND chave != 'img.volunteer.cabeca'`).all()
  const ids = imgs.map((r) => String(r.chave).replace(/^img\.volunteer\./, '')).filter((id) => /^[a-z][a-z0-9-]{0,40}$/.test(id))
  const ordem = ['matias', 'patrick', 'pamella']
  ids.sort((a, b) => {
    const ia = ordem.indexOf(a)
    const ib = ordem.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
  if (ids.length) {
    db.prepare(`INSERT INTO meta (chave, valor) VALUES ('voluntarios', ?)
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`).run(JSON.stringify(ids))
  }
  return ids
}

export function listaAfiliados(db) {
  const row = db.prepare(`SELECT valor FROM meta WHERE chave = 'afiliados'`).get()
  if (!row?.valor) return []
  try {
    const lista = JSON.parse(row.valor)
    if (!Array.isArray(lista)) return []
    return lista.filter((item) => item && typeof item.src === 'string' && typeof item.url === 'string').slice(0, 24)
  } catch {
    return []
  }
}

export function gravarListaAfiliados(db, lista) {
  db.prepare(`INSERT INTO meta (chave, valor) VALUES ('afiliados', ?)
    ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`).run(JSON.stringify(lista))
}

export function gravarListaVoluntarios(db, lista) {
  db.prepare(`INSERT INTO meta (chave, valor) VALUES ('voluntarios', ?)
    ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`).run(JSON.stringify(lista))
}

export function criarImagem(db, chave, dados) {
  db.prepare('INSERT INTO imagem (chave, src, webp, alt_chave, largura, altura) VALUES (?, ?, ?, ?, ?, ?)')
    .run(chave, dados.src, dados.webp || '', dados.alt_chave || '', dados.largura || 0, dados.altura || 0)
}

export function fotografar(db) {
  return {
    textos: db.prepare('SELECT chave, idioma, valor, pendente FROM texto').all(),
    imagens: db.prepare('SELECT chave, src, webp, alt_chave, largura, altura FROM imagem').all(),
    galerias: db.prepare('SELECT chave, abrir_chave FROM galeria').all(),
    itens: db.prepare('SELECT id, galeria, ordem, tipo, src, webp, poster, legenda_chave, largura, altura FROM galeria_item').all(),
    meta: db.prepare(`SELECT chave, valor FROM meta WHERE chave IN ('voluntarios', 'afiliados')`).all(),
  }
}

export function restaurar(db, snap) {
  db.exec('BEGIN IMMEDIATE')
  try {
    db.exec('DELETE FROM texto; DELETE FROM imagem; DELETE FROM galeria_item; DELETE FROM galeria;')
    const texto = db.prepare('INSERT INTO texto (chave, idioma, valor, pendente) VALUES (?, ?, ?, ?)')
    for (const t of snap.textos) texto.run(t.chave, t.idioma, t.valor, t.pendente || 0)
    const imagem = db.prepare('INSERT INTO imagem (chave, src, webp, alt_chave, largura, altura) VALUES (?, ?, ?, ?, ?, ?)')
    for (const im of snap.imagens) imagem.run(im.chave, im.src, im.webp || '', im.alt_chave || '', im.largura || 0, im.altura || 0)
    const galeria = db.prepare('INSERT INTO galeria (chave, abrir_chave) VALUES (?, ?)')
    for (const g of snap.galerias) galeria.run(g.chave, g.abrir_chave || '')
    const item = db.prepare(`INSERT INTO galeria_item
      (id, galeria, ordem, tipo, src, webp, poster, legenda_chave, largura, altura)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    for (const it of snap.itens) {
      item.run(it.id, it.galeria, it.ordem, it.tipo, it.src, it.webp || '', it.poster || '', it.legenda_chave, it.largura || 0, it.altura || 0)
    }
    const meta = db.prepare(`INSERT INTO meta (chave, valor) VALUES (?, ?)
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`)
    for (const m of snap.meta || []) {
      meta.run(m.chave, m.valor)
    }
    db.exec('COMMIT')
  } catch (erro) {
    try { db.exec('ROLLBACK') } catch { /* já desfeito */ }
    throw erro
  }
}

export function antesDeMudar(db, pasta, acao) {
  const snap = fotografar(db)
  db.prepare('INSERT INTO versao (quando, acao, snapshot) VALUES (?, ?, ?)').run(Date.now(), acao, JSON.stringify(snap))
  db.prepare('DELETE FROM versao WHERE id NOT IN (SELECT id FROM versao ORDER BY id DESC LIMIT 30)').run()
  try {
    mkdirSync(pasta, { recursive: true })
    const nome = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}.json`
    writeFileSync(join(pasta, nome), JSON.stringify(snap))
    const arquivos = readdirSync(pasta).filter((n) => n.endsWith('.json')).sort()
    while (arquivos.length > 20) rmSync(join(pasta, arquivos.shift()), { force: true })
  } catch { /* a versão no banco continua sendo a cópia */ }
}

export function desfazer(db) {
  const row = db.prepare('SELECT id, snapshot FROM versao ORDER BY id DESC LIMIT 1').get()
  if (!row) return false
  restaurar(db, JSON.parse(row.snapshot))
  db.prepare('DELETE FROM versao WHERE id = ?').run(row.id)
  return true
}

export function listarVersoes(db) {
  return db.prepare('SELECT id, quando, acao FROM versao ORDER BY id DESC LIMIT 30').all()
}

export function lerVersao(db, id) {
  return db.prepare('SELECT id, snapshot FROM versao WHERE id = ?').get(id) || null
}

export function auditar(db, acao, ip, detalhe) {
  db.prepare('INSERT INTO auditoria (quando, acao, ip, detalhe) VALUES (?, ?, ?, ?)').run(Date.now(), acao, String(ip || ''), String(detalhe || '').slice(0, 300))
}

export function usoDeArquivo(db, src) {
  const a = db.prepare('SELECT COUNT(*) AS n FROM galeria_item WHERE src = ? OR webp = ? OR poster = ?').get(src, src, src)
  const b = db.prepare('SELECT COUNT(*) AS n FROM imagem WHERE src = ? OR webp = ?').get(src, src)
  return a.n + b.n
}
