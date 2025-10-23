// Usage Examples for ExamSense Question Functions
// This file demonstrates how to use the getRandomQuestions and related functions

import { 
  getRandomQuestions, 
  getRandomQuestionsByDifficulty,
  getMixedDifficultyQuestions,
  getQuestionsByTopics,
  calculateTestScore,
  validateAnswer 
} from './supabaseOperations.js'

// =============================================
// BASIC USAGE EXAMPLES
// =============================================

/**
 * Example 1: Get 10 random questions for a subject
 */
export const basicRandomQuestionsExample = async () => {
  try {
    const subjectId = 1 // Mathematics subject ID
    const result = await getRandomQuestions(subjectId, 10)
    
    if (result.success) {
      console.log('Questions retrieved:', result.data)
      console.log('Total questions:', result.total)
      
      // Access individual question data
      result.data.forEach((question, index) => {
        console.log(`Question ${index + 1}:`, {
          id: question.id,
          text: question.question,
          options: question.options,
          topic: question.topic.name,
          subject: question.subject.name,
          difficulty: question.difficulty
        })
      })
    } else {
      console.error('Error:', result.error)
    }
  } catch (error) {
    console.error('Failed to fetch questions:', error)
  }
}

/**
 * Example 2: Get questions by difficulty level
 */
export const difficultyBasedQuestionsExample = async () => {
  try {
    const subjectId = 1
    const hardQuestions = await getRandomQuestionsByDifficulty(subjectId, 'hard', 5)
    
    if (hardQuestions.success) {
      console.log('Hard questions:', hardQuestions.data)
    }
  } catch (error) {
    console.error('Error fetching hard questions:', error)
  }
}

/**
 * Example 3: Get mixed difficulty questions for adaptive testing
 */
export const adaptiveTestExample = async () => {
  try {
    const subjectId = 1
    const result = await getMixedDifficultyQuestions(subjectId, 20)
    
    if (result.success) {
      console.log('Mixed questions:', result.data)
      console.log('Distribution:', result.distribution)
      // Output: { easy: 8, medium: 8, hard: 4 }
    }
  } catch (error) {
    console.error('Error creating adaptive test:', error)
  }
}

// =============================================
// REACT COMPONENT EXAMPLES
// =============================================

/**
 * React Hook for fetching random questions
 */
import { useState, useEffect } from 'react'

export const useRandomQuestions = (subjectId, limit = 10) => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchQuestions = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getRandomQuestions(subjectId, limit)
      
      if (result.success) {
        setQuestions(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (subjectId) {
      fetchQuestions()
    }
  }, [subjectId, limit])

  return { questions, loading, error, refetch: fetchQuestions }
}

/**
 * React Component Example: Quiz Component
 */
export const QuizComponent = ({ subjectId }) => {
  const { questions, loading, error } = useRandomQuestions(subjectId, 10)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswerSelect = (selectedOption) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = selectedOption
    setUserAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Calculate and show results
      const results = calculateTestScore(questions, userAnswers)
      console.log('Test Results:', results)
      setShowResults(true)
    }
  }

  if (loading) return <div>Loading questions...</div>
  if (error) return <div>Error: {error}</div>
  if (!questions.length) return <div>No questions available</div>

  if (showResults) {
    const results = calculateTestScore(questions, userAnswers)
    return (
      <div>
        <h2>Test Results</h2>
        <p>Score: {results.correct}/{results.total} ({results.percentage}%)</p>
        {/* Display detailed results */}
      </div>
    )
  }

  return (
    <div>
      <div>Question {currentQuestionIndex + 1} of {questions.length}</div>
      <div>Topic: {currentQuestion.topic.name}</div>
      <div>Difficulty: {currentQuestion.difficulty}</div>
      
      <h3>{currentQuestion.question}</h3>
      
      <div>
        {Object.entries(currentQuestion.options).map(([key, value]) => (
          <label key={key}>
            <input
              type="radio"
              name="answer"
              value={key}
              checked={userAnswers[currentQuestionIndex] === key}
              onChange={() => handleAnswerSelect(key)}
            />
            {key.toUpperCase()}: {value}
          </label>
        ))}
      </div>
      
      <button 
        onClick={handleNext}
        disabled={!userAnswers[currentQuestionIndex]}
      >
        {currentQuestionIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
      </button>
    </div>
  )
}

// =============================================
// ADVANCED USAGE EXAMPLES
// =============================================

