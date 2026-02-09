/**
 * Firebase Authentication operations
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signInWithCustomToken,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  type User,
  type UserCredential,
  type AuthProvider,
} from 'firebase/auth';
import { auth } from './index';
import type { AuthStateCallback } from './types';

/**
 * Sign in with email and password
 * 
 * @param email - User email address
 * @param password - User password
 * @returns Promise resolving to UserCredential
 * 
 * @example
 * ```typescript
 * const userCredential = await signIn('user@example.com', 'password123');
 * console.log('Signed in:', userCredential.user.uid);
 * ```
 */
export async function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create new user account with email and password
 * 
 * @param email - User email address
 * @param password - User password
 * @returns Promise resolving to UserCredential
 * 
 * @example
 * ```typescript
 * const newUser = await signUp('newuser@example.com', 'password123');
 * console.log('Created user:', newUser.user.uid);
 * ```
 */
export async function signUp(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Send password reset email to user
 * 
 * @param email - User email address
 * @returns Promise that resolves when email is sent
 * 
 * @example
 * ```typescript
 * await resetPassword('user@example.com');
 * console.log('Password reset email sent');
 * ```
 */
export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Sign out current user
 * 
 * @returns Promise that resolves when user is signed out
 * 
 * @example
 * ```typescript
 * await logout();
 * console.log('User signed out');
 * ```
 */
export async function logout(): Promise<void> {
  return signOut(auth);
}

/**
 * Listen to auth state changes
 * 
 * @param callback - Function called when auth state changes
 * @returns Unsubscribe function to stop listening
 * 
 * @example
 * ```typescript
 * const unsubscribe = onAuthChange((user) => {
 *   if (user) {
 *     console.log('User signed in:', user.email);
 *   } else {
 *     console.log('User signed out');
 *   }
 * });
 * 
 * // Later, stop listening
 * unsubscribe();
 * ```
 */
export function onAuthChange(callback: AuthStateCallback): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current authenticated user
 * 
 * @returns Current user or null if not authenticated
 * 
 * @example
 * ```typescript
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('Current user:', user.email);
 * }
 * ```
 */
export async function getCurrentUser(): Promise<User | null> {
  return auth.currentUser;
}

/**
 * Get ID token for current user
 * 
 * @returns ID token string or null if not authenticated
 * 
 * @example
 * ```typescript
 * const idToken = await getIdToken();
 * if (idToken) {
 *   // Use token for API calls
 *   console.log('ID Token:', idToken);
 * }
 * ```
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Refresh ID token for current user
 * Forces token refresh even if not expired
 * 
 * @returns Refreshed ID token string or null if not authenticated
 * 
 * @example
 * ```typescript
 * const freshToken = await refreshIdToken();
 * console.log('Refreshed token:', freshToken);
 * ```
 */
export async function refreshIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(true); // Force refresh
}

/**
 * Sign in with Google popup
 *
 * @returns Promise resolving to UserCredential
 *
 * @example
 * ```typescript
 * const userCredential = await signInWithGoogle();
 * console.log('Signed in with Google:', userCredential.user.email);
 * ```
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

/**
 * Sign in with GitHub popup
 *
 * @returns Promise resolving to UserCredential
 *
 * @example
 * ```typescript
 * const userCredential = await signInWithGithub();
 * console.log('Signed in with GitHub:', userCredential.user.email);
 * ```
 */
export async function signInWithGithub(): Promise<UserCredential> {
  const provider = new GithubAuthProvider();
  return signInWithPopup(auth, provider);
}

/**
 * Sign in with Facebook popup
 *
 * @returns Promise resolving to UserCredential
 *
 * @example
 * ```typescript
 * const userCredential = await signInWithFacebook();
 * console.log('Signed in with Facebook:', userCredential.user.email);
 * ```
 */
export async function signInWithFacebook(): Promise<UserCredential> {
  const provider = new FacebookAuthProvider();
  return signInWithPopup(auth, provider);
}

/**
 * Sign in with Twitter popup
 *
 * @returns Promise resolving to UserCredential
 *
 * @example
 * ```typescript
 * const userCredential = await signInWithTwitter();
 * console.log('Signed in with Twitter:', userCredential.user.email);
 * ```
 */
export async function signInWithTwitter(): Promise<UserCredential> {
  const provider = new TwitterAuthProvider();
  return signInWithPopup(auth, provider);
}

/**
 * Sign in with custom provider using popup
 *
 * @param provider - Auth provider instance
 * @returns Promise resolving to UserCredential
 *
 * @example
 * ```typescript
 * import { GoogleAuthProvider } from 'firebase/auth';
 * const provider = new GoogleAuthProvider();
 * provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
 * const userCredential = await signInWithProvider(provider);
 * ```
 */
export async function signInWithProvider(provider: AuthProvider): Promise<UserCredential> {
  return signInWithPopup(auth, provider);
}

/**
 * Sign in with custom provider using redirect
 *
 * @param provider - Auth provider instance
 *
 * @example
 * ```typescript
 * import { GoogleAuthProvider } from 'firebase/auth';
 * const provider = new GoogleAuthProvider();
 * await signInWithProviderRedirect(provider);
 * // User will be redirected to provider's sign-in page
 * ```
 */
export async function signInWithProviderRedirect(provider: AuthProvider): Promise<void> {
  return signInWithRedirect(auth, provider);
}

/**
 * Sign in with custom token
 *
 * @param token - Custom token from your server
 * @returns Promise resolving to UserCredential
 *
 * @example
 * ```typescript
 * const customToken = await fetch('/api/auth/token').then(r => r.text());
 * const userCredential = await signInWithToken(customToken);
 * ```
 */
export async function signInWithToken(token: string): Promise<UserCredential> {
  return signInWithCustomToken(auth, token);
}

/**
 * Send email verification to current user
 *
 * @returns Promise that resolves when email is sent
 *
 * @example
 * ```typescript
 * await sendVerificationEmail();
 * console.log('Verification email sent');
 * ```
 */
export async function sendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in');
  return sendEmailVerification(user);
}

/**
 * Update user profile
 *
 * @param profile - Profile data to update (displayName, photoURL)
 *
 * @example
 * ```typescript
 * await updateUserProfile({
 *   displayName: 'John Doe',
 *   photoURL: 'https://example.com/photo.jpg'
 * });
 * ```
 */
export async function updateUserProfile(profile: {
  displayName?: string | null;
  photoURL?: string | null;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in');
  return updateProfile(user, profile);
}

/**
 * Update user email
 *
 * @param newEmail - New email address
 *
 * @example
 * ```typescript
 * await updateUserEmail('newemail@example.com');
 * ```
 */
export async function updateUserEmail(newEmail: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in');
  return updateEmail(user, newEmail);
}

/**
 * Update user password
 *
 * @param newPassword - New password
 *
 * @example
 * ```typescript
 * await updateUserPassword('newPassword123');
 * ```
 */
export async function updateUserPassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in');
  return updatePassword(user, newPassword);
}

/**
 * Delete current user account
 *
 * @example
 * ```typescript
 * await deleteUserAccount();
 * console.log('User account deleted');
 * ```
 */
export async function deleteUserAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in');
  return deleteUser(user);
}

/**
 * Re-export auth providers and utilities
 */
export {
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  type AuthProvider,
} from 'firebase/auth';
