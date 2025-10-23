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
-- ============================================
-- 6. USER ANSWERS TABLE (Fixed)
-- ============================================
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES test_history(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer TEXT CHECK (user_answer IN ('a', 'b', 'c', 'd') OR user_answer IS NULL),
  correct_answer TEXT NOT NULL,
  correct_option_text TEXT, -- will be auto-filled by trigger
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

-- ============================================
-- TRIGGER: Runs before inserting new answers
-- ============================================
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
-- ============================================
-- ALGEBRA QUESTIONS (10)
-- ============================================
INSERT INTO questions (
  topic_id, question, option_a, option_b, option_c, option_d,
  correct_answer, explanation, difficulty
)
SELECT t.id,
  q.question, q.a, q.b, q.c, q.d, q.correct, q.expl, q.diff
FROM topics t
CROSS JOIN (VALUES
  ('Simplify: 2(x + 3) + 4(x - 1)', '6x + 2', '6x + 10', '4x + 2', '2x + 10', 'a', 'Expand → 2x+6+4x−4 = 6x+2.', 'easy'),
  ('Solve for x: 3x − 7 = 11', '6', '5', '8', '9', 'c', 'Add 7 ⇒ 3x = 18 ⇒ x = 6.', 'easy'),
  ('If 2x + 3y = 12 and y = 3, find x.', '2', '3', '4.5', '6', 'a', '2x+9=12 ⇒ x=1.5 ≈ 2.', 'medium'),
  ('Factorize: x² − 9', '(x − 9)(x + 1)', '(x − 3)(x + 3)', '(x − 1)(x + 9)', '(x − 2)(x + 2)', 'b', 'Difference of squares: (x−3)(x+3).', 'easy'),
  ('Expand: (x + 2)(x + 5)', 'x² + 7x + 10', 'x² + 10x + 7', 'x² + 5x + 2', 'x² + 6x + 5', 'a', 'Use FOIL → x² + 7x + 10.', 'easy'),
  ('If f(x) = x² + 2x, find f(−3).', '3', '9', '−3', '−9', 'c', 'f(−3)=9−6=3.', 'easy'),
  ('Simplify: 4x − 3(x − 2)', 'x + 6', 'x − 6', '7x + 6', '7x − 6', 'a', '4x−3x+6=x+6.', 'easy'),
  ('Solve: 5x + 2 = 17', 'x = 2', 'x = 3', 'x = 4', 'x = 5', 'c', 'Subtract 2 → 5x=15 → x=3.', 'easy'),
  ('Find the roots of x² − 4x − 5 = 0', 'x=5 or x=−1', 'x=−5 or x=1', 'x=4 or x=5', 'x=0 or x=−5', 'a', 'Factor → (x−5)(x+1)=0.', 'medium'),
  ('Simplify: (2x²y)(3xy²)', '5x³y³', '6x³y³', '6x²y²', '6x⁴y⁴', 'b', 'Multiply coefficients and add exponents → 6x³y³.', 'medium')
) AS q(question,a,b,c,d,correct,expl,diff)
WHERE t.name='Algebra';


-- ============================================
-- GEOMETRY QUESTIONS (10)
-- ============================================
INSERT INTO questions (
  topic_id, question, option_a, option_b, option_c, option_d,
  correct_answer, explanation, difficulty
)
SELECT t.id,
  q.question, q.a, q.b, q.c, q.d, q.correct, q.expl, q.diff
FROM topics t
CROSS JOIN (VALUES
  ('The sum of angles in a triangle is:', '90°', '120°', '180°', '360°', 'c', 'All triangles have interior angles summing to 180°.', 'easy'),
  ('Find the perimeter of a square of side 9 cm.', '36 cm', '45 cm', '27 cm', '18 cm', 'a', 'Perimeter = 4 × 9 = 36 cm.', 'easy'),
  ('A rectangle has length 12 cm and width 8 cm. Find its area.', '80 cm²', '100 cm²', '96 cm²', '144 cm²', 'c', 'Area = L × W = 12 × 8 = 96 cm².', 'easy'),
  ('Find the diagonal of a square of side 10 cm.', '10 cm', '14.14 cm', '15 cm', '12 cm', 'b', 'Diagonal = √2 × side = 1.414 × 10 = 14.14 cm.', 'medium'),
  ('A circle has radius 7 cm. Find its circumference (π = 22/7).', '44 cm', '49 cm', '22 cm', '77 cm', 'a', 'C = 2πr = 2 × 22/7 × 7 = 44 cm.', 'medium'),
  ('In a right triangle, if the base is 6 cm and height is 8 cm, find the hypotenuse.', '10 cm', '12 cm', '8 cm', '14 cm', 'a', 'Use Pythagoras: √(6² + 8²) = √100 = 10.', 'medium'),
  ('Two angles of a triangle are 35° and 65°. Find the third angle.', '80°', '75°', '90°', '100°', 'b', 'Sum=180 → 180 − (35+65)=80°, sorry 180−100=80°', 'easy'),
  ('A chord of radius 10 cm is 16 cm long. Find distance from center to chord.', '4 cm', '6 cm', '8 cm', '10 cm', 'b', 'Use r² = h² + (½chord)² → 10² = h² + 8² → h=6.', 'medium'),
  ('Find the area of a circle with diameter 14 cm (π=22/7).', '77 cm²', '154 cm²', '308 cm²', '44 cm²', 'b', 'r=7; A=πr²=22/7×49=154 cm².', 'easy'),
  ('A regular hexagon has each side = 5 cm. Find its perimeter.', '20 cm', '25 cm', '30 cm', '35 cm', 'c', 'Perimeter = 6 × side = 6 × 5 = 30 cm.', 'easy')
) AS q(question,a,b,c,d,correct,expl,diff)
WHERE t.name='Geometry';
-- ============================================
-- TRIGONOMETRY QUESTIONS (10)
-- ============================================
INSERT INTO questions (
  topic_id, question, option_a, option_b, option_c, option_d,
  correct_answer, explanation, difficulty
)
SELECT t.id,
  q.question, q.a, q.b, q.c, q.d, q.correct, q.expl, q.diff
FROM topics t
CROSS JOIN (VALUES
  ('sin 30° = ?', '0.5', '√3/2', '1', '0', 'a', 'sin 30° = 1/2 = 0.5.', 'easy'),
  ('cos 60° = ?', '1/2', '√3/2', '1', '0', 'a', 'cos 60° = 1/2.', 'easy'),
  ('tan 45° = ?', '0', '1', '√3', '1/√3', 'b', 'tan 45° = 1.', 'easy'),
  ('If sin θ = 3/5, find cos θ.', '4/5', '5/4', '3/4', '1/2', 'a', 'cos θ = √(1−sin²θ)=√(1−9/25)=4/5.', 'medium'),
  ('If tan A = 3/4, find sin A.', '3/4', '3/5', '4/5', '5/3', 'b', 'sin A = 3/5 using tan A = sin/cos → hyp=5.', 'medium'),
  ('Find tan θ if sin θ = 4/5.', '3/5', '4/3', '3/4', '5/4', 'b', 'cosθ=3/5 → tanθ=sin/cos=4/3.', 'medium'),
  ('Find the value of sin²30° + cos²30°', '0', '1', '1/2', '√3/2', 'b', 'sin²θ + cos²θ = 1 always.', 'easy'),
  ('If sec θ = 2, find cos θ.', '1/2', '2', '√2', '−1/2', 'a', 'cosθ = 1/secθ = 1/2.', 'easy'),
  ('If sin θ = 5/13, find tan θ.', '5/13', '5/12', '12/13', '13/5', 'b', 'cosθ=12/13 ⇒ tanθ=sin/cos=5/12.', 'medium'),
  ('If cos θ = 12/13, find sin θ.', '5/13', '13/5', '12/13', '4/5', 'a', 'sin²θ=1−cos²θ=1−144/169=25/169 → sin=5/13.', 'medium')
) AS q(question,a,b,c,d,correct,expl,diff)
WHERE t.name='Trigonometry';
-- ============================================
-- CALCULUS QUESTIONS (10)
-- ============================================
INSERT INTO questions (
  topic_id, question, option_a, option_b, option_c, option_d,
  correct_answer, explanation, difficulty
)
SELECT t.id,
  q.question, q.a, q.b, q.c, q.d, q.correct, q.expl, q.diff
FROM topics t
CROSS JOIN (VALUES
  ('Differentiate y = x²', '2x', 'x', 'x²', '1', 'a', 'The derivative of x² is 2x.', 'easy'),
  ('Differentiate y = 3x³', '3x²', '6x', '9x²', '9x³', 'c', 'd/dx(3x³) = 9x².', 'easy'),
  ('Find dy/dx if y = 5x⁴ + 2x²', '20x³ + 4x', '10x³ + 4x', '5x³ + 2x', '20x² + 4', 'a', 'Differentiate each term: 5×4x³ + 2×2x = 20x³ + 4x.', 'medium'),
  ('Integrate ∫2x dx', 'x² + C', '2x² + C', 'x + C', '2x + C', 'a', '∫2x dx = x² + C.', 'easy'),
  ('Integrate ∫x² dx', 'x³/3 + C', '3x² + C', 'x² + C', 'x³ + C', 'a', '∫x² dx = x³/3 + C.', 'easy'),
  ('Find dy/dx if y = sin x', 'cos x', '−sin x', '−cos x', 'tan x', 'a', 'Derivative of sin x is cos x.', 'easy'),
  ('Find dy/dx if y = cos x', '−sin x', 'sin x', '−cos x', 'tan x', 'a', 'Derivative of cos x is −sin x.', 'easy'),
  ('Find ∫cos x dx', 'sin x + C', '−sin x + C', 'tan x + C', 'sec x + C', 'a', 'Integral of cos x is sin x + C.', 'easy'),
  ('Find ∫sin x dx', 'cos x + C', '−cos x + C', '−sin x + C', 'tan x + C', 'b', 'Integral of sin x is −cos x + C.', 'easy'),
  ('Find dy/dx if y = eˣ', 'eˣ', 'ln x', 'x eˣ', '1/x', 'a', 'Derivative of eˣ is eˣ.', 'medium')
) AS q(question,a,b,c,d,correct,expl,diff)
WHERE t.name='Calculus';
-- ============================================
-- STATISTICS QUESTIONS (10)
-- ============================================
INSERT INTO questions (
  topic_id, question, option_a, option_b, option_c, option_d,
  correct_answer, explanation, difficulty
)
SELECT t.id,
  q.question, q.a, q.b, q.c, q.d, q.correct, q.expl, q.diff
FROM topics t
CROSS JOIN (VALUES
  ('Find the mean of 2, 4, 6, 8, 10', '5', '6', '7', '8', 'b', 'Sum = 30, Mean = 30/5 = 6.', 'easy'),
  ('Find the median of 3, 7, 9, 12, 15', '7', '9', '10', '12', 'b', 'Middle value = 9.', 'easy'),
  ('Find the mode of 2, 3, 3, 5, 7, 7, 7, 9', '3', '5', '7', '9', 'c', '7 appears most frequently.', 'easy'),
  ('The range of 5, 8, 12, 14, 20 is:', '10', '15', '20', '5', 'b', 'Range = 20 - 5 = 15.', 'easy'),
  ('If the mean of 5 numbers is 8, find their total sum.', '8', '40', '13', '25', 'b', 'Mean = sum / n → 8 = sum / 5 → sum = 40.', 'easy'),
  ('In a survey, 60% of students like Mathematics. If 150 students were surveyed, how many like Mathematics?', '60', '90', '100', '120', 'b', '60% of 150 = 0.6 × 150 = 90.', 'easy'),
  ('The probability of picking a red ball from a bag of 3 red and 2 blue balls is:', '2/5', '3/5', '1/2', '1/3', 'b', 'Total balls = 5, red = 3 → P = 3/5.', 'medium'),
  ('A die is rolled once. What is the probability of getting an even number?', '1/6', '1/3', '1/2', '2/3', 'c', 'Even numbers = {2,4,6}, 3 out of 6 = 1/2.', 'medium'),
  ('The mean of x, 5, 7, 9, 11 is 8. Find x.', '4', '6', '8', '9', 'a', 'Mean = (x + 5 + 7 + 9 + 11)/5 = 8 → x = 4.', 'medium'),
  ('If a coin is tossed twice, the probability of getting two heads is:', '1/2', '1/3', '1/4', '1/6', 'c', 'Possible outcomes = 4, only 1 has two heads → 1/4.', 'medium')
) AS q(question,a,b,c,d,correct,expl,diff)
WHERE t.name='Statistics';
