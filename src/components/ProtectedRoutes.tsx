import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          {/* Animated Shield Icon */}
          <div className="relative inline-block mb-6">
            <Shield className="w-16 h-16 text-blue-400 animate-pulse" />
            <Loader2 className="w-16 h-16 text-blue-400 absolute top-0 left-0 animate-spin" />
          </div>
          
          {/* Loading Text */}
          {/* <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Checking Authentication
          </h2>
          <p className="text-gray-600">Please wait...</p>
           */}
          {/* Loading Dots Animation */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-400  rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-400  rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("not auth")
    return <Navigate to="/login" replace />;
  }
  
  // Render protected content
  return <>{children}</>;
}