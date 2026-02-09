# Firebase Client v8 - Cloudflare Workers Compatible

A Firebase client library optimized for Cloudflare Workers and edge runtimes. Uses REST-based Firestore (long polling) instead of WebSocket connections, making it compatible with serverless environments.

## Features

- ✅ **Cloudflare Workers Compatible** - REST-based, no WebSocket connections
- ✅ **Firebase Authentication** - Email/password, OAuth providers (Google, GitHub, Facebook, Twitter)
- ✅ **Firestore Client** - Full CRUD operations with merge options, batch writes, and transactions
- ✅ **Firebase Storage** - File upload/download with progress tracking
- ✅ **Auth State Management** - Real-time auth state changes
- ✅ **Polling-based Listeners** - Document and collection watchers for edge environments
- ✅ **Unlimited Cache** - Optimized for edge environments
- ✅ **TypeScript Support** - Full type definitions included

## Installation

```bash
npm install @prmichaelsen/firebase-client-v8
```

## Environment Variables

Set these environment variables in your project:

```env
# Firebase Client Configuration (Public - safe to expose)
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

## Quick Start

```typescript
import { signIn, getDocument, uploadFile } from '@prmichaelsen/firebase-client-v8';

// Sign in
const userCredential = await signIn('user@example.com', 'password123');
console.log('Signed in:', userCredential.user.uid);

// Get a document
const user = await getDocument('users', 'user123');
console.log('User:', user);

// Upload a file
const file = new File(['content'], 'example.txt');
const downloadUrl = await uploadFile('uploads/example.txt', file);
console.log('File uploaded:', downloadUrl);
```

## Authentication

### Email/Password Authentication

```typescript
import { signIn, signUp, logout, resetPassword } from '@prmichaelsen/firebase-client-v8';

// Sign in
const userCredential = await signIn('user@example.com', 'password123');

// Sign up
const newUser = await signUp('newuser@example.com', 'password123');

// Sign out
await logout();

// Reset password
await resetPassword('user@example.com');
```

### OAuth Providers

```typescript
import { 
  signInWithGoogle, 
  signInWithGithub, 
  signInWithFacebook,
  signInWithTwitter 
} from '@prmichaelsen/firebase-client-v8';

// Sign in with Google
const userCredential = await signInWithGoogle();

// Sign in with GitHub
const userCredential = await signInWithGithub();

// Sign in with Facebook
const userCredential = await signInWithFacebook();

// Sign in with Twitter
const userCredential = await signInWithTwitter();
```

### Custom Provider

```typescript
import { signInWithProvider, GoogleAuthProvider } from '@prmichaelsen/firebase-client-v8';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
const userCredential = await signInWithProvider(provider);
```

### Auth State Listener

```typescript
import { onAuthChange } from '@prmichaelsen/firebase-client-v8';

const unsubscribe = onAuthChange((user) => {
  if (user) {
    console.log('User signed in:', user.email);
  } else {
    console.log('User signed out');
  }
});

// Later, stop listening
unsubscribe();
```

### User Management

```typescript
import { 
  getCurrentUser, 
  getIdToken, 
  refreshIdToken,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  sendVerificationEmail,
  deleteUserAccount
} from '@prmichaelsen/firebase-client-v8';

// Get current user
const user = await getCurrentUser();

// Get ID token
const idToken = await getIdToken();

// Refresh token
const freshToken = await refreshIdToken();

// Update profile
await updateUserProfile({
  displayName: 'John Doe',
  photoURL: 'https://example.com/photo.jpg'
});

// Update email
await updateUserEmail('newemail@example.com');

// Update password
await updateUserPassword('newPassword123');

// Send verification email
await sendVerificationEmail();

// Delete account
await deleteUserAccount();
```

## Firestore

### Basic Operations

```typescript
import { 
  getDocument, 
  addDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument 
} from '@prmichaelsen/firebase-client-v8';

// Get document
const user = await getDocument('users', 'user123');

// Add document (auto-generated ID)
const docId = await addDocument('users', {
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: Date.now(),
});

// Set document (create or overwrite)
await setDocument('users', 'user123', {
  email: 'user@example.com',
  name: 'John Doe',
});

// Update document
await updateDocument('users', 'user123', {
  name: 'Jane Doe',
});

