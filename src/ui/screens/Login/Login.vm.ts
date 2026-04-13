import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const LOGIN_PASSWORD = 'lévis';

export function useLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setPasswordError(null);
    setError(null);
  }, []);

  // SEQ: 4.2 - Call togglePasswordVisibility()
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const validatePassword = useCallback((): boolean => {
    if (!password) {
      setPasswordError('Please enter the password');
      return false;
    }

    if (password !== LOGIN_PASSWORD) {
      setPasswordError('Incorrect password');
      return false;
    }

    return true;
  }, [password]);

  const validateForm = useCallback((): boolean => {
    return validatePassword();
  }, [validatePassword]);

  const handleLogin = useCallback(async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setIsLoading(true);
      setError(null);

      sessionStorage.setItem(
        'user',
        JSON.stringify({
          userId: 'mock-user-1',
          email: 'local@submittal-assistant.dev',
          firstName: 'Local',
          lastName: 'User',
        })
      );
      navigate('/projects');
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, navigate]);

  return {
    password,
    isLoading,
    error,
    showPassword,
    passwordError,
    handlePasswordChange,
    togglePasswordVisibility,
    handleLogin,
  };
}
