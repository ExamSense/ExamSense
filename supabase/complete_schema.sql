-- ============================================
-- ExamSense CBT Database Schema (Final Version)
-- Compatible with React/TypeScript Frontend
-- Includes: Auth Integration, Auto Fields, All Mathematics Questions
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
-- 4. QUESTIONS TABLE
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
  correct_option_text TEXT,
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRIGGER FUNCTION: Auto-fill correct_option_text
-- ============================================
CREATE OR REPLACE FUNCTION fill_correct_option_text()
RETURNS TRIGGER AS $$
DECLARE
  q RECORD;
BEGIN
  SELECT * INTO q FROM questions WHERE id = NEW.question_id;
  IF NEW.correct_answer = 'a' THEN
    NEW.correct_option_text := q.option_a;
  ELSIF NEW.correct_answer = 'b' THEN
    NEW.correct_option_text := q.option_b;
  ELSIF NEW.correct_answer = 'c' THEN
    NEW.correct_option_text := q.option_c;
  ELSIF NEW.correct_answer = 'd' THEN
    NEW.correct_option_text := q.option_d;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fill_correct_option_text ON user_answers;
CREATE TRIGGER trg_fill_correct_option_text
BEFORE INSERT ON user_answers
FOR EACH ROW
EXECUTE FUNCTION fill_correct_option_text();

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
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_test_history_user_id ON test_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_performance_user_id ON topic_performance(user_id);

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_performance ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view and manage own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view subjects" ON subjects;
DROP POLICY IF EXISTS "Anyone can view topics" ON topics;
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
DROP POLICY IF EXISTS "Users manage own test history" ON test_history;
DROP POLICY IF EXISTS "Users manage own answers" ON user_answers;
DROP POLICY IF EXISTS "Users manage own performance" ON topic_performance;

-- ============================================
-- RLS POLICIES
-- ============================================
CREATE POLICY "Users can view and manage own profile" ON users
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Anyone can view topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT USING (true);

CREATE POLICY "Users manage own test history" ON test_history
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own answers" ON user_answers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own performance" ON topic_performance
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA
-- ============================================
INSERT INTO subjects (name, description) VALUES
  ('Mathematics', 'Covers Algebra, Geometry, Trigonometry, Calculus, and Statistics')
ON CONFLICT (name) DO NOTHING;

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

-- ============================================
-- ALGEBRA QUESTIONS (10)
-- ============================================
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
SELECT t.id, q.question, q.a, q.b, q.c, q.d, q.correct, q.expl, q.diff
FROM topics t
CROSS JOIN (VALUES
  ('Simplify: 2(x + 3) + 4(x - 1)', '6x + 2', '6x + 10', '4x + 2', '2x + 10', 'a', 'Expand: 2x+6+4x-4 = 6x+2', 'easy'),
  ('Solve for x: 3x - 7 = 11', '6', '18', '8', '9', 'a', 'Add 7: 3x = 18, x = 6', 'easy'),
  ('If 2x + 3y = 12 and y = 3, find x', '1.5', '3', '4.5', '6', 'a', '2x+9=12, 2x=3, x=1.5', 'medium'),
  ('Factorize: x - 9', '(x - 9)(x + 1)', '(x - 3)(x + 3)', '(x - 1)(x + 9)', '(x - 2)(x + 2)', 'b', 'Difference of squares', 'easy'),
  ('Expand: (x + 2)(x + 5)', 'x + 7x + 10', 'x + 10x + 7', 'x + 5x + 2', 'x + 6x + 5', 'a', 'Use FOIL method', 'easy'),
  ('If f(x) = x + 2x, find f(-3)', '3', '9', '-3', '-9', 'a', 'f(-3)=9-6=3', 'easy'),
  ('Simplify: 4x - 3(x - 2)', 'x + 6', 'x - 6', '7x + 6', '7x - 6', 'a', '4x-3x+6=x+6', 'easy'),
  ('Solve: 5x + 2 = 17', 'x = 2', 'x = 3', 'x = 4', 'x = 5', 'b', 'Subtract 2: 5x=15, x=3', 'easy'),
  ('Find roots of x - 4x - 5 = 0', 'x=5 or x=-1', 'x=-5 or x=1', 'x=4 or x=5', 'x=0 or x=-5', 'a', 'Factor: (x-5)(x+1)=0', 'medium'),
  ('Simplify: (2xy)(3xy)', '5xy', '6xy', '6xy', '6xy', 'b', 'Multiply coefficients and add exponents', 'medium')
) AS q(question,a,b,c,d,correct,expl,diff)
WHERE t.name='Algebra';

