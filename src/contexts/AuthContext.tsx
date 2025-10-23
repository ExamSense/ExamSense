import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../utils/auth';
import {
  generateAccessToken,
  generateUserId,
  hashPassword,
  verifyPassword,
  validateEmail
} from '../utils/auth';
import {
  initializeStorage,
  getAllUsers,
  saveUser,
  getUserByEmail,
  updateUser,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser
} from '../services/localStorageService';

// Auth Context Type Definition
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // ← Start as TRUE
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const isAuthenticated = user !== null;

  // Initialize storage and check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true); // Set loading to true
      
      try {
        // Initialize storage structure
        initializeStorage();

        // Small delay to prevent flash
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check for existing session
        const existingUser = getCurrentUser();
        if (existingUser) {
          console.log('Existing session found:', existingUser.email);
          setUser(existingUser);
        } else {
          console.log('No existing session found');
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false); // ← Set loading to false after check
      }
    };

    initAuth();
  }, []);

  // Signup function
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (name.trim().length < 3) {
        throw new Error('Name must be at least 3 characters long');
      }

      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check if email already exists
      const existingUser = getUserByEmail(email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Generate user credentials
      const userId = generateUserId();
      const accessToken = generateAccessToken();
      const hashedPassword = hashPassword(password);

      // Create new user object
      const newUser: User = {
        userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        accessToken,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        testsTaken: 0
      };

      // Save user to storage
      const saved = saveUser(newUser);
      if (!saved) {
        throw new Error('Failed to save user. Please try again.');
      }

      // Set as current user
      setCurrentUser(newUser);

      // Update state
      setUser(newUser);
      
      console.log('User signed up successfully:', newUser.email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err; // Re-throw so calling code can handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!email.trim() || !password) {
        throw new Error('Email and password are required');
      }

      // Get user by email
      const foundUser = getUserByEmail(email);
      if (!foundUser) {
        throw new Error('No account found with this email');
      }

      // Verify password
      const isPasswordValid = verifyPassword(password, foundUser.password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // Update last login timestamp
      const updatedUser: User = {
        ...foundUser,
        lastLogin: new Date().toISOString()
      };

      const updated = updateUser(foundUser.userId, { lastLogin: updatedUser.lastLogin });
      if (!updated) {
        console.warn('Failed to update last login timestamp');
      }

      // Set as current user
      setCurrentUser(updatedUser);

      // Update state
      setUser(updatedUser);
      
      console.log('User logged in successfully:', updatedUser.email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err; // Re-throw so calling code can handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    try {
      // Clear current user from storage
      clearCurrentUser();

      // Reset state
      setUser(null);
      setError(null);

      console.log('User logged out successfully');
    } catch (err) {
      console.error('Error during logout:', err);
      setError('Failed to logout properly');
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}