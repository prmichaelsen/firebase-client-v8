/**
 * Firebase Storage operations
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
  updateMetadata,
  deleteObject,
  listAll,
  type StorageReference,
  type UploadResult,
  type ListResult,
  type UploadTask,
  type UploadTaskSnapshot,
  type FullMetadata,
} from 'firebase/storage';
import { storage } from './index';

/**
 * Upload a file to Firebase Storage
 * 
 * @param path - Storage path for the file
 * @param file - File or Blob to upload
 * @returns Download URL for the uploaded file
 * 
 * @example
 * ```typescript
 * const file = new File(['content'], 'example.txt');
 * const downloadUrl = await uploadFile('uploads/example.txt', file);
 * console.log('File uploaded:', downloadUrl);
 * ```
 */
export async function uploadFile(
  path: string,
  file: File | Blob
): Promise<string> {
  const storageRef: StorageReference = ref(storage, path);
  const uploadResult: UploadResult = await uploadBytes(storageRef, file);
  return getDownloadURL(uploadResult.ref);
}

/**
 * Upload file with metadata
 * 
 * @param path - Storage path for the file
 * @param file - File or Blob to upload
 * @param metadata - Optional metadata for the file
 * @returns Download URL for the uploaded file
 * 
 * @example
 * ```typescript
 * const file = new File(['content'], 'example.txt');
 * const url = await uploadFileWithMetadata('uploads/example.txt', file, {
 *   contentType: 'text/plain',
 *   customMetadata: { userId: 'user123' }
 * });
 * ```
 */
export async function uploadFileWithMetadata(
  path: string,
  file: File | Blob,
  metadata?: Record<string, any>
): Promise<string> {
  const storageRef: StorageReference = ref(storage, path);
  const uploadResult: UploadResult = await uploadBytes(storageRef, file, metadata);
  return getDownloadURL(uploadResult.ref);
}

/**
 * Get download URL for a file
 * 
 * @param path - Storage path of the file
 * @returns Download URL
 * 
 * @example
 * ```typescript
 * const url = await getFileUrl('uploads/example.txt');
 * console.log('File URL:', url);
 * ```
 */
export async function getFileUrl(path: string): Promise<string> {
  const storageRef: StorageReference = ref(storage, path);
  return getDownloadURL(storageRef);
}

/**
 * Delete a file from Firebase Storage
 * 
 * @param path - Storage path of the file to delete
 * 
 * @example
 * ```typescript
 * await deleteFile('uploads/example.txt');
 * console.log('File deleted');
 * ```
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef: StorageReference = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * List all files in a directory
 * 
 * @param path - Storage path of the directory
 * @returns Array of file paths
 * 
 * @example
 * ```typescript
 * const files = await listFiles('uploads/');
 * console.log('Files:', files);
 * ```
 */
export async function listFiles(path: string): Promise<string[]> {
  const storageRef: StorageReference = ref(storage, path);
  const result: ListResult = await listAll(storageRef);
  return result.items.map(item => item.fullPath);
}

/**
 * List all files and subdirectories in a directory
 * 
 * @param path - Storage path of the directory
 * @returns Object with files and subdirectories
 * 
 * @example
 * ```typescript
 * const { files, directories } = await listAllItems('uploads/');
 * console.log('Files:', files);
 * console.log('Directories:', directories);
 * ```
 */
export async function listAllItems(path: string): Promise<{
  files: string[];
  directories: string[];
}> {
  const storageRef: StorageReference = ref(storage, path);
  const result: ListResult = await listAll(storageRef);
  
  return {
    files: result.items.map(item => item.fullPath),
    directories: result.prefixes.map(prefix => prefix.fullPath),
  };
}

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}) => void;

/**
 * Upload file with progress tracking
 *
 * @param path - Storage path for the file
 * @param file - File or Blob to upload
 * @param onProgress - Callback for upload progress updates
 * @param metadata - Optional metadata for the file
 * @returns Promise resolving to download URL
 *
 * @example
 * ```typescript
 * const file = new File(['content'], 'example.txt');
 * const url = await uploadFileWithProgress(
 *   'uploads/example.txt',
 *   file,
 *   (progress) => {
 *     console.log(`Upload progress: ${progress.percentage}%`);
 *   }
 * );
 * ```
 */
export async function uploadFileWithProgress(
  path: string,
  file: File | Blob,
  onProgress?: UploadProgressCallback,
  metadata?: Record<string, any>
): Promise<string> {
  const storageRef: StorageReference = ref(storage, path);
  const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, metadata);
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        if (onProgress) {
          const progress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
          };
          onProgress(progress);
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

/**
 * Create resumable upload task
 *
 * @param path - Storage path for the file
 * @param file - File or Blob to upload
 * @param metadata - Optional metadata for the file
 * @returns UploadTask for manual control
 *
 * @example
 * ```typescript
 * const file = new File(['content'], 'example.txt');
 * const uploadTask = createUploadTask('uploads/example.txt', file);
 *
 * uploadTask.on('state_changed',
 *   (snapshot) => {
 *     const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
 *     console.log('Upload is ' + progress + '% done');
 *   },
 *   (error) => console.error('Upload failed:', error),
 *   async () => {
 *     const url = await getDownloadURL(uploadTask.snapshot.ref);
 *     console.log('File available at', url);
 *   }
 * );
 *
 * // Pause upload
 * uploadTask.pause();
 *
 * // Resume upload
 * uploadTask.resume();
 *
 * // Cancel upload
 * uploadTask.cancel();
 * ```
 */
export function createUploadTask(
  path: string,
  file: File | Blob,
  metadata?: Record<string, any>
): UploadTask {
  const storageRef: StorageReference = ref(storage, path);
  return uploadBytesResumable(storageRef, file, metadata);
}

/**
 * Get file metadata
 *
 * @param path - Storage path of the file
 * @returns File metadata
 *
 * @example
 * ```typescript
 * const metadata = await getFileMetadata('uploads/example.txt');
 * console.log('File size:', metadata.size);
 * console.log('Content type:', metadata.contentType);
 * ```
 */
export async function getFileMetadata(path: string): Promise<FullMetadata> {
  const storageRef: StorageReference = ref(storage, path);
  return getMetadata(storageRef);
}

/**
 * Update file metadata
 *
 * @param path - Storage path of the file
 * @param metadata - Metadata to update
 * @returns Updated metadata
 *
 * @example
 * ```typescript
 * const metadata = await updateFileMetadata('uploads/example.txt', {
 *   contentType: 'text/plain',
 *   customMetadata: { userId: 'user123' }
 * });
 * ```
 */
export async function updateFileMetadata(
  path: string,
  metadata: Record<string, any>
): Promise<FullMetadata> {
  const storageRef: StorageReference = ref(storage, path);
  return updateMetadata(storageRef, metadata);
}

/**
 * Get storage reference for advanced operations
 *
 * @param path - Storage path
 * @returns StorageReference
 *
 * @example
 * ```typescript
 * const storageRef = getStorageRef('uploads/example.txt');
 * const url = await getDownloadURL(storageRef);
 * ```
 */
export function getStorageRef(path: string): StorageReference {
  return ref(storage, path);
}

/**
 * Re-export Storage utilities for advanced usage
 */
export {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type UploadTask,
  type UploadTaskSnapshot,
} from 'firebase/storage';
