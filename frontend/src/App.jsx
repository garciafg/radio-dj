import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProgramacaoProvider } from './contexts/ProgramacaoContext';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import PainelDJ from './pages/PainelDJ';
import Programacao from './pages/Programacao';
import ChatLive from './pages/ChatLive';
import Eventos from './pages/Eventos';
import NotFound from './pages/NotFound';

// Rota privada que verifica autenticação
function PrivateRoute({ children }) {
  const { signed } = useAuth();
  
  if (!signed) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ProgramacaoProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/programacao" element={<Programacao />} />
                <Route path="/chat/:id" element={<ChatLive />} />
                <Route path="/eventos" element={<Eventos />} />
                <Route 
                  path="/painel/*" 
                  element={
                    <PrivateRoute>
                      <PainelDJ />
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </ProgramacaoProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 