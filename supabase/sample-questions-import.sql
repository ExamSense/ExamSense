-- Sample Questions Import Script for Supabase
-- Run this in Supabase SQL Editor to add sample questions

-- First, add subjects
INSERT INTO subjects (name, description) VALUES
('Mathematics', 'Mathematical concepts and problem-solving'),
('English Language', 'Grammar, comprehension, and vocabulary'),
('General Knowledge', 'Current affairs and general information')
ON CONFLICT (name) DO NOTHING;

-- Get subject IDs (you'll need these for topics)
-- Mathematics ID will be used below

-- Add topics (replace subject_id with actual IDs from your subjects table)
INSERT INTO topics (subject_id, name, description) VALUES
(1, 'Algebra', 'Algebraic equations and expressions'),
(1, 'Geometry', 'Shapes, angles, and spatial reasoning'),
(1, 'Arithmetic', 'Basic calculations and number operations'),
(2, 'Grammar', 'Parts of speech and sentence structure'),
(2, 'Vocabulary', 'Word meanings and usage'),
(3, 'Current Affairs', 'Recent events and news'),
(3, 'History', 'Historical facts and events')
ON CONFLICT DO NOTHING;

-- Add sample Mathematics questions
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
-- Algebra questions
(1, 'Solve for x: 2x + 5 = 15', 'x = 3', 'x = 5', 'x = 7', 'x = 10', 'b', '2x + 5 = 15, subtract 5: 2x = 10, divide by 2: x = 5', 'medium'),
(1, 'What is the value of x in: x - 3 = 7?', 'x = 4', 'x = 10', 'x = 11', 'x = 15', 'b', 'x - 3 = 7, add 3 to both sides: x = 10', 'easy'),
(1, 'Simplify: 3x + 2x', '5x', '6x', 'x', '5x²', 'a', 'Combine like terms: 3x + 2x = 5x', 'easy'),

-- Arithmetic questions  
(3, 'What is 15 × 12?', '150', '180', '200', '220', 'b', '15 × 12 = 180', 'easy'),
(3, 'Calculate: 144 ÷ 12', '10', '12', '14', '16', 'b', '144 divided by 12 equals 12', 'easy'),
(3, 'What is 25% of 200?', '25', '50', '75', '100', 'b', '25% = 1/4, so 200 ÷ 4 = 50', 'medium'),

-- Geometry questions
(2, 'What is the sum of angles in a triangle?', '90°', '180°', '270°', '360°', 'b', 'The sum of all interior angles in a triangle is always 180°', 'easy'),
(2, 'What is the area of a rectangle with length 5cm and width 3cm?', '8 cm²', '15 cm²', '16 cm²', '20 cm²', 'b', 'Area = length × width = 5 × 3 = 15 cm²', 'easy'),
(2, 'What is the perimeter of a square with side 4cm?', '8 cm', '12 cm', '16 cm', '20 cm', 'c', 'Perimeter = 4 × side = 4 × 4 = 16 cm', 'easy');

-- Add sample English Language questions
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
-- Grammar questions
(4, 'Which is the correct sentence?', 'He go to school', 'He goes to school', 'He going to school', 'He gone to school', 'b', 'Subject-verb agreement: third person singular uses "goes"', 'easy'),
(4, 'Identify the noun in: "The cat runs quickly"', 'The', 'cat', 'runs', 'quickly', 'b', '"Cat" is a noun (naming word)', 'easy'),
(4, 'Which word is an adjective: "The beautiful flower bloomed"?', 'The', 'beautiful', 'flower', 'bloomed', 'b', '"Beautiful" describes the flower, making it an adjective', 'easy'),

-- Vocabulary questions
(5, 'What does "abundant" mean?', 'Scarce', 'Plentiful', 'Empty', 'Rare', 'b', 'Abundant means existing in large quantities; plentiful', 'medium'),
(5, 'What is a synonym for "happy"?', 'Sad', 'Joyful', 'Angry', 'Tired', 'b', 'Joyful means the same as happy', 'easy'),
(5, 'What does "benevolent" mean?', 'Evil', 'Kind', 'Strict', 'Lazy', 'b', 'Benevolent means kind and generous', 'medium');

-- Add sample General Knowledge questions
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
-- Current Affairs (you should update these regularly)
(6, 'How many continents are there?', '5', '6', '7', '8', 'c', 'There are 7 continents: Africa, Antarctica, Asia, Europe, North America, Oceania, South America', 'easy'),
(6, 'What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'c', 'Paris is the capital and most populous city of France', 'easy'),
(6, 'Which planet is known as the Red Planet?', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'b', 'Mars appears red due to iron oxide on its surface', 'easy'),

-- History questions
(7, 'In which year did World War II end?', '1943', '1944', '1945', '1946', 'c', 'World War II ended in 1945 with the surrender of Japan', 'medium'),
(7, 'Who was the first President of the United States?', 'Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'John Adams', 'b', 'George Washington served as the first U.S. President from 1789-1797', 'easy'),
(7, 'Which ancient wonder of the world still exists today?', 'Hanging Gardens of Babylon', 'Great Pyramid of Giza', 'Colossus of Rhodes', 'Lighthouse of Alexandria', 'b', 'The Great Pyramid of Giza is the only ancient wonder still standing', 'medium');

-- Add more questions as needed
-- You can add hundreds or thousands of questions this way
