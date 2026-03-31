import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,         setUser]         = useState(null);
  const [role,         setRole]         = useState(null);
  const [token,        setToken]        = useState(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('gsu_token');
    const storedUser  = localStorage.getItem('gsu_user');
    const storedRole  = localStorage.getItem('gsu_role');
    const storedFirst = localStorage.getItem('gsu_first_login');

    if (storedToken && storedUser && storedRole) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
      setIsFirstLogin(storedFirst === '1');
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    const { token, user, role, is_first_login } = data;
    setToken(token);
    setUser(user);
    setRole(role);
    setIsFirstLogin(is_first_login);
    localStorage.setItem('gsu_token',       token);
    localStorage.setItem('gsu_user',        JSON.stringify(user));
    localStorage.setItem('gsu_role',        role);
    localStorage.setItem('gsu_first_login', is_first_login ? '1' : '0');
  };

  const logout = () => {
    setToken(null); setUser(null); setRole(null); setIsFirstLogin(false);
    localStorage.removeItem('gsu_token');
    localStorage.removeItem('gsu_user');
    localStorage.removeItem('gsu_role');
    localStorage.removeItem('gsu_first_login');
  };

  const clearFirstLogin = () => {
    setIsFirstLogin(false);
    localStorage.setItem('gsu_first_login', '0');
  };

  return (
    <AuthContext.Provider value={{
      user, role, token, isFirstLogin,
      loading, login, logout, clearFirstLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);