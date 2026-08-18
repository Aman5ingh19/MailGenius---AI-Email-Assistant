import { Suspense } from 'react';
import HistoryClient from './HistoryClient';

export const metadata = {
  title: 'History — 📧 MailGenius',
  description: 'Browse all your past AI-generated email replies.',
};

// History page now uses client-side pagination via /api/history
// No server-side data fetching needed — HistoryClient fetches on mount
export default function HistoryPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading history...</div>}>
      <HistoryClient />
    </Suspense>
  );
}
