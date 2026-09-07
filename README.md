<div align="center">

# 📧 MailGenius — AI Email Assistant & Communication Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5_Beta-purple?style=for-the-badge&logo=auth0&logoColor=white)](https://authjs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**An executive-grade, production-ready AI email intelligence platform built to compose, audit, translate, and optimize professional email communications with zero-downtime multi-provider resilience.**

[Live Demo](#-live-demo--preview) • [Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Tech Stack](#-technology-stack) • [Installation](#-getting-started) • [API Documentation](#-api-endpoints)

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
        UI["Studio / Generator / Inbox"]
        Audit["Live Grammar & Tone Auditor"]
        Vault["Saved Templates & Reply Archive"]
    end

    subgraph Security ["Security & Middleware"]
        RL["Upstash Redis Rate Limiter"]
        Auth["Auth.js v5 (JWT & Bcrypt)"]
        Val["Zod Validation Layer"]
    end

    subgraph Router ["Multi-Provider AI Fallback Router"]
        Gemini["1. Google Gemini Flash (Primary)"]
        Groq["2. Groq LPU (Sub-second Fallback)"]
        OpenRouter["3. OpenRouter (Redundancy)"]
    end

    subgraph Persistence ["Data & Services"]
        Mongo[("MongoDB Atlas")]
        Cloudinary[("Cloudinary CDN")]
        SMTP["Nodemailer (Gmail TLS)"]
    end

    UI --> RL --> Val --> Auth
    Val --> Router
    Router -->|Try Primary| Gemini
    Gemini -.->|On 503 / 429 Failover| Groq
    Groq -.->|On Outage Failover| OpenRouter
    Auth --> Mongo
    UI --> Cloudinary
    Auth --> SMTP
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
| **AI Providers** | Google Gemini, Groq Cloud, OpenRouter | Multi-model fallback cascade for resilient LLM inference |
| **Authentication** | [Auth.js v5](https://authjs.dev/) / NextAuth, Bcrypt.js | JWT session handling and salted password encryption |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/), Mongoose ODM | Encrypted persistent storage for user data, history & templates |
| **Rate Limiting** | [Upstash Redis](https://upstash.com/) | Distributed sliding-window rate limiting per IP / User |
| **Media CDN** | [Cloudinary](https://cloudinary.com/) | Cloud storage and optimization for user profile avatars |
| **Validation & Logging**| [Zod](https://zod.dev/), [Winston](https://github.com/winstonjs/winston) | Strict runtime schema parsing and structured telemetry logging |
| **Email Service** | [Nodemailer](https://nodemailer.com/) | Transactional password recovery email delivery |

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
│   │   ├── history/route.js             # Paginated generation history API
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
│   ├── models/                          # Mongoose Schemas (User, History, Template, ResetToken)
│   ├── mongodb.js                       # Cached Mongoose connection handler
│   ├── rateLimit.js                     # Upstash Redis rate limiter
│   └── logger.js                        # Winston structured logger
└── auth.js                              # Auth.js credentials provider configuration
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or later
- **MongoDB Atlas**: Free cluster URI
- **AI API Keys**:
  - [Google AI Studio (Gemini)](https://aistudio.google.com/) *(Required)*
  - [Groq Cloud](https://console.groq.com/) *(Recommended for fallback)*
  - [OpenRouter](https://openrouter.ai/) *(Recommended for fallback)*

### 1. Clone the Repository
```bash
git clone https://github.com/Aman5ingh19/MailGenius---AI-Email-Assistant.git
cd MailGenius---AI-Email-Assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
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

# ── Email Service for Password Recovery (Optional) ───────────────
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_google_app_password

# ── Cloudinary Media Storage for Avatars (Optional) ──────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ── Redis Rate Limiting (Optional) ────────────────────────────────
REDIS_URL=rediss://default:password@host:6379

# ── Logging ───────────────────────────────────────────────────────
LOG_LEVEL=info
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/generate` | Generate email replies, quick replies, or draft audits | Optional (Rate limited) |
| `POST` | `/api/generate/stream`| Server-Sent Events (SSE) streaming reply generation | Optional (Rate limited) |
| `POST` | `/api/upload` | Parse `.eml` or `.txt` email files and extract body text | Optional |
| `GET/DELETE` | `/api/history` | Fetch paginated generation history or clear logs | Yes |
| `POST` | `/api/auth/register` | Register new user with encrypted credentials | No |
| `POST` | `/api/auth/forgot-password`| Dispatch cryptographic password reset email | No |
| `POST` | `/api/auth/reset-password` | Validate token and update user password | No |
| `POST/DELETE`| `/api/user/avatar` | Upload or remove user profile picture via Cloudinary | Yes |

---

## 💼 Resume & Portfolio Highlights

If you're referencing this project on your resume or portfolio, here are key bullet points showcasing full-stack software engineering depth:

- **Full-Stack Architecture**: Built an executive-grade AI communication platform using **Next.js 16 (App Router)**, **React 19**, and **Auth.js v5**, featuring seamless dark/light mode responsive design and zero-friction guest sessions.
- **Resilient AI Pipeline**: Engineered a zero-downtime multi-provider fallback engine spanning **Google Gemini Flash**, **Groq LPU**, and **OpenRouter**, maintaining 99.9% availability through automated failure recovery and model cascading.
- **Distributed Security & Rate Limiting**: Implemented **Upstash Redis** sliding-window rate limiting, cryptographic token-based password reset flows with **Nodemailer SMTP**, and salted **Bcrypt** hashing.
- **Real-Time Auditing & NLP**: Developed an interactive *"Improve My Reply"* engine performing structured grammar and clarity audits with side-by-side visual diffs and multilingual Hinglish/Hindi-to-English translation.

---

## 👨‍💻 Author

**Aman Singh**  
- **GitHub**: [@Aman5ingh19](https://github.com/Aman5ingh19)  
- **Repository**: [MailGenius — AI Email Assistant](https://github.com/Aman5ingh19/MailGenius---AI-Email-Assistant)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
