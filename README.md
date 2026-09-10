# PermitAI · Geothermal Data Platform

A clean energy intelligence dashboard and data platform for geothermal exploration, permitting, generation facilities, and environmental compliance tracking across the United States.

---

## Overview

The Geothermal Data Platform provides interactive intelligence on utility-scale geothermal developments:
- **Executive Portfolio Overview**: High-level KPIs including total tracked generating capacity (MW), state-by-state resource distribution, generation technology breakdown (Flash Steam, Binary Cycle, Dry Steam, EGS, Hybrid), and top producing projects.
- **Searchable Project Directory**: Filter active development fields by keyword search, state, generation technology, and sort by name, capacity, or permitting progress.
- **Regulatory Filings Repository**: Central registry of Environmental Assessments (EAs), authorizations, lead agencies (e.g. BLM, USFS), and public access compliance status across the portfolio.
- **Project Dossier**: Detailed project view displaying:
  - Permitting lifecycle timeline across all key phases (Leasing, Exploration, Resource Confirmation, Well Development, Utilization Construction, Transmission, Reclamation).
  - Generation asset specifications (unit capacity, commissioning year, owner, operator, coordinates).
  - Filing documentation viewer with modal metadata inspection.
  - Resource area metadata (KGRA, location, township/range, well numbers).

---

## Tech Stack

- **Frontend**: React 19, Vite 8, Lucide React icons
- **Styling**: Custom modern dark-mode CSS with responsive layouts
- **Backend (Optional API)**: Python 3, FastAPI, SQLite with foreign key cascades
- **Data Ingestion**: Python CLI scripts to generate example datasets and import JSON schemas into SQLite

---

## Project Structure

```
├── backend/                  # FastAPI & SQLite persistence layer
│   ├── database.py           # SQLite connection and table definitions
│   └── main.py               # REST API endpoints for projects & facilities
├── data/
│   └── examples/             # 10 bundled geothermal project JSON datasets
├── public/                   # Static assets (favicons, SVG icons)
├── scripts/
│   ├── generate_examples.py  # Generates realistic synthetic project JSON files
│   └── import_json.py        # Validates & imports JSON files into SQLite
├── src/
│   ├── api/
│   │   └── geothermalApi.js  # Client-side data querying and sorting layer
│   ├── components/
│   │   ├── common/           # Modal, LoadingState, EmptyState, StatusPill
│   │   ├── dashboard/        # Dashboard, ProjectCard, SearchToolbar
│   │   ├── documents/        # DocumentsView (global regulatory filings)
│   │   ├── layout/           # Sidebar, Topbar
│   │   ├── overview/         # PortfolioOverview (KPIs, charts, top projects)
│   │   └── project/          # ProjectDetail, Lifecycle, Facilities, Docs, Stats
│   ├── hooks/
│   │   ├── useProject.js     # Single project query hook
│   │   └── useProjects.js    # Filtered/sorted projects collection hook
│   ├── utils/
│   │   └── projectUtils.js   # Permitting phases, capacity & progress calculation
│   ├── App.jsx               # Main application shell with multi-view navigation
│   ├── main.jsx              # React DOM root entrypoint
│   └── styles.css            # Dark theme styles and responsive layout
└── vite.config.js            # Vite configuration with GitHub Pages base path
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (for backend and dataset scripts)

### Installation

```bash
# Clone the repository
git clone https://github.com/permitaix/data-thrust/ad-hoc-tasks/geothermal.git
cd geothermal

# Install frontend dependencies
npm install
```

### Running the Frontend

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The application runs fully client-side using bundled JSON datasets, allowing seamless deployment to GitHub Pages or static hosts.

### Building for Production

```bash
npm run build
```

The production output is built to `dist/`.

### Linting

```bash
npm run lint
```

---

## Data Scripts

### Generate Synthetic Project Data
```bash
python scripts/generate_examples.py
```

### Import JSON Data into SQLite
```bash
python scripts/import_json.py
# Or specify a custom directory
python scripts/import_json.py data/examples
```

