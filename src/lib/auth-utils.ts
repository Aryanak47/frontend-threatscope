/**
 * Shared authentication utilities
 * Consolidates duplicate auth token and user ID retrieval logic
 */

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Try direct token first
    const directToken = localStorage.getItem('threatscope_token');
    if (directToken) return directToken;
    
    // Try auth store
    const authStore = localStorage.getItem('threatscope-auth');
    if (authStore) {
      const parsed = JSON.parse(authStore);
      return parsed.state?.token || null;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

export const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const directUser = localStorage.getItem('threatscope_user');
    if (directUser) {
      return JSON.parse(directUser)?.id?.toString();
    }
    
    const authStore = localStorage.getItem('threatscope-auth');
    if (authStore) {
      return JSON.parse(authStore).state?.user?.id?.toString();
    }
  } catch (error) {
    console.error('Failed to get user ID:', error);
  }
  return null;
};

export const getUserName = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const directUser = localStorage.getItem('threatscope_user');
    if (directUser) {
      const user = JSON.parse(directUser);
      return `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
    }
    
    const authStore = localStorage.getItem('threatscope-auth');
    if (authStore) {
      const user = JSON.parse(authStore).state?.user;
      return `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
    }
  } catch {
    return null;
  }
  return 'User';
};