-- ============================================
-- GEOMETRY QUESTIONS (10)
-- ============================================
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
SELECT t.id, q.question, q.a, q.b, q.c, q.d, q.correct, q.expl, q.diff
FROM topics t
CROSS JOIN (VALUES
  ('Sum of angles in a triangle', '90 degrees', '120 degrees', '180 degrees', '360 degrees', 'c', 'All triangles = 180 degrees', 'easy'),
  ('Perimeter of square (side=9cm)', '36 cm', '45 cm', '27 cm', '18 cm', 'a', 'Perimeter = 4 x 9 = 36 cm', 'easy'),
  ('Rectangle area (L=12, W=8)', '80 cm', '100 cm', '96 cm', '144 cm', 'c', 'Area = L x W = 96 cm', 'easy'),
  ('Diagonal of square (side=10cm)', '10 cm', '14.14 cm', '15 cm', '12 cm', 'b', 'Diagonal = 2 x side = 14.14 cm', 'medium'),
  ('Circle circumference (r=7, π=22/7)', '44 cm', '49 cm', '22 cm', '77 cm', 'a', 'C = 2πr = 2 x 22/7 x 7 = 44 cm', 'medium'),
  ('Right triangle hypotenuse (6,8)', '10 cm', '12 cm', '8 cm', '14 cm', 'a', 'Pythagoras: (36+64) = 10 cm', 'medium'),
  ('Triangle third angle (35, 65)', '80 degrees', '75 degrees', '90 degrees', '100 degrees', 'a', '180-(35+65)=80 degrees', 'easy'),
  ('Distance center to chord (r=10)', '4 cm', '6 cm', '8 cm', '10 cm', 'b', 'r = h + (chord/2), h=6', 'medium'),
  ('Circle area (diameter=14, π=22/7)', '77 cm', '154 cm', '308 cm', '44 cm', 'b', 'r=7, A=πr=154 cm', 'easy'),
  ('Hexagon perimeter (side=5cm)', '20 cm', '25 cm', '30 cm', '35 cm', 'c', 'Perimeter = 6 x 5 = 30 cm', 'easy')
) AS q(question,a,b,c,d,correct,expl,diff)
WHERE t.name='Geometry';

-- ============================================
-- TRIGONOMETRY QUESTIONS (10)
-- ============================================
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
SELECT t.id, q.question, q.a, q.b, q.c, q.d, q.correct, q.expl, q.diff
FROM topics t
CROSS JOIN (VALUES
  ('sin 30 = ?', '0.5', '0.866', '1', '0', 'a', 'sin 30 = 1/2 = 0.5', 'easy'),
  ('cos 60 = ?', '0.5', '0.866', '1', '0', 'a', 'cos 60 = 1/2 = 0.5', 'easy'),
  ('tan 45 = ?', '0', '1', '1.732', '0.577', 'b', 'tan 45 = 1', 'easy'),
  ('If sin θ = 3/5, find cos θ', '4/5', '5/4', '3/4', '1/2', 'a', 'cos θ = (1-sinθ) = 4/5', 'medium'),
  ('If tan A = 3/4, find sin A', '3/4', '3/5', '4/5', '5/3', 'b', 'sin A = 3/5 (hypotenuse=5)', 'medium'),
  ('Find tan θ if sin θ = 4/5', '3/5', '4/3', '3/4', '5/4', 'b', 'cos=3/5, tan=sin/cos=4/3', 'medium'),
  ('sin30 + cos30 = ?', '0', '1', '0.5', '0.866', 'b', 'sinθ + cosθ = 1 always', 'easy'),
  ('If sec θ = 2, find cos θ', '0.5', '2', '1.414', '-0.5', 'a', 'cos θ = 1/sec θ = 1/2', 'easy'),
  ('If sin θ = 5/13, find tan θ', '5/13', '5/12', '12/13', '13/5', 'b', 'cos=12/13, tan=sin/cos=5/12', 'medium'),
  ('If cos θ = 12/13, find sin θ', '5/13', '13/5', '12/13', '4/5', 'a', 'sin=1-cos=25/169, sin=5/13', 'medium')
) AS q(question,a,b,c,d,correct,expl,diff)
WHERE t.name='Trigonometry';

