# CTI Dashboard — Ransomware Threat Intelligence

A full-stack Cyber Threat Intelligence dashboard for ransomware incidents. A **Go**
backend loads and cleans the incident dataset (`data.csv`), computes the analytics
and powers the IOC search; a **React + Vite** frontend renders the visualisations.
The whole thing ships as a single Docker image.

```
┌──────────────────────┐        /api/*          ┌────────────────────────┐
│  React + Recharts UI  │  ───────────────────▶ │  Go API (net/http)      │
│  (served as static)   │ ◀───────────────────  │  loads + cleans data.csv│
└──────────────────────┘        JSON            └────────────────────────┘
```

## Features

**Data analysis** (all derived from `data.csv`)
- Ransomware group distribution
- Country-based attack distribution
- Sector-based attack distribution (grouped into broad verticals)
- Time-based attack trends (monthly volume, quarterly totals, per-actor timelines)
- Average severity — overall, per group, per sector, per month

**Dashboard** — five screens with 15+ visualisations
- **Overview** — headline metrics, group distribution, sector distribution,
  severity-band donut, top MITRE ATT&CK techniques, recent incidents table
- **Threat Groups** — attack frequency, mean severity and a profile card per actor
- **Geo & Sectors** — top targeted countries, attack vectors, MITRE technique
  frequency, sector risk analysis and a per-sector threat matrix
- **Timeline** — monthly volume, severity trend, quarterly totals, top-actor lines
- **IOC Search** — search by IP or file hash

**IOC search module** — for a given IP or hash, lists the correlated ransomware
group, the matching incident records and their severity, with a small result summary.

### Extra touches
- Group-name normalisation (`The Gentlemen`→`CMD`, `3am`/`3AM`,
  `Auditteam`/`Audit Team`, `Braincipher`/`Brain Cipher`, … folded into one
  canonical actor).
- Attack-vector tidying — the free-text vectors (blanks, stray dashes and many
  near-duplicate phrasings) are folded into a clean canonical set.
- Sector bucketing — the ~90 granular sector labels in the source are mapped into
  ≤16 readable verticals for clean charts, while the original label is preserved
  (`sector_detail`).
- Country name/ISO-code split (`United States (US)` → `United States` + `US`).
- MITRE ATT&CK technique id extracted from each record.
- Animated boot sequence, live status pill, severity-coloured badges throughout.

## Running

### With Docker (recommended)

```bash
docker compose up --build
```

Then open **http://localhost:8080**. The container serves both the API and the UI.

### Locally (for development)

Two terminals:

```bash
# 1) API — reads the CSV in the repo root
cd backend
DATA_CSV=../data.csv go run .        # listens on :8080

# 2) UI — Vite dev server proxies /api → :8080
cd frontend
npm install
npm run dev                          # opens on :5173
```

## API reference

| Method | Endpoint                | Description                                   |
|--------|-------------------------|-----------------------------------------------|
| GET    | `/api/health`           | Liveness + record count                       |
| GET    | `/api/records`          | All cleaned incident records                  |
| GET    | `/api/overview`         | Headline summary metrics                      |
| GET    | `/api/stats/groups`     | Per-group profile (count, avg severity, …)    |
| GET    | `/api/stats/countries`  | Top 15 targeted countries                     |
| GET    | `/api/stats/sectors`    | Sector distribution                           |
| GET    | `/api/stats/vectors`    | Attack-vector distribution                    |
| GET    | `/api/stats/techniques` | MITRE ATT&CK technique distribution           |
| GET    | `/api/stats/timeline`   | Monthly attacks + average severity            |
| GET    | `/api/stats/severity`   | Severity histogram (1–10)                     |
| GET    | `/api/ioc/search?q=`    | IOC search by IP or hash                      |
| GET    | `/api/ioc/samples`      | Example indicators for the IOC reference table |

## Project layout

```
.
├── data.csv                 # source dataset (single source of truth)
├── Dockerfile               # multi-stage: build UI → build API → runtime
├── docker-compose.yml
├── backend/                 # Go API (standard library only)
│   ├── main.go
│   └── internal/
│       ├── cti/             # dataset loading, cleaning, analytics, IOC logic
│       └── api/             # HTTP handlers + static serving
└── frontend/                # React + Vite frontend
    ├── public/              # static assets (logo, boot mask)
    └── src/
        ├── assets/icons/    # processed 3D stat-card icons
        ├── components/      # dashboard tabs & charts
        └── data/            # API access layer + client-side analytics helpers
```

## A note on IOCs

The source `data.csv` publishes real indicators for only a handful of incidents.
So that the IOC search module is demonstrable across the whole dataset, the backend
**derives a stable IP and file hash for records that have none** — deterministically,
from each record's own fields (see `backend/internal/cti/ioc.go`). Genuine indicators
present in the CSV are always kept as-is. These generated values are for demonstration
only and are not real threat infrastructure.