// Delete document
await deleteDocument('users', 'user123');
```

### Merge Options

```typescript
import { setDocument } from '@prmichaelsen/firebase-client-v8';

// Merge with existing document
await setDocument('users', 'user123', {
  name: 'Jane Doe',
}, { merge: true });

// Merge specific fields only
await setDocument('users', 'user123', {
  name: 'Jane Doe',
  age: 30,
}, { mergeFields: ['name'] });
```

### Querying Documents

```typescript
import { getDocuments, queryDocuments } from '@prmichaelsen/firebase-client-v8';
import { where, orderBy, limit } from 'firebase/firestore';

// Get all documents
const allUsers = await getDocuments('users');

// Query with constraints
const activeUsers = await getDocuments(
  'users',
  where('active', '==', true),
  orderBy('createdAt', 'desc'),
  limit(10)
);

// Query with helper function
const adults = await queryDocuments(
  'users',
  [
    { field: 'active', operator: '==', value: true },
    { field: 'age', operator: '>=', value: 18 }
  ],
  'createdAt',
  10
);
```

### Pagination

```typescript
import { getDocumentsWithPagination } from '@prmichaelsen/firebase-client-v8';
import { orderBy } from 'firebase/firestore';

// First page
const page1 = await getDocumentsWithPagination(
  'users', 
  10,
  undefined,
  orderBy('createdAt', 'desc')
);

// Next page
const lastDoc = page1[page1.length - 1];
const page2 = await getDocumentsWithPagination(
  'users',
  10,
  lastDoc,
  orderBy('createdAt', 'desc')
);
```

### Batch Operations

```typescript
import { createBatch, commitBatch } from '@prmichaelsen/firebase-client-v8';
import { doc, increment } from 'firebase/firestore';
import { firestore } from '@prmichaelsen/firebase-client-v8';

const batch = createBatch();

const userRef = doc(firestore, 'users', 'user123');
batch.set(userRef, { name: 'John Doe' });

const postRef = doc(firestore, 'posts', 'post456');
batch.update(postRef, { likes: increment(1) });

const commentRef = doc(firestore, 'comments', 'comment789');
batch.delete(commentRef);

await commitBatch(batch);
```

### Transactions

```typescript
import { runFirestoreTransaction } from '@prmichaelsen/firebase-client-v8';
import { doc } from 'firebase/firestore';
import { firestore } from '@prmichaelsen/firebase-client-v8';

const result = await runFirestoreTransaction(async (transaction) => {
  const userRef = doc(firestore, 'users', 'user123');
  const userDoc = await transaction.get(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User does not exist');
  }
  
  const newBalance = userDoc.data().balance + 100;
  transaction.update(userRef, { balance: newBalance });
  
  return newBalance;
});
```

### Field Values

```typescript
import { updateDocument } from '@prmichaelsen/firebase-client-v8';
import { 
  serverTimestamp, 
  increment, 
  arrayUnion, 
  arrayRemove,
  deleteField 
} from 'firebase/firestore';

await updateDocument('users', 'user123', {
  // Set server timestamp
  updatedAt: serverTimestamp(),
  
  // Increment a number
  loginCount: increment(1),
  
  // Add to array
  tags: arrayUnion('premium', 'verified'),
  
  // Remove from array
  oldTags: arrayRemove('trial'),
  
  // Delete a field
  tempData: deleteField(),
});
```

### Utility Functions

```typescript
import { documentExists, countDocuments } from '@prmichaelsen/firebase-client-v8';
import { where } from 'firebase/firestore';

// Check if document exists
const exists = await documentExists('users', 'user123');

// Count documents
const totalUsers = await countDocuments('users');
const activeUsers = await countDocuments('users', where('active', '==', true));
```

## Polling-based Listeners

Since real-time listeners don't work well in serverless environments, use polling-based alternatives:

### Document Listener

```typescript
import { onDocumentChange } from '@prmichaelsen/firebase-client-v8';

const unsubscribe = onDocumentChange(
  'users',
  'user123',
  (doc) => {
    if (doc) {
      console.log('User updated:', doc.name);
    } else {
      console.log('User deleted');
    }
  },
  { interval: 3000, immediate: true }
);

// Stop listening
unsubscribe();
```

### Collection Listener

```typescript
import { onCollectionChange } from '@prmichaelsen/firebase-client-v8';
import { where, orderBy } from 'firebase/firestore';

