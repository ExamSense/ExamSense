-- ExamSense CBT Application - Quick Setup Schema
-- Minimal version for rapid deployment to Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subject_id, name)
);

-- Questions table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test history table
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
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topic performance table
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
    UNIQUE(test_id, topic_id)
);

-- Essential indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_topics_subject_id ON topics(subject_id);
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_test_history_user_id ON test_history(user_id);
CREATE INDEX idx_test_history_subject_id ON test_history(subject_id);
CREATE INDEX idx_topic_performance_test_id ON topic_performance(test_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_performance ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view subjects" ON subjects
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view topics" ON topics
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view questions" ON questions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own test history" ON test_history
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own topic performance" ON topic_performance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM test_history 
            WHERE test_history.id = topic_performance.test_id 
            AND test_history.user_id = auth.uid()
        )
    );