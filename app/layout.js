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
      <body className="app-layout">
        <Sidebar />
        <div className="main-wrapper">
          <Topbar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
