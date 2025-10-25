// Example usage of the Supabase client for ExamSense CBT app
// This file demonstrates common operations with the database

import supabase, { 
  getCurrentUser, 
  signInWithEmail, 
  signUpWithEmail, 
  signOut 
} from './supabaseClient.js'

// =============================================
// AUTHENTICATION EXAMPLES
// =============================================

// Sign up a new user
export const registerUser = async (email, password, fullName) => {
  try {
    const data = await signUpWithEmail(email, password, fullName)
    console.log('User registered:', data)
    return data
  } catch (error) {
    console.error('Registration error:', error.message)
    throw error
  }
}

// Sign in existing user
export const loginUser = async (email, password) => {
  try {
    const data = await signInWithEmail(email, password)
    console.log('User logged in:', data)
    return data
  } catch (error) {
    console.error('Login error:', error.message)
    throw error
  }
}

// Get current authenticated user
export const getUser = async () => {
  try {
    const user = await getCurrentUser()
    return user
  } catch (error) {
    console.error('Get user error:', error.message)
    return null
  }
}

// =============================================
// DATABASE OPERATIONS EXAMPLES
// =============================================

// Get all subjects
export const getSubjects = async () => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

// Get topics for a specific subject
export const getTopicsBySubject = async (subjectId) => {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subjectId)
    .order('name')
  
  if (error) throw error
  return data
}

// Get questions for a specific topic
export const getQuestionsByTopic = async (topicId, limit = 20) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('topic_id', topicId)
    .limit(limit)
  
  if (error) throw error
  return data
}

