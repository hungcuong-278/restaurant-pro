// Clear auth localStorage on app start if needed
const clearAuthIfNeeded = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  // If token exists but user doesn't, clear both
  if (token && !user) {
    localStorage.removeItem('authToken');
    console.log('🧹 Cleared orphaned auth token');
  }
  
  // If user exists but token doesn't, clear both  
  if (user && !token) {
    localStorage.removeItem('user');
    console.log('🧹 Cleared orphaned user data');
  }
  
  // If token is mock token and older than 24 hours, clear both
  if (token && token.startsWith('mock-jwt-token')) {
    // Mock tokens should be cleared periodically
    const lastLogin = localStorage.getItem('lastLoginTime');
    if (!lastLogin || Date.now() - parseInt(lastLogin) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('lastLoginTime');
      console.log('🧹 Cleared expired mock auth');
    }
  }
};

clearAuthIfNeeded();

export {};
