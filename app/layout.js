import './globals.css';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Providers from '@/components/Providers';
import { auth } from '@/auth';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: '📧 MailGenius — AI Email Assistant',
  description: 'Generate professional AI-powered email replies in seconds. Choose your tone, paste your email, and let Gemini craft the perfect response.',
  keywords: 'AI email, email reply generator, Gemini AI, email assistant',
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
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