// Get random questions for a test with comprehensive data
export const getRandomQuestions = async (subjectId, limit = 10) => {
  try {
    // First, get total count of questions for the subject
    const { count, error: countError } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('topics.subject_id', subjectId, { referencedTable: 'topics' })

    if (countError) throw countError

    // If we don't have enough questions, adjust the limit
    const actualLimit = Math.min(limit, count || 0)

    if (actualLimit === 0) {
      return {
        success: true,
        data: [],
        message: 'No questions available for this subject'
      }
    }

    // Generate random offset to start from
    const maxOffset = Math.max(0, (count || 0) - actualLimit)
    const randomOffset = Math.floor(Math.random() * (maxOffset + 1))

    // Fetch random questions with comprehensive data
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        difficulty_level,
        explanation,
        created_at,
        topics!inner(
          id,
          name,
          subject_id,
          subjects!inner(
            id,
            name
          )
        )
      `)
      .eq('topics.subject_id', subjectId)
      .range(randomOffset, randomOffset + actualLimit - 1)

    if (error) throw error

    // Shuffle the results for additional randomness
    const shuffledData = data?.sort(() => Math.random() - 0.5) || []

    // Format the data for easier use
    const formattedQuestions = shuffledData.map(question => ({
      id: question.id,
      question: question.question,
      options: {
        a: question.option_a,
        b: question.option_b,
        c: question.option_c,
        d: question.option_d
      },
      correctOption: question.correct_option,
      difficulty: question.difficulty_level,
      explanation: question.explanation,
      topic: {
        id: question.topics.id,
        name: question.topics.name
      },
      subject: {
        id: question.topics.subjects.id,
        name: question.topics.subjects.name
      },
      createdAt: question.created_at
    }))

    return {
      success: true,
      data: formattedQuestions,
      total: formattedQuestions.length,
      message: `Retrieved ${formattedQuestions.length} random questions`
    }

  } catch (error) {
    console.error('Error fetching random questions:', error)
    return {
      success: false,
      data: [],
      error: error.message,
      message: 'Failed to fetch random questions'
    }
  }
}

// Create a new test record
export const createTest = async (subjectId, totalQuestions) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('test_history')
    .insert({
      user_id: user.id,
      subject_id: subjectId,
      score: 0,
      total_questions: totalQuestions
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Update test score
export const updateTestScore = async (testId, score) => {
  const { data, error } = await supabase
    .from('test_history')
    .update({ score })
    .eq('id', testId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Record user answer
export const recordAnswer = async (testId, questionId, selectedOption, isCorrect) => {
  // Ensure the current user is attached (RLS requires auth.uid() = user_id)
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const payload = {
    user_id: user.id,
    test_id: testId,
    question_id: questionId,
    user_answer: selectedOption,
    is_correct: isCorrect,
    time_spent: null
  }

  const { data, error } = await supabase
    .from('user_answers')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

// Record topic performance
export const recordTopicPerformance = async (testId, topicId, correct, total) => {
  // Use canonical column names in the DB schema: user_id, subject_id, topic_id, total_score, total_questions
  // We need the test to find user_id and subject_id
  const { data: testRow, error: testErr } = await supabase
    .from('test_history')
    .select('id, user_id, subject_id')
    .eq('id', testId)
    .single()

  if (testErr) throw testErr

  const payload = {
    user_id: testRow.user_id,
    subject_id: testRow.subject_id,
    topic_id: topicId,
    attempts: 1,
    total_score: correct,
    total_questions: total,
    last_attempt: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('topic_performance')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

// =============================================
// COMPREHENSIVE TEST RESULT SAVING
// =============================================

/**
 * Save complete test result with score calculation and topic analysis
 * @param {string} userId - User's UUID
 * @param {number} subjectId - Subject ID
 * @param {Array} results - Array of question results with answers
 * @param {Object} options - Additional options (duration, etc.)
 * @returns {Promise<Object>} Test result data with topic performance
 */
export const saveTestResult = async (userId, subjectId, results, options = {}) => {
  try {
    // Validate inputs
    if (!userId || !subjectId || !Array.isArray(results)) {
      throw new Error('Invalid input parameters')
    }

    if (results.length === 0) {
      throw new Error('No test results provided')
    }

    // Step 1: Calculate overall score
    const totalQuestions = results.length
    const correctAnswers = results.filter(result => result.isCorrect).length
    const score = correctAnswers
    const percentage = (correctAnswers / totalQuestions) * 100

    console.log(`Calculated score: ${score}/${totalQuestions} (${percentage.toFixed(2)}%)`)

    // Step 2: Create test history record
    // Map to canonical DB columns: user_id, subject_id, score, total_questions, time_spent, test_type, date_taken
    const testHistoryData = {
      user_id: userId,
      subject_id: subjectId,
      score: score,
      total_questions: totalQuestions,
      time_spent: options.durationMinutes || null,
      test_type: options.testType || 'practice',
      date_taken: new Date().toISOString()
    }

    const { data: testRecord, error: testError } = await supabase
      .from('test_history')
      .insert(testHistoryData)
      .select()
      .single()

    if (testError) throw testError

    console.log('Test history saved:', testRecord.id)

    // Step 3: Analyze topic-wise performance
    const topicPerformance = new Map()

    // Group results by topic
    results.forEach(result => {
      if (!result.topicId) return // Skip if no topic ID

      if (!topicPerformance.has(result.topicId)) {
        topicPerformance.set(result.topicId, {
          topicId: result.topicId,
          topicName: result.topicName,
          correct: 0,
          total: 0,
          questions: []
        })
      }

      const topicData = topicPerformance.get(result.topicId)
      topicData.total += 1
      if (result.isCorrect) {
        topicData.correct += 1
      }
      topicData.questions.push(result)
    })

    // Step 4: Save topic performance records
    const topicPerformanceRecords = []
    
    for (const [topicId, performance] of topicPerformance) {
      const topicRecord = {
        user_id: userId,
        subject_id: subjectId,
        topic_id: topicId,
        attempts: 1,
        total_score: performance.correct,
        total_questions: performance.total,
        last_attempt: new Date().toISOString()
      }

      const { data: topicData, error: topicError } = await supabase
        .from('topic_performance')
        .insert(topicRecord)
        .select()
        .single()

      if (topicError) {
        console.warn(`Failed to save topic performance for topic ${topicId}:`, topicError)
        continue
      }

      topicPerformanceRecords.push({
        ...topicData,
        topicName: performance.topicName,
        percentage: performance.total > 0 ? (performance.correct / performance.total) * 100 : 0
      })
    }

    // Step 5: Save individual user answers (optional detailed tracking)
    const userAnswersData = results
      .filter(result => result.questionId) // Only save if we have question ID
      .map(result => ({
        user_id: userId,
        test_id: testRecord.id,
        question_id: result.questionId,
        user_answer: result.selectedAnswer,
        correct_answer: result.correctAnswer || null,
        is_correct: result.isCorrect,
        time_spent: result.timeSpent || 0
      }))

    if (userAnswersData.length > 0) {
      const { error: answersError } = await supabase
        .from('user_answers')
        .insert(userAnswersData)

      if (answersError) {
        console.warn('Failed to save user answers:', answersError)
        // Don't throw error as main test result is saved
      }
    }

    // Step 6: Return comprehensive result
    const finalResult = {
      success: true,
      testId: testRecord.id,
      score: {
        correct: score,
        total: totalQuestions,
        percentage: percentage
      },
      testHistory: testRecord,
      topicPerformance: topicPerformanceRecords,
      summary: {
        totalQuestions,
        correctAnswers: score,
        incorrectAnswers: totalQuestions - score,
        percentage: Math.round(percentage * 100) / 100,
        topicsAnalyzed: topicPerformanceRecords.length,
        duration: options.durationMinutes || null
      }
    }

    console.log('Test result saved successfully:', finalResult.summary)
    return finalResult

  } catch (error) {
    console.error('Error saving test result:', error)
    return {
      success: false,
      error: error.message,
      message: 'Failed to save test result'
    }
  }
}

/**
 * Helper function to format question results for saveTestResult
 * @param {Array} questions - Array of question objects
 * @param {Array} userAnswers - Array of user's selected answers
 * @param {Array} timeSpent - Optional array of time spent per question
 * @returns {Array} Formatted results array
 */
export const formatTestResults = (questions, userAnswers, timeSpent = []) => {
  return questions.map((question, index) => {
    const selectedAnswer = userAnswers[index]
    const isCorrect = question.correctOption === selectedAnswer
    
    return {
      questionId: question.id,
      topicId: question.topic?.id,
      topicName: question.topic?.name,
      question: question.question,
      selectedAnswer: selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: isCorrect,
      explanation: question.explanation,
      timeSpent: timeSpent[index] || 0,
      difficulty: question.difficulty
    }
  })
}

/**
 * Quick save function for simple test results
 * @param {string} userId - User's UUID
 * @param {number} subjectId - Subject ID
 * @param {Array} questions - Array of question objects
 * @param {Array} userAnswers - Array of user's answers
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Test result data
 */
export const saveQuickTestResult = async (userId, subjectId, questions, userAnswers, options = {}) => {
  const formattedResults = formatTestResults(questions, userAnswers, options.timeSpent)
  return await saveTestResult(userId, subjectId, formattedResults, options)
}

// Get user's test history
export const getUserTestHistory = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('test_history')
    .select(`
      *,
      subjects(name)
    `)
    .eq('user_id', user.id)
    .order('date_taken', { ascending: false })
  
  if (error) throw error
  return data
}

// Get user's performance by subject
export const getUserPerformanceBySubject = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('test_history')
    .select(`
      subject_id,
      subjects(name),
      score,
      total_questions,
      percentage
    `)
    .eq('user_id', user.id)
  
  if (error) throw error
  
  // Group by subject and calculate averages
  const grouped = data.reduce((acc, test) => {
    const subjectName = test.subjects.name
    if (!acc[subjectName]) {
      acc[subjectName] = {
        subject: subjectName,
        tests: [],
        totalTests: 0,
        averageScore: 0
      }
    }
    acc[subjectName].tests.push(test)
    acc[subjectName].totalTests++
    return acc
  }, {})

  // Calculate averages
  Object.values(grouped).forEach(subject => {
    const totalPercentage = subject.tests.reduce((sum, test) => sum + test.percentage, 0)
    subject.averageScore = totalPercentage / subject.totalTests
  })

  return Object.values(grouped)
}

/**
 * Get comprehensive user test history by userId
 * @param {string} userId - User's UUID
 * @param {Object} options - Optional parameters for filtering and pagination
 * @returns {Promise<Object>} User's test history with detailed information
 */
export const getUserHistory = async (userId, options = {}) => {
  try {
    // Validate input
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Set default options
    const {
      limit = 50,
      offset = 0,
      subjectId = null,
      startDate = null,
      endDate = null,
      minScore = null,
      maxScore = null,
      includeTopicPerformance = false
    } = options

    // Build the query
    let query = supabase
      .from('test_history')
      .select(`
        id,
        subject_id,
        score,
        total_questions,
        percentage,
        duration_minutes,
        status,
        date_taken,
        completed_at,
        subjects!inner(
          id,
          name,
          description
        )
        ${includeTopicPerformance ? `,
        topic_performance(
          id,
          topic_id,
          correct,
          total,
          percentage,
          topics(
            id,
            name
          )
        )` : ''}
      `)
      .eq('user_id', userId)
      .order('date_taken', { ascending: false })

    // Apply filters
    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }

    if (startDate) {
      query = query.gte('date_taken', startDate)
    }

    if (endDate) {
      query = query.lte('date_taken', endDate)
    }

    if (minScore !== null) {
      query = query.gte('score', minScore)
    }

    if (maxScore !== null) {
      query = query.lte('score', maxScore)
    }

    // Apply pagination
    if (limit) {
      query = query.limit(limit)
    }

    if (offset) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error } = await query

    // Try the complex query first; if it errors (join/permission issues), fall back to a simpler query
    let finalData = data
    let finalError = error

    if (error) {
      console.warn('Complex user history query failed, attempting simple fallback:', error)
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('test_history')
        .select('*')
        .eq('user_id', userId)
        .order('date_taken', { ascending: false })

      if (fallbackError) throw fallbackError
      finalData = fallbackData
      finalError = null
    }

    if (finalError) throw finalError
    if (!finalData || finalData.length === 0) {
      return {
        success: true,
        data: [],
        summary: null,
        message: 'No test history found for this user'
      }
    }

    // Format the data for easier consumption
    const formattedHistory = (finalData || []).map(test => ({
      testId: test.id,
      subject: {
        id: test.subjects?.id || test.subject_id || null,
        name: test.subjects?.name || test.subject_name || null,
        description: test.subjects?.description || null
      },
      score: test.score,
      totalQuestions: test.total_questions || test.totalQuestions || test.total,
      percentage: test.percentage,
      accuracy: Math.round(test.percentage * 100) / 100,
      duration: {
        minutes: test.duration_minutes,
        formatted: test.duration_minutes ? formatDuration(test.duration_minutes) : 'N/A'
      },
      status: test.status,
      dates: {
        taken: test.date_taken || test.taken_at,
        completed: test.completed_at,
        takenFormatted: formatDate(test.date_taken || test.taken_at),
        completedFormatted: test.completed_at ? formatDate(test.completed_at) : null
      },
      performance: {
        grade: getGradeFromPercentage(test.percentage),
        level: getPerformanceLevelFromPercentage(test.percentage),
        passed: test.percentage >= 60 // Assuming 60% is passing
      },
      topicPerformance: includeTopicPerformance && test.topic_performance 
        ? test.topic_performance.map(tp => ({
            topicId: tp.topic_id,
            topicName: tp.topics?.name || 'Unknown Topic',
            correct: tp.correct,
            total: tp.total,
            percentage: tp.percentage,
            accuracy: Math.round(tp.percentage * 100) / 100
          }))
        : null
    }))

    // Calculate summary statistics
    const summary = calculateUserHistorySummary(formattedHistory)

    return {
      success: true,
      data: formattedHistory,
      summary: summary,
      pagination: {
        limit,
        offset,
        returned: formattedHistory.length,
        hasMore: formattedHistory.length === limit
      },
      filters: {
        subjectId,
        startDate,
        endDate,
        minScore,
        maxScore
      },
      message: `Retrieved ${formattedHistory.length} test records`
    }

  } catch (error) {
    console.error('Error fetching user history:', error)
    return {
      success: false,
      data: [],
      error: error.message,
      message: 'Failed to fetch user test history'
    }
  }
}

/**
 * Get user history for current authenticated user (convenience function)
 * @param {Object} options - Optional parameters for filtering and pagination
 * @returns {Promise<Object>} Current user's test history
 */
export const getCurrentUserHistory = async (options = {}) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    return await getUserHistory(user.id, options)
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message,
      message: 'Failed to fetch current user history'
    }
  }
}

/**
 * Get user history by subject
 * @param {string} userId - User's UUID
 * @param {number} subjectId - Subject ID to filter by
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} User's test history for specific subject
 */
export const getUserHistoryBySubject = async (userId, subjectId, options = {}) => {
  return await getUserHistory(userId, { ...options, subjectId })
}

/**
 * Get recent user history (last N tests)
 * @param {string} userId - User's UUID
 * @param {number} count - Number of recent tests to fetch
 * @returns {Promise<Object>} Recent test history
 */
export const getRecentUserHistory = async (userId, count = 10) => {
  return await getUserHistory(userId, { limit: count })
}

/**
 * Get user history with performance trends
 * @param {string} userId - User's UUID
 * @param {Object} options - Options including period analysis
 * @returns {Promise<Object>} User history with trend analysis
 */
export const getUserHistoryWithTrends = async (userId, options = {}) => {
  try {
    const { period = 30 } = options // Default to last 30 days
    
    // Get history data
    const historyResult = await getUserHistory(userId, {
      ...options,
      includeTopicPerformance: true,
      startDate: new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString()
    })

    if (!historyResult.success) {
      return historyResult
    }

    // Calculate trends
    const trends = calculatePerformanceTrends(historyResult.data)

    return {
      ...historyResult,
      trends: trends,
      period: `${period} days`
    }

  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message,
      message: 'Failed to fetch user history with trends'
    }
  }
}

// =============================================
// HELPER FUNCTIONS FOR USER HISTORY
// =============================================

/**
 * Format duration in minutes to human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
const formatDuration = (minutes) => {
  if (!minutes || minutes < 1) return '< 1 minute'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  } else {
    return `${mins} minutes`
  }
}

/**
 * Format date to human-readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  // If within last 7 days, show relative time
  if (diffDays <= 7) {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return rtf.format(-diffDays, 'day')
  }
  
  // Otherwise show formatted date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get grade letter from percentage
 * @param {number} percentage - Score percentage
 * @returns {string} Grade letter
 */
const getGradeFromPercentage = (percentage) => {
  if (percentage >= 90) return 'A'
  if (percentage >= 80) return 'B'
  if (percentage >= 70) return 'C'
  if (percentage >= 60) return 'D'
  return 'F'
}

/**
 * Get performance level from percentage
 * @param {number} percentage - Score percentage
 * @returns {string} Performance level
 */
const getPerformanceLevelFromPercentage = (percentage) => {
  if (percentage >= 90) return 'Excellent'
  if (percentage >= 80) return 'Good'
  if (percentage >= 70) return 'Fair'
  if (percentage >= 60) return 'Needs Improvement'
  return 'Poor'
}

/**
 * Calculate summary statistics for user history
 * @param {Array} historyData - Array of formatted test history
 * @returns {Object} Summary statistics
 */
const calculateUserHistorySummary = (historyData) => {
  if (!historyData.length) return null

  const totalTests = historyData.length
  const completedTests = historyData.filter(test => test.status === 'completed').length
  const totalQuestions = historyData.reduce((sum, test) => sum + test.totalQuestions, 0)
  const totalCorrect = historyData.reduce((sum, test) => sum + test.score, 0)
  
  const averageScore = totalCorrect / totalQuestions * 100
  const averagePercentage = historyData.reduce((sum, test) => sum + test.percentage, 0) / totalTests
  
  const passedTests = historyData.filter(test => test.performance.passed).length
  const passRate = (passedTests / totalTests) * 100
  
  // Subject breakdown
  const subjectBreakdown = historyData.reduce((acc, test) => {
    const subjectName = test.subject.name
    if (!acc[subjectName]) {
      acc[subjectName] = {
        name: subjectName,
        tests: 0,
        totalScore: 0,
        totalQuestions: 0,
        averagePercentage: 0
      }
    }
    acc[subjectName].tests++
    acc[subjectName].totalScore += test.score
    acc[subjectName].totalQuestions += test.totalQuestions
    return acc
  }, {})

  // Calculate averages for each subject
  Object.values(subjectBreakdown).forEach(subject => {
    subject.averagePercentage = (subject.totalScore / subject.totalQuestions) * 100
  })

  // Performance trends
  const recentTests = historyData.slice(0, 5) // Last 5 tests
  const earlierTests = historyData.slice(-5) // First 5 tests (if more than 5 total)
  
  const recentAverage = recentTests.reduce((sum, test) => sum + test.percentage, 0) / recentTests.length
  const earlierAverage = earlierTests.length > 0 
    ? earlierTests.reduce((sum, test) => sum + test.percentage, 0) / earlierTests.length
    : recentAverage

  const trend = recentAverage - earlierAverage

  return {
    overview: {
      totalTests,
      completedTests,
      totalQuestions,
      totalCorrect,
      averageScore: Math.round(averageScore * 100) / 100,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      passRate: Math.round(passRate * 100) / 100
    },
    performance: {
      excellent: historyData.filter(t => t.performance.level === 'Excellent').length,
      good: historyData.filter(t => t.performance.level === 'Good').length,
      fair: historyData.filter(t => t.performance.level === 'Fair').length,
      needsImprovement: historyData.filter(t => t.performance.level === 'Needs Improvement').length,
      poor: historyData.filter(t => t.performance.level === 'Poor').length
    },
    subjects: Object.values(subjectBreakdown),
    trends: {
      direction: trend > 5 ? 'improving' : trend < -5 ? 'declining' : 'stable',
      change: Math.round(trend * 100) / 100,
      recentAverage: Math.round(recentAverage * 100) / 100,
      earlierAverage: Math.round(earlierAverage * 100) / 100
    },
    timespan: {
      firstTest: historyData[historyData.length - 1]?.dates.takenFormatted,
      lastTest: historyData[0]?.dates.takenFormatted,
      totalDays: historyData.length > 1 
        ? Math.ceil((new Date(historyData[0].dates.taken) - new Date(historyData[historyData.length - 1].dates.taken)) / (1000 * 60 * 60 * 24))
        : 0
    }
  }
}

/**
 * Calculate performance trends over time
 * @param {Array} historyData - Array of test history data
 * @returns {Object} Trend analysis
 */
const calculatePerformanceTrends = (historyData) => {
  if (historyData.length < 2) {
    return {
      trend: 'insufficient_data',
      message: 'Need at least 2 tests to calculate trends'
    }
  }

  // Sort by date (oldest first for trend calculation)
  const sortedData = [...historyData].reverse()
  
  // Calculate linear regression for percentage over time
  const n = sortedData.length
  const xValues = sortedData.map((_, index) => index + 1)
  const yValues = sortedData.map(test => test.percentage)
  
  const sumX = xValues.reduce((sum, x) => sum + x, 0)
  const sumY = yValues.reduce((sum, y) => sum + y, 0)
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  // Determine trend direction and strength
  let trendDirection = 'stable'
  let trendStrength = 'weak'
  
  if (Math.abs(slope) > 2) {
    trendStrength = 'strong'
  } else if (Math.abs(slope) > 1) {
    trendStrength = 'moderate'
  }
  
  if (slope > 0.5) {
    trendDirection = 'improving'
  } else if (slope < -0.5) {
    trendDirection = 'declining'
  }

  return {
    trend: trendDirection,
    strength: trendStrength,
    slope: Math.round(slope * 100) / 100,
    projected: {
      nextTest: Math.round((intercept + slope * (n + 1)) * 100) / 100,
      in5Tests: Math.round((intercept + slope * (n + 5)) * 100) / 100
    },
    confidence: n >= 5 ? 'high' : n >= 3 ? 'medium' : 'low'
  }
}

// =============================================
// TOPIC PERFORMANCE ANALYSIS
// =============================================

/**
 * Get topic performance for a specific test with improvement resources
 * @param {number} testId - Test ID to analyze
 * @returns {Promise<Object>} Topic performance data with Khan Academy links
 */
export const getTopicPerformance = async (testId) => {
  try {
    // Validate input
    if (!testId) {
      throw new Error('Test ID is required')
    }

    // Get topic performance data with related topic and subject information
    const { data, error } = await supabase
      .from('topic_performance')
      .select(`
        *,
        topics!inner(
          id,
          name,
          subjects!inner(
            id,
            name
          )
        ),
        test_history!inner(
          id,
          user_id,
          subject_id,
          score,
          total_questions,
          percentage,
          date_taken
        )
      `)
      .eq('test_id', testId)

    if (error) throw error

    if (!data || data.length === 0) {
      return {
        success: true,
        data: [],
        message: 'No topic performance data found for this test'
      }
    }

    // Process and format the data
    const formattedPerformance = data.map(item => {
      const topicName = item.topics.name
      const subjectName = item.topics.subjects.name
      const accuracy = item.total > 0 ? (item.correct / item.total) * 100 : 0
      
      // Generate Khan Academy search links
      const khanAcademyLinks = generateKhanAcademyLinks(topicName, subjectName, accuracy)
      
      // Determine performance level and recommendations
      const performanceLevel = getPerformanceLevel(accuracy)
      const recommendations = getImprovementRecommendations(topicName, accuracy)

      return {
        topicId: item.topic_id,
        topicName: topicName,
        subjectName: subjectName,
        correct: item.correct,
        total: item.total,
        accuracy: Math.round(accuracy * 100) / 100, // Round to 2 decimal places
        performanceLevel: performanceLevel,
        needsImprovement: accuracy < 70,
        khanAcademyLinks: khanAcademyLinks,
        recommendations: recommendations,
        testInfo: {
          testId: item.test_history.id,
          overallScore: item.test_history.score,
          overallTotal: item.test_history.total_questions,
          overallPercentage: item.test_history.percentage,
          takenAt: item.test_history.date_taken || item.test_history.taken_at
        }
      }
    })

    // Sort by accuracy (lowest first for improvement focus)
    const sortedPerformance = formattedPerformance.sort((a, b) => a.accuracy - b.accuracy)

    // Calculate summary statistics
    const summary = calculateTopicSummary(formattedPerformance)

    return {
      success: true,
      data: sortedPerformance,
      summary: summary,
      testId: testId,
      message: `Retrieved performance data for ${formattedPerformance.length} topics`
    }

  } catch (error) {
    console.error('Error fetching topic performance:', error)
    return {
      success: false,
      data: [],
      error: error.message,
      message: 'Failed to fetch topic performance data'
    }
  }
}

/**
 * Generate Khan Academy search links for topic improvement
 * @param {string} topicName - Name of the topic
 * @param {string} subjectName - Name of the subject
 * @param {number} accuracy - Accuracy percentage
 * @returns {Object} Khan Academy links and search terms
 */
const generateKhanAcademyLinks = (topicName, subjectName, accuracy) => {
  // Clean and format topic name for search
  const cleanTopicName = topicName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  const cleanSubjectName = subjectName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  
  // Base Khan Academy search URL
  const baseSearchUrl = 'https://www.khanacademy.org/search'
  
  // Generate different search terms based on performance level
  const searchTerms = []
  
  if (accuracy < 50) {
    // Very low performance - focus on basics
    searchTerms.push(`${cleanTopicName} basics`)
    searchTerms.push(`${cleanTopicName} introduction`)
    searchTerms.push(`${cleanSubjectName} fundamentals`)
  } else if (accuracy < 70) {
    // Low performance - practice and review
    searchTerms.push(`${cleanTopicName} practice`)
    searchTerms.push(`${cleanTopicName} examples`)
    searchTerms.push(`${cleanTopicName} review`)
  } else {
    // Good performance - advanced topics
    searchTerms.push(`${cleanTopicName} advanced`)
    searchTerms.push(`${cleanTopicName} applications`)
    searchTerms.push(`${cleanSubjectName} ${cleanTopicName}`)
  }

  // Create search URLs
  const links = searchTerms.map(term => ({
    searchTerm: term,
    url: `${baseSearchUrl}?page_search_query=${encodeURIComponent(term)}`,
    description: getSearchDescription(term, accuracy)
  }))

  // Add subject-specific links
  const subjectSpecificLinks = getSubjectSpecificLinks(cleanSubjectName, cleanTopicName)

  return {
    searchLinks: links,
    subjectSpecific: subjectSpecificLinks,
    directLink: `${baseSearchUrl}?page_search_query=${encodeURIComponent(cleanTopicName)}`,
    recommendedSearch: searchTerms[0] // Primary recommendation
  }
}

/**
 * Get subject-specific Khan Academy links
 * @param {string} subjectName - Clean subject name
 * @param {string} topicName - Clean topic name
 * @returns {Array} Subject-specific resource links
 */
const getSubjectSpecificLinks = (subjectName, topicName) => {
  const subjectMappings = {
    'mathematics': {
      baseUrl: 'https://www.khanacademy.org/math',
      sections: {
        'algebra': '/algebra',
        'geometry': '/geometry',
        'calculus': '/differential-calculus',
        'statistics': '/statistics-probability',
        'trigonometry': '/trigonometry',
        'arithmetic': '/arithmetic'
      }
    },
    'physics': {
      baseUrl: 'https://www.khanacademy.org/science/physics',
      sections: {
        'mechanics': '/forces-newtons-laws',
        'electricity': '/electric-charge-electric-force-and-voltage',
        'magnetism': '/magnetic-forces-and-magnetic-fields',
        'waves': '/mechanical-waves-and-sound',
        'thermodynamics': '/thermodynamics'
      }
    },
    'chemistry': {
      baseUrl: 'https://www.khanacademy.org/science/chemistry',
      sections: {
        'atoms': '/electronic-structure-of-atoms',
        'bonds': '/chemical-bonds',
        'reactions': '/chemical-reactions-stoichiometry',
        'solutions': '/states-of-matter-and-intermolecular-forces'
      }
    },
    'biology': {
      baseUrl: 'https://www.khanacademy.org/science/biology',
      sections: {
        'cells': '/cellular-structure-and-function',
        'genetics': '/classical-genetics',
        'evolution': '/her/evolution-and-natural-selection',
        'ecology': '/ecology'
      }
    },
    'english': {
      baseUrl: 'https://www.khanacademy.org/humanities/grammar',
      sections: {
        'grammar': '/parts-of-speech-the-noun',
        'writing': '/usage-and-style',
        'reading': '/reading-comprehension'
      }
    }
  }

  const mapping = subjectMappings[subjectName]
  if (!mapping) return []

  // Try to find matching section
  const matchingSection = Object.keys(mapping.sections).find(section => 
    topicName.includes(section) || section.includes(topicName)
  )

  const links = []
  
  if (matchingSection) {
    links.push({
      title: `${subjectName} - ${matchingSection}`,
      url: mapping.baseUrl + mapping.sections[matchingSection],
      description: `Focused resources for ${matchingSection}`
    })
  }

  // Add general subject link
  links.push({
    title: `${subjectName} overview`,
    url: mapping.baseUrl,
    description: `General ${subjectName} resources`
  })

  return links
}

/**
 * Get search description based on search term and accuracy
 * @param {string} searchTerm - The search term
 * @param {number} accuracy - Accuracy percentage
 * @returns {string} Description for the search link
 */
const getSearchDescription = (searchTerm, accuracy) => {
  if (searchTerm.includes('basics') || searchTerm.includes('introduction')) {
    return 'Start with fundamental concepts'
  } else if (searchTerm.includes('practice') || searchTerm.includes('examples')) {
    return 'Practice problems and worked examples'
  } else if (searchTerm.includes('advanced') || searchTerm.includes('applications')) {
    return 'Advanced topics and real-world applications'
  } else if (searchTerm.includes('review')) {
    return 'Review and reinforcement materials'
  } else {
    return 'General resources and explanations'
  }
}

/**
 * Determine performance level based on accuracy
 * @param {number} accuracy - Accuracy percentage
 * @returns {Object} Performance level information
 */
const getPerformanceLevel = (accuracy) => {
  if (accuracy >= 90) {
    return {
      level: 'Excellent',
      grade: 'A',
      color: '#22c55e', // green
      message: 'Outstanding performance!'
    }
  } else if (accuracy >= 80) {
    return {
      level: 'Good',
      grade: 'B',
      color: '#3b82f6', // blue
      message: 'Good understanding, minor improvements possible'
    }
  } else if (accuracy >= 70) {
    return {
      level: 'Fair',
      grade: 'C',
      color: '#f59e0b', // yellow
      message: 'Adequate performance, some review recommended'
    }
  } else if (accuracy >= 60) {
    return {
      level: 'Needs Improvement',
      grade: 'D',
      color: '#f97316', // orange
      message: 'Significant improvement needed'
    }
  } else {
    return {
      level: 'Poor',
      grade: 'F',
      color: '#ef4444', // red
      message: 'Requires focused study and practice'
    }
  }
}

/**
 * Get improvement recommendations based on topic and accuracy
 * @param {string} topicName - Name of the topic
 * @param {number} accuracy - Accuracy percentage
 * @returns {Array} Array of specific recommendations
 */
const getImprovementRecommendations = (topicName, accuracy) => {
  const recommendations = []
  
  if (accuracy < 50) {
    recommendations.push(`Start with ${topicName} fundamentals`)
    recommendations.push('Focus on basic concepts before moving to advanced topics')
    recommendations.push('Practice simple problems daily')
    recommendations.push('Consider seeking additional help or tutoring')
  } else if (accuracy < 70) {
    recommendations.push(`Review ${topicName} concepts`)
    recommendations.push('Practice more problems in this area')
    recommendations.push('Focus on understanding rather than memorization')
    recommendations.push('Try explaining concepts to others')
  } else if (accuracy < 85) {
    recommendations.push('Practice advanced problems')
    recommendations.push('Apply knowledge to real-world scenarios')
    recommendations.push('Review any specific areas of difficulty')
  } else {
    recommendations.push('Maintain current performance level')
    recommendations.push('Explore advanced applications')
    recommendations.push('Consider helping others in this topic')
  }

  return recommendations
}

/**
 * Calculate summary statistics for topic performance
 * @param {Array} performanceData - Array of topic performance objects
 * @returns {Object} Summary statistics
 */
const calculateTopicSummary = (performanceData) => {
  if (!performanceData.length) return null

  const totalTopics = performanceData.length
  const averageAccuracy = performanceData.reduce((sum, topic) => sum + topic.accuracy, 0) / totalTopics
  const topicsNeedingImprovement = performanceData.filter(topic => topic.needsImprovement).length
  const strongTopics = performanceData.filter(topic => topic.accuracy >= 80).length
  const weakestTopic = performanceData[0] // Already sorted by accuracy (lowest first)
  const strongestTopic = performanceData[performanceData.length - 1]

  return {
    totalTopics,
    averageAccuracy: Math.round(averageAccuracy * 100) / 100,
    topicsNeedingImprovement,
    strongTopics,
    improvementRate: Math.round(((totalTopics - topicsNeedingImprovement) / totalTopics) * 100),
    weakestTopic: {
      name: weakestTopic.topicName,
      accuracy: weakestTopic.accuracy
    },
    strongestTopic: {
      name: strongestTopic.topicName,
      accuracy: strongestTopic.accuracy
    },
    recommendations: generateOverallRecommendations(averageAccuracy, topicsNeedingImprovement, totalTopics)
  }
}

/**
 * Generate overall recommendations based on summary statistics
 * @param {number} averageAccuracy - Average accuracy across all topics
 * @param {number} topicsNeedingImprovement - Number of topics needing improvement
 * @param {number} totalTopics - Total number of topics
 * @returns {Array} Array of overall recommendations
 */
const generateOverallRecommendations = (averageAccuracy, topicsNeedingImprovement, totalTopics) => {
  const recommendations = []
  const improvementPercentage = (topicsNeedingImprovement / totalTopics) * 100

  if (improvementPercentage > 50) {
    recommendations.push('Focus on fundamental concepts across multiple topics')
    recommendations.push('Consider reviewing prerequisite material')
    recommendations.push('Schedule regular study sessions')
  } else if (improvementPercentage > 25) {
    recommendations.push('Target specific weak areas for improvement')
    recommendations.push('Practice regularly in challenging topics')
  } else {
    recommendations.push('Maintain strong performance')
    recommendations.push('Challenge yourself with advanced problems')
  }

  if (averageAccuracy < 60) {
    recommendations.push('Seek additional help or tutoring')
    recommendations.push('Use Khan Academy basics courses')
  } else if (averageAccuracy < 80) {
    recommendations.push('Increase practice time')
    recommendations.push('Focus on understanding concepts deeply')
  }

  return recommendations
}

// =============================================
// ADDITIONAL QUESTION UTILITY FUNCTIONS
// =============================================

// Get random questions by difficulty level
export const getRandomQuestionsByDifficulty = async (subjectId, difficulty = 'medium', limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        difficulty_level,
        explanation,
        topics!inner(
          id,
          name,
          subject_id,
          subjects!inner(
            id,
            name
          )
        )
      `)
      .eq('topics.subject_id', subjectId)
      .eq('difficulty_level', difficulty)
      .limit(limit * 2) // Get more to shuffle from

    if (error) throw error

    // Shuffle and limit
    const shuffled = (data || []).sort(() => Math.random() - 0.5).slice(0, limit)

    const formattedQuestions = shuffled.map(question => ({
      id: question.id,
      question: question.question,
      options: {
        a: question.option_a,
        b: question.option_b,
        c: question.option_c,
        d: question.option_d
      },
      correctOption: question.correct_option,
      difficulty: question.difficulty_level,
      explanation: question.explanation,
      topic: {
        id: question.topics.id,
        name: question.topics.name
      },
      subject: {
        id: question.topics.subjects.id,
        name: question.topics.subjects.name
      }
    }))

    return {
      success: true,
      data: formattedQuestions,
      total: formattedQuestions.length
    }

  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message
    }
  }
}

