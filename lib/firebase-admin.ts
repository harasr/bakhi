import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../firebase-applet-config.json';

/**
 * Security Architect Tip: Use the server-side Admin SDK to verify tokens.
 */
if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export const adminAuth = getAuth();
export { firebaseConfig };
