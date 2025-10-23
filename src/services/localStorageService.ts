import { User, StoredAuth } from '../utils/auth';

// Storage keys constants
const STORAGE_KEYS = {
  AUTH: 'wassce_auth',
  CURRENT_USER: 'wassce_current_user'
} as const;

/**
 * Initialize localStorage with default auth structure
 * Call this on app initialization
 */
export function initializeStorage(): void {
  try {
    const existingAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
    
    if (!existingAuth) {
      const defaultAuth: StoredAuth = {
        users: [],
        currentUser: null
      };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(defaultAuth));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

/**
 * Get all users from localStorage
 * @returns Array of users or empty array if not found
 */
export function getAllUsers(): User[] {
  try {
    const authData = localStorage.getItem(STORAGE_KEYS.AUTH);
    
    if (!authData) {
      return [];
    }
    
    const parsed: StoredAuth = JSON.parse(authData);
    return parsed.users || [];
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

/**
 * Save a new user to localStorage
 * @param user - User object to save
 * @returns true on success, false if email already exists or on error
 */
export function saveUser(user: User): boolean {
  try {
    const users = getAllUsers();
    
    // Check for duplicate email
    const emailExists = users.some(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (emailExists) {
      console.warn('User with this email already exists');
      return false;
    }
    
    // Add new user
    users.push(user);
    
    // Save back to localStorage
    const authData: StoredAuth = {
      users,
      currentUser: getCurrentUser()
    };
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData));
    
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
}

/**
 * Get user by email address
 * @param email - Email address to search for
 * @returns User object or null if not found
 */
export function getUserByEmail(email: string): User | null {
  try {
    const users = getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Update user information
 * @param userId - ID of user to update
 * @param updates - Partial user object with fields to update
 * @returns true on success, false if user not found or on error
 */
export function updateUser(userId: string, updates: Partial<User>): boolean {
  try {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.userId === userId);
    
    if (userIndex === -1) {
      console.warn('User not found');
      return false;
    }
    
    // Update user fields
    users[userIndex] = {
      ...users[userIndex],
      ...updates
    };
    
    // Save back to localStorage
    const authData: StoredAuth = {
      users,
      currentUser: getCurrentUser()
    };
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData));
    
    // If updating current user, update current user storage too
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.userId === userId) {
      setCurrentUser(users[userIndex]);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
}

/**
 * Get the currently logged-in user
 * @returns Current user object or null if no user is logged in
 */
export function getCurrentUser(): User | null {
  try {
    const currentUserData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    
    if (!currentUserData) {
      return null;
    }
    
    return JSON.parse(currentUserData);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Set the current logged-in user
 * @param user - User object to set as current user
 */
export function setCurrentUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error setting current user:', error);
  }
}

/**
 * Clear the current user (logout)
 */
export function clearCurrentUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
}

/**
 * Delete a user from storage
 * @param userId - ID of user to delete
 * @returns true on success, false if user not found or on error
 */
export function deleteUser(userId: string): boolean {
  try {
    const users = getAllUsers();
    const filteredUsers = users.filter(u => u.userId !== userId);
    
    if (filteredUsers.length === users.length) {
      console.warn('User not found');
      return false;
    }
    
    // If deleted user is current user, clear current user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.userId === userId) {
      clearCurrentUser();
    }
    
    // Save updated users array
    const authData: StoredAuth = {
      users: filteredUsers,
      currentUser: null
    };
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData));
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

// Export storage keys for external use if needed
export { STORAGE_KEYS };