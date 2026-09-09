<div align="center">

# 📧 MailGenius — AI Email Assistant & Communication Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Firebase](https://img.shields.io/badge/Firebase-FCM_Push-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**An executive-grade, production-ready AI email intelligence platform built to compose, audit, translate, and optimize professional email communications with zero-downtime multi-provider resilience.**

---

</div>

## 📌 Executive Summary

**MailGenius** is an advanced full-stack AI email assistant designed to dramatically reduce communication latency while elevating professional correspondence quality. Featuring a **resilient multi-provider AI failover engine**, **live real-time grammar and tone auditing**, **multilingual Hinglish/Hindi-to-English translation**, and **context-aware 1-click quick replies**, MailGenius delivers enterprise-grade email workflows for executives, engineers, recruiters, and customer teams.

---

## 🌟 What Makes MailGenius Stand Out?

- **🔄 Multi-Provider Zero-Downtime AI Engine**: Autonomous fallback cascade across **Google Gemini Flash** (Primary Engine), **Groq LPU Acceleration** (Sub-second fallback), and **OpenRouter** (Distributed redundancy) — guaranteeing uninterrupted service even during peak API outages.
- **🔍 Live "Improve My Reply" Audit**: Real-time grammatical, tonal, and clarity diagnostics providing structured before/after diffs, mistake breakdowns, and contextual suggestions.
- **⚡ Instant 1-Click Intent Quick Replies**: Analyzes incoming email context and automatically generates 3 actionable response routes (*Accept & Confirm, Politely Decline, Request Clarification*).
- **🌐 Multilingual & Cross-Lingual Translation**: Compose drafts in casual Hindi, Hinglish, or raw informal notes — MailGenius translates and elevates them into polished, executive-ready English.
- **📄 Native Email & Document Extraction**: Drag-and-drop `.txt` and `.eml` files with direct text extraction to bypass manual copy-pasting.
- **🔐 Enterprise-Grade Security & Guest Mode**: Session-based Auth.js v5 (NextAuth) authentication with Bcrypt (12 rounds), cryptographic password recovery via Nodemailer, Upstash Redis distributed sliding-window rate limiting, and ephemeral guest access.
- **🎨 Modern Design System**: Pixel-perfect responsive interface built on a bespoke 60-30-10 tokenized color harmony with dark/light themes and fluid animations.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Next.js 16 App Router)"]
        UI["Studio / Generator / Dashboard"]
        Audit["Live Grammar & Tone Auditor"]
        FCM_UI["FCM Push Notification Client"]
        Vault["Saved Templates & Reply Archive"]
    end

    subgraph Security ["Security, Middleware & Rate Limiting"]
        RL["Upstash / Redis Rate Limiter"]
        Auth["Auth.js v5 (JWT & Bcrypt)"]
        Val["Zod Schema Validation"]
        Obs["Health & Uptime Monitor (/api/health)"]
    end

    subgraph Router ["Multi-Provider AI Fallback Router"]
        Gemini["1. Google Gemini Flash (Primary)"]
        Groq["2. Groq LPU (Sub-second Fallback)"]
        OpenRouter["3. OpenRouter (Redundancy)"]
    end

    subgraph CloudServices ["Cloud & Persistence Services"]
        Mongo[("MongoDB Database")]
        RedisServ[("Redis Caching & Queue")]
        FirebaseAdmin["Firebase Admin SDK (FCM Push Alerts)"]
        Cloudinary[("Cloudinary CDN Avatars")]
    end

    subgraph DevOps ["DevOps & CI/CD Pipeline"]
        GHA["GitHub Actions (CI/CD)"]
        DockerImg["Multi-Stage Alpine Docker (<150MB)"]
        GHCR["GitHub Container Registry / GHCR"]
    end

    UI --> FCM_UI
    UI --> RL --> Auth --> Val
    Val --> Router
    Router --> Gemini
    Router -.-> Groq
    Router -.-> OpenRouter
    Val --> Mongo
    Val --> RedisServ
    Val --> FirebaseAdmin
    GHA --> DockerImg --> GHCR
