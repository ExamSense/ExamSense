// Usage Examples for saveTestResult Function
// This file demonstrates how to use the saveTestResult function in ExamSense

import { saveTestResult, saveQuickTestResult, formatTestResults } from './supabaseOperations.js'
import { getCurrentUser } from './auth.js'

// =============================================
// BASIC USAGE EXAMPLES
// =============================================

/**
 * Example 1: Save test result with manual result formatting
 */
export const basicSaveTestExample = async () => {
  try {
    const user = await getCurrentUser()
    if (!user.success) throw new Error('User not authenticated')

    const userId = user.user.id
    const subjectId = 1 // Mathematics

    // Mock test results data
    const results = [
      {
        questionId: 1,
        topicId: 1,
        topicName: 'Algebra',
        question: 'What is 2x + 3 = 7?',
        selectedAnswer: 'b',
        correctAnswer: 'b',
        isCorrect: true,
        explanation: 'Solve for x: 2x = 4, so x = 2',
        timeSpent: 45,
        difficulty: 'easy'
      },
      {
        questionId: 2,
        topicId: 1,
        topicName: 'Algebra',
        question: 'What is the value of x in 3x - 5 = 10?',
        selectedAnswer: 'a',
        correctAnswer: 'c',
        isCorrect: false,
        explanation: '3x = 15, so x = 5',
        timeSpent: 60,
        difficulty: 'medium'
      },
      {
        questionId: 3,
        topicId: 2,
        topicName: 'Geometry',
        question: 'What is the area of a circle with radius 5?',
        selectedAnswer: 'd',
        correctAnswer: 'd',
        isCorrect: true,
        explanation: 'Area = πr² = π × 25 = 25π',
        timeSpent: 90,
        difficulty: 'medium'
      }
    ]

    const options = {
      durationMinutes: 15
    }

    const result = await saveTestResult(userId, subjectId, results, options)
    
    if (result.success) {
      console.log('Test saved successfully!')
      console.log('Test ID:', result.testId)
      console.log('Score:', result.score)
      console.log('Topic Performance:', result.topicPerformance)
      console.log('Summary:', result.summary)
      
      return result
    } else {
      console.error('Failed to save test:', result.error)
    }

  } catch (error) {
    console.error('Error in test save example:', error)
  }
}

/**
 * Example 2: Using saveQuickTestResult with questions and answers arrays
 */
export const quickSaveTestExample = async () => {
  try {
    const user = await getCurrentUser()
    if (!user.success) throw new Error('User not authenticated')

    const userId = user.user.id
    const subjectId = 2 // English

    // Mock questions data (as returned from getRandomQuestions)
    const questions = [
      {
        id: 10,
        question: 'What is the plural of "child"?',
        options: { a: 'childs', b: 'children', c: 'childes', d: 'child' },
        correctOption: 'b',
        difficulty: 'easy',
        explanation: 'Children is the irregular plural form of child',
        topic: { id: 5, name: 'Grammar' }
      },
      {
        id: 11,
        question: 'Which sentence is grammatically correct?',
        options: { 
          a: 'Me and John went to store',
          b: 'John and I went to the store',
          c: 'John and me went to store',
          d: 'Me and John went to the store'
        },
        correctOption: 'b',
        difficulty: 'medium',
        explanation: 'Use "I" as subject, and include "the" before "store"',
        topic: { id: 5, name: 'Grammar' }
      },
      {
        id: 12,
        question: 'What is the main theme of Romeo and Juliet?',
        options: { 
          a: 'Friendship',
          b: 'Adventure',
          c: 'Love and tragedy',
          d: 'Politics'
        },
        correctOption: 'c',
        difficulty: 'medium',
        explanation: 'The play centers on tragic love between the two protagonists',
        topic: { id: 6, name: 'Literature' }
      }
    ]

    // User's answers
    const userAnswers = ['b', 'a', 'c'] // Correct, Wrong, Correct

    // Time spent on each question (optional)
    const timeSpent = [30, 75, 120] // seconds

    const options = {
      durationMinutes: 10,
      timeSpent: timeSpent
    }

    const result = await saveQuickTestResult(userId, subjectId, questions, userAnswers, options)
    
    if (result.success) {
      console.log('Quick test saved!')
      console.log(`Score: ${result.score.correct}/${result.score.total} (${result.score.percentage.toFixed(1)}%)`)
      
      // Show topic breakdown
      result.topicPerformance.forEach(topic => {
        console.log(`${topic.topicName}: ${topic.correct}/${topic.total} (${topic.percentage.toFixed(1)}%)`)
      })
      
      return result
    }

  } catch (error) {
    console.error('Error in quick save example:', error)
  }
}

