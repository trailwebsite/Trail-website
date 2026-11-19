// base-site — render puro das páginas do site (templates + i18n), usado pelo build e pelo Publish do painel
export const IDIOMAS = [
  { code: 'en', prefix: '' },
  { code: 'es', prefix: 'es' },
]
export const PAGINAS = [
  { id: 'home', rota: '' },
  { id: 'educational', rota: 'educational-trail' },
  { id: 'sensory', rota: 'sensory-trail' },
  { id: 'volunteer', rota: 'volunteer' },
  { id: 'sponsors', rota: 'sponsors' },
  { id: 'donations', rota: 'donations' },
  { id: 'app', rota: 'app' },
]
// barra larga: Home abre as trilhas (e a própria Home); Patrocinadores abre Doações
// soMovel: no celular essas páginas entram só na caixa do Home
const MENU = [
  {
    id: 'home',
    filhos: [
      { id: 'home' },
      { id: 'educational' },
      { id: 'sensory' },
      { id: 'volunteer', soMovel: true },
      { inscricao: true, soMovel: true },
      { id: 'sponsors', soMovel: true },
      { id: 'donations', soMovel: true },
      { id: 'app', soMovel: true },
    ],
  },
  { id: 'volunteer', soLargo: true, filhos: [{ id: 'volunteer' }, { inscricao: true }] },
  {
    id: 'sponsors',
    soLargo: true,
    filhos: [
      { id: 'sponsors' },
      { id: 'donations' },
    ],
  },
  { id: 'app', filhos: [] },
]
const POR_ID = Object.fromEntries(PAGINAS.map((p) => [p.id, p]))
const OG_LOCALE = { en: 'en_US', es: 'es_PE', pt: 'pt_BR', ko: 'ko_KR', ja: 'ja_JP', zh: 'zh_CN' }
const GOOGLE_HL = { en: 'en', es: 'es', pt: 'pt', ko: 'ko', ja: 'ja', zh: 'zh-CN' }

// formulário Google — o hl troca o idioma das frases do próprio Google
function googleFormComIdioma(url, codigo) {
  if (!url) return ''
  try {
    const u = new URL(url)
    u.searchParams.set('embedded', 'true')
    u.searchParams.set('hl', GOOGLE_HL[codigo] || 'en')
    return u.href
  } catch {
    return url
  }
}

// caminho público — raiz do site, sempre com barra final
export function caminho(idioma, pagina) {
  const partes = [idioma.prefix, pagina.rota].filter(Boolean)
  return partes.length ? `/${partes.join('/')}/` : '/'
}

function escapar(texto) {
  return String(texto)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

// texto de menu — rótulos que o dono não edita (botão do menu, idioma)
function textoTravado(valor) {
  return `<span data-edit="locked">${escapar(valor)}</span>`
}

// rótulo clicável do menu — o painel pergunta se é para editar ou abrir a página
function textoMenu(chave, valor) {
  const seguro = escapar(valor).replaceAll('\n', '<br>')
  return `<span data-edit-key="${escapar(chave)}" data-edit-type="text" data-edit-nav="1">${seguro}</span>`
}

// texto que o dono pode editar; chave estável por idioma
function textoEditavel(chave, valor) {
  const seguro = escapar(valor).replaceAll('\n', '<br>')
  if (chave.startsWith('t.nav.')) return textoTravado(valor)
  if (!/^(t\.|contas\.|contato\.)/.test(chave)) return seguro
  return `<span data-edit-key="${escapar(chave)}" data-edit-type="text">${seguro}</span>`
}

// o miolo do elemento, fora de title e de atributo
function editavelAqui(template, index) {
  const ate = template.slice(0, index)
  const fecha = ate.lastIndexOf('>')
  const abre = fecha >= 0 ? ate.lastIndexOf('<', fecha) : -1
  if (abre >= 0 && ate.lastIndexOf('<') > fecha) return false
  const tag = abre >= 0 ? ate.slice(abre, fecha + 1) : ''
  if (tag.includes('data-edit-key')) return false
  const titulo = ate.lastIndexOf('<title')
  const tituloFim = ate.lastIndexOf('</title>')
  if (titulo > tituloFim) return false
  return true
}

function buscar(obj, chave) {
  return chave.split('.').reduce((acc, parte) => (acc == null ? undefined : acc[parte]), obj)
}

// render — troca {{chave}} (escapado) e {{{chave}}} (HTML cru); chave ausente derruba o build
function render(template, ctx) {
  return template.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}|\{\{\s*([\w.]+)\s*\}\}/g, (trecho, cru, esc, offset) => {
    const chave = cru || esc
    const valor = buscar(ctx, chave)
    if (valor === undefined) throw new Error(`Chave ausente no template: ${chave}`)
    if (cru) return String(valor)
    const texto = String(valor)
    if (!editavelAqui(template, offset)) return escapar(texto)
    return textoEditavel(chave, texto)
  })
}

