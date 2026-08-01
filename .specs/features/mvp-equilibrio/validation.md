# MVP Equilíbrio Validation

**Date**: 2026-08-01
**Spec**: `.specs/features/mvp-equilibrio/spec.md`
**Diff range**: `5011c53..7c43d9f` (19 commits)
**Verifier**: independent sub-agent (author ≠ verifier)
**UAT prep**: `.specs/features/mvp-equilibrio/validation-prep.md` (Firebase `.env` missing — interactive smoke blocked)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | Scaffold + Vitest |
| T2 | ✅ Done | shadcn primitives |
| T3 | ✅ Done | Dark tokens + Outfit |
| T4 | ✅ Done | Firebase bootstrap + `.env.example` |
| T5 | ✅ Done | `score` domain + unit tests |
| T6 | ✅ Done | `isBalanced` + unit tests |
| T7 | ✅ Done | Labels PT-BR |
| T8 | ✅ Done | `areasRepo` |
| T9 | ✅ Done | `setAreaScore` + `eventsRepo` |
| T10 | ✅ Done | Auth provider/hook |
| T11 | ✅ Done | Routes, AuthGate, SPA 404 |
| T12 | ✅ Done | LoginPage |
| T13 | ✅ Done | BalanceStatus / AreaSlider / AreaRail |
| T14 | ✅ Done | Home wired + revert/toast |
| T15 | ✅ Done | AreasManagePage |
| T16 | ✅ Done | HistoryPage + chart |
| T17 | ✅ Done | Rules + README |
| T18 | ✅ Done | Pages deploy workflow |
| T19 | ✅ Done | `validation-prep.md` (UAT blocked without Firebase) |

All T1–T19 Done-when checkboxes are marked `[x]` in `tasks.md`.

---

## Spec-Anchored Acceptance Criteria

### P1: Autenticação (AUTH-01) — matrix: build/UAT only

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion / evidence | Result |
| ------------------------- | -------------------- | ---------------------------------- | ------ |
| WHEN acessa sem sessão THEN tela de login | Redirect/render `/login` | Impl: `src/components/layout/AuthGate.tsx:30-31` — `Navigate to="/login"`; routes `src/app/routes.tsx:13-19` | ⚠️ No automated test (matrix: build/UAT) — prep: blocked (no `.env`) |
| WHEN completa login Firebase THEN Home + dados do `uid` | Navigate `/`; queries under `users/{uid}` | Impl: `AuthGate.tsx:23-25` guest→`/`; repos use `uid` path (`areasRepo.ts:28`) | ⚠️ No automated test (matrix: build/UAT) — prep: blocked |
| WHEN logout THEN sessão encerrada + login | Sign-out → login | Impl: auth + shell logout (wired); prep: blocked | ⚠️ No automated test (matrix: build/UAT) |

### P1: CRUD de Áreas (AREA-01/02) — matrix: build/UAT only

| Criterion | Spec-defined outcome | Evidence | Result |
| --------- | -------------------- | -------- | ------ |
| WHEN cria área com nome válido THEN persiste + Home | Firestore doc; score inicial 5; aparece ativa | Impl: `areasRepo.ts:45-56` (`score: 5`, `archived: false`); Home via `useAreas` | ⚠️ No automated test (matrix: build/UAT) — prep: blocked |
| WHEN renomeia ou reordena THEN persiste | `renameArea` / `reorderAreas` write | Impl: `areasRepo.ts:59-81` | ⚠️ No automated test (matrix: build/UAT) — prep: blocked |
| WHEN arquiva THEN some da Home ativa; histórico intacto | Soft archive `archived: true`; events untouched | Impl: `areasRepo.ts:84-88`; list filters `archived == false` (`:38`) | ⚠️ No automated test (matrix: build/UAT) — prep: blocked |
| WHEN nome vazio THEN recusa criação | Block create | Impl: `AreasManagePage.tsx:52-55` — empty trim → toast, return | ⚠️ No automated test (matrix: build/UAT) — prep: blocked (UI present) |

### P1: Registrar atenção (ATTN-01/02)

| Criterion | Spec-defined outcome | Evidence | Result |
| --------- | -------------------- | -------- | ------ |
| WHEN slider V (0–10) confirmado THEN `score=V` + evento + UI | Persist score, history event, UI update | Impl: `setAreaScore.ts:30-41`; UI: `useSetAreaScore.ts:29-36` | ⚠️ No automated test (matrix: build/UAT) — prep: blocked |
| WHEN valor fora 0–10 THEN rejeitar ou clampar | Inteiro no intervalo [0,10] | `src/domain/score.test.ts:32` — `expect(clampScore(-3)).toBe(0)`; `:36` — `expect(clampScore(15)).toBe(10)`; `:40-41` round within range | ✅ PASS |
| WHEN gravação falha THEN erro + reverter slider | Toast + restore previous score | Impl: `useSetAreaScore.ts:37-47` | ⚠️ No automated test (matrix: build/UAT) — prep: blocked |

