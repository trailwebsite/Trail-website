# Domínio pendente

Nota para retomar a passagem do site para o domínio oficial. Parado em 9 de novembro de 2026.

O domínio oficial é `incabrailletrail.org`. O `www.incabrailletrail.com` anotado no projeto ficou para trás.

## Já feito

- Namecheap: convite aceito. A conta enxerga o domínio `incabrailletrail.org`.
- Cloudflare do projeto: `trail.sanctuary.build@gmail.com`, conta `47fefac47b94a1d88bf43e36dc50b902`.
- Git ligado nessa conta. Repositório `trailwebsite/Trail-website`, branch `main`. Projeto Pages `incabrailletrail`.
- Build: comando vazio, pasta de saída `site`.
- O site dessa conta abre em `https://incabrailletrail-436.pages.dev`. O `baseUrl` em `src/site.json` aponta para esse endereço, para o canonical não cair no teste antigo.
- `incabrailletrail.org` e `www.incabrailletrail.org` já foram adicionados no projeto Pages. Os dois estão pendentes, à espera do CNAME.

A conta pessoal `kiron.garcia.trabajo@gmail.com` não entra nesta passagem. O teste antigo continua em `https://incabrailletrail.pages.dev`.

Não clicar de novo em **Begin setup** na Cloudflare. O projeto já existe. Outro clique cria um segundo.

## O que falta

1. Na Namecheap, no domínio `incabrailletrail.org`, apagar o redirecionamento (ícone da lixeira). Ele manda o domínio para outro endereço.
2. Em **Advanced DNS**, criar dois CNAME, os dois com valor `incabrailletrail-436.pages.dev`:
   - Host `www`
   - Host `@`
3. Esperar os dois domínios ficarem ativos no Pages.
4. Só então, em `src/site.json`, trocar `baseUrl` para `https://incabrailletrail.org` e `dominioPretendido` para `incabrailletrail.org`. Gerar o site de novo e publicar pelo Git.

`robotsNoindex` continua `true`. Formulário, textos finais e Google ficam para o dia de abrir ao público.
