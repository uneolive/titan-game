import { useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';
import logoSvg from '@/assets/images/logo.svg';

interface HeaderProps {
  userName: string;
  userRole?: string;
}

export function Header({ userName, userRole = 'User' }: HeaderProps) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate('/projects');
  };

  return (
    <header className="border-b border-gray-200 bg-white px-7 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div
          className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80"
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLogoClick();
            }
          }}
          aria-label="Go to Projects"
        >
          <div className="flex h-[31.5px] w-[31.5px] items-center justify-center rounded-[3.5px] border border-gray-200 bg-white">
            <img src={logoSvg} alt="Submittal Assistant Logo" className="h-[21.4px] w-[21.4px]" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-6 tracking-[-0.32px] text-gray-900">
              Submittal Assistant
            </h1>
            <p className="text-[10.5px] leading-[14px] text-gray-500">
              AI-Powered Review Interface
            </p>
          </div>
        </div>

        {/* User Menu */}
        <div className="relative">
          <div
            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-gray-50"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <div className="text-right">
              <p className="text-xs font-medium leading-[17.5px] text-gray-900">{userName}</p>
              <p className="text-[10.5px] leading-[14px] text-gray-500">{userRole}</p>
            </div>
            <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-gray-200 bg-gray-100">
              <FiUser size={17.5} className="text-gray-600" />
            </div>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              {/* User Info Section */}
              <div className="border-b border-gray-200 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>

              {/* Logout Button */}
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-error transition-colors hover:bg-red-50"
                  aria-label="Logout"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
