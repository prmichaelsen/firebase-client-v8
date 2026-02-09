/**
 * Firebase configuration - supports both explicit initialization and env vars
 */

import type { FirebaseConfig } from './types';

/**
 * Firebase configuration (set via initializeFirebase or auto-loaded from env)
 */
let firebaseConfig: FirebaseConfig | null = null;

/**
 * Set Firebase configuration
 * This is called internally by initializeFirebase
 * 
 * @internal
 */
export function setFirebaseConfig(config: FirebaseConfig): void {
  firebaseConfig = config;
}

/**
 * Get Firebase configuration from environment variables
 * 
 * @internal
 */
function getConfigFromEnv(): FirebaseConfig {
  return {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };
}

/**
 * Get Firebase configuration
 * Returns explicit config if set, otherwise tries to load from environment variables
 * Throws error if neither is available
 * 
 * @internal
 */
export function getFirebaseConfig(): FirebaseConfig {
  // Return explicit config if set
  if (firebaseConfig) {
    return firebaseConfig;
  }
  
  // Try to load from environment variables
  const envConfig = getConfigFromEnv();
  
  // Validate env config
  try {
    validateConfig(envConfig);
    firebaseConfig = envConfig;
    return envConfig;
  } catch (error) {
    throw new Error(
      'Firebase has not been initialized. Either:\n' +
      '1. Call initializeFirebase() with your config, or\n' +
      '2. Set environment variables: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, etc.'
    );
  }
}

/**
 * Validate Firebase configuration
 * Throws an error if required configuration is missing
 * 
 * @internal
 */
export function validateConfig(config: FirebaseConfig): void {
  const required: Array<keyof FirebaseConfig> = ['apiKey', 'authDomain', 'projectId'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missing.join(', ')}.`
    );
  }
}
