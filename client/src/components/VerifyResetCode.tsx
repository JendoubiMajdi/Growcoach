import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Shield, RefreshCw } from 'lucide-react';
import Footer from './Footer';

const API_BASE_URL = 'http://localhost:5000';

interface VerifyCodeResponse {
  success: boolean;
  message: string;
  error?: string;
}

const VerifyResetCode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if 6 digits were pasted
    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (codeString?: string) => {
    const verificationCode = codeString || code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Veuillez entrer les 6 chiffres du code.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          code: verificationCode 
        }),
      });

      const data: VerifyCodeResponse = await response.json();

      if (data.success) {
        navigate('/reset-password', { 
          state: { 
            email,
            code: verificationCode
          } 
        });
      } else {
        setError(data.error || 'Code invalide.');
        // Clear the code on error
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Une erreur s\'est produite. Veuillez réessayer.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setTimeLeft(600); // Reset timer
        setCode(['', '', '', '', '', '']);
        setError('');
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Erreur lors du renvoi du code.');
    }
  };

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
            Vérification du code
          </h2>
          
          <p className="mt-2 text-center text-sm text-gray-400">
            Entrez le code à 6 chiffres envoyé à<br />
            <span className="text-purple-400 font-medium">{email}</span>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-6 shadow rounded-lg sm:px-10">
            {/* Back button */}
            <div className="mb-6">
              <Link 
                to="/forgot-password"
                className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Changer d'adresse e-mail
              </Link>
            </div>

            {/* Timer */}
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 text-purple-400 mr-2" />
                <span className="text-sm text-gray-300">Code valide pendant</span>
              </div>
              <div className={`text-2xl font-mono font-bold ${
                timeLeft <= 60 ? 'text-red-400' : 'text-purple-400'
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Code input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-4 text-center">
                Code de vérification
              </label>
              <div className="flex justify-center space-x-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl font-bold bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isSubmitting || timeLeft === 0}
                  />
                ))}
              </div>
            </div>

            {/* Submit button */}
            <div className="mb-6">
              <button
                onClick={() => handleSubmit()}
                disabled={isSubmitting || timeLeft === 0 || code.some(digit => digit === '')}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ${
                  (isSubmitting || timeLeft === 0 || code.some(digit => digit === '')) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Vérification...
                  </>
                ) : (
                  'Vérifier le code'
                )}
              </button>
            </div>

            {/* Resend code */}
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">
                Vous n'avez pas reçu le code ?
              </p>
              <button
                onClick={handleResendCode}
                disabled={timeLeft > 540} // Disable for first 60 seconds
                className={`inline-flex items-center text-sm font-medium ${
                  timeLeft > 540 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'text-purple-400 hover:text-purple-300'
                } transition-colors`}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Renvoyer le code
                {timeLeft > 540 && (
                  <span className="ml-1">({Math.ceil((timeLeft - 540) / 60)}m)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VerifyResetCode;