// =============================================
// REACT COMPONENT EXAMPLES
// =============================================

/**
 * React Hook for saving test results
 */
import { useState } from 'react'

export const useSaveTestResult = () => {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const saveTest = async (userId, subjectId, results, options) => {
    setSaving(true)
    setError(null)
    setResult(null)

    try {
      const testResult = await saveTestResult(userId, subjectId, results, options)
      
      if (testResult.success) {
        setResult(testResult)
        return testResult
      } else {
        setError(testResult.error)
        throw new Error(testResult.error)
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSaving(false)
    }
  }

  const resetState = () => {
    setError(null)
    setResult(null)
  }

  return { saveTest, saving, error, result, resetState }
}

/**
 * React Component: Test Results Summary
 */
export const TestResultsComponent = ({ questions, userAnswers, subjectId, onSave }) => {
  const { saveTest, saving, error, result } = useSaveTestResult()
  const [testDuration, setTestDuration] = useState(0)

  // Calculate preview score
  const previewScore = questions.reduce((score, question, index) => {
    return question.correctOption === userAnswers[index] ? score + 1 : score
  }, 0)

  const handleSaveResults = async () => {
    try {
      const user = await getCurrentUser()
      if (!user.success) {
        alert('Please log in to save results')
        return
      }

      // Format results using helper function
      const formattedResults = formatTestResults(questions, userAnswers)
      
      const options = {
        durationMinutes: Math.round(testDuration / 60) // Convert seconds to minutes
      }

      const savedResult = await saveTest(user.user.id, subjectId, formattedResults, options)
      
      if (onSave) {
        onSave(savedResult)
      }
      
    } catch (error) {
      console.error('Failed to save test:', error)
    }
  }

  if (result) {
    return (
      <div className="test-results-saved">
        <h2>Test Results Saved!</h2>
        <div className="score-summary">
          <p>Final Score: {result.score.correct}/{result.score.total} ({result.score.percentage.toFixed(1)}%)</p>
          <p>Test ID: {result.testId}</p>
        </div>
        
        <div className="topic-breakdown">
          <h3>Topic Performance:</h3>
          {result.topicPerformance.map(topic => (
            <div key={topic.topic_id} className="topic-score">
              <span>{topic.topicName}</span>
              <span>{topic.correct}/{topic.total} ({topic.percentage.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="test-results-preview">
      <h2>Test Complete!</h2>
      <div className="preview-score">
        <p>Your Score: {previewScore}/{questions.length} ({((previewScore/questions.length)*100).toFixed(1)}%)</p>
      </div>
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
      
      <button 
        onClick={handleSaveResults}
        disabled={saving}
        className="save-results-btn"
      >
        {saving ? 'Saving Results...' : 'Save Results'}
      </button>
    </div>
  )
}

// =============================================
// ADVANCED USAGE EXAMPLES
// =============================================

/**
 * Example 3: Batch save multiple test attempts
 */
export const batchSaveTestsExample = async () => {
  try {
    const user = await getCurrentUser()
    if (!user.success) throw new Error('User not authenticated')

    const userId = user.user.id
    
    // Multiple test sessions to save
    const testSessions = [
      {
        subjectId: 1,
        results: [
          { questionId: 1, topicId: 1, topicName: 'Algebra', selectedAnswer: 'a', correctAnswer: 'a', isCorrect: true },
          { questionId: 2, topicId: 1, topicName: 'Algebra', selectedAnswer: 'b', correctAnswer: 'c', isCorrect: false }
        ],
        options: { durationMinutes: 5 }
      },
      {
        subjectId: 2,
        results: [
          { questionId: 10, topicId: 5, topicName: 'Grammar', selectedAnswer: 'c', correctAnswer: 'c', isCorrect: true },
          { questionId: 11, topicId: 5, topicName: 'Grammar', selectedAnswer: 'a', correctAnswer: 'b', isCorrect: false },
          { questionId: 12, topicId: 6, topicName: 'Literature', selectedAnswer: 'd', correctAnswer: 'd', isCorrect: true }
        ],
        options: { durationMinutes: 8 }
      }
    ]

    const results = []
    
    for (const session of testSessions) {
      const result = await saveTestResult(userId, session.subjectId, session.results, session.options)
      results.push(result)
      
      // Add delay between saves to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('All test sessions saved:', results)
    return results

  } catch (error) {
    console.error('Error in batch save example:', error)
  }
}

/**
 * Example 4: Save test with detailed analytics
 */
export const analyticsTestSaveExample = async () => {
  try {
    const user = await getCurrentUser()
    if (!user.success) throw new Error('User not authenticated')

    // Simulate a comprehensive test with detailed tracking
    const testData = {
      userId: user.user.id,
      subjectId: 1,
      startTime: new Date(Date.now() - 900000), // Started 15 minutes ago
      endTime: new Date(),
      results: [
        {
          questionId: 1,
          topicId: 1,
          topicName: 'Algebra',
          question: 'Solve: 2x + 5 = 13',
          selectedAnswer: 'b',
          correctAnswer: 'b',
          isCorrect: true,
          timeSpent: 45,
          difficulty: 'easy',
          attempts: 1
        },
        {
          questionId: 2,
          topicId: 1,
          topicName: 'Algebra',
          question: 'Find x: x² - 4 = 0',
          selectedAnswer: 'a',
          correctAnswer: 'c',
          isCorrect: false,
          timeSpent: 120,
          difficulty: 'medium',
          attempts: 2
        },
        {
          questionId: 3,
          topicId: 2,
          topicName: 'Geometry',
          question: 'Area of triangle with base 10 and height 6?',
          selectedAnswer: 'c',
          correctAnswer: 'c',
          isCorrect: true,
          timeSpent: 60,
          difficulty: 'easy',
          attempts: 1
        }
      ]
    }

    const durationMinutes = Math.round((testData.endTime - testData.startTime) / (1000 * 60))
    
    const options = {
      durationMinutes,
      startTime: testData.startTime.toISOString(),
      endTime: testData.endTime.toISOString(),
      totalTimeSpent: testData.results.reduce((sum, r) => sum + r.timeSpent, 0),
      averageTimePerQuestion: testData.results.reduce((sum, r) => sum + r.timeSpent, 0) / testData.results.length
    }

    const result = await saveTestResult(testData.userId, testData.subjectId, testData.results, options)
    
    if (result.success) {
      console.log('Analytics test saved with detailed metrics:')
      console.log('- Duration:', durationMinutes, 'minutes')
      console.log('- Average time per question:', options.averageTimePerQuestion.toFixed(1), 'seconds')
      console.log('- Topic performance:', result.topicPerformance)
      
      // Additional analytics could be calculated here
      const difficultyBreakdown = result.topicPerformance.reduce((acc, topic) => {
        // Group by difficulty if needed
        return acc
      }, {})
      
      return result
    }

  } catch (error) {
    console.error('Error in analytics save example:', error)
  }
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Calculate detailed performance metrics
 */
export const calculateDetailedMetrics = (testResult) => {
  if (!testResult.success) return null

  const { score, topicPerformance, summary } = testResult

  return {
    overallPerformance: {
      grade: score.percentage >= 90 ? 'A' : score.percentage >= 80 ? 'B' : score.percentage >= 70 ? 'C' : score.percentage >= 60 ? 'D' : 'F',
      passStatus: score.percentage >= 60 ? 'PASS' : 'FAIL',
      improvementNeeded: score.percentage < 70
    },
    topicAnalysis: topicPerformance.map(topic => ({
      ...topic,
      performance: topic.percentage >= 80 ? 'Excellent' : topic.percentage >= 60 ? 'Good' : 'Needs Improvement',
      recommendation: topic.percentage < 60 ? `Focus on ${topic.topicName}` : null
    })),
    timeEfficiency: summary.duration ? {
      minutesPerQuestion: (summary.duration / summary.totalQuestions).toFixed(1),
      efficiency: summary.duration < (summary.totalQuestions * 2) ? 'Fast' : summary.duration < (summary.totalQuestions * 3) ? 'Normal' : 'Slow'
    } : null
  }
}

/**
 * Generate performance report
 */
export const generatePerformanceReport = (testResult) => {
  const metrics = calculateDetailedMetrics(testResult)
  if (!metrics) return 'No metrics available'

  return `
Test Performance Report
======================
Overall Score: ${testResult.score.percentage.toFixed(1)}% (${metrics.overallPerformance.grade})
Status: ${metrics.overallPerformance.passStatus}

Topic Breakdown:
${metrics.topicAnalysis.map(topic => 
  `- ${topic.topicName}: ${topic.percentage.toFixed(1)}% (${topic.performance})`
).join('\n')}

${metrics.timeEfficiency ? 
  `Time Analysis:
- Average per question: ${metrics.timeEfficiency.minutesPerQuestion} minutes
- Pace: ${metrics.timeEfficiency.efficiency}` : 
  'Time data not available'}

${metrics.overallPerformance.improvementNeeded ? 
  '\nRecommendations:\n' + metrics.topicAnalysis
    .filter(topic => topic.recommendation)
    .map(topic => `- ${topic.recommendation}`)
    .join('\n') : 
  '\nGreat job! Keep up the excellent work!'}
  `
}