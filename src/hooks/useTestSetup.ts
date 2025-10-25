import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSubjects, getSubjectStatistics } from '@/lib/supabaseOperations.js';
import { TestConfig } from '@/components/TestConfiguration';

/**
 * Return type for useTestSetup hook
 */
interface TestSetupResult {
  showConfiguration: boolean;
  initialConfig: TestConfig | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Location state interface from Subjects page
 */
interface LocationState {
  discipline?: string;
  subject?: string;
}

/**
 * Custom hook to setup test configuration
 * Checks if user came from Subjects page with pre-selected subject
 * or needs to configure test manually
 */
export function useTestSetup(): TestSetupResult {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [initialConfig, setInitialConfig] = useState<TestConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupTest = async () => {
      setIsLoading(true);
      setError(null);

      // Get state from navigation
      const state = location.state as LocationState | null;

      // Case 1: No state provided - show configuration
      if (!state || !state.discipline || !state.subject) {
        console.log('No navigation state found - showing configuration form');
        setShowConfiguration(true);
        setInitialConfig(null);
        setIsLoading(false);
        return;
      }

      const { discipline, subject } = state;

      try {
        // Fetch available subjects from Supabase
        const subjects = await getSubjects();
        const availableSubjects = (subjects || []).map((s: any) => s.name.toString());

        const isSubjectAvailable = availableSubjects.some(
          (s: string) => s.toLowerCase() === subject.toLowerCase()
        );

        if (!isSubjectAvailable) {
          console.warn(`Subject "${subject}" is not available in Supabase`);
          setError(`Sorry, ${subject} questions are not available yet. Please select another subject.`);
          setShowConfiguration(true);
          setInitialConfig(null);
          setIsLoading(false);
          return;
        }

        // Get stats from Supabase (async)
        const stats = await getSubjectStatistics(subject);

        if (!stats || stats.totalQuestions === 0) {
          console.warn(`Subject "${subject}" has no questions in Supabase`);
          setError(`${subject} has no questions available yet. Please select another subject.`);
          setShowConfiguration(true);
          setInitialConfig(null);
          setIsLoading(false);
          return;
        }

        // Determine default question count
        const defaultQuestions = stats.totalQuestions >= 100 ? 100 : 
                                 stats.totalQuestions >= 50 ? 50 : 
                                 stats.totalQuestions >= 20 ? 20 : 
                                 stats.totalQuestions;

        const config: TestConfig = {
          discipline,
          subject,
          numberOfQuestions: defaultQuestions,
          duration: 60 // Default to 60 minutes
        };

        setInitialConfig(config);
        setShowConfiguration(false);
        setIsLoading(false);

        console.log('Test configuration ready:', config);
      } catch (err) {
        console.error('Error setting up test from Supabase:', err);
        setError('Failed to prepare test configuration. Please try again.');
        setShowConfiguration(true);
        setInitialConfig(null);
        setIsLoading(false);
      }
    };

    // Small delay to prevent flash of loading state
    const timer = setTimeout(() => { void setupTest(); }, 100);

    return () => clearTimeout(timer);
  }, [location.state]);

  return {
    showConfiguration,
    initialConfig,
    isLoading,
    error
  };
}

/**
 * Helper function to validate discipline name
 */
export function isValidDiscipline(discipline: string): boolean {
  const validDisciplines = ['science', 'arts', 'commercial'];
  return validDisciplines.includes(discipline.toLowerCase());
}

/**
 * Helper function to get question count for a subject
 */
export async function getAvailableQuestionCount(subject: string): Promise<number> {
  try {
    const stats = await getSubjectStatistics(subject);
    return stats?.totalQuestions || 0;
  } catch (error) {
    console.error(`Error getting question count for ${subject}:`, error);
    return 0;
  }
}

/**
 * Helper function to validate if subject is available
 */
export async function isSubjectAvailable(subject: string): Promise<boolean> {
  try {
    const subjects = await getSubjects();
    const availableSubjects = (subjects || []).map((s: any) => s.name?.toString() || s);
    return availableSubjects.some((s: string) => s.toLowerCase() === subject.toLowerCase());
  } catch (error) {
    console.error('Error checking subject availability:', error);
    return false;
  }
}