import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Navigation from "./components/Navigation";
import Landing from "./pages/Landing";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/SignUp";
import Subjects from "./pages/Subjects";
import Test from "./pages/Test";
import Results from "./pages/Results";
import Report from "./pages/Report";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Videos from "./pages/Videos";
import Testimonials from "./pages/Testimonials";
import NotFound from "./pages/NotFound";
import DebugDatabase from "./pages/DebugDatabase";

const queryClient = new QueryClient();

// Layout wrapper that conditionally shows Navigation
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  // Pages where Navigation should NOT appear
  const hideNavPages = ['/login', '/signup'];
  const shouldHideNav = hideNavPages.includes(location.pathname);
  
  return (
    <>
      {!shouldHideNav && <Navigation />}
      {children}
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>

          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/debug-database" element={<DebugDatabase />} />
              
              {/* Protected Routes */}
              <Route 
                path="/subjects" 
                element={
                  <ProtectedRoute>
                    <Subjects />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/test" 
                element={
                  <ProtectedRoute>
                    <Test />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/results" 
                element={
                  <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/report" 
                element={
                  <ProtectedRoute>
                    <Report />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>

      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;