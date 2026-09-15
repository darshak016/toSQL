# System Audit & Comprehensive Improvement Plan for toSQL

An in-depth review of the **toSQL AI (Natural Language to SQL Engine)** codebase was conducted covering the backend architecture (`FastAPI`, `SQLAlchemy`, `sqlglot`, `Google GenAI / OpenAI`), database engine, security guardrails, and frontend client (`React 19`, `TypeScript`, `Vite`).

Below is the breakdown of potential improvements categorized by impact and architecture, followed by a phased implementation plan.

---

## 1. Analysis of Areas for Improvement

### A. AI Engine & NL-to-SQL Accuracy (Highest Impact)
1. **Multi-Turn Conversational Follow-ups (Chat History)**:
   - *Current*: Each query is completely stateless. Asking *"Now filter that to only USA"* fails because the prompt builder only knows the single isolated question.
   - *Improvement*: Support conversational context where previous questions, generated SQL, and schema context are maintained in a chat thread.
2. **Schema Pruning & Token Optimization for Large Databases**:
   - *Current*: `DatabaseIntrospector` feeds all tables, column names, foreign keys, and distinct values directly into the LLM prompt. On enterprise databases with 50+ tables, this risks token overflow, slower latency, and hallucinated joins.
   - *Improvement*: Add vector/embedding-based or lexical schema pruning to select only the top relevant tables/columns for the prompt.
3. **Query Explanation & SQL Breakdown**:
   - *Current*: The model returns a single text paragraph explanation.
   - *Improvement*: Structured breakdown showing *Selected Tables*, *Join Conditions Used*, *Applied Filters*, and *Potential Caveats/Assumptions*.
4. **Few-Shot Examples / Custom Semantic Dictionaries**:
   - *Improvement*: Allow users or admins to register domain-specific glossary terms (e.g. `"active customer" means status = 'ACTIVE' AND last_order_date > NOW() - 90 days`) and custom few-shot example queries per database.

---

### B. Execution, Data & Security Enhancements
1. **Interactive Query History & Bookmarking / Favorites**:
   - *Current*: `query_history` is an ephemeral in-memory Python array that clears whenever the backend restarts, and isn't persistable or bookmarkable in the UI.
   - *Improvement*: Persistent query history (SQLite or LocalStorage), with the ability to tag, name, star/favorite queries, and re-run them with one click.
2. **SQL Execution Plan (`EXPLAIN / EXPLAIN QUERY PLAN`)**:
   - *Current*: Queries only return execution time in ms.
   - *Improvement*: Add an "Explain Query Plan" toggle for PostgreSQL/SQLite/MySQL so engineers can inspect indexes used, scan costs, and join strategies.
3. **Exporting Capabilities**:
   - *Current*: Basic CSV download.
   - *Improvement*: Add **Excel (.xlsx)** and **JSON** exports, as well as "Copy as Markdown Table" or "Copy as Insert Statements".
4. **Dynamic Pagination & Large Result Set Streaming**:
   - *Current*: Limit hard-capped to 200 rows by AST guardrail.
   - *Improvement*: Configurable row limits with backend pagination (`LIMIT / OFFSET` or cursor) and table virtual scrolling for smooth rendering of 1,000+ rows.

---

### C. Frontend & UI/UX Experience
1. **Rich Interactive Charts (Chart.js / Recharts / ECharts)**:
   - *Current*: `Visualizer.tsx` uses custom SVG/HTML div bars and donuts with limited interactions (no tooltips, no zoom, limited axis formatting).
   - *Improvement*: Replace or enhance with a robust visual library (like Recharts or Lucide-backed Chart components) supporting hover tooltips, multiple series, area charts, line charts, and auto-aggregation.
2. **SQL Syntax Highlighting & Code Editor**:
   - *Current*: Simple `<textarea>` or monospace `<div>` in `SqlViewer.tsx`.
   - *Improvement*: Integrate a lightweight Monaco or CodeMirror SQL editor with keyword highlighting, indentation, and formatting (`sql-formatter`).
3. **Schema Diagram / ERD Visualizer**:
   - *Current*: Schema sidebar is an accordion list.
   - *Improvement*: Add an ERD (Entity Relationship Diagram) modal or tab showing tables, foreign key connections, and cardinality visually.
4. **Theme Toggle (Cohere Warm Canvas vs. Dark Mode)**:
   - *Current*: Design is tuned around light/warm stone Cohere aesthetic. Adding an instant Dark Mode toggle improves accessibility for developers.

---

### D. Codebase Health, Testing & Production Readiness
1. **Backend Integration & Unit Tests**:
   - Add automated test cases for self-healing loops, multi-table joins, invalid dialects, and edge-case AST injection queries.
2. **Connection Pooling & Multi-User Isolation**:
   - *Current*: Global `current_db` dictionary in `routes_database.py`. If two users connect to different databases simultaneously, they overwrite each other's session.
   - *Improvement*: Session-aware connection management (e.g. Session ID or Header-based workspace isolation).

---

## 2. Proposed Prioritized Implementation Roadmap

### Phase 1: High-Value Usability & Productivity (Immediate Focus)
- **1.1 Persistent Query History & Favorites**:
  - Store history across sessions (via LocalStorage in frontend and/or persistent backend storage).
  - Add a "History & Saved Queries" drawer/modal to re-run or inspect prior queries.
- **1.2 SQL Formatter & Enhanced Editor**:
  - Add format SQL button (auto-indent / format clean uppercase keywords).
  - Copy to clipboard with toast notification.
- **1.3 Advanced Export Options**:
  - Export to JSON and CSV with custom filename timestamping.
  - One-click copy table to Markdown.

### Phase 2: AI Intelligence & Conversational Flow
- **2.1 Conversational / Follow-up Prompting**:
  - Pass the active query context (`previous_sql`, `previous_prompt`, `user_refinement`) to the prompt builder when the user refines a query.
- **2.2 Structured Query Explanation**:
  - Present AI rationale in structured badges (Tables Used, Filters, Aggregations).

### Phase 3: Visual Analytics & Schema Exploration
- **3.1 Enhanced Interactive Visualizer**:
  - Rich tooltips, formatted currencies/numbers, responsive chart layout.
- **3.2 Database Relationship Graph / Schema Overview**:
  - Quick visual view of how tables connect via Foreign Keys.

---

## User Review Required

> [!IMPORTANT]
> Which phase or features would you like to prioritize first?
> 1. **Option A (Comprehensive UI & Workflow)**: Query History & Favorites drawer + SQL Formatting + Multiple Export formats (JSON/Markdown) + Enhanced Charts.
> 2. **Option B (AI Conversational & Self-Healing)**: Multi-turn prompt follow-ups ("filter by X", "group by month instead") + Structured query breakdown.
> 3. **Option C (Full Stack Bundle)**: Implement both Phase 1 and Phase 2 iteratively.

Please provide your preference or any additional specific feature you would like included.
