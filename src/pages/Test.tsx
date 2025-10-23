import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, ChevronLeft, ChevronRight, Flag, Loader2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import TestConfiguration, { type TestConfig } from "@/components/TestConfiguration";
import { getRandomQuestions } from "@/data/questionBank";
import type { Question } from "@/data/questionBank";

const Test = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get pre-filled values from navigation state (from Subjects page)
  const navigationState = location.state as { discipline?: string; subject?: string } | null;
  const preFilledDiscipline = navigationState?.discipline || '';
  const preFilledSubject = navigationState?.subject || '';
  
  // State management
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  const [showConfiguration, setShowConfiguration] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  // Load questions when config changes
  useEffect(() => {
    const loadQuestions = async () => {
      // Only load if we have a config and haven't loaded questions yet
      if (!testConfig) {
        console.log('No config, skipping question load');
        return;
      }
      
      // If questions already loaded for this config, don't reload
      if (questions.length > 0) {
        console.log('Questions already loaded');
        return;
      }
      
      console.log('Loading questions for:', testConfig.subject);
      setIsLoadingQuestions(true);
      
      try {
        // Simulate small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const loadedQuestions = getRandomQuestions(
          testConfig.subject,
          testConfig.numberOfQuestions
        );
        
        console.log('Loaded questions:', loadedQuestions.length);
        
        if (loadedQuestions.length === 0) {
          console.error('No questions loaded for subject:', testConfig.subject);
          setIsLoadingQuestions(false);
          return;
        }
        
        setQuestions(loadedQuestions);
        setAnswers(Array(loadedQuestions.length).fill(null));
        setTimeRemaining(testConfig.duration * 60);
        
        // Auto-show instructions after questions load
        console.log('Questions loaded, showing instructions');
        setShowInstructions(true);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    
    loadQuestions();
  }, [testConfig]); // Only depend on testConfig, not questions.length

  // Timer effect
  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  // Handle test configuration submission from form
  const handleStartTest = (config: TestConfig) => {
    console.log('Starting test with config:', config);
    
    // Reset everything for new test
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestion(0);
    setShowInstructions(false);
    setTestStarted(false);
    
    // Hide configuration and set new config (this will trigger question loading)
    setShowConfiguration(false);
    setTestConfig(config);
  };
  
  // Start the actual test (from instructions)
  const handleBeginTest = () => {
    console.log('Beginning test, starting timer...');
    setShowInstructions(false);
    setTestStarted(true);
  };
  
  const handleSubmit = () => {
    if (questions.length === 0) return;
    
    // Calculate score
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    
    // Calculate topic performance
    const topicPerformance: Record<string, { correct: number; total: number }> = {};
    questions.forEach((question, index) => {
      if (!topicPerformance[question.topic]) {
        topicPerformance[question.topic] = { correct: 0, total: 0 };
      }
      topicPerformance[question.topic].total++;
      if (answers[index] === question.correctAnswer) {
        topicPerformance[question.topic].correct++;
      }
    });
    
    // Navigate to results
    navigate('/results', { 
      state: { 
        score: correct,
        totalQuestions: questions.length,
        answers,
        questions,
        topicPerformance,
        timeTaken: testConfig ? (testConfig.duration * 60 - timeRemaining) : 0,
        subject: testConfig?.subject || 'Unknown',
        testDate: new Date()
      } 
    });
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const answeredCount = answers.filter(a => a !== null).length;
  
  // Loading questions state
  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Loading Questions...</p>
          <p className="text-muted-foreground">
            Preparing {testConfig?.numberOfQuestions} questions for {testConfig?.subject}
          </p>
        </Card>
      </div>
    );
  }

  // Configuration state - show TestConfiguration component with pre-filled values
  if (showConfiguration || !testConfig) {
    return (
      <TestConfiguration 
        onStartTest={handleStartTest}
        initialDiscipline={preFilledDiscipline}
        initialSubject={preFilledSubject}
      />
    );
  }
  
  // Check if questions are loaded
  if (questions.length === 0 && testConfig && !isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Questions Available</h2>
          <p className="text-muted-foreground mb-6">
            Unable to load questions for {testConfig.subject}. Please try another subject.
          </p>
          <Button onClick={() => {
            setTestConfig(null);
            setQuestions([]);
            navigate('/subjects');
          }} className="w-full">
            Choose Another Subject
          </Button>
        </Card>
      </div>
    );
  }

  // Instructions state
  if (showInstructions && questions.length > 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Exam Instructions</h1>
            <p className="text-muted-foreground">Please read carefully before starting</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Test Details</h3>
                <p className="text-muted-foreground">
                  Subject: <strong>{testConfig?.subject}</strong> • Questions: <strong>{questions.length}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Time Limit</h3>
                <p className="text-muted-foreground">
                  You have {testConfig?.duration} minutes to complete the exam. The test will auto-submit when time expires.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Navigation</h3>
                <p className="text-muted-foreground">Use Previous/Next buttons to navigate between questions. You can change your answers anytime before submission.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">CBT Simulation</h3>
                <p className="text-muted-foreground">This is a realistic Computer-Based Test simulation designed to mirror actual exam conditions.</p>
              </div>
            </div>
          </div>

          <Button onClick={handleBeginTest} className="w-full" size="lg">
            I Understand, Start Exam
          </Button>
        </Card>
      </div>
    );
  }

  // Main test interface
  if (!testStarted || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Preparing your test...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Exam Sense</span> */}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Section */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Answered</p>
                <p className="font-bold text-lg">{answeredCount}/{questions.length}</p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </Card>

          {/* Question Card */}
          <Card className="p-8 mb-6 animate-slide-up">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  Question {currentQuestion + 1}
                </span>
                {answers[currentQuestion] !== null && (
                  <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <Flag className="h-3 w-3" />
                    Answered
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold leading-relaxed">
                {questions[currentQuestion].question}
              </h2>
            </div>

            <RadioGroup
              value={answers[currentQuestion]?.toString()}
              onValueChange={(value) => handleAnswer(parseInt(value))}
            >
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      answers[currentQuestion] === index
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleAnswer(index)}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button size="lg" onClick={() => setShowSubmitDialog(true)} className="px-8">
                Submit Exam
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              >
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} out of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-yellow-600">
                  Warning: You have {questions.length - answeredCount} unanswered questions.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Exam
            </Button>
            <Button onClick={handleSubmit}>
              Submit Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Test;