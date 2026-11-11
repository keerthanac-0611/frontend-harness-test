import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loginCustomer } from '../api/customerApi.js';

const TOKEN_KEY = 'customer_portal_token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));

  const login = useCallback(async (credentials) => {
    const result = await loginCustomer(credentials);
    sessionStorage.setItem(TOKEN_KEY, result.access_token);
    setToken(result.access_token);
    return result.customer;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ token, isAuthenticated: Boolean(token), login, logout }),
    [token, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
