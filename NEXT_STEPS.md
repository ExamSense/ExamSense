# 🎯 ExamSense - Next Steps After Database Setup

✅ **Database is set up!** Now let's connect everything and test your app.

---

## 📋 Current Status Check

### ✅ What's Already Working:
- ✅ Database tables created in Supabase
- ✅ AuthProvider wrapped in `main.tsx`
- ✅ AuthContext with signUp, signIn, signOut
- ✅ Services created (authService, questionService, testService)
- ✅ Protected routes configured
- ✅ Login and Signup pages created

### ⚠️ Small Issue Found:
Your Login and Signup pages call `login()` and `signup()`, but your AuthContext exports:
- `signIn()` ← not `login()`
- `signUp()` ← not `signup()`

---

## 🔧 Step 1: Fix Login & Signup Function Names

### Option A: Update Login.tsx (Recommended)
**File:** `src/pages/Auth/Login.tsx`

Change line 8 from:
```tsx
const { login, isLoading, error: authError } = useAuth();
```

To:
```tsx
const { signIn, loading, error: authError } = useAuth();
```

And change line 115 from:
```tsx
await login(formData.email, formData.password);
```

To:
```tsx
await signIn(formData.email, formData.password);
```

Also update line 115: `isLoading` → `loading`

### Option B: Update SignUp.tsx
**File:** `src/pages/Auth/SignUp.tsx`

Change line 8 from:
```tsx
const { signup, isLoading, error: authError } = useAuth();
```

To:
```tsx
const { signUp, loading, error: authError } = useAuth();
```

And change line 125 from:
```tsx
await signup(formData.name, formData.email, formData.password);
```

To:
```tsx
await signUp(formData.email, formData.password, formData.name);
```

**Note:** Parameter order changed! `signUp(email, password, fullName)`

Also update: `isLoading` → `loading`

---

## 🧪 Step 2: Test Authentication

### 1. Start Your Dev Server
```bash
npm run dev
```

### 2. Test Signup Flow
1. Go to: `http://localhost:5173/signup`
2. Fill in:
   - Name: Your Name
   - Email: test@example.com
   - Password: test123
   - Confirm Password: test123
3. Click **Sign Up**
4. Should redirect to `/test` page
5. Check Supabase → Table Editor → `users` table
   - You should see your new user!

### 3. Test Login Flow
1. Go to: `http://localhost:5173/login`
2. Enter same credentials
3. Click **Login**
4. Should redirect to `/subjects` page

### 4. Test Protected Routes
1. Open browser DevTools → Application → Local Storage
2. Clear all (this logs you out)
3. Try to visit: `http://localhost:5173/subjects`
4. Should redirect to `/login` (protected route working!)

---

## 📊 Step 3: Connect Pages to Supabase Data

### Update Subjects Page
**File:** `src/pages/Subjects.tsx`

Add this code to fetch subjects from database:

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubjects() {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching subjects:', error);
      } else {
        setSubjects(data || []);
      }
      setLoading(false);
    }
    
    fetchSubjects();
  }, []);

  if (loading) return <div>Loading subjects...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Select Subject</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div key={subject.id} className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-xl font-bold">{subject.name}</h2>
            <p className="text-gray-600 mt-2">{subject.description}</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Start Practice
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Update Test Page
**File:** `src/pages/Test.tsx`