-- ============================================
-- CALCULUS QUESTIONS (10)
-- ============================================
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
SELECT t.id, q.question, q.a, q.b, q.c, q.d, q.correct, q.expl, q.diff
FROM topics t
CROSS JOIN (VALUES
  ('Differentiate y = x', '2x', 'x', 'x', '1', 'a', 'Derivative of x is 2x', 'easy'),
  ('Differentiate y = 3x', '3x', '6x', '9x', '9x', 'c', 'd/dx(3x) = 9x', 'easy'),
  ('Find dy/dx if y = 5x + 2x', '20x + 4x', '10x + 4x', '5x + 2x', '20x + 4', 'a', 'Differentiate each term', 'medium'),
  ('Integrate 2x dx', 'x + C', '2x + C', 'x + C', '2x + C', 'a', '2x dx = x + C', 'easy'),
  ('Integrate x dx', 'x/3 + C', '3x + C', 'x + C', 'x + C', 'a', 'x dx = x/3 + C', 'easy'),
  ('Find dy/dx if y = sin x', 'cos x', '-sin x', '-cos x', 'tan x', 'a', 'Derivative of sin x is cos x', 'easy'),
  ('Find dy/dx if y = cos x', '-sin x', 'sin x', '-cos x', 'tan x', 'a', 'Derivative of cos x is -sin x', 'easy'),
  ('Find cos x dx', 'sin x + C', '-sin x + C', 'tan x + C', 'sec x + C', 'a', 'Integral of cos x is sin x + C', 'easy'),
  ('Find sin x dx', 'cos x + C', '-cos x + C', '-sin x + C', 'tan x + C', 'b', 'Integral of sin x is -cos x + C', 'easy'),
  ('Find dy/dx if y = eˣ', 'eˣ', 'ln x', 'x eˣ', '1/x', 'a', 'Derivative of eˣ is eˣ', 'medium')
) AS q(question,a,b,c,d,correct,expl,diff)
WHERE t.name='Calculus';

-- ============================================
-- STATISTICS QUESTIONS (10)
-- ============================================
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
SELECT t.id, q.question, q.a, q.b, q.c, q.d, q.correct, q.expl, q.diff
FROM topics t
CROSS JOIN (VALUES
  ('Mean of 2, 4, 6, 8, 10', '5', '6', '7', '8', 'b', 'Sum=30, Mean=30/5=6', 'easy'),
  ('Median of 3, 7, 9, 12, 15', '7', '9', '10', '12', 'b', 'Middle value = 9', 'easy'),
  ('Mode of 2, 3, 3, 5, 7, 7, 7, 9', '3', '5', '7', '9', 'c', '7 appears most frequently', 'easy'),
  ('Range of 5, 8, 12, 14, 20', '10', '15', '20', '5', 'b', 'Range = 20 - 5 = 15', 'easy'),
  ('Mean of 5 numbers is 8, find sum', '8', '40', '13', '25', 'b', 'Mean = sum/n, 8=sum/5, sum=40', 'easy'),
  ('60% of 150 students like Math', '60', '90', '100', '120', 'b', '60% of 150 = 0.6 x 150 = 90', 'easy'),
  ('P(red ball) from 3 red, 2 blue', '2/5', '3/5', '1/2', '1/3', 'b', 'Total=5, red=3, P=3/5', 'medium'),
  ('P(even number) when rolling die', '1/6', '1/3', '1/2', '2/3', 'c', 'Even={2,4,6}, 3 out of 6 = 1/2', 'medium'),
  ('Mean of x, 5, 7, 9, 11 is 8', '8', '6', '4', '9', 'a', '(x+32)/5=8, x+32=40, x=8', 'medium'),
  ('P(two heads) when tossing coin', '1/2', '1/3', '1/4', '1/6', 'c', 'Outcomes=4, HH=1, P=1/4', 'medium')
) AS q(question,a,b,c,d,correct,expl,diff)
WHERE t.name='Statistics';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'ExamSense Database Schema Created Successfully!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tables: users, subjects, topics, questions, test_history, user_answers, topic_performance';
  RAISE NOTICE 'Sample Data: Mathematics with 5 topics and 50 questions';
  RAISE NOTICE 'RLS Policies: Enabled and configured';
  RAISE NOTICE 'Triggers: Auto-update timestamps and correct_option_text';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'You can now use the ExamSense application!';
  RAISE NOTICE '==============================================';
END $$;
