/**
 * Firestore polling-based listeners for edge environments
 * 
 * Since real-time listeners don't work well in serverless/edge environments,
 * this module provides polling-based alternatives.
 */

import { getDocument, getDocuments } from './firestore';
import type { FirestoreDocument } from './types';
import type { QueryConstraint } from 'firebase/firestore';

/**
 * Document listener callback
 */
export type DocumentListenerCallback = (doc: FirestoreDocument | null) => void;

/**
 * Collection listener callback
 */
export type CollectionListenerCallback = (docs: FirestoreDocument[]) => void;

/**
 * Listener options
 */
export interface ListenerOptions {
  /**
   * Polling interval in milliseconds (default: 5000)
   */
  interval?: number;
  
  /**
   * Whether to call callback immediately with initial data (default: true)
   */
  immediate?: boolean;
}

/**
 * Listen to document changes using polling
 * 
 * @param collectionPath - Path to the collection
 * @param documentId - Document ID
 * @param callback - Function called when document changes
 * @param options - Listener options
 * @returns Unsubscribe function
 * 
 * @example
 * ```typescript
 * const unsubscribe = onDocumentChange(
 *   'users',
 *   'user123',
 *   (doc) => {
 *     if (doc) {
 *       console.log('User updated:', doc.name);
 *     } else {
 *       console.log('User deleted');
 *     }
 *   },
 *   { interval: 3000 }
 * );
 * 
 * // Later, stop listening
 * unsubscribe();
 * ```
 */
