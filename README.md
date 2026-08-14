# MedFinder

> Digital Medicine Discovery & Real-Time Pharmacist Consultation Platform

MedFinder is a modern healthcare discovery system that connects patients with licensed, verified pharmacies in Ethiopia. It provides instant, typo-tolerant medicine search, PostGIS-powered geospatial distance ranking, data freshness confirmation rails, and real-time bidirectional WebSocket consultations between patients and pharmacists.

---

## 1. Project Overview

MedFinder addresses the critical problem of medicine scarcity and stock unpredictability. Instead of traveling between multiple physical pharmacies, patients can instantly search for prescriptions and over-the-counter medications, check real-time stock levels, inspect how recently the inventory was physically counted by a pharmacist, and consult licensed pharmacy staff directly via real-time duplex chat.

> [!NOTE]
> **Platform Scope**: MedFinder is explicitly a **discovery, verification, and consultation platform**. It does not process financial transactions, checkout flows, or dispense pharmaceuticals.

---

## 2. Key Features

### Geospatial & Typo-Tolerant Search
* **PostgreSQL Trigram Search (`pg_trgm`)**: Fuzzy matching algorithm that handles misspellings, brand aliases, and canonical generic INN names with zero external search index dependencies.
* **PostGIS Distance Ranking**: Calculates real-time geodetic proximity from the patient's browser coordinates (`Point(lng, lat)`).
* **Segmented Confirmation Rails**: Visual 2026 ledger meters indicating data freshness:
  * **Fresh (≤ 12 hours)**: 100% full green segmented rail (*"Counted today"*).
  * **Aging (≤ 48 hours)**: 58% amber segmented rail (*"Counted this week"*).
  * **Stale (> 48 hours)**: 22% muted rail (*"Not counted lately"*).

### Multi-Tenant Pharmacy & Staff Management
* **Branch Verification Queue**: Newly registered pharmacies start in `PENDING` status and only become searchable after administrative license verification.
* **Multi-Staff Collaboration**: Pharmacy owners can generate invite codes and approve or reject staff pharmacist membership applications.
* **Shared Inventory & Inbox**: Approved pharmacists manage batch prices, stock counts, and answer customer inquiries via a unified store inbox.

### Real-Time Duplex Chat & Notifications
* **WebSocket Consultations (Django Channels + Daphne)**: Direct, private communication channel between a patient and on-duty pharmacists.
* **Centralized Dispatch Engine**: Multi-channel notifications delivering real-time in-app toasts over WebSockets and asynchronous email alerts via Celery.

### Medicine Catalog & 2026 Anti-Generic UI
* **Canonical Registry**: Structured database of therapeutic categories, dosage forms, strengths, and prescription flags.
* **High-Density Ledger Layout**: Sticky filter toolbar, instant search, "No prescription" OTC toggle, category chip scroller, and 44×44px cached thumbnails with SVG fallback glyphs.
* **Full Theme Support**: High-contrast clinical typography, custom tokens, and native light/dark mode support.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Backend Framework** | Python 3.12, Django 6.1, Django REST Framework |
| **Real-Time & ASGI** | Django Channels 4, Daphne ASGI Server |
| **Database & GIS** | PostgreSQL 17, PostGIS 3.5, `pg_trgm` extension |
| **Task Queue & Cache** | Celery 5.4, Redis 7 (Alpine), `RedisPubSubChannelLayer` |
| **Frontend Framework** | React 18, Vite, React Router v6 |
| **Styling & Design System** | Vanilla CSS (2026 Anti-Generic Tokens, Bricolage Grotesque, Public Sans, IBM Plex Mono) |
| **API Documentation** | drf-spectacular (OpenAPI 3.0, Swagger UI, ReDoc) |
| **Containerization** | Docker, Docker Compose |

---

## 4. Architecture & Services

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│   (React 18 + Vite Dev Server / Reverse Proxy on :5173)     │
└──────────────┬───────────────────────────────┬──────────────┘
               │ HTTP /api & /media            │ WebSocket /ws
               ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Daphne ASGI Server (:8000)                  │
│                     (Backend Container)                     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
        ┌──────▼──────┐                 ┌──────▼──────┐
        │  PostgreSQL │                 │    Redis    │
        │  + PostGIS  │                 │  (Channel   │
        │   (:5432)   │                 │   Layer)    │
        └─────────────┘                 └──────┬──────┘
                                               │
                                        ┌──────▼──────┐
                                        │Celery Worker│
                                        │(Async Tasks)│
                                        └─────────────┘
