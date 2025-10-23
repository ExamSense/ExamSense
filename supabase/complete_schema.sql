-- ============================================
-- ExamSense CBT Database Schema (Final Version)
-- Includes: Auth Integration, Auto Fields, Correct Answer Text
-- ============================================

-- Enable UUID extension (for unique IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. SUBJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. TOPICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subject_id, name)
);

-- ============================================
-- 4. QUESTIONS TABLE (Updated with correct_option_text)
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  correct_option_text TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN correct_answer = 'a' THEN option_a
      WHEN correct_answer = 'b' THEN option_b
      WHEN correct_answer = 'c' THEN option_c
      WHEN correct_answer = 'd' THEN option_d
      ELSE NULL
    END
  ) STORED,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. TEST HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS test_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_questions > 0 THEN (score::DECIMAL / total_questions * 100)
      ELSE 0
    END
  ) STORED,
  time_spent INTEGER,
  test_type TEXT DEFAULT 'practice' CHECK (test_type IN ('practice', 'exam', 'quiz')),
  date_taken TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. USER ANSWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES test_history(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer TEXT CHECK (user_answer IN ('a', 'b', 'c', 'd') OR user_answer IS NULL),
  correct_answer TEXT NOT NULL,
  correct_option_text TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN correct_answer = 'a' THEN (SELECT option_a FROM questions WHERE id = question_id)
      WHEN correct_answer = 'b' THEN (SELECT option_b FROM questions WHERE id = question_id)
      WHEN correct_answer = 'c' THEN (SELECT option_c FROM questions WHERE id = question_id)
      WHEN correct_answer = 'd' THEN (SELECT option_d FROM questions WHERE id = question_id)
      ELSE NULL
    END
  ) STORED,
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. TOPIC PERFORMANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS topic_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  attempts INTEGER DEFAULT 1,
  total_score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  average_score DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_questions > 0 THEN (total_score::DECIMAL / total_questions * 100)
      ELSE 0
    END
  ) STORED,
  best_score DECIMAL(5,2) DEFAULT 0,
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject_id, topic_id)
);

-- ============================================
-- INDEXES (for better performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_test_history_user_id ON test_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_performance_user_id ON topic_performance(user_id);

-- ============================================
-- ENABLE RLS (Row-Level Security)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_performance ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Users
CREATE POLICY "Users can view and manage own profile" ON users
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Public Read Tables
CREATE POLICY "Anyone can view subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Anyone can view topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT USING (true);

-- Test History
CREATE POLICY "Users manage own test history" ON test_history
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User Answers
CREATE POLICY "Users manage own answers" ON user_answers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Topic Performance
CREATE POLICY "Users manage own performance" ON topic_performance
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA: Subjects + Topics + Questions
-- ============================================

-- Subjects
INSERT INTO subjects (name, description) VALUES
  ('Mathematics', 'Covers Algebra, Geometry, Trigonometry, Calculus, and Statistics')
ON CONFLICT (name) DO NOTHING;

-- Topics
INSERT INTO topics (subject_id, name, description)
SELECT s.id, t.name, t.description
FROM subjects s
CROSS JOIN (VALUES
  ('Algebra', 'Equations and algebraic expressions'),
  ('Geometry', 'Shapes, angles, and spatial reasoning'),
  ('Trigonometry', 'Triangles and trigonometric functions'),
  ('Calculus', 'Differentiation and integration'),
  ('Statistics', 'Data analysis and probability')
) AS t(name, description)
WHERE s.name = 'Mathematics'
ON CONFLICT (subject_id, name) DO NOTHING;

-- Algebra Questions
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
SELECT t.id,
  q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation, q.difficulty
FROM topics t
CROSS JOIN (VALUES
  ('What is 2 + 2?', '3', '4', '5', '6', 'b', '2 plus 2 equals 4', 'easy'),
  ('Solve for x: 2x + 5 = 15', '5', '10', '7.5', '3', 'a', 'Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5', 'medium'),
  ('Simplify: 3(x + 2) - 2(x - 1)', 'x + 8', 'x + 4', 'x + 6', 'x + 10', 'a', 'Expand: 3x + 6 - 2x + 2 = x + 8', 'medium'),
  ('If f(x) = 2x + 3, what is f(5)?', '10', '13', '8', '15', 'b', 'Substitute x = 5: f(5) = 2(5) + 3 = 13', 'easy'),
  ('Find x if x/3 + 2 = 5', '3', '6', '9', '1', 'a', 'x/3 = 3 ⇒ x = 9', 'easy')
) AS q(question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
WHERE t.name = 'Algebra';
