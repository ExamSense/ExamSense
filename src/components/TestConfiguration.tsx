import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FlaskConical,
  Palette,
  DollarSign,
  BookOpen,
  Clock,
  ListChecks,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import { getSubjects, getSubjectStatistics } from "@/lib/supabaseOperations";

/**
 * Test Configuration Interface
 * Export for parent components to use
 */
export interface TestConfig {
  discipline: string;
  subject: string;
  numberOfQuestions: number;
  duration: number; // in minutes
}

interface TestConfigurationProps {
  onStartTest: (config: TestConfig) => void;
  initialDiscipline?: string;
  initialSubject?: string;
}

export default function TestConfiguration({
  onStartTest,
  initialDiscipline = "",
  initialSubject = "",
}: TestConfigurationProps) {
  const [discipline, setDiscipline] = useState<string>(initialDiscipline);
  const [subject, setSubject] = useState<string>(initialSubject);
  const [numberOfQuestions, setNumberOfQuestions] = useState<string>("20");
  const [duration, setDuration] = useState<string>("30");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>(
    {}
  );

  // Get available subjects from Supabase
  useEffect(() => {
    let mounted = true;

    const loadSubjects = async () => {
      try {
        const subs = await getSubjects();
        const names = (subs || []).map((s: any) => s.name?.toString() || s);
        if (!mounted) return;
        setAvailableSubjects(names);

        // Pre-fetch counts for each subject to show in the UI
        const statsPromises = names.map(async (name: string) => {
          const stats = await getSubjectStatistics(name);
          return { name, count: stats?.totalQuestions || 0 };
        });
        console.log(statsPromises);
        const results = await Promise.all(statsPromises);
        if (!mounted) return;
        const map: Record<string, number> = {};
        results.forEach((r) => {
          map[r.name] = r.count;
        });
        setSubjectCounts(map);
        console.log("Loaded subject counts:", map);
      } catch (err) {
        console.error("Failed to load subjects from Supabase", err);
      }
    };

    void loadSubjects();
    return () => {
      mounted = false;
    };
  }, []);

  // Set initial values when props change
  useEffect(() => {
    if (initialDiscipline) {
      setDiscipline(initialDiscipline);
    }
    if (initialSubject) {
      setSubject(initialSubject);
    }
  }, [initialDiscipline, initialSubject]);

  // Discipline configuration
  const disciplines = [
    {
      id: "science",
      name: "Science",
      icon: FlaskConical,
      color: "text-blue-600",
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
      subjects: [
        "Mathematics",
        "Economics",
        "Commerce",
        "Accounting",
        "English Language",
      ],
    },
  ];

  // Get subjects for selected discipline
  const selectedDisciplineData = disciplines.find((d) => d.id === discipline);
  const disciplineSubjects = selectedDisciplineData?.subjects || [];

  // Reset subject when discipline changes (only if not from initial props)
  useEffect(() => {
    // Don't reset if we're setting initial values
    if (discipline && discipline !== initialDiscipline) {
      setSubject("");
    }
  }, [discipline, initialDiscipline]);

  // Check if subject is available in Supabase
  const isSubjectAvailable = (subjectName: string): boolean => {
    return availableSubjects.includes(subjectName);
  };

  // Get question count for available subjects (from cached counts)
  const getQuestionCount = (subjectName: string): number => {
    return subjectCounts[subjectName] || 0;
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    return !!(
      discipline &&
      subject &&
      isSubjectAvailable(subject) &&
      numberOfQuestions &&
      duration
    );
  };

  // Handle form submission
  const handleStartTest = () => {
    if (!isFormValid()) return;

    const config: TestConfig = {
      discipline,
      subject,
      numberOfQuestions: parseInt(numberOfQuestions),
      duration: parseInt(duration),
    };

    onStartTest(config);
  };

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <ListChecks className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Configure Your Test
          </h1>
          <p className="text-gray-600">
            Customize your practice test settings below
          </p>
        </div>

        {/* Alert for subject selection */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            You can also select subjects directly from the{" "}
            <strong>Subjects</strong> page for a guided experience.
          </p>
        </div>

        <div className="space-y-6">
          {/* Discipline Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="discipline"
              className="text-base font-semibold flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              Discipline
            </Label>
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger id="discipline" className="h-12">
                <SelectValue placeholder="Select your discipline" />
              </SelectTrigger>
              <SelectContent>
                {disciplines.map((disc) => {
                  const Icon = disc.icon;
                  return (
                    <SelectItem key={disc.id} value={disc.id}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${disc.color}`} />
                        <span>{disc.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="subject"
              className="text-base font-semibold flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Subject
            </Label>
            <Select
              value={subject}
              onValueChange={setSubject}
              disabled={!discipline}
            >
              <SelectTrigger id="subject" className="h-12">
                <SelectValue
                  placeholder={
                    discipline ? "Select a subject" : "Select discipline first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {disciplineSubjects.map((subj) => {
                  const available = isSubjectAvailable(subj);
                  const questionCount = getQuestionCount(subj);

                  return (
                    <SelectItem key={subj} value={subj} disabled={!available}>
                      <div className="flex items-center justify-between gap-3 w-full">
                        <span className={available ? "" : "text-gray-400"}>
                          {subj}
                        </span>
                        {available ? (
                          <span className="text-xs text-green-600 font-medium">
                            {/* {questionCount} questions */}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">
                            (Coming Soon)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {discipline && !subject && (
              <p className="text-sm text-muted-foreground mt-1">
                {availableSubjects.length > 0
                  ? `${availableSubjects.length} subject(s) currently available`
                  : "No subjects available yet"}
              </p>
            )}
          </div>

          {/* Number of Questions */}
          <div className="space-y-2">
            <Label
              htmlFor="questions"
              className="text-base font-semibold flex items-center gap-2"
            >
              <ListChecks className="w-4 h-4" />
              Number of Questions
            </Label>
            <Select
              value={numberOfQuestions}
              onValueChange={setNumberOfQuestions}
            >
              <SelectTrigger id="questions" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">
                  <div className="flex items-center justify-between gap-8">
                    <span>20 Questions</span>
                    <span className="text-xs text-muted-foreground">
                      Quick Practice
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="50">
                  <div className="flex items-center justify-between gap-8">
                    <span>50 Questions</span>
                    <span className="text-xs text-muted-foreground">
                      Standard Test
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="100">
                  <div className="flex items-center justify-between gap-8">
                    <span>100 Questions</span>
                    <span className="text-xs text-muted-foreground">
                      Full Exam
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label
              htmlFor="duration"
              className="text-base font-semibold flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Test Duration
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Minutes</SelectItem>
                <SelectItem value="45">45 Minutes</SelectItem>
                <SelectItem value="60">60 Minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Test Button */}
          <Button
            onClick={handleStartTest}
            disabled={!isFormValid()}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Start Test
          </Button>

          {/* Test Summary */}
          {isFormValid() && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-2 text-sm text-gray-700">
                Test Summary:
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  • <strong>Discipline:</strong> {selectedDisciplineData?.name}
                </p>
                <p>
                  • <strong>Subject:</strong> {subject}
                </p>
                <p>
                  • <strong>Questions:</strong> {numberOfQuestions}
                </p>
                <p>
                  • <strong>Duration:</strong> {duration} minutes
                </p>
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
}
