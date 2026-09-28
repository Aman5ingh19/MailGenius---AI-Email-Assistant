import { Suspense } from 'react';
import { auth } from '@/auth';
import HistoryClient from './HistoryClient';
import AuthRequiredCard from '@/components/AuthRequiredCard';

export const metadata = {
  title: 'History — 📧 MailGenius',
  description: 'Browse all your past AI-generated email replies.',
};

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <AuthRequiredCard
        title="History Vault is Locked"
        description="Your AI-generated email reply archives are encrypted and private to your account. Sign in or register to browse, search, and manage your past history."
        feature="History"
      />
    );
  }

  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading history...</div>}>
      <HistoryClient />
    </Suspense>
  );
}
