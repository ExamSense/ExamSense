import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUserHistory, getUserHistoryWithTrends, updateUserProfile } from '@/lib/supabaseOperations';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { User, Calendar, TrendingUp, Award, BookOpen, BarChart3, PieChart as PieChartIcon, Mail, Clock, Target, Brain, Lightbulb, Zap } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [trends, setTrends] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'ai-insights' | 'history'>('overview');
  const [pieChartMetric, setPieChartMetric] = useState<'count' | 'average'>('count');


  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch recent history and trends
        const res = await getCurrentUserHistory({ limit: 50 });
        if (res && res.success) {
          setHistory(res.data || []);
        } else if (res && Array.isArray(res)) {
          setHistory(res || []);
        } else {
          setHistory([]);
        }

        const trendsRes = await getUserHistoryWithTrends(user.id, { period: 90 });
        if (trendsRes && trendsRes.trends) {
          setTrends(trendsRes.trends);
        } else if (trendsRes && trendsRes.success && trendsRes.trends) {
          setTrends(trendsRes.trends);
        } else {
          setTrends(null);
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handleAvatarUpload = async (url: string) => {
    try {
      await updateUserProfile({
        avatar_url: url
      });
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <h2 className="text-xl font-semibold mb-2">Please login to view your profile</h2>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/login')}>Login</Button>
            <Button variant="outline" onClick={() => navigate('/signup')}>Sign Up</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const lineChartData = history.map(h => ({
    date: new Date(h.created_at).toLocaleDateString(),
    score: Math.round((h.score / h.total_questions) * 100)
  }));

  const barChartData = history.map(h => ({
    subject: h.subjects?.name || h.subject_name || 'Unknown',
    score: Math.round((h.score / h.total_questions) * 100),
    date: new Date(h.created_at).toLocaleDateString()
  }));

  // Prepare pie chart data - group by subject
  const subjectStats = history.reduce((acc, h) => {
    const subjectName = h.subjects?.name || h.subject_name || 'Unknown';
    if (!acc[subjectName]) {
      acc[subjectName] = { count: 0, totalScore: 0 };
    }
    acc[subjectName].count += 1;
    acc[subjectName].totalScore += Math.round((h.score / h.total_questions) * 100);
    return acc;
  }, {} as Record<string, { count: number; totalScore: number }>);

  const pieChartData = Object.entries(subjectStats).map(([subject, data]: [string, { count: number; totalScore: number }]) => ({
    name: subject,
    value: pieChartMetric === 'count' ? data.count : Math.round(data.totalScore / data.count),
    count: data.count,
    averageScore: Math.round(data.totalScore / data.count)
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B9D', '#C084FC', '#34D399'];

  // Calculate member since date
  const memberSince = user.user_metadata?.created_at || user.created_at;
  const memberSinceDate = memberSince ? new Date(memberSince).toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  }) : 'Recently';

  // Prepare subjects tested summary
  const subjectsSummary = Object.entries(subjectStats).map(([subject, data]: [string, { count: number; totalScore: number }]) => ({
    name: subject,
    testCount: data.count,
    averageScore: Math.round(data.totalScore / data.count),
    performance: Math.round(data.totalScore / data.count) >= 80 ? 'excellent' : 
                 Math.round(data.totalScore / data.count) >= 70 ? 'good' : 
                 Math.round(data.totalScore / data.count) >= 60 ? 'fair' : 'needs-improvement'
  }));

  // Enhanced bar chart data with color coding
  const enhancedBarChartData = barChartData.map(item => ({
    ...item,
    fill: item.score >= 80 ? '#22c55e' : item.score >= 70 ? '#3b82f6' : item.score >= 60 ? '#f59e0b' : '#ef4444'
  }));

  // Get performance badge color
  const getPerformanceBadgeColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-300';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'fair': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-red-100 text-red-700 border-red-300';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-base md:text-lg text-muted-foreground">Your learning analytics and performance insights</p>
          </div>
          <div className="text-right">
            <div className="font-semibold">{user.user_metadata?.full_name || user.email || 'User'}</div>
            <div className="text-sm text-muted-foreground">Member ID: {user.id}</div>
          </div>
        </div>

        {loading && <Card className="p-4">Loading dashboard...</Card>}
        {error && <Card className="p-4 text-red-600">Error: {error}</Card>}

        {!loading && !error && (
          <>
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('ai-insights')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'ai-insights'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Brain className="h-4 w-4 inline mr-2" />
                AI Insights
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                History
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid gap-8">
                {/* Enhanced Profile Section */}
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <AvatarUpload
                      url={user.user_metadata?.avatar_url}
                      onUpload={handleAvatarUpload}
                      fallback={(user.user_metadata?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                    />
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold mb-2">{user.user_metadata?.full_name || 'Your Profile'}</h3>
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Member since {memberSinceDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>ID: {user.id.substring(0, 8)}...</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button onClick={() => navigate('/test')} size="sm">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Take Test
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/subjects')} size="sm">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Browse Subjects
                        </Button>
                        <Button variant="outline" onClick={() => setActiveTab('analytics')} size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Quick Stats */}
                {history.length > 0 && (
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="p-6 text-center">
                      <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{history.length}</div>
                      <div className="text-sm text-muted-foreground">Total Tests</div>
                    </Card>
                    <Card className="p-6 text-center">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {Math.round(
                          (history.reduce((acc, h) => acc + (h.score / h.total_questions * 100), 0) /
                          history.length) || 0
                        )}%
                      </div>
                      <div className="text-sm text-muted-foreground">Average Score</div>
                    </Card>
                    <Card className="p-6 text-center">
                      <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {Math.round(
                          Math.max(
                            ...history.map(h => (h.score / h.total_questions * 100))
                          ) || 0
                        )}%
                      </div>
                      <div className="text-sm text-muted-foreground">Best Score</div>
                    </Card>
                    <Card className="p-6 text-center">
                      <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {history.length > 1 ?
                          Math.round((new Date(history[0].created_at).getTime() - new Date(history[history.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24)) :
                          0
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Days Active</div>
                    </Card>
                  </div>
                )}

                {/* Subjects Tested Summary */}
                {subjectsSummary.length > 0 && (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Subjects Tested
                      </h3>
                      <span className="text-sm text-muted-foreground">{subjectsSummary.length} subjects</span>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subjectsSummary.map((subject, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-lg">{subject.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPerformanceBadgeColor(subject.performance)}`}>
                              {subject.averageScore}%
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              <span>{subject.testCount} tests</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              <span>Avg: {subject.averageScore}%</span>
                            </div>
                          </div>
                          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                subject.performance === 'excellent' ? 'bg-green-500' :
                                subject.performance === 'good' ? 'bg-blue-500' :
                                subject.performance === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${subject.averageScore}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Recent Activity */}
                {history.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Recent Tests
                    </h3>
                    <div className="space-y-3">
                      {history.slice(0, 5).map((test, idx) => (
                        <div key={test.id || idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{test.subjects?.name || test.subject_name || 'Subject'}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(test.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              {Math.round((test.score / test.total_questions) * 100)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {test.score}/{test.total_questions}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setActiveTab('history')}
                    >
                      View All History
                    </Button>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid gap-8">
                {/* Charts Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Performance Trends Line Chart */}
                  {history.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Performance Trends
                      </h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              angle={-45}
                              textAnchor="end"
                              height={70}
                            />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              dot={{ fill: "hsl(var(--primary))" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  )}

                  {/* Enhanced Subject Distribution Pie Chart */}
                  {pieChartData.length > 0 && (
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <PieChartIcon className="h-5 w-5" />
                          Subject Distribution
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            variant={pieChartMetric === 'count' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPieChartMetric('count')}
                          >
                            By Tests
                          </Button>
                          <Button
                            variant={pieChartMetric === 'average' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPieChartMetric('average')}
                          >
                            By Score
                          </Button>
                        </div>
                      </div>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                      <p className="font-semibold mb-1">{data.name}</p>
                                      <p className="text-sm text-muted-foreground">Tests: {data.count}</p>
                                      <p className="text-sm text-muted-foreground">Avg Score: {data.averageScore}%</p>
                                      <p className="text-sm font-medium mt-1">
                                        {pieChartMetric === 'count' ? `${data.count} tests` : `${data.averageScore}% average`}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend 
                              verticalAlign="bottom" 
                              height={36}
                              formatter={(value, entry: any) => (
                                <span className="text-sm">
                                  {value} ({entry.payload.count} tests, {entry.payload.averageScore}% avg)
                                </span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="text-center mt-2 text-sm text-muted-foreground">
                        {pieChartMetric === 'count' 
                          ? 'Distribution by number of tests taken' 
                          : 'Distribution by average score percentage'}
                      </div>
                    </Card>
                  )}
                </div>

                {/* Enhanced Bar Chart - Scores by Subject */}
                {enhancedBarChartData.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Performance per Test
                    </h3>
                    <div className="mb-4 flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Excellent (80%+)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span>Good (70-79%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span>Fair (60-69%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>Needs Improvement (&lt;60%)</span>
                      </div>
                    </div>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={enhancedBarChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="subject"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fill: 'hsl(var(--foreground))' }}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            tick={{ fill: 'hsl(var(--foreground))' }}
                            label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                    <p className="font-semibold mb-1">{data.subject}</p>
                                    <p className="text-sm text-muted-foreground">Date: {data.date}</p>
                                    <p className="text-lg font-bold mt-1" style={{ color: data.fill }}>
                                      {data.score}%
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                            {enhancedBarChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-2 text-sm text-muted-foreground">
                      Color-coded performance across all tests
                    </div>
                  </Card>
                )}

                {/* Topic Performance */}
                {trends && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Topic Performance</h3>
                    <div className="space-y-4">
                      {Object.entries(trends).map(([topic, data]: [string, any]) => (
                        <div key={topic} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{topic}</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(data.average)}% ({data.total} questions)
                            </span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${data.average}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'ai-insights' && (
              <div className="grid gap-8">
                {/* AI-Powered Insights Header */}
                <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                  <div className="flex items-center gap-4 mb-4">
                    <Brain className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="text-2xl font-bold text-purple-900">AI Learning Insights</h3>
                      <p className="text-purple-700">Personalized recommendations based on your performance patterns</p>
                    </div>
                  </div>
                </Card>

                {/* Performance Analysis */}
                {history.length > 0 && (
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Strengths Analysis */}
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Lightbulb className="h-6 w-6 text-green-600" />
                        <h3 className="text-xl font-semibold">Your Strengths</h3>
                      </div>
                      <div className="space-y-4">
                        {subjectsSummary
                          .filter(subject => subject.averageScore >= 70)
                          .sort((a, b) => b.averageScore - a.averageScore)
                          .slice(0, 3)
                          .map((subject, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Award className="h-4 w-4 text-green-700" />
                                </div>
                                <div>
                                  <div className="font-medium text-green-900">{subject.name}</div>
                                  <div className="text-sm text-green-700">Excellent performance</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-700">{subject.averageScore}%</div>
                                <div className="text-xs text-green-600">{subject.testCount} tests</div>
                              </div>
                            </div>
                          ))}
                        {subjectsSummary.filter(subject => subject.averageScore >= 70).length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Keep practicing to discover your strengths!</p>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Areas for Improvement */}
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Target className="h-6 w-6 text-orange-600" />
                        <h3 className="text-xl font-semibold">Focus Areas</h3>
                      </div>
                      <div className="space-y-4">
                        {subjectsSummary
                          .filter(subject => subject.averageScore < 70)
                          .sort((a, b) => a.averageScore - b.averageScore)
                          .slice(0, 3)
                          .map((subject, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                  <Zap className="h-4 w-4 text-orange-700" />
                                </div>
                                <div>
                                  <div className="font-medium text-orange-900">{subject.name}</div>
                                  <div className="text-sm text-orange-700">Needs more practice</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-orange-700">{subject.averageScore}%</div>
                                <div className="text-xs text-orange-600">{subject.testCount} tests</div>
                              </div>
                            </div>
                          ))}
                        {subjectsSummary.filter(subject => subject.averageScore < 70).length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Great job! All subjects are performing well.</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                {/* AI Recommendations */}
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Brain className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-semibold">AI Recommendations</h3>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Study Pattern Insight */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">Study Pattern</h4>
                      </div>
                      <p className="text-sm text-blue-800 mb-3">
                        {history.length > 5 ? 
                          "You've been consistent! Try spacing out your study sessions for better retention." :
                          "Start building a regular study routine. Aim for 2-3 sessions per week."
                        }
                      </p>
                      <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                        View Schedule
                      </Button>
                    </div>

                    {/* Difficulty Level Insight */}
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        <h4 className="font-semibold text-purple-900">Difficulty Level</h4>
                      </div>
                      <p className="text-sm text-purple-800 mb-3">
                        {Math.round((history.reduce((acc, h) => acc + (h.score / h.total_questions * 100), 0) / history.length) || 0) > 75 ?
                          "You're excelling! Consider challenging yourself with advanced topics." :
                          "Focus on building fundamentals. Practice regularly to improve confidence."
                        }
                      </p>
                      <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                        Adjust Level
                      </Button>
                    </div>

                    {/* Time Management Insight */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-green-900">Time Management</h4>
                      </div>
                      <p className="text-sm text-green-800 mb-3">
                        {history.length > 0 ?
                          `Average session: ~${Math.round(history.reduce((acc, h) => acc + h.total_questions, 0) / history.length * 2)} minutes. Consider timed practice tests.` :
                          "Start with shorter, focused study sessions to build momentum."
                        }
                      </p>
                      <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                        Set Timer
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Progress Milestones */}
                {history.length > 0 && (
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Award className="h-6 w-6 text-yellow-600" />
                      <h3 className="text-xl font-semibold">Achievement Milestones</h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-lg border-2 ${history.length >= 1 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="text-center">
                          <div className={`text-2xl mb-2 ${history.length >= 1 ? 'text-yellow-600' : 'text-gray-400'}`}>🎯</div>
                          <div className="font-semibold">First Test</div>
                          <div className="text-sm text-muted-foreground">Complete your first test</div>
                          <div className={`text-xs mt-1 ${history.length >= 1 ? 'text-green-600' : 'text-gray-500'}`}>
                            {history.length >= 1 ? '✓ Achieved' : 'In Progress'}
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg border-2 ${history.length >= 5 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="text-center">
                          <div className={`text-2xl mb-2 ${history.length >= 5 ? 'text-yellow-600' : 'text-gray-400'}`}>📚</div>
                          <div className="font-semibold">Study Streak</div>
                          <div className="text-sm text-muted-foreground">Complete 5 tests</div>
                          <div className={`text-xs mt-1 ${history.length >= 5 ? 'text-green-600' : 'text-gray-500'}`}>
                            {history.length >= 5 ? '✓ Achieved' : `${history.length}/5`}
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg border-2 ${Math.round((history.reduce((acc, h) => acc + (h.score / h.total_questions * 100), 0) / history.length) || 0) >= 80 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="text-center">
                          <div className={`text-2xl mb-2 ${Math.round((history.reduce((acc, h) => acc + (h.score / h.total_questions * 100), 0) / history.length) || 0) >= 80 ? 'text-yellow-600' : 'text-gray-400'}`}>⭐</div>
                          <div className="font-semibold">High Achiever</div>
                          <div className="text-sm text-muted-foreground">Maintain 80%+ average</div>
                          <div className={`text-xs mt-1 ${Math.round((history.reduce((acc, h) => acc + (h.score / h.total_questions * 100), 0) / history.length) || 0) >= 80 ? 'text-green-600' : 'text-gray-500'}`}>
                            {Math.round((history.reduce((acc, h) => acc + (h.score / h.total_questions * 100), 0) / history.length) || 0) >= 80 ? '✓ Achieved' : 'In Progress'}
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg border-2 ${subjectsSummary.length >= 3 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="text-center">
                          <div className={`text-2xl mb-2 ${subjectsSummary.length >= 3 ? 'text-yellow-600' : 'text-gray-400'}`}>🌟</div>
                          <div className="font-semibold">Subject Explorer</div>
                          <div className="text-sm text-muted-foreground">Try 3+ subjects</div>
                          <div className={`text-xs mt-1 ${subjectsSummary.length >= 3 ? 'text-green-600' : 'text-gray-500'}`}>
                            {subjectsSummary.length >= 3 ? '✓ Achieved' : `${subjectsSummary.length}/3`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="grid gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Test History</h3>
                    <Button onClick={() => navigate('/history')} variant="outline">
                      View Detailed History
                    </Button>
                  </div>

                  {history.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No tests taken yet. Start your first test!</p>
                      <Button onClick={() => navigate('/subjects')} className="mt-4">
                        Browse Subjects
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((test, idx) => (
                        <div key={test.id || idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              Math.round((test.score / test.total_questions) * 100) >= 70 ? 'bg-green-100 text-green-700' :
                              Math.round((test.score / test.total_questions) * 100) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              <Award className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="font-semibold">{test.subjects?.name || test.subject_name || 'Subject'}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(test.created_at).toLocaleDateString()} • {test.total_questions} questions
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {Math.round((test.score / test.total_questions) * 100)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {test.score}/{test.total_questions}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}