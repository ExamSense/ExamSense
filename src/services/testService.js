import { supabase } from '../supabaseClient.js'
import { validateAnswer } from './questionService.js'

/**
 * Test Service
 * Handles test results, history, and performance analytics
 */

// Save test result after user completes a test
export const saveTestResult = async (testData) => {
  try {
    const {
      userId,
      subjectId,
      topicId = null,
      questions,
      userAnswers,
      timeSpent = null,
      testType = 'practice'
    } = testData

    // Validate required fields
    if (!userId || !subjectId || !questions || !userAnswers) {
      throw new Error('Missing required test data')
    }

    // Calculate results
    const results = calculateTestResults(questions, userAnswers)
    
    // Save test history record
    const { data: testHistory, error: testError } = await supabase
      .from('test_history')
      .insert({
        user_id: userId,
        subject_id: subjectId,
        topic_id: topicId,
        score: results.score,
        total_questions: results.totalQuestions,
        percentage: results.percentage,
        time_spent: timeSpent,
        test_type: testType,
        date_taken: new Date().toISOString()
      })
      .select()
      .single()

    if (testError) {
      throw testError
    }

    // Save individual answers
    const answerPromises = questions.map(async (question, index) => {
      const userAnswer = userAnswers[index]
      const isCorrect = validateAnswer(question, userAnswer)

      return supabase
        .from('user_answers')
        .insert({
          user_id: userId,
          test_id: testHistory.id,
          question_id: question.id,
          user_answer: userAnswer?.toString() || null,
          correct_answer: question.correct_answer.toString(),
          is_correct: isCorrect,
          time_spent: null // Can be implemented later for per-question timing
        })
    })

    await Promise.all(answerPromises)

    // Update/create topic performance
    await updateTopicPerformance(userId, subjectId, topicId, results)

    return {
      testId: testHistory.id,
      ...results,
      testHistory
    }

  } catch (error) {
    console.error('Save test result error:', error)
    throw new Error(error.message || 'Failed to save test result')
  }
}

// Calculate test results from questions and answers
export const calculateTestResults = (questions, userAnswers) => {
  const totalQuestions = questions.length
  let correctAnswers = 0
  const results = []

  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index]
    const isCorrect = validateAnswer(question, userAnswer)
    
    if (isCorrect) {
      correctAnswers++
    }

    results.push({
      questionId: question.id,
      question: question.question,
      userAnswer,
      correctAnswer: question.correct_answer,
      isCorrect,
      explanation: question.explanation || null,
      topic: question.topics?.name || null
    })
  })

  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  return {
    score: correctAnswers,
    totalQuestions,
    percentage,
    results,
    passed: percentage >= 70 // Configurable pass threshold
  }
}

// Get user's test history
export const getUserTestHistory = async (userId, filters = {}) => {
  try {
    const {
      subjectId = null,
      topicId = null,
      limit = 20,
      offset = 0,
      dateFrom = null,
      dateTo = null
    } = filters

    let query = supabase
      .from('test_history')
      .select(`
        *,
        subjects (
          id,
          name
        ),
        topics (
          id,
          name
        )
      `)
      .eq('user_id', userId)

    // Apply filters
    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }

    if (topicId) {
      query = query.eq('topic_id', topicId)
    }

    if (dateFrom) {
      query = query.gte('date_taken', dateFrom)
    }

    if (dateTo) {
      query = query.lte('date_taken', dateTo)
    }

    const { data, error } = await query
      .order('date_taken', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Get user test history error:', error)
    throw new Error(error.message || 'Failed to fetch test history')
  }
}

// Get detailed test result with answers
export const getTestDetails = async (testId, userId) => {
  try {
    // Get test history
    const { data: testHistory, error: testError } = await supabase
      .from('test_history')
      .select(`
        *,
        subjects (
          id,
          name
        ),
        topics (
          id,
          name
        )
      `)
      .eq('id', testId)
      .eq('user_id', userId)
      .single()

    if (testError) {
      throw testError
    }

    // Get user answers for this test
    const { data: userAnswers, error: answersError } = await supabase
      .from('user_answers')
      .select(`
        *,
        questions (
          id,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          explanation,
          difficulty,
          topics (
            id,
            name
          )
        )
      `)
      .eq('test_id', testId)
      .eq('user_id', userId)

    if (answersError) {
      throw answersError
    }

    return {
      testHistory,
      answers: userAnswers
    }
  } catch (error) {
    console.error('Get test details error:', error)
    throw new Error(error.message || 'Failed to fetch test details')
  }
}

