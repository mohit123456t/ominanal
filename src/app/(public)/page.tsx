'use client';
import { redirect } from 'next/navigation';

export default function RootRedirect() {
    // This page is now a redirection hub. Redirect non-logged-in users to the landing page.
    redirect('/landing');
}
