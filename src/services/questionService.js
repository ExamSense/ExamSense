import { supabase } from '../supabaseClient.js'

/**
 * Question Service
 * Handles fetching questions from Supabase for tests
 */

// Get all subjects
export const getSubjects = async () => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name')

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Get subjects error:', error)
    throw new Error(error.message || 'Failed to fetch subjects')
  }
}

// Get topics for a subject
export const getTopics = async (subjectId) => {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .order('name')

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Get topics error:', error)
    throw new Error(error.message || 'Failed to fetch topics')
  }
}

// Get random questions for a subject/topic
export const getRandomQuestions = async (filters = {}) => {
  try {
    const { 
      subjectId, 
      topicId, 
      limit = 10, 
      difficulty = null,
      excludeQuestionIds = []
    } = filters

    let query = supabase
      .from('questions')
      .select(`
        *,
        topics (
          id,
          name,
          subjects (
            id,
            name
          )
        )
      `)

    // Apply filters
    if (subjectId) {
      query = query.eq('topics.subject_id', subjectId)
    }

    if (topicId) {
      query = query.eq('topic_id', topicId)
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    if (excludeQuestionIds.length > 0) {
      query = query.not('id', 'in', `(${excludeQuestionIds.join(',')})`)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit * 3) // Get more than needed for randomization

    if (error) {
      throw error
    }

    // Randomize the questions and return only the requested amount
    const shuffled = data.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, limit)

  } catch (error) {
    console.error('Get random questions error:', error)
    throw new Error(error.message || 'Failed to fetch questions')
  }
}

// Get a specific question by ID
export const getQuestionById = async (questionId) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        topics (
          id,
          name,
          subjects (
            id,
            name
          )
        )
      `)
      .eq('id', questionId)
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Get question by ID error:', error)
    throw new Error(error.message || 'Failed to fetch question')
  }
}

// Get questions by topic
export const getQuestionsByTopic = async (topicId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        topics (
          id,
          name,
          subjects (
            id,
            name
          )
        )
      `)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Get questions by topic error:', error)
    throw new Error(error.message || 'Failed to fetch questions by topic')
  }
}

// Get questions by difficulty
export const getQuestionsByDifficulty = async (difficulty, subjectId = null, limit = 10) => {
  try {
    let query = supabase
      .from('questions')
      .select(`
        *,
        topics (
          id,
          name,
          subjects (
            id,
            name
          )
        )
      `)
      .eq('difficulty', difficulty)

    if (subjectId) {
      query = query.eq('topics.subject_id', subjectId)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Get questions by difficulty error:', error)
    throw new Error(error.message || 'Failed to fetch questions by difficulty')
  }
}

// Search questions
export const searchQuestions = async (searchTerm, filters = {}) => {
  try {
    const { subjectId, topicId, difficulty, limit = 20 } = filters

    let query = supabase
      .from('questions')
      .select(`
        *,
        topics (
          id,
          name,
          subjects (
            id,
            name
          )
        )
      `)

    // Add text search
    if (searchTerm) {
      query = query.or(`question.ilike.%${searchTerm}%,explanation.ilike.%${searchTerm}%`)
    }

    // Apply filters
    if (subjectId) {
      query = query.eq('topics.subject_id', subjectId)
    }

    if (topicId) {
      query = query.eq('topic_id', topicId)
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Search questions error:', error)
    throw new Error(error.message || 'Failed to search questions')
  }
}

// Validate answer for a question
export const validateAnswer = (question, userAnswer) => {
  if (!question || userAnswer === null || userAnswer === undefined) {
    return false
  }

  // Convert to string for comparison (handle both string and number indices)
  const correctAnswer = question.correct_answer.toString()
  const providedAnswer = userAnswer.toString()

  return correctAnswer === providedAnswer
}

// Calculate question statistics
export const getQuestionStats = async (questionId) => {
  try {
    const { data, error } = await supabase
      .from('user_answers')
      .select('is_correct')
      .eq('question_id', questionId)

    if (error) {
      throw error
    }

    const totalAttempts = data.length
    const correctAttempts = data.filter(answer => answer.is_correct).length
    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0

    return {
      totalAttempts,
      correctAttempts,
      accuracy: Math.round(accuracy * 100) / 100
    }
  } catch (error) {
    console.error('Get question stats error:', error)
    throw new Error(error.message || 'Failed to get question statistics')
  }
}

export default {
  getSubjects,
  getTopics,
  getRandomQuestions,
  getQuestionById,
  getQuestionsByTopic,
  getQuestionsByDifficulty,
  searchQuestions,
  validateAnswer,
  getQuestionStats
}