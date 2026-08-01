# MVP Equilíbrio — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/mvp-equilibrio/design.md`  
**Status**: Approved (tasks ready)  
**Spec**: `.specs/features/mvp-equilibrio/spec.md`

---

## Test Coverage Matrix

> Generated from design + strong defaults — greenfield (no tests/guidelines in repo). Guidelines found: none — strong defaults applied; domain tests per `design.md` (Vitest).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domain (`score`, `balance`) | unit | All branches; 1:1 to HOME/ATTN ACs + edge cases de score/equilíbrio | `src/domain/*.test.ts` | `npm test` |
| Data repos / Auth | none (MVP) | Build gate; rules manuais no Firebase console | — | `npm run build` |
| UI components / pages | none (MVP) | Build gate; UAT manual na Execute | — | `npm run build` |
| Config / CI / rules files | none | Build / deploy gate | — | `npm run build` |

## Parallelism Assessment

> Generated from greenfield defaults.

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
| --------- | -------------- | --------------- | -------- |
| unit (Vitest, domain puro) | Yes | Sem I/O, sem shared store | Funções puras em `src/domain` |
| build | Yes | N/A | Vite build local |

## Gate Check Commands

> Provisional until first `package.json` exists (T1). After T1, commands below are authoritative.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Após tasks com unit tests | `npm test` |
| Full | Após tasks de UI/data (sem e2e ainda) | `npm test && npm run build` |
| Build | Scaffold, config, pages sem testes | `npm run build` |

---

## Execution Plan

### Phase 1: Foundation (Sequential)

```
T1 → T2 → T3 → T4
```

### Phase 2: Domain + Data (Parallel após T4)

```
T4 ──┬→ T5 [P] ──┐
     ├→ T6 [P] ──┼→ T9
     ├→ T7 [P] ──┤
     └→ T8 [P] ──┘
```

### Phase 3: Auth + Shell (Sequential)

```
T9 → T10 → T11
```

### Phase 4: Core UI (Parallel após T11)

```
T11 ──┬→ T12 [P] ──┐
      ├→ T13 [P] ──┼→ T16
      ├→ T14 [P] ──┤
      └→ T15 [P] ──┘
```

### Phase 5: Wire + Deploy (Sequential)

```
T16 → T17 → T18 → T19
```

---

## Task Breakdown

### T1: Scaffold Vite React TypeScript + Tailwind

