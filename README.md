# toSQL AI — Natural Language to SQL Engine 🚀

An enterprise-grade, intelligent tool that converts natural language questions into dialect-accurate, secure SQL queries, executes them against target databases, auto-corrects runtime errors through autonomous reflection, and visualizes answers via interactive data grids and dynamic charts.

---

## ✨ Features

- **Instant Zero-Setup Quickstart**: Ships with a pre-seeded e-commerce SQLite database (`customers`, `products`, `orders`, `order_items`) ready to test immediately.
- **Universal Database Connectivity**: Connects seamlessly to **SQLite**, **PostgreSQL**, **MySQL**, and generic SQLAlchemy database connection strings.
- **Deep Schema Introspection**: Extracts table schemas, column types, primary & foreign keys, row counts, and distinct sample values for categorical columns (helping LLMs know exact filter values).
- **AST Security Guardrails**: Powered by `sqlglot` to strictly enforce read-only execution. Automatically blocks `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, and multi-statement injection attacks.
- **Self-Healing Reflection Loop**: If a query encounters a database execution error (e.g. wrong column or dialect syntax), the engine passes the error message back to the LLM to autonomously correct the query.
- **Interactive UI & Visualizations**:
  - **Schema Explorer**: Interactive sidebar with searchable tables, column types, relationships, and instant 5-row table previews.
  - **Natural Language Workspace**: Sample suggestion chips and free-form prompt box.
  - **SQL Code Viewer**: Monospace query display with one-click copy, dialect tagging, and **in-place editable manual execution**.
  - **Data Grid**: Filterable, sortable, paginated table with one-click **CSV export**.
  - **Dynamic Visualizer**: Auto-generates **Bar charts**, **Line charts**, and **Donut charts** based on query output.
  - **Multi-Provider AI**: Supports Google Gemini, OpenAI, Ollama, and an offline demo fallback.

---

## 🏗️ Architecture

```
toSQL/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_database.py     # Schema inspection & DB connections
│   │   │   ├── routes_query.py        # NL-to-SQL generation & direct SQL runner
│   │   │   └── schemas.py             # Pydantic request/response models
│   │   ├── core/
│   │   │   ├── config.py              # Environment configuration
│   │   │   └── security.py            # AST parsing & read-only guardrails (sqlglot)
│   │   ├── engine/
│   │   │   ├── introspector.py        # Schema introspection & sample value extractor
│   │   │   ├── prompt_builder.py      # Dialect-specific prompt constructor
│   │   │   ├── llm_client.py          # Unified Gemini & OpenAI client + demo fallback
│   │   │   ├── query_runner.py        # Safe query execution & type serialization
│   │   │   └── self_healer.py         # Autonomous retry & error-reflection loop
│   │   ├── samples/
│   │   │   ├── seed_samples.py        # E-commerce sample database generator
│   │   │   └── ecommerce.db           # Bundled SQLite demo database
│   │   └── main.py                    # FastAPI server entrypoint
│   ├── tests/                         # Pytest test suite (11 passing tests)
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/                # Modular React UI components
    │   ├── services/api.js            # Frontend API client
    │   ├── App.jsx                    # Core application layout
    │   └── index.css                  # Dark-mode styling system
    ├── index.html
    └── package.json
```

---

## ⚡ Quick Start

### 1. Backend Setup

From the root directory:
```powershell
# Activate the existing virtual environment:
.\venv\Scripts\Activate.ps1

# (Optional) Set your Gemini or OpenAI API Key:
$env:GEMINI_API_KEY="your-gemini-api-key"
# OR set in backend/.env: GEMINI_API_KEY=your_key

# Start the backend server:
$env:PYTHONPATH="backend"
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend Setup

In a second terminal window:
```powershell
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

Run backend tests verifying security guardrails, schema introspection, and pipeline execution:
```powershell
$env:PYTHONPATH="backend"
.\venv\Scripts\pytest -p no:cacheprovider backend/tests
```
