import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import Footer from './Footer';

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('L\'adresse e-mail est requise.');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Veuillez entrer une adresse e-mail valide.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data: ForgotPasswordResponse = await response.json();

      if (response.ok) {
        // Success - backend returns 200 status with message
        setMessage(data.message);
        setEmailSent(true);
        // Redirect to verification page after 2 seconds
        setTimeout(() => {
          navigate('/verify-reset-code', { state: { email } });
        }, 2000);
      } else {
        // Error - backend returns error status with error message
        setError(data.error || 'Une erreur s\'est produite.');
      }
    } catch (error) {
      setError('Une erreur s\'est produite. Veuillez réessayer.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
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
          
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Mot de passe oublié
          </h2>
          
          <p className="mt-2 text-center text-sm text-gray-400">
            Entrez votre adresse e-mail pour recevoir un code de réinitialisation
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-6 shadow rounded-lg sm:px-10">
            {/* Back to login link */}
            <div className="mb-6">
              <Link 
                to="/login"
                className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion
              </Link>
            </div>

            {/* Success message */}
            {message && (
              <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-green-400 mr-2" />
                  <p className="text-sm text-green-400">{message}</p>
                </div>
                {emailSent && (
                  <p className="text-xs text-green-300 mt-2">
                    Redirection vers la page de vérification...
                  </p>
                )}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="votre.email@exemple.com"
                    disabled={isSubmitting || emailSent}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || emailSent}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ${
                    (isSubmitting || emailSent) ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : emailSent ? (
                    'Code envoyé ✓'
                  ) : (
                    'Envoyer le code de réinitialisation'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Vous vous souvenez de votre mot de passe ?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;
