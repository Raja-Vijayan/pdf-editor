import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Ensure you're importing correctly from 'jwt-decode'
import axios from 'axios';

const authenticateUser = async (emailOrPhone, accessCode) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/authenticate_user/`, {
      email_number: emailOrPhone,
      access_code: accessCode,
    });
    return response.data; // Assumes response contains { token: '...', ... }
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

const PrivateRoute = ({ children, emailOrPhone, accessCode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const storedToken = sessionStorage.getItem('access_token');

        // Validate existing token if present
        if (storedToken) {
          const decodedToken = jwtDecode(storedToken);
          const isTokenValid = decodedToken.exp * 1000 > Date.now();

          if (isTokenValid) {
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          } else {
            // Clear invalid token
            sessionStorage.removeItem('access_token');
          }
        }

        // Authenticate user if no valid token is present
        const authData = await authenticateUser(emailOrPhone, accessCode);
        if (authData?.token) {
          sessionStorage.setItem('access_token', authData.token);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [emailOrPhone, accessCode]);

  if (isLoading) {
    return <div>Loading...</div>; // Consider replacing with a spinner or loading animation
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
