import { useState, useEffect } from 'react';
import type { TestConfig } from '@/components/TestConfiguration';
import {
  getSubjects,
  getRandomQuestions,
  getSubjectStatistics
} from '@/lib/supabaseOperations';
import type { Question } from '@/data/questionBank';

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
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Load available subjects from Supabase for consumers of this hook
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const subs = await getSubjects();
        const names = (subs || []).map((s: any) => s.name?.toString() || s);
        if (!mounted) return;
        setAvailableSubjects(names);
      } catch (err) {
        console.error('Failed to load subjects in useQuestions:', err);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!config.subject) {
          setError('Please select a subject to continue.');
          setQuestions([]);
          setIsLoading(false);
          return;
        }

        // Find subject id from Supabase subjects
        const subs = await getSubjects();
        const match = (subs || []).find((s: any) => (s.name || '').toLowerCase() === config.subject.toLowerCase());
        if (!match) {
          setError(`Questions for ${config.subject} are not available yet.`);
          setQuestions([]);
          setIsLoading(false);
          return;
        }

        // Fetch random questions from Supabase for the subject id
        const res = await getRandomQuestions(match.id, config.numberOfQuestions);
        if (!res || !res.success) {
          setError(res?.error || 'Failed to fetch questions from server.');
          setQuestions([]);
          setIsLoading(false);
          return;
        }

        // Map Supabase question shape to local Question type
        const mapped: Question[] = (res.data || []).map((q: any) => {
          const optionsArray: [string,string,string,string] = [
            q.options?.a ?? '',
            q.options?.b ?? '',
            q.options?.c ?? '',
            q.options?.d ?? ''
          ];

          const correct = (() => {
            const co = q.correctOption;
            if (typeof co === 'string') {
              const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
              return map[co.toLowerCase()] ?? 0;
            }
            if (typeof co === 'number') return co;
            return 0;
          })();

          return {
            id: q.id,
            subject: q.subject?.name || config.subject,
            topic: q.topic?.name || q.topic?.name || 'General',
            difficulty: q.difficulty || 'easy',
            question: q.question,
            options: optionsArray,
            correctAnswer: correct as 0|1|2|3,
            explanation: q.explanation || ''
          } as Question;
        });

        setQuestions(mapped);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching questions from Supabase:', err);
        setError(`An error occurred while loading questions. ${err?.message || ''}`);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchQuestions();
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
export async function hasQuestionsAvailable(subject: string): Promise<boolean> {
  try {
    const subs = await getSubjects();
    const names = (subs || []).map((s: any) => s.name?.toString() || s);
    return names.some((s: string) => s.toLowerCase() === subject.toLowerCase());
  } catch (err) {
    console.error('Error checking subject availability:', err);
    return false;
  }
}

/**
 * Helper function to get question count for a subject
 * @param subject - The subject name
 * @returns number of questions available for the subject
 */
export async function getQuestionCount(subject: string): Promise<number> {
  try {
    const stats = await getSubjectStatistics(subject);
    return stats?.totalQuestions || 0;
  } catch (err) {
    console.error('Error getting question count:', err);
    return 0;
  }
}