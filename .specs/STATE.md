# STATE

## Decisions

### AD-001
- **Decision**: Stack = React + Vite + TypeScript + Tailwind + shadcn/ui + Firebase (Auth + Firestore) + GitHub Pages
- **Reason**: UI emocional custom (evitar look enterprise do PrimeNG); deploy estático simples; Firebase cobre backend free no client
- **Trade-off**: Não usa Angular; shadcn exige mais decisões de design do que um kit pronto
- **Scope**: Todo o frontend e infraestrutura do Equilibrium
- **Date**: 2026-08-01
- **Status**: active

### AD-002
- **Decision**: App frontend-only; sem Cloud Functions no MVP; score calculado/definido no client e persistido no Firestore
- **Reason**: Custo zero de backend; regras de segurança bastam para dados por usuário
- **Trade-off**: Lógica no client (aceitável para app pessoal)
- **Scope**: MVP e P2
- **Date**: 2026-08-01
- **Status**: active

### AD-003
- **Decision**: Score de área em inteiros 0–10 via slider vertical; estados 8–10 saudável, 5–7 atenção, 0–4 alerta
- **Reason**: Decisão do usuário; escala simples e interação central do produto
- **Trade-off**: Menos granularidade que 0–100; meio ponto fora do MVP
- **Scope**: Modelo de domínio e UI
- **Date**: 2026-08-01
- **Status**: active

### AD-004
- **Decision**: Equilíbrio geral = todas as áreas ativas com score acima de 7 (inteiros: todas ≥ 8)
- **Reason**: Definição explícita do usuário
- **Trade-off**: Regra binária (equilibrado / não); sem índice contínuo no MVP
- **Scope**: Home e indicador geral
- **Date**: 2026-08-01
- **Status**: active

### AD-005
- **Decision**: Auth = Firebase Google Sign-In + e-mail/senha; visual dark minimalista; sem decaimento automático no MVP
- **Reason**: Respostas do usuário na fase discuss
- **Trade-off**: E-mail/senha exige fluxo de reset; dark-first pode precisar de tokens cuidadosamente contrastados
- **Scope**: Auth, tema, mecânica de score
- **Date**: 2026-08-01
- **Status**: active

### AD-006
- **Decision**: Rotas = BrowserRouter com `basename` do repo + fallback SPA `404.html` no GitHub Pages
- **Reason**: URLs limpas; evita 404 em refresh; padrão spa-github-pages compatível com Vite
- **Trade-off**: Precisa manter `404.html` e `base` corretos no deploy
- **Scope**: App shell / CI deploy
- **Date**: 2026-08-01
- **Status**: active

### AD-007
- **Decision**: Persistência de score no release do slider (optimistic); eventos com `previousValue`+`value`; áreas arquivadas via `archived`; score inicial de área = 5
- **Reason**: Poucos writes, histórico auditável, soft-delete preserva eventos, neutro não finge equilíbrio
- **Trade-off**: Meio ponto fora do MVP
- **Scope**: Áreas, eventos, AreaSlider
- **Date**: 2026-08-01
- **Status**: superseded by AD-010 (archive → delete + active)

### AD-008
- **Decision**: Histórico agrega 1 ponto por dia local (último evento do dia); seletor “Todas as áreas” sobrepõe linhas no mesmo gráfico
- **Reason**: Pedido do usuário para leitura diária e comparação visual entre áreas
- **Trade-off**: Múltiplas atualizações no mesmo dia colapsam; overlay usa `connectNulls` entre dias sem update
- **Scope**: HistoryPage / AreaScoreChart / useAreaHistory
- **Date**: 2026-08-01
- **Status**: active

### AD-009
- **Decision**: Reordenação de áreas via drag-and-drop (`@dnd-kit`) com handle; persistência otimista em `reorderAreas`
- **Reason**: Pedido do usuário; setas ↑↓ eram enough no MVP, mas DnD é mais direto para listas curtas
- **Trade-off**: Dependência extra (`@dnd-kit/*`); teclado via KeyboardSensor do dnd-kit
- **Scope**: AreasManagePage
- **Date**: 2026-08-01
- **Status**: active

### AD-010
- **Decision**: Áreas usam hard delete (`deleteArea` + eventos da área); campo `active` liga/desliga presença na Home/Histórico; manage lista todas
- **Reason**: Pedido do usuário — arquivar trocado por deletar; toggle para pausar sem apagar
- **Trade-off**: Delete apaga histórico da área; docs antigos com `archived` mapeiam para `active` na leitura
- **Scope**: areasRepo, useAreas, AreasManagePage, firestore.indexes
- **Date**: 2026-08-01
- **Status**: active

## Handoff

- **Feature**: Delete + toggle ativo/inativo nas Áreas
- **Phase / Task**: Execute (small enhancement)
- **Completed**: AD-010 — hard delete, `active` toggle, manage lista inativas
- **In-progress**: none
- **Next step**: UAT — desativar some da Home; deletar pede confirmação e some do histórico
- **Blockers**: none
- **Uncommitted files**: areasRepo + useAreas + AreasManagePage + Switch + indexes + STATE
- **Branch**: main
- **Diff range**: local uncommitted
