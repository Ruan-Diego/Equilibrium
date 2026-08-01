# Equilibrium — Documento de Projeto

**Status:** Rascunho para alinhamento  
**Data:** 2026-08-01  
**Tipo:** App pessoal (single-user first; multi-user via auth Firebase)

---

## 1. Visão

**Equilibrium** é um espelho visual do equilíbrio da atenção na vida.

Você cria **Áreas da vida** (Família, Esposa, Amigos, Igreja, Trabalho…) e registra atenção de forma **manual**. Quando cuida de uma área, ela sobe; quando negligencia, ela desce. O diferencial não é automação nem IA — é tornar o desequilíbrio **visível e sentido**, para que o usuário escolha corrigir o rumo.

> A inovação é a clareza emocional: notas baixas pedem atenção; o conjunto mostra se a vida está equilibrada ou puxada para um lado.

---

## 2. Problema

É fácil priorizar o urgente (trabalho, demandas) e deixar áreas importantes sem atenção por semanas — sem perceber. Apps de hábitos costumam ser checklists frios. Falta algo que:

1. Represente **várias áreas da vida** lado a lado
2. Mostre, de forma honesta, **onde a atenção está falhando**
3. Guarde **histórico** para ver evolução no tempo
4. Seja **simples e manual** — o usuário manda, sem gamificação agressiva ou coaching automático

---

## 3. Princípios de produto

| Princípio | O que significa na prática |
|-----------|----------------------------|
| **Manual por design** | Usuário registra atenção / ajusta notas. Sem sync de calendário, sem IA sugerindo o que fazer. |
| **Equilíbrio visível** | A home comunica o estado geral em um olhar — não é um dashboard de métricas. |
| **Alerta com empatia** | Área baixa = urgência visual suave (cor, peso tipográfico, microcopy). Sem alarmismo de app de produtividade. |
| **Sem AI slop** | Tipografia expressiva, atmosfera, composição única. Evitar cards genéricos, purple gradients, pills em excesso. |
| **Histórico honesto** | Toda mudança relevante gera ponto no tempo; gráficos mostram o equilíbrio ao longo dos dias/semanas. |
| **Frontend-only** | GitHub Pages + Firebase. Sem backend próprio. |

---

## 4. Personas e uso

- **Usuário principal:** você (dono do projeto), uso diário/semanal leve.
- **Sessão típica:** abrir → ver áreas em alerta → registrar atenção em 1–2 áreas → sair.
- **Sessão secundária:** abrir histórico/gráficos → refletir sobre a semana/mês.

Auth Firebase permite, no futuro, o mesmo app para outras pessoas — mas o MVP otimiza a experiência single-user bem feita.

---

## 5. Stack recomendada

### Decisão: **React + Vite + TypeScript + Tailwind + shadcn/ui + Firebase + GitHub Pages**

| Camada | Escolha | Por quê |
|--------|---------|---------|
| UI | **React 19 + Vite** | SPA leve, deploy trivial no GitHub Pages, ecossistema de charts e animações maduro |
| Linguagem | TypeScript | Segurança no modelo de dados e regras de score |
| Estilo | **Tailwind CSS** | Controle fino da atmosfera visual sem CSS framework “de painel” |
| Componentes | **shadcn/ui** | Componentes copiados para o projeto (você dono do código) — ideal para UI emocional custom, sem cara de PrimeNG/Material |
| Charts | **Recharts** (ou Visx se precisar mais arte) | Histórico de equilíbrio; Recharts cobre MVP |
| Backend | **Firebase** | Auth + Firestore + Security Rules, direto do frontend, free tier |
| Hosting | **GitHub Pages** | Front estático; `base` do Vite e rotas com HashRouter ou SPA fallback via `404.html` |

### Por que não Angular + PrimeNG neste projeto?

Angular + PrimeNG + Firebase é **tecnicamente viável** e AngularFire é estável. Porém:

1. **PrimeNG** puxa estética enterprise/dashboard — conflita com o princípio “equilíbrio sentido, não métricas frias”.
2. Customizar PrimeNG até parecer um produto emocional custa mais do que partir do shadcn (tokens + primitives).
3. React + Vite é mais simples para GH Pages e iterações visuais rápidas.

**Se você preferir Angular por familiaridade**, a arquitetura Firebase e o modelo de dados abaixo permanecem iguais; só troca a camada de UI (Angular + Tailwind + componentes mais leves, evitando depender do look padrão do PrimeNG).

---

## 6. Arquitetura (alto nível)

```
┌─────────────────────────────────────────┐
│  GitHub Pages (SPA React/Vite)          │
│  - Áreas, scores, histórico, gráficos   │
│  - Firebase JS SDK (client)             │
└──────────────────┬──────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────┐
│  Firebase                               │
│  - Auth (Google / email)                │
│  - Firestore (áreas, eventos, snapshots)│
│  - Security Rules (dados por userId)    │
└─────────────────────────────────────────┘
```

- **Sem Cloud Functions no MVP** — lógica de score no client; regras de segurança no Firestore.
- **Offline:** opcional depois (Firestore persistence); MVP assume online.

---

## 7. Modelo de domínio (conceitual)

### Área da vida (`Area`)

