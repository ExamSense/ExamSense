# ExamSense Authentication Functions

This guide explains how to use the React authentication functions for the ExamSense CBT application.

## 📁 Files Created

### 1. `src/lib/auth.js` - Authentication Functions & Hooks
- **React Hooks**: `useSignUp()`, `useSignIn()`, `useSignOut()`
- **Standalone Functions**: `signUpUser()`, `signInUser()`, `signOutUser()`
- **Utility Functions**: `getCurrentUser()`, `isAuthenticated()`, `resetPassword()`

### 2. `src/components/auth/AuthComponents.jsx` - Ready-to-use Components
- **SignUpForm**: Complete registration form
- **SignInForm**: Login form
- **SignOutButton**: Sign out button
- **AuthWrapper**: Protected route wrapper

## 🚀 Quick Usage Examples

### Using React Hooks (Recommended)

```jsx
import { useSignUp, useSignIn, useSignOut } from '../lib/auth.js'

// In your component
function MyAuthComponent() {
  const { signUp, loading, error, success } = useSignUp()
  const { signIn, loading: signInLoading, error: signInError } = useSignIn()
  const { signOut, loading: signOutLoading } = useSignOut()

  const handleSignUp = async () => {
    try {
      await signUp('user@example.com', 'password123', 'John Doe')
      console.log('Success!', success)
    } catch (err) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <button onClick={handleSignUp} disabled={loading}>
        {loading ? 'Creating...' : 'Sign Up'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Account created!</p>}
    </div>
  )
}
```

### Using Standalone Functions

```jsx
import { signUpUser, signInUser, signOutUser } from '../lib/auth.js'

// Sign up
const handleSignUp = async () => {
  const result = await signUpUser('user@example.com', 'password123', 'John Doe')
  if (result.success) {
    console.log('Success:', result.message)
  } else {
    console.error('Error:', result.error)
  }
}

// Sign in
const handleSignIn = async () => {
  const result = await signInUser('user@example.com', 'password123')
  if (result.success) {
    console.log('Signed in:', result.data.user)
  } else {
    console.error('Error:', result.error)
  }
}

// Sign out
const handleSignOut = async () => {
  const result = await signOutUser()
  if (result.success) {
    console.log('Signed out successfully')
  }
}
```

### Using Pre-built Components

```jsx
import { SignUpForm, SignInForm, SignOutButton, AuthWrapper } from '../components/auth/AuthComponents.jsx'

function App() {
  return (
    <div>
      {/* Protected content - only shows when user is authenticated */}
      <AuthWrapper fallback={<SignInForm />}>
        <h1>Welcome to ExamSense!</h1>
        <SignOutButton onSuccess={() => console.log('Signed out')} />
      </AuthWrapper>

      {/* Or use individual forms */}
      <SignUpForm onSuccess={() => console.log('Account created')} />
      <SignInForm onSuccess={(user) => console.log('Signed in:', user)} />
    </div>
  )
}
```

## 🔧 Function Reference

### useSignUp()
```jsx
const { signUp, loading, error, success, resetState } = useSignUp()
```
- **signUp(email, password, fullName)**: Creates new user account
- **loading**: Boolean indicating if signup is in progress
- **error**: Error message if signup fails
- **success**: Boolean indicating successful signup
- **resetState()**: Clears error and success states

### useSignIn()
```jsx
const { signIn, loading, error, user, resetState } = useSignIn()
```
- **signIn(email, password)**: Signs in existing user
- **loading**: Boolean indicating if signin is in progress
- **error**: Error message if signin fails
- **user**: User object if signin succeeds
- **resetState()**: Clears error and user states

### useSignOut()
```jsx
const { signOut, loading, error, resetState } = useSignOut()
```
- **signOut()**: Signs out current user
- **loading**: Boolean indicating if signout is in progress
- **error**: Error message if signout fails
- **resetState()**: Clears error state

## 🛡️ Error Handling

All functions include comprehensive error handling:

```jsx
// Validation errors
"Please fill in all required fields"
"Password must be at least 6 characters long"
"Please enter a valid email address"

// Authentication errors
"Invalid email or password. Please try again."
"Please verify your email address before signing in."
"Too many login attempts. Please try again later."
```

## 🔐 Features Included

- ✅ **Input Validation**: Email format, password length, required fields
- ✅ **User-Friendly Error Messages**: Clear, actionable error messages
- ✅ **Loading States**: Visual feedback during async operations
- ✅ **Success States**: Confirmation of successful operations
- ✅ **User Profile Creation**: Automatically creates user profile in database
- ✅ **Password Reset**: Built-in password reset functionality
- ✅ **Auth State Listening**: Real-time authentication state changes
- ✅ **Protected Routes**: AuthWrapper component for protected content

## 🎨 Styling

The components use Shadcn/UI components with Tailwind CSS:
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`
- `Button`, `Input`, `Alert`, `AlertDescription`
- Icons from `lucide-react`

## 🔄 Integration with Database

When a user signs up, the functions automatically:
1. Create the user in Supabase Auth
2. Insert user profile into your `users` table
3. Handle any database insertion errors gracefully

## 📱 Complete Auth Flow Example

```jsx
import React, { useState, useEffect } from 'react'
import { onAuthStateChange } from '../lib/auth.js'
import { AuthExample } from '../components/auth/AuthComponents.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChange((event, session) => {
      console.log('Auth event:', event)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return unsubscribe // Cleanup subscription
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.user_metadata?.full_name}!</h1>
          {/* Your app content */}
        </div>
      ) : (
        <AuthExample />
      )}
    </div>
  )
}
```

## 🚀 Next Steps

1. **Import the functions** into your components
2. **Use the hooks** for state management
3. **Customize the UI** to match your design
4. **Add the components** to your routes
5. **Test the authentication flow**

The authentication system is now ready for production use in your ExamSense CBT application!