# 📧 MailGenius — AI-Powered Email Assistant

**MailGenius** is a modern, production-ready AI email assistant built to help you craft polished email replies, improve existing drafts, and streamline inbox workflows in seconds. 

Powered by a multi-provider fallback AI architecture (**Google Gemini**, **Groq**, and **OpenRouter**), MailGenius provides high availability, intelligent context analysis, multiple tone presets, and seamless email recovery.

---

## ✨ Key Features

### 🤖 Multi-Provider AI Fallback Engine
- **Zero Downtime Routing**: Automatically cascades requests through free-tier AI providers (**Gemini 2.5 Flash → Groq Llama 3.3 70B → OpenRouter Llama 3.2 3B**). If one hits rate limits or experiences downtime, requests automatically fall back to the next provider.
- **Multi-Variation Generation**: Generate multiple distinct reply variations simultaneously (1 to 3 options) tailored to different tones and lengths.
- **Improve My Reply Mode**: Analyzes existing email drafts for grammar, tone, and clarity, providing side-by-side comparisons and actionable explanations.
- **Multilingual Support**: Supports multilingual inputs (**Auto-Detect, English, Hindi, Hinglish**) and translates/refines drafts into fluent, professional English.

### 🔐 Authentication, Guest Mode & Password Recovery
- **NextAuth v5 & Credentials**: Secure Email & Password authentication hashed with `bcryptjs`.
- **Guest Mode**: Try the AI generation features instantly without creating an account. Prompts to register/sign in only when saving templates or viewing history.
- **Forgot Password Recovery**: Secure self-service password reset system using single-use crypto tokens with 1-hour MongoDB TTL expiry and automated HTML email delivery via **Nodemailer** (Gmail SMTP).

### 📊 Dashboard & History Management
- **Interactive Dashboard**: At-a-glance analytics including total replies generated, time saved, saved templates, and a Quick Generate hero widget.
- **History & Search**: Paginated archive of all generated emails with instant search filtering.
- **Saved Templates**: Bookmark top-performing replies and reuse them in 1-click.

### 🎨 Responsive & Themeable UI/UX
- **Adaptive Design**: Fully responsive across desktop (1080p/4K), laptop, tablet, and mobile devices (360px+).
- **Dark & Light Mode**: Built-in theme switcher with CSS custom property design system.
- **Collapsible Sidebar**: Integrated quick-reference guides ("About" and "How to Use") with smooth scrolling navigation.

### 🛡️ Production-Grade Infrastructure
- **Redis Rate Limiting & Caching**: Powered by Upstash/Redis for distributed IP and user rate limiting.
- **Winston Structured Logging**: Configurable logging levels (`error`, `warn`, `info`, `debug`) for server monitoring.
- **Cloudinary Integration**: Cloud storage support for user profile avatars.
- **Zod Schema Validation**: Strict schema validation on all incoming API requests.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Frontend**: React 19, Vanilla CSS Custom Design System
- **Authentication**: [NextAuth.js v5 (Beta)](https://next-auth.js.org/)
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Caching & Rate Limiting**: [Redis](https://redis.io/) / [Upstash](https://upstash.com/) (`ioredis`)
- **Email Delivery**: [Nodemailer](https://nodemailer.com/)
- **AI Integrations**: 
  - [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`)
  - [Groq SDK / REST](https://groq.com/) (`llama-3.3-70b-versatile`)
  - [OpenRouter API](https://openrouter.ai/) (`meta-llama/llama-3.2-3b-instruct:free`)
- **Image Hosting**: [Cloudinary](https://cloudinary.com/)
- **Logging & Validation**: [Winston](https://github.com/winstonjs/winston), [Zod](https://zod.dev/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.17.0` or later
- **MongoDB**: A free MongoDB Atlas cluster URI
- **Google Gemini API Key**: [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Aman5ingh19/MailGenius---AI-Email-Assistant.git
cd MailGenius---AI-Email-Assistant
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root and fill in the required keys:

```env
# ── AI Providers (At least GEMINI_API_KEY required) ───────────────
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key          # Optional fallback
OPENROUTER_API_KEY=your_openrouter_key  # Optional fallback

# ── Database ──────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mailgenius

# ── Authentication (NextAuth v5) ──────────────────────────────────
# Generate secret: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET=your_generated_secret_key
NEXTAUTH_URL=http://localhost:3000

# ── Password Recovery Email (Gmail SMTP / Nodemailer) ─────────────
EMAIL_USER=your_app_email@gmail.com
EMAIL_PASS=your_16_character_google_app_password

# ── Cloudinary (Optional Avatar Storage) ──────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# ── Upstash / Redis (Optional Rate Limiting) ──────────────────────
REDIS_URL=redis://default:password@host:port

# ── Logging ───────────────────────────────────────────────────────
LOG_LEVEL=info
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using MailGenius!

---

## 📁 Project Structure

```text
├── app/
│   ├── api/                     # Backend Route Handlers
│   │   ├── auth/                # NextAuth & Password Reset endpoints
│   │   ├── generate/            # AI reply generation API
│   │   ├── history/             # History pagination & search API
│   ├── dashboard/               # Analytics & quick generation dashboard
│   ├── forgot-password/         # Password recovery request page
│   ├── generator/               # Main AI Email Assistant
│   ├── history/                 # Paginated activity archive
│   ├── login/                   # Auth & Guest Mode entry
│   ├── reset-password/          # Token verification & password reset page
│   ├── saved/                   # Saved templates collection
│   ├── settings/                # User preferences & profile settings
│   ├── globals.css              # Global tokens, themes, & responsive layouts
│   └── layout.js                # Root layout with Sidebar and Topbar
├── components/                  # Reusable UI elements (Sidebar, Topbar, ThemeToggle, Postmark)
├── lib/
│   ├── ai/                      # Central AI provider router & fallbacks
│   ├── models/                  # Mongoose Schemas (User, EmailHistory, Template, ResetToken)
│   ├── rateLimit.js             # Distributed Redis rate limiting
│   ├── logger.js                # Winston logging utility
│   ├── mongodb.js               # Cached MongoDB connection handler
│   └── actions.js               # Next.js Server Actions
└── proxy.js                     # Middleware for route protection & guest routing
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
