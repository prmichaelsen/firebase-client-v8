# Firebase Client v8 - Cloudflare Workers Compatible

## Overview

This library provides client-side Firebase functionality optimized for Cloudflare Workers and edge runtimes. It uses REST-based Firestore (long polling) instead of WebSocket connections, making it compatible with serverless environments.

## Key Features

- ✅ **Cloudflare Workers Compatible** - REST-based, no WebSocket connections
- ✅ **Firebase Authentication** - Email/password, OAuth providers
- ✅ **Firestore Client** - CRUD operations with offline cache
- ✅ **Firebase Storage** - File upload/download
- ✅ **Auth State Management** - Real-time auth state changes
- ✅ **Unlimited Cache** - Optimized for edge environments

## Architecture

```
firebase-client-v8/
├── src/
│   ├── index.ts                 # Main exports
│   ├── config.ts                # Firebase config from env vars
│   ├── auth.ts                  # Auth operations
│   ├── firestore.ts             # Firestore client
│   ├── storage.ts               # Storage client
│   └── types.ts                 # TypeScript types
├── agent/
│   └── architecture.md          # This file
└── package.json
```

## Core Components

### 1. Firebase Configuration

```typescript
// src/config.ts
export const firebaseConfig = {
  apiKey: process.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PUBLIC_FIREBASE_APP_ID,
};
```

### 2. Firebase Initialization

```typescript
// src/index.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

// Initialize Firebase app (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with Cloudflare Workers compatibility
const firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,      // Force REST-based long polling
  experimentalAutoDetectLongPolling: false, // Don't auto-detect (always use REST)
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,     // Use unlimited cache
  ignoreUndefinedProperties: true,          // Ignore undefined properties
});

// Export Firebase services
export const auth = getAuth(app);
export { firestore };
export const storage = getStorage(app);
export default app;
```

### 3. Authentication

```typescript
// src/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from './index';

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create new user account
 */
export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Sign out current user
 */
export async function logout() {
  return signOut(auth);
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  return auth.currentUser;
}

/**
 * Get ID token for current user
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Refresh ID token
 */
export async function refreshIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(true); // Force refresh
}
```

### 4. Firestore Operations

```typescript
// src/firestore.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { firestore } from './index';

/**
 * Get a document by ID
 */
export async function getDocument(
  collectionPath: string,
  documentId: string
): Promise<DocumentData | null> {
  const docRef = doc(firestore, collectionPath, documentId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Get all documents in a collection
 */
export async function getDocuments(
  collectionPath: string,
  ...constraints: QueryConstraint[]
): Promise<DocumentData[]> {
  const collectionRef = collection(firestore, collectionPath);
  const q = query(collectionRef, ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Add a new document
 */
export async function addDocument(
  collectionPath: string,
  data: DocumentData
): Promise<string> {
  const collectionRef = collection(firestore, collectionPath);
  const docRef = await addDoc(collectionRef, data);
  return docRef.id;
}

/**
 * Set a document (create or overwrite)
 */
export async function setDocument(
  collectionPath: string,
  documentId: string,
  data: DocumentData
): Promise<void> {
  const docRef = doc(firestore, collectionPath, documentId);
  await setDoc(docRef, data);
}

/**
 * Update a document
 */
export async function updateDocument(
  collectionPath: string,
  documentId: string,
  data: Partial<DocumentData>
): Promise<void> {
  const docRef = doc(firestore, collectionPath, documentId);
  await updateDoc(docRef, data);
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionPath: string,
  documentId: string
): Promise<void> {
  const docRef = doc(firestore, collectionPath, documentId);
  await deleteDoc(docRef);
}

/**
 * Query documents with filters
 */
export async function queryDocuments(
  collectionPath: string,
  filters: Array<{ field: string; operator: any; value: any }>,
  orderByField?: string,
  limitCount?: number
): Promise<DocumentData[]> {
  const constraints: QueryConstraint[] = filters.map(f =>
    where(f.field, f.operator, f.value)
  );
  
  if (orderByField) {
    constraints.push(orderBy(orderByField));
  }
  
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  
  return getDocuments(collectionPath, ...constraints);
}
```

### 5. Storage Operations

