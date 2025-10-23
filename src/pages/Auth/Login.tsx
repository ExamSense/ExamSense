import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // Validation errors
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle blur for validation
  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  // Validate individual field
  const validateField = (field: keyof typeof formData, value: string) => {
    let error = '';

    switch (field) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = 'Please enter a valid email address';
          }
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const emailValid = validateField('email', formData.email);
    const passwordValid = validateField('password', formData.password);
    return emailValid && passwordValid;
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.email.trim() !== '' &&
      formData.password !== '' &&
      !Object.values(errors).some(error => error !== '')
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true
    });

    // Check if fields are empty
    if (!formData.email.trim() || !formData.password) {
      setErrors({
        email: !formData.email.trim() ? 'Email is required' : '',
        password: !formData.password ? 'Password is required' : ''
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      
      // Success! Show toast and redirect immediately
      // TODO: Replace with your toast library (e.g., react-hot-toast)
      alert('Welcome back!');
      
      // Redirect immediately
      navigate('/subjects');
    } catch (err) {
      // Error is handled by auth context
      setShowErrorBanner(true);
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Login to continue your learning</p>
          </div>

          {/* Error Banner */}
          {authError && showErrorBanner && (
            <div className="mb-6 bg-red-500 text-white px-4 py-3 rounded-lg flex items-center justify-between">
              <span className="text-sm">{authError}</span>
              <button
                onClick={() => setShowErrorBanner(false)}
                className="text-white hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="your.email@example.com"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                    touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {touched.email && errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                    touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-orange-400 border-gray-300 rounded focus:ring-orange-400"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors flex items-center justify-center ${
                !isFormValid() || isLoading
                  ? 'bg-orange-300 cursor-not-allowed opacity-50'
                  : 'bg-orange-400 hover:bg-orange-500'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-orange-500 hover:text-orange-600 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}