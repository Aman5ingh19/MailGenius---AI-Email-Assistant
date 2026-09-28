import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import SavedClient from './SavedClient';
import { getTemplates } from '@/lib/actions';

export const metadata = {
  title: 'Saved Templates — 📧 MailGenius',
  description: 'Browse and reuse your saved AI email reply templates.',
};

export default async function SavedPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
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
