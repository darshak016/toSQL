# System Audit & Comprehensive Improvement Plan for toSQL

An in-depth review of the **toSQL AI (Natural Language to SQL Engine)** codebase was conducted covering the backend architecture (`FastAPI`, `SQLAlchemy`, `sqlglot`, `Google GenAI / OpenAI`), database engine, security guardrails, and frontend client (`React 19`, `TypeScript`, `Vite`).

Below is the breakdown of potential improvements categorized by impact and architecture, followed by a phased implementation plan.

---

## 1. Analysis of Areas for Improvement

### A. AI Engine & NL-to-SQL Accuracy (Highest Impact)
1. **Multi-Turn Conversational Follow-ups (Chat History)** ✅ *(Completed)*:
   - *Implemented*: Context passing (`previous_sql`, `previous_prompt`), LLM prompt augmentation, follow-up badge, quick refinement chips, and "New Thread" reset button.
2. **Schema Pruning & Token Optimization for Large Databases**:
   - *Current*: `DatabaseIntrospector` feeds all tables, column names, foreign keys, and distinct values directly into the LLM prompt. On enterprise databases with 50+ tables, this risks token overflow, slower latency, and hallucinated joins.
   - *Improvement*: Add vector/embedding-based or lexical schema pruning to select only the top relevant tables/columns for the prompt.
3. **Query Explanation & SQL Breakdown** ✅ *(Completed)*:
   - *Implemented*: `QueryBreakdown` model in `schemas.py` (`tables_used`, `joins`, `filters`, `aggregations`, `assumptions`), AST fallback parser, and themed tag badges in `ExplanationCard.tsx`.
4. **Few-Shot Examples / Custom Semantic Dictionaries** ✅ *(Completed)*:
   - *Implemented*: Defined `GlossaryTerm`, `FewShotExample`, and `DictionaryConfig` models; augmented `build_sql_generation_prompt` with structured glossary rules and few-shot pairs; added `GET/POST /api/database/dictionary` endpoints with sample preset defaults; created `DictionaryModal.tsx` dual-tab management UI with instant local persistence and "Use Prompt" testing button; verified with pytest suite (`test_semantic_dictionary.py`) and TypeScript builds.

---

### B. Execution, Data & Security Enhancements
1. **Interactive Query History & Bookmarking / Favorites** ✅ *(Completed)*:
   - *Implemented*: Persistent localStorage history tracking across sessions, favorite bookmarking (starring), search filtering, one-click query restoration, and modal drawer UI (`HistoryModal.tsx`).
2. **SQL Execution Plan (`EXPLAIN / EXPLAIN QUERY PLAN`)** ✅ *(Completed)*:
   - *Implemented*: `QueryRunner.explain_query(...)` and `validate_query_for_explain` with AST guardrail protections; added API endpoint `POST /query/explain-sql`.
   - *UI*: Added "Explain Plan" inspection button to `SqlViewer.tsx` opening an interactive `ExplainPlanModal.tsx` modal with visual execution node breakdown, table scan vs index lookup detection, raw output copy, and timing metrics.
3. **Exporting Capabilities** ✅ *(Completed)*:
   - *Implemented*: Added CSV download with timestamping, formatted JSON export (`exportJSON`), and "Copy as Markdown Table" (`copyMarkdown`) directly in `ResultsTable.tsx`.
4. **Dynamic Pagination & Large Result Set Streaming**:
   - *Current*: Limit hard-capped to 200 rows by AST guardrail.
   - *Improvement*: Configurable row limits with backend pagination (`LIMIT / OFFSET` or cursor) and table virtual scrolling for smooth rendering of 1,000+ rows.

---

### C. Frontend & UI/UX Experience
1. **Rich Interactive Charts (Chart.js / Recharts / ECharts)**:
   - *Current*: `Visualizer.tsx` uses custom SVG/HTML div bars and donuts with limited interactions (no tooltips, no zoom, limited axis formatting).
   - *Improvement*: Replace or enhance with a robust visual library (like Recharts or Lucide-backed Chart components) supporting hover tooltips, multiple series, area charts, line charts, and auto-aggregation.
2. **SQL Syntax Highlighting & Code Editor** ✅ *(Completed)*:
   - *Implemented*: Syntax token highlighting with line numbering, inline editing textarea with Reset & Run actions, and one-click "Format SQL" with keyword casing and indentation (`SqlViewer.tsx`).
3. **Schema Diagram / ERD Visualizer** ✅ *(Completed)*:
   - *Implemented*: Interactive `ErdModal.tsx` displaying Entity Relationship Diagram mapping tables, column datatypes, primary keys, and foreign key relations with interactive search and chip navigation.
