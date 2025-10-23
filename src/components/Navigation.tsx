import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
    // Optional: Add toast notification here
    // toast.success('Logged out successfully');
  };

  // Extract first name from full name
  const firstName = user?.name.split(' ')[0] || 'User';

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Exam Sense</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/subjects" className="text-foreground/80 hover:text-foreground transition-colors">
              Subjects
            </Link>
            <Link to="/videos" className="text-foreground/80 hover:text-foreground transition-colors">
              Resources
            </Link>
            <Link to="/testimonials" className="text-foreground/80 hover:text-foreground transition-colors">
              Testimonials
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/test">
                  <Button variant="default" size="sm">
                    Take Test
                  </Button>
                </Link>
                
                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      Hi, {firstName}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem onClick={() => navigate('/results')}>
                      Results
                    </DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="default" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-foreground hover:text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link
              to="/subjects"
              onClick={closeMenu}
              className="block text-foreground/80 hover:text-foreground hover:bg-accent px-4 py-2 rounded-md transition-colors"
            >
              Subjects
            </Link>
            <Link
              to="/videos"
              onClick={closeMenu}
              className="block text-foreground/80 hover:text-foreground hover:bg-accent px-4 py-2 rounded-md transition-colors"
            >
              Resources
            </Link>
            <Link
              to="/testimonials"
              onClick={closeMenu}
              className="block text-foreground/80 hover:text-foreground hover:bg-accent px-4 py-2 rounded-md transition-colors"
            >
              Testimonials
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/test"
                  onClick={closeMenu}
                  className="block text-foreground/80 hover:text-foreground hover:bg-accent px-4 py-2 rounded-md transition-colors"
                >
                  Take Test
                </Link>
                <div className="px-4 pt-2 border-t">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Hi, {firstName}
                  </p>
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="block text-foreground/80 hover:text-foreground hover:bg-accent px-4 py-2 rounded-md transition-colors mb-2"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/results"
                    onClick={closeMenu}
                    className="block text-foreground/80 hover:text-foreground hover:bg-accent px-4 py-2 rounded-md transition-colors mb-2"
                  >
                    Results
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="px-4 flex flex-col gap-2 space-y-2">
                <Link to="/login" onClick={closeMenu}>
                  <Button variant="outline" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={closeMenu}>
                  <Button variant="default" size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}