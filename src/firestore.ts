/**
 * Firestore database operations
 */

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
  startAfter,
  writeBatch,
  runTransaction,
  type DocumentData,
  type QueryConstraint,
  type DocumentSnapshot,
  type QuerySnapshot,
  type SetOptions,
  type WriteBatch,
  type Transaction,
} from 'firebase/firestore';
import { getFirestore } from './index';
import type { FirestoreDocument, FirestoreFilter } from './types';

/**
 * Get firestore instance
 * @internal
 */
const getFirestoreInstance = () => getFirestore();

/**
 * Get a document by ID
 * 
 * @param collectionPath - Path to the collection
 * @param documentId - Document ID
 * @returns Document data with ID or null if not found
 * 
 * @example
 * ```typescript
 * const user = await getDocument('users', 'user123');
 * if (user) {
 *   console.log('User:', user.name);
 * }
 * ```
 */
export async function getDocument(
  collectionPath: string,
  documentId: string
): Promise<FirestoreDocument | null> {
  const docRef = doc(getFirestoreInstance(), collectionPath, documentId);
  const docSnap: DocumentSnapshot = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Get all documents in a collection with optional query constraints
 * 
 * @param collectionPath - Path to the collection
 * @param constraints - Optional query constraints (where, orderBy, limit, etc.)
 * @returns Array of documents with IDs
 * 
 * @example
 * ```typescript
 * import { where, orderBy, limit } from 'firebase/firestore';
 * 
 * const users = await getDocuments(
 *   'users',
 *   where('active', '==', true),
 *   orderBy('createdAt', 'desc'),
 *   limit(10)
 * );
 * ```
 */
export async function getDocuments(
  collectionPath: string,
  ...constraints: QueryConstraint[]
): Promise<FirestoreDocument[]> {
  const collectionRef = collection(getFirestoreInstance(), collectionPath);
  const q = query(collectionRef, ...constraints);
  const querySnapshot: QuerySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Add a new document to a collection with auto-generated ID
 * 
 * @param collectionPath - Path to the collection
 * @param data - Document data
 * @returns ID of the created document
 * 
 * @example
 * ```typescript
 * const docId = await addDocument('users', {
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   createdAt: Date.now(),
 * });
 * console.log('Created document:', docId);
 * ```
 */
export async function addDocument(
  collectionPath: string,
  data: DocumentData
): Promise<string> {
  const collectionRef = collection(getFirestoreInstance(), collectionPath);
  const docRef = await addDoc(collectionRef, data);
  return docRef.id;
}

/**
 * Set a document (create or overwrite)
 *
 * @param collectionPath - Path to the collection
 * @param documentId - Document ID
 * @param data - Document data
 * @param options - Optional set options (merge, mergeFields)
 *
 * @example
 * ```typescript
 * // Overwrite document
 * await setDocument('users', 'user123', {
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   updatedAt: Date.now(),
 * });
 *
 * // Merge with existing document
 * await setDocument('users', 'user123', {
 *   name: 'Jane Doe',
 * }, { merge: true });
 *
 * // Merge specific fields
 * await setDocument('users', 'user123', {
 *   name: 'Jane Doe',
 *   age: 30,
 * }, { mergeFields: ['name'] });
 * ```
 */
export async function setDocument(
  collectionPath: string,
  documentId: string,
  data: DocumentData,
  options?: SetOptions
): Promise<void> {
  const docRef = doc(getFirestoreInstance(), collectionPath, documentId);
  await setDoc(docRef, data, options || {});
}

/**
 * Update specific fields in a document
 * 
 * @param collectionPath - Path to the collection
 * @param documentId - Document ID
 * @param data - Partial document data to update
 * 
 * @example
 * ```typescript
 * await updateDocument('users', 'user123', {
 *   name: 'Jane Doe',
 *   updatedAt: Date.now(),
 * });
 * ```
 */
export async function updateDocument(
  collectionPath: string,
  documentId: string,
  data: Partial<DocumentData>
): Promise<void> {
  const docRef = doc(getFirestoreInstance(), collectionPath, documentId);
  await updateDoc(docRef, data);
}

/**
 * Delete a document
 * 
 * @param collectionPath - Path to the collection
 * @param documentId - Document ID
 * 
 * @example
 * ```typescript
 * await deleteDocument('users', 'user123');
 * console.log('Document deleted');
 * ```
 */
export async function deleteDocument(
  collectionPath: string,
  documentId: string
): Promise<void> {
  const docRef = doc(getFirestoreInstance(), collectionPath, documentId);
  await deleteDoc(docRef);
}

/**
 * Query documents with filters, ordering, and limit
 * 
 * @param collectionPath - Path to the collection
 * @param filters - Array of filter objects
 * @param orderByField - Optional field to order by
 * @param limitCount - Optional limit on number of results
 * @returns Array of documents matching the query
 * 
 * @example
 * ```typescript
 * const activeUsers = await queryDocuments(
 *   'users',
 *   [
 *     { field: 'active', operator: '==', value: true },
 *     { field: 'age', operator: '>=', value: 18 }
 *   ],
 *   'createdAt',
 *   10
 * );
 * ```
 */
export async function queryDocuments(
  collectionPath: string,
  filters: FirestoreFilter[],
  orderByField?: string,
  limitCount?: number
): Promise<FirestoreDocument[]> {
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

/**
 * Batch write operations
 *
 * @returns WriteBatch instance for batching multiple operations
 *
 * @example
 * ```typescript
 * const batch = createBatch();
 *
 * const userRef = doc(firestore, 'users', 'user123');
 * batch.set(userRef, { name: 'John Doe' });
 *
 * const postRef = doc(firestore, 'posts', 'post456');
 * batch.update(postRef, { likes: increment(1) });
 *
 * await commitBatch(batch);
 * ```
 */
export function createBatch(): WriteBatch {
  return writeBatch(getFirestoreInstance());
}

/**
 * Commit a batch of write operations
 *
 * @param batch - WriteBatch instance
 *
 * @example
 * ```typescript
 * const batch = createBatch();
 * // ... add operations to batch
 * await commitBatch(batch);
 * ```
 */
export async function commitBatch(batch: WriteBatch): Promise<void> {
  await batch.commit();
}

/**
 * Run a transaction
 *
 * @param updateFunction - Function that performs transaction operations
 * @returns Result of the transaction
 *
 * @example
 * ```typescript
 * const result = await runFirestoreTransaction(async (transaction) => {
 *   const userRef = doc(firestore, 'users', 'user123');
 *   const userDoc = await transaction.get(userRef);
 *
 *   if (!userDoc.exists()) {
 *     throw new Error('User does not exist');
 *   }
 *
 *   const newBalance = userDoc.data().balance + 100;
 *   transaction.update(userRef, { balance: newBalance });
 *
 *   return newBalance;
 * });
 * ```
 */
export async function runFirestoreTransaction<T>(
  updateFunction: (transaction: Transaction) => Promise<T>
): Promise<T> {
  return runTransaction(getFirestoreInstance(), updateFunction);
}

/**
 * Get documents with pagination support
 *
 * @param collectionPath - Path to the collection
 * @param pageSize - Number of documents per page
 * @param lastDoc - Last document from previous page (for pagination)
 * @param constraints - Additional query constraints
 * @returns Array of documents
 *
 * @example
 * ```typescript
 * // First page
 * const page1 = await getDocumentsWithPagination('users', 10);
 *
 * // Next page
 * const lastDoc = page1[page1.length - 1];
 * const page2 = await getDocumentsWithPagination('users', 10, lastDoc);
 * ```
 */
export async function getDocumentsWithPagination(
  collectionPath: string,
  pageSize: number,
  lastDoc?: FirestoreDocument,
  ...constraints: QueryConstraint[]
): Promise<FirestoreDocument[]> {
  const collectionRef = collection(getFirestoreInstance(), collectionPath);
  const queryConstraints = [...constraints, limit(pageSize)];
  
  if (lastDoc) {
    const lastDocRef = doc(getFirestoreInstance(), collectionPath, lastDoc.id);
    const lastDocSnap = await getDoc(lastDocRef);
    queryConstraints.push(startAfter(lastDocSnap));
  }
  
  const q = query(collectionRef, ...queryConstraints);
  const querySnapshot: QuerySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Count documents in a collection (with optional filters)
 *
 * @param collectionPath - Path to the collection
 * @param constraints - Optional query constraints
 * @returns Number of documents
 *
 * @example
 * ```typescript
 * const totalUsers = await countDocuments('users');
 * const activeUsers = await countDocuments('users', where('active', '==', true));
 * ```
 */
export async function countDocuments(
  collectionPath: string,
  ...constraints: QueryConstraint[]
): Promise<number> {
  const docs = await getDocuments(collectionPath, ...constraints);
  return docs.length;
}

/**
 * Check if a document exists
 *
 * @param collectionPath - Path to the collection
 * @param documentId - Document ID
 * @returns True if document exists
 *
 * @example
 * ```typescript
 * const exists = await documentExists('users', 'user123');
 * if (exists) {
 *   console.log('User exists');
 * }
 * ```
 */
export async function documentExists(
  collectionPath: string,
  documentId: string
): Promise<boolean> {
  const docRef = doc(getFirestoreInstance(), collectionPath, documentId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

/**
 * Re-export Firestore utilities for advanced usage
 */
export {
  // Query builders
  where,
  orderBy,
  limit,
  startAt,
  startAfter,
  endAt,
  endBefore,
  query,
  collection,
  doc,
  // Field values
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  deleteField,
  // Batch and transaction
  writeBatch,
  runTransaction,
  // Additional exports
  type SetOptions,
  type WriteBatch,
  type Transaction,
} from 'firebase/firestore';
