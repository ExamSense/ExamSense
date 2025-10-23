# 📊 ExamSense Database Setup Guide

## 📋 Complete Table List

Your ExamSense CBT app needs these 7 tables:

| # | Table Name | Purpose |
|---|------------|---------|
| 1 | **users** | User profiles and authentication data |
| 2 | **subjects** | Exam subjects (Mathematics, English, Physics, etc.) |
| 3 | **topics** | Subject topics (Algebra, Grammar, Mechanics, etc.) |
| 4 | **questions** | All exam questions with options and answers |
| 5 | **test_history** | Completed test results and scores |
| 6 | **user_answers** | Individual answers for each question |
| 7 | **topic_performance** | User performance analytics by topic |

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Open Supabase SQL Editor
1. Go to: **https://supabase.com/dashboard**
2. Click on your **ExamSense** project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy & Paste the SQL
1. Open the file: `supabase/complete_schema.sql`
2. **Copy ALL the content** (Ctrl+A, Ctrl+C)
3. **Paste** into the SQL Editor
4. Click **Run** button (or press Ctrl+Enter)

### Step 3: Verify Tables Created
After running, check the **Table Editor**:
- You should see all 7 tables
- Sample data included (5 subjects, 5 math topics, 5 sample questions)

---

## ✅ What the SQL Does

### **Creates Tables:**
- ✅ All 7 tables with proper relationships
- ✅ UUID primary keys
- ✅ Foreign key constraints
- ✅ Automatic timestamp updates

### **Adds Security:**
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only see their own data
- ✅ Everyone can read subjects, topics, questions
- ✅ Protected test history and answers

### **Optimizes Performance:**
- ✅ Indexes on frequently queried columns
- ✅ Calculated columns for percentages
- ✅ Efficient joins and lookups

### **Includes Sample Data:**
- ✅ 5 subjects (Math, English, Physics, Chemistry, Biology)
- ✅ 5 math topics (Algebra, Geometry, Trigonometry, Calculus, Statistics)
- ✅ 5 sample algebra questions

---

## 📝 How to Add Your Questions

### Option 1: Using Table Editor (Easy)
1. Go to **Table Editor** → **questions**
2. Click **Insert row**
3. Fill in:
   - **topic_id**: Select from topics
   - **question**: Your question text
   - **option_a, option_b, option_c, option_d**: Answer options
   - **correct_answer**: 'a', 'b', 'c', or 'd'
   - **explanation**: Why this answer is correct
   - **difficulty**: 'easy', 'medium', or 'hard'
4. Click **Save**

### Option 2: Bulk Insert via SQL
```sql
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
SELECT 
  t.id,
  'Your question here?',
  'Option A',
  'Option B',
  'Option C',
  'Option D',
  'b', -- correct answer
  'Explanation here',
  'medium'
FROM topics t
WHERE t.name = 'Algebra';
```

### Option 3: Import from CSV
1. Prepare CSV file with columns:
   ```
   topic_id,question,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty
   ```
2. Go to Table Editor → questions
3. Click **Insert** → **Import from CSV**
4. Upload your file

---

## 🔍 Table Relationships

```
users
  ↓
test_history ← subjects
  ↓              ↓
user_answers   topics
  ↓              ↓
questions ←------┘
  ↓
topic_performance
```

---

## 🛡️ Security Features

### Row Level Security (RLS)
- ✅ **Users table**: Users can only view/edit their own profile
- ✅ **Test history**: Users can only see their own test results
- ✅ **User answers**: Users can only see their own answers
- ✅ **Topic performance**: Users can only see their own performance
- ✅ **Subjects/Topics/Questions**: Everyone can read (public)

### Why This Matters
- Students can't see other students' answers
- Test results are private
- Questions are accessible to all (for taking tests)

---

## 📊 Sample Data Included

After running the SQL, you'll have:

### Subjects (5):
1. Mathematics
2. English Language
3. Physics
4. Chemistry
5. Biology

### Topics (5 Math topics):
1. Algebra
2. Geometry
3. Trigonometry
4. Calculus
5. Statistics

### Questions (5 Algebra questions):
1. Basic addition
2. Solving equations
3. Square roots
4. Simplifying expressions
5. Function evaluation

---

## 🧪 Testing Your Database

### Test 1: Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```
Should show all 7 tables.

### Test 2: View Subjects
```sql
SELECT * FROM subjects;
```
Should show 5 subjects.

### Test 3: View Questions
```sql
SELECT 
  q.question,
  t.name as topic,
  s.name as subject
FROM questions q
JOIN topics t ON q.topic_id = t.id
JOIN subjects s ON t.subject_id = s.id;
```
Should show 5 algebra questions.

---

## 🎯 Next Steps After Database Setup

1. ✅ Run the SQL in Supabase ← **DO THIS FIRST**
2. ✅ Verify tables created
3. ✅ Add more questions (see "How to Add Your Questions" above)
4. ✅ Start your dev server: `npm run dev`
5. ✅ Test signup/login
6. ✅ Test taking a practice test

---

## 🆘 Troubleshooting

### "relation already exists"
- Some tables already exist
- Safe to ignore or drop existing tables first:
  ```sql
  DROP TABLE IF EXISTS user_answers CASCADE;
  DROP TABLE IF EXISTS test_history CASCADE;
  DROP TABLE IF EXISTS topic_performance CASCADE;
  DROP TABLE IF EXISTS questions CASCADE;
  DROP TABLE IF EXISTS topics CASCADE;
  DROP TABLE IF EXISTS subjects CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  ```
- Then run the complete schema again

### "permission denied"
- You're not signed in to Supabase
- Click your project in dashboard first

### "syntax error"
- Make sure you copied the ENTIRE SQL file
- Don't edit the SQL unless you know what you're doing

---

## 📚 Your Complete Database Structure

```
ExamSense Database
│
├── users (profiles)
│   └── id, email, full_name
│
├── subjects (exam categories)
│   └── id, name, description
│
├── topics (subject subtopics)
│   └── id, subject_id, name, description
│
├── questions (exam questions)
│   └── id, topic_id, question, options, correct_answer
│
├── test_history (completed tests)
│   └── id, user_id, subject_id, score, percentage
│
├── user_answers (individual answers)
│   └── id, user_id, test_id, question_id, is_correct
│
└── topic_performance (analytics)
    └── id, user_id, topic_id, average_score, attempts
```

---

## ✅ You're Ready!

Once you run the SQL:
- ✅ Your database is fully configured
- ✅ Sample data is loaded for testing
- ✅ Security is enabled
- ✅ Your app can connect and work immediately

Just add your questions and start testing! 🚀