### P1: Home estados + equilíbrio (HOME-01/02)

| Criterion | Spec-defined outcome | Evidence | Result |
| --------- | -------------------- | -------- | ------ |
| WHEN score 8–10 THEN “saudável” | Status `healthy` | `score.test.ts:22` — `expect(statusFromScore(8)).toBe('healthy')`; `:26` — `statusFromScore(10)` → `'healthy'`; UI: `AreaRail.tsx:19,28` + `labels.ts:4` | ✅ PASS |
| WHEN score 5–7 THEN “atenção” | Status `attention` | `score.test.ts:14` — `statusFromScore(5)` → `'attention'`; `:18` — `statusFromScore(7)` → `'attention'` | ✅ PASS |
| WHEN score 0–4 THEN “alerta” + microcopy cuidado | Status `alert`; copy pede cuidado | Status: `score.test.ts:6` — `statusFromScore(0)` → `'alert'`; `:10` — `statusFromScore(4)` → `'alert'`; microcopy impl: `labels.ts:6` — `'Pede a sua atenção'` (no unit assert on string; matrix UI via UAT) | ✅ PASS (status unit; copy impl-cited) |
| WHEN todas ativas ≥ 8 THEN “Equilibrado” | `isBalanced` true | `balance.test.ts:18` — `expect(isBalanced([9, 9, 8])).toBe(true)`; UI: `HomePage.tsx:19` + `BalanceStatus.tsx:21` / `labels.ts:10` | ✅ PASS |
| WHEN qualquer ativa ≤ 7 THEN equilíbrio incompleto + destaque | `isBalanced` false; list ≤7 names | `balance.test.ts:14` — `expect(isBalanced([8, 7])).toBe(false)`; UI: `HomePage.tsx:20-22` + `BalanceStatus.tsx:23-28` | ✅ PASS (rule unit; highlight impl/UAT) |
| WHEN não há áreas THEN empty state convidando criar | Empty copy + CTA | Impl: `HomePage.tsx:41-51` — `emptyLabel` + Link `/areas` | ⚠️ No automated test (matrix: build/UAT) — prep: blocked |

### P1: Histórico (HIST-01) — matrix: build/UAT only

| Criterion | Spec-defined outcome | Evidence | Result |
| --------- | -------------------- | -------- | ------ |
| WHEN existem eventos THEN gráfico trajetória | Chart from events | Impl: `HistoryPage.tsx:95` + `AreaScoreChart.tsx` | ⚠️ No automated test (matrix: build/UAT) — prep: blocked |
| WHEN escolhe intervalo 7/30 THEN filtra | Range filter | Impl: `RangeToggle` + `useAreaHistory` / `HistoryPage.tsx:17-19,79` | ⚠️ No automated test (matrix: build/UAT) — prep: blocked |
| WHEN não há eventos THEN empty explicativo | Empty copy | Impl: `HistoryPage.tsx:89-93` | ⚠️ No automated test (matrix: build/UAT) — prep: blocked |

### P2 / P3 (out of MVP task scope)

| Story | Status |
| ----- | ------ |
| BAL-01 (P2) | Not in T1–T19 — Pending / out of scope for this validation |
| DECAY-01 (P3) | Not in T1–T19 — Pending / out of scope |

**Status**: ✅ All MVP (P1) ACs addressed — domain ACs have unit evidence; remaining ACs match coverage matrix (build/UAT). **0 hard gaps**. Interactive UAT remains blocked pending Firebase `.env` (documented in validation-prep; does not fail matrix).

**AC tally (P1)**: 19 criteria — 6 with domain unit outcome evidence (HOME bands ×3, HOME balance ×2, ATTN clamp ×1); 13 matrix build/UAT (implementation cited). Spec-precision gaps: 0.

---

## Discrimination Sensor

