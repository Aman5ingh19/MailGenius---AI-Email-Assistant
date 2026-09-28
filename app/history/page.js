import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import HistoryClient from './HistoryClient';

export const metadata = {
  title: 'History — 📧 MailGenius',
  description: 'Browse all your past AI-generated email replies.',
};

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/dashboard?guest_blocked=history');
  }

  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading history...</div>}>
      <HistoryClient />
    </Suspense>
  );
}