// Get questions count by subject
export const getQuestionsCountBySubject = async (subjectId) => {
  try {
    const { count, error } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('topics.subject_id', subjectId, { referencedTable: 'topics' })

    if (error) throw error

    return {
      success: true,
      count: count || 0
    }
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: error.message
    }
  }
}

// Get mixed difficulty questions for adaptive testing
export const getMixedDifficultyQuestions = async (subjectId, totalQuestions = 20) => {
  try {
    // Calculate distribution: 40% easy, 40% medium, 20% hard
    const easyCount = Math.floor(totalQuestions * 0.4)
    const mediumCount = Math.floor(totalQuestions * 0.4)
    const hardCount = totalQuestions - easyCount - mediumCount

    const [easyResult, mediumResult, hardResult] = await Promise.all([
      getRandomQuestionsByDifficulty(subjectId, 'easy', easyCount),
      getRandomQuestionsByDifficulty(subjectId, 'medium', mediumCount),
      getRandomQuestionsByDifficulty(subjectId, 'hard', hardCount)
    ])

    // Combine all questions
    const allQuestions = [
      ...(easyResult.data || []),
      ...(mediumResult.data || []),
      ...(hardResult.data || [])
    ]

    // Shuffle the combined questions
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5)

    return {
      success: true,
      data: shuffledQuestions,
      total: shuffledQuestions.length,
      distribution: {
        easy: easyResult.data?.length || 0,
        medium: mediumResult.data?.length || 0,
        hard: hardResult.data?.length || 0
      }
    }

  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message
    }
  }
}

