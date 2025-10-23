# Supabase Integration Guide for ExamSense

This guide shows how to integrate the Supabase services into your existing React components.

## 🚀 Quick Setup

### 1. Environment Variables
Add your Supabase credentials to `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Services Overview

#### Authentication Service (`src/services/authService.js`)
- `signUp(email, password, userData)` - Register new user
- `signIn(email, password)` - Login user 
- `signOut()` - Logout user
- `getCurrentUser()` - Get current authenticated user
- `getUserProfile(userId)` - Get user profile from users table
- `onAuthStateChange(callback)` - Listen for auth state changes

#### Question Service (`src/services/questionService.js`)
- `getSubjects()` - Fetch all subjects
- `getTopics(subjectId)` - Get topics for a subject
- `getRandomQuestions(filters)` - Fetch random questions
- `searchQuestions(searchTerm, filters)` - Search questions
- `validateAnswer(question, userAnswer)` - Check if answer is correct

#### Test Service (`src/services/testService.js`)
- `saveTestResult(testData)` - Save test results and calculate score
- `getUserTestHistory(userId, filters)` - Get user's test history
- `getTestDetails(testId, userId)` - Get detailed test results
- `getTopicPerformance(userId, subjectId, topicId)` - Get performance analytics
- `getUserStats(userId)` - Get overall user statistics
- `getLearningRecommendations(userId)` - Get personalized recommendations

## 🔧 Integration Examples

### Login Component Integration

Your existing Login component already uses AuthContext. Make sure it's updated to use Supabase:

```tsx
// Your existing code in src/pages/Auth/Login.tsx is already compatible!
// The login function will now use Supabase authentication
const { login, isLoading, error: authError } = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
  // ... existing validation code ...
  
  try {
    await login(formData.email, formData.password); // This now uses Supabase!
    navigate('/subjects');
  } catch (err) {
    console.error('Login error:', err);
  }
};
```

### Subject Selection Integration

```tsx
// In your Subjects component
import { getSubjects } from '../services/questionService';

const [subjects, setSubjects] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchSubjects();
}, []);
```

### Question Page Integration

```tsx
// In your Test/Question component
import { getRandomQuestions, getTopics } from '../services/questionService';

const [questions, setQuestions] = useState([]);
const [topics, setTopics] = useState([]);

const loadQuestions = async (subjectId, topicId = null) => {
  try {
    const data = await getRandomQuestions({
      subjectId,
      topicId,
      limit: 10,
      difficulty: 'medium' // optional
    });
    setQuestions(data);
  } catch (error) {
    console.error('Error loading questions:', error);
  }
};

const loadTopics = async (subjectId) => {
  try {
    const data = await getTopics(subjectId);
    setTopics(data);
  } catch (error) {
    console.error('Error loading topics:', error);
  }
};
```

### Results Page Integration

```tsx
// In your Results component
import { saveTestResult, getTopicPerformance } from '../services/testService';
import { useAuth } from '../contexts/AuthContext';

const { user } = useAuth();

const handleTestCompletion = async (questions, userAnswers) => {
  try {
    const testData = {
      userId: user.id,
      subjectId: selectedSubject.id,
      topicId: selectedTopic?.id,
      questions,
      userAnswers,
      timeSpent: totalTimeSpent,
      testType: 'practice'
    };

    const result = await saveTestResult(testData);
    
    // Show results
    setScore(result.score);
    setTotalQuestions(result.totalQuestions);
    setPercentage(result.percentage);
    setPassed(result.passed);
    
    // Get topic performance for recommendations
    const performance = await getTopicPerformance(user.id, selectedSubject.id);
    setTopicPerformance(performance);
    
  } catch (error) {
    console.error('Error saving test result:', error);
  }
};
```

### History Page Integration

```tsx
// In your History component
import { getUserTestHistory, getUserStats } from '../services/testService';
import { useAuth } from '../contexts/AuthContext';

const { user } = useAuth();
const [testHistory, setTestHistory] = useState([]);
const [userStats, setUserStats] = useState(null);

useEffect(() => {
  const loadData = async () => {
    try {
      // Load test history
      const history = await getUserTestHistory(user.id, {
        limit: 20,
        subjectId: selectedSubject?.id
      });
      setTestHistory(history);
      
      // Load user statistics
      const stats = await getUserStats(user.id);
      setUserStats(stats);
      
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };
  
  if (user) {
    loadData();
  }
}, [user, selectedSubject]);
```

## 🔐 Authentication Context Update

Since your existing AuthContext uses localStorage, you'll need to update it to use Supabase. Here's the key change:

```tsx
// Update your AuthContext to use Supabase services
import { signUp, signIn, signOut, getCurrentUser, onAuthStateChange } from '../services/authService';

// In your AuthProvider component
useEffect(() => {
  // Listen for auth state changes
  const { data: { subscription } } = onAuthStateChange(async (event, session) => {
    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  });

  return () => subscription?.unsubscribe();
}, []);

// Update your login function
const login = async (email: string, password: string) => {
  setIsLoading(true);
  setError(null);
  
  try {
    const result = await signIn(email, password);
    console.log('User logged in:', result.user?.email);
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setIsLoading(false);
  }
};
```

## 🎯 Testing Checklist

1. **Authentication**:
   - [ ] Sign up creates user in Supabase
   - [ ] Login works with email/password
   - [ ] Logout clears session
   - [ ] Auth state persists on page reload

2. **Questions**:
   - [ ] Subjects load from database
   - [ ] Topics filter correctly
   - [ ] Random questions display properly
   - [ ] Answer validation works

3. **Test Results**:
   - [ ] Test scores save to database
   - [ ] Performance analytics calculate correctly
   - [ ] History displays past tests
   - [ ] Recommendations show weak topics

4. **Error Handling**:
   - [ ] Network errors show user-friendly messages
   - [ ] Loading states display properly
   - [ ] Invalid inputs are validated

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Supabase URL and keys are correct in `.env.local`

2. **Authentication Not Persisting**: Check that `onAuthStateChange` is set up properly

3. **Database Queries Failing**: Verify your RLS policies allow the operations

4. **TypeScript Errors**: Install Supabase types: `npm install @supabase/supabase-js`

### Debug Tips

```tsx
// Add debug logging to see what's happening
console.log('Current user:', await getCurrentUser());
console.log('Supabase client:', supabase);

// Check if user is authenticated
const isAuth = await isAuthenticated();
console.log('Is authenticated:', isAuth);
```

## 📚 Next Steps

1. Replace your localStorage auth with Supabase AuthContext
2. Update each component one by one
3. Test thoroughly with your database
4. Add error boundaries for production
5. Implement loading skeletons for better UX

Your existing UI components don't need to change - just the data fetching logic!