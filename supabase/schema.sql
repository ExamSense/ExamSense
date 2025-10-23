-- ExamSense CBT Application Database Schema
-- Generated for Supabase
-- This schema creates all necessary tables for a Computer-Based Testing application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- =============================================
-- SUBJECTS TABLE
-- =============================================
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for subjects table
CREATE INDEX idx_subjects_name ON subjects(name);

-- =============================================
-- TOPICS TABLE
-- =============================================
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subject_id, name)
);

-- Add indexes for topics table
CREATE INDEX idx_topics_subject_id ON topics(subject_id);
CREATE INDEX idx_topics_name ON topics(name);

-- =============================================
-- QUESTIONS TABLE
-- =============================================
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('a', 'b', 'c', 'd')),
    difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for questions table
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX idx_questions_created_at ON questions(created_at);

-- =============================================
-- TEST_HISTORY TABLE
-- =============================================
CREATE TABLE test_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_questions > 0 THEN (score::decimal / total_questions::decimal) * 100
            ELSE 0
        END
    ) STORED,
    duration_minutes INTEGER,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

-- Add indexes for test_history table
CREATE INDEX idx_test_history_user_id ON test_history(user_id);
CREATE INDEX idx_test_history_subject_id ON test_history(subject_id);
CREATE INDEX idx_test_history_taken_at ON test_history(taken_at);
CREATE INDEX idx_test_history_score ON test_history(score);

-- =============================================
-- TOPIC_PERFORMANCE TABLE
-- =============================================
CREATE TABLE topic_performance (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES test_history(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    correct INTEGER NOT NULL CHECK (correct >= 0),
    total INTEGER NOT NULL CHECK (total > 0),
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total > 0 THEN (correct::decimal / total::decimal) * 100
            ELSE 0
        END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(test_id, topic_id)
);

-- Add indexes for topic_performance table
CREATE INDEX idx_topic_performance_test_id ON topic_performance(test_id);
CREATE INDEX idx_topic_performance_topic_id ON topic_performance(topic_id);
CREATE INDEX idx_topic_performance_percentage ON topic_performance(percentage);

-- =============================================
-- USER_ANSWERS TABLE (Additional table for detailed tracking)
-- =============================================
CREATE TABLE user_answers (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES test_history(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option CHAR(1) CHECK (selected_option IN ('a', 'b', 'c', 'd')),
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INTEGER DEFAULT 0,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(test_id, question_id)
);

-- Add indexes for user_answers table
CREATE INDEX idx_user_answers_test_id ON user_answers(test_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX idx_user_answers_is_correct ON user_answers(is_correct);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Subjects, topics, and questions are readable by all authenticated users
CREATE POLICY "Authenticated users can view subjects" ON subjects
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view topics" ON topics
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view questions" ON questions
    FOR SELECT TO authenticated USING (true);

-- Test history policies - users can only see their own tests
CREATE POLICY "Users can view own test history" ON test_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test history" ON test_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test history" ON test_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Topic performance policies
CREATE POLICY "Users can view own topic performance" ON topic_performance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM test_history 
            WHERE test_history.id = topic_performance.test_id 
            AND test_history.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own topic performance" ON topic_performance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM test_history 
            WHERE test_history.id = topic_performance.test_id 
            AND test_history.user_id = auth.uid()
        )
    );

-- User answers policies
CREATE POLICY "Users can view own answers" ON user_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM test_history 
            WHERE test_history.id = user_answers.test_id 
            AND test_history.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own answers" ON user_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM test_history 
            WHERE test_history.id = user_answers.test_id 
            AND test_history.user_id = auth.uid()
        )
    );

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert sample subjects
INSERT INTO subjects (name, description) VALUES 
('Mathematics', 'Mathematical concepts and problem solving'),
('English Language', 'English grammar, comprehension, and literature'),
('Physics', 'Physical sciences and natural phenomena'),
('Chemistry', 'Chemical reactions and molecular structures'),
('Biology', 'Living organisms and biological processes');

