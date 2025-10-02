'use server';

import { initializeApp, getApps, App } from 'firebase-admin/app';

let adminApp: App;

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Set FIREBASE_CONFIG environment variable
  if (!process.env.FIREBASE_CONFIG) {
    process.env.FIREBASE_CONFIG = JSON.stringify({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  adminApp = initializeApp();
  return adminApp;
}
