/**
 * Firebase configuration from environment variables
 */

import type { FirebaseConfig } from './types';

/**
 * Get Firebase configuration from environment variables
 * 
 * Environment variables should be prefixed with PUBLIC_ to indicate
 * they are safe to expose in client-side code.
 */
export const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PUBLIC_FIREBASE_APP_ID,
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
      `Please set the following environment variables: ${missing.map(k => `PUBLIC_FIREBASE_${k.toUpperCase()}`).join(', ')}`
    );
  }
}
