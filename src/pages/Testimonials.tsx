import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Star, Quote, PlayCircle,TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Testimonials = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const testimonials = [
    {
      name: "Chioma Adeyemi",
      role: "JAMB Candidate 2024",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chioma",
      rating: 5,
      text: "Exam Sense helped me improve my JAMB score from 180 to 285! The AI analysis showed me exactly where I was weak, and the personalized study plan made all the difference.",
      subject: "Science",
    },
    {
      name: "Ibrahim Musa",
      role: "WAEC Student",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim",
      rating: 5,
      text: "The CBT simulation was incredibly realistic. I felt so prepared on exam day because I had practiced with Exam Sense. Highly recommend to anyone preparing for WAEC!",
      subject: "Arts",
    },
    {
      name: "Blessing Okafor",
      role: "JAMB Candidate 2024",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Blessing",
      rating: 5,
      text: "The video library was a game-changer for me. Complex topics became easy to understand. I passed all my subjects with excellent grades thanks to Exam Sense.",
      subject: "Commercial",
    },
    {
      name: "Tunde Bakare",
      role: "WAEC Graduate",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tunde",
      rating: 5,
      text: "I struggled with Mathematics until I found Exam Sense. The detailed topic breakdown helped me understand my weak areas and work on them systematically.",
      subject: "Science",
    },
    {
      name: "Fatima Hassan",
      role: "JAMB Candidate 2024",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
      rating: 5,
      text: "The AI-powered insights were spot on! It identified patterns in my mistakes that I hadn't noticed. My confidence soared after using this platform.",
      subject: "Arts",
    },
    {
      name: "Emeka Nwosu",
      role: "WAEC Student",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka",
      rating: 5,
      text: "Best exam prep platform I've used. The timed tests helped me manage my time better during the actual exam. Worth every minute spent practicing!",
      subject: "Commercial",
    },
  ];

  const stats = [
    { value: "95%", label: "Student Success Rate" },
    { value: "10K+", label: "Happy Students" },
    { value: "50K+", label: "Tests Completed" },
    { value: "4.9/5", label: "Average Rating" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Quote className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Student Success Stories
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how Exam Sense has helped thousands of students ace their
              exams
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full bg-muted"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  "{testimonial.text}"
                </p>

                <div className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                  {testimonial.subject}
                </div>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Thousands of Successful Students
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start your journey to exam success today with personalized
              AI-powered learning
            </p>
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => navigate('/test')}
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl"
              >
                Start Practicing Now
                <PlayCircle className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate('/signup')}
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

export default Testimonials;
