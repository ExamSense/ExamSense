import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Trophy, Clock, Target, TrendingUp, CheckCircle, XCircle, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, totalQuestions, timeTaken } = location.state || { score: 0, totalQuestions: 100, timeTaken: 0 };

  const percentage = ((score / totalQuestions) * 100).toFixed(1);
  const correctAnswers = score;
  const incorrectAnswers = totalQuestions - score;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Mock topic performance data
  const topicPerformance = [
    { topic: "Algebra", score: 8, total: 10, percentage: 80, color: "text-green-600", bgColor: "bg-green-100" },
    { topic: "Geometry", score: 6, total: 10, percentage: 60, color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { topic: "Calculus", score: 7, total: 10, percentage: 70, color: "text-green-600", bgColor: "bg-green-100" },
    { topic: "Statistics", score: 4, total: 10, percentage: 40, color: "text-red-600", bgColor: "bg-red-100" },
    { topic: "Trigonometry", score: 5, total: 10, percentage: 50, color: "text-yellow-600", bgColor: "bg-yellow-100" }
  ];

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 70) return { level: "Strong", color: "text-green-600", bgColor: "bg-green-100" };
    if (percentage >= 40) return { level: "Average", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    return { level: "Needs Work", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const overallPerformance = getPerformanceLevel(parseFloat(percentage));

  return (
    <div className="min-h-screen bg-background">
    

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Exam Complete!</h1>
            <p className="text-xl text-muted-foreground">
              Here's how you performed
            </p>
          </div>

          {/* Score Overview */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">{percentage}%</div>
                <p className="text-muted-foreground">Overall Score</p>
                <div className={`inline-block px-4 py-1 rounded-full mt-2 ${overallPerformance.bgColor}`}>
                  <span className={`text-sm font-semibold ${overallPerformance.color}`}>
                    {overallPerformance.level}
                  </span>
                </div>
              </div>
              <div className="text-center border-x border-border/50">
                <div className="text-5xl font-bold mb-2">{score}/{totalQuestions}</div>
                <p className="text-muted-foreground">Questions Correct</p>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{correctAnswers}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{incorrectAnswers}</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-8 w-8 text-primary" />
                  <div className="text-4xl font-bold">{formatTime(timeTaken)}</div>
                </div>
                <p className="text-muted-foreground">Time Taken</p>
                <p className="text-sm text-muted-foreground mt-2">out of 60 minutes</p>
              </div>
            </div>
          </Card>

          {/* Performance Breakdown */}
          <Card className="p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Performance by Topic</h2>
            </div>
            <div className="space-y-4">
              {topicPerformance.map((topic, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{topic.topic}</span>
                      <span className={`text-sm px-2 py-1 rounded ${topic.bgColor} ${topic.color}`}>
                        {topic.percentage >= 70 ? 'Strong' : topic.percentage >= 40 ? 'Average' : 'Weak'}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {topic.score}/{topic.total} ({topic.percentage}%)
                    </span>
                  </div>
                  <Progress 
                    value={topic.percentage} 
                    className={`h-2 ${topic.percentage >= 70 ? '[&>div]:bg-green-600' : topic.percentage >= 40 ? '[&>div]:bg-yellow-600' : '[&>div]:bg-red-600'}`}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Performance Legend */}
          <Card className="p-6 mb-8 bg-muted/30">
            <h3 className="font-semibold mb-4">Performance Levels</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-green-600"></div>
                <div>
                  <p className="font-semibold text-sm">Strong (70-100%)</p>
                  <p className="text-xs text-muted-foreground">Excellent understanding</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-yellow-600"></div>
                <div>
                  <p className="font-semibold text-sm">Average (40-69%)</p>
                  <p className="text-xs text-muted-foreground">Room for improvement</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-red-600"></div>
                <div>
                  <p className="font-semibold text-sm">Needs Work (0-39%)</p>
                  <p className="text-xs text-muted-foreground">Requires focused study</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/report" className="flex-1">
              <Button size="lg" className="w-full group">
                View Detailed Report
                <FileText className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/subjects" className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                Take Another Test
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
