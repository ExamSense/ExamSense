import { AlertCircle, BookOpen, FlaskConical, Calculator, Globe, Palette, DollarSign, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Props for ErrorDisplay component
 */
interface ErrorDisplayProps {
  error: string;
  availableSubjects: string[];
  onRetry: () => void;
}

/**
 * Props for SubjectCard component
 */
interface SubjectCardProps {
  subject: string;
  icon: LucideIcon;
  color: string;
}

/**
 * Get icon and color for a subject
 */
function getSubjectIconAndColor(subject: string): { icon: LucideIcon; color: string } {
  const subjectLower = subject.toLowerCase();
  
  if (subjectLower.includes('math')) {
    return { icon: Calculator, color: 'text-blue-600' };
  }
  if (subjectLower.includes('physics') || subjectLower.includes('chemistry') || subjectLower.includes('biology')) {
    return { icon: FlaskConical, color: 'text-blue-600' };
  }
  if (subjectLower.includes('english') || subjectLower.includes('literature')) {
    return { icon: BookOpen, color: 'text-purple-600' };
  }
  if (subjectLower.includes('economics') || subjectLower.includes('commerce') || subjectLower.includes('accounting')) {
    return { icon: DollarSign, color: 'text-green-600' };
  }
  if (subjectLower.includes('government') || subjectLower.includes('history') || subjectLower.includes('geography')) {
    return { icon: Globe, color: 'text-orange-600' };
  }
  if (subjectLower.includes('art') || subjectLower.includes('crs') || subjectLower.includes('irs')) {
    return { icon: Palette, color: 'text-purple-600' };
  }
  
  // Default
  return { icon: BookOpen, color: 'text-gray-600' };
}

/**
 * SubjectCard component - displays individual subject with icon
 */
function SubjectCard({ subject, icon: Icon, color }: SubjectCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/50">
      <div className="flex items-center gap-3">
        <div className={`${color} bg-primary/5 p-2 rounded-lg`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-medium text-sm">{subject}</span>
      </div>
    </Card>
  );
}

/**
 * ErrorDisplay component - shows error when subject is unavailable
 * 
 * @param error - Error message to display
 * @param availableSubjects - List of available subjects
 * @param onRetry - Callback to retry/go back to configuration
 */
export default function ErrorDisplay({ error, availableSubjects, onRetry }: ErrorDisplayProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-4">
          <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-bold mb-2">
            Subject Unavailable
          </CardTitle>
          <p className="text-destructive font-medium text-lg">{error}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Available Subjects Section */}
          {availableSubjects.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Available Subjects
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableSubjects.map((subject) => {
                  const { icon, color } = getSubjectIconAndColor(subject);
                  return (
                    <SubjectCard
                      key={subject}
                      subject={subject}
                      icon={icon}
                      color={color}
                    />
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Helpful Message */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              💡 <strong>We're constantly adding more subjects!</strong> Check back soon for updates.
            </p>
          </div>
          
          {/* Action Button */}
          <Button 
            onClick={onRetry} 
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            Try Another Subject
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}