// galerias — chave estável e id de cada item, sem mudar a ordem do HTML
function prepararGalerias(html) {
  return html.replace(/<ul class="galeria">([\s\S]*?)<\/ul>/g, (tudo, miolo, offset) => {
    const antes = html.slice(Math.max(0, offset - 900), offset)
    const marcas = [...antes.matchAll(/data-galeria="([^"]+)"/g)]
    const id = marcas.length ? marcas[marcas.length - 1][1] : 'galeria'
    const abrir = (miolo.match(/aria-label="\{\{\s*([^}]+?)\s*\}\}/) || [])[1] || ''
    let n = 0
    let corpo = miolo.replace(/<li class="galeria-item">/g, () => {
      n += 1
      return `<li class="galeria-item" data-item-id="${id}-${n}">`
    })
    corpo = corpo.replace(/data-legenda="\{\{\s*([^}]+?)\s*\}\}"/g, (_, chave) => {
      return `data-legenda="{{${chave}}}" data-legenda-chave="${chave}"`
    })
    const abrirAttr = abrir ? ` data-abrir-chave="${abrir}"` : ''
    return `<ul class="galeria" data-edit-key="galeria.${id}" data-edit-type="gallery"${abrirAttr}>${corpo}</ul>`
  })
}

// interpolar — substitui {siteName} e afins dentro das strings de tradução
function interpolar(valor, vars) {
  if (typeof valor === 'string') return valor.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m))
  if (Array.isArray(valor)) return valor.map((v) => interpolar(v, vars))
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, interpolar(v, vars)]))
  }
  return valor
}

function linkNav(t, idioma, id, paginaAtual, classe, extra) {
  if (extra && extra.inscricao) {
    const cls = classe ? ` class="${classe} nav-inscricao"` : ' class="nav-inscricao"'
    return `<a${cls} href="${caminho(idioma, POR_ID.volunteer)}#inscricao">${textoMenu('t.volunteer.signNow', t.volunteer.signNow)}</a>`
  }
  const pagina = POR_ID[id]
  const atual = id === paginaAtual.id ? ' aria-current="page"' : ''
  const cls = classe ? ` class="${classe}"` : ''
  return `<a${cls} href="${caminho(idioma, pagina)}"${atual}>${textoMenu(`t.nav.${id}`, t.nav[id])}</a>`
}

function navHtml(t, idioma, paginaAtual) {
  return MENU.map((item) => {
    const filhos = item.filhos
    if (!filhos.length) return `<li class="so-largo">${linkNav(t, idioma, item.id, paginaAtual, 'maiusculas')}</li>`
    const naSecao = item.id === paginaAtual.id || filhos.some((filho) => !filho.soMovel && filho.id === paginaAtual.id)
    const largo = item.soLargo ? ' so-largo' : ''
    const secao = naSecao ? ` class="tem-menu secao-atual${largo}"` : ` class="tem-menu${largo}"`
    const itens = filhos.map((filho) => {
      const classe = filho.soMovel ? ' class="so-movel"' : ''
      if (filho.inscricao) return `<li${classe}>${linkNav(t, idioma, 'volunteer', paginaAtual, '', { inscricao: true })}</li>`
      return `<li${classe}>${linkNav(t, idioma, filho.id, paginaAtual, '')}</li>`
    }).join('')
    const rotulo = `${escapar(t.nav.open)}: ${escapar(t.nav[item.id])}`
    return `<li${secao}>${linkNav(t, idioma, item.id, paginaAtual, 'maiusculas')}<button class="submenu-botao" type="button" aria-expanded="false" aria-controls="submenu-${item.id}"><span class="oculto-visual">${rotulo}</span></button><ul class="submenu" id="submenu-${item.id}" aria-label="${escapar(t.nav[item.id])}">${itens}</ul></li>`
  }).join('\n          ')
}

