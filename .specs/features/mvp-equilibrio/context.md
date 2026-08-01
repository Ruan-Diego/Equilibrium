# MVP Equilíbrio — Context

**Gathered:** 2026-08-01  
**Spec:** `.specs/features/mvp-equilibrio/spec.md`  
**Status:** Ready for design

---

## Feature Boundary

MVP: autenticação Firebase, CRUD de áreas da vida, ajuste manual de nota via slider 0–10, home com estados visuais, histórico/gráficos, deploy GitHub Pages + Firestore. Sem IA, sem decaimento automático, sem integrações externas.

---

## Implementation Decisions

### Mecânica de pontos / registro de atenção

- A nota de cada área é um **slider vertical** com escala fixa **0 a 10** (inteiros; se precisar de meio ponto, decidir no design — default: inteiros 0–10).
- O usuário **define o valor atual** diretamente (não há botões +/− nem presets de delta).
- Toda mudança no slider (commit da nova posição) **persiste** o novo score e gera registro de histórico (`AttentionEvent` com valor anterior → novo, ou `value` absoluto + timestamp).
- Não há “ganhar/perder pontos” como ações separadas — o equilíbrio é o conjunto das posições dos sliders.

### Decaimento automático

- **Desligado.** Scores só mudam por ação explícita do usuário no slider.

### O que é “equilíbrio”

- O usuário está **equilibrado** quando **todas** as áreas ativas estão com score **acima de 7** (ou seja, ≥ 8 na escala inteira 0–10 — ver nota de precisão abaixo).
- Se qualquer área estiver ≤ 7, o conjunto **não** está equilibrado; a UI deve deixar isso claro (home / indicador geral).
- Gráficos por área continuam no MVP; o indicador “equilibrado / não equilibrado” usa a regra acima.

**Nota de precisão (a confirmar no design se necessário):** “acima de 7” em inteiros = **≥ 8**. Se o slider permitir 7.5, “acima de 7” = **> 7**. Default assumido: **inteiros 0–10**, equilibrado quando **todas ≥ 8**.

### Autenticação

- **Google Sign-In** e **e-mail/senha** via Firebase Auth.

### Tom visual

- **Minimalista, escuro** (dark-first).
- Poucos elementos, tipografia clara, sem cards genéricos empilhados, sem glow/purple slop.
- Estados de alerta devem funcionar bem em fundo escuro (contraste e empatia, não erro vermelho gritando).

### Estados visuais por área (derivado das decisões)

Proposta alinhada à regra de equilíbrio (ajuste fino no design ok):

| Score | Estado |
|-------|--------|
| 8–10 | Saudável |
| 5–7 | Atenção |
| 0–4 | Alerta — pede cuidado |

Equilíbrio geral: badge/estado “Equilibrado” só se **todas** as áreas ativas ≥ 8.

### Agent's Discretion

- Detalhe de commit do slider (on release vs. debounce vs. botão “salvar”)
- Se o histórico guarda `from/to` ou só o valor absoluto + timestamp
- Microcopy exata dos estados
- Biblioteca de charts e layout exato da home (composição minimalista escura)
- Inteiros vs. step 0.5 no slider — default inteiros, a menos que o design peça meio ponto

### Declined / Undiscussed Gray Areas → Assumptions

- Delta efetivo em clamp: N/A — modelo agora é valor absoluto 0–10
- Soft-delete de áreas: mantido como default (arquivar) até design
- HashRouter vs 404.html no GH Pages: decisão técnica no design

---

## Specific References

- Slider vertical 0–10 como interação central de cada área
- Equilíbrio = todos acima de 7
- Visual: minimalista escuro

---

## Deferred Ideas

- Decaimento automático (usuário escolheu não no MVP)
- Índice contínuo de “quão equilibrado” além do booleano todos > 7 — pode voltar em P2 se fizer falta
