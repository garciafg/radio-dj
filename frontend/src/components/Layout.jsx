import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RadioPlayer from './RadioPlayer';

export default function Layout({ children }) {
  const { signed, dj, logout } = useAuth();
  const location = useLocation();

  const isAuthPage = ['/login', '/registro'].includes(location.pathname);

  if (isAuthPage) {
    return children;
  }

  return (
    <div className="min-h-screen bg-retro-black text-white">
      {/* Header */}
      <header className="bg-retro-dark border-b border-neon-purple">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-display text-neon-pink">
              Web Rádio
            </Link>

            <nav className="flex items-center space-x-6">
              <Link 
                to="/"
                className="text-neon-blue hover:text-opacity-80 transition-colors"
              >
                Home
              </Link>

              {signed ? (
                <>
                  <Link 
                    to="/painel"
                    className="text-neon-green hover:text-opacity-80 transition-colors"
                  >
                    Painel DJ
                  </Link>
                  <button
                    onClick={logout}
                    className="text-neon-purple hover:text-opacity-80 transition-colors"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link 
                  to="/login"
                  className="text-neon-green hover:text-opacity-80 transition-colors"
                >
                  Login DJ
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-retro-dark border-t border-neon-purple py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-neon-pink font-display text-lg mb-4">Web Rádio</h3>
              <p className="text-retro-light">
                A melhor rádio online com DJs incríveis e música de qualidade 24/7.
              </p>
            </div>
            <div>
              <h3 className="text-neon-blue font-display text-lg mb-4">Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-retro-light hover:text-neon-blue transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/programacao" className="text-retro-light hover:text-neon-blue transition-colors">
                    Programação
                  </Link>
                </li>
                <li>
                  <Link to="/eventos" className="text-retro-light hover:text-neon-blue transition-colors">
                    Eventos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-neon-green font-display text-lg mb-4">Redes Sociais</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-retro-light hover:text-neon-green transition-colors">
                  Instagram
                </a>
                <a href="#" className="text-retro-light hover:text-neon-green transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-retro-light hover:text-neon-green transition-colors">
                  YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Player fixo */}
      <RadioPlayer />
    </div>
  );
} 