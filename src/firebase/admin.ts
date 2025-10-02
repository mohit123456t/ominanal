import { initializeApp, getApps, App } from 'firebase-admin/app';

let adminApp: App;

/**
 * Initializes and returns the Firebase Admin App instance.
 * In a managed Google Cloud environment, initializeApp() automatically
 * discovers the service account credentials.
 */
export function getFirebaseAdminApp(): App {
  // If the app is already initialized, return the existing instance.
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Initialize the Firebase Admin SDK. In a managed environment like Cloud Workstations,
  // this will automatically use the environment's service account.
  adminApp = initializeApp();

  return adminApp;
}
