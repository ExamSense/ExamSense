// Usage Examples for getUserHistory Function
// This file demonstrates how to use the getUserHistory function in ExamSense

import { 
  getUserHistory, 
  getCurrentUserHistory, 
  getUserHistoryBySubject,
  getRecentUserHistory,
  getUserHistoryWithTrends 
} from './supabaseOperations.js'
import React, { useState, useEffect } from 'react'

// =============================================
// BASIC USAGE EXAMPLES
// =============================================

/**
 * Example 1: Basic user history retrieval
 */
export const basicUserHistoryExample = async () => {
  try {
    const userId = 'user-uuid-here' // Replace with actual user UUID
    const result = await getUserHistory(userId)
    
    if (result.success) {
      console.log('User Test History:')
      console.log('Summary:', result.summary)
      
      result.data.forEach((test, index) => {
        console.log(`\nTest #${index + 1}:`)
        console.log(`Subject: ${test.subject.name}`)
        console.log(`Score: ${test.score}/${test.totalQuestions} (${test.percentage}%)`)
        console.log(`Grade: ${test.performance.grade}`)
        console.log(`Date: ${test.dates.takenFormatted}`)
        console.log(`Duration: ${test.duration.formatted}`)
        console.log(`Status: ${test.status}`)
      })
      
      return result
    } else {
      console.error('Error:', result.error)
    }
  } catch (error) {
    console.error('Failed to fetch user history:', error)
  }
}

/**
 * Example 2: Get current user's history with pagination
 */
export const currentUserHistoryExample = async () => {
  try {
    const options = {
      limit: 10,
      offset: 0,
      includeTopicPerformance: true
    }
    
    const result = await getCurrentUserHistory(options)
    
    if (result.success) {
      console.log(`Retrieved ${result.data.length} tests`)
      console.log('Overall Performance:')
      console.log(`- Average Score: ${result.summary.overview.averagePercentage}%`)
      console.log(`- Pass Rate: ${result.summary.overview.passRate}%`)
      console.log(`- Trend: ${result.summary.trends.direction}`)
      
      // Show recent performance
      console.log('\nRecent Tests:')
      result.data.slice(0, 5).forEach(test => {
        console.log(`${test.subject.name}: ${test.percentage}% (${test.dates.takenFormatted})`)
        
        // Show topic performance if included
        if (test.topicPerformance) {
          test.topicPerformance.forEach(topic => {
            console.log(`  - ${topic.topicName}: ${topic.accuracy}%`)
          })
        }
      })
      
      return result
    }
  } catch (error) {
    console.error('Error fetching current user history:', error)
  }
}

/**
 * Example 3: Filter history by subject and date range
 */
export const filteredHistoryExample = async () => {
  try {
    const userId = 'user-uuid-here'
    const options = {
      subjectId: 1, // Mathematics
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
      minScore: 70, // Only tests with 70% or higher
      limit: 20
    }
    
    const result = await getUserHistory(userId, options)
    
    if (result.success) {
      console.log('Filtered History (Math tests, last 30 days, 70%+ scores):')
      console.log(`Found ${result.data.length} matching tests`)
      
      if (result.data.length > 0) {
        const averageScore = result.data.reduce((sum, test) => sum + test.percentage, 0) / result.data.length
        console.log(`Average score in filtered results: ${averageScore.toFixed(1)}%`)
        
        result.data.forEach(test => {
          console.log(`${test.dates.takenFormatted}: ${test.percentage}% (${test.score}/${test.totalQuestions})`)
        })
      }
      
      return result
    }
  } catch (error) {
    console.error('Error fetching filtered history:', error)
  }
}

// =============================================
// REACT COMPONENT EXAMPLES
// =============================================

/**
 * React Hook for user history
 */
