# ExamSense Database Schema

This directory contains the complete database schema for the ExamSense Computer-Based Testing (CBT) application, designed for Supabase.

## Files

- `schema.sql` - Complete database schema with all tables, indexes, RLS policies, and sample data
- `quick-setup.sql` - Minimal schema for rapid deployment
- `README.md` - This documentation file

## Database Structure

### Core Tables

1. **users** - User accounts with UUID primary keys
2. **subjects** - Academic subjects (Math, English, etc.)
3. **topics** - Sub-topics within subjects for granular tracking
4. **questions** - Multiple choice questions with 4 options
5. **test_history** - Records of completed tests
6. **topic_performance** - Performance breakdown by topic per test
7. **user_answers** - Individual question responses for analysis

### Key Features

- **UUID Support** - Uses UUID for user IDs for enhanced security
- **Foreign Key Constraints** - Proper relationships with cascading deletes
- **Row Level Security (RLS)** - Users can only access their own data
- **Automatic Timestamps** - Created/updated timestamps with triggers
- **Calculated Fields** - Automatic percentage calculations
- **Indexes** - Optimized for common query patterns
- **Sample Data** - Includes test data for development

## Setup Instructions

### Option 1: Full Setup (Recommended)
1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `schema.sql`
3. Execute the script

### Option 2: Quick Setup
1. Open Supabase SQL Editor
2. Copy and paste the contents of `quick-setup.sql`
3. Execute the script
4. Add your own sample data as needed

## Authentication Integration

This schema is designed to work with Supabase Auth:
- User IDs are UUIDs that match Supabase Auth user IDs
- RLS policies ensure users can only access their own test data
- Public tables (subjects, topics, questions) are readable by all authenticated users

## Usage Examples

### Creating a Test
```sql
-- Start a new test
INSERT INTO test_history (user_id, subject_id, total_questions)
VALUES (auth.uid(), 1, 20);

-- Record answers
INSERT INTO user_answers (test_id, question_id, selected_option, is_correct)
VALUES (1, 1, 'b', true);

-- Record topic performance
INSERT INTO topic_performance (test_id, topic_id, correct, total)
VALUES (1, 1, 8, 10);
```

### Querying Performance
```sql
-- Get user's test history
SELECT * FROM test_history WHERE user_id = auth.uid();

-- Get performance by subject
SELECT s.name, AVG(th.percentage) as avg_score
FROM test_history th
JOIN subjects s ON th.subject_id = s.id
WHERE th.user_id = auth.uid()
GROUP BY s.name;
```

## Security Features

- Row Level Security (RLS) enabled on all user-specific tables
- Users can only see their own test results and answers
- Subjects, topics, and questions are publicly readable (to authenticated users)
- Proper foreign key constraints prevent orphaned records

## Performance Considerations

- Indexes on frequently queried columns (user_id, subject_id, etc.)
- Calculated percentage fields for quick reporting
- Efficient query patterns for common operations

## Customization

The schema can be easily extended:
- Add more question types (true/false, fill-in-the-blank)
- Include multimedia questions (images, audio)
- Add difficulty levels and adaptive testing
- Include timing and analytics features
- Add question categories and tags

## Maintenance

- The schema includes automatic timestamp updates
- Cascading deletes maintain referential integrity
- Generated columns automatically calculate percentages
- Views provide convenient access to aggregated data