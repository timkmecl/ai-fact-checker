import { useState, useEffect } from 'react';

const API_URL = process.env.API_URL

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  
  // Auto-login check
  useEffect(() => {
    fetch(`${API_URL}/verify`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) setIsAuthenticated(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput }),
      credentials: 'include', // Crucial: tells browser to accept/send cookies
    });

    if (response.ok) {
      setIsAuthenticated(true);
      setAuthError(false);
      setPasswordInput('');
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      setIsAuthenticated(false);
      setPasswordInput('');
      setAuthError(false);
    }).catch(err => {
      console.error("Logout failed", err);
    })
  };

  return {
    isAuthenticated,
    passwordInput,
    setPasswordInput,
    authError,
    handleLogin,
    handleLogout,
  };
};