4. **Theme Toggle (Cohere Warm Canvas vs. Dark Mode)**:
   - *Current*: Design is tuned around light/warm stone Cohere aesthetic. Adding an instant Dark Mode toggle improves accessibility for developers.

---

### D. Codebase Health, Testing & Production Readiness
1. **Backend Integration & Unit Tests** ✅ *(Completed)*:
   - *Implemented*: Pytest test suite covering AST security guardrails, self-healing fallbacks, schema introspection, explain query plans, and edge-case prompt handling (`test_explain_plan.py`, `test_security.py`, `test_introspector.py`, `test_llm_pipeline.py`, `test_user_prompts.py`).
2. **Connection Pooling & Multi-User Isolation**:
   - *Current*: Global `current_db` dictionary in `routes_database.py`. If two users connect to different databases simultaneously, they overwrite each other's session.
   - *Improvement*: Session-aware connection management (e.g. Session ID or Header-based workspace isolation).

---

## 2. Proposed Prioritized Implementation Roadmap

### Phase 1: High-Value Usability & Productivity ✅ *(Completed)*
- **1.1 Persistent Query History & Favorites** ✅ *(Completed)*:
  - Stored history across sessions via LocalStorage in frontend.
  - Added "History & Saved Queries" modal to re-run, filter, star, or inspect prior queries (`HistoryModal.tsx`).
- **1.2 SQL Formatter & Enhanced Editor** ✅ *(Completed)*:
  - Added format SQL button with auto-indent & uppercase keywords (`sqlFormatter.ts`).
  - Copy to clipboard with toast notification and editable SQL runner.
- **1.3 Advanced Export Options** ✅ *(Completed)*:
  - Export to JSON and CSV with custom filename timestamping.
  - One-click copy table to Markdown table format.

### Phase 2: AI Intelligence & Conversational Flow
- **2.1 Conversational / Follow-up Prompting** ✅ *(Completed)*:
  - Passed active query context (`previous_sql`, `previous_prompt`, `user_refinement`) through API endpoints, engine, and LLM prompt builder.
  - Added Follow-Up Mode UI badge, one-click "New Thread" reset, and quick refinement chips in `PromptSection.tsx`.
  - Added full test coverage in `test_llm_pipeline.py`.
- **2.2 Structured Query Explanation** ✅ *(Completed)*:
  - Added structured breakdown model (`QueryBreakdown`) in `schemas.py` capturing `tables_used`, `joins`, `filters`, `aggregations`, and `assumptions`.
  - Added prompt instructions and fallback AST extractor in `self_healer.py`.
  - Rendered structured tag grid in `ExplanationCard.tsx` with themed badges for referenced tables, join conditions, applied filters, and aggregations.
  - Added test verification in `test_llm_pipeline.py`.
- **2.3 Few-Shot Examples & Custom Semantic Dictionaries** ✅ *(Completed)*:
   - Added `GlossaryTerm`, `FewShotExample`, and `DictionaryConfig` schema definitions and integrated with query generation requests.
   - Enhanced `prompt_builder.py` with dynamic glossary business logic rules and few-shot query reference injection.
   - Added backend REST endpoints `GET /api/database/dictionary` and `POST /api/database/dictionary`.
   - Implemented `DictionaryModal.tsx` dual-tab management UI, synced with localStorage and backend, with a badge counter in `Navbar.tsx` and 1-click test button.
   - Added comprehensive pytest suite in `backend/tests/test_semantic_dictionary.py`.

### Phase 3: Visual Analytics & Schema Exploration
- **3.1 Enhanced Interactive Visualizer**:
  - Rich tooltips, formatted currencies/numbers, responsive chart layout.
- **3.2 Database Relationship Graph / Schema Overview (ERD)** ✅ *(Completed)*:
  - Created `ErdModal.tsx` displaying interactive Entity Relationship Diagram mapping tables, column datatypes, primary keys, and foreign key relations.
  - Added filterable search and interactive foreign-key chip navigation.
  - Linked "Schema ERD" actions directly into `Navbar.tsx` and `SchemaSidebar.tsx`.


---

## User Review Required

> [!IMPORTANT]
> Which phase or features would you like to prioritize first?
> 1. **Option A (Comprehensive UI & Workflow)**: Query History & Favorites drawer + SQL Formatting + Multiple Export formats (JSON/Markdown) + Enhanced Charts.
> 2. **Option B (AI Conversational & Self-Healing)**: Multi-turn prompt follow-ups ("filter by X", "group by month instead") + Structured query breakdown.
> 3. **Option C (Full Stack Bundle)**: Implement both Phase 1 and Phase 2 iteratively.

Please provide your preference or any additional specific feature you would like included.