```

### Docker Compose Service Topology

| Container Service | Image / Build | Host Port | Container Port | Purpose |
|---|---|---|---|---|
| `frontend` | `./frontend` (Node 20 / Vite) | `5173` | `5173` | React application with `/api` and `/media` reverse proxy |
| `backend` | `./backend` (Python 3.12 / Daphne) | `8002` | `8000` | Django REST Framework API & Channels ASGI |
| `celery` | `./backend` (Celery Worker) | — | — | Asynchronous email delivery & background dispatch |
| `redis` | `redis:7-alpine` | `6380` | `6379` | Channel layer broker & task queue backend |
| `db` | `postgis/postgis:17-3.5-alpine` | `5434` | `5432` | PostGIS spatial database with trigram indexes |

---

## 5. Getting Started

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24.0+)
* [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/medfinder.git
cd medfinder
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database
POSTGRES_DB=medfinder
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Django
SECRET_KEY=your-secure-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,backend

# Redis & Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Email (Optional / Console by default in Debug)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST_USER=notifications@medfinder.et
```

### 3. Build and Start the Services
```bash
docker compose up --build -d
```

### 4. Apply Database Migrations
```bash
docker compose exec backend python manage.py migrate
```

### 5. Seed Catalog & Search Data
Populate the database with therapeutic categories, medicines, test pharmacies, and stock inventory:
```bash
# Seed master medicine catalog
docker compose exec backend python manage.py shell < mock_data/seed_medicines.py

# Seed verified pharmacies, stock inventory, and coordinates
docker compose exec backend python manage.py shell < mock_data/seed_search_data.py
```

### 6. Create an Administrator Superuser
```bash
docker compose exec backend python manage.py createsuperuser
```

---

## 6. Application Access & Endpoints

| Resource | URL | Description |
|---|---|---|
| **Frontend Application** | [http://localhost:5173](http://localhost:5173) | Medicine search, catalog, pharmacy portal, and chat |
| **Medicine Catalog** | [http://localhost:5173/medicines](http://localhost:5173/medicines) | High-density ledger registry with filters and coverage |
| **Django Admin** | [http://localhost:8002/admin/](http://localhost:8002/admin/) | Pharmacy verification queue and license auditing |
| **Swagger API Docs** | [http://localhost:8002/api/docs/](http://localhost:8002/api/docs/) | Interactive OpenAPI 3.0 Swagger UI documentation |
| **ReDoc API Docs** | [http://localhost:8002/api/docs/redoc/](http://localhost:8002/api/docs/redoc/) | Detailed ReDoc endpoint reference |
| **OpenAPI Schema** | [http://localhost:8002/api/schema/](http://localhost:8002/api/schema/) | Raw OpenAPI YAML/JSON schema endpoint |

---

## 7. Primary REST API Reference

### Public Endpoints (No Auth Required)
* `GET /api/search/?q={name}&lat={lat}&lng={lng}&page={n}` — Fuzzy trigram stock search with optional geodetic distance sorting.
* `GET /api/medicines/?search={term}&category__slug={slug}&requires_prescription={bool}&ordering={field}` — Paginated medicine catalog.
* `GET /api/medicines/categories/` — Master list of therapeutic categories.
* `GET /api/pharmacies/` — List of all administrator-verified pharmacies.
* `GET /api/pharmacies/{id}/` — Verified public pharmacy profile.

### Authenticated Endpoints (Bearer JWT Required)
* `POST /api/auth/login/` — Authenticate and receive access/refresh tokens.
* `POST /api/auth/register/` — Customer or Pharmacist registration.
* `POST /api/auth/token/refresh/` — Rotate access token using refresh token.
* `GET /api/pharmacies/mine/` — Owner/staff pharmacy management.
* `POST /api/pharmacies/mine/{id}/invites/` — Generate staff invite link.
* `POST /api/pharmacies/join/` — Submit staff invite code to join a pharmacy.
* `GET /api/inventory/` — Per-pharmacy inventory management with batch timestamps.
* `GET /api/conversations/` — Customer or pharmacist consultation inbox.
* `POST /api/conversations/start/` — Initiate consultation with a verified pharmacy.

---

## 8. Development Commands & Testing

### Running Frontend Tests & Production Build
```bash
docker compose run --rm frontend npm run build
```

### Running Backend Unit & Integration Tests
```bash
docker compose exec backend python manage.py test
```

### Viewing Container Logs
```bash
# All logs
docker compose logs -f

# Specific service logs
docker compose logs -f backend
docker compose logs -f celery
docker compose logs -f frontend
```

### Stopping All Services
```bash
docker compose down
```

---

## 9. Security & Data Integrity Invariants

1. **Deterministic Access Control**:
   * Public users can freely discover verified medicines and pharmacy locations.
   * Modifying inventory, managing store details, or generating invite links strictly requires an authenticated pharmacist associated with that store (`IsApprovedStaffOrOwner` / `IsPharmacyOwner`).
2. **N+1 Query Safety**:
   * All list views, admin bulk approval actions, and serializers enforce `select_related()` and `prefetch_related()` across user relations and store models.
3. **Channel Security**:
   * Chat WebSockets enforce session ownership; only the customer who initiated the consultation and approved pharmacists employed by that specific store can join the duplex room.

---

## 10. License

This project is licensed under the MIT License.