const unsubscribe = onCollectionChange(
  'users',
  (docs) => {
    console.log('Users updated:', docs.length);
  },
  { interval: 5000 },
  where('active', '==', true),
  orderBy('createdAt', 'desc')
);

// Stop listening
unsubscribe();
```

### Document Watcher

```typescript
import { createDocumentWatcher } from '@prmichaelsen/firebase-client-v8';

const userWatcher = createDocumentWatcher('users', 'user123', {
  interval: 3000
});

// Subscribe to changes
const unsubscribe = userWatcher.subscribe((doc) => {
  console.log('User changed:', doc);
});

// Get current value
const currentUser = userWatcher.getValue();

// Stop watching
unsubscribe();

// Or destroy completely
userWatcher.destroy();
```

### Collection Watcher

```typescript
import { createCollectionWatcher } from '@prmichaelsen/firebase-client-v8';
import { where } from 'firebase/firestore';

const usersWatcher = createCollectionWatcher(
  'users',
  { interval: 5000 },
  where('active', '==', true)
);

const unsubscribe = usersWatcher.subscribe((docs) => {
  console.log('Active users:', docs.length);
});

// Get current value
const currentUsers = usersWatcher.getValue();

// Stop watching
unsubscribe();
```

## Storage

### Upload Files

```typescript
import { uploadFile, uploadFileWithMetadata } from '@prmichaelsen/firebase-client-v8';

// Simple upload
const file = new File(['content'], 'example.txt');
const downloadUrl = await uploadFile('uploads/example.txt', file);

// Upload with metadata
const url = await uploadFileWithMetadata('uploads/example.txt', file, {
  contentType: 'text/plain',
  customMetadata: { userId: 'user123' }
});
```

### Upload with Progress

```typescript
import { uploadFileWithProgress } from '@prmichaelsen/firebase-client-v8';

const file = new File(['content'], 'example.txt');
const url = await uploadFileWithProgress(
  'uploads/example.txt',
  file,
  (progress) => {
    console.log(`Upload: ${progress.percentage}% (${progress.bytesTransferred}/${progress.totalBytes})`);
  }
);
```

### Resumable Upload

```typescript
import { createUploadTask } from '@prmichaelsen/firebase-client-v8';

const file = new File(['content'], 'example.txt');
const uploadTask = createUploadTask('uploads/example.txt', file);

uploadTask.on('state_changed',
  (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
  },
  (error) => console.error('Upload failed:', error),
  async () => {
    const url = await getDownloadURL(uploadTask.snapshot.ref);
    console.log('File available at', url);
  }
);

// Control upload
uploadTask.pause();
uploadTask.resume();
uploadTask.cancel();
```

### File Operations

```typescript
import { 
  getFileUrl, 
  deleteFile, 
  listFiles, 
  listAllItems,
  getFileMetadata,
  updateFileMetadata
} from '@prmichaelsen/firebase-client-v8';

// Get download URL
const url = await getFileUrl('uploads/example.txt');

// Delete file
await deleteFile('uploads/example.txt');

// List files
const files = await listFiles('uploads/');

// List files and directories
const { files, directories } = await listAllItems('uploads/');

// Get metadata
const metadata = await getFileMetadata('uploads/example.txt');
console.log('File size:', metadata.size);

// Update metadata
await updateFileMetadata('uploads/example.txt', {
  contentType: 'text/plain',
  customMetadata: { userId: 'user123' }
});
```

## React Hook Example

```typescript
import { useState, useEffect } from 'react';
import { onAuthChange, type User } from '@prmichaelsen/firebase-client-v8';

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

## Cloudflare Workers Compatibility

### Key Configuration

The library is configured for Cloudflare Workers compatibility:

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

## API Reference

### Authentication

