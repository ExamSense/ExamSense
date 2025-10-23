import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Download, BookOpen, Lightbulb, Calendar, Youtube } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const Report = () => {
  const topicBreakdown = [
    {
      topic: "Algebra",
      score: 8,
      total: 10,
      percentage: 80,
      questions: [
        { question: "Linear equations", correct: true },
        { question: "Quadratic equations", correct: true },
        { question: "Polynomials", correct: false },
        { question: "Factorization", correct: true }
      ]
    },
    {
      topic: "Geometry",
      score: 6,
      total: 10,
      percentage: 60,
      questions: [
        { question: "Circle theorems", correct: true },
        { question: "Triangles and angles", correct: false },
        { question: "Coordinate geometry", correct: true },
        { question: "Area and perimeter", correct: false }
      ]
    },
    {
      topic: "Statistics",
      score: 4,
      total: 10,
      percentage: 40,
      questions: [
        { question: "Mean and median", correct: false },
        { question: "Probability", correct: true },
        { question: "Data representation", correct: false },
        { question: "Standard deviation", correct: false }
      ]
    }
  ];

  const studyPlan = {
    week1: [
      { day: "Monday", topic: "Statistics - Mean and Median", duration: "2 hours" },
      { day: "Tuesday", topic: "Statistics - Data Representation", duration: "2 hours" },
      { day: "Wednesday", topic: "Geometry - Triangle Properties", duration: "2 hours" },
      { day: "Thursday", topic: "Geometry - Circle Theorems", duration: "2 hours" },
      { day: "Friday", topic: "Algebra - Polynomials", duration: "2 hours" },
      { day: "Saturday", topic: "Practice Mixed Questions", duration: "3 hours" },
      { day: "Sunday", topic: "Review and Rest", duration: "-" }
    ],
    week2: [
      { day: "Monday", topic: "Advanced Statistics", duration: "2 hours" },
      { day: "Tuesday", topic: "Complex Geometry Problems", duration: "2 hours" },
      { day: "Wednesday", topic: "Algebra Word Problems", duration: "2 hours" },
      { day: "Thursday", topic: "Timed Practice Test", duration: "2 hours" },
      { day: "Friday", topic: "Review Weak Areas", duration: "2 hours" },
      { day: "Saturday", topic: "Full Mock Exam", duration: "3 hours" },
      { day: "Sunday", topic: "Analysis and Planning", duration: "-" }
    ]
  };

  const resources = [
    { title: "Khan Academy - Statistics Fundamentals", url: "https://youtube.com", platform: "YouTube" },
    { title: "Math is Fun - Geometry Basics", url: "https://youtube.com", platform: "YouTube" },
    { title: "PatrickJMT - Algebra Tutorials", url: "https://youtube.com", platform: "YouTube" }
  ];

  const handleDownloadPDF = () => {
    // In a real implementation, this would generate and download a PDF
    alert("PDF download functionality will be implemented with jsPDF");
  };

  return (
    <div className="min-h-screen bg-background">


      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-slide-up">
            <div>
              <h1 className="text-4xl font-bold mb-2">AI Performance Report</h1>
              <p className="text-xl text-muted-foreground">
                Personalized insights and study recommendations
              </p>
            </div>
            <Button onClick={handleDownloadPDF} size="lg" variant="outline">
              <Download className="mr-2 h-5 w-5" />
              Export PDF
            </Button>
          </div>

          {/* AI Summary */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">AI Analysis Summary</h2>
                <div className="space-y-4 text-lg leading-relaxed">
                  <p>
                    <strong>Overall Performance:</strong> You performed well overall with a score of 75%. 
                    Your strongest area is Algebra (80%), showing excellent understanding of core concepts.
                  </p>
                  <p>
                    <strong>Confidence Level:</strong> <span className="text-yellow-600 font-semibold">Medium</span> - 
                    You demonstrate solid knowledge but would benefit from additional practice in Statistics and Geometry.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Key Observations */}
          <Card className="p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Lightbulb className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Key Observations</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="bg-green-100 text-green-600 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <span className="text-lg">Strong performance in Algebra - consistently correct on linear and quadratic equations</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-yellow-100 text-yellow-600 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  !
                </div>
                <span className="text-lg">Geometry shows average understanding - focus needed on triangle properties and theorems</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  ×
                </div>
                <span className="text-lg">Statistics requires immediate attention - fundamental concepts need reinforcement</span>
              </li>
            </ul>
          </Card>

          {/* Topic Breakdown */}
          <Card className="p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Detailed Topic Breakdown</h2>
            </div>
            <div className="space-y-4">
              {topicBreakdown.map((topic, index) => (
                <Collapsible key={index}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 border-2 border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          topic.percentage >= 70 ? 'bg-green-100 text-green-600' :
                          topic.percentage >= 40 ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {topic.percentage}%
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-lg">{topic.topic}</h3>
                          <p className="text-sm text-muted-foreground">
                            {topic.score} out of {topic.total} correct
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 px-4">
                    <div className="space-y-2 py-4">
                      {topic.questions.map((q, qIndex) => (
                        <div key={qIndex} className="flex items-center gap-3 pl-4">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            q.correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {q.correct ? '✓' : '×'}
                          </div>
                          <span className="text-muted-foreground">{q.question}</span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </Card>

          {/* Study Plan */}
          <Card className="p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">2-Week Study Plan</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4 text-primary">Week 1: Foundation Building</h3>
                <div className="space-y-2">
                  {studyPlan.week1.map((day, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-24 font-semibold text-sm">{day.day}</div>
                      <div className="flex-1">{day.topic}</div>
                      <div className="text-sm text-muted-foreground w-20 text-right">{day.duration}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-primary">Week 2: Practice & Mastery</h3>
                <div className="space-y-2">
                  {studyPlan.week2.map((day, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-24 font-semibold text-sm">{day.day}</div>
                      <div className="flex-1">{day.topic}</div>
                      <div className="text-sm text-muted-foreground w-20 text-right">{day.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Recommended Resources */}
          <Card className="p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Youtube className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Recommended Resources</h2>
            </div>
            <div className="space-y-3">
              {resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border-2 border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Youtube className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{resource.title}</h4>
                    <p className="text-sm text-muted-foreground">{resource.platform}</p>
                  </div>
                </a>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/subjects" className="flex-1">
              <Button size="lg" className="w-full">
                Take Another Test
              </Button>
            </Link>
            <Link to="/videos" className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                Browse Video Library
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
