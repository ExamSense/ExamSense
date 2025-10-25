# 🔍 Debugging: Blank Subjects Page

## Issue
After login, the page redirects to `/subjects` but shows blank.

## Root Cause
Your Subjects page was using **local data** from `questionBank.ts` instead of fetching from **Supabase database**.

---

## ✅ What I Fixed

### 1. **Updated Imports**
Changed from:
```tsx
import { getAvailableSubjects, getSubjectStatistics } from "@/data/questionBank";
```

To:
```tsx
import { supabase } from "@/supabaseClient";
```

### 2. **Added Loading State**
Now shows a loading spinner while fetching subjects from database:
```tsx
if (loading) {
  return (
    <div>
      <Loader2 className="animate-spin" />
      Loading subjects...
    </div>
  );
}
```

### 3. **Fetch Subjects from Supabase**
```tsx
useEffect(() => {
  async function fetchSubjects() {
    // Get subjects from database
    const { data: subjects } = await supabase
      .from('subjects')
      .select('*')
      .order('name');
    
    // Count questions for each subject
    // (joins through topics table)
    setSubjectsFromDB(subjectsWithCount);
  }
  
  fetchSubjects();
}, []);
```

### 4. **Shows Database Status**
Added indicator showing how many subjects loaded:
```tsx
✓ 5 subjects available from database
```

---

## 🧪 Testing Steps

### 1. Check Browser Console
Open DevTools → Console and look for:
- ✅ No errors = Database connection working
- ❌ "Error fetching subjects" = Check your `.env.local` credentials

### 2. Verify Database Has Subjects
Go to Supabase Dashboard → Table Editor → **subjects** table
- Should see: Mathematics, English Language, Physics, Chemistry, Biology

### 3. Check Network Tab
DevTools → Network → Filter "supabase"
- Should see requests to Supabase API
- Status 200 = Success
- Status 401 = Authentication issue

---

## 🔍 Common Issues & Solutions

### Issue 1: Still Blank (No Loading Spinner)
**Problem:** Component not rendering at all
**Solution:** Check browser console for JavaScript errors

### Issue 2: Loading Forever (Spinner Never Stops)
**Problem:** Database query failing
**Check:**
```
1. Console shows error message?
2. .env.local has correct credentials?
3. Supabase tables created?
```

### Issue 3: "Error Loading Subjects" Toast
**Problem:** Query failed
**Solution:**
```bash
# Open Supabase SQL Editor and run:
SELECT * FROM subjects;

# Should return 5 subjects
# If empty, run complete_schema.sql again
```

### Issue 4: Subjects Show but "0 questions available"
**Problem:** Topics or questions not linked properly
**Solution:**
```sql
-- Check topics exist for subjects
SELECT 
  s.name as subject,
  COUNT(t.id) as topics,
  COUNT(q.id) as questions
FROM subjects s
LEFT JOIN topics t ON t.subject_id = s.id
LEFT JOIN questions q ON q.topic_id = t.id
GROUP BY s.name;
```

---

## 🎯 Quick Debug Commands

### Check Supabase Connection
Open browser console on `/subjects` page and run:
```javascript
// This checks if supabase client is accessible
console.log(window.supabase);

// Manual query to test
const { data, error } = await supabase.from('subjects').select('*');
console.log('Subjects:', data);
console.log('Error:', error);
```

### Check Auth State
```javascript
const { data: session } = await supabase.auth.getSession();
console.log('User logged in:', session);
```

---

## 📊 Expected Behavior

### After Login → Redirects to `/subjects`:

1. **First:** Shows loading spinner (2-3 seconds)
2. **Then:** Shows discipline cards (Science, Arts, Commercial)
3. **Bottom:** Shows "✓ 5 subjects available from database"
4. **Click Discipline:** Shows subjects list with question counts

---

## 🆘 If Still Blank

Run this diagnostic:

```javascript
// In browser console on /subjects page
const testConnection = async () => {
  console.log('🔍 Testing Supabase connection...');
  
  // Test 1: Check if supabase client exists
  if (!window.supabase) {
    console.error('❌ Supabase client not found!');
    return;
  }
  console.log('✅ Supabase client exists');
  
  // Test 2: Check auth
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    console.error('❌ Not logged in!');
    return;
  }
  console.log('✅ User authenticated:', session.session.user.email);
  
  // Test 3: Fetch subjects
  const { data: subjects, error } = await supabase
    .from('subjects')
    .select('*');
  
  if (error) {
    console.error('❌ Database error:', error);
    return;
  }
  
  console.log('✅ Subjects loaded:', subjects);
  console.log(`Found ${subjects.length} subjects`);
};

testConnection();
```

---

## 🎉 Success Indicators

You'll know it's working when you see:

1. ✅ Loading spinner appears briefly
2. ✅ Three discipline cards appear (Science, Arts, Commercial)
3. ✅ "5 subjects available from database" message
4. ✅ No errors in browser console
5. ✅ Can click a discipline and see subjects

---

## Next Steps After This Works

Once subjects display correctly:

1. **Test clicking a subject** → Should navigate to `/test`
2. **Update Test page** → Fetch questions from database
3. **Add more questions** → Use Supabase Table Editor
4. **Test full flow** → Signup → Login → Select Subject → Take Test → View Results

Let me know what you see! 🔍