Scratch: `git worktree` at temp path on `7c43d9f`; discarded after each run (`git worktree remove --force`). Main tree unchanged.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/domain/balance.ts:2` | Flipped `s >= 8` → `s >= 7` | ✅ Killed — `balance.test.ts:14` `expect(isBalanced([8, 7])).toBe(false)` |
| 2 | `src/domain/score.ts:15` | Flipped healthy band `score >= 8` → `score >= 9` | ✅ Killed — `score.test.ts:22` `expect(statusFromScore(8)).toBe('healthy')` |
| 3 | `src/domain/score.ts:8-11` | Broke `clampScore` (round only, no min/max clamp) | ✅ Killed — `score.test.ts:36` `expect(clampScore(15)).toBe(10)` (+ lower-bound fail) |

**Sensor depth**: lightweight (3 targeted behavior-level mutations)
**Result**: 3/3 killed — PASS ✅

---

## Interactive UAT Results

Not re-run by Verifier (read-only). Status from `validation-prep.md` (T19):

| Area | Result | Details |
| ---- | ------ | ------- |
| AUTH / AREA / ATTN persist / HOME live / HIST live / E2E Pages | ⏭️ blocked | No `VITE_FIREBASE_*` `.env` |
| ATTN clamp (domain) | ✅ via unit | Covered by gate |
| HOME balance rule (domain) | ✅ via unit | Covered by gate |
| Visual urgency tokens | pending | After `.env` |

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ (diff is greenfield MVP surface) |
| No scope creep | ✅ (P2/P3 not implemented) |
| Matches patterns | ✅ |
| Spec-anchored outcome check (asserted values match spec) | ✅ for domain ACs |
| Per-layer Coverage Expectation met | ✅ domain 1:1 HOME/ATTN; UI/data none per matrix |
| Every test maps to a spec requirement — no unclaimed tests | ✅ (`score`/`balance` only) |
| Documented guidelines followed | ✅ none in repo — strong defaults (tasks matrix) |

---

## Edge Cases

| Edge case | Evidence | Status |
| --------- | -------- | ------ |
| Nome duplicado permitido | `createArea` has no uniqueness check (`areasRepo.ts:45-56`) | ✅ handled (allow) |
| Slider solto no mesmo valor → sem evento duplicado | `setAreaScore.ts:26-28` early return; `useSetAreaScore.ts:27` | ✅ impl (no unit; matrix) |
| Exactamente uma área ≥ 8 → equilibrado | `balance.test.ts:9-10` — `expect(isBalanced([8])).toBe(true)` | ✅ PASS |
| Zero áreas → não “Equilibrado” | `balance.test.ts:5-6` — `isBalanced([])` → `false`; Home empty path skips BalanceStatus | ✅ PASS |
| Sessão expira mid-save → erro explícito + revert + re-login | Catch/toast/revert in `useSetAreaScore.ts:37-47`; AuthGate on next nav | ⚠️ impl present; UAT blocked |
| 0 áreas no Histórico → orientar criar | `HistoryPage.tsx:48-55` — `emptyLabel` + CTA `/areas` | ⚠️ impl; UAT blocked |

---

## Gate Check

- **Gate command**: `npm test && npm run build`
- **Result**: 13 passed, 0 failed, 0 skipped; build PASS (`tsc -b && vite build`)
- **Test count before feature** (`5011c53`): 0 (greenfield)
- **Test count after feature** (`7c43d9f`): 13
- **Delta**: +13
- **Skipped tests**: none
- **Failures**: none
- **Test integrity**: count increased; assertions target spec thresholds (0/4/5/7/8/10, ≥8 balance, clamp bounds) — not weakened

---

## Fix Plans

None for automated verification FAIL criteria.

**Follow-up (non-blocking for matrix PASS)**: complete interactive UAT after configuring Firebase `.env` per `validation-prep.md` Unblock path — does not create fix tasks against domain/sensor/gate.

---

## Requirement Traceability Update

Recommended status updates for `spec.md` (Verifier did not edit `spec.md`):

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| AUTH-01 | In Tasks | ⚠️ Verified (impl + build; UAT blocked) |
| AREA-01 | In Tasks | ⚠️ Verified (impl + build; UAT blocked) |
| AREA-02 | In Tasks | ⚠️ Verified (impl + build; UAT blocked) |
| ATTN-01 | In Tasks | ⚠️ Verified (impl + build; UAT blocked) |
| ATTN-02 | In Tasks | ✅ Verified (domain clamp unit) |
| HOME-01 | In Tasks | ✅ Verified (domain status unit) |
| HOME-02 | In Tasks | ✅ Verified (domain balance unit) |
| HIST-01 | In Tasks | ⚠️ Verified (impl + build; UAT blocked) |
| BAL-01 | Pending | Pending (P2) |
| DECAY-01 | Pending | Pending (P3) |

---

## Summary

**Overall**: ✅ Ready (MVP automated bar met; live Firebase UAT still pending env)

**Spec-anchored check**: 19/19 P1 ACs matched (6 unit + 13 matrix build/UAT) | 0 gaps
**Sensor**: 3/3 mutations killed
**Gate**: 13 passed, 0 failed

**What works**: Domain score bands, clamp, and balance rule are unit-proven and discrimination-hard; UI/data/auth/history/deploy artifacts exist in diff and build cleanly.

**Issues found**: None that fail the Verifier bar. Interactive UAT blocked without Firebase credentials (documented).

**Next steps**: Configure `.env` from `.env.example`, redeploy rules, re-run validation-prep checklist items marked `blocked`.
