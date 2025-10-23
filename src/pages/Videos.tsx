import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Play, BookOpen,TrendingUp, PlayCircle  } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const Videos = () => {
  const [selectedSubject, setSelectedSubject] = useState("mathematics");
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth();

  const videosBySubject = {
    mathematics: [
      {
        title: "Algebra Fundamentals",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        duration: "15:30",
        instructor: "Prof. Johnson",
      },
      {
        title: "Geometry Basics",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        duration: "12:45",
        instructor: "Dr. Smith",
      },
      {
        title: "Calculus Introduction",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        duration: "20:15",
        instructor: "Prof. Williams",
      },
    ],
    physics: [
      {
        title: "Newton's Laws of Motion",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        duration: "18:20",
        instructor: "Dr. Brown",
      },
      {
        title: "Electricity and Magnetism",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        duration: "22:10",
        instructor: "Prof. Davis",
      },
    ],
    chemistry: [
      {
        title: "Atomic Structure",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        duration: "16:40",
        instructor: "Dr. Wilson",
      },
      {
        title: "Chemical Bonding",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        duration: "19:25",
        instructor: "Prof. Taylor",
      },
    ],
    english: [
      {
        title: "Grammar Essentials",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        duration: "14:55",
        instructor: "Mrs. Anderson",
      },
      {
        title: "Essay Writing Techniques",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        duration: "21:30",
        instructor: "Mr. Thompson",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Play className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Video Library
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn from expert instructors with our curated collection of
              educational videos
            </p>
          </div>

          {/* Subject Tabs */}
          <Tabs defaultValue="mathematics" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
              <TabsTrigger value="physics">Physics</TabsTrigger>
              <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
              <TabsTrigger value="english">English</TabsTrigger>
            </TabsList>

            {Object.entries(videosBySubject).map(([subject, videos]) => (
              <TabsContent
                key={subject}
                value={subject}
                className="animate-slide-up"
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white rounded-full p-4">
                            <Play className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {video.title}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          {video.instructor}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* CTA Section */}
          <Card className="mt-12 p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <h2 className="text-2xl font-bold mb-3">
              Ready to Test Your Knowledge?
            </h2>
            <p className="text-muted-foreground mb-6">
              Put what you've learned into practice with our comprehensive CBT
              exams
            </p>
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => navigate("/test")}
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl"
              >
                Start Practicing Now
                <PlayCircle className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl"
              >
                Begin Your Journey
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Videos;