export const useUserHistory = (userId, options = {}) => {
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHistory = async () => {
    if (!userId) return

    setLoading(true)
    setError(null)
    
    try {
      const result = await getUserHistory(userId, options)
      
      if (result.success) {
        setHistory(result)
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
    fetchHistory()
  }, [userId, JSON.stringify(options)])

  return { history, loading, error, refetch: fetchHistory }
}

/**
 * React Component: User History Dashboard
 */
export const UserHistoryDashboard = ({ userId }) => {
  const { history, loading, error } = useUserHistory(userId, { 
    limit: 20, 
    includeTopicPerformance: true 
  })
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list', 'chart', 'summary'

  if (loading) return <div className="loading">Loading test history...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!history || !history.data.length) return <div>No test history found</div>

  const { data: tests, summary } = history
  const subjects = [...new Set(tests.map(test => test.subject.name))]
  
  const filteredTests = selectedSubject === 'all' 
    ? tests 
    : tests.filter(test => test.subject.name === selectedSubject)

  return (
    <div className="user-history-dashboard">
      <div className="dashboard-header">
        <h2>Test History Dashboard</h2>
        <div className="controls">
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="subject-filter"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          
          <div className="view-mode-buttons">
            <button 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'active' : ''}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('summary')}
              className={viewMode === 'summary' ? 'active' : ''}
            >
              Summary
            </button>
            <button 
              onClick={() => setViewMode('chart')}
              className={viewMode === 'chart' ? 'active' : ''}
            >
              Chart
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'summary' && <HistorySummary summary={summary} />}
      {viewMode === 'list' && <HistoryList tests={filteredTests} />}
      {viewMode === 'chart' && <HistoryChart tests={filteredTests} />}
    </div>
  )
}

/**
 * React Component: History Summary
 */
