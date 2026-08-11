import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export const metadata = {
  title: 'AI Email Reply Generator',
  description: 'Generate professional AI-powered email replies in seconds. Choose your tone, paste your email, and let Gemini craft the perfect response.',
  keywords: 'AI email, email reply generator, Gemini AI, email assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body style={{ display: 'flex', background: 'var(--bg)' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '260px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Topbar />
          <main style={{ padding: '2rem', flex: 1 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
