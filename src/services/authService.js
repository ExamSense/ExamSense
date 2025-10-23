import { supabase } from '../supabaseClient.js'

/**
 * Authentication Service
 * Handles all authentication operations including signup, login, logout
 */

// Sign up a new user
export const signUp = async (email, password, userData = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName || '',
          display_name: userData.displayName || '',
          ...userData
        }
      }
    })

    if (error) {
      throw error
    }

    // If user is created successfully, create a profile record
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: userData.fullName || '',
          created_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // Don't throw here as auth user is already created
      }
    }

    return {
      user: data.user,
      session: data.session,
      needsConfirmation: !data.session
    }
  } catch (error) {
    console.error('Sign up error:', error)
    throw new Error(error.message || 'Failed to sign up')
  }
}

// Sign in an existing user
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    return {
      user: data.user,
      session: data.session
    }
  } catch (error) {
    console.error('Sign in error:', error)
    throw new Error(error.message || 'Failed to sign in')
  }
}

// Sign out the current user
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    throw new Error(error.message || 'Failed to sign out')
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw error
    }

    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw error
    }

    return session
  } catch (error) {
    console.error('Get current session error:', error)
    return null
  }
}

// Get user profile from users table
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Get user profile error:', error)
    throw new Error(error.message || 'Failed to get user profile')
  }
}

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Update user profile error:', error)
    throw new Error(error.message || 'Failed to update user profile')
  }
}

// Reset password
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Reset password error:', error)
    throw new Error(error.message || 'Failed to send reset password email')
  }
}

// Update password
export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Update password error:', error)
    throw new Error(error.message || 'Failed to update password')
  }
}

// Auth state change listener
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

// Check if user is authenticated
export const isAuthenticated = async () => {
  const user = await getCurrentUser()
  return !!user
}

export default {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getCurrentSession,
  getUserProfile,
  updateUserProfile,
  resetPassword,
  updatePassword,
  onAuthStateChange,
  isAuthenticated
}