export const HistorySummary = ({ summary }) => {
  if (!summary) return null

  return (
    <div className="history-summary">
      <div className="summary-grid">
        <div className="summary-card">
          <h3>Overall Performance</h3>
          <div className="stats">
            <div className="stat">
              <label>Total Tests:</label>
              <span>{summary.overview.totalTests}</span>
            </div>
            <div className="stat">
              <label>Average Score:</label>
              <span>{summary.overview.averagePercentage}%</span>
            </div>
            <div className="stat">
              <label>Pass Rate:</label>
              <span>{summary.overview.passRate}%</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h3>Performance Distribution</h3>
          <div className="performance-bars">
            <div className="performance-bar">
              <span>Excellent (A):</span>
              <div className="bar">
                <div 
                  className="fill excellent" 
                  style={{ width: `${(summary.performance.excellent / summary.overview.totalTests) * 100}%` }}
                ></div>
              </div>
              <span>{summary.performance.excellent}</span>
            </div>
            <div className="performance-bar">
              <span>Good (B):</span>
              <div className="bar">
                <div 
                  className="fill good" 
                  style={{ width: `${(summary.performance.good / summary.overview.totalTests) * 100}%` }}
                ></div>
              </div>
              <span>{summary.performance.good}</span>
            </div>
            <div className="performance-bar">
              <span>Fair (C):</span>
              <div className="bar">
                <div 
                  className="fill fair" 
                  style={{ width: `${(summary.performance.fair / summary.overview.totalTests) * 100}%` }}
                ></div>
              </div>
              <span>{summary.performance.fair}</span>
            </div>
            <div className="performance-bar">
              <span>Needs Improvement (D):</span>
              <div className="bar">
                <div 
                  className="fill needs-improvement" 
                  style={{ width: `${(summary.performance.needsImprovement / summary.overview.totalTests) * 100}%` }}
                ></div>
              </div>
              <span>{summary.performance.needsImprovement}</span>
            </div>
            <div className="performance-bar">
              <span>Poor (F):</span>
              <div className="bar">
                <div 
                  className="fill poor" 
                  style={{ width: `${(summary.performance.poor / summary.overview.totalTests) * 100}%` }}
                ></div>
              </div>
              <span>{summary.performance.poor}</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h3>Subjects Performance</h3>
          <div className="subjects-list">
            {summary.subjects.map(subject => (
              <div key={subject.name} className="subject-item">
                <span className="subject-name">{subject.name}</span>
                <span className="subject-stats">
                  {subject.tests} tests, {subject.averagePercentage.toFixed(1)}% avg
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="summary-card">
          <h3>Performance Trend</h3>
          <div className="trend-info">
            <div className={`trend-indicator ${summary.trends.direction}`}>
              {summary.trends.direction === 'improving' && '📈'}
              {summary.trends.direction === 'declining' && '📉'}
              {summary.trends.direction === 'stable' && '➡️'}
              <span className="trend-text">
                {summary.trends.direction.charAt(0).toUpperCase() + summary.trends.direction.slice(1)}
              </span>
            </div>
            <div className="trend-details">
              <p>Change: {summary.trends.change > 0 ? '+' : ''}{summary.trends.change}%</p>
              <p>Recent Average: {summary.trends.recentAverage}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * React Component: History List View
 */
export const HistoryList = ({ tests }) => {
  return (
    <div className="history-list">
      <div className="list-header">
        <span>Subject</span>
        <span>Score</span>
        <span>Grade</span>
        <span>Date</span>
        <span>Duration</span>
        <span>Status</span>
      </div>
      
      {tests.map(test => (
        <div key={test.testId} className="list-item">
          <span className="subject">{test.subject.name}</span>
          <span className="score">
            {test.score}/{test.totalQuestions} ({test.percentage}%)
          </span>
          <span className={`grade grade-${test.performance.grade.toLowerCase()}`}>
            {test.performance.grade}
          </span>
          <span className="date">{test.dates.takenFormatted}</span>
          <span className="duration">{test.duration.formatted}</span>
          <span className={`status status-${test.status}`}>{test.status}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * React Component: History Chart View (Simple line chart)
 */
export const HistoryChart = ({ tests }) => {
  // This is a simplified chart component
  // In a real app, you'd use a charting library like Chart.js or Recharts
  
  const chartData = tests
    .slice()
    .reverse() // Oldest to newest for chart
    .map((test, index) => ({
      x: index,
      y: test.percentage,
      date: test.dates.takenFormatted,
      subject: test.subject.name
    }))

  const maxScore = Math.max(...chartData.map(d => d.y))
  const minScore = Math.min(...chartData.map(d => d.y))

  return (
    <div className="history-chart">
      <h3>Performance Over Time</h3>
      <div className="chart-container">
        <svg width="100%" height="300" viewBox="0 0 800 300">
          {/* Chart background */}
          <rect width="800" height="300" fill="#f8f9fa" />
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(score => (
            <g key={score}>
              <line 
                x1="50" 
                y1={250 - (score * 2)} 
                x2="750" 
                y2={250 - (score * 2)} 
                stroke="#e9ecef" 
                strokeWidth="1"
              />
              <text 
                x="30" 
                y={255 - (score * 2)} 
                fontSize="12" 
                fill="#6c757d"
              >
                {score}%
              </text>
            </g>
          ))}
          
          {/* Data line */}
          {chartData.length > 1 && (
            <polyline
              points={chartData.map((d, i) => 
                `${50 + (i * (700 / (chartData.length - 1)))},${250 - (d.y * 2)}`
              ).join(' ')}
              fill="none"
              stroke="#007bff"
              strokeWidth="2"
            />
          )}
          
          {/* Data points */}
          {chartData.map((d, i) => (
            <g key={i}>
              <circle
                cx={50 + (i * (700 / Math.max(1, chartData.length - 1)))}
                cy={250 - (d.y * 2)}
                r="4"
                fill="#007bff"
              />
              <title>{`${d.subject}: ${d.y}% (${d.date})`}</title>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

// =============================================
// ADVANCED USAGE EXAMPLES
// =============================================

/**
 * Example 4: Performance analysis with trends
 */
export const performanceAnalysisExample = async () => {
  try {
    const userId = 'user-uuid-here'
    const result = await getUserHistoryWithTrends(userId, { period: 90 }) // Last 90 days
    
    if (result.success) {
      console.log('Performance Analysis (Last 90 days):')
      console.log('Overall Summary:', result.summary)
      console.log('Trends:', result.trends)
      
      // Identify areas for improvement
      const subjectPerformance = result.summary.subjects.sort((a, b) => a.averagePercentage - b.averagePercentage)
      
      console.log('\nSubjects ranked by performance (lowest first):')
      subjectPerformance.forEach((subject, index) => {
        console.log(`${index + 1}. ${subject.name}: ${subject.averagePercentage.toFixed(1)}% (${subject.tests} tests)`)
      })
      
      // Trend analysis
      if (result.trends.trend === 'improving') {
        console.log('\n🎉 Great news! Your performance is improving!')
        console.log(`Projected next test score: ${result.trends.projected.nextTest}%`)
      } else if (result.trends.trend === 'declining') {
        console.log('\n⚠️ Your performance seems to be declining. Consider reviewing study methods.')
      } else {
        console.log('\n➡️ Your performance is stable.')
      }
      
      return result
    }
  } catch (error) {
    console.error('Error in performance analysis:', error)
  }
}

/**
 * Example 5: Export history to CSV
 */
export const exportHistoryToCSV = async (userId) => {
  try {
    const result = await getUserHistory(userId, { limit: 100 })
    
    if (result.success) {
      const headers = [
        'Test ID',
        'Subject',
        'Score',
        'Total Questions',
        'Percentage',
        'Grade',
        'Duration (minutes)',
        'Status',
        'Date Taken',
        'Date Completed'
      ]
      
      const rows = result.data.map(test => [
        test.testId,
        test.subject.name,
        test.score,
        test.totalQuestions,
        test.percentage,
        test.performance.grade,
        test.duration.minutes || 0,
        test.status,
        test.dates.taken,
        test.dates.completed || ''
      ])
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')
      
      // In a browser environment, you could trigger a download
      console.log('CSV Content:')
      console.log(csvContent)
      
      return csvContent
    }
  } catch (error) {
    console.error('Error exporting history:', error)
  }
}

/**
 * Example 6: Study recommendations based on history
 */
export const generateStudyRecommendations = async (userId) => {
  try {
    const result = await getUserHistory(userId, { 
      limit: 20, 
      includeTopicPerformance: true 
    })
    
    if (result.success) {
      const { data: tests, summary } = result
      
      const recommendations = []
      
      // Analyze weak subjects
      const weakSubjects = summary.subjects.filter(subject => subject.averagePercentage < 70)
      if (weakSubjects.length > 0) {
        recommendations.push({
          type: 'weak_subjects',
          priority: 'high',
          message: `Focus on improving in: ${weakSubjects.map(s => s.name).join(', ')}`,
          subjects: weakSubjects
        })
      }
      
      // Analyze recent performance
      const recentTests = tests.slice(0, 5)
      const recentAverage = recentTests.reduce((sum, test) => sum + test.percentage, 0) / recentTests.length
      
      if (recentAverage < summary.overview.averagePercentage) {
        recommendations.push({
          type: 'recent_decline',
          priority: 'medium',
          message: 'Recent performance is below your average. Consider reviewing study methods.',
          recentAverage,
          overallAverage: summary.overview.averagePercentage
        })
      }
      
      // Analyze topic performance
      const allTopicPerformance = tests
        .filter(test => test.topicPerformance)
        .flatMap(test => test.topicPerformance)
      
      const topicSummary = allTopicPerformance.reduce((acc, topic) => {
        if (!acc[topic.topicName]) {
          acc[topic.topicName] = { total: 0, correct: 0, count: 0 }
        }
        acc[topic.topicName].total += topic.total
        acc[topic.topicName].correct += topic.correct
        acc[topic.topicName].count += 1
        return acc
      }, {})
      
      const weakTopics = Object.entries(topicSummary)
        .map(([name, data]) => ({
          name,
          accuracy: (data.correct / data.total) * 100,
          tests: data.count
        }))
        .filter(topic => topic.accuracy < 60 && topic.tests >= 2)
        .sort((a, b) => a.accuracy - b.accuracy)
      
      if (weakTopics.length > 0) {
        recommendations.push({
          type: 'weak_topics',
          priority: 'high',
          message: `Focus on these challenging topics: ${weakTopics.slice(0, 3).map(t => t.name).join(', ')}`,
          topics: weakTopics.slice(0, 3)
        })
      }
      
      // Analyze consistency
      const scores = tests.map(test => test.percentage)
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - summary.overview.averagePercentage, 2), 0) / scores.length
      const standardDeviation = Math.sqrt(variance)
      
      if (standardDeviation > 15) {
        recommendations.push({
          type: 'inconsistent_performance',
          priority: 'medium',
          message: 'Your performance varies significantly. Focus on consistent study habits.',
          standardDeviation
        })
      }
      
      console.log('Study Recommendations:')
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`)
      })
      
      return {
        success: true,
        recommendations,
        summary
      }
    }
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return {
      success: false,
      error: error.message
    }
  }
}