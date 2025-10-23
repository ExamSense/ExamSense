// TypeScript Interfaces
export interface User {
  userId: string;
  name: string;
  email: string;
  password: string; // hashed
  accessToken: string;
  createdAt: string;
  lastLogin: string;
  testsTaken: number;
}

export interface StoredAuth {
  currentUser: User | null;
  users: User[];
}

// Utility Functions

/**
 * Generate a random 32-character alphanumeric access token
 * @returns Random access token string
 */
export function generateAccessToken(): string {
  const randomPart = Math.random().toString(36).substring(2);
  const timestampPart = Date.now().toString(36);
  const combined = randomPart + timestampPart;
  
  // Ensure we get at least 32 characters by repeating if necessary
  const extended = (combined + combined + combined).substring(0, 32);
  return extended;
}

/**
 * Generate a unique user ID with timestamp and random digits
 * @returns User ID in format "USER_timestamp_randomDigits"
 */
export function generateUserId(): string {
  const timestamp = Date.now();
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `USER_${timestamp}_${randomDigits}`;
}

/**
 * Hash a password using base64 encoding (for prototype only)
 * WARNING: This is NOT secure for production use
 * @param password - Plain text password
 * @returns Base64 encoded password
 */
export function hashPassword(password: string): string {
  return btoa(password);
}

/**
 * Verify if input password matches stored hash
 * @param inputPassword - Plain text password to verify
 * @param storedHash - Stored base64 hash to compare against
 * @returns True if passwords match, false otherwise
 */
export function verifyPassword(inputPassword: string, storedHash: string): boolean {
  return btoa(inputPassword) === storedHash;
}

/**
 * Validate email format using regex
 * @param email - Email address to validate
 * @returns True if email format is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}