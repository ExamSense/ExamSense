import type { Question } from '@/data/questionBank';

/**
 * Score calculation result
 */
export interface ScoreResult {
  correct: number;
  incorrect: number;
  unanswered: number;
  percentage: number;
}

/**
 * Topic performance result
 */
export interface TopicPerformance {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

/**
 * Overall performance level
 */
export type PerformanceLevel = 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';

/**
 * Insights summary result
 */
export interface InsightsSummary {
  overallPerformance: PerformanceLevel;
  strongestTopic: string;
  weakestTopic: string;
  improvementPotential: string;
}

/**
 * Calculate overall score from answers and questions
 * 
 * @param answers - Array of user answers (null for unanswered)
 * @param questions - Array of questions
 * @returns Score result with correct, incorrect, unanswered counts and percentage
 * 
 * @example
 * ```ts
 * const score = calculateScore(answers, questions);
 * console.log(`You got ${score.correct} out of ${questions.length} correct!`);
 * ```
 */
export function calculateScore(
  answers: (number | null)[],
  questions: Question[]
): ScoreResult {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  answers.forEach((answer, index) => {
    if (answer === null) {
      unanswered++;
    } else if (answer === questions[index]?.correctAnswer) {
      correct++;
    } else {
      incorrect++;
    }
  });

  const percentage = questions.length > 0 
    ? Math.round((correct / questions.length) * 100) 
    : 0;

  return {
    correct,
    incorrect,
    unanswered,
    percentage
  };
}

/**
 * Calculate performance by topic
 * Groups questions by topic and calculates score for each
 * 
 * @param answers - Array of user answers (null for unanswered)
 * @param questions - Array of questions
 * @returns Array of topic performance results
 * 
 * @example
 * ```ts
 * const topicPerf = calculateTopicPerformance(answers, questions);
 * topicPerf.forEach(t => console.log(`${t.topic}: ${t.percentage}%`));
 * ```
 */
export function calculateTopicPerformance(
  answers: (number | null)[],
  questions: Question[]
): TopicPerformance[] {
  // Group questions by topic
  const topicMap = new Map<string, { correct: number; total: number }>();

  questions.forEach((question, index) => {
    const topic = question.topic;
    const answer = answers[index];

    if (!topicMap.has(topic)) {
      topicMap.set(topic, { correct: 0, total: 0 });
    }

    const topicData = topicMap.get(topic)!;
    topicData.total++;

    // Only count as correct if answered correctly (not null and matches correct answer)
    if (answer !== null && answer === question.correctAnswer) {
      topicData.correct++;
    }
  });

  // Convert map to array and calculate percentages
  const topicPerformance: TopicPerformance[] = [];
  
  topicMap.forEach((data, topic) => {
    const percentage = data.total > 0 
      ? Math.round((data.correct / data.total) * 100) 
      : 0;
    
    topicPerformance.push({
      topic,
      correct: data.correct,
      total: data.total,
      percentage
    });
  });

  // Sort by percentage descending
  return topicPerformance.sort((a, b) => b.percentage - a.percentage);
}

/**
 * Identify strong topics based on performance threshold
 * 
 * @param topicPerformance - Array of topic performance results
 * @param threshold - Minimum percentage to be considered strong (default: 75)
 * @returns Array of strong topics
 * 
 * @example
 * ```ts
 * const strongTopics = identifyStrongTopics(topicPerf, 80);
 * console.log('You excel at:', strongTopics.join(', '));
 * ```
 */
export function identifyStrongTopics(
  topicPerformance: TopicPerformance[],
  threshold: number = 75
): TopicPerformance[] {
  return topicPerformance.filter(topic => topic.percentage >= threshold);
}

/**
 * Identify weak topics based on performance threshold
 * 
 * @param topicPerformance - Array of topic performance results
 * @param threshold - Maximum percentage to be considered weak (default: 60)
 * @returns Array of weak topics
 * 
 * @example
 * ```ts
 * const weakTopics = identifyWeakTopics(topicPerf, 50);
 * console.log('Focus on:', weakTopics.map(t => t.topic).join(', '));
 * ```
 */
export function identifyWeakTopics(
  topicPerformance: TopicPerformance[],
  threshold: number = 60
): TopicPerformance[] {
  return topicPerformance.filter(topic => topic.percentage < threshold);
}

/**
 * Generate insights summary from score and topic performance
 * 
 * @param score - Overall score result
 * @param topicPerformance - Array of topic performance results
 * @returns Insights summary with performance level and recommendations
 * 
 * @example
 * ```ts
 * const insights = generateInsightsSummary(score, topicPerf);
 * console.log(`Overall: ${insights.overallPerformance}`);
 * console.log(`Strongest: ${insights.strongestTopic}`);
 * ```
 */
export function generateInsightsSummary(
  score: ScoreResult,
  topicPerformance: TopicPerformance[]
): InsightsSummary {
  // Determine overall performance level
  let overallPerformance: PerformanceLevel;
  if (score.percentage >= 80) {
    overallPerformance = 'Excellent';
  } else if (score.percentage >= 65) {
    overallPerformance = 'Good';
  } else if (score.percentage >= 50) {
    overallPerformance = 'Fair';
  } else {
    overallPerformance = 'Needs Improvement';
  }

  // Find strongest and weakest topics
  const sortedTopics = [...topicPerformance].sort((a, b) => b.percentage - a.percentage);
  const strongestTopic = sortedTopics[0]?.topic || 'N/A';
  const weakestTopic = sortedTopics[sortedTopics.length - 1]?.topic || 'N/A';

  // Calculate improvement potential
  const maxPossibleScore = score.correct + score.incorrect + score.unanswered;
  const potentialGain = maxPossibleScore - score.correct;
  const potentialPercentage = maxPossibleScore > 0 
    ? Math.round((potentialGain / maxPossibleScore) * 100) 
    : 0;

  let improvementPotential: string;
  if (score.percentage >= 90) {
    improvementPotential = `You're performing exceptionally well! Focus on maintaining consistency across all topics.`;
  } else if (score.percentage >= 75) {
    improvementPotential = `You have ${potentialPercentage}% room for improvement. Focus on your weaker topics to reach excellence.`;
  } else if (score.percentage >= 50) {
    improvementPotential = `With focused practice on weak areas, you can improve your score by up to ${potentialPercentage}%. Start with ${weakestTopic}.`;
  } else {
    improvementPotential = `There's significant room for improvement (${potentialPercentage}% potential gain). Consider reviewing fundamentals and practicing regularly.`;
  }

  return {
    overallPerformance,
    strongestTopic,
    weakestTopic,
    improvementPotential
  };
}

/**
 * Helper function to get performance color based on percentage
 * Useful for UI components displaying performance data
 * 
 * @param percentage - Performance percentage (0-100)
 * @returns Tailwind color class
 */
export function getPerformanceColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 65) return 'text-blue-600';
  if (percentage >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Helper function to get performance background color based on percentage
 * Useful for UI components displaying performance data
 * 
 * @param percentage - Performance percentage (0-100)
 * @returns Tailwind background color class
 */
export function getPerformanceBackgroundColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-50';
  if (percentage >= 65) return 'bg-blue-50';
  if (percentage >= 50) return 'bg-yellow-50';
  return 'bg-red-50';
}