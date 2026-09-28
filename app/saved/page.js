import { auth } from '@/auth';
import SavedClient from './SavedClient';
import { getTemplates } from '@/lib/actions';
import AuthRequiredCard from '@/components/AuthRequiredCard';

export const metadata = {
  title: 'Saved Templates — 📧 MailGenius',
  description: 'Browse and reuse your saved AI email reply templates.',
};

export default async function SavedPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <AuthRequiredCard
        title="Saved Templates are Locked"
        description="Your saved email templates and reusable snippets are encrypted and private to your account. Sign in or register to access and manage your templates library."
        feature="Saved Templates"
      />
    );
  }

  let templates = [];
  let dbError = null;

  try {
    templates = await getTemplates();
  } catch {
    dbError = 'Could not load templates. Please check your database connection.';
  }

  return <SavedClient templates={templates} dbError={dbError} />;
}