/**
 * Example 4: Create a complete test with scoring
 */
export const createCompleteTestExample = async () => {
  try {
    const subjectId = 1
    const limit = 15
    
    // Step 1: Fetch random questions
    const questionsResult = await getRandomQuestions(subjectId, limit)
    
    if (!questionsResult.success) {
      throw new Error(questionsResult.error)
    }
    
    const questions = questionsResult.data
    console.log(`Test created with ${questions.length} questions`)
    
    // Step 2: Simulate user answers (in real app, this comes from user input)
    const simulatedAnswers = questions.map(() => {
      const options = ['a', 'b', 'c', 'd']
      return options[Math.floor(Math.random() * options.length)]
    })
    
    // Step 3: Calculate score
    const results = calculateTestScore(questions, simulatedAnswers)
    
    console.log('Test Results:', {
      score: `${results.correct}/${results.total}`,
      percentage: `${results.percentage}%`,
      details: results.results
    })
    
    return results
    
  } catch (error) {
    console.error('Error creating test:', error)
  }
}

/**
 * Example 5: Progressive difficulty test
 */
export const progressiveDifficultyTest = async (subjectId) => {
  try {
    // Start with easy questions
    let currentDifficulty = 'easy'
    let questionsAnswered = 0
    let correctAnswers = 0
    const maxQuestions = 20
    
    while (questionsAnswered < maxQuestions) {
      // Get 5 questions of current difficulty
      const result = await getRandomQuestionsByDifficulty(subjectId, currentDifficulty, 5)
      
      if (!result.success || !result.data.length) {
        console.log(`No more ${currentDifficulty} questions available`)
        break
      }
      
      // Simulate answering questions
      result.data.forEach(question => {
        // Simulate 70% accuracy
        const isCorrect = Math.random() > 0.3
        if (isCorrect) correctAnswers++
        questionsAnswered++
        
        console.log(`Q${questionsAnswered}: ${question.question.substring(0, 50)}...`)
        console.log(`Difficulty: ${question.difficulty}, Correct: ${isCorrect}`)
      })
      
      // Adjust difficulty based on performance
      const accuracy = correctAnswers / questionsAnswered
      if (accuracy > 0.8 && currentDifficulty !== 'hard') {
        currentDifficulty = currentDifficulty === 'easy' ? 'medium' : 'hard'
        console.log(`Difficulty increased to: ${currentDifficulty}`)
      } else if (accuracy < 0.5 && currentDifficulty !== 'easy') {
        currentDifficulty = currentDifficulty === 'hard' ? 'medium' : 'easy'
        console.log(`Difficulty decreased to: ${currentDifficulty}`)
      }
    }
    
    return {
      totalQuestions: questionsAnswered,
      correctAnswers,
      finalAccuracy: correctAnswers / questionsAnswered,
      finalDifficulty: currentDifficulty
    }
    
  } catch (error) {
    console.error('Error in progressive difficulty test:', error)
  }
}

// =============================================
// UTILITY FUNCTIONS FOR QUESTION HANDLING
// =============================================

/**
 * Shuffle array of questions
 */
export const shuffleQuestions = (questions) => {
  return [...questions].sort(() => Math.random() - 0.5)
}

/**
 * Group questions by topic
 */
export const groupQuestionsByTopic = (questions) => {
  return questions.reduce((groups, question) => {
    const topicName = question.topic.name
    if (!groups[topicName]) {
      groups[topicName] = []
    }
    groups[topicName].push(question)
    return groups
  }, {})
}

/**
 * Filter questions by difficulty
 */
export const filterQuestionsByDifficulty = (questions, difficulty) => {
  return questions.filter(question => question.difficulty === difficulty)
}

/**
 * Get question statistics
 */
export const getQuestionStats = (questions) => {
  const stats = {
    total: questions.length,
    byDifficulty: { easy: 0, medium: 0, hard: 0 },
    byTopic: {},
    averageOptionsLength: 0
  }
  
  let totalOptionsLength = 0
  
  questions.forEach(question => {
    // Count by difficulty
    stats.byDifficulty[question.difficulty]++
    
    // Count by topic
    const topicName = question.topic.name
    stats.byTopic[topicName] = (stats.byTopic[topicName] || 0) + 1
    
    // Calculate average options length
    totalOptionsLength += Object.values(question.options).join('').length
  })
  
  stats.averageOptionsLength = Math.round(totalOptionsLength / questions.length)
  
  return stats
}