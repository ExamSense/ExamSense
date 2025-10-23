// TypeScript Interfaces for WASSCE Question Bank
import { mathematicsQuestions } from './mathematics';

/**
 * Difficulty levels for questions
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * Individual question interface
 */
export interface Question {
  id: number;
  subject: string;
  topic: string;
  difficulty: DifficultyLevel;
  question: string;
  options: [string, string, string, string]; // Exactly 4 options (A, B, C, D)
  correctAnswer: 0 | 1 | 2 | 3; // Index of correct answer (0-3)
  explanation?: string; // Optional explanation for the answer
}

/**
 * Questions grouped by subject
 */
export interface SubjectQuestions {
  subject: string;
  questions: Question[];
  totalQuestions: number;
  topics: string[]; // Unique topics in this subject
}

/**
 * Available WASSCE subjects
 */
export type WassceSubject = 
  | 'Mathematics'
  | 'English Language'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Economics'
  | 'Government'
  | 'Literature'
  | 'Geography'
  | 'Commerce';

/**
 * Filter options for questions
 */
export interface QuestionFilter {
  subject?: string;
  topic?: string;
  difficulty?: DifficultyLevel;
  limit?: number;
}

/**
 * Question bank object mapping subject names to their questions
 */
export const questionBank: Record<string, Question[]> = {
  'Mathematics': mathematicsQuestions,
  // Add more subjects here as they are created
  // 'Physics': physicsQuestions,
  // 'Chemistry': chemistryQuestions,
};

// Helper Functions

/**
 * Get all questions for a specific subject
 * @param subject - The subject name
 * @returns Array of questions for the subject, or empty array if not found
 */
export function getQuestionsBySubject(subject: string): Question[] {
  const normalizedSubject = Object.keys(questionBank).find(
    key => key.toLowerCase() === subject.toLowerCase()
  );
  
  return normalizedSubject ? questionBank[normalizedSubject] : [];
}

/**
 * Get all available subjects in the question bank
 * @returns Array of available subject names
 */
export function getAvailableSubjects(): string[] {
  return Object.keys(questionBank);
}

/**
 * Get all unique topics for a subject
 * @param subject - The subject name
 * @returns Array of unique topic names, or empty array if subject not found
 */
export function getTopicsForSubject(subject: string): string[] {
  const questions = getQuestionsBySubject(subject);
  
  if (questions.length === 0) {
    return [];
  }
  
  return Array.from(new Set(questions.map(q => q.topic)));
}

/**
 * Shuffle questions and return a random subset
 * @param questions - Array of questions to shuffle
 * @param count - Number of questions to return
 * @returns Array of randomly selected questions
 */
export function shuffleQuestions(questions: Question[], count: number): Question[] {
  if (questions.length === 0) {
    return [];
  }

  // Fisher-Yates shuffle algorithm
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Filter questions by multiple criteria
 * @param filters - Object containing filter criteria
 * @returns Array of filtered questions
 */
export function filterQuestions(filters: QuestionFilter): Question[] {
  let filtered: Question[] = [];

  // Get questions from all subjects or specific subject
  if (filters.subject) {
    filtered = getQuestionsBySubject(filters.subject);
  } else {
    // Get all questions from all subjects
    filtered = Object.values(questionBank).flat();
  }

  // Filter by topic
  if (filters.topic) {
    filtered = filtered.filter(
      q => q.topic.toLowerCase() === filters.topic!.toLowerCase()
    );
  }

  // Filter by difficulty
  if (filters.difficulty) {
    filtered = filtered.filter(
      q => q.difficulty === filters.difficulty
    );
  }

  // Limit results
  if (filters.limit && filters.limit > 0) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

/**
 * Get questions by topic within a subject
 * @param subject - The subject name
 * @param topic - The topic name
 * @returns Array of questions matching the criteria
 */
export function getQuestionsByTopic(subject: string, topic: string): Question[] {
  const questions = getQuestionsBySubject(subject);
  
  return questions.filter(
    q => q.topic.toLowerCase() === topic.toLowerCase()
  );
}

/**
 * Get a random set of questions for practice
 * @param subject - The subject name
 * @param count - Number of questions to retrieve
 * @param difficulty - Optional difficulty filter
 * @returns Array of random questions
 */
export function getRandomQuestions(
  subject: string,
  count: number,
  difficulty?: DifficultyLevel
): Question[] {
  let pool = getQuestionsBySubject(subject);

  if (pool.length === 0) {
    return [];
  }

  if (difficulty) {
    pool = pool.filter(q => q.difficulty === difficulty);
  }

  return shuffleQuestions(pool, count);
}

/**
 * Get question by ID
 * @param id - The question ID
 * @returns Question object or undefined if not found
 */
export function getQuestionById(id: number): Question | undefined {
  const allQuestions = Object.values(questionBank).flat();
  return allQuestions.find(q => q.id === id);
}

/**
 * Get questions statistics for a subject
 * @param subject - The subject name
 * @returns Object with statistics about the questions
 */
export function getSubjectStatistics(subject: string) {
  const questions = getQuestionsBySubject(subject);

  if (questions.length === 0) {
    return {
      totalQuestions: 0,
      difficultyDistribution: { easy: 0, medium: 0, hard: 0 },
      topicDistribution: {},
      topics: []
    };
  }

  const difficultyCount = {
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length
  };

  const topics = getTopicsForSubject(subject);
  const topicCount = topics.reduce((acc, topic) => {
    acc[topic] = questions.filter(q => q.topic === topic).length;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalQuestions: questions.length,
    difficultyDistribution: difficultyCount,
    topicDistribution: topicCount,
    topics
  };
}

/**
 * Validate a user's answer
 * @param questionId - The question ID
 * @param userAnswer - The user's answer index (0-3)
 * @returns Object with validation result
 */
export function validateAnswer(questionId: number, userAnswer: number) {
  const question = getQuestionById(questionId);
  
  if (!question) {
    return {
      isValid: false,
      error: 'Question not found'
    };
  }

  const isCorrect = question.correctAnswer === userAnswer;

  return {
    isValid: true,
    isCorrect,
    correctAnswer: question.correctAnswer,
    correctOption: question.options[question.correctAnswer],
    userOption: question.options[userAnswer],
    explanation: question.explanation
  };
}

// Export types and constants
export const WASSCE_SUBJECTS: WassceSubject[] = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Literature',
  'Geography',
  'Commerce'
];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ['easy', 'medium', 'hard'];