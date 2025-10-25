import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Brain,
  BookOpen,
  FlaskConical,
  Palette,
  Calculator,
  DollarSign,
  Menu,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabaseClient";

// Define types
interface Subject {
  id: string;
  name: string;
  description: string | null;
  question_count?: number;
}

const Subjects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(
    null
  );
  const [subjectsFromDB, setSubjectsFromDB] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const disciplines = [
    {
      id: "science",
      name: "Science",
      icon: FlaskConical,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      subjects: [
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "English Language",
      ],
    },
    {
      id: "arts",
      name: "Arts",
      icon: Palette,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      subjects: [
        "English Language",
        "Literature",
        "Government",
        "History",
        "CRS/IRS",
      ],
    },
    {
      id: "commercial",
      name: "Commercial",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      subjects: [
        "Mathematics",
        "Economics",
        "Commerce",
        "Accounting",
        "English Language",
      ],
    },
  ];

  const selectedDisciplineData = disciplines.find(
    (d) => d.id === selectedDiscipline
  );

  // Load subjects from Supabase on mount
  useEffect(() => {
    async function fetchSubjects() {
      setLoading(true);
      try {
        // Fetch subjects with question count
        const { data: subjects, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .order('name');

        if (subjectsError) {
          console.error('Error fetching subjects:', subjectsError);
          toast({
            title: "Error Loading Subjects",
            description: "Failed to load subjects from database. Please refresh the page.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Get question count for each subject by joining through topics
        const subjectsWithCount = await Promise.all(
          (subjects || []).map(async (subject) => {
            // First get all topics for this subject
            const { data: topics } = await supabase
              .from('topics')
              .select('id')
              .eq('subject_id', subject.id);
            
            if (!topics || topics.length === 0) {
              return {
                ...subject,
                question_count: 0
              };
            }
            
            // Then count questions for these topics
            const topicIds = topics.map(t => t.id);
            const { count } = await supabase
              .from('questions')
              .select('*', { count: 'exact', head: true })
              .in('topic_id', topicIds);
            
            return {
              ...subject,
              question_count: count || 0
            };
          })
        );

        setSubjectsFromDB(subjectsWithCount);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchSubjects();
  }, [toast]);

  // Check if subject is available in database
  const isSubjectAvailable = (subjectName: string): boolean => {
    return subjectsFromDB.some(
      s => s.name.toLowerCase() === subjectName.toLowerCase()
    );
  };

  // Get question count for a subject
  const getQuestionCount = (subjectName: string): number => {
    const subject = subjectsFromDB.find(
      s => s.name.toLowerCase() === subjectName.toLowerCase()
    );
    return subject?.question_count || 0;
  };

  // Handle navigation to test page with state
  const handleStartTest = (subject: string) => {
    // Check if subject is available
    if (!isSubjectAvailable(subject)) {
      const availableNames = subjectsFromDB.map(s => s.name);
      toast({
        title: "Subject Not Available",
        description: `Questions for ${subject} are not available yet. Try ${availableNames.join(' or ')}.`,
        variant: "destructive",
      });
      return;
    }

    // Check if subject has questions
    const questionCount = getQuestionCount(subject);
    if (questionCount === 0) {
      toast({
        title: "No Questions Available",
        description: `${subject} has no questions available yet. Please try another subject.`,
        variant: "destructive",
      });
      return;
    }

    // Get subject ID from database
    const subjectData = subjectsFromDB.find(
      s => s.name.toLowerCase() === subject.toLowerCase()
    );

    // Navigate to test with state
    navigate('/test', { 
      state: { 
        discipline: selectedDiscipline,
        subject: subject,
        subjectId: subjectData?.id
      } 
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Path
            </h1>
            <p className="text-xl text-muted-foreground">
              Select your discipline to begin your exam preparation journey
            </p>
          </div>

          {/* Show database subjects info */}
          {subjectsFromDB.length > 0 && (
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground">
                <CheckCircle className="inline h-4 w-4 mr-1 text-green-600" />
                {subjectsFromDB.length} subjects available from database
              </p>
            </div>
          )}

          {!selectedDiscipline ? (
            /* Discipline Selection */
            <div className="grid md:grid-cols-3 gap-6">
              {disciplines.map((discipline) => (
                <Card
                  key={discipline.id}
                  className="p-8 cursor-pointer hover:shadow-xl transition-all border-2 hover:border-primary/50 hover:scale-105"
                  onClick={() => setSelectedDiscipline(discipline.id)}
                >
                  <div
                    className={`${discipline.bgColor} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto`}
                  >
                    <discipline.icon
                      className={`h-10 w-10 ${discipline.color}`}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-3">
                    {discipline.name}
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {discipline.subjects.length} subjects available
                  </p>
                  <Button className="w-full" size="lg">
                    Select Discipline
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            /* Subject Selection */
            <div className="animate-slide-up">
              <div className="mb-8">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDiscipline(null)}
                  className="mb-4"
                >
                  ← Back to Disciplines
                </Button>
                <div className="flex items-center gap-4 mb-2">
                  {selectedDisciplineData && (
                    <>
                      <div
                        className={`${selectedDisciplineData.bgColor} w-16 h-16 rounded-xl flex items-center justify-center`}
                      >
                        <selectedDisciplineData.icon
                          className={`h-8 w-8 ${selectedDisciplineData.color}`}
                        />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">
                          {selectedDisciplineData.name}
                        </h2>
                        <p className="text-muted-foreground">
                          Select a subject to begin your test
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {selectedDisciplineData?.subjects.map((subject, index) => {
                  const available = isSubjectAvailable(subject);
                  const questionCount = available ? getQuestionCount(subject) : 0;
                  
                  return (
                    <Card
                      key={index}
                      className={`p-6 transition-all border-2 ${
                        available 
                          ? 'hover:shadow-lg hover:border-primary/50 group cursor-pointer' 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                            available 
                              ? 'bg-primary/10 group-hover:bg-primary/20' 
                              : 'bg-gray-100'
                          }`}>
                            <BookOpen className={`h-6 w-6 ${available ? 'text-primary' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold">{subject}</h3>
                              {available ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {available 
                                ? `${questionCount} questions available` 
                                : 'Coming soon'}
                            </p>
                          </div>
                        </div>
                        <Button 
                          className="group-hover:shadow-md transition-all"
                          onClick={() => handleStartTest(subject)}
                          disabled={!available}
                        >
                          {available ? 'Start Test' : 'Not Available'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Info Card */}
              <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">About the Test</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        • Each test contains 100 carefully selected questions
                      </li>
                      <li>• You'll have 60 minutes to complete the exam</li>
                      <li>
                        • Questions are randomized from our extensive database
                      </li>
                      <li>• Get instant AI-powered analysis upon completion</li>
                      <li>• Receive personalized study recommendations</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subjects;