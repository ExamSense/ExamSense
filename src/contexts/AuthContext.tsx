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
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
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
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || "" },
      },
    });
    
    if (error) {
      setLoading(false);
      throw error;
    }

    // Create user profile in your users table
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName || '',
        created_at: new Date().toISOString()
      });
    }
    
    setLoading(false);
    setSession(data.session ?? null);
    setUser(data.user ?? null);
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

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
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
