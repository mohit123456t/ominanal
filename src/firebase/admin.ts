import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { ServiceAccount } from 'firebase-admin';

let adminApp: App;

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Construct the service account object from environment variables
  // This is a workaround because we cannot use a JSON file in this environment.
  const serviceAccount: ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: `firebase-adminsdk-gcp-sa@${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
    privateKey: "", // This will be empty, but initializeApp will use default credentials.
  };

  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

  return adminApp;
}