export function onDocumentChange(
  collectionPath: string,
  documentId: string,
  callback: DocumentListenerCallback,
  options: ListenerOptions = {}
): () => void {
  const { interval = 5000, immediate = true } = options;
  let lastDoc: FirestoreDocument | null = null;
  let intervalId: NodeJS.Timeout | number;
  
  const poll = async () => {
    try {
      const doc = await getDocument(collectionPath, documentId);
      
      // Check if document changed
      const docChanged = JSON.stringify(doc) !== JSON.stringify(lastDoc);
      
      if (docChanged) {
        lastDoc = doc;
        callback(doc);
      }
    } catch (error) {
      console.error('Error polling document:', error);
    }
  };
  
  // Call immediately if requested
  if (immediate) {
    poll();
  }
  
  // Start polling
  intervalId = setInterval(poll, interval);
  
  // Return unsubscribe function
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Listen to collection changes using polling
 * 
 * @param collectionPath - Path to the collection
 * @param callback - Function called when collection changes
 * @param options - Listener options
 * @param constraints - Query constraints
 * @returns Unsubscribe function
 * 
 * @example
 * ```typescript
 * import { where, orderBy } from 'firebase/firestore';
 * 
 * const unsubscribe = onCollectionChange(
 *   'users',
 *   (docs) => {
 *     console.log('Users updated:', docs.length);
 *   },
 *   { interval: 5000 },
 *   where('active', '==', true),
 *   orderBy('createdAt', 'desc')
 * );
 * 
 * // Later, stop listening
 * unsubscribe();
 * ```
 */
export function onCollectionChange(
  collectionPath: string,
  callback: CollectionListenerCallback,
  options: ListenerOptions = {},
  ...constraints: QueryConstraint[]
): () => void {
  const { interval = 5000, immediate = true } = options;
  let lastDocs: FirestoreDocument[] = [];
  let intervalId: NodeJS.Timeout | number;
  
  const poll = async () => {
    try {
      const docs = await getDocuments(collectionPath, ...constraints);
      
      // Check if collection changed
      const docsChanged = JSON.stringify(docs) !== JSON.stringify(lastDocs);
      
      if (docsChanged) {
        lastDocs = docs;
        callback(docs);
      }
    } catch (error) {
      console.error('Error polling collection:', error);
    }
  };
  
  // Call immediately if requested
  if (immediate) {
    poll();
  }
  
  // Start polling
  intervalId = setInterval(poll, interval);
  
  // Return unsubscribe function
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Create a document watcher with change detection
 * 
 * @param collectionPath - Path to the collection
 * @param documentId - Document ID
 * @param options - Listener options
 * @returns Object with subscribe method and current value
 * 
 * @example
 * ```typescript
 * const userWatcher = createDocumentWatcher('users', 'user123');
 * 
 * const unsubscribe = userWatcher.subscribe((doc) => {
 *   console.log('User changed:', doc);
 * });
 * 
 * // Get current value
 * const currentUser = userWatcher.getValue();
 * 
 * // Stop watching
 * unsubscribe();
 * ```
 */
export function createDocumentWatcher(
  collectionPath: string,
  documentId: string,
  options: ListenerOptions = {}
) {
  let currentValue: FirestoreDocument | null = null;
  let subscribers: DocumentListenerCallback[] = [];
  let unsubscribe: (() => void) | null = null;
  
  const startWatching = () => {
    if (unsubscribe) return;
    
    unsubscribe = onDocumentChange(
      collectionPath,
      documentId,
      (doc) => {
        currentValue = doc;
        subscribers.forEach(callback => callback(doc));
      },
      options
    );
  };
  
  const stopWatching = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
  
  return {
    /**
     * Subscribe to document changes
     */
    subscribe(callback: DocumentListenerCallback): () => void {
      subscribers.push(callback);
      
      // Start watching if first subscriber
      if (subscribers.length === 1) {
        startWatching();
      }
      
      // Call callback with current value
      if (currentValue !== null) {
        callback(currentValue);
      }
      
      // Return unsubscribe function
      return () => {
        subscribers = subscribers.filter(cb => cb !== callback);
        
        // Stop watching if no more subscribers
        if (subscribers.length === 0) {
          stopWatching();
        }
      };
    },
    
    /**
     * Get current value
     */
    getValue(): FirestoreDocument | null {
      return currentValue;
    },
    
    /**
     * Stop watching and clear all subscribers
     */
    destroy() {
      stopWatching();
      subscribers = [];
      currentValue = null;
    }
  };
}

/**
 * Create a collection watcher with change detection
 * 
 * @param collectionPath - Path to the collection
 * @param options - Listener options
 * @param constraints - Query constraints
 * @returns Object with subscribe method and current value
 * 
 * @example
 * ```typescript
 * import { where } from 'firebase/firestore';
 * 
 * const usersWatcher = createCollectionWatcher(
 *   'users',
 *   { interval: 3000 },
 *   where('active', '==', true)
 * );
 * 
 * const unsubscribe = usersWatcher.subscribe((docs) => {
 *   console.log('Active users:', docs.length);
 * });
 * 
 * // Get current value
 * const currentUsers = usersWatcher.getValue();
 * 
 * // Stop watching
 * unsubscribe();
 * ```
 */
export function createCollectionWatcher(
  collectionPath: string,
  options: ListenerOptions = {},
  ...constraints: QueryConstraint[]
) {
  let currentValue: FirestoreDocument[] = [];
  let subscribers: CollectionListenerCallback[] = [];
  let unsubscribe: (() => void) | null = null;
  
  const startWatching = () => {
    if (unsubscribe) return;
    
    unsubscribe = onCollectionChange(
      collectionPath,
      (docs) => {
        currentValue = docs;
        subscribers.forEach(callback => callback(docs));
      },
      options,
      ...constraints
    );
  };
  
  const stopWatching = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
  
  return {
    /**
     * Subscribe to collection changes
     */
    subscribe(callback: CollectionListenerCallback): () => void {
      subscribers.push(callback);
      
      // Start watching if first subscriber
      if (subscribers.length === 1) {
        startWatching();
      }
      
      // Call callback with current value
      if (currentValue.length > 0) {
        callback(currentValue);
      }
      
      // Return unsubscribe function
      return () => {
        subscribers = subscribers.filter(cb => cb !== callback);
        
        // Stop watching if no more subscribers
        if (subscribers.length === 0) {
          stopWatching();
        }
      };
    },
    
    /**
     * Get current value
     */
    getValue(): FirestoreDocument[] {
      return currentValue;
    },
    
    /**
     * Stop watching and clear all subscribers
     */
    destroy() {
      stopWatching();
      subscribers = [];
      currentValue = [];
    }
  };
}
