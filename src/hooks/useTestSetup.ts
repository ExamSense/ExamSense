import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAvailableSubjects, getSubjectStatistics } from '@/data/questionBank';
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
    const setupTest = () => {
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

      // Case 2: Validate subject is available in question bank
      const availableSubjects = getAvailableSubjects();
      const isSubjectAvailable = availableSubjects.some(
        s => s.toLowerCase() === subject.toLowerCase()
      );

      if (!isSubjectAvailable) {
        console.warn(`Subject "${subject}" is not available in question bank`);
        setError(`Sorry, ${subject} questions are not available yet. Please select another subject.`);
        setShowConfiguration(true);
        setInitialConfig(null);
        setIsLoading(false);
        return;
      }

      // Case 3: Valid subject - check if it has enough questions
      const stats = getSubjectStatistics(subject);
      
      if (stats.totalQuestions === 0) {
        console.warn(`Subject "${subject}" has no questions`);
        setError(`${subject} has no questions available yet. Please select another subject.`);
        setShowConfiguration(true);
        setInitialConfig(null);
        setIsLoading(false);
        return;
      }

      // Case 4: All valid - create default configuration
      console.log(`Valid subject "${subject}" selected from Subjects page`);
      
      // Determine default test settings based on available questions
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
    };

    // Small delay to prevent flash of loading state
    const timer = setTimeout(setupTest, 100);

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
export function getAvailableQuestionCount(subject: string): number {
  try {
    const stats = getSubjectStatistics(subject);
    return stats.totalQuestions;
  } catch (error) {
    console.error(`Error getting question count for ${subject}:`, error);
    return 0;
  }
}

/**
 * Helper function to validate if subject is available
 */
export function isSubjectAvailable(subject: string): boolean {
  const availableSubjects = getAvailableSubjects();
  return availableSubjects.some(
    s => s.toLowerCase() === subject.toLowerCase()
  );
}