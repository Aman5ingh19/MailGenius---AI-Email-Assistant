# MailGenius - AI Email Assistant

MailGenius is an intelligent email assistant built to help you generate professional email replies and improve your own drafts in seconds. Powered by Google's Gemini AI, it analyzes the context of received emails and drafts tailored responses in various tones (Formal, Friendly, Concise, Persuasive) to save you time and maintain professionalism.

## Features

- **Dashboard:** At-a-glance analytics showing generated replies, saved replies, and recent activity. Includes a quick-generate widget.
- **Generate Reply:** Paste an email, select a tone, length, and number of variations, and get AI-generated replies instantly.
- **Improve My Reply:** Paste a drafted reply (with optional original email context) and get it corrected for grammar, tone, and professionalism. Includes detailed explanations of mistakes and AI suggestions.
- **Multi-language Support:** Detects input language (Auto, English, Hindi, Hinglish) and translates/polishes the final reply in professional English.
- **History & Archive:** Automatically saves all generated and improved replies to your database, with a built-in search functionality.
- **Template System:** Save your favorite or most frequently used AI replies as templates for future reuse.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Vanilla CSS (Custom Design System)
- **Database:** MongoDB + Mongoose
- **AI Integration:** Google Generative AI (Gemini 2.5 Flash with automatic model fallbacks)

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB connection URI
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mailgenius.git
   cd mailgenius
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Project Structure

- `/app`: Next.js App Router pages (Dashboard, Generator, History, Saved, API routes).
- `/components`: Reusable UI components (Sidebar, Topbar, Postmark).
- `/lib`: Server actions, database connection, and Mongoose models (`EmailHistory`, `Template`).

## License

This project is licensed under the MIT License.
