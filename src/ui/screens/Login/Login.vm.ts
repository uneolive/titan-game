// SEQ: 1.3 - Import useState, useId from react
import { useState, useCallback } from 'react';
// SEQ: 1.4 - Import useNavigate from react-router-dom
import { useNavigate } from 'react-router-dom';
// SEQ: 1.5 - Import login from AuthService
import { login } from '@/services/login/AuthService.ts';
// SEQ: 1.6 - Import isValidEmail from emailValidator
import { isValidEmail } from '@/helpers/validators/emailValidator.ts';
// SEQ: 1.7 - Import isValidPassword from passwordValidator
import { isValidPassword } from '@/helpers/validators/passwordValidator.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';
// SEQ: 1.8 - Import UserBO from types
import { UserBO } from '@/types/bos/login/UserBO.ts';
import Logger from '@/helpers/utilities/Logger.ts';

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
    // SEQ: 5.6 - Call isValidEmail(email)
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    return true;
  }, [email]);

  const validatePassword = useCallback((): boolean => {
    // SEQ: 5.8 - Call isValidPassword(password)
    if (!isValidPassword(password)) {
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

      // SEQ: 6.4 - Call login(email, password)
      const result = await login(email, password);

      if (result.statusCode === ServiceResultStatusENUM.SUCCESS && result.data) {
        const userData: UserBO = result.data.user;
        sessionStorage.setItem('user', JSON.stringify(userData));
        // SEQ: 6.33 - Call navigate to /projects route
        navigate('/projects');
      } else if (result.statusCode === ServiceResultStatusENUM.UNAUTHORIZED) {
        setError('Invalid email or password');
      } else if (result.statusCode === ServiceResultStatusENUM.VALIDATION_ERROR) {
        setError('Please check your input and try again');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      Logger.error('Unexpected error in handleLogin', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
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