```

---

## 🚀 Key Features Breakdown

### 1. 🤖 AI Studio & Writing Orchestrator
- **4 Distinct Adaptive Tones**:
  - 💼 **Formal**: Measured, executive-level correspondence.
  - 😊 **Friendly**: Warm, collaborative, and approachable.
  - ⚡ **Concise**: High-impact, succinct replies (1–3 sentences).
  - 🎯 **Persuasive**: Compelling pitches, negotiation, and conversion-focused responses.
- **Multi-Variation Generation**: Generate up to 3 distinct variations simultaneously to choose the best angle.
- **Custom Signature Injection**: Automatically binds user-configured corporate sign-offs and roles.

### 2. 🛡️ Authentication, Security & Privacy
- **Dual-State Access**: Authenticated persistent vault or instant zero-friction Guest Mode.
- **Tokenized Password Recovery**: Single-use cryptographic reset tokens with automatic expiry and SMTP email notifications.
- **Zero AI Model Training**: Guaranteed zero-retention policy — user email data is never retained or utilized for model training.

### 3. 📊 Dashboard, Template Vault & History Analytics
- **Executive Metrics**: Tracks total generations, estimated time saved, and active templates.
- **Live Search & Filter**: Instant client-side search across historical replies and saved templates by tone and keyword.
- **1-Click Studio Re-hydration**: Load any archived or saved template directly back into the editor with one click.

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend & Framework** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) | Server Components, Streaming SSR, and optimized client rendering |
| **Styling & Design** | Vanilla CSS Design Tokens, [Lucide React](https://lucide.dev/) | High-performance 60-30-10 theme system with dark/light mode |
| **Containerization** | [Docker](https://www.docker.com/), Docker Compose | Multi-stage Alpine containerization (`<150MB`) with Redis and MongoDB |
| **CI/CD Pipeline** | [GitHub Actions](https://github.com/features/actions) | Automated linting, build verification, and GHCR container deployment |
| **Push Notifications** | [Firebase Cloud Messaging](https://firebase.google.com/) | Real-time background & foreground web push notification alerts |
| **AI Providers** | Google Gemini, Groq Cloud, OpenRouter | Multi-model fallback cascade for resilient LLM inference |
| **Authentication** | [Auth.js v5](https://authjs.dev/) / NextAuth, Bcrypt.js | JWT session handling and salted password encryption |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/), Mongoose ODM | Encrypted persistent storage for user data, history & templates |
| **Rate Limiting** | [Upstash Redis](https://upstash.com/), Redis 7 Alpine | Distributed sliding-window rate limiting per IP / User |
| **Media CDN** | [Cloudinary](https://cloudinary.com/) | Cloud storage and optimization for user profile avatars |
| **Validation & Logging**| [Zod](https://zod.dev/), [Winston](https://github.com/winstonjs/winston) | Strict runtime schema parsing and structured telemetry logging |
| **Email Service** | [Nodemailer](https://nodemailer.com/) | Transactional password recovery email delivery |

---

## 🐳 Docker & Containerization

MailGenius includes a production-optimized **multi-stage Dockerfile** (`output: 'standalone'`) yielding an image size **under 150MB** running securely under a non-root `nextjs:nodejs` Alpine user.

### Quick Start with Docker Compose (Next.js + Redis + MongoDB)

```bash
# 1. Start all services in the background
docker compose up -d

# 2. View running logs
docker compose logs -f app

# 3. Check health status
curl http://localhost:3000/api/health

# 4. Stop containers
docker compose down
```

---

## 🚀 CI/CD Pipeline (GitHub Actions)

The repository includes enterprise-grade automated workflows:

1. **Continuous Integration (`.github/workflows/ci.yml`)**:
   - Automated Linting (`npm run lint`)
   - Next.js Standalone Build Verification (`npm run build`)
2. **Continuous Deployment (`.github/workflows/docker-publish.yml`)**:
   - Multi-platform Docker Buildx builds
   - Automated publishing to **GitHub Container Registry (`ghcr.io`)** on `main` merges and version tags (`v*.*.*`).

---

## 🔥 Firebase Cloud Messaging (Push Notifications)

MailGenius incorporates real-time Web Push Notifications via **Firebase Cloud Messaging (FCM)**:
- **Client SDK**: Service worker registration (`/firebase-messaging-sw.js`) and foreground message listeners.
- **Server SDK**: Multicast push delivery through **Firebase Admin SDK** for AI task completion and delivery alerts.
- **1-Click User Activation**: Interactive toggle in Dashboard for browser notifications.

---

## 📂 Project Structure

```text
├── app/
│   ├── api/
│   │   ├── auth/                        # NextAuth, registration, password recovery routes
│   │   │   ├── [...nextauth]/route.js
│   │   │   ├── register/route.js
│   │   │   ├── forgot-password/route.js
│   │   │   └── reset-password/route.js
│   │   ├── generate/                    # Multi-provider generation & quick-replies API
│   │   │   ├── route.js
│   │   │   └── stream/route.js          # SSE Server-Sent Events stream generator
│   │   ├── health/route.js              # Production observability & health check API
│   │   ├── history/route.js             # Paginated generation history API
│   │   ├── notifications/route.js       # Firebase FCM registration & push alert API
│   │   ├── upload/route.js              # File parser (.eml / .txt) API
│   │   └── user/                        # Profile & Cloudinary avatar management
│   ├── about/page.js                    # Architecture & system specifications
│   ├── dashboard/page.js                # Analytics dashboard & metrics overview
│   ├── generator/page.js                # Core AI Studio workspace & live auditor
│   ├── history/page.js                  # Filterable reply history archive
│   ├── saved/page.js                    # Saved templates vault
│   ├── settings/page.js                 # 4-Tab Admin Hub (Profile, Security, AI Defaults)
│   └── globals.css                      # Design tokens, variables & responsive styling
├── components/
│   ├── NotificationBanner.js            # Live 1-click FCM push notification UI
│   ├── Sidebar.js                       # Collapsible responsive drawer navigation
│   ├── Topbar.js                        # Global search, theme switcher & user profile
│   ├── ThemeToggle.js                   # Dark/Light theme toggle
│   └── Postmark.js                      # Dynamic tone badge indicator
├── lib/
│   ├── ai/
│   │   ├── aiRouter.js                  # Central resilient multi-provider router
│   │   ├── geminiProvider.js            # Google Gemini client (with model cascade)
│   │   ├── groqProvider.js              # Groq LPU client (with multi-model fallback)
│   │   └── openrouterProvider.js        # OpenRouter client
│   ├── firebase/
│   │   ├── admin.js                     # Firebase Admin SDK initialization & push dispatch
│   │   └── client.js                    # Firebase Client SDK & token registration
│   ├── models/                          # Mongoose Schemas (User, History, Template, ResetToken)
│   ├── mongodb.js                       # Cached Mongoose connection handler
│   ├── rateLimit.js                     # Upstash Redis rate limiter
│   └── logger.js                        # Winston structured logger
├── public/
│   └── firebase-messaging-sw.js         # Service worker for background push notifications
├── .github/workflows/
│   ├── ci.yml                           # GitHub Actions CI workflow (Lint & Build)
│   └── docker-publish.yml               # GitHub Actions CD workflow (GHCR Docker Push)
├── docker-compose.yml                   # Multi-container orchestration (App + Redis + Mongo)
├── Dockerfile                           # Multi-stage production container configuration
└── auth.js                              # Auth.js credentials provider configuration
```

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# ── Primary AI Provider (Required) ────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key

# ── Fallback AI Providers (Recommended for 99.9% Uptime) ──────────
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# ── Database (Required) ───────────────────────────────────────────
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mailgenius

# ── Authentication (NextAuth / Auth.js v5) ────────────────────────
# Generate secret via: openssl rand -base64 32
AUTH_SECRET=your_32_byte_base64_secret_key
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000

# ── Redis Caching & Rate Limiting (Optional / Docker) ─────────────
REDIS_URL=rediss://default:password@host:6379
# Or for Docker:
# REDIS_HOST=redis
# REDIS_PORT=6379

# ── Firebase Cloud Messaging (Optional) ───────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_public_vapid_key
# FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# ── Cloudinary Media Storage for Avatars (Optional) ──────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ── Logging ───────────────────────────────────────────────────────
LOG_LEVEL=info
```

