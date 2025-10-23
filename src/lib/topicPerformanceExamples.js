// Usage Examples for getTopicPerformance Function
// This file demonstrates how to use the getTopicPerformance function in ExamSense

import { getTopicPerformance } from './supabaseOperations.js'
import React, { useState, useEffect } from 'react'

// =============================================
// BASIC USAGE EXAMPLES
// =============================================

/**
 * Example 1: Basic topic performance retrieval
 */
export const basicTopicPerformanceExample = async () => {
  try {
    const testId = 123 // Replace with actual test ID
    const result = await getTopicPerformance(testId)
    
    if (result.success) {
      console.log('Topic Performance Data:', result.data)
      console.log('Summary:', result.summary)
      
      // Display individual topic performance
      result.data.forEach(topic => {
        console.log(`Topic: ${topic.topicName}`)
        console.log(`Accuracy: ${topic.accuracy}%`)
        console.log(`Performance Level: ${topic.performanceLevel.level}`)
        console.log(`Needs Improvement: ${topic.needsImprovement ? 'Yes' : 'No'}`)
        console.log(`Khan Academy Link: ${topic.khanAcademyLinks.directLink}`)
        console.log('---')
      })
      
      return result
    } else {
      console.error('Error:', result.error)
    }
  } catch (error) {
    console.error('Failed to fetch topic performance:', error)
  }
}

/**
 * Example 2: Get topic performance with improvement focus
 */
export const improvementFocusedExample = async (testId) => {
  try {
    const result = await getTopicPerformance(testId)
    
    if (result.success) {
      // Filter topics that need improvement
      const topicsNeedingImprovement = result.data.filter(topic => topic.needsImprovement)
      
      console.log(`${topicsNeedingImprovement.length} topics need improvement:`)
      
      topicsNeedingImprovement.forEach(topic => {
        console.log(`\n📚 ${topic.topicName} (${topic.accuracy}%)`)
        console.log('🎯 Recommendations:')
        topic.recommendations.forEach(rec => console.log(`  - ${rec}`))
        
        console.log('🔗 Khan Academy Resources:')
        topic.khanAcademyLinks.searchLinks.forEach(link => {
          console.log(`  - ${link.description}: ${link.url}`)
        })
      })
      
      return topicsNeedingImprovement
    }
  } catch (error) {
    console.error('Error in improvement focus example:', error)
  }
}

// =============================================
// REACT COMPONENT EXAMPLES
// =============================================

/**
 * React Hook for topic performance
 */
