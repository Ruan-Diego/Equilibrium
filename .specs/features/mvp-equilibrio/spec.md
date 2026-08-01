# MVP Equilíbrio — Specification

## Problem Statement

A atenção na vida se concentra no urgente e áreas importantes ficam sem cuidado sem que a pessoa perceba. Falta uma forma manual, visual e emocionalmente clara de ver o equilíbrio entre áreas da vida e o histórico dessa tentativa ao longo do tempo.

## Goals

- [ ] Usuário cria N áreas da vida e vê o estado de cada uma de relance
- [ ] Registrar atenção (positiva ou negativa) atualiza score e persiste histórico
- [ ] Áreas em score baixo comunicam alerta pedindo atenção
- [ ] Gráficos mostram evolução das áreas no tempo
- [ ] App hospedado em GitHub Pages com dados no Firebase

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| IA / sugestões automáticas | Manual por design |
| Integrações externas (calendário, mensagens) | Sem backend; complexidade |
| Decaimento automático de score | P2 — a confirmar em context |
| Comparação social | Foco pessoal |
| App nativo | Web SPA |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Framework UI | React + Vite + Tailwind + shadcn | Melhor para UI emocional vs PrimeNG | y (proposta aceita no fluxo do projeto) |
| Auth | Google + e-mail/senha (Firebase Auth) | Pedido do usuário | y |
| Escala de score | Inteiros **0–10** via slider vertical | Pedido do usuário | y |
| Registro de atenção | Slider define valor absoluto; cada commit gera histórico | Substitui modelo +/− | y |
| Decaimento automático | Desligado | Pedido do usuário (opção A) | y |
| Equilíbrio geral | Todas as áreas ativas **acima de 7** → em inteiros: **todas ≥ 8** | Pedido do usuário | y |
| Estados por área | 8–10 saudável, 5–7 atenção, 0–4 alerta | Alinhado à regra > 7 | y |
| Exclusão de área | Arquivar (soft) no MVP | Preserva histórico | n (agent default) |
| Roteamento GH Pages | HashRouter ou `404.html` → `index.html` | SPA em Pages | n (design) |
| Commit do slider | On pointer release / debounce — detalhe de UX no design | Evitar flood de writes | n (agent discretion) |

**Open questions:** none — gray areas principais resolvidas em `context.md`; restantes logadas acima.

---

## User Stories

### P1: Autenticação ⭐ MVP

**User Story**: Como usuário, quero entrar com minha conta para que meus dados fiquem só comigo.

**Why P1**: Sem auth, Firestore não isola dados com segurança.

**Acceptance Criteria**:

1. WHEN o usuário acessa o app sem sessão THEN o sistema SHALL exibir tela de login
2. WHEN o usuário completa login Firebase THEN o sistema SHALL redirecionar para a Home e carregar apenas dados do `uid`
3. WHEN o usuário faz logout THEN o sistema SHALL encerrar a sessão e voltar ao login

**Independent Test**: Login → ver Home vazia (sem áreas) → logout → login novamente.

---

### P1: CRUD de Áreas ⭐ MVP

**User Story**: Como usuário, quero criar e gerenciar quantas áreas da vida eu quiser.

**Why P1**: Sem áreas não há equilíbrio a visualizar.

**Acceptance Criteria**:

1. WHEN o usuário cria uma área com nome válido THEN o sistema SHALL persistir no Firestore e exibi-la na Home
2. WHEN o usuário renomeia ou reordena áreas THEN o sistema SHALL persistir a alteração
3. WHEN o usuário arquiva/remove uma área THEN o sistema SHALL removê-la da Home ativa sem corromper o histórico existente (conforme regra de delete acordada)
4. WHEN o nome está vazio THEN o sistema SHALL recusar a criação

**Independent Test**: Criar 3 áreas, reordenar, renomear uma, recarregar página — estado preservado.

---

### P1: Registrar atenção (slider 0–10) ⭐ MVP

**User Story**: Como usuário, quero ajustar a nota de uma área com um slider vertical de 0 a 10 para refletir a atenção atual.

**Why P1**: É o loop principal do produto.

**Acceptance Criteria**:

1. WHEN o usuário move o slider de uma área para um valor V (0–10) e confirma a alteração THEN o sistema SHALL persistir `score = V`, gravar evento de histórico e atualizar a UI
2. WHEN o valor está fora de 0–10 THEN o sistema SHALL rejeitar ou clampar para o intervalo válido
3. WHEN a gravação no Firestore falha THEN o sistema SHALL informar o erro e reverter o slider ao último valor persistido (não fingir sucesso)

**Independent Test**: Definir uma área em 3, depois em 9; histórico mostra a mudança; refresh mantém 9.

---

### P1: Home com estados emocionais ⭐ MVP

