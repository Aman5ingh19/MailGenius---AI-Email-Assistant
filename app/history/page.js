import { Suspense } from 'react';
import HistoryClient from './HistoryClient';
import { getHistory } from '@/lib/actions';

export const metadata = {
  title: 'History — 📧 MailGenius',
  description: 'Browse all your past AI-generated email replies.',
};

export default async function HistoryPage() {
  let history = [];
  let dbError = null;

  try {
    history = await getHistory();
  } catch {
    dbError = 'Could not load history. Please check your database connection.';
  }

  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading history...</div>}>
      <HistoryClient history={history} dbError={dbError} />
    </Suspense>
  );
}
