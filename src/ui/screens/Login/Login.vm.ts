import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // SEQ: 2.2 - Call handleEmailChange(value)
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setEmailError(null);
    setError(null);
  }, []);

  // SEQ: 3.2 - Call handlePasswordChange(value)
  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setPasswordError(null);
    setError(null);
  }, []);

  // SEQ: 4.2 - Call togglePasswordVisibility()
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const validateEmail = useCallback((): boolean => {
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    return true;
  }, [email]);

  const validatePassword = useCallback((): boolean => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    return true;
  }, [password]);

  // SEQ: 5.2 - Call validateForm()
  const validateForm = useCallback((): boolean => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    return isEmailValid && isPasswordValid;
  }, [validateEmail, validatePassword]);

  // SEQ: 5.3 - Call handleLogin()
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
          email,
          firstName: 'Demo',
          lastName: 'User',
        })
      );
      navigate('/projects');
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, validateForm, navigate]);

  return {
    email,
    password,
    isLoading,
    error,
    showPassword,
    emailError,
    passwordError,
    handleEmailChange,
    handlePasswordChange,
    togglePasswordVisibility,
    handleLogin,
  };
}
