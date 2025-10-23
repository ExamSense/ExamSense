import { useState, useEffect } from 'react';
import type { TestConfig } from '@/components/TestConfiguration';
import {
  getQuestionsBySubject,
  getAvailableSubjects,
  shuffleQuestions,
  type Question
} from '@/data/questionBank';

/**
 * Return type for useQuestions hook
 */
interface UseQuestionsResult {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  availableSubjects: string[];
}

/**
 * Custom hook to fetch and manage questions for a test
 * 
 * @param config - Test configuration containing subject and questionCount
 * @returns Object containing questions, loading state, error, and available subjects
 * 
 * @example
 * ```tsx
 * const { questions, isLoading, error, availableSubjects } = useQuestions({
 *   subject: 'Mathematics',
 *   numberOfQuestions: 20,
 *   discipline: 'science',
 *   duration: 30
 * });
 * ```
 */
export function useQuestions(config: TestConfig): UseQuestionsResult {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSubjects] = useState<string[]>(() => getAvailableSubjects());

  useEffect(() => {
    const fetchQuestions = () => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate subject is provided
        if (!config.subject) {
          setError('Please select a subject to continue.');
          setQuestions([]);
          setIsLoading(false);
          return;
        }

        // Check if subject is available in question bank
        const isSubjectAvailable = availableSubjects.some(
          s => s.toLowerCase() === config.subject.toLowerCase()
        );

        if (!isSubjectAvailable) {
          setError(
            `Questions for ${config.subject} are not available yet. Try Mathematics or English Language.`
          );
          setQuestions([]);
          setIsLoading(false);
          return;
        }

        // Fetch questions for the subject
        const subjectQuestions = getQuestionsBySubject(config.subject);

        // Check if questions exist for the subject
        if (subjectQuestions.length === 0) {
          setError(
            `Questions for ${config.subject} are not available yet. Try Mathematics or English Language.`
          );
          setQuestions([]);
          setIsLoading(false);
          return;
        }

        // Check if we have enough questions
        if (subjectQuestions.length < config.numberOfQuestions) {
          console.warn(
            `Requested ${config.numberOfQuestions} questions but only ${subjectQuestions.length} available for ${config.subject}`
          );
        }

        // Shuffle and return requested count
        const selectedQuestions = shuffleQuestions(
          subjectQuestions,
          config.numberOfQuestions
        );

        setQuestions(selectedQuestions);
        setError(null);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(
          `An error occurred while loading questions. Please try again.`
        );
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [config.subject, config.numberOfQuestions, availableSubjects]);

  return {
    questions,
    isLoading,
    error,
    availableSubjects
  };
}

/**
 * Helper function to check if a subject has questions available
 * @param subject - The subject name to check
 * @returns boolean indicating if subject is available
 */
export function hasQuestionsAvailable(subject: string): boolean {
  const availableSubjects = getAvailableSubjects();
  return availableSubjects.some(
    s => s.toLowerCase() === subject.toLowerCase()
  );
}

/**
 * Helper function to get question count for a subject
 * @param subject - The subject name
 * @returns number of questions available for the subject
 */
export function getQuestionCount(subject: string): number {
  const questions = getQuestionsBySubject(subject);
  return questions.length;
}