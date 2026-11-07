# MedFinder

https://drive.google.com/drive/folders/1WQmCQHGvOuKPpkaRAuWG-uAtEhD8gGwa?usp=drive_link

> Digital Medicine Discovery & Real-Time Pharmacist Consultation Platform

MedFinder is a distributed healthcare discovery and communication platform that connects patients with licensed, verified pharmacies. The platform provides typo-tolerant pharmaceutical search, PostGIS-powered geospatial distance ranking, inventory verification timestamps, and real-time bidirectional WebSocket consultations between patients and pharmacists.

---

## 1. System Overview

MedFinder addresses pharmaceutical accessibility challenges by providing real-time visibility into medication availability across distributed retail pharmacies. Patients can search for prescription and over-the-counter medications, inspect stock availability, evaluate data freshness based on pharmacist physical verification timestamps, and initiate secure, real-time consultations with licensed pharmacy staff.

> [!NOTE]
> **Platform Scope**: MedFinder operates strictly as an information discovery, inventory verification, and pharmacist consultation system. The platform does not process payments, handle financial transactions, or dispense pharmaceuticals.

---

## 2. Core Capabilities

### Geospatial & Typo-Tolerant Search
* **PostgreSQL Trigram Search (`pg_trgm`)**: Employs trigram similarity matching across medication generic names (INN), brand aliases, and therapeutic descriptions without requiring external search engine dependencies.
* **PostGIS Geospatial Distance Ranking**: Computes real-time geodetic distance calculations based on client coordinates (`Point(longitude, latitude)`), ordering results by physical proximity.
* **Data Freshness Confirmation Indicators**: Tracks the elapsed duration since a pharmacy staff member physically verified inventory:
  * **Fresh (≤ 12 hours)**: High-confidence inventory status verified within current operating shifts.
  * **Aging (≤ 48 hours)**: Standard stock status confirmed within recent operating cycles.
  * **Stale (> 48 hours)**: Unconfirmed inventory status requiring customer verification.

### Multi-Tenant Pharmacy & Staff Management
* **Administrative Verification Queue**: Newly registered pharmacy branches remain in a pending state until regulatory license verification is approved by an administrator.
* **Role-Based Access Control (RBAC)**: Distinguishes between customers, store owners, and staff pharmacists with object-level permissions.
* **Staff Membership Workflow**: Pharmacy owners issue time-limited invitation codes to onboard licensed pharmacists with approval and revocation workflows.
* **Unified Pharmacy Workspace**: Approved staff pharmacists share store inventory management and inbound consultation queues.

### Real-Time Consultation & Dispatch Engine
* **Duplex WebSocket Chat**: Secure, room-scoped bidirectional communication powered by Django Channels and Daphne ASGI.
* **Centralized Dispatch Architecture**: Unified event engine routing real-time client notifications via WebSockets and asynchronous email alerts via Celery task workers.

### Medication Catalog & Structured UI
* **Therapeutic Classification**: Structured indexing by therapeutic category, international nonproprietary name (INN), dosage form, strength, and prescription requirement.
* **High-Density Catalog Interface**: Includes client-side filtering, category navigation, prescription toggles, and asset caching via reverse proxy.

---

## 3. Technology Stack

| Layer | Technology | Details / Specification |
|---|---|---|
| **Frontend** | React 18, Vite, Vanilla CSS | React Router v6, custom CSS design tokens (`tokens.css`), zero UI framework bloat |
| **Backend** | Django 6.1, Django REST Framework | Python 3.12, DRF 3.15, class-based views, cursor pagination |
| **ASGI Server** | Daphne | Native ASGI server handling concurrent HTTP & WebSocket traffic |
| **Real-Time Communication** | Django Channels 4, WebSockets | Bidirectional customer consultation & real-time notification dispatch |
| **Authentication** | JWT (JSON Web Tokens) | `djangorestframework-simplejwt`, `dj-rest-auth`, `django-allauth` (Google OAuth2) |
| **Background Processing** | Celery 5.4 | Asynchronous email delivery & inventory notification background tasks |
| **Cache / Message Broker** | Redis 7 Alpine | Default Redis cache layer & `RedisPubSubChannelLayer` for Channels |
| **Database** | PostgreSQL 16 / 17 | Relational database container (`postgis/postgis:17-3.5-alpine`) |
| **Spatial Extension** | PostGIS 3.4 / 3.5 | Geodetic calculations, `PointField(geography=True)`, spatial queries |
| **Spatial / Search Indexing** | PostGIS GIST & PostgreSQL Trigram (`pg_trgm`) | High-speed spatial index + GIN fuzzy trigram index for typo-tolerant search |
| **Email Delivery** | SMTP over TLS | Asynchronous transaction and inquiry notifications via Celery |
| **Geolocation** | W3C Browser Geolocation API | Client-side coordinate acquisition for proximity distance calculation |
| **Maps** | OpenStreetMap / CartoDB map tiles | Leaflet / OpenRouteService routing and interactive pharmacy locator |
| **API Protocol** | JSON over HTTPS | RESTful API with OpenAPI 3.0 schema via `drf-spectacular` |
| **Real-Time Protocol** | WebSocket Secure (WSS) | Token-authenticated duplex WebSocket connection (`ws/chat/`, `ws/notifications/`) |


