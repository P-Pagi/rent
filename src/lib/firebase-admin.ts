/**
 * Firebase Admin SDK singleton — modular API (firebase-admin v12+).
 *
 * Requires FIREBASE_SERVICE_ACCOUNT env var containing the full JSON of the
 * service-account private key downloaded from Firebase Console →
 * Project Settings → Service accounts → Generate new private key.
 *
 * Paste the entire JSON content (minified, one line) into your .env:
 *   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
 */
import {
  initializeApp,
  getApps,
  getApp,
  cert,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getMessaging as _getMessaging } from "firebase-admin/messaging";

let _app: App | null = null;

function getFirebaseApp(): App {
  if (_app) return _app;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT env variable is not set. " +
        "Download the service account JSON from Firebase Console and add it to .env."
    );
  }

  const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;

  // Reuse existing app if hot-reload already initialized it
  if (getApps().length > 0) {
    _app = getApp();
  } else {
    _app = initializeApp({
      credential: cert(serviceAccount),
    });
  }

  return _app;
}

export function getMessaging() {
  return _getMessaging(getFirebaseApp());
}
