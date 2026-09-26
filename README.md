# SmartRetrofit 360

**AI + IoT Retrofit Platform for MSME Manufacturing Machines**

A modular monitoring, predictive-maintenance, and energy-analytics platform designed to be retrofitted onto conventional manufacturing machines — without replacing the machine itself.

> ⚠️ **Project status: Software prototype.** No physical hardware (ESP32/sensors) is connected yet. All sensor data currently shown in the application is **simulated**, clearly labeled as such throughout the UI. Hardware integration is planned for the next development phase. See [Known Limitations](#known-limitations).

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [Core Modules](#core-modules)
- [Predictive Maintenance Dataset](#predictive-maintenance-dataset)
- [API Documentation](#api-documentation)
- [Known Limitations](#known-limitations)
- [Future Hardware Integration](#future-hardware-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

SmartRetrofit 360 adds a digital monitoring and analytics layer to conventional MSME machines. The current prototype demonstrates the **complete software architecture** — dashboards, live monitoring, sensor management, alerting, predictive-maintenance pipeline, energy analytics, maintenance workflows, and IoT device management — using a realistic **simulated data engine** in place of physical sensors.

Core principle: **Monitor → Analyze → Alert → Maintain**

The platform does not replace the machine, and the web application is never the safety controller — it is for monitoring, visualization, analytics, and decision support only.

---

## Architecture

```
CONVENTIONAL MACHINE (Lathe-01)
        │
   [ Sensors: Vibration, Temperature, Current, Voltage, RPM ]
        │
   (CURRENT: Simulated Data Engine)
   (FUTURE:  ESP32 → MQTT Broker → FastAPI MQTT Consumer)
        │
        ▼
   FastAPI Backend (Python)
        │
   ┌────┴─────────────────────────────────┐
   │  SQLAlchemy ORM → SQLite (dev)         │
   │  Rule-based Alert Engine               │
   │  Predictive Maintenance (scikit-learn) │
   │  Energy Estimation Engine              │
   └────┬─────────────────────────────────┘
        │  REST API (JWT-authenticated)
        ▼
   React + Vite Frontend
        │
   Dashboard · Live Monitoring · Machines · Sensors · Alerts
   Predictive Maintenance · Energy · Maintenance · Reports
   Machine Floor View · Devices · Settings
```

Full data-flow and MQTT-readiness details: see `GET /api/mqtt/status` in the running API, and the `app/mqtt/` module in the backend source.

---

## Technology Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS (custom dark industrial theme)
- React Router
- Recharts
- Axios

**Backend**
- Python 3.12 + FastAPI
- SQLAlchemy ORM
- Pydantic v2
- SQLite (development) — designed for straightforward PostgreSQL migration
- JWT authentication (python-jose + passlib/bcrypt)

**Analytics / ML**
- NumPy, Pandas
- scikit-learn (Random Forest, Isolation Forest)
- XGBoost (optional)

**Communication (prepared, not yet active)**
- MQTT-ready ingestion pipeline (`app/mqtt/`) — awaiting physical ESP32 hardware

---

## Folder Structure

```
Smartretrofit_WebApplication/
├── backend/
│   ├── app/
│   │   ├── main.py                 # App entrypoint, seeding, startup tasks
│   │   ├── api/                    # All FastAPI routers
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── services/               # Business logic (simulation, alerts, maintenance rules)
│   │   ├── database/                # Engine/session config
│   │   ├── analytics/               # ML pipeline (train/test/evaluate)
│   │   ├── mqtt/                    # MQTT-ready ingestion (inactive until hardware exists)
│   │   └── utils/                   # Settings/config
│   ├── scripts/
│   │   └── import_training_data.py  # Loads reference ML dataset into DB
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    └── src/
        ├── components/    # Reusable UI (cards, badges, states, forms)
        ├── layouts/        # Sidebar, Topbar, DashboardLayout
        ├── pages/          # One file per route/module
        ├── services/       # Centralized API access (one file per resource)
        ├── hooks/          # Data-fetching hooks (polling, loading, error states)
        ├── context/        # AuthContext
        └── utils/          # Constants, role-permission map
```

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js LTS (18+) and npm

### Backend Setup

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1        # Windows PowerShell
# source venv/bin/activate       # macOS/Linux

pip install -r requirements.txt
copy .env.example .env           # Windows
# cp .env.example .env           # macOS/Linux

uvicorn app.main:app --reload
```

Backend runs at **http://localhost:8000** — interactive API docs at **http://localhost:8000/docs**.

On first run, the backend automatically seeds:
- 3 demo machines (Lathe-01, Drilling-01, Milling-01)
- 3 demo user accounts (Admin, Engineer, Operator)
- 5 sensors per machine (Vibration, Temperature, Current, Voltage, RPM)
- 1 demo IoT device per machine (e.g. `ESP32-LATHE-01`, marked "Not Registered")

### Frontend Setup

```powershell
cd frontend
npm install
copy .env.example .env           # Windows
# cp .env.example .env           # macOS/Linux

npm run dev
```

Frontend runs at **http://localhost:5173**.

> Both servers must be running simultaneously in separate terminals for the app to function.

---

## Environment Variables

### `backend/.env`
```env
DATABASE_URL=sqlite:///./smartretrofit.db
SECRET_KEY=change_this_to_a_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
SIMULATION_MODE=True

MQTT_ENABLED=False
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
MQTT_TOPIC_PREFIX=smartretrofit

CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:8000
```

No secrets are hardcoded anywhere in source — all configuration flows through these files.

---

## Demo Accounts

| Role | Username | Password | Access |
|---|---|---|---|
| Admin | `admin` | `admin123` | Full access — machine/user management, settings |
| Engineer | `engineer` | `engineer123` | Monitoring, sensors, predictive maintenance, maintenance, reports |
| Operator | `operator` | `operator123` | Dashboard, live monitoring, alerts, basic maintenance info |

> ⚠️ Development-only credentials. Do not deploy this seeding logic to production as-is.

---

## Core Modules

| Module | Description |
|---|---|
| **Dashboard** | Machine-level overview: sensor cards, multi-parameter trend chart, maintenance/alert/energy summaries — all sourced from real simulated data, not mock numbers |
| **Live Monitoring** | Real-time-style streaming view with staleness detection, per-parameter sparklines, combined trend chart |
| **Machine Management** | CRUD for machines, monitoring enable/disable, links to all related modules |
| **Sensor Monitoring** | Per-sensor state, threshold configuration, historical trend chart, sampling toggle |
| **Predictive Maintenance** | Data pipeline visualization, rule-based health/recommendations, ML model training on a reference dataset (Random Forest / Isolation Forest / XGBoost) with honest "validation pending" labeling |
| **Energy Monitoring** | Estimated power (P ≈ V×I demo formula), daily energy, machine comparison |
| **Alerts & Notifications** | Rule-based alert generation from sensor thresholds, auto-resolve on recovery, acknowledge/resolve workflow |
| **Maintenance Management** | Full CRUD, upcoming/overdue/completed overview, links to predictive-maintenance recommendations |
| **Reports & Analytics** | Cross-module aggregated reports with date/machine filters, CSV export |
| **Machine-Floor View** | Proposed 2D floor layout + retrofit architecture diagram, explicitly labeled as a demo layout |
| **IoT/Device Management** | ESP32 device records, sensor mapping, prepared for future MQTT hardware |
| **Authentication & Roles** | JWT-based auth, Admin/Engineer/Operator permissions enforced on both frontend routes and backend endpoints |
| **Settings** | System configuration (in progress) |

---

## Predictive Maintenance Dataset

The ML pipeline is prototyped against an **external/synthetic reference dataset** (`predictive_maintenance_v3.csv`), intentionally kept in a separate database table (`ml_training_records`) from the live/simulated sensor stream (`sensor_readings`) — the two are never mixed.

To (re)load the dataset:

```powershell
cd backend
venv\Scripts\Activate.ps1
python scripts\import_training_data.py predictive_maintenance_v3.csv
```

Model metrics shown in the app (precision, recall, F1, confusion matrix) describe performance **on this reference dataset only** — they are explicitly not a claim about validated performance on real Lathe-01 hardware.

---

## API Documentation

Interactive Swagger UI: **http://localhost:8000/docs**

Key endpoint groups:
- `/api/auth` — login, current user
- `/api/machines` — CRUD + monitoring toggle
- `/api/sensors`, `/api/sensor-readings` — configuration + time-series data
- `/api/machines/{id}/live` — live monitoring snapshot
- `/api/dashboard/{id}/overview` — aggregated dashboard data
- `/api/alerts` — list, filter, acknowledge, resolve
- `/api/predictive-maintenance` — health, recommendations
- `/api/analytics` — ML dataset summary, train, model runs
- `/api/energy` — overview, trend, machine comparison
- `/api/maintenance` — CRUD, overview
- `/api/reports` — aggregated report, CSV export
- `/api/devices` — IoT device records, sensor mapping
- `/api/mqtt/status` — MQTT architecture status (always inactive in this phase)
- `/api/simulation` — pause/resume the simulated data engine (Admin only)

---

## Known Limitations

- **No physical hardware is connected.** All sensor values are generated by a software simulation engine (`app/services/simulation/`), clearly labeled "Simulated Data" throughout the UI.
- **Predictive Maintenance metrics** are computed on a synthetic reference dataset, not on validated Lathe-01 hardware data.
- **Energy figures** use a simplified `P ≈ V × I` estimate with a fixed demo power factor — not a certified energy measurement.
- **MQTT ingestion path exists in code** (`app/mqtt/`) but is inactive (`MQTT_ENABLED=False`) since no broker or ESP32 device exists yet.
- **No WebSocket push** — Live Monitoring uses polling; the same aggregation function is designed to be reused for a future WebSocket push without logic changes.

---

## Future Hardware Integration

The system is architected so that swapping simulated data for real hardware requires **no frontend changes and minimal backend changes**:

1. Deploy ESP32 devices per the topic pattern: `smartretrofit/{machine_id}/{sensor_type}`
2. Set `MQTT_ENABLED=True` and configure `MQTT_BROKER_HOST`/`MQTT_BROKER_PORT` in `.env`
3. Install `paho-mqtt` (`pip install paho-mqtt`)
4. The existing MQTT consumer (`app/mqtt/consumer.py`) will route real messages through the **same** alert-evaluation and status-derivation logic already used by the simulator (`app/services/sensor_evaluation.py`) — just tagged `data_source="hardware"` instead of `"simulated"`

---

## Troubleshooting

**Backend won't start / `ModuleNotFoundError`**
Confirm you're inside the activated virtual environment (`venv\Scripts\Activate.ps1`) and that every file referenced by an import actually exists on disk.

**`uvicorn: command not found`**
You're not inside the venv. Activate it, or run `python -m uvicorn app.main:app --reload`.

**`npm: command not found`**
Node.js isn't installed or PATH wasn't refreshed. Install Node LTS from nodejs.org and reopen your terminal.

**Login fails / "Failed to fetch"**
Confirm the backend is running on port 8000 and `frontend/.env` has `VITE_API_BASE_URL=http://localhost:8000`. Restart the frontend dev server after editing `.env`.

**Predictive Maintenance shows "Reference dataset not found"**
Run the import script (see [Predictive Maintenance Dataset](#predictive-maintenance-dataset)).

**bcrypt / passlib crash on startup**
Pin `bcrypt==4.0.1` (`pip install bcrypt==4.0.1`) — newer bcrypt releases removed an attribute passlib 1.7.4 depends on.

---

## License

Academic/final-year engineering project prototype. Not licensed for commercial deployment as-is.
