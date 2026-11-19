// traducao — detecta o idioma escrito e traduz para os idiomas do site
const NOMES = { en: 'English', es: 'Spanish', pt: 'Portuguese (Brazil)', ko: 'Korean', ja: 'Japanese', zh: 'Chinese (Simplified)' }
const DEEPL = { en: 'EN', es: 'ES', pt: 'PT-BR', ko: 'KO', ja: 'JA', zh: 'ZH' }
const GOOGLE = { en: 'en', es: 'es', pt: 'pt', ko: 'ko', ja: 'ja', zh: 'zh-CN' }

export function detectarIdioma(texto, fallback = 'en') {
  const t = String(texto || '')
  if (/[\uac00-\ud7af]/.test(t)) return 'ko'
  if (/[\u3040-\u30ff]/.test(t)) return 'ja'
  if (/[\u4e00-\u9fff]/.test(t)) return 'zh'
  if (/[ñ¿¡]|\b(el|la|los|las|ción|ciones)\b/i.test(t)) return 'es'
  if (/[ãõ]|ção\b|\b(não|você)\b/i.test(t)) return 'pt'
  if (/[a-z]/i.test(t)) return 'en'
  return fallback
}

const MEMORIA = { en: 'en', es: 'es', pt: 'pt', ko: 'ko', ja: 'ja', zh: 'zh-CN' }

async function memoria(texto, de, para) {
  const pedacos = []
  let resto = String(texto || '')
  while (resto.length > 450) {
    let corte = resto.lastIndexOf(' ', 450)
    if (corte < 80) corte = 450
    pedacos.push(resto.slice(0, corte))
    resto = resto.slice(corte).trimStart()
  }
  if (resto) pedacos.push(resto)
  const saida = []
  for (const pedaco of pedacos) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(pedaco)}&langpair=${MEMORIA[de] || de}|${MEMORIA[para] || para}`
    const resposta = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!resposta.ok) throw new Error('traducao')
    const json = await resposta.json()
    const valor = json.responseData?.translatedText || ''
    if (!valor || /MYMEMORY WARNING/i.test(valor)) throw new Error('traducao')
    saida.push(valor)
  }
  return saida.join(' ')
}

async function deepl(texto, destino, env) {
  const base = env.DEEPL_URL || 'https://api-free.deepl.com/v2/translate'
  const resposta = await fetch(base, {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: { Authorization: `DeepL-Auth-Key ${env.TRADUCAO_CHAVE}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: [texto], target_lang: DEEPL[destino] }),
  })
  if (!resposta.ok) throw new Error('traducao')
  const json = await resposta.json()
  return json.translations?.[0]?.text || ''
}

async function google(texto, destino, env) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(env.TRADUCAO_CHAVE)}`
  const resposta = await fetch(url, {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: texto, target: GOOGLE[destino], format: 'text' }),
  })
  if (!resposta.ok) throw new Error('traducao')
  const json = await resposta.json()
  return json.data?.translations?.[0]?.translatedText || ''
}

async function anthropic(texto, fonte, destinos, env) {
  const lista = destinos.map((c) => `${c} (${NOMES[c] || c})`).join(', ')
  const resposta = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal: AbortSignal.timeout(30000),
    headers: {
      'x-api-key': env.TRADUCAO_CHAVE,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: env.TRADUCAO_MODELO || 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Translate the text from ${fonte} into ${lista}. Reply with JSON only, keys are the language codes, values are plain text. Do not add HTML.\n\n${texto}`,
      }],
    }),
  })
  if (!resposta.ok) throw new Error('traducao')
  const json = await resposta.json()
  const bruto = json.content?.map((p) => p.text || '').join('') || ''
  const inicio = bruto.indexOf('{')
  const fim = bruto.lastIndexOf('}')
  if (inicio < 0 || fim < inicio) throw new Error('traducao')
  return JSON.parse(bruto.slice(inicio, fim + 1))
}

// o idioma editado guarda o HTML; os outros recebem só o texto visível
export function manterFormato(pares, visivel, html, idiomaPagina = 'en') {
  const fonte = detectarIdioma(visivel, idiomaPagina || 'en')
  return pares.map((p) => (p.idioma === fonte ? { ...p, valor: html } : p))
}

// devolve um mapa idioma -> { valor, pendente }
export async function traduzirTodos(texto, fonte, idiomas, env = process.env) {
  const saida = {}
  for (const idioma of idiomas) {
    if (idioma === fonte) saida[idioma] = { valor: texto, pendente: 0 }
    else saida[idioma] = { valor: texto, pendente: 1 }
  }
  const provedor = (env.TRADUCAO_PROVEDOR || '').toLowerCase()
  const destinos = idiomas.filter((c) => c !== fonte)
  if (!provedor || !env.TRADUCAO_CHAVE) {
    for (const idioma of destinos) {
      try {
        const valor = await memoria(texto, fonte, idioma)
        if (valor) saida[idioma] = { valor, pendente: 0 }
      } catch {
        saida[idioma] = { valor: texto, pendente: 1 }
      }
    }
    return saida
  }
  try {
    if (provedor === 'anthropic' || provedor === 'claude') {
      const mapa = await anthropic(texto, fonte, destinos, env)
      for (const idioma of destinos) {
        if (typeof mapa[idioma] === 'string' && mapa[idioma]) saida[idioma] = { valor: mapa[idioma], pendente: 0 }
      }
      return saida
    }
    for (const idioma of destinos) {
      try {
        const valor = provedor === 'google' ? await google(texto, idioma, env) : await deepl(texto, idioma, env)
        if (valor) saida[idioma] = { valor, pendente: 0 }
      } catch {
        saida[idioma] = { valor: texto, pendente: 1 }
      }
    }
  } catch {
    return saida
  }
  return saida
}