| Campo | Descrição |
|-------|-----------|
| `id` | ID Firestore |
| `userId` | Dono |
| `name` | Ex.: “Família” |
| `color` / `icon` | Identidade visual da área |
| `score` | Nota atual (**0–10**, slider) |
| `order` | Ordenação na UI |
| `createdAt` / `updatedAt` | Metadados |

### Evento de atenção (`AttentionEvent`)

Registro gerado quando o usuário altera o slider.

| Campo | Descrição |
|-------|-----------|
| `id` | ID |
| `userId` | Dono |
| `areaId` | Área afetada |
| `value` | Novo score (0–10) |
| `previousValue` | Score anterior (opcional, útil p/ gráfico/delta) |
| `note` | Texto opcional |
| `createdAt` | Timestamp — eixo do gráfico |

### Snapshot diário (`DailySnapshot`) — recomendado

No fim de cada dia (ou sob demanda ao abrir o app), gravar um resumo:

| Campo | Descrição |
|-------|-----------|
| `userId` + `date` | Chave |
| `areas` | Mapa `areaId → score` naquele dia |
| `balanceIndex` | Métrica opcional de equilíbrio geral |

Assim os gráficos não precisam recalcular toda a timeline de eventos a cada render (eventos continuam sendo a fonte da verdade).

### Mecânica de pontos (confirmada)

| Ação | Efeito |
|------|--------|
| Usuário move **slider vertical 0–10** | `score` passa a ser o valor escolhido (absoluto) |
| Commit da nova posição | Persiste score + evento de histórico |
| Decaimento automático | **Não** — só mudança manual |

Limiares visuais (escala 0–10):

| Score | Estado visual |
|-------|---------------|
| 8–10 | Saudável |
| 5–7 | Atenção |
| 0–4 | Alerta — pede cuidado |

**Equilíbrio geral:** todas as áreas ativas **acima de 7** → em inteiros, **todas ≥ 8**.

---

## 8. Telas do MVP

1. **Login** — Firebase Auth (Google recomendado para fricção zero).
2. **Home / Equilíbrio** — composição única: áreas como elementos vivos (não grid de cards genéricos); áreas em alerta destacadas.
3. **Área (detalhe)** — score atual, registrar +/− atenção, notas recentes.
4. **Gerenciar áreas** — criar, renomear, reordenar, arquivar/excluir.
5. **Histórico** — gráfico de scores no tempo + opcional índice de equilíbrio.

---

## 9. Escopo por prioridade

### P1 — MVP

- Auth Firebase
- CRUD de áreas
- Registrar atenção (+/−) com persistência
- Home com estados visuais (saudável / atenção / alerta)
- Histórico básico (linha do tempo por área)
- Deploy GitHub Pages + Firestore rules

### P2

- Snapshot diário + gráfico de equilíbrio geral
- Presets de delta (leve/médio/forte) e labels custom
- Arquivar área (sem apagar histórico)
- Decaimento opcional configurável

### P3

- Temas / atmosfera por estado geral
- Export CSV
- Lembrete leve (só se fizer sentido sem backend — ex. Notification API local)
- Multi-dispositivo offline-first

### Fora de escopo (explícito)

| Item | Motivo |
|------|--------|
| IA / coaching / sugestões | Conflita com “manual por design” |
| Integração calendário / WhatsApp | Backend e complexidade |
| Rede social / comparar com outros | Foco pessoal |
| App nativo | Web SPA basta |
| Backend próprio | Firebase cobre |

---

## 10. Segurança e dados

- Toda coleção filtrada por `request.auth.uid == userId`.
- Usuário só lê/escreve os próprios documentos.
- Sem dados públicos.
- Soft-delete ou arquivamento preferível a hard-delete de áreas com histórico (detalhe a fechar).

---

## 11. Critérios de sucesso do MVP

- [ ] Em &lt; 2 minutos após login, criar 3+ áreas e registrar atenção em uma delas
- [ ] Área com score baixo comunica urgência visual sem parecer erro de sistema
- [ ] Após vários registros, o gráfico mostra a trajetória da área
- [ ] Recarregar a página / outro browser (logado) mantém o estado
- [ ] App acessível via URL do GitHub Pages

---

## 12. Roadmap de documentação (TLC)

| Fase | Artefato | Status |
|------|----------|--------|
| Projeto | `.specs/PROJECT.md` | Este documento |
| Decide | `.specs/STATE.md` (AD-*) | Propostas abaixo |
| Specify | `.specs/features/mvp-equilibrio/spec.md` | Rascunho inicial |
| Discuss | `.specs/features/mvp-equilibrio/context.md` | Fechado |
| Design | `design.md` | Approved |
| Tasks | `tasks.md` | Ready (T1–T19) |
| Execute | implementação | **Próximo** |

---

## 13. Decisões de produto (fechadas)

| Tema | Decisão |
|------|---------|
| Mecânica | Slider vertical **0–10** (valor absoluto) |
| Decaimento | Não no MVP |
| Equilíbrio | Todas as áreas **acima de 7** (inteiros → ≥ 8) |
| Auth | Google + e-mail/senha |
| Visual | Minimalista, escuro |

Detalhes em `.specs/features/mvp-equilibrio/context.md`.  
**Próximo:** Execute (`tasks.md` T1–T19).
