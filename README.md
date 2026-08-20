# 📧 MailGenius — AI-Powered Email Assistant


**MailGenius** is an executive-grade, production-ready AI email communication platform engineered to help professionals, executives, support teams, and creators compose authentic, persuasive, and measured email replies in seconds.

*Crafted and engineered with precision by **Aman Singh**.*

---

## 🌟 What Makes MailGenius Different?

- **Multi-Provider AI Fallback Pipeline**: Zero downtime routing across **Google Gemini 1.5 Flash** (Primary Reasoning Engine), **Groq LLaMA 3.3 70B** (Sub-second LPU Fallback), and **OpenRouter LLaMA 3.2** (Distributed Cloud Router).
- **60-30-10 Professional Color Harmony**: Modern slate & sky blue palette (`#F8FAFC` base, `#FFFFFF` panels, `#0284C7` accent in light mode; `#0B0F19` obsidian, `#1E293B` cards, `#38BDF8` bright cyan accent in dark mode).
- **Live Mistake & Grammar Audit**: *"Improve My Reply"* mode analyzes rough drafts, flags grammatical errors, and presents side-by-side correction cards with actionable insights.
- **1-Click Smart Quick Replies**: AI extracts core thread intent and generates instant 1-click action pills (*Accept*, *Politely Decline*, *Reschedule*, *Request Deck*).
- **Multilingual Input & Polishing**: Draft in **English, Hindi, or Hinglish** — MailGenius seamlessly translates and polishes the output into fluent, professional English.
- **Dedicated Admin Control Hub**: 4-tabbed command center for Profile Identity, Cloudinary Avatar Uploads, Bcrypt Security, AI Defaults, and Custom Signatures.
- **Zero-Retention Enterprise Privacy**: No email content or generated responses are ever used to train public AI models.

---

## 🚀 Key Features Breakdown

### 🤖 1. AI Studio & Writing Engine
- **4 Adaptive Tone Modulators**: Select between **Formal** (`#0284C7`), **Friendly** (`#10B981`), **Concise** (`#D97706`), and **Persuasive** (`#8B5CF6`).
- **Length & Variation Modulators**: Generate 1, 3, or 5 simultaneous reply options in Shorter, Balanced, or Longer lengths.
- **Document & Email Parser**: Directly drop or upload `.txt` and `.eml` raw email files without copy-pasting.
- **Custom Signature Studio**: Automatically appends your configured professional sign-off to generated replies.

### 🛡️ 2. Authentication, Guest Mode & Security
- **NextAuth v5 & Bcrypt**: Secure Email & Password authentication with Bcrypt 12 rounds password hashing.
- **Interactive Password Visibility**: One-click Eye (`<Eye />` / `<EyeOff />`) toggle on all login, signup, and reset forms.
- **Zero-Friction Guest Mode**: Try all AI generation features instantly without registering; non-destructive read-only states for admin settings.
- **Password Reset Flow**: Cryptographic single-use token recovery with automated HTML delivery via **Nodemailer (Gmail SMTP)**.

### 📊 3. Reply History & Template Vault
- **Reply Archive (`/history`)**: Filter past replies by tone pills (*All, Formal, Friendly, Concise, Persuasive*), copy with 1 click, or load directly into the Studio with the **"⚡ Studio"** launcher.
- **Template Vault (`/saved`)**: Client-side live search, expandable cards, and 1-click reusable templates.
- **Executive Dashboard (`/dashboard`)**: Metric cards (Total Generations, Time Saved, Vault Count), recent activity feed, and quick generation widget.

