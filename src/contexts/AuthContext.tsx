import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient"; // adjust if path differs

// ----------------------------
// Types
// ----------------------------
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// ----------------------------
// Create Context
// ----------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ----------------------------
// Provider Component
// ----------------------------
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch and listen to session changes
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth session error:', error);
          setError(error.message);
        }
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error('Failed to fetch session:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ----------------------------
  // Auth Functions
  // ----------------------------

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    // Use Supabase signUp which will trigger email confirmation depending on your Supabase settings
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || "" },
      },
    });

    // If there was an error from Supabase, stop and bubble up
    if (error) {
      setLoading(false);
      throw error;
    }

    // NOTE: We intentionally do NOT set session/user here. This prevents automatic
    // login immediately after sign up. The user must verify their email first
    // and then perform a manual login. This makes the flow: sign up -> verify email -> login.

    // Create user profile record optionally. Some teams prefer to create profile on first login,
    // but we'll create a lightweight profile now so admin dashboard can display pending users.
    if (data?.user) {
      try {
        // Create a lightweight user profile that matches the DB schema.
        // Do NOT include fields that don't exist in the `users` table (e.g., `verified`).
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName || '',
          created_at: new Date().toISOString()
        });
      } catch (profileErr) {
        // Don't fail the signup flow if profile creation fails — just log it
        console.warn('Failed to create user profile after signup:', profileErr);
      }
    }

    setLoading(false);
    // Do not set session or user here; components should prompt user to verify their email and login.
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null); // Clear previous errors

    const { error: authError, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      throw authError;
    }

    // Ensure user profile exists in users table
    if (data?.user) {
      try {
        // Check if user profile exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        // If no profile exists, create one
        if (!existingUser) {
          console.log('Creating missing user profile for:', data.user.email);
          await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || '',
            created_at: new Date().toISOString()
          });
          console.log('✅ User profile created successfully');
        }
      } catch (profileErr) {
        console.warn('Failed to check/create user profile:', profileErr);
      }
    }

    setSession(data.session ?? null);
    setUser(data.user ?? null);
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) throw error;
    setSession(null);
    setUser(null);
  };

  // ----------------------------
  // Context Value
  // ----------------------------
  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };

  // Always render children, even while loading
  // Individual components can check loading state if needed
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ----------------------------
// Custom Hook
// ----------------------------
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