```typescript
// src/storage.ts
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage } from './index';

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  path: string,
  file: File | Blob
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/**
 * Get download URL for a file
 */
export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * List all files in a directory
 */
export async function listFiles(path: string): Promise<string[]> {
  const storageRef = ref(storage, path);
  const result = await listAll(storageRef);
  return result.items.map(item => item.fullPath);
}
```

## Usage Examples

### Authentication

```typescript
import { signIn, signUp, onAuthChange, getIdToken } from 'firebase-client-v8';

// Sign in
const userCredential = await signIn('user@example.com', 'password123');
console.log('Signed in:', userCredential.user.uid);

// Sign up
const newUser = await signUp('newuser@example.com', 'password123');
console.log('Created user:', newUser.user.uid);

// Listen to auth state
onAuthChange((user) => {
  if (user) {
    console.log('User signed in:', user.email);
  } else {
    console.log('User signed out');
  }
});

// Get ID token for API calls
const idToken = await getIdToken();
console.log('ID Token:', idToken);
```

### Firestore

```typescript
import { addDocument, getDocument, queryDocuments } from 'firebase-client-v8';

// Add a document
const docId = await addDocument('users', {
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: Date.now(),
});

// Get a document
const user = await getDocument('users', docId);
console.log('User:', user);

// Query documents
const activeUsers = await queryDocuments(
  'users',
  [{ field: 'active', operator: '==', value: true }],
  'createdAt',
  10
);
console.log('Active users:', activeUsers);
```

### Storage

```typescript
import { uploadFile, getFileUrl } from 'firebase-client-v8';

// Upload a file
const file = new File(['content'], 'example.txt');
const downloadUrl = await uploadFile('uploads/example.txt', file);
console.log('File uploaded:', downloadUrl);

// Get file URL
const url = await getFileUrl('uploads/example.txt');
console.log('File URL:', url);
```

## Environment Variables

```env
# Firebase Client Configuration (Public - safe to expose)
PUBLIC_FIREBASE_API_KEY=AIzaSy...
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Dependencies

```json
{
  "dependencies": {
    "firebase": "^10.7.0"
  }
}
```

## Cloudflare Workers Compatibility

### Key Configuration

The critical settings for Cloudflare Workers compatibility:

```typescript
initializeFirestore(app, {
  experimentalForceLongPolling: true,      // ✅ Use REST instead of WebSocket
  experimentalAutoDetectLongPolling: false, // ✅ Don't auto-detect
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,     // ✅ Unlimited cache
  ignoreUndefinedProperties: true,          // ✅ Ignore undefined
});
```

### Why These Settings?

1. **Long Polling** - Cloudflare Workers don't support persistent WebSocket connections
2. **REST-based** - All Firestore operations use REST API instead of gRPC
3. **Unlimited Cache** - Edge environments benefit from aggressive caching
4. **No Auto-detect** - Prevents fallback attempts that cause errors

## Auth State Management

```typescript
// Example: React hook for auth state
import { useState, useEffect } from 'react';
import { onAuthChange, type User } from 'firebase-client-v8';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  return { user, loading };
}
```

## Session Cookies

```typescript
// Create session cookie after sign in
import { signIn, getIdToken } from 'firebase-client-v8';

const userCredential = await signIn(email, password);
const idToken = await getIdToken();

// Send to server to create session cookie
await fetch('/api/auth/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken }),
});

// Server sets HTTP-only cookie with the ID token
```

## Key Differences from Standard Firebase

| Feature | Standard Firebase | This Library |
|---------|------------------|--------------|
| **Firestore** | WebSocket + gRPC | REST + Long Polling |
| **Environment** | Browser, Node.js | Browser, Workers, Edge |
| **Connections** | Persistent | Stateless |
| **Cache** | Limited | Unlimited |
| **Cold Starts** | Slower | Faster |

## Benefits

1. **Edge Compatible** - Runs in Cloudflare Workers, Deno, Bun
2. **No WebSocket** - REST-based, works in serverless
3. **Fast Cold Starts** - No persistent connections to establish
4. **Aggressive Caching** - Unlimited cache for better performance
5. **Standard Firebase API** - Same API as regular Firebase SDK

## Limitations

- No real-time listeners (use polling instead)
- No offline persistence (cache only)
- Slightly higher latency (REST vs WebSocket)

## Related

- [firebase-admin-sdk-v8](../firebase-admin-sdk-v8) - Server-side Firebase library
- [agentbase.me](../agentbase.me) - Uses both libraries for auth