**User Story**: Como usuário, quero ver de relance quais áreas pedem atenção e se a vida está equilibrada.

**Why P1**: Inovação do produto = equilíbrio visível.

**Acceptance Criteria**:

1. WHEN uma área tem score 8–10 THEN o sistema SHALL apresentá-la no estado “saudável”
2. WHEN uma área tem score 5–7 THEN o sistema SHALL apresentá-la no estado “atenção”
3. WHEN uma área tem score 0–4 THEN o sistema SHALL apresentá-la no estado “alerta” com microcopy pedindo cuidado
4. WHEN todas as áreas ativas têm score ≥ 8 THEN o sistema SHALL indicar estado geral “Equilibrado”
5. WHEN qualquer área ativa tem score ≤ 7 THEN o sistema SHALL indicar que o equilíbrio não está completo (e destacar quem pede atenção)
6. WHEN não há áreas THEN o sistema SHALL mostrar empty state convidando a criar a primeira

**Independent Test**: Três áreas em 9, 9 e 9 → Equilibrado; baixar uma para 6 → deixa de estar equilibrado e mostra atenção/alerta.

---

### P1: Histórico e gráfico ⭐ MVP

**User Story**: Como usuário, quero ver como minhas áreas evoluíram no tempo.

**Why P1**: Toda atualização deve alimentar reflexão histórica.

**Acceptance Criteria**:

1. WHEN existem eventos de atenção THEN o sistema SHALL exibir um gráfico com a trajetória do score da área selecionada
2. WHEN o usuário escolhe um intervalo (ex. 7 / 30 dias) THEN o sistema SHALL filtrar a visualização
3. WHEN não há eventos THEN o sistema SHALL mostrar empty state explicativo

**Independent Test**: Registrar vários eventos em dias distintos (ou timestamps) e ver a linha refletir os scores.

---

### P2: Refinamento do indicador de equilíbrio

**User Story**: Como usuário, quero além do “equilibrado / não” um reforço visual de proximidade (opcional).

**Why P2**: A regra booleana (todos ≥ 8) já está no P1 Home; P2 é polish.

**Acceptance Criteria**:

1. WHEN o usuário está equilibrado THEN o sistema SHALL manter o estado geral positivo de forma clara e minimalista
2. WHEN não está equilibrado THEN o sistema SHALL apontar quais áreas estão ≤ 7

---

### P3: Decaimento configurável

**User Story**: Como usuário, quero que áreas esquecidas percam pontos sozinhas se eu ativar essa opção.

**Why P3**: Usuário optou por não no MVP; fica para depois com opt-in.

**Acceptance Criteria**:

1. WHEN o decaimento está desligado THEN scores só mudam por ação do usuário
2. WHEN o decaimento está ligado e uma área fica N dias sem evento THEN o sistema SHALL aplicar perda conforme config (detalhe em design futuro)

---

## Edge Cases

- WHEN o usuário cria área com nome duplicado THEN o sistema SHALL permitir (homônimos ok) — default: permitir
- WHEN o usuário solta o slider no mesmo valor já persistido THEN o sistema SHALL não criar evento duplicado
- WHEN há exatamente uma área com score ≥ 8 THEN o sistema SHALL considerar equilibrado (regra “todas” com N=1)
- WHEN há zero áreas THEN o sistema SHALL não exibir “Equilibrado”
- WHEN a sessão expira mid-save THEN o sistema SHALL falhar de forma explícita, reverter UI e pedir novo login
- WHEN o usuário tem 0 áreas e abre Histórico THEN o sistema SHALL orientar a criar áreas primeiro

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| AUTH-01 | P1: Autenticação | Tasks | In Tasks |
| AREA-01 | P1: CRUD de Áreas | Tasks | In Tasks |
| AREA-02 | P1: CRUD de Áreas | Tasks | In Tasks |
| ATTN-01 | P1: Slider 0–10 | Tasks | In Tasks |
| ATTN-02 | P1: Slider 0–10 | Tasks | In Tasks |
| HOME-01 | P1: Home estados | Tasks | In Tasks |
| HOME-02 | P1: Home equilíbrio geral | Tasks | In Tasks |
| HIST-01 | P1: Histórico | Tasks | In Tasks |
| BAL-01 | P2: Polish equilíbrio | - | Pending |
| DECAY-01 | P3: Decaimento | - | Pending |

**Coverage:** 10 total, 8 mapped to MVP tasks (T1–T19), 2 unmapped (P2/P3)

---

## Success Criteria

- [ ] Fluxo login → criar áreas → registrar atenção → ver alerta → ver gráfico funciona de ponta a ponta no Pages
- [ ] Dados sobrevivem a refresh e a segundo dispositivo (mesmo login)
- [ ] UI transmite urgência em scores baixos sem parecer erro técnico