function idiomasHtml(traducoes, idiomaAtual, pagina) {
  return IDIOMAS.map((idioma) => {
    const t = traducoes[idioma.code]
    const atual = idioma.code === idiomaAtual.code
    const marca = atual ? ` aria-current="true"` : ''
    const nota = atual ? ` <span class="oculto-visual">${escapar(t.lang.current)}</span>` : ''
    return `<li><a href="${caminho(idioma, pagina)}" lang="${t.htmlLang}" hreflang="${t.hreflang}"${marca}>${escapar(t.name)}${nota}</a></li>`
  }).join('\n              ')
}

function alternatesHtml(site, traducoes, pagina) {
  const linhas = IDIOMAS.map((idioma) => {
    const t = traducoes[idioma.code]
    return `<link rel="alternate" hreflang="${t.hreflang}" href="${site.baseUrl}${caminho(idioma, pagina)}">`
  })
  linhas.push(`<link rel="alternate" hreflang="x-default" href="${site.baseUrl}${caminho(IDIOMAS[0], pagina)}">`)
  return linhas.join('\n  ')
}

// blocoHtml — um item de conteúdo de caixa: parágrafo, destaque ou lista
function blocoHtml(item, chave) {
  if (typeof item === 'string') return `<p>${textoEditavel(chave, item)}</p>`
  if (item.lead) return `<p class="destaque">${textoEditavel(`${chave}.lead`, item.lead)}</p>`
  if (item.list) return `<ul class="lista">${item.list.map((i, n) => `<li>${textoEditavel(`${chave}.list.${n}`, i)}</li>`).join('')}</ul>`
  throw new Error(`Bloco de caixa desconhecido: ${JSON.stringify(item)}`)
}

// caixaHtml — caixa que abre e fecha: botão dentro de h2 e painel; o JS fecha ao carregar
function caixaHtml(id, titulo, chaveTitulo, corpo) {
  return `<section class="caixa">
      <h2 class="caixa-titulo"><button class="caixa-botao" type="button" id="${id}-botao" aria-expanded="true" aria-controls="${id}">${textoEditavel(chaveTitulo, titulo)}</button></h2>
      <div class="caixa-painel" id="${id}" role="region" aria-labelledby="${id}-botao">
        ${corpo}
      </div>
    </section>`
}

// caixasTexto — caixas só de texto, vindas do JSON de idioma (boxes[]); a ordem é a do arquivo
function caixasTexto(pagina, boxes) {
  return boxes.map((caixa, i) =>
    caixaHtml(
      `caixa-${pagina.id}-${i + 1}`,
      caixa.title,
      `t.${pagina.id}.boxes.${i}.title`,
      caixa.content.map((item, j) => blocoHtml(item, `t.${pagina.id}.boxes.${i}.content.${j}`)).join('\n        '),
    ),
  )
}

// por enquanto o cliente só quer info@; os outros endereços ficam fora da página
const EMAILS_DA_PAGINA = {
  home: ['info'],
  educational: ['info'],
  sensory: ['info'],
  volunteer: ['info'],
  sponsors: ['info'],
  donations: ['info'],
  app: ['info'],
}

function contatoHtml(t, site, pagina) {
  const c = t.contact
  const emails = EMAILS_DA_PAGINA[pagina.id].map((chave) =>
    `<li><span class="email" data-edit-key="contato.email.${chave}" data-edit-type="text">${escapar(site.contato.emails[chave])}</span></li>`,
  ).join('\n              ')
  return `<section class="contato" aria-labelledby="contato-titulo">
      <div class="contato-interno">
        <h2 id="contato-titulo">${textoEditavel('t.contact.heading', c.heading)}</h2>
        <dl class="contato-lista">
          <div>
            <dt>${textoEditavel('t.contact.placeLabel', c.placeLabel)}</dt>
            <dd>${textoEditavel('t.contact.place', c.place)}<br>
              <a class="botao botao-leve" href="${site.contato.mapa}" target="_blank" rel="noopener noreferrer">${textoEditavel('t.contact.mapButton', c.mapButton)} <span class="externo">${textoEditavel('t.external', t.external)}</span></a>
            </dd>
          </div>
          <div>
            <dt>${textoEditavel('t.contact.phoneLabel', c.phoneLabel)}</dt>
            <dd><a data-href-chave="contato.telefone" data-href-prefixo="tel:" href="tel:${site.contato.telefone.replaceAll(' ', '')}">${textoEditavel('contato.telefone', site.contato.telefone)}</a><br>
              <a href="${site.contato.whatsapp}" target="_blank" rel="noopener noreferrer">${textoEditavel('t.contact.whatsappLink', c.whatsappLink)} <span class="externo">${textoEditavel('t.external', t.external)}</span></a>
            </dd>
          </div>
          <div>
            <dt>${textoEditavel('t.contact.socialLabel', c.socialLabel)}</dt>
            <dd>Instagram: ${textoEditavel('t.contact.tbc', c.tbc)}<br>Facebook: ${textoEditavel('t.contact.tbc', c.tbc)}</dd>
          </div>
          <div>
            <dt>${textoEditavel('t.contact.emailsLabel', c.emailsLabel)}</dt>
            <dd><ul>${emails}</ul></dd>
          </div>
        </dl>
      </div>
    </section>`
}

