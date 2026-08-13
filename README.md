# MailGenius - AI Email Assistant

MailGenius is an intelligent email assistant built to help you generate professional email replies and improve your own drafts in seconds. Powered by a multi-provider AI architecture (Google Gemini, Groq, and OpenRouter), it analyzes the context of received emails and drafts tailored responses in various tones (Formal, Friendly, Concise, Persuasive) to save you time and maintain professionalism.

## Features

- **Dashboard:** At-a-glance analytics showing generated replies, saved replies, and recent activity. Includes a quick-generate widget.
- **Generate Reply:** Paste an email, select a tone, length, and number of variations, and get AI-generated replies instantly.
- **Improve My Reply:** Paste a drafted reply (with optional original email context) and get it corrected for grammar, tone, and professionalism. Includes detailed explanations of mistakes and AI suggestions.
- **Multi-language Support:** Detects input language (Auto, English, Hindi, Hinglish) and translates/polishes the final reply in professional English.
- **Robust AI Fallback System:** Ensures high availability by automatically routing requests through multiple free-tier AI providers (Gemini → Groq → OpenRouter). If a provider hits a rate limit or goes down, it seamlessly falls back to the next one.
- **History & Archive:** Automatically saves all generated and improved replies to your database, with a built-in search functionality.
- **Template System:** Save your favorite or most frequently used AI replies as templates for future reuse.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Vanilla CSS (Custom Design System)
- **Database:** MongoDB + Mongoose
- **AI Integration:** Centralized AI Router supporting Gemini 2.5 Flash, Groq (Llama 3.3 70b), and OpenRouter (Llama 3.2 3b) using native fetch and robust rate-limiting.

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB connection URI
- Google Gemini API Key
- (Optional) Groq API Key
- (Optional) OpenRouter API Key



## Project Structure

- `/app`: Next.js App Router pages (Dashboard, Generator, History, Saved, API routes).
- `/components`: Reusable UI components (Sidebar, Topbar, Postmark).
- `/lib`: Server actions, database connection, and Mongoose models (`EmailHistory`, `Template`).
- `/lib/ai`: AI provider chain and central fallback router.

## License

This project is licensed under the MIT License.
