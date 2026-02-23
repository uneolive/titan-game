import { UserBO } from '@/types/bos/login/UserBO.ts';

/**
 * Custom hook to get current user from session storage
 * @returns User object or null if not logged in
 */
export function useUser(): UserBO | null {
  try {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) return null;

    return JSON.parse(userJson) as UserBO;
  } catch (error) {
    console.error('Failed to parse user from session storage', error);
    return null;
  }
}

/**
 * Get user display name
 * @returns Full name or 'User' as fallback
 */
export function useUserName(): string {
  const user = useUser();
  if (!user) return 'User';

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return fullName || 'User';
}

/**
 * Get user role
 * @returns User role (defaults to 'User' since API doesn't provide role)
 */
export function useUserRole(): string {
  // Since the API doesn't return a role field, we default to 'User'
  // This can be updated when the API starts providing role information
  return 'User';
}
