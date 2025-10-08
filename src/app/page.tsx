import { redirect } from 'next/navigation';

export default function RootPage() {
  // This page now redirects to the public landing page.
  // The actual landing page content is in /src/app/(public)/page.tsx
  redirect('/');
}
