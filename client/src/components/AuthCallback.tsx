import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      const userType = urlParams.get('user_type');
      const provider = urlParams.get('provider');
      const isNewUser = urlParams.get('new_user') === 'true';
      const error = urlParams.get('error');

      if (error) {
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!token || !userType) {
        setStatus('error');
        setMessage('Authentication failed. Missing credentials.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Store authentication data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userType', userType);
        
        // Get additional user info from token payload (optional)
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('userId', tokenPayload.sub);

        setStatus('success');
        
        if (isNewUser) {
          setMessage(`Welcome! Your account has been created successfully using ${provider}.`);
        } else {
          setMessage(`Welcome back! Logged in successfully using ${provider}.`);
        }

        // Redirect based on user type
        setTimeout(() => {
          if (userType === 'admin') {
            navigate('/admin-dashboard');
          } else if (userType === 'candidate') {
            navigate('/candidate-dashboard');
          } else if (userType === 'company') {
            navigate('/company-dashboard');
          } else {
            navigate('/');
          }
        }, 2000);

      } catch (error) {
        console.error('Error processing authentication:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-white mb-2">Authenticating...</h2>
              <p className="text-gray-400">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-green-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Success!</h2>
              <p className="text-gray-400">{message}</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Authentication Failed</h2>
              <p className="text-gray-400">{message}</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