// montarFontes — interpola as traduções e prepara os templates; o resultado pode ficar em cache
export function montarFontes(site, i18nPorCodigo, layout, templatesCrus) {
  const vars = { siteName: site.siteName, dominio: site.dominioPretendido }
  const traducoes = {}
  for (const idioma of IDIOMAS) traducoes[idioma.code] = interpolar(i18nPorCodigo[idioma.code], vars)
  const templates = {}
  for (const p of PAGINAS) templates[p.id] = prepararGalerias(templatesCrus[p.id])
  return { site, traducoes, layout, templates }
}

// gerarPaginaBase — o HTML de uma página, idêntico ao do build, antes do conteúdo do banco
export function gerarPaginaBase(fontes, codigoIdioma, idPagina, ano) {
  const { site, traducoes, layout, templates } = fontes
  const idioma = IDIOMAS.find((i) => i.code === codigoIdioma)
  const pagina = POR_ID[idPagina]
  if (!idioma || !pagina) throw new Error(`Página desconhecida: ${codigoIdioma}/${idPagina}`)
  const t = traducoes[idioma.code]
  const robots = site.robotsNoindex ? '<meta name="robots" content="noindex">' : ''
  const recepcao = typeof site.recepcao === 'string' ? site.recepcao.trim() : ''
  const formsAtivos = recepcao.includes('@')
  const formAction = formsAtivos ? `https://formsubmit.co/ajax/${recepcao}` : ''
  const googleFormBase = site.googleForms && typeof site.googleForms.voluntario === 'string'
    ? site.googleForms.voluntario.trim()
    : ''
  const googleFormDoacaoBase = site.googleForms && typeof site.googleForms.doacao === 'string'
    ? site.googleForms.doacao.trim()
    : ''
  const googleFormAfiliadoBase = site.googleForms && typeof site.googleForms.afiliado === 'string'
    ? site.googleForms.afiliado.trim()
    : ''
  const ctx = {
    siteName: site.siteName,
    formAction,
    formsAtivos: String(formsAtivos),
    googleFormVoluntario: googleFormComIdioma(googleFormBase, idioma.code),
    googleFormDoacao: googleFormComIdioma(googleFormDoacaoBase, idioma.code),
    googleFormAfiliado: googleFormComIdioma(googleFormAfiliadoBase, idioma.code),
    contas: site.doacao,
    htmlLang: t.htmlLang,
    title: t[pagina.id].title,
    titleKey: `t.${pagina.id}.title`,
    description: t[pagina.id].description,
    descriptionKey: `t.${pagina.id}.description`,
    canonical: `${site.baseUrl}${caminho(idioma, pagina)}`,
    ogImage: `${site.baseUrl}/img/og.png`,
    ogLocale: OG_LOCALE[idioma.code],
    robots,
    alternates: alternatesHtml(site, traducoes, pagina),
    year: ano,
    t,
    url: Object.fromEntries(PAGINAS.map((p) => [p.id, caminho(idioma, p)])),
    paginaId: pagina.id,
    navItems: navHtml(t, idioma, pagina),
    langItems: idiomasHtml(traducoes, idioma, pagina),
    contato: contatoHtml(t, site, pagina),
    apelo: pagina.id === 'home'
      ? t.volunteer.boxes[0].content.map((item, j) => blocoHtml(item, `t.volunteer.boxes.0.content.${j}`)).join('\n          ')
      : '',
    caixa: caixasTexto(pagina, t[pagina.id].boxes || []),
    cartaz: {
      jpg: `/img/${site.cartaz.arquivo}.jpg`,
      webp: `/img/${site.cartaz.arquivo}.webp`,
      largura: site.cartaz.largura,
      altura: site.cartaz.altura,
    },
    voluntarioAtivo: String(formsAtivos),
  }
  ctx.content = render(templates[pagina.id], ctx)
  return render(layout, ctx)
}
