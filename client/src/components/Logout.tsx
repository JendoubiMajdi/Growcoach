import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        const response = await fetch('http://localhost:5000/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Clear frontend storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('userType');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          
          // Redirect to login page
          navigate('/login', { replace: true });
        } else {
          const errorData = await response.json();
          console.error('Logout failed:', errorData.error);
          navigate('/');
        }
      } catch (error) {
        console.error('Error during logout:', error);
        navigate('/');
      }
    };

    performLogout();
  }, [navigate]);

  return <div>Logging out...</div>;
};

export default Logout;