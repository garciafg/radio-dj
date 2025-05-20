import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Registro() {
  const [formData, setFormData] = useState({
    nomeArtistico: '',
    email: '',
    senha: '',
    cidade: '',
    uf: '',
    estilosMusicais: []
  });
  const [estilos, setEstilos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registro } = useAuth();

  useEffect(() => {
    const carregarEstilos = async () => {
      try {
        const response = await api.get('/admin/estilos');
        setEstilos(response.data);
      } catch (error) {
        console.error('Erro ao carregar estilos musicais:', error);
      }
    };

    carregarEstilos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEstilosChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      estilosMusicais: checked
        ? [...prev.estilosMusicais, value]
        : prev.estilosMusicais.filter(id => id !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.estilosMusicais.length > 4) {
      setError('Você só pode escolher até 4 estilos musicais');
      setLoading(false);
      return;
    }

    const result = await registro(formData);
    
    if (result.success) {
      navigate('/painel');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-retro-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-display text-neon-pink animate-neon-pulse">
            Registro DJ
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="nomeArtistico" className="text-neon-blue text-sm">Nome Artístico</label>
              <input
                id="nomeArtistico"
                name="nomeArtistico"
                type="text"
                required
                value={formData.nomeArtistico}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-neon-purple placeholder-gray-500 text-white bg-retro-dark rounded-md focus:outline-none focus:ring-neon-blue focus:border-neon-blue focus:z-10 sm:text-sm"
                placeholder="Seu nome artístico"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-neon-blue text-sm">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-neon-purple placeholder-gray-500 text-white bg-retro-dark rounded-md focus:outline-none focus:ring-neon-blue focus:border-neon-blue focus:z-10 sm:text-sm"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label htmlFor="senha" className="text-neon-blue text-sm">Senha</label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                value={formData.senha}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-neon-purple placeholder-gray-500 text-white bg-retro-dark rounded-md focus:outline-none focus:ring-neon-blue focus:border-neon-blue focus:z-10 sm:text-sm"
                placeholder="********"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cidade" className="text-neon-blue text-sm">Cidade</label>
                <input
                  id="cidade"
                  name="cidade"
                  type="text"
                  required
                  value={formData.cidade}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-neon-purple placeholder-gray-500 text-white bg-retro-dark rounded-md focus:outline-none focus:ring-neon-blue focus:border-neon-blue focus:z-10 sm:text-sm"
                  placeholder="Sua cidade"
                />
              </div>
              <div>
                <label htmlFor="uf" className="text-neon-blue text-sm">UF</label>
                <input
                  id="uf"
                  name="uf"
                  type="text"
                  required
                  maxLength="2"
                  value={formData.uf}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-neon-purple placeholder-gray-500 text-white bg-retro-dark rounded-md focus:outline-none focus:ring-neon-blue focus:border-neon-blue focus:z-10 sm:text-sm"
                  placeholder="UF"
                />
              </div>
            </div>
            <div>
              <label className="text-neon-blue text-sm block mb-2">Estilos Musicais (máx. 4)</label>
              <div className="grid grid-cols-2 gap-2">
                {estilos.map(estilo => (
                  <label key={estilo._id} className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      value={estilo._id}
                      checked={formData.estilosMusicais.includes(estilo._id)}
                      onChange={handleEstilosChange}
                      className="form-checkbox h-4 w-4 text-neon-green"
                    />
                    <span>{estilo.nome}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-neon-green hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-green"
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>

          <div className="text-center">
            <Link 
              to="/login"
              className="font-medium text-neon-blue hover:text-opacity-80"
            >
              Já tem conta? Faça login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 