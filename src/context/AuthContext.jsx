import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    phone: localStorage.getItem('userPhone') || null,
    role: localStorage.getItem('userRole') || null,
    name: localStorage.getItem('userName') || null,
  });

const login = (phone, role, name) => {
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
    setUser({ phone, role, name });
  };

  const logout = () => {
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setUser({ phone: null, role: null, name: null });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}