# toSQL AI — Enterprise Natural Language to SQL Platform 🚀

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.2+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3+-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![SQLGlot](https://img.shields.io/badge/SQLGlot-Security_AST-blue)](https://github.com/tobymao/sqlglot)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org)

**toSQL AI** is an enterprise-grade, intelligent Text-to-SQL platform that converts natural language into secure, dialect-accurate SQL queries. It automatically introspects database schemas, runs multi-table queries against live relational databases, self-heals syntax or runtime execution errors through an autonomous reflection loop, explains query execution plans, and delivers actionable answers through interactive data tables and dynamic visualizations.

---

## 🌟 Comprehensive Product Feature Overview

### 1. 🧠 Intelligent NL-to-SQL Conversion
- **Natural Language Translation**: Ask questions in plain English (e.g., *"Show top 5 customers who spent the most on completed orders"* or *"Which products have less than 50 units in stock?"*) and receive accurate, dialect-optimized SQL.
- **Multi-Turn Conversational Memory**: Supports follow-up questions and conversational refinement (e.g., *"Filter that to just last quarter"* or *"Break down by category instead"*), maintaining query context across iterations.
- **Intelligent Schema Pruning & Token Optimization**: For large databases with dozens of tables, toSQL automatically analyzes semantic query relevance and prunes unneeded table metadata before sending context to the LLM, dramatically reducing token usage, latency, and costs.
- **Domain Business Glossary**: Define custom domain terms, acronyms, and formulas (e.g., `"active customer"`, `"churned user"`, `"gross margin"`, `"realized revenue"`). The engine injects these definitions into generation prompts to guarantee queries reflect your business logic.
- **Few-Shot Prompt Engineering Library**: Curate and manage high-accuracy question-to-SQL example pairs directly in the UI. The model references these few-shot exemplars during query generation for complex schema joins and business patterns.

### 2. 🛡️ Security Guardrails & AST Protection
- **Strict Read-Only Enforcement via AST Parsing**: Powered by `sqlglot`, every query’s Abstract Syntax Tree is inspected prior to execution.
- **Destructive Mutation Blocker**: Automatically detects and blocks `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, `CREATE`, `GRANT`, `REVOKE`, and administrative commands.
- **SQL Injection & Multi-Statement Protection**: Blocks stacked/multi-statement injection attempts.
- **Automatic Result Safeguards**: Injects sensible `LIMIT` clauses to avoid memory exhaustion and unbounded scans.

### 3. 🔄 Self-Healing Reflection Loop
- **Autonomous Error Correction**: If the database throws a syntax, column-not-found, or type mismatch error during execution, toSQL captures the exact database engine error message and initiates an automated reflection loop.
- **Iterative Query Repair**: The LLM analyzes its mistake and generates a corrected query in real-time (up to configured retry thresholds).
- **Execution History & Attempts Audit**: Inspect all generation attempts, error messages, and how self-healing resolved the issue right in the UI.

### 4. 🗄️ Universal Database Connectivity & Schema Explorer
- **Universal Engine Support**: Works with **PostgreSQL**, **Supabase**, **MySQL**, **SQLite**, and standard SQLAlchemy connection strings.
- **Deep Schema Introspection**: Extracts table schemas, column data types, nullability, primary keys, foreign key constraints, and live row counts.
- **Distinct Value Sampling**: Gathers distinct categorical sample values for columns (e.g., status values, categories, regions), ensuring the LLM matches exact string values instead of hallucinating filters.
- **Interactive Schema Sidebar**: Searchable tables and columns with one-click expandable column lists, type indicators, and primary/foreign key badges.
- **Instant Table Preview**: View 5-row live data previews directly from the sidebar without needing to write a single query.
- **Interactive ERD (Entity Relationship Diagram) Modal**: Visual representation of foreign key linkages and table relationships with search filtering and fast table navigation.

### 5. ⚡ Developer SQL Workspace & Query Execution
- **Monospace SQL Editor**: Clean SQL viewer with syntax highlighting and line numbers.
- **In-Place Editable Execution**: Manually tweak or write raw SQL and run it directly against the active database with full guardrails active.
- **SQL Query Formatter**: One-click formatting to standardize and beautify messy SQL statements.
- **Query Execution Metrics**: Real-time performance tracking displaying query execution duration (ms) and row counts.
- **EXPLAIN & Query Performance Plan**: Dedicated Explain Plan modal that generates execution plans (e.g., `EXPLAIN QUERY PLAN` or `EXPLAIN (FORMAT JSON)`), with visual tree nodes, cost estimates, scan types, and raw outputs.

### 6. 📊 Visualizations & Data Presentation
- **Interactive Data Grid**: Sortable, filterable, and paginated table view with search-as-you-type capabilities.
- **Multi-Format Data Export**:
  - Download full query result sets as **CSV** with one click.
  - Export query data as structured **JSON**.
  - **Copy as Markdown**: Easily paste formatted Markdown tables into Jira, GitHub, Slack, or documentation.
- **Dynamic Auto-Visualizer**:
  - Automatically identifies whether query output is best represented as a **Bar Chart**, **Line Chart**, or **Donut / Pie Chart**.
  - Interactive SVG charts with responsive layout, tooltips, axis labels, and high-contrast Cohere-inspired color palettes.
  - Manual chart type switcher to toggle between Bar, Line, and Donut views.

### 7. 📖 Query History & Favorites
- **Query History Modal**: Searchable, timestamped history of previous queries, execution times, and generated SQL.
- **Favorites & Bookmarks**: Star frequently used queries to save them for one-click re-execution.
- **Filter by Status**: Quickly switch between all executions and starred favorites.

### 8. ⚙️ Multi-Model AI Provider Flexibility
- **Configurable AI Providers**: Select between **Google Gemini** (default: `gemini-2.5-flash`), **OpenAI** (`gpt-4o`, `gpt-4o-mini`), or local/offline models.
- **In-App API Key Management**: Safely set and persist your API keys directly from the Settings modal without modifying server files.
- **Offline Fallback**: Bundled fallback heuristics and mock data generator for offline demos and local testing.

### 9. 🎨 Modern Cohere-Inspired UI & Theming
- **Curated Cohere Aesthetic**: Clean typography, high-contrast layouts, stone and canvas surfaces, and smooth transitions.
- **Light & Dark Mode**: Instant theme switching with preference persistence in `localStorage`.
- **Live Pipeline Visualizer**: Step-by-step progress tracking for Schema Introspection -> AI Translation -> AST Guardrails -> Database Execution -> Results.

---

## 🏗️ Architecture & Project Structure

```
toSQL/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_database.py     # Schema inspection, DB connection, & glossary endpoints
│   │   │   ├── routes_query.py        # NL-to-SQL generation, direct SQL execution, & explain plan
│   │   │   └── schemas.py             # Pydantic request/response models
│   │   ├── core/
│   │   │   ├── config.py              # Application settings & environment variables
│   │   │   └── security.py            # AST parsing, sqlglot security guardrails, & sanitization
│   │   ├── engine/
│   │   │   ├── introspector.py        # DB inspection, schema metadata, & distinct sample collector
│   │   │   ├── prompt_builder.py      # Dialect-specific prompts with schema pruning & glossary injection
│   │   │   ├── llm_client.py          # Unified Gemini & OpenAI client integration
│   │   │   ├── query_runner.py        # Safe execution, type serialization, & EXPLAIN plan analysis
│   │   │   └── self_healer.py         # Autonomous retry & error-reflection loop
│   │   ├── samples/
│   │   │   └── seed_samples.py        # E-commerce sample database seeder (for testing)
│   │   └── main.py                    # FastAPI server entrypoint
│   ├── tests/                         # Pytest test suite (security, introspection, query runner)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/                # React UI components
│   │   │   ├── ConnectionModal.tsx    # Database switcher (SQLite, Postgres, Supabase, MySQL)
│   │   │   ├── DictionaryModal.tsx    # Semantic glossary & few-shot example manager
│   │   │   ├── ErdModal.tsx           # Entity Relationship Diagram (ERD) visualizer
│   │   │   ├── ExplainPlanModal.tsx   # SQL performance explain plan modal
│   │   │   ├── ExplanationCard.tsx    # Natural language query explanation & breakdown
│   │   │   ├── HistoryModal.tsx       # Saved queries, favorites, and execution history
│   │   │   ├── Navbar.tsx             # Main header with DB selector, theme toggle, and modals
│   │   │   ├── PipelineVisualizer.tsx # Multi-step execution progress indicator
│   │   │   ├── PromptSection.tsx      # Query prompt input & suggestion chips
│   │   │   ├── ResultsTable.tsx       # Paginated data grid with CSV/JSON/MD export
│   │   │   ├── SchemaSidebar.tsx      # Live database schema browser
│   │   │   ├── SettingsModal.tsx      # AI provider & API key configuration
│   │   │   ├── SqlViewer.tsx          # SQL code editor, runner, formatter, & explain trigger
│   │   │   └── Visualizer.tsx         # SVG Bar, Line, and Donut chart generator
│   │   ├── services/api.ts            # Typed API client for FastAPI backend
│   │   ├── styles/                    # Global Tailwind CSS v4 and typography styles
│   │   ├── types/                     # TypeScript interfaces and schema types
│   │   ├── App.tsx                    # Main workspace layout and state coordinator
│   │   └── main.tsx                   # React root entrypoint
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── populate_enterprise_supabase.py    # Enterprise multi-schema database seeder
├── run.py                             # Unified launcher for frontend + backend
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**

### Option A: Launch Everything with One Command (Recommended)

From the project root:
```powershell
python run.py
```
This automatically launches both the FastAPI backend (`http://127.0.0.1:8000`) and the Vite React frontend (`http://localhost:5173`), and handles graceful shutdown when interrupted (`Ctrl+C`).

---

### Option B: Manual Setup

#### 1. Backend Setup

```powershell
# Activate the Python virtual environment:
.\venv\Scripts\Activate.ps1

# (Optional) Set your API Key:
$env:GEMINI_API_KEY="your-gemini-api-key"
# or create backend/.env with: GEMINI_API_KEY=your_key

# Start the FastAPI server:
$env:PYTHONPATH="backend"
uvicorn app.main:app --reload --port 8000
```
Interactive API docs are available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### 2. Frontend Setup

In a separate terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Validation

Run the test suite covering SQL security guardrails, schema introspection, and execution workflows:

```powershell
$env:PYTHONPATH="backend"
.\venv\Scripts\pytest -p no:cacheprovider backend/tests
```

To run frontend tests and linting:
```powershell
cd frontend
npm run test:run
npm run lint
```

---

## 🔒 Security Best Practices

- **Zero DDL/DML Permitted**: The engine strictly forbids state-altering queries through AST verification before passing SQL to the database.
- **Client-Side Credential Storage**: User API keys and settings configured in the UI are kept locally in your browser session or local storage and sent only to the backend generation proxy.
- **Connection Isolation**: Connect to replica or read-only database users whenever possible for defense-in-depth security.
