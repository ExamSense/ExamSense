import React, { useState } from 'react'
import { useSignUp, useSignIn, useSignOut } from '../../lib/auth.js'
import supabase from '../../lib/supabaseClient.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, User } from 'lucide-react'

// =============================================
// SIGN UP COMPONENT
// =============================================
export const SignUpForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  
  const { signUp, loading, error, success, resetState } = useSignUp()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors when user starts typing
    if (error) resetState()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    try {
      await signUp(formData.email, formData.password, formData.fullName)
      if (onSuccess) onSuccess()
    } catch (err) {
      // Error is handled by the hook
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Sign up for ExamSense to start taking tests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>
                Account created successfully! Please check your email for verification.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="fullName"
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// =============================================
// SIGN IN COMPONENT
// =============================================
export const SignInForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const { signIn, loading, error, resetState } = useSignIn()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors when user starts typing
    if (error) resetState()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const result = await signIn(formData.email, formData.password)
      if (onSuccess) onSuccess(result)
    } catch (err) {
      // Error is handled by the hook
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your ExamSense account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// =============================================
// SIGN OUT COMPONENT
// =============================================
export const SignOutButton = ({ onSuccess, className = "" }) => {
  const { signOut, loading, error } = useSignOut()

  const handleSignOut = async () => {
    try {
      await signOut()
      if (onSuccess) onSuccess()
    } catch (err) {
      // Error is handled by the hook
      console.error('Sign out error:', err)
    }
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleSignOut} 
        disabled={loading}
        variant="outline"
        className={className}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Signing Out...' : 'Sign Out'}
      </Button>
    </div>
  )
}

// =============================================
// AUTH WRAPPER COMPONENT
// =============================================
export const AuthWrapper = ({ children, fallback = null }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    // Check current auth state
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return fallback || <SignInForm />
  }

  return children
}

// =============================================
// USAGE EXAMPLE COMPONENT
// =============================================
export const AuthExample = () => {
  const [currentView, setCurrentView] = useState('signin') // 'signin', 'signup'
  const [user, setUser] = useState(null)

  const handleSignInSuccess = (result) => {
    console.log('Sign in successful:', result)
    setUser(result.data.user)
  }

  const handleSignUpSuccess = () => {
    console.log('Sign up successful')
    setCurrentView('signin')
  }

  const handleSignOutSuccess = () => {
    console.log('Sign out successful')
    setUser(null)
    setCurrentView('signin')
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome, {user.user_metadata?.full_name || user.email}!</CardTitle>
            <CardDescription>
              You are successfully signed in to ExamSense
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignOutButton onSuccess={handleSignOutSuccess} className="w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-4">
        {currentView === 'signin' ? (
          <>
            <SignInForm onSuccess={handleSignInSuccess} />
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => setCurrentView('signup')}
              >
                Don't have an account? Sign up
              </Button>
            </div>
          </>
        ) : (
          <>
            <SignUpForm onSuccess={handleSignUpSuccess} />
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => setCurrentView('signin')}
              >
                Already have an account? Sign in
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}