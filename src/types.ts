/**
 * TypeScript type definitions for firebase-client-v8
 */

import type { User } from 'firebase/auth';
import type { DocumentData, QueryConstraint } from 'firebase/firestore';

/**
 * Firebase configuration object
 */
export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

/**
 * Auth state change callback
 */
export type AuthStateCallback = (user: User | null) => void;

/**
 * Firestore query filter
 */
export interface FirestoreFilter {
  field: string;
  operator: '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
  value: any;
}

/**
 * Firestore document with ID
 */
export interface FirestoreDocument extends DocumentData {
  id: string;
}

/**
 * Re-export Firebase types
 */
export type { User, DocumentData, QueryConstraint };
