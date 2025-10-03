'use client';
import { redirect } from 'next/navigation';

// This page just redirects to the first settings page, which is team settings.
export default function SettingsRootPage() {
    redirect('/settings/team');
}