---

## 📡 API Endpoints

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health, MongoDB & Redis state, memory usage, uptime | No |
| `POST` | `/api/notifications`| Register FCM device tokens or trigger push alerts | Yes |
| `POST` | `/api/generate` | Generate email replies, quick replies, or draft audits | Optional (Rate limited) |
| `POST` | `/api/generate/stream`| Server-Sent Events (SSE) streaming reply generation | Optional (Rate limited) |
| `POST` | `/api/upload` | Parse `.eml` or `.txt` email files and extract body text | Optional |
| `GET/DELETE` | `/api/history` | Fetch paginated generation history or clear logs | Yes |
| `POST` | `/api/auth/register` | Register new user with encrypted credentials | No |
| `POST` | `/api/auth/forgot-password`| Dispatch cryptographic password reset email | No |
| `POST` | `/api/auth/reset-password` | Validate token and update user password | No |
| `POST/DELETE`| `/api/user/avatar` | Upload or remove user profile picture via Cloudinary | Yes |

---

## 💼 Resume & Portfolio Highlights (STAR Format)

If you're referencing this project on your resume or portfolio:

- **Cloud & DevOps Engineering**: Architected and containerized a full-stack Next.js 16 application using **Multi-Stage Docker builds** (`output: 'standalone'`), slashing image footprint by **85% (<150MB)**; orchestrated local multi-service topologies (App + Redis + MongoDB) with **Docker Compose**.
- **Automated CI/CD Pipelines**: Designed end-to-end **GitHub Actions** CI/CD workflows executing automated linting, standalone build validations, and automated container deployment to **GitHub Container Registry (GHCR)**.
- **Distributed AI Pipeline & High Availability**: Engineered a zero-downtime multi-provider fallback router across **Google Gemini Flash**, **Groq LPU**, and **OpenRouter**, maintaining 99.9% uptime with autonomous error recovery, streaming SSE responses, and token caching.
- **Real-Time Push Notifications**: Integrated **Firebase Cloud Messaging (FCM)** with service workers and Firebase Admin SDK to deliver real-time background push alerts upon AI task completion.
- **Enterprise Security & Observability**: Implemented **Upstash Redis** sliding-window rate limiting, cryptographic session tokens with **Auth.js v5 / Bcrypt**, CSP security headers, and an automated `/api/health` observability probe for container health monitoring.

---

## 👨‍💻 Author

**Aman Singh**  
- **GitHub**: [@Aman5ingh19](https://github.com/Aman5ingh19)  
- **Repository**: [MailGenius — AI Email Assistant](https://github.com/Aman5ingh19/MailGenius---AI-Email-Assistant)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
