import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [dj, setDj] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('@RadioDJ:token');
    const storedDj = localStorage.getItem('@RadioDJ:dj');

    if (token && storedDj) {
      api.defaults.headers.authorization = `Bearer ${token}`;
      setDj(JSON.parse(storedDj));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { dj, token } = response.data;

      localStorage.setItem('@RadioDJ:token', token);
      localStorage.setItem('@RadioDJ:dj', JSON.stringify(dj));
      
      api.defaults.headers.authorization = `Bearer ${token}`;
      setDj(dj);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.mensagem || 'Erro ao fazer login'
      };
    }
  };

  const registro = async (dados) => {
    try {
      const response = await api.post('/auth/registro', dados);
      const { dj, token } = response.data;

      localStorage.setItem('@RadioDJ:token', token);
      localStorage.setItem('@RadioDJ:dj', JSON.stringify(dj));
      
      api.defaults.headers.authorization = `Bearer ${token}`;
      setDj(dj);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.mensagem || 'Erro ao fazer registro'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('@RadioDJ:token');
    localStorage.removeItem('@RadioDJ:dj');
    api.defaults.headers.authorization = '';
    setDj(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-neon-blue"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ 
      signed: !!dj,
      dj,
      login,
      registro,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 