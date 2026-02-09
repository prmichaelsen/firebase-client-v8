/**
 * Firebase configuration from environment variables
 */

import type { FirebaseConfig } from './types';

/**
 * Get Firebase configuration from environment variables
 *
 * These are client-side Firebase configuration values (safe to expose).
 * Note: FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY is for server-side use only.
 */
export const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

/**
 * Validate Firebase configuration
 * Throws an error if required configuration is missing
 */
export function validateConfig(): void {
  const required = ['apiKey', 'authDomain', 'projectId'];
  const missing = required.filter(key => !firebaseConfig[key as keyof FirebaseConfig]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missing.join(', ')}. ` +
      `Please set the following environment variables: ${missing.map(k => `FIREBASE_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}`).join(', ')}`
    );
  }
}
