import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import Footer from './Footer';

const API_BASE_URL = 'http://localhost:5000';

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const code = location.state?.code || '';
  
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new_password: false,
    confirm_password: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Redirect if no email or code
  useEffect(() => {
    if (!email || !code) {
      navigate('/forgot-password');
    }
  }, [email, code, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = (field: 'new_password' | 'confirm_password') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.new_password) {
      newErrors.new_password = 'Le nouveau mot de passe est requis.';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'La confirmation du mot de passe est requise.';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Les mots de passe ne correspondent pas.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          new_password: formData.new_password,
          confirm_password: formData.confirm_password
        }),
      });

      const data: ResetPasswordResponse = await response.json();

      if (data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.' 
            } 
          });
        }, 3000);
      } else {
        setErrors({ form: data.error || 'Une erreur s\'est produite.' });
      }
    } catch (error) {
      setErrors({ form: 'Une erreur s\'est produite. Veuillez réessayer.' });
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    if (password.length < 6) return { strength: 25, text: 'Faible', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 50, text: 'Moyen', color: 'bg-yellow-500' };
    if (password.length < 12) return { strength: 75, text: 'Fort', color: 'bg-green-500' };
    return { strength: 100, text: 'Très fort', color: 'bg-green-600' };
  };

  const passwordStrength = getPasswordStrength(formData.new_password);

  if (success) {
    return (
      <>
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center py-12 px-4">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-gray-800 py-12 px-6 shadow rounded-lg sm:px-10 text-center">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Mot de passe réinitialisé !
              </h2>
              
              <p className="text-gray-300 mb-6">
                Votre mot de passe a été réinitialisé avec succès.
                Vous allez être redirigé vers la page de connexion.
              </p>
              
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-4"></div>
              
              <p className="text-sm text-gray-400">
                Redirection en cours...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center py-12 px-4">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center mt-8 space-x-3">
            <img
              src={`${API_BASE_URL}/uploads/1.png`}
              alt="Growcoach Logo"
              className="h-14 w-14 object-contain"
              style={{ borderRadius: '4px' }}
            />
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 drop-shadow-lg">
              Growcoach
            </span>
          </div>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Nouveau mot de passe
          </h2>
          
          <p className="mt-2 text-center text-sm text-gray-400">
            Choisissez un nouveau mot de passe sécurisé pour votre compte
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-6 shadow rounded-lg sm:px-10">
            {/* Back button */}
            <div className="mb-6">
              <Link 
                to="/verify-reset-code"
                state={{ email }}
                className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la vérification
              </Link>
            </div>

            {/* Error message */}
            {errors.form && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-sm text-red-400">
                {errors.form}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* New Password */}
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="new_password"
                    name="new_password"
                    type={showPasswords.new_password ? 'text' : 'password'}
                    required
                    value={formData.new_password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.new_password ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility('new_password')}
                  >
                    {showPasswords.new_password ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {formData.new_password && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Force du mot de passe</span>
                      <span className={`${passwordStrength.strength >= 75 ? 'text-green-400' : passwordStrength.strength >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {errors.new_password && (
                  <p className="mt-1 text-sm text-red-400">{errors.new_password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showPasswords.confirm_password ? 'text' : 'password'}
                    required
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.confirm_password ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility('confirm_password')}
                  >
                    {showPasswords.confirm_password ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                
                {/* Password match indicator */}
                {formData.confirm_password && (
                  <div className="mt-1 flex items-center">
                    {formData.new_password === formData.confirm_password ? (
                      <span className="text-green-400 text-xs">✓ Les mots de passe correspondent</span>
                    ) : (
                      <span className="text-red-400 text-xs">✗ Les mots de passe ne correspondent pas</span>
                    )}
                  </div>
                )}
                
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirm_password}</p>
                )}
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Réinitialisation...
                    </>
                  ) : (
                    'Réinitialiser le mot de passe'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;
