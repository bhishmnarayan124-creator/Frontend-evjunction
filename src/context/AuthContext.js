import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedToken = localStorage.getItem('ev_token');
    const storedUser = localStorage.getItem('ev_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (accessToken, userData) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('ev_token', accessToken);
    localStorage.setItem('ev_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ev_token');
    localStorage.removeItem('ev_user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('ev_user', JSON.stringify(userData));
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';
  const isDealer = user?.role === 'dealer';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated,
      isAdmin,
      isDealer,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
