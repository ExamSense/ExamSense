import { createClient } from '@supabase/supabase-js'

// Supabase project configuration
const supabaseUrl = 'https://rtbytyqgueyqsoivfgaw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0Ynl0eXFndWV5cXNvaXZmZ2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzM4ODgsImV4cCI6MjA3NjgwOTg4OH0.eLho4W9gHPLpEZ1wVhto0dHAn4qqRJP3eRbUqywxFcs'

// Create and configure Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export default supabase

// Optional: Export individual services for convenience
export const auth = supabase.auth
export const db = supabase.from

// Utility functions for common operations
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export const signUpWithEmail = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })
  if (error) throw error
  return data
}