import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import Footer from './Footer';

interface LoginResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: {
    token: string;
    user_id: string;
    role: 'candidate' | 'company' | 'admin';
    email: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
  };
  // Legacy format support
  token?: string;
  user_id?: string;
  user_type?: 'candidate' | 'company' | 'admin';
  email?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  role?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data: LoginResponse = await response.json();

      if (response.ok) {
        // Handle the new response format where data is nested
        const loginData = data.data || data;
        
        if (loginData.token) {
          localStorage.setItem('authToken', loginData.token);
          
          // Handle role/user_type field
          const userType = loginData.role || (data as any).user_type;
          if (userType) {
            localStorage.setItem('userType', userType);
          }
          
          // Handle user_id
          if (loginData.user_id) {
            localStorage.setItem('userId', loginData.user_id);
          }

          if (userType === 'candidate') {
            localStorage.setItem('userName', `${loginData.first_name || ''} ${loginData.last_name || ''}`);
          } else if (userType === 'company') {
            localStorage.setItem('userName', loginData.company_name || '');
          }
        }

        const userType = loginData.role || (data as any).user_type;
        if (userType === 'admin') {
          navigate('/admin-dashboard');
        } else if (userType === 'candidate') {
          navigate('/candidate-dashboard');
        } else {
          navigate('/company-dashboard');
        }
      } else {
        setErrors({ form: data.error || 'Login failed. Please check your credentials.' });
      }
    } catch (error) {
      setErrors({ form: 'An error occurred during login. Please try again.' });
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = (provider: 'google') => {
    // Only support Google OAuth
    if (provider !== 'google') {
      setErrors({ form: 'Only Google authentication is supported at this time.' });
      return;
    }
    // Redirect to backend OAuth route
    window.location.href = `http://localhost:5000/auth/${provider}`;
  };

  const handleAccountSelect = (type: 'candidate' | 'company') => {
    setShowDropdown(false);
    navigate(type === 'company' ? '/company-signup' : '/signup');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center py-12 px-4">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center mt-8 space-x-3">
          <img
            src="http://localhost:5000/uploads/1.png"
            alt="Growcoach Logo"
            className="h-14 w-14 object-contain"
            style={{ borderRadius: '4px' }}
          />
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 drop-shadow-lg">
            Growcoach
          </span>
        </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">Connectez-vous à votre compte</h2>
          <div className="mt-2 text-center text-sm text-gray-400 relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="font-medium text-purple-400 hover:text-purple-300"
            >
              Créer un nouveau compte
            </button>
            {showDropdown && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-700"
                  onClick={() => handleAccountSelect('candidate')}
                >
                  En tant que candidat
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-700"
                  onClick={() => handleAccountSelect('company')}
                >
                  En tant qu'entreprise
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-6 shadow rounded-lg sm:px-10">
            {/* Success message from password reset */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-sm text-green-400">
                {successMessage}
              </div>
            )}
            
            {errors.form && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-sm">
                {errors.form}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium">Adresse email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.email ? 'border border-red-500' : ''}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium">Mot de passe</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.password ? 'border border-red-500' : ''}`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
              </div>

              {/* Remember me & forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm">Souviens-toi de moi</label>
                </div>

                <Link to="/forgot-password" className="text-sm font-medium text-purple-400 hover:text-purple-300">
                  Mot de passe oublié?
                </Link>
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Ou continuez avec</span>
                </div>
              </div>

              {/* OAuth Button */}
              <div className="mt-6 flex justify-center">
                {/* Google */}
                <button 
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  className="w-full max-w-sm inline-flex justify-center py-3 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2">Continuer avec Google</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;