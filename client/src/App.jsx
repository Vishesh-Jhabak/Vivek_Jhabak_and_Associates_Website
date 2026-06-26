import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { api } from './utils/api';

// Create Global Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on reload
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('ca_admin_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('ca_admin_token');
          }
        } catch (error) {
          console.error('Session validation error:', error.message);
          localStorage.removeItem('ca_admin_token');
        }
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('ca_admin_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ca_admin_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
            Authenticating Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <Routes>
          {/* Main Website landing page */}
          <Route path="/" element={<Home />} />
          
          {/* Admin Authentication page */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/admin" replace /> : <Login />} 
          />
          
          {/* Protected Admin Dashboards */}
          <Route 
            path="/admin/*" 
            element={user ? <Admin /> : <Navigate to="/login" replace />} 
          />
          
          {/* 404 Fallback redirects to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
export { AuthContext };
