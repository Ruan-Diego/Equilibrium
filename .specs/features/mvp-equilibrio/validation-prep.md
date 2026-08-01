# MVP Equilíbrio — Smoke UAT checklist (T19)

**Date**: 2026-08-01  
**Build gate**: `npm test && npm run build` (see result below)  
**Environment**: local workspace `D:\GitHub\Equilibrium` on `main`  
**Firebase `.env`**: **MISSING** — interactive Auth/Firestore UAT blocked until `.env` is filled from `.env.example` and a Firebase project is configured.

## Automated gate

| Check | Result |
|-------|--------|
| `npm test` | PASS — 13 passed, 0 failed (2 files) |
| `npm run build` | PASS (`base: '/Equilibrium/'`, `dist/404.html` present) |

## Interactive smoke (from Success Criteria + AC)

Status legend: `pass` | `fail` | `blocked` | `pending`

### 1. Login (AUTH-01)

| Step | Expected | Status | Notes |
|------|----------|--------|-------|
| Abrir app sem sessão | Tela `/login` | blocked | Sem `VITE_FIREBASE_*` Auth não inicializa de forma útil |
| Login Google ou e-mail/senha | Redireciona Home; dados só do `uid` | blocked | Requer Firebase Auth + Authorized domains |
| Logout | Volta ao login | blocked | Depende do item acima |

### 2. CRUD de áreas (AREA-01 / AREA-02)

| Step | Expected | Status | Notes |
|------|----------|--------|-------|
| Criar área com nome válido | Persiste; aparece na Home (score inicial 5) | blocked | Requer Firestore + rules deployadas |
| Nome vazio | Criação recusada | blocked | UI implementada; não exercitada live |
| Renomear / reordenar | Persiste após refresh | blocked | — |
| Arquivar | Some da Home ativa; histórico não corrompido | blocked | — |

### 3. Slider / atenção (ATTN-01 / ATTN-02)

| Step | Expected | Status | Notes |
|------|----------|--------|-------|
| Soltar slider em valor V | Score = V; evento no histórico; UI atualiza | blocked | Requer Auth + Firestore |
| Valor fora 0–10 | Clamp/rejeição | pending | Coberto por domain tests (`score`); UI usa clamp |
| Falha de gravação | Toast + revert do slider | blocked | Precisa Firebase / simulação de falha |

### 4. Estados emocionais + equilíbrio ≥ 8 (HOME-01 / HOME-02)

| Step | Expected | Status | Notes |
|------|----------|--------|-------|
| Score 8–10 | Estado saudável | blocked | Visual wired; live check blocked |
| Score 5–7 | Estado atenção | blocked | — |
| Score 0–4 | Estado alerta + microcopy | blocked | — |
| Todas áreas ≥ 8 | Indicador “Equilibrado” | blocked | Regra `isBalanced` coberta por unit tests |
| Qualquer área ≤ 7 | Não equilibrado; destaca quem pede atenção | blocked | — |
| Zero áreas | Empty state convidando criar | blocked | Empty copy wired; live blocked |

### 5. Histórico (HIST-01)

| Step | Expected | Status | Notes |
|------|----------|--------|-------|
| Com eventos | Gráfico step da área selecionada | blocked | Recharts + `useAreaHistory` wired |
| Range 7 / 30 / all | Filtra série | blocked | — |
| Sem eventos / sem áreas | Empty states explicativos | blocked | Implementado; live blocked |

### 6. Success Criteria (end-to-end)

| Criterion | Status | Notes |
|-----------|--------|-------|
| Login → criar áreas → registrar atenção → ver alerta → ver gráfico no Pages | blocked | Sem Firebase local; Pages deploy workflow existe mas ainda não publicado neste ambiente |
| Dados sobrevivem refresh / segundo dispositivo | blocked | Depende de Firestore + Auth |
| UI transmite urgência em scores baixos sem parecer erro técnico | pending | Tokens `--alert` / labels presentes; validação visual humana após `.env` |

## Unblock path

1. Copiar `.env.example` → `.env` e preencher `VITE_FIREBASE_*`.
2. Ativar Auth (Google + e-mail/senha) e Authorized domain (`localhost`, depois `*.github.io`).
3. Deploy `firestore.rules`.
4. `npm run dev` e reexecutar os itens `blocked` acima; marcar `pass`/`fail`.
5. (Opcional) Secrets `VITE_FIREBASE_*` no GitHub Actions + Pages Source = Actions; revalidar no URL `/Equilibrium/`.

## Out of scope this checklist

- BAL-01 (P2 polish), DECAY-01 (P3) — não MVP.