- `signIn(email, password)` - Sign in with email/password
- `signUp(email, password)` - Create new user account
- `signInWithGoogle()` - Sign in with Google
- `signInWithGithub()` - Sign in with GitHub
- `signInWithFacebook()` - Sign in with Facebook
- `signInWithTwitter()` - Sign in with Twitter
- `signInWithProvider(provider)` - Sign in with custom provider
- `signInWithToken(token)` - Sign in with custom token
- `logout()` - Sign out current user
- `resetPassword(email)` - Send password reset email
- `onAuthChange(callback)` - Listen to auth state changes
- `getCurrentUser()` - Get current authenticated user
- `getIdToken()` - Get ID token for current user
- `refreshIdToken()` - Refresh ID token
- `updateUserProfile(profile)` - Update user profile
- `updateUserEmail(email)` - Update user email
- `updateUserPassword(password)` - Update user password
- `sendVerificationEmail()` - Send email verification
- `deleteUserAccount()` - Delete user account

### Firestore

- `getDocument(collectionPath, documentId)` - Get a document by ID
- `getDocuments(collectionPath, ...constraints)` - Get documents with query
- `addDocument(collectionPath, data)` - Add new document
- `setDocument(collectionPath, documentId, data, options?)` - Set document with merge options
- `updateDocument(collectionPath, documentId, data)` - Update document
- `deleteDocument(collectionPath, documentId)` - Delete document
- `queryDocuments(collectionPath, filters, orderBy?, limit?)` - Query documents
- `getDocumentsWithPagination(collectionPath, pageSize, lastDoc?, ...constraints)` - Get paginated documents
- `countDocuments(collectionPath, ...constraints)` - Count documents
- `documentExists(collectionPath, documentId)` - Check if document exists
- `createBatch()` - Create batch for multiple operations
- `commitBatch(batch)` - Commit batch operations
- `runFirestoreTransaction(updateFunction)` - Run transaction

### Storage

- `uploadFile(path, file)` - Upload file
- `uploadFileWithMetadata(path, file, metadata)` - Upload file with metadata
- `uploadFileWithProgress(path, file, onProgress?, metadata?)` - Upload with progress tracking
- `createUploadTask(path, file, metadata?)` - Create resumable upload task
- `getFileUrl(path)` - Get download URL
- `deleteFile(path)` - Delete file
- `listFiles(path)` - List files in directory
- `listAllItems(path)` - List files and subdirectories
- `getFileMetadata(path)` - Get file metadata
- `updateFileMetadata(path, metadata)` - Update file metadata
- `getStorageRef(path)` - Get storage reference

### Listeners (Polling-based)

- `onDocumentChange(collectionPath, documentId, callback, options?)` - Listen to document changes
- `onCollectionChange(collectionPath, callback, options?, ...constraints)` - Listen to collection changes
- `createDocumentWatcher(collectionPath, documentId, options?)` - Create document watcher
- `createCollectionWatcher(collectionPath, options?, ...constraints)` - Create collection watcher

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
import type { 
  User, 
  FirestoreDocument, 
  FirestoreFilter,
  AuthStateCallback,
  DocumentListenerCallback,
  CollectionListenerCallback,
  UploadProgressCallback
} from '@prmichaelsen/firebase-client-v8';
```

## Key Differences from Standard Firebase

| Feature | Standard Firebase | This Library |
|---------|------------------|--------------|
| **Firestore** | WebSocket + gRPC | REST + Long Polling |
| **Real-time Listeners** | WebSocket-based | Polling-based |
| **Environment** | Browser, Node.js | Browser, Workers, Edge |
| **Connections** | Persistent | Stateless |
| **Cache** | Limited | Unlimited |
| **Cold Starts** | Slower | Faster |
| **Batch Operations** | ✅ | ✅ |
| **Transactions** | ✅ | ✅ |
| **OAuth Providers** | ✅ | ✅ |
| **Storage Progress** | ✅ | ✅ |

## Benefits

1. **Edge Compatible** - Runs in Cloudflare Workers, Deno, Bun
2. **No WebSocket** - REST-based, works in serverless
3. **Fast Cold Starts** - No persistent connections to establish
4. **Aggressive Caching** - Unlimited cache for better performance
5. **Standard Firebase API** - Same API as regular Firebase SDK
6. **Full Feature Set** - Batch operations, transactions, OAuth, progress tracking

## Limitations

- No real-time WebSocket listeners (use polling instead)
- No offline persistence (cache only)
- Slightly higher latency for polling-based listeners
- Polling consumes more resources than WebSocket listeners

## License

MIT

## Related

- [firebase-admin-sdk-v8](../firebase-admin-sdk-v8) - Server-side Firebase library
- [Firebase Documentation](https://firebase.google.com/docs)
