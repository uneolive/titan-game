import { useLogin } from './Login.vm.ts';
import { Spinner } from '@/ui/reusables/Spinner/Spinner.tsx';
import logoSvg from '@/assets/images/logo.svg';
import emailIconSvg from '@/assets/images/email-icon.svg';
import passwordToggleSvg from '@/assets/images/password-toggle.svg';

export function Login() {
  const {
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
  } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F6F6] px-4">
      <div className="w-full max-w-[392px]">
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[10px] border border-gray-200 bg-white shadow-sm">
            <img src={logoSvg} alt="Submittal Assistant Logo" className="h-[35.4px] w-[35.4px]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-7 text-gray-900">Submittal Assistant</h1>
            <p className="text-xs leading-[17.5px] text-gray-500">AI-Powered Review Interface</p>
          </div>
        </div>

        <div className="rounded-[10px] border border-gray-200 bg-white p-7 shadow-sm">
          <div className="mb-7 text-center">
            <h2 className="text-xl font-semibold leading-6 tracking-[-0.4px] text-gray-900">
              Login
            </h2>
            <p className="mt-2 text-sm leading-[21px] text-gray-500">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} aria-label="User login form">
            <div className="mb-[21px]">
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium leading-[18px] text-gray-900"
              >
                Email
              </label>
              <div className="relative">
                <img
                  src={emailIconSvg}
                  alt=""
                  className="pointer-events-none absolute left-[10.5px] top-1/2 h-[14px] w-[14px] -translate-y-1/2"
                />
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`h-[38.5px] w-full rounded-lg border ${
                    emailError ? 'border-error' : 'border-gray-200'
                  } bg-white px-[34.8px] text-xs text-gray-900 placeholder-gray-500 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                  placeholder="Enter your email"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
              </div>
              {emailError && (
                <p id="email-error" className="mt-1 text-xs text-error">
                  {emailError}
                </p>
              )}
            </div>

            <div className="mb-[21px]">
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-medium leading-[18px] text-gray-900"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`h-[38.5px] w-full rounded-lg border ${
                    passwordError ? 'border-error' : 'border-gray-200'
                  } bg-white px-[10.3px] pr-8 text-xs text-gray-900 placeholder-gray-500 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                  placeholder="Enter your password"
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-[10.5px] top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <div className="relative">
                    <img src={passwordToggleSvg} alt="" className="h-[14px] w-[14px]" />
                    {showPassword && (
                      <div className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 rotate-45 bg-gray-400" />
                    )}
                  </div>
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="mt-1 text-xs text-error">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="h-[38.5px] w-full rounded-lg bg-primary text-xs font-medium leading-[17.5px] text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
              aria-label="Submit login form"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" color="#ffffff" />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