Add this code to fetch and display questions:

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function Test() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      // Get 10 random questions
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          topics (
            name,
            subjects (name)
          )
        `)
        .limit(10);
      
      if (error) {
        console.error('Error fetching questions:', error);
      } else {
        setQuestions(data || []);
      }
      setLoading(false);
    }
    
    fetchQuestions();
  }, []);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: answer
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(answers[questions[currentIndex + 1]?.id] || '');
    }
  };

  const handleSubmit = async () => {
    // Calculate score
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        score++;
      }
    });

    // Save to database
    const { data: testData, error: testError } = await supabase
      .from('test_history')
      .insert({
        user_id: user?.id,
        subject_id: questions[0]?.topics?.subjects?.id,
        total_questions: questions.length,
        correct_answers: score,
        score: score,
        percentage: (score / questions.length) * 100
      })
      .select()
      .single();

    if (testError) {
      console.error('Error saving test:', testError);
      return;
    }

    // Save individual answers
    const userAnswers = questions.map(q => ({
      user_id: user?.id,
      test_id: testData.id,
      question_id: q.id,
      user_answer: answers[q.id] || null,
      is_correct: answers[q.id] === q.correct_answer
    }));

    await supabase.from('user_answers').insert(userAnswers);

    // Navigate to results
    window.location.href = `/results?testId=${testData.id}`;
  };

  if (loading) return <div>Loading questions...</div>;
  if (questions.length === 0) return <div>No questions available</div>;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl font-bold mb-6">{currentQuestion.question}</h2>

        {/* Options */}
        <div className="space-y-3">
          {['a', 'b', 'c', 'd'].map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className={`w-full p-4 text-left rounded-lg border-2 transition ${
                selectedAnswer === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <span className="font-bold mr-2">{option.toUpperCase()}.</span>
              {currentQuestion[`option_${option}`]}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Submit Test
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 Step 4: Add More Questions to Database

You currently have 5 sample algebra questions. Let's add more!

### Quick Add via Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Click **Table Editor** → **questions**
3. Click **Insert row**
4. Fill in question details
5. Click **Save**

### Bulk Add via SQL
Open SQL Editor and run:

```sql
-- Get topic IDs first
SELECT id, name FROM topics;

-- Then insert questions (replace <topic-id> with actual UUID)
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
VALUES 
-- Geometry Questions
('<geometry-topic-id>', 'What is the sum of angles in a triangle?', '90°', '180°', '270°', '360°', 'b', 'The sum of all interior angles in any triangle is always 180°.', 'easy'),
('<geometry-topic-id>', 'What is the area of a circle with radius 5?', '25π', '10π', '5π', '50π', 'a', 'Area = πr². With r=5, Area = π(5²) = 25π', 'medium'),

-- English Questions
('<grammar-topic-id>', 'Which is the correct past tense of "go"?', 'goed', 'went', 'gone', 'going', 'b', '"Went" is the correct simple past tense of "go".', 'easy'),

-- Physics Questions
('<mechanics-topic-id>', 'What is Newton''s First Law?', 'F=ma', 'Every action has equal reaction', 'Objects remain at rest or in motion', 'E=mc²', 'c', 'Newton''s First Law states that objects remain at rest or in uniform motion unless acted upon by force.', 'medium');
```

---

## ✅ Step 5: Final Testing Checklist

### Authentication ✓
- [ ] Can sign up with new account
- [ ] User appears in `users` table
- [ ] Can log in with credentials
- [ ] Can log out
- [ ] Protected routes redirect to login

### Data Display ✓
- [ ] Subjects page shows all subjects from database
- [ ] Can click on a subject
- [ ] Test page loads questions
- [ ] Can select answers
- [ ] Can navigate between questions

### Test Submission ✓
- [ ] Can submit test
- [ ] Test appears in `test_history` table
- [ ] Answers saved in `user_answers` table
- [ ] Score calculated correctly
- [ ] Redirects to results page

---

## 🚀 Quick Start Commands

```bash
# Start development server
npm run dev

# Open in browser
# http://localhost:5173

# View your database
# https://supabase.com/dashboard
```

---

## 📁 Files You Need to Update

1. **src/pages/Auth/Login.tsx** - Fix function names (`login` → `signIn`, `isLoading` → `loading`)
2. **src/pages/Auth/SignUp.tsx** - Fix function names (`signup` → `signUp`, parameter order)
3. **src/pages/Subjects.tsx** - Add database fetching
4. **src/pages/Test.tsx** - Add question fetching and submission
5. **src/pages/Results.tsx** - Add test results display

---

## 🆘 Common Issues & Fixes

### Issue: "Invalid API key"
**Fix:** Check your `.env.local` has correct credentials

### Issue: "Failed to fetch"
**Fix:** Make sure dev server is running: `npm run dev`

### Issue: "Row Level Security policy violation"
**Fix:** Run the SQL schema again - RLS policies might be missing

### Issue: "Questions not loading"
**Fix:** Add questions to database (see Step 4)

### Issue: "Login doesn't work"
**Fix:** Update function names in Login.tsx (see Step 1)

---

## 🎯 Priority Order

Do these in order for fastest results:

1. **🔴 URGENT:** Fix Login & Signup function names (5 min)
2. **🟡 IMPORTANT:** Test authentication (10 min)
3. **🟢 NICE TO HAVE:** Update Subjects page (15 min)
4. **🔵 OPTIONAL:** Update Test page (30 min)
5. **⚪ LATER:** Add more questions (ongoing)

---

## 🎉 You're Almost There!

After these steps, you'll have:
- ✅ Working authentication
- ✅ Database-connected pages
- ✅ Real exam questions
- ✅ Score tracking
- ✅ User history

Just fix those function names and you're ready to test! 🚀