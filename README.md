# Equilibrium

Espelho visual do equilíbrio da atenção entre áreas da vida.

App pessoal: áreas com nota **0–10** (slider), histórico no Firebase, front no GitHub Pages. Visual minimalista escuro.

## Documentação do projeto

Tudo o que foi alinhado até agora está em [`.specs/`](.specs/):

| Doc | Conteúdo |
|-----|----------|
| [PROJECT.md](.specs/PROJECT.md) | Visão, stack, arquitetura |
| [STATE.md](.specs/STATE.md) | Decisões (AD-*) e handoff |
| [spec.md](.specs/features/mvp-equilibrio/spec.md) | Requisitos MVP |
| [context.md](.specs/features/mvp-equilibrio/context.md) | Decisões de produto |
| [design.md](.specs/features/mvp-equilibrio/design.md) | Arquitetura e UI |
| [tasks.md](.specs/features/mvp-equilibrio/tasks.md) | Tasks atômicas T1–T19 |

## Stack

React + Vite + TypeScript + Tailwind + shadcn/ui + Firebase (Auth + Firestore) + GitHub Pages.

## Setup local

### 1. Dependências

```bash
npm ci
```

### 2. Projeto Firebase

1. Crie um projeto em [Firebase Console](https://console.firebase.google.com/).
2. Ative **Authentication**:
   - Provider **Google**
   - Provider **E-mail/senha**
3. Crie um app **Web** e copie a config do SDK.
4. Ative **Cloud Firestore** (modo production; as rules do repo restringem por uid).

### 3. Variáveis de ambiente

Copie `.env.example` para `.env` (nunca commitar `.env`):

```bash
cp .env.example .env
```

Preencha com os valores do app Web:

| Variável | Origem |
|----------|--------|
| `VITE_FIREBASE_API_KEY` | Firebase config `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

As chaves `VITE_*` ficam no bundle do cliente (normal no Firebase). Segurança real vem das **Firestore rules** e dos **Authorized domains** no Auth.

### 4. Domínio autorizado (GitHub Pages)

No Firebase Console → Authentication → Settings → **Authorized domains**, adicione:

- `localhost` (já costuma existir)
- `<user>.github.io` (domínio do GitHub Pages deste repo)

### 5. Deploy das Firestore rules

O arquivo [`firestore.rules`](firestore.rules) restringe `users/{uid}/**` ao dono autenticado (`request.auth.uid == uid`).

Com Firebase CLI logado no projeto:

```bash
firebase deploy --only firestore:rules
```

(Ou cole o conteúdo de `firestore.rules` no console Firestore → Rules → Publish.)

### 6. Rodar o app

```bash
npm run dev
```

Build e testes:

```bash
npm test
npm run build
```

## GitHub Pages

O Vite usa `base: '/Equilibrium/'` (nome do repositório). O fallback SPA está em `public/404.html` (copiado automaticamente para `dist/` no build).

### Ativar Pages (fonte = GitHub Actions)

1. Repo → **Settings** → **Pages**.
2. Em **Build and deployment** → **Source**, escolha **GitHub Actions** (não “Deploy from a branch”).
3. Faça push em `main` (ou rode o workflow **Deploy GitHub Pages** manualmente em Actions).
4. O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) faz `npm ci` → `npm run build` → sobe o artifact `dist` (inclui `404.html`) → `deploy-pages`.
5. Abra `https://<user>.github.io/Equilibrium/`.

Opcional: configure os mesmos `VITE_FIREBASE_*` como **Actions secrets** do repositório para o build de produção embutir a config do Firebase. Sem eles o site sobe, mas Auth/Firestore não funcionam até preencher.

## Status

MVP em implementação (tasks T1–T19 em `.specs/features/mvp-equilibrio/tasks.md`).