// Get questions by multiple topics
export const getQuestionsByTopics = async (topicIds, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        difficulty_level,
        explanation,
        topics!inner(
          id,
          name,
          subjects(id, name)
        )
      `)
      .in('topic_id', topicIds)
      .limit(limit)

    if (error) throw error

    // Shuffle results
    const shuffledData = (data || []).sort(() => Math.random() - 0.5)

    const formattedQuestions = shuffledData.map(question => ({
      id: question.id,
      question: question.question,
      options: {
        a: question.option_a,
        b: question.option_b,
        c: question.option_c,
        d: question.option_d
      },
      correctOption: question.correct_option,
      difficulty: question.difficulty_level,
      explanation: question.explanation,
      topic: {
        id: question.topics.id,
        name: question.topics.name
      }
    }))

    return {
      success: true,
      data: formattedQuestions,
      total: formattedQuestions.length
    }

  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message
    }
  }
}

// Validate question answer
export const validateAnswer = (question, selectedOption) => {
  const isCorrect = question.correctOption === selectedOption
  return {
    isCorrect,
    correctAnswer: question.correctOption,
    selectedAnswer: selectedOption,
    explanation: question.explanation || null
  }
}

// Calculate test score
export const calculateTestScore = (questions, answers) => {
  let correct = 0
  const results = []

  questions.forEach((question, index) => {
    const userAnswer = answers[index]
    const validation = validateAnswer(question, userAnswer)
    
    if (validation.isCorrect) {
      correct++
    }
    
    results.push({
      questionId: question.id,
      question: question.question,
      userAnswer,
      correctAnswer: validation.correctAnswer,
      isCorrect: validation.isCorrect,
      explanation: validation.explanation
    })
  })

  const total = questions.length
  const percentage = total > 0 ? (correct / total) * 100 : 0

  return {
    correct,
    total,
    percentage: Math.round(percentage * 100) / 100,
    results
  }
}

// =============================================
// Subject statistics helper (Supabase-backed)
// Returns totalQuestions, difficultyDistribution, topicDistribution and topics list
export const getSubjectStatistics = async (subjectName) => {
  try {
    // Find subject id by name (case-insensitive)
    const { data: subjectRow, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .ilike('name', subjectName)
      .limit(1)
      .single();

    if (subjectError || !subjectRow) {
      return {
        totalQuestions: 0,
        difficultyDistribution: { easy: 0, medium: 0, hard: 0 },
        topicDistribution: {},
        topics: []
      };
    }

    const subjectId = subjectRow.id;

    // Total questions count (via related topics)
    const { count: totalCount } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('topics.subject_id', subjectId);

    // Counts by difficulty
    const difficultyDistribution = { easy: 0, medium: 0, hard: 0 };
    for (const level of ['easy', 'medium', 'hard']) {
      const { count } = await supabase
        .from('questions')
        .select('id', { count: 'exact', head: true })
        .eq('difficulty_level', level)
        .eq('topics.subject_id', subjectId);
      difficultyDistribution[level] = count || 0;
    }

    // Topics and per-topic counts
    const { data: topicsData } = await supabase
      .from('topics')
      .select('id, name')
      .eq('subject_id', subjectId)
      .order('name');

    const topicDistribution = {};
    if (Array.isArray(topicsData)) {
      for (const t of topicsData) {
        const { count } = await supabase
          .from('questions')
          .select('id', { count: 'exact', head: true })
          .eq('topic_id', t.id);
        topicDistribution[t.name] = count || 0;
      }
    }

    return {
      totalQuestions: totalCount || 0,
      difficultyDistribution,
      topicDistribution,
      topics: topicsData || []
    };
  } catch (error) {
    console.error('getSubjectStatistics error:', error);
    return {
      totalQuestions: 0,
      difficultyDistribution: { easy: 0, medium: 0, hard: 0 },
      topicDistribution: {},
      topics: []
    };
  }
};

// =============================================
// REAL-TIME SUBSCRIPTIONS (OPTIONAL)
// =============================================

// Subscribe to test_history changes for current user
export const subscribeToUserTests = (callback) => {
  return supabase
    .channel('user_tests')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'test_history',
        filter: `user_id=eq.${getCurrentUser()?.id}`
      },
      callback
    )
    .subscribe()
}

// Unsubscribe from real-time updates
export const unsubscribeFromChannel = (subscription) => {
  supabase.removeChannel(subscription)
}