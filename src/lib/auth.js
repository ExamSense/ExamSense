import { useState } from 'react'
import supabase from './supabaseClient.js'

// =============================================
// AUTHENTICATION HOOKS AND FUNCTIONS
// =============================================

/**
 * Custom hook for user sign up
 * @returns {Object} { signUp, loading, error, success }
 */
export const useSignUp = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      // Validate inputs
      if (!email || !password || !fullName) {
        throw new Error('Please fill in all required fields')
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) throw error

      // Insert user into our users table
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName
          })

        if (insertError) {
          console.warn('User profile creation warning:', insertError.message)
          // Don't throw error as the auth signup was successful
        }
      }

      setSuccess(true)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    setError(null)
    setSuccess(false)
  }

  return { signUp, loading, error, success, resetState }
}

/**
 * Custom hook for user sign in
 * @returns {Object} { signIn, loading, error, user }
 */
export const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      setUser(null)

      // Validate inputs
      if (!email || !password) {
        throw new Error('Please enter both email and password')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      setUser(data.user)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    setError(null)
    setUser(null)
  }

  return { signIn, loading, error, user, resetState }
}

/**
 * Custom hook for user sign out
 * @returns {Object} { signOut, loading, error }
 */
export const useSignOut = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    setError(null)
  }

  return { signOut, loading, error, resetState }
}

// =============================================
// STANDALONE FUNCTIONS (Alternative approach)
// =============================================

/**
 * Standalone sign up function
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} fullName - User's full name
 * @returns {Promise<Object>} Authentication data
 */
export const signUpUser = async (email, password, fullName) => {
  try {
    // Validate inputs
    if (!email || !password || !fullName) {
      throw new Error('Please fill in all required fields')
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) throw error

    // Insert user into our users table
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName
        })

      if (insertError) {
        console.warn('User profile creation warning:', insertError.message)
      }
    }

    return {
      success: true,
      data,
      message: 'Account created successfully! Please check your email for verification.'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: error.message
    }
  }
}

/**
 * Standalone sign in function
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Authentication data
 */
export const signInUser = async (email, password) => {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Please enter both email and password')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    return {
      success: true,
      data,
      message: 'Signed in successfully!'
    }
  } catch (error) {
    let errorMessage = error.message

    // Provide user-friendly error messages
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Invalid email or password. Please try again.'
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Please verify your email address before signing in.'
    } else if (error.message.includes('Too many requests')) {
      errorMessage = 'Too many login attempts. Please try again later.'
    }

    return {
      success: false,
      error: errorMessage,
      message: errorMessage
    }
  }
}

/**
 * Standalone sign out function
 * @returns {Promise<Object>} Sign out result
 */
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    return {
      success: true,
      message: 'Signed out successfully!'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to sign out. Please try again.'
    }
  }
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Get current authenticated user
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return {
      success: true,
      user,
      isAuthenticated: !!user
    }
  } catch (error) {
    return {
      success: false,
      user: null,
      isAuthenticated: false,
      error: error.message
    }
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} Authentication status
 */
export const isAuthenticated = async () => {
  const result = await getCurrentUser()
  return result.isAuthenticated
}

/**
 * Reset password function
 * @param {string} email - User's email
 * @returns {Promise<Object>} Reset password result
 */
export const resetPassword = async (email) => {
  try {
    if (!email) {
      throw new Error('Please enter your email address')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) throw error

    return {
      success: true,
      message: 'Password reset email sent! Please check your inbox.'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: error.message
    }
  }
}

/**
 * Update password function
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Update password result
 */
export const updatePassword = async (newPassword) => {
  try {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error

    return {
      success: true,
      message: 'Password updated successfully!'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: error.message
    }
  }
}

// =============================================
// AUTH STATE LISTENER
// =============================================

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session)
    }
  )

  // Return unsubscribe function
  return () => {
    subscription?.unsubscribe()
  }
}