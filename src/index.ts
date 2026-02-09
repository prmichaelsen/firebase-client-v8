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
import { firebaseConfig, validateConfig } from './config';

// Validate configuration on import
validateConfig();

/**
 * Initialize Firebase app (singleton pattern)
 * Returns existing app if already initialized
 */
export const app: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

/**
 * Initialize Firestore with Cloudflare Workers compatibility
 * 
 * Key settings:
 * - experimentalForceLongPolling: Use REST instead of WebSocket
 * - experimentalAutoDetectLongPolling: Don't auto-detect (always use REST)
 * - cacheSizeBytes: Use unlimited cache for edge environments
 * - ignoreUndefinedProperties: Ignore undefined properties in documents
 */
export const firestore: Firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  ignoreUndefinedProperties: true,
});

/**
 * Firebase Authentication instance
 */
export const auth: Auth = getAuth(app);

/**
 * Firebase Storage instance
 */
export const storage: FirebaseStorage = getStorage(app);

/**
 * Export Firebase app as default
 */
export default app;

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
