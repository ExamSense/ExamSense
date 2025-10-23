// Example integration hooks for your existing React components
import { useState, useEffect } from 'react';
import { getSubjects, getTopics, getRandomQuestions } from '../services/questionService';
import { saveTestResult, getUserTestHistory, getTopicPerformance } from '../services/testService';
import { signIn, signUp, signOut, getCurrentUser } from '../services/authService';

/**
 * Hook for authentication (replacement for your AuthContext)
 */
export const useSupabaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn(email, password);
      setUser(result.user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signUp(email, password, userData);
      if (result.user) setUser(result.user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };
};

/**
 * Hook for fetching subjects
 */
export const useSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjects();
        setSubjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return { subjects, loading, error };
};

/**
 * Hook for fetching topics by subject
 */
export const useTopics = (subjectId) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subjectId) return;

    const fetchTopics = async () => {
      setLoading(true);
      try {
        const data = await getTopics(subjectId);
        setTopics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [subjectId]);

  return { topics, loading, error };
};

/**
 * Hook for fetching random questions
 */
export const useQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuestions = async (filters) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getRandomQuestions(filters);
      setQuestions(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { questions, loading, error, fetchQuestions };
};

/**
 * Hook for saving test results
 */
export const useTestResult = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const saveResult = async (testData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await saveTestResult(testData);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, saveResult };
};

/**
 * Hook for user test history
 */
export const useTestHistory = (userId) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getUserTestHistory(userId, filters);
      setHistory(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  return { history, loading, error, fetchHistory };
};

/**
 * Hook for topic performance
 */
export const useTopicPerformance = (userId, subjectId) => {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchPerformance = async () => {
      setLoading(true);
      try {
        const data = await getTopicPerformance(userId, subjectId);
        setPerformance(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [userId, subjectId]);

  return { performance, loading, error };
};

// Example usage in your components:

/*
// In your Login component:
export default function Login() {
  const { login, loading, error } = useSupabaseAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/subjects');
    } catch (err) {
      // Error is already set in the hook
      console.error('Login failed:', err);
    }
  };
  
  // ... rest of component
}

// In your Subjects component:
export default function Subjects() {
  const { subjects, loading, error } = useSubjects();
  
  if (loading) return <div>Loading subjects...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {subjects.map(subject => (
        <div key={subject.id}>{subject.name}</div>
      ))}
    </div>
  );
}

// In your Test component:
export default function Test() {
  const { user } = useSupabaseAuth();
  const { fetchQuestions, questions, loading } = useQuestions();
  const { saveResult } = useTestResult();
  
  const startTest = async (subjectId, topicId) => {
    await fetchQuestions({ subjectId, topicId, limit: 10 });
  };
  
  const submitTest = async (userAnswers) => {
    const testData = {
      userId: user.id,
      subjectId: selectedSubject.id,
      topicId: selectedTopic?.id,
      questions,
      userAnswers
    };
    
    const result = await saveResult(testData);
    // Handle result...
  };
  
  // ... rest of component
}

// In your History component:
export default function History() {
  const { user } = useSupabaseAuth();
  const { history, loading, error } = useTestHistory(user?.id);
  
  if (loading) return <div>Loading history...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {history.map(test => (
        <div key={test.id}>
          {test.subjects.name} - {test.percentage}% - {test.date_taken}
        </div>
      ))}
    </div>
  );
}
*/