// Update or create topic performance record
const updateTopicPerformance = async (userId, subjectId, topicId, results) => {
  try {
    if (!topicId) return // Skip if no specific topic

    // Check if performance record exists
    const { data: existing, error: fetchError } = await supabase
      .from('topic_performance')
      .select('*')
      .eq('user_id', userId)
      .eq('subject_id', subjectId)
      .eq('topic_id', topicId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    if (existing) {
      // Update existing record
      const newAttempts = existing.attempts + 1
      const newTotalScore = existing.total_score + results.score
      const newTotalQuestions = existing.total_questions + results.totalQuestions
      const newAverageScore = Math.round((newTotalScore / newTotalQuestions) * 100)

      const { error: updateError } = await supabase
        .from('topic_performance')
        .update({
          attempts: newAttempts,
          total_score: newTotalScore,
          total_questions: newTotalQuestions,
          average_score: newAverageScore,
          last_attempt: new Date().toISOString(),
          best_score: Math.max(existing.best_score, results.percentage)
        })
        .eq('id', existing.id)

      if (updateError) {
        throw updateError
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('topic_performance')
        .insert({
          user_id: userId,
          subject_id: subjectId,
          topic_id: topicId,
          attempts: 1,
          total_score: results.score,
          total_questions: results.totalQuestions,
          average_score: results.percentage,
          best_score: results.percentage,
          last_attempt: new Date().toISOString()
        })

      if (insertError) {
        throw insertError
      }
    }
  } catch (error) {
    console.error('Update topic performance error:', error)
    // Don't throw here as it's not critical to the main test saving process
  }
}

// Get topic performance for a user
export const getTopicPerformance = async (userId, subjectId = null, topicId = null) => {
  try {
    let query = supabase
      .from('topic_performance')
      .select(`
        *,
        subjects (
          id,
          name
        ),
        topics (
          id,
          name
        )
      `)
      .eq('user_id', userId)

    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }

    if (topicId) {
      query = query.eq('topic_id', topicId)
    }

    const { data, error } = await query
      .order('average_score', { ascending: false })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Get topic performance error:', error)
    throw new Error(error.message || 'Failed to fetch topic performance')
  }
}

// Get overall user statistics
export const getUserStats = async (userId) => {
  try {
    // Get test history stats
    const { data: testStats, error: testError } = await supabase
      .from('test_history')
      .select('score, total_questions, percentage, date_taken')
      .eq('user_id', userId)

    if (testError) {
      throw testError
    }

    // Calculate overall statistics
    const totalTests = testStats.length
    const totalQuestions = testStats.reduce((sum, test) => sum + test.total_questions, 0)
    const totalCorrect = testStats.reduce((sum, test) => sum + test.score, 0)
    const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
    const bestScore = testStats.length > 0 ? Math.max(...testStats.map(test => test.percentage)) : 0

    // Get recent performance (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentTests = testStats.filter(test => 
      new Date(test.date_taken) >= thirtyDaysAgo
    )

    const recentAverageScore = recentTests.length > 0 
      ? Math.round(recentTests.reduce((sum, test) => sum + test.percentage, 0) / recentTests.length)
      : 0

    return {
      totalTests,
      totalQuestions,
      totalCorrect,
      averageScore,
      bestScore,
      recentTests: recentTests.length,
      recentAverageScore,
      improvement: recentAverageScore - averageScore
    }
  } catch (error) {
    console.error('Get user stats error:', error)
    throw new Error(error.message || 'Failed to fetch user statistics')
  }
}

// Get learning recommendations based on performance
export const getLearningRecommendations = async (userId, limit = 5) => {
  try {
    // Get topics with lowest performance
    const { data: weakTopics, error } = await supabase
      .from('topic_performance')
      .select(`
        *,
        topics (
          id,
          name,
          description
        ),
        subjects (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .lt('average_score', 70) // Topics scoring below 70%
      .order('average_score', { ascending: true })
      .limit(limit)

    if (error) {
      throw error
    }

    // Add recommended resources (you can expand this with external APIs)
    const recommendations = weakTopics.map(topic => ({
      ...topic,
      recommendations: [
        {
          type: 'practice',
          title: `Practice more ${topic.topics.name} questions`,
          description: `Focus on ${topic.topics.name} to improve your ${topic.average_score}% score`
        },
        {
          type: 'study',
          title: `Study ${topic.topics.name} fundamentals`,
          description: 'Review basic concepts and theory'
        }
      ]
    }))

    return recommendations
  } catch (error) {
    console.error('Get learning recommendations error:', error)
    throw new Error(error.message || 'Failed to fetch learning recommendations')
  }
}

export default {
  saveTestResult,
  calculateTestResults,
  getUserTestHistory,
  getTestDetails,
  getTopicPerformance,
  getUserStats,
  getLearningRecommendations
}