### 📱 4. Multi-Device Responsiveness
- **Mobile (`< 768px`)**: Collapsible sliding drawer navigation, touch-friendly buttons ($\ge 44\text{px}$), and stacked input forms.
- **Tablet (`768px – 1080px`)**: Adaptive 2-column auto-fit grids and balanced control panels.
- **Desktop (`> 1080px`)**: 260px fixed command sidebar, split-view studio workspace, and sticky admin navigation tabs.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Full-stack server components, route handlers & SSR |
| **UI Library** | [React 19](https://react.dev/) | Declarative component UI engine |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, modern feather-style icons |
| **Design System** | Vanilla CSS + 60-30-10 Tokens | High-performance styling without heavy runtime CSS |
| **Auth** | [NextAuth.js v5 Beta](https://next-auth.js.org/) | Secure JWT session management & Bcrypt hashing |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/) + Mongoose | Encrypted cloud persistence for users, history & templates |
| **AI Providers** | Google Gemini, Groq, OpenRouter | Multi-provider fallback cascade with sub-second latency |
| **Media CDN** | [Cloudinary](https://cloudinary.com/) | Cloud hosting for user avatars |
| **Email Delivery** | [Nodemailer](https://nodemailer.com/) | Automated TLS password reset notifications |
| **Rate Limiting** | [Upstash / Redis](https://upstash.com/) | Distributed IP & user request rate limiting |
| **Validation & Logs** | [Zod](https://zod.dev/) & [Winston](https://github.com/winstonjs/winston) | Strict request parsing & structured log telemetry |

---

## 📂 Project Architecture

```text
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.js   # NextAuth v5 session handler
│   │   │   ├── register/route.js        # Safe signup & duplicate checking
│   │   │   ├── forgot-password/route.js # Password reset token dispatcher
│   │   │   └── reset-password/route.js  # Token verification & password reset
│   │   ├── generate/route.js            # Multi-provider AI generation pipeline
│   │   ├── history/route.js             # Paginated history fetch & delete API
│   │   └── user/
│   │       ├── avatar/route.js          # Cloudinary avatar upload/delete API
│   │       └── profile/route.js         # User profile updater
│   ├── about/page.js                    # Architecture, multi-provider engine & privacy specs
│   ├── dashboard/page.js                # Analytics dashboard & quick generation widget
│   ├── forgot-password/page.js          # Password recovery request page
│   ├── generator/page.js                # AI studio workspace with live auditing
│   ├── history/
│   │   ├── page.js                      # Server container
│   │   └── HistoryClient.js             # Filterable reply archive & studio launcher
│   ├── how-to-use/page.js               # 5-step user masterclass & keyboard shortcuts
│   ├── login/page.js                    # Auth entry with eye password toggle & branding
│   ├── reset-password/page.js           # Password reset form with eye toggle
│   ├── saved/
│   │   ├── page.js                      # Server container
│   │   └── SavedClient.js               # Live-searchable saved templates vault
│   ├── settings/page.js                 # 4-tab Admin Hub (Profile, Security, AI, System)
│   ├── globals.css                      # 60-30-10 tokens, typography & responsive layouts
│   └── layout.js                        # Root layout with Google Fonts, Sidebar & Topbar
├── components/
│   ├── Sidebar.js                       # Collapsible responsive command navigation
│   ├── Topbar.js                        # Global search, theme switcher & admin dropdown
│   ├── ThemeToggle.js                   # Smooth light/dark theme switch button
│   └── Postmark.js                      # Visual tone badge indicator
├── lib/
│   ├── ai/
│   │   ├── gemini.js                    # Google Gemini 1.5 Flash client
│   │   ├── groq.js                      # Groq LLaMA 3.3 (70B) fallback client
│   │   ├── openrouter.js                # OpenRouter LLaMA 3.2 fallback client
│   │   └── index.js                     # Fallback router orchestrator
│   ├── models/
│   │   ├── User.js                      # MongoDB User model
│   │   ├── EmailHistory.js              # History record schema
│   │   ├── Template.js                  # Saved template schema
│   │   └── ResetToken.js                # Password recovery token schema
│   ├── mongodb.js                       # Cached Mongoose connection handler
│   ├── rateLimit.js                     # Redis distributed rate limiter
│   └── logger.js                        # Winston structured logger
└── auth.js                              # NextAuth v5 configuration & credentials provider
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or later
- **MongoDB**: A free MongoDB Atlas cluster connection string
- **Google Gemini API Key**: [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/Aman5ingh19/MailGenius---AI-Email-Assistant.git
cd MailGenius---AI-Email-Assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and populate the required keys:

```env
# ── Primary AI Provider (Required) ────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key

# ── Fallback AI Providers (Optional but recommended for 99.9% uptime)
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# ── Database (Required) ───────────────────────────────────────────
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mailgenius

# ── NextAuth v5 Authentication (Required) ─────────────────────────
# Generate a secret: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
AUTH_SECRET=your_32_byte_base64_secret_key
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000

# ── Email Delivery for Password Recovery (Optional) ───────────────
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_google_app_password

# ── Cloudinary Media CDN for Avatars (Optional) ───────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ── Redis Rate Limiting (Optional) ────────────────────────────────
REDIS_URL=redis://default:password@host:port

# ── Logging Level ─────────────────────────────────────────────────
LOG_LEVEL=info
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Enterprise Privacy & Zero Retention

MailGenius adheres strictly to enterprise-grade data handling practices:
1. **Zero Model Training**: No user prompts, uploaded `.eml`/`.txt` files, or generated responses are ever utilized to train public AI models.
2. **User Vault Isolation**: Saved templates and response history are strictly partitioned and accessible solely by the authenticated owner.
3. **Transient Guest Sessions**: Guest mode operations run completely ephemerally with zero database retention.

---

## 👨‍💻 Author & Attribution

**MailGenius — Built by Aman Singh**  
- GitHub: [@Aman5ingh19](https://github.com/Aman5ingh19)
- Project Repository: [MailGenius — AI Email Assistant](https://github.com/Aman5ingh19/MailGenius---AI-Email-Assistant)

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
