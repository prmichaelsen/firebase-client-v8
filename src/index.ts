/**
 * Firebase client library optimized for Cloudflare Workers and edge runtimes
 * 
 * This library uses REST-based Firestore (long polling) instead of WebSocket
 * connections, making it compatible with serverless environments.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { initializeFirestore, CACHE_SIZE_UNLIMITED, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { setFirebaseConfig, getFirebaseConfig, validateConfig } from './config';
import type { FirebaseConfig } from './types';

/**
 * Firebase app instance (initialized after calling initializeFirebase)
 */
let app: FirebaseApp | null = null;

/**
 * Firestore instance (initialized after calling initializeFirebase)
 */
let firestoreInstance: Firestore | null = null;

/**
 * Firebase Authentication instance (initialized after calling initializeFirebase)
 */
let authInstance: Auth | null = null;

/**
 * Firebase Storage instance (initialized after calling initializeFirebase)
 */
let storageInstance: FirebaseStorage | null = null;

/**
 * Initialize Firebase with explicit configuration (optional)
 *
 * If not called, the library will attempt to auto-initialize from environment variables
 * on first use. Explicit initialization is recommended for better control.
 *
 * @param config - Firebase configuration object
 * @returns Firebase app instance
 *
 * @example
 * ```typescript
 * import { initializeFirebase } from '@prmichaelsen/firebase-client-v8';
 *
 * // Explicit initialization (recommended)
 * initializeFirebase({
 *   apiKey: import.meta.env.FIREBASE_API_KEY,
 *   authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
 *   projectId: import.meta.env.FIREBASE_PROJECT_ID,
 *   storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
 *   messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
 *   appId: import.meta.env.FIREBASE_APP_ID,
 * });
 * ```
 */
export function initializeFirebase(config: FirebaseConfig): FirebaseApp {
  // Validate configuration
  validateConfig(config);
  
  // Store configuration
  setFirebaseConfig(config);
  
  // Initialize Firebase services
  return ensureInitialized();
}

/**
 * Ensure Firebase is initialized
 * Auto-initializes from env vars if not explicitly initialized
 *
 * @internal
 */
function ensureInitialized(): FirebaseApp {
  if (!app) {
    const config = getFirebaseConfig(); // Will load from env if not set
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    
    // Initialize Firestore with Cloudflare Workers compatibility
    firestoreInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: false,
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      ignoreUndefinedProperties: true,
    });
    
    // Initialize Auth and Storage
    authInstance = getAuth(app);
    storageInstance = getStorage(app);
  }
  
  return app;
}

/**
 * Get Firebase app instance
 * Auto-initializes if not already initialized
 */
export function getFirebaseApp(): FirebaseApp {
  return ensureInitialized();
}

/**
 * Get Firestore instance
 * Auto-initializes if not already initialized
 */
export function getFirestore(): Firestore {
  ensureInitialized();
  return firestoreInstance!;
}

/**
 * Get Firebase Authentication instance
 * Auto-initializes if not already initialized
 */
export function getFirebaseAuth(): Auth {
  ensureInitialized();
  return authInstance!;
}

/**
 * Get Firebase Storage instance
 * Auto-initializes if not already initialized
 */
export function getFirebaseStorage(): FirebaseStorage {
  ensureInitialized();
  return storageInstance!;
}

/**
 * Legacy exports for backward compatibility
 * These will throw errors if Firebase is not initialized
 */
export const firestore = new Proxy({} as Firestore, {
  get: (_target, prop) => {
    const instance = getFirestore();
    return instance[prop as keyof Firestore];
  }
});

export const auth = new Proxy({} as Auth, {
  get: (_target, prop) => {
    const instance = getFirebaseAuth();
    return instance[prop as keyof Auth];
  }
});

export const storage = new Proxy({} as FirebaseStorage, {
  get: (_target, prop) => {
    const instance = getFirebaseStorage();
    return instance[prop as keyof FirebaseStorage];
  }
});

/**
 * Export Firebase app as default
 */
export default getFirebaseApp;

/**
 * Re-export all auth functions
 */
export * from './auth';

/**
 * Re-export all firestore functions
 */
export * from './firestore';

/**
 * Re-export all storage functions
 */
export * from './storage';

/**
 * Re-export all listener functions
 */
export * from './listeners';

/**
 * Re-export types
 */
export * from './types';