export const useTopicPerformance = (testId) => {
  const [topicData, setTopicData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTopicPerformance = async () => {
    if (!testId) return

    setLoading(true)
    setError(null)
    
    try {
      const result = await getTopicPerformance(testId)
      
      if (result.success) {
        setTopicData(result)
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
    fetchTopicPerformance()
  }, [testId])

  return { topicData, loading, error, refetch: fetchTopicPerformance }
}

/**
 * React Component: Topic Performance Dashboard
 */
export const TopicPerformanceDashboard = ({ testId }) => {
  const { topicData, loading, error } = useTopicPerformance(testId)

  if (loading) return <div className="loading">Loading topic performance...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!topicData) return <div>No data available</div>

  const { data: topics, summary } = topicData

  return (
    <div className="topic-performance-dashboard">
      <h2>Topic Performance Analysis</h2>
      
      {/* Summary Section */}
      <div className="summary-section">
        <h3>Summary</h3>
        <div className="summary-stats">
          <div className="stat">
            <label>Average Accuracy:</label>
            <span>{summary.averageAccuracy}%</span>
          </div>
          <div className="stat">
            <label>Topics Analyzed:</label>
            <span>{summary.totalTopics}</span>
          </div>
          <div className="stat">
            <label>Topics Needing Improvement:</label>
            <span>{summary.topicsNeedingImprovement}</span>
          </div>
          <div className="stat">
            <label>Strong Topics:</label>
            <span>{summary.strongTopics}</span>
          </div>
        </div>
        
        <div className="overall-recommendations">
          <h4>Overall Recommendations:</h4>
          <ul>
            {summary.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Individual Topic Performance */}
      <div className="topics-section">
        <h3>Individual Topic Performance</h3>
        {topics.map(topic => (
          <TopicPerformanceCard key={topic.topicId} topic={topic} />
        ))}
      </div>
    </div>
  )
}

/**
 * React Component: Individual Topic Performance Card
 */
export const TopicPerformanceCard = ({ topic }) => {
  const [showResources, setShowResources] = useState(false)

  const getPerformanceColor = (accuracy) => {
    if (accuracy >= 80) return '#22c55e' // green
    if (accuracy >= 70) return '#f59e0b' // yellow
    if (accuracy >= 60) return '#f97316' // orange
    return '#ef4444' // red
  }

  return (
    <div className="topic-card" style={{ borderLeft: `4px solid ${topic.performanceLevel.color}` }}>
      <div className="topic-header">
        <h4>{topic.topicName}</h4>
        <span className="subject-name">{topic.subjectName}</span>
      </div>
      
      <div className="topic-stats">
        <div className="accuracy">
          <span className="label">Accuracy:</span>
          <span className="value" style={{ color: getPerformanceColor(topic.accuracy) }}>
            {topic.accuracy}% ({topic.correct}/{topic.total})
          </span>
        </div>
        <div className="performance-level">
          <span className="label">Level:</span>
          <span className="value" style={{ color: topic.performanceLevel.color }}>
            {topic.performanceLevel.level} ({topic.performanceLevel.grade})
          </span>
        </div>
      </div>

      <p className="performance-message">{topic.performanceLevel.message}</p>
      
      {topic.needsImprovement && (
        <div className="improvement-section">
          <h5>📈 Improvement Recommendations:</h5>
          <ul>
            {topic.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="resources-section">
        <button 
          onClick={() => setShowResources(!showResources)}
          className="toggle-resources-btn"
        >
          {showResources ? 'Hide' : 'Show'} Khan Academy Resources
        </button>
        
        {showResources && (
          <div className="resources-content">
            <h5>🎓 Learning Resources:</h5>
            
            <div className="primary-search">
              <strong>Recommended Search:</strong>
              <a 
                href={topic.khanAcademyLinks.directLink}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-link primary"
              >
                {topic.khanAcademyLinks.recommendedSearch}
              </a>
            </div>

            <div className="search-links">
              <strong>Additional Resources:</strong>
              {topic.khanAcademyLinks.searchLinks.map((link, index) => (
                <div key={index} className="search-link-item">
                  <a 
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-link"
                  >
                    {link.searchTerm}
                  </a>
                  <span className="link-description">{link.description}</span>
                </div>
              ))}
            </div>

            {topic.khanAcademyLinks.subjectSpecific.length > 0 && (
              <div className="subject-specific">
                <strong>Subject-Specific Resources:</strong>
                {topic.khanAcademyLinks.subjectSpecific.map((link, index) => (
                  <div key={index} className="subject-link-item">
                    <a 
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-link subject"
                    >
                      {link.title}
                    </a>
                    <span className="link-description">{link.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * React Component: Improvement Action Plan
 */
export const ImprovementActionPlan = ({ testId }) => {
  const { topicData, loading, error } = useTopicPerformance(testId)

  if (loading || error || !topicData) return null

  const topicsNeedingImprovement = topicData.data.filter(topic => topic.needsImprovement)
  const priorityTopics = topicsNeedingImprovement.slice(0, 3) // Top 3 priority topics

  return (
    <div className="improvement-action-plan">
      <h3>🎯 Your Improvement Action Plan</h3>
      
      {priorityTopics.length === 0 ? (
        <div className="success-message">
          🎉 Great job! All topics are performing well. Consider challenging yourself with advanced problems.
        </div>
      ) : (
        <div className="action-items">
          <p>Focus on these {priorityTopics.length} priority topics for maximum improvement:</p>
          
          {priorityTopics.map((topic, index) => (
            <div key={topic.topicId} className="action-item">
              <div className="priority-header">
                <span className="priority-number">#{index + 1}</span>
                <h4>{topic.topicName}</h4>
                <span className="accuracy-badge">{topic.accuracy}%</span>
              </div>
              
              <div className="action-details">
                <div className="first-step">
                  <strong>Start Here:</strong>
                  <a 
                    href={topic.khanAcademyLinks.searchLinks[0]?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-link"
                  >
                    {topic.khanAcademyLinks.searchLinks[0]?.searchTerm}
                  </a>
                </div>
                
                <div className="key-recommendation">
                  <strong>Key Focus:</strong>
                  <span>{topic.recommendations[0]}</span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="action-plan-footer">
            <p><strong>Study Plan:</strong> Spend 15-20 minutes daily on your #1 priority topic, then rotate through the others.</p>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Export topic performance data to CSV format
 */
export const exportTopicPerformanceToCSV = (topicData) => {
  if (!topicData || !topicData.data) return null

  const headers = [
    'Topic Name',
    'Subject',
    'Accuracy (%)',
    'Correct',
    'Total',
    'Performance Level',
    'Grade',
    'Needs Improvement',
    'Khan Academy Link'
  ]

  const rows = topicData.data.map(topic => [
    topic.topicName,
    topic.subjectName,
    topic.accuracy,
    topic.correct,
    topic.total,
    topic.performanceLevel.level,
    topic.performanceLevel.grade,
    topic.needsImprovement ? 'Yes' : 'No',
    topic.khanAcademyLinks.directLink
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  return csvContent
}

/**
 * Generate study schedule based on topic performance
 */
export const generateStudySchedule = (topicData, daysPerWeek = 5, hoursPerDay = 1) => {
  if (!topicData || !topicData.data) return null

  const topicsNeedingImprovement = topicData.data
    .filter(topic => topic.needsImprovement)
    .sort((a, b) => a.accuracy - b.accuracy) // Prioritize lowest accuracy

  const totalMinutesPerWeek = daysPerWeek * hoursPerDay * 60
  const minutesPerTopic = topicsNeedingImprovement.length > 0 
    ? Math.floor(totalMinutesPerWeek / topicsNeedingImprovement.length)
    : 0

  const schedule = topicsNeedingImprovement.map((topic, index) => ({
    priority: index + 1,
    topicName: topic.topicName,
    accuracy: topic.accuracy,
    weeklyMinutes: minutesPerTopic,
    dailyMinutes: Math.floor(minutesPerTopic / daysPerWeek),
    recommendedResource: topic.khanAcademyLinks.searchLinks[0]?.url,
    focusArea: topic.recommendations[0]
  }))

  return {
    totalTopics: topicsNeedingImprovement.length,
    weeklyCommitment: `${hoursPerDay} hour${hoursPerDay > 1 ? 's' : ''} × ${daysPerWeek} days`,
    schedule: schedule,
    weeklyGoal: `Improve weakest topic (${schedule[0]?.topicName}) by 20%`,
    estimatedImprovementTime: `${Math.ceil(topicsNeedingImprovement.length / 2)} weeks`
  }
}

/**
 * Compare topic performance across multiple tests
 */
export const compareTopicPerformanceAcrossTests = async (testIds) => {
  try {
    const performanceData = await Promise.all(
      testIds.map(testId => getTopicPerformance(testId))
    )

    const successfulResults = performanceData.filter(result => result.success)
    
    if (successfulResults.length === 0) {
      return { success: false, message: 'No valid performance data found' }
    }

    // Group topics across tests
    const topicComparison = new Map()

    successfulResults.forEach((result, testIndex) => {
      result.data.forEach(topic => {
        const key = topic.topicName
        if (!topicComparison.has(key)) {
          topicComparison.set(key, {
            topicName: topic.topicName,
            subjectName: topic.subjectName,
            performances: []
          })
        }
        
        topicComparison.get(key).performances.push({
          testId: testIds[testIndex],
          accuracy: topic.accuracy,
          correct: topic.correct,
          total: topic.total,
          testDate: topic.testInfo.takenAt
        })
      })
    })

    // Calculate trends
    const comparisonResults = Array.from(topicComparison.values()).map(topic => {
      const performances = topic.performances.sort((a, b) => 
        new Date(a.testDate) - new Date(b.testDate)
      )
      
      const trend = performances.length > 1 
        ? performances[performances.length - 1].accuracy - performances[0].accuracy
        : 0

      return {
        ...topic,
        performances,
        trend: Math.round(trend * 100) / 100,
        trendDirection: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
        averageAccuracy: Math.round(
          (performances.reduce((sum, p) => sum + p.accuracy, 0) / performances.length) * 100
        ) / 100
      }
    })

    return {
      success: true,
      data: comparisonResults,
      summary: {
        totalTopics: comparisonResults.length,
        improvingTopics: comparisonResults.filter(t => t.trend > 0).length,
        decliningTopics: comparisonResults.filter(t => t.trend < 0).length,
        stableTopics: comparisonResults.filter(t => t.trend === 0).length
      }
    }

  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to compare topic performance across tests'
    }
  }
}