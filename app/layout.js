import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Providers from '@/components/Providers';
import { auth } from '@/auth';

export const metadata = {
  title: '📧 MailGenius — AI Email Assistant',
  description: 'Generate professional AI-powered email replies in seconds. Choose your tone, paste your email, and let Gemini craft the perfect response.',
  keywords: 'AI email, email reply generator, Gemini AI, email assistant',
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme by reading localStorage before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('mg-theme') || 'light';
                  document.documentElement.setAttribute('data-theme', t);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="app-layout">
        <Providers session={session}>
          <Sidebar />
          <div className="main-wrapper">
            <Topbar />
            <main className="main-content">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