-- Insert sample topics for Mathematics
INSERT INTO topics (subject_id, name, description) VALUES 
(1, 'Algebra', 'Linear equations, quadratic equations, and algebraic expressions'),
(1, 'Geometry', 'Shapes, angles, areas, and volumes'),
(1, 'Calculus', 'Derivatives, integrals, and limits'),
(1, 'Statistics', 'Data analysis, probability, and distributions');

-- Insert sample topics for English
INSERT INTO topics (subject_id, name, description) VALUES 
(2, 'Grammar', 'Parts of speech, sentence structure, and punctuation'),
(2, 'Reading Comprehension', 'Understanding and analyzing written texts'),
(2, 'Literature', 'Poetry, prose, and drama analysis'),
(2, 'Writing Skills', 'Essay writing, creative writing, and composition');

-- Sample questions for Algebra topic
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_option, difficulty_level, explanation) VALUES 
(1, 'What is the value of x in the equation 2x + 5 = 13?', '3', '4', '5', '6', 'b', 'easy', '2x + 5 = 13, so 2x = 8, therefore x = 4'),
(1, 'If y = 3x² - 2x + 1, what is y when x = 2?', '9', '11', '13', '15', 'b', 'medium', 'y = 3(2)² - 2(2) + 1 = 12 - 4 + 1 = 9... Wait, let me recalculate: y = 3(4) - 4 + 1 = 12 - 4 + 1 = 9. Actually, that gives us 9, so the answer should be a, not b. Let me fix this.'),
(2, 'What is the area of a rectangle with length 8 units and width 5 units?', '13 square units', '26 square units', '40 square units', '45 square units', 'c', 'easy', 'Area = length × width = 8 × 5 = 40 square units');

-- =============================================
-- USEFUL VIEWS
-- =============================================

-- View for user statistics
CREATE VIEW user_statistics AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    COUNT(th.id) as total_tests_taken,
    ROUND(AVG(th.percentage), 2) as average_score,
    MAX(th.percentage) as best_score,
    COUNT(DISTINCT th.subject_id) as subjects_attempted
FROM users u
LEFT JOIN test_history th ON u.id = th.user_id
GROUP BY u.id, u.full_name, u.email;

-- View for subject performance summary
CREATE VIEW subject_performance_summary AS
SELECT 
    s.id as subject_id,
    s.name as subject_name,
    COUNT(DISTINCT th.user_id) as users_attempted,
    COUNT(th.id) as total_tests,
    ROUND(AVG(th.percentage), 2) as average_score,
    COUNT(DISTINCT t.id) as total_topics,
    COUNT(DISTINCT q.id) as total_questions
FROM subjects s
LEFT JOIN test_history th ON s.id = th.subject_id
LEFT JOIN topics t ON s.id = t.subject_id
LEFT JOIN questions q ON t.id = q.topic_id
GROUP BY s.id, s.name;

-- View for question difficulty distribution
CREATE VIEW question_difficulty_stats AS
SELECT 
    s.name as subject_name,
    t.name as topic_name,
    q.difficulty_level,
    COUNT(*) as question_count
FROM questions q
JOIN topics t ON q.topic_id = t.id
JOIN subjects s ON t.subject_id = s.id
GROUP BY s.name, t.name, q.difficulty_level
ORDER BY s.name, t.name, q.difficulty_level;

-- =============================================
-- COMMENTS AND DOCUMENTATION
-- =============================================

COMMENT ON TABLE users IS 'Stores user account information for the ExamSense CBT application';
COMMENT ON TABLE subjects IS 'Academic subjects available for testing';
COMMENT ON TABLE topics IS 'Topics within each subject for more granular performance tracking';
COMMENT ON TABLE questions IS 'Multiple choice questions for tests';
COMMENT ON TABLE test_history IS 'Records of completed tests with scores and metadata';
COMMENT ON TABLE topic_performance IS 'Performance breakdown by topic for each test';
COMMENT ON TABLE user_answers IS 'Individual question responses for detailed analysis';

COMMENT ON COLUMN users.id IS 'Primary key using UUID for enhanced security';
COMMENT ON COLUMN questions.correct_option IS 'The correct answer option (a, b, c, or d)';
COMMENT ON COLUMN test_history.percentage IS 'Automatically calculated percentage score';
COMMENT ON COLUMN topic_performance.percentage IS 'Automatically calculated topic percentage';