**What**: Criar app Vite React-TS com Tailwind e scripts `dev`/`build`/`test` (Vitest).  
**Where**: raiz do repo (`package.json`, `vite.config.ts`, `tsconfig*`, `src/main.tsx`, `index.html`)  
**Depends on**: None  
**Reuses**: N/A (greenfield)  
**Requirement**: — (infra)

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven` (Execute)

**Done when**:
- [ ] `npm install` e `npm run build` passam
- [ ] Tailwind aplica classe de teste no `App`
- [ ] Vitest configurado (`npm test` roda, mesmo sem specs ainda)

**Tests**: none  
**Gate**: build  
**Commit**: `chore: scaffold vite react ts tailwind vitest`

---

### T2: shadcn init + primitives base

**What**: Inicializar shadcn/ui e adicionar Button, Input, Slider, Dialog, DropdownMenu, Sonner (toast).  
**Where**: `src/components/ui/*`, `components.json`, `src/lib/utils.ts`  
**Depends on**: T1  
**Reuses**: T1 Tailwind  
**Requirement**: — (infra)

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Componentes shadcn listados existem e importam sem erro
- [ ] `npm run build` passa

**Tests**: none  
**Gate**: build  
**Commit**: `chore: add shadcn ui primitives`

---

### T3: Tema dark + tokens + fonte Outfit

**What**: CSS variables do design (bg/fg/healthy/attention/alert), dark-first, Outfit via Google Fonts.  
**Where**: `src/index.css`, `index.html` (font link)  
**Depends on**: T2  
**Reuses**: tokens de `design.md`  
**Requirement**: HOME-01

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Tokens `--bg`, `--fg`, `--healthy`, `--attention`, `--alert` definidos
- [ ] Body usa fundo escuro e Outfit
- [ ] `npm run build` passa

**Tests**: none  
**Gate**: build  
**Commit**: `style: add dark minimal theme tokens`

---

### T4: Firebase app init + env example

**What**: Módulo Firebase (`app`, `auth`, `firestore`) e `.env.example` com `VITE_*`.  
**Where**: `src/data/firebase.ts`, `.env.example`, `.gitignore` (garantir `.env`)  
**Depends on**: T1  
**Reuses**: N/A  
**Requirement**: AUTH-01

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] `firebase.ts` exporta `auth` e `db`
- [ ] `.env.example` documenta chaves necessárias
- [ ] `.env` no `.gitignore`
- [ ] `npm run build` passa (init lazy-safe se env ausente em CI, ou mock env no build)

**Tests**: none  
**Gate**: build  
**Commit**: `chore: add firebase client bootstrap`

---

### T5: Domain score helpers + unit tests [P]

**What**: `clampScore`, `statusFromScore`, constantes 0–10 e limiares.  
**Where**: `src/domain/score.ts`, `src/domain/score.test.ts`  
**Depends on**: T1  
**Reuses**: regras em `design.md` / `spec.md`  
**Requirement**: ATTN-01, HOME-01

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] `statusFromScore`: 8–10 healthy, 5–7 attention, 0–4 alert
- [ ] `clampScore` limita e arredonda para inteiro 0–10
- [ ] Testes cobrem limiares 0,4,5,7,8,10 + fora de faixa
- [ ] Gate: `npm test` passa (test count ≥ 6)

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(domain): score status and clamp`

---

### T6: Domain balance helper + unit tests [P]

**What**: `isBalanced(scores)` — todas ≥ 8 e length > 0.  
**Where**: `src/domain/balance.ts`, `src/domain/balance.test.ts`  
**Depends on**: T1  
**Reuses**: AD-004  
**Requirement**: HOME-02

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] `[]` → false; `[8]` → true; `[8,7]` → false; `[9,9,8]` → true
- [ ] Gate: `npm test` passa

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(domain): isBalanced rule`

---

### T7: Domain labels (microcopy) [P]

**What**: Labels PT-BR por estado + equilíbrio/empty.  
**Where**: `src/domain/labels.ts`  
**Depends on**: T5  
**Reuses**: microcopy em `design.md`  
**Requirement**: HOME-01, HOME-02

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Exporta labels para healthy/attention/alert/balanced/unbalanced/empty
- [ ] `npm run build` passa

**Tests**: none  
**Gate**: build  
**Commit**: `feat(domain): status microcopy labels`

---

### T8: areasRepo Firestore [P]

**What**: CRUD + archive + reorder de áreas na subcoleção do uid.  
**Where**: `src/data/areasRepo.ts`  
**Depends on**: T4  
**Reuses**: modelo `Area` do design  
**Requirement**: AREA-01, AREA-02

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Funções: `listActiveAreas`, `createArea` (score inicial 5), `renameArea`, `reorderAreas`, `archiveArea`
- [ ] Tipos TypeScript alinhados ao design
- [ ] `npm run build` passa

**Tests**: none  
**Gate**: build  
**Commit**: `feat(data): areas firestore repository`

---

### T9: eventsRepo + setAreaScore transaction

**What**: Criar evento + atualizar score em transação; skip se valor igual.  
**Where**: `src/data/eventsRepo.ts`, `src/data/setAreaScore.ts`  
**Depends on**: T4, T5, T8  
**Reuses**: `AttentionEvent` do design  
**Requirement**: ATTN-01, ATTN-02, HIST-01

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Transação atualiza `score`/`updatedAt` e cria evento com `previousValue`+`value`
- [ ] No-op se `previous === next`
- [ ] `listEventsForArea(areaId, since?)` para histórico
- [ ] `npm run build` passa

**Tests**: none  
**Gate**: build  
**Commit**: `feat(data): score transaction and events repo`

---

### T10: Auth module + useAuth hook

**What**: Google popup, email login/signup, reset password, signOut, `onAuthStateChanged`.  
**Where**: `src/data/auth.ts`, `src/hooks/useAuth.ts`, `src/app/providers.tsx`  
**Depends on**: T4  
**Reuses**: Firebase Auth  
**Requirement**: AUTH-01

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Provider expõe `user`, `loading`, métodos de auth
- [ ] Erros Firebase mapeados para mensagens PT-BR básicas
- [ ] `npm run build` passa

**Tests**: none  
**Gate**: build  
**Commit**: `feat(auth): firebase auth provider and hook`

---

### T11: Router, AuthGate, AppShell, SPA 404

**What**: Rotas `/login`, `/`, `/areas`, `/history`; gate de sessão; `404.html` + `basename` Pages.  
**Where**: `src/app/routes.tsx`, `src/components/layout/*`, `public/404.html`, `vite.config.ts` (`base`)  
**Depends on**: T10, T3  
**Reuses**: react-router-dom  
**Requirement**: AUTH-01

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Não autenticado → `/login`; autenticado em `/login` → `/`
- [ ] Shell com nav Home / Áreas / Histórico + logout
- [ ] `public/404.html` presente (spa-github-pages)
- [ ] `npm run build` passa

**Tests**: none  
**Gate**: build  
**Commit**: `feat(app): routes auth gate and pages spa fallback`

---

### T12: LoginPage [P]

**What**: UI login Google + email/senha (login, registro, reset).  
**Where**: `src/pages/LoginPage.tsx`  
**Depends on**: T11  
**Reuses**: shadcn Input/Button, useAuth  
**Requirement**: AUTH-01

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Fluxos Google e email visíveis e disparam hooks
- [ ] Erros exibidos na UI
- [ ] Visual dark minimalista
- [ ] `npm run build` passa

**Tests**: none  
**Gate**: build  
**Commit**: `feat(auth): login page`

---

### T13: BalanceStatus + AreaSlider + AreaRail [P]

**What**: Componentes de domínio visual: status geral, slider vertical 0–10 commit no release, trilho da área.  
**Where**: `src/components/balance/BalanceStatus.tsx`, `AreaSlider.tsx`, `AreaRail.tsx`  
**Depends on**: T5, T6, T7, T2  
**Reuses**: shadcn Slider, labels, statusFromScore  
**Requirement**: HOME-01, HOME-02, ATTN-01

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Slider inteiro 0–10; `onCommit(next)` só no release e se mudou
- [ ] Cores/microcopy por estado
- [ ] BalanceStatus mostra Equilibrado / Fora de equilíbrio
- [ ] `npm run build` passa

**Tests**: none  
**Gate**: build  
**Commit**: `feat(ui): balance status area slider rail`

---

### T14: HomePage wired to areas + setScore [P]

**What**: Home lista áreas ativas, BalanceStatus, empty state, commit chama `setAreaScore` com revert/toast.  
**Where**: `src/pages/HomePage.tsx`, `src/hooks/useAreas.ts`, `src/hooks/useSetAreaScore.ts`  
**Depends on**: T11, T13, T8, T9  
**Reuses**: AreaRail, Sonner  
**Requirement**: HOME-01, HOME-02, ATTN-01, ATTN-02

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Subscribe/lista áreas não arquivadas ordenadas
- [ ] Falha de save reverte slider + toast
- [ ] Empty state com CTA para `/areas`
- [ ] `npm run build` passa

**Tests**: none  
**Gate**: build  
**Commit**: `feat(home): wire areas and score commits`

---

### T15: AreasManagePage [P]

**What**: Criar, renomear, ↑↓ reorder, arquivar áreas.  
**Where**: `src/pages/AreasManagePage.tsx`  
**Depends on**: T11, T8  
**Reuses**: Dialog, areasRepo  
**Requirement**: AREA-01, AREA-02

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Nome vazio bloqueado
- [ ] Create com score 5
- [ ] Archive remove da lista ativa
- [ ] `npm run build` passa

**Tests**: none  
**Gate**: build  
**Commit**: `feat(areas): manage create rename reorder archive`

---

### T16: HistoryPage + AreaScoreChart

**What**: Seletor de área, range 7/30/all, gráfico Recharts, empty states.  
**Where**: `src/pages/HistoryPage.tsx`, `src/components/history/*`, `src/hooks/useAreaHistory.ts`  
**Depends on**: T11, T9, T8  
**Reuses**: Recharts, eventsRepo  
**Requirement**: HIST-01

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Série step a partir de eventos
- [ ] Filtro de intervalo funciona
- [ ] Empty sem áreas / sem eventos
- [ ] `npm run build` passa

**Tests**: none  
**Gate**: full  
**Commit**: `feat(history): area score chart and ranges`

---

### T17: Firestore rules file + README setup

**What**: `firestore.rules` do design + README com setup Firebase, Auth providers, env, Pages.  
**Where**: `firestore.rules`, `README.md`  
**Depends on**: T9, T10  
**Reuses**: design security skeleton  
**Requirement**: AUTH-01

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Rules restringem `users/{uid}/**` ao owner
- [ ] README cobre criação do projeto Firebase, domains GitHub Pages, deploy rules
- [ ] Sem secrets commitados

**Tests**: none  
**Gate**: build  
**Commit**: `docs: firestore rules and setup readme`

---

### T18: GitHub Actions deploy Pages

**What**: Workflow build + deploy GitHub Pages com `base` do repositório.  
**Where**: `.github/workflows/deploy.yml`, ajuste `vite.config` `base: '/Equilibrium/'`  
**Depends on**: T11, T16  
**Reuses**: AD-006  
**Requirement**: — (infra deploy)

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Workflow roda em push `main`/`master`
- [ ] Artifact = `dist` com `404.html`
- [ ] Documentado no README como ativar Pages (GitHub Actions)

**Tests**: none  
**Gate**: build  
**Commit**: `ci: github pages deploy workflow`

---

### T19: Smoke UAT checklist pass (manual gate)

**What**: Rodar checklist do Success Criteria do spec contra build local (e Firebase de dev se credenciais existirem).  
**Where**: `.specs/features/mvp-equilibrio/validation-prep.md` (checklist preenchido)  
**Depends on**: T12, T14, T15, T16, T17, T18  
**Reuses**: Success Criteria do spec  
**Requirement**: AUTH-01…HIST-01

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [ ] Checklist documentado: login, CRUD áreas, slider, estados, equilíbrio ≥8, histórico
- [ ] Itens bloqueados (sem Firebase config) marcados explicitamente
- [ ] `npm test && npm run build` passam

**Tests**: none (manual UAT notes)  
**Gate**: full  
**Commit**: `docs: mvp uat checklist`

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1 → T2 → T3
  T1 → T4

Phase 2 (Parallel after T1/T4 as noted):
  T5 [P], T6 [P]          (depend T1)
  T7                      (depend T5)
  T8 [P]                  (depend T4)
  then T9                 (depend T4, T5, T8)

Phase 3:
  T10 → T11               (T10 depend T4; T11 depend T10, T3)

Phase 4 (Parallel after T11):
  T12 [P], T13 [P], T14 [P], T15 [P]
  (T13 also needs T5–T7; T14 needs T13,T8,T9; T15 needs T8)

Phase 5:
  T16 → T17 → T18 → T19
```

> **Phase count: 5 (>3)** — na Execute, oferecer um sub-agent por fase (sequencial), confirmando com o usuário antes de despachar.

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T1 | None | root | ✅ |
| T2 | T1 | T1→T2 | ✅ |
| T3 | T2 | T1→T2→T3 | ✅ |
| T4 | T1 | T1→T4 | ✅ |
| T5 | T1 | parallel after T1 | ✅ |
| T6 | T1 | parallel after T1 | ✅ |
| T7 | T5 | after T5 | ✅ |
| T8 | T4 | parallel after T4 | ✅ |
| T9 | T4, T5, T8 | joins to T9 | ✅ |
| T10 | T4 | T4→T10 | ✅ |
| T11 | T10, T3 | T10→T11 (+T3) | ✅ |
| T12 | T11 | parallel after T11 | ✅ |
| T13 | T5,T6,T7,T2 | noted in map | ✅ |
| T14 | T11,T13,T8,T9 | noted in map | ✅ |
| T15 | T11,T8 | parallel after T11 | ✅ |
| T16 | T11,T9,T8 | Phase 5 start | ✅ |
| T17 | T9,T10 | after data/auth | ✅ |
| T18 | T11,T16 | after routes+history | ✅ |
| T19 | T12–T18 | final | ✅ |

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| ---- | ---------- | --------------- | --------- | ------ |
| T1 | config | none | none | ✅ |
| T2 | ui kit | none | none | ✅ |
| T3 | config/css | none | none | ✅ |
| T4 | config | none | none | ✅ |
| T5 | domain | unit | unit | ✅ |
| T6 | domain | unit | unit | ✅ |
| T7 | domain labels | none* | none | ✅ |
| T8 | repository | none (MVP) | none | ✅ |
| T9 | repository | none (MVP) | none | ✅ |
| T10–T16 | UI/hooks | none (MVP) | none | ✅ |
| T17–T19 | docs/ci | none | none | ✅ |

\* Labels são constantes sem branches — covered indirectly by UI; matrix domain unit foca em `score`/`balance`.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1–T19 | 1 deliverable cada (scaffold / módulo / página / CI) | ✅ Granular |
| Nenhum task junta auth+CRUD+chart | — | ✅ |

---

## Requirement Traceability (tasks)

| Requirement | Tasks |
| ----------- | ----- |
| AUTH-01 | T4, T10, T11, T12, T17 |
| AREA-01 | T8, T15 |
| AREA-02 | T8, T15 |
| ATTN-01 | T5, T9, T13, T14 |
| ATTN-02 | T9, T14 |
| HOME-01 | T3, T5, T7, T13, T14 |
| HOME-02 | T6, T7, T13, T14 |
| HIST-01 | T9, T16 |
| BAL-01 / DECAY-01 | — (fora do MVP tasks) |
