import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Brain,
  Target,
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  Menu,
  X,
  ArrowRight,
  ArrowDown,
  NotepadText,
  BookOpenCheck,
  LibraryBig,
  PlayCircle,
  BarChart2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "Diagnostic Testing",
      description:
        "Comprehensive CBT exams that mirror real WASSCE formats",
    },
    {
      icon: BarChart3,
      title: "AI Analysis",
      description:
        "Get instant performance insights powered by advanced AI technology",
    },
    {
      icon: Target,
      title: "Personalized Recommendations",
      description:
        "Custom study plans tailored to your strengths and weaknesses",
    },
  ];

  const steps = [
    {
      icon: NotepadText,
      title: "Take a Test",
      description: "Choose your subject and complete a diagnostic exam.Our platform leverages syllabus-mapped question banks aligned with WASSCE curriculum standards. Each question is tagged to specific topics, enabling granular performance tracking.",
    },
    {
      icon: BookOpenCheck,
      title: "Get Analysis",
      description: "Upon test completion, our scoring algorithm calculates topic-level proficiency percentages, identifying performance patterns. AI-powered natural language generation creates personalized insights by analyzing score distributions and question difficulty patterns. Our recommendation engine matches underperforming topics with curated educational resources from verified sources.",
    },
    {
      icon: LibraryBig,
      title: "Start Improving",
      description: "All analytics are presented through interactive visualizations, making complex data immediately actionable for students preparing for WASSCE examinations. it also recommends personalized study plan to excel",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white mb-6 border border-white/20">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">
                Your AI-Powered Study Companion
              </span>
            </div>

            {/* Personalized Greeting for Authenticated Users */}
            {user && (
              <div className="mb-4 animate-fade-in">
                <p className="text-2xl md:text-3xl font-semibold text-white/95">
                  Welcome back, <span className="text-accent">{user?.user_metadata?.full_name?.split(' ')[0] || 'there'}</span>! 👋
                </p>
              </div>
            )}

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Ace Your Exams with
              <span className="block text-accent">AI Intelligence</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
              Your personal AI tutor to help you conquer WASSCE exams with
              confidence and precision
            </p>

            {/* Auth-Aware CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  {/* Authenticated User CTAs */}
                  <Button
                    size="lg"
                    onClick={() => navigate('/test')}
                    className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all"
                  >
                    Continue Practicing
                    <PlayCircle className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => navigate('/results')}
                    variant="outline"
                    className="text-lg px-8 py-6 bg-white/10 text-white border-white/30 hover:bg-white/20 shadow-xl hover:shadow-2xl transition-all backdrop-blur-sm"
                  >
                    View Your Progress
                    <BarChart2 className="ml-2 h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  {/* Guest User CTAs */}
                  <Button
                    size="lg"
                    onClick={() => navigate('/signup')}
                    className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all"
                  >
                    Start Free Practice Test
                    <Target className="ml-2 h-5 w-5" />
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-white/90">
                    <span className="text-sm">Already have an account?</span>
                    <Button
                      variant="link"
                      onClick={() => navigate('/login')}
                      className="text-accent hover:text-accent/80 underline p-0 h-auto font-semibold"
                    >
                      Login
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Exam Sense?
            </h2>
            <p className="text-xl text-muted-foreground max-2xl text-pretty mx-auto">
              Exam Sense is a smart practice testing platform that helps WASSCE
              candidates identify their weak topics through AI-powered analysis
              and get personalized study recommendations - turning practice
              tests into targeted learning paths.Instead of just scoring
              students, we diagnose their performance and prescribe what to
              study next
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
              >
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-primary"></feature.icon>
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to exam success
            </p>
          </div>
          <div className="w-full max-w-7xl mx-auto px-4 py-12">
            {/* Mobile View - Stacked */}
            <div className="flex md:hidden flex-col gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-full bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-400">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className="flex items-center justify-center my-4">
                        <ArrowDown className="w-6 h-6 text-blue-500 animate-bounce" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop View - Row with Center Card Larger */}
            <div className="hidden md:flex items-center justify-center gap-6 w-full">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex items-center flex-1">
                    <div 
                      className={`bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-400 hover:scale-105 w-full ${
                        index === 1 
                          ? 'md:flex-[1.5] lg:flex-[1.8] min-h-[280px] shadow-lg border-blue-300' 
                          : 'md:flex-1 min-h-[240px]'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className={`rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md ${
                            index === 1 ? 'w-14 h-14' : 'w-12 h-12'
                          }`}
                        >
                          <Icon className={index === 1 ? 'w-7 h-7' : 'w-6 h-6'} />
                        </div>
                        <h3 className={`font-bold text-gray-900 ${index === 1 ? 'text-2xl' : 'text-xl'}`}>
                          {step.title}
                        </h3>
                      </div>
                      <p className={`text-gray-600 leading-relaxed ${index === 1 ? 'text-base' : 'text-sm'}`}>
                        {step.description}
                      </p>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className="flex items-center mx-2 lg:mx-4 flex-shrink-0">
                        <div className="relative">
                          <ArrowRight className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500 animate-pulse" />
                          <div className="absolute inset-0 animate-ping opacity-25">
                            <ArrowRight className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold">10,000+</div>
              <div className="text-xl text-white/80">Practice Questions</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold">95%</div>
              <div className="text-xl text-white/80">Success Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold">5,000+</div>
              <div className="text-xl text-white/80">Students Helped</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Excel?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students who have improved their exam scores
              with Exam Sense
            </p>
            {user ? (
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
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Exam Sense</span>
            </div>
            <div className="text-center text-muted-foreground">
              © 2025 Exam Sense. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;