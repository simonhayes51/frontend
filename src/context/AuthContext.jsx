// In AuthContext.jsx, add logging to checkAuthStatus:
const checkAuthStatus = async () => {
  try {
    console.log('AUTH: Checking authentication status...');
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const response = await api.get('/api/me');
    console.log('AUTH: User authenticated:', response.data);
    dispatch({ 
      type: 'SET_AUTHENTICATED', 
      payload: response.data 
    });
  } catch (error) {
    console.log('AUTH: User not authenticated:', error.response?.status);
    dispatch({ type: 'SET_UNAUTHENTICATED' });
  }
};