---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│       (React SPA + Reverse Proxy Gateway on :5173)          │
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

### Container Topology

| Service | Context | Host Port | Container Port | Description |
|---|---|---|---|---|
| `frontend` | `./frontend` | `5173` | `5173` | Single-page application dev server and proxy gateway |
| `backend` | `./backend` | `8002` | `8000` | Django REST Framework and Channels ASGI service |
| `celery` | `./backend` | — | — | Asynchronous worker process for email and event handling |
| `redis` | `redis:7-alpine` | `6380` | `6379` | Message broker and Channels communication layer |
| `db` | `postgis/postgis:17-3.5-alpine` | `5434` | `5432` | Relational spatial database |

---

## 5. Installation & Deployment

### Prerequisites
* Docker Engine (v24.0+) and Docker Compose (v2.0+)
* Git

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/medfinder.git
cd medfinder
```

### Step 2: Environment Configuration
Create a `.env` configuration file in the project root:
```env
# Database Configuration
POSTGRES_DB=medfinder
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Application Settings
SECRET_KEY=your-secure-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,backend

# Broker & Cache
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Outbound Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST_USER=notifications@medfinder.et
```

### Step 3: Initialize Infrastructure
```bash
docker compose up --build -d
```

### Step 4: Database Migrations
```bash
docker compose exec backend python manage.py migrate
```

### Step 5: Data Seeding
Populate therapeutic categories, canonical medicines, regional pharmacies, and inventory data:
```bash
docker compose exec -T backend python manage.py shell < mock_data/seed_medicines.py
```

### Step 6: Create Administrative Account
```bash
docker compose exec backend python manage.py createsuperuser
```

---

## 6. Access Points & Documentation

| Component | URL | Description |
|---|---|---|
| **Web Application** | [http://localhost:5173](http://localhost:5173) | Primary client user interface |
| **Medicine Catalog** | [http://localhost:5173/medicines](http://localhost:5173/medicines) | Structured medication registry |
| **Administration Console** | [http://localhost:8002/admin/](http://localhost:8002/admin/) | Django administration portal |
| **OpenAPI Documentation** | [http://localhost:8002/api/docs/](http://localhost:8002/api/docs/) | Interactive Swagger UI API explorer |
| **API Schema Specification** | [http://localhost:8002/api/docs/redoc/](http://localhost:8002/api/docs/redoc/) | ReDoc technical specification |

---

## 7. API Specification Overview

### Public Endpoints
* `GET /api/search/?q={query}&lat={latitude}&lng={longitude}&page={page}` — Geospatial and trigram inventory discovery.
* `GET /api/medicines/?search={term}&category__slug={slug}&requires_prescription={bool}&ordering={field}` — Paginated catalog index.
* `GET /api/medicines/categories/` — Master therapeutic categories list.
* `GET /api/pharmacies/` — Directory of verified pharmacies.
* `GET /api/pharmacies/{id}/` — Public profile of a verified pharmacy branch.

### Authenticated Endpoints (Bearer JWT Required)
* `POST /api/auth/login/` — Authentication endpoint returning access and refresh tokens.
* `POST /api/auth/register/` — Registration endpoint for customers and pharmacists.
* `POST /api/auth/token/refresh/` — Rotates access token using a valid refresh token.
* `GET /api/pharmacies/mine/` — Store management for pharmacy owners and staff.
* `POST /api/pharmacies/mine/{id}/invites/` — Generates staff onboarding invitation codes.
* `POST /api/pharmacies/join/` — Processes staff application via invitation code.
* `GET /api/inventory/` — Per-pharmacy inventory stock entries and pricing.
* `GET /api/conversations/` — Customer and pharmacist consultation inbox.
* `POST /api/conversations/start/` — Initializes a consultation thread with a pharmacy.

---

## 8. Verification & Maintenance

### Build Verification
```bash
docker compose run --rm frontend npm run build
```

### Test Suite Execution
```bash
docker compose exec backend python manage.py test
```

### Log Monitoring
```bash
docker compose logs -f backend celery
```

### Service Teardown
```bash
docker compose down
```

---

## 9. Security Invariants

1. **Authentication Token Lifecycle**:
   * Access tokens maintain a 30-minute lifespan.
   * Refresh tokens maintain a 7-day lifespan with automatic single-use rotation and database blacklisting to prevent replay attacks.
2. **Channel Authorization**:
   * WebSocket connections enforce room-scoped ownership, permitting only the initiating patient and verified pharmacy staff members to participate in consultation channels.
3. **Query Optimization**:
   * All relational querysets employ eager loading (`select_related` and `prefetch_related`) to prevent N+1 query execution.

---

## 10. License

This project is licensed under the MIT License.
