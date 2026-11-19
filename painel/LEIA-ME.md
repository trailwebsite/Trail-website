# Painel de edição

O site público continua estático. O painel é um servidor Node 22 que serve a pasta `site/` e grava as mudanças num SQLite local.

## Subir

Na pasta `landing-page`, com o Node 22:

```
npm install
npm run build
npm run painel
```

O terminal imprime o link de registro. Ele só funciona enquanto não existe dono. Entregue esse link ao cliente uma vez. Depois do primeiro cadastro a página responde "não encontrado".

O login é o e-mail cadastrado e a senha, em qualquer computador. O correio só entra se alguém pedir "esqueci a senha". Copie `.env.example` para `.env` e preencha o `SETUP_TOKEN` e o `SESSION_SECRET`.

Em HTTPS, use `PAINEL_SEGURO=1`. Atrás de proxy, `PAINEL_PROXY=1`.

## Trocar o e-mail

Não há tela para isso. No servidor:

```
node painel/trocar-email.mjs novo@email.com
```

## Testes

```
npm run test:painel
```
