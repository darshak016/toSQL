# UI Codebase Improvements Implementation Plan

This plan addresses code health, architectural modularity, performance warnings, and test coverage across the `frontend` React application, aligned with the requirements in [AGENTS.md](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/AGENTS.md).

---

## 1. Objectives & Scope

1. **Resolve Lint & React Compiler Warnings**:
   - Fix 6 oxlint warnings: Fast refresh compliance in [SqlCodeBlock.tsx](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/components/SqlCodeBlock.tsx), synchronous `setState` inside `useEffect`, and missing hook dependencies.
2. **Decompose Monolithic [App.tsx](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/App.tsx) (867 lines)**:
   - Extract stateful domain logic into dedicated custom hooks in `src/hooks/`:
     - `useTheme`: Manages light/dark mode preference and `data-theme` DOM attribute.
     - `useQueryHistory`: Manages query history, favorites, and `localStorage` syncing.
     - `useDatabaseState`: Manages schema loading, database connection, table preview, and active DB state.
     - `useQueryRunner`: Manages prompt input, natural language generation, direct SQL execution, pipeline steps, and explain plan modal integration.
3. **Expand Component Test Coverage**:
   - Create test suites satisfying [AGENTS.md](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/AGENTS.md) guidelines for core missing components:
     - `PromptSection.test.tsx`
     - `ResultsTable.test.tsx`
     - `ExplanationCard.test.tsx`
4. **Clean Code & Styling Hygiene**:
   - Eliminate duplicated logic and ensure styling adheres to CSS variable design tokens (`--bg-card`, `--cohere-*`).

---

## User Review Required

> [!IMPORTANT]
> - Custom hooks will be introduced under `frontend/src/hooks/`. Existing props on UI components will remain unchanged, preserving backward compatibility and stability.
> - The helper function `highlightSql` currently in [SqlCodeBlock.tsx](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/components/SqlCodeBlock.tsx) will be extracted to a new utility file `src/utils/sqlHighlighter.ts` to satisfy Vite/React Fast Refresh constraints.

---

## Proposed Changes

### Phase 1: Lint & Fast Refresh Fixes

#### [NEW] [sqlHighlighter.ts](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/utils/sqlHighlighter.ts)
- Move `highlightSql` out of `SqlCodeBlock.tsx` into a dedicated utility.

#### [MODIFY] [SqlCodeBlock.tsx](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/components/SqlCodeBlock.tsx)
- Re-export or import `highlightSql` from `src/utils/sqlHighlighter.ts`.
- Component file will only export React components (`SqlCodeBlock`).

#### [MODIFY] [SqlViewer.tsx](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/components/SqlViewer.tsx)
- Avoid synchronous `setState` in `useEffect` when `sql` prop changes; handle synchronization cleanly or derive state.

#### [MODIFY] [SettingsModal.tsx](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/components/SettingsModal.tsx)
- Initialize/reset form state upon modal open cleanly without triggering cascading renders.

#### [MODIFY] [ConnectionModal.tsx](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/components/ConnectionModal.tsx)
- Streamline modal open state synchronization.

---

### Phase 2: App.tsx Decomposition into Custom Hooks

#### [NEW] [useTheme.ts](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/hooks/useTheme.ts)
- Encapsulates dark/light mode state, system preference media query, `localStorage` persistence, and HTML attribute setting.

#### [NEW] [useQueryHistory.ts](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/hooks/useQueryHistory.ts)
- Encapsulates `HistoryItem[]`, `addHistoryItem`, `toggleFavorite`, `clearHistory`, and `localStorage` synchronization.

#### [NEW] [useDatabaseState.ts](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/hooks/useDatabaseState.ts)
- Encapsulates `dbInfo`, schema loading, table preview data fetching, database switching, and dictionary modal interactions.

#### [MODIFY] [App.tsx](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/App.tsx)
- Integrate extracted hooks, reducing `App.tsx` from ~870 lines to ~350 lines focused primarily on layout and modal wiring.
- Correct missing `aiSettings` dependency in `useEffect`.

---

### Phase 3: Unit Testing Core Components ([AGENTS.md](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/AGENTS.md) Compliance)

#### [NEW] [PromptSection.test.tsx](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/components/PromptSection.test.tsx)
- Test rendering with and without sample queries.
- Test textarea input and change events.
- Test Generate SQL button behavior when disabled (`isLoading={true}`, empty prompt).
- Test sample query chip selection filling the prompt.

#### [NEW] [ResultsTable.test.tsx](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/components/ResultsTable.test.tsx)
- Test empty / null state.
- Test table headers and row rendering with tabular data.
- Test CSV and JSON export button clicks.
- Test sorting and search/filter functionality within results.

#### [NEW] [ExplanationCard.test.tsx](file:///c:/Users/hepisha/OneDrive/Desktop/darshak/toSQL/frontend/src/components/ExplanationCard.test.tsx)
- Test empty state (returns `null` when no explanation exists).
- Test rendering query explanation, assumptions, and complexity badge.
- Test copy and explain plan action triggers.

---

## Verification Plan

### Automated Tests
Execute in `frontend/`:
1. `npm run lint` (verify 0 errors and 0 warnings)
2. `npx tsc --noEmit` (verify clean type check)
3. `npx vitest run` (verify all existing and new component tests pass)
4. `npm run test:coverage` (verify >80% coverage on tested modules)

### Manual Verification
1. Verify dark/light mode toggle functions smoothly without page reload.
2. Verify executing queries updates history and displays result tables.
3. Open modals (Connection, Settings, ERD, Explain Plan, Dictionary) to ensure no state regressions.
