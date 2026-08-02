<div align="center">
  <h1>🛡️ CivicFix</h1>
  <p><b>Enterprise Civic Issue Reporting & Municipal Operations Platform</b></p>

  [![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Docker](https://img.shields.io/badge/Docker-24+-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
</div>

---

## 📖 Overview

**CivicFix** is an enterprise-grade, full-stack civic infrastructure reporting and municipal operations platform. It empowers citizens to report non-emergency infrastructure failures (potholes, streetlights, public hazards) while providing municipal department officials with an automated moderation queue, worker assignment tools, and an immutable audit logging timeline.

Built following **Clean Architecture**, **SOLID principles**, and production security standards.

---

## 🌟 Key Features

* 🏛️ **Citizen Infrastructure Reporting**: Geo-located issue submission with browser location auto-capture, urgency priority levels, and multi-photo uploads.
* 🗺️ **Interactive GeoJSON Heatmap**: Proximity-based radius filtering returning RFC 7946 GeoJSON FeatureCollections for geospatial rendering.
* 🛡️ **Role-Based Access Control (RBAC)**: Fine-grained access control across `CITIZEN`, `OFFICIAL`, and `ADMIN` user tiers.
* 📋 **Official Moderation Queue**: Department official dashboard for approving, rejecting (with mandatory remarks), and reassigning reports.
* 📜 **Immutable Audit Trail**: Chronological event tracking (`REPORT_SUBMITTED`, `REPORT_APPROVED`, `DEPARTMENT_ASSIGNED`, `STATUS_CHANGED`) for complete transparency.
* ⚡ **Asynchronous Celery Workers**: Redis-backed message queue for background job processing with automatic exponential backoff retries.
* 🎨 **Enterprise React SPA**: Modern dark slate theme, glassmorphism UI components, responsive layouts, and zero inline CSS.

---

## 🏗️ System Architecture

CivicFix adheres strictly to **Clean Architecture** with four isolated dependency layers:

```
                      ┌──────────────────────────────────────────┐
                      │          Presentation (FastAPI)          │
                      └────────────────────┬─────────────────────┘
                                           │
                                           ▼
                      ┌──────────────────────────────────────────┐
                      │         Application (Use Cases)          │
                      └────────────────────┬─────────────────────┘
                                           │
                                           ▼
                      ┌──────────────────────────────────────────┐
                      │         Domain (Entities & VOs)          │
                      └────────────────────┬─────────────────────┘
                                           ▲
                                           │
                      ┌────────────────────┴─────────────────────┐
                      │     Infrastructure (SQLAlchemy/Redis)    │
                      └──────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend Core** | Python 3.12, FastAPI, Pydantic v2, PyJWT, Bcrypt |
| **Database & ORM** | PostgreSQL 16, SQLAlchemy 2.0 Async, AsyncPG, Alembic |
| **Background Tasks** | Celery 5.5+, Redis 7 |
| **Frontend Web SPA** | React 18, TypeScript 5, Vite, TailwindCSS v3, Axios |
| **Reverse Proxy & TLS** | Nginx Alpine, Let's Encrypt TLS 1.3, Rate Limiting |
| **Containerization & CI/CD** | Docker multi-stage builds, Docker Compose, GitHub Actions |

---

## 🚀 Quick Start (Docker Compose)

The fastest way to launch the complete full-stack environment is using Docker Compose:

### 1. Clone the Repository
```bash
git clone https://github.com/imSai-py/CivicFix.git
cd CivicFix
```

### 2. Copy Environment Template
```bash
cp .env.example .env
```

### 3. Launch Services
```bash
docker compose up --build -d
```

Once running, access:
* 🌐 **Web SPA Frontend**: `http://localhost` (or `https://localhost`)
* ⚡ **FastAPI Backend API**: `http://localhost:8000/api/v1`
* 📑 **Interactive OpenAPI Docs**: `http://localhost:8000/docs`

---

## 🧪 Running Automated Tests

Run the complete backend test suite (unit + integration API tests):

```bash
# Install backend in dev mode
pip install -e .[dev]

# Run Pytest suite
pytest -v
```

---

## 🔐 API Reference Highlights

| Method | Endpoint | Description | Access Tier |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new citizen account | Public |
| `POST` | `/api/v1/auth/login` | Authenticate and receive JWT tokens | Public |
| `GET` | `/api/v1/issues` | Query and paginate reported issues | Public |
| `GET` | `/api/v1/issues/nearby` | Geospatial search returning GeoJSON | Public |
| `POST` | `/api/v1/issues` | Submit a new infrastructure report | Authenticated |
| `POST` | `/api/v1/issues/{id}/approve` | Approve report (`SUBMITTED` ➔ `ACKNOWLEDGED`) | Official / Admin |
| `POST` | `/api/v1/issues/{id}/reject` | Reject report with mandatory remarks | Official / Admin |
| `POST` | `/api/v1/issues/{id}/assign` | Reassign report to target department | Admin |
| `GET` | `/api/v1/issues/{id}/audit-logs` | Retrieve immutable audit timeline | Authenticated |

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.
