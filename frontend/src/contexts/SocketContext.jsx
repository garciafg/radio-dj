import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [error, setError] = useState(null);
  const { signed, dj } = useAuth();

  // Inicializa o Socket.IO quando o usuário estiver autenticado
  useEffect(() => {
    if (!signed) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Inicializa o Socket.IO com o token JWT
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
      auth: {
        token: localStorage.getItem('@RadioDJ:token')
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    // Eventos de conexão
    socketInstance.on('connect', () => {
      console.log('Socket.IO conectado');
      setConnected(true);
      setReconnectAttempts(0);
      setError(null);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket.IO desconectado:', reason);
      setConnected(false);
      
      // Se desconectado devido a erro de rede, tenta reconectar
      if (reason === 'io server disconnect') {
        // Desconexão iniciada pelo servidor, reconexão manual necessária
        setTimeout(() => {
          socketInstance.connect();
        }, 1000);
      }
      // Em outros casos, o cliente tentará reconectar automaticamente
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Erro de conexão Socket.IO:', error.message);
      setConnected(false);
      setError(`Erro de conexão: ${error.message}`);
      setReconnectAttempts(prev => prev + 1);
      
      // Se exceder número de tentativas, notificar usuário
      if (reconnectAttempts >= 5) {
        console.error('Falha ao reconectar após várias tentativas');
      }
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`Reconectado após ${attemptNumber} tentativas`);
      setReconnectAttempts(0);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Tentativa de reconexão ${attemptNumber}`);
      setReconnectAttempts(attemptNumber);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('Erro ao tentar reconectar:', error);
      setError(`Erro ao reconectar: ${error.message}`);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('Falha na reconexão');
      setError('Não foi possível reconectar ao servidor');
    });

    // Armazena o socket na state
    setSocket(socketInstance);

    // Limpa a conexão quando o componente for desmontado
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [signed]);

  // Função para forçar uma reconexão
  const forceReconnect = () => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  };

  // Entrar em uma sala de programação
  const entrarPrograma = (programaId) => {
    if (!socket || !connected) {
      setError('Não foi possível entrar no programa: sem conexão');
      return false;
    }
    
    try {
      socket.emit('entrar_programa', programaId);
      
      // Registra os handlers de eventos para esta sala
      registrarEventosPrograma(programaId);
      
      return true;
    } catch (err) {
      setError(`Erro ao entrar no programa: ${err.message}`);
      return false;
    }
  };

  // Sair de uma sala de programação
  const sairPrograma = (programaId) => {
    if (!socket || !connected) return false;
    
    try {
      socket.emit('sair_programa', programaId);
      
      // Remove os handlers de eventos
      removerEventosPrograma();
      
      return true;
    } catch (err) {
      setError(`Erro ao sair do programa: ${err.message}`);
      return false;
    }
  };

  // Enviar mensagem de chat
  const enviarMensagem = (programaId, mensagem) => {
    if (!socket || !connected) {
      setError('Não foi possível enviar mensagem: sem conexão');
      return false;
    }
    
    try {
      socket.emit('chat_mensagem', { programaId, mensagem });
      return true;
    } catch (err) {
      setError(`Erro ao enviar mensagem: ${err.message}`);
      return false;
    }
  };

  // Enviar reação
  const enviarReacao = (programaId, reacao) => {
    if (!socket || !connected) return false;
    
    try {
      socket.emit('reacao', { programaId, reacao });
      return true;
    } catch (err) {
      setError(`Erro ao enviar reação: ${err.message}`);
      return false;
    }
  };

  // Enviar presente
  const enviarPresente = (programaId, presente, valor) => {
    if (!socket || !connected) return false;
    
    try {
      socket.emit('presente', { programaId, presente, valor });
      return true;
    } catch (err) {
      setError(`Erro ao enviar presente: ${err.message}`);
      return false;
    }
  };

  // Registrar handlers de eventos para uma sala específica
  const registrarEventosPrograma = (programaId) => {
    if (!socket) return;

    // Limpa eventos anteriores
    setEventos([]);
    
    // Configura handlers para eventos de sala
    socket.on('chat_mensagem', (data) => {
      setEventos(prev => [...prev, { 
        tipo: 'chat',
        data,
        timestamp: new Date() 
      }]);
    });
    
    socket.on('reacao', (data) => {
      setEventos(prev => [...prev, { 
        tipo: 'reacao',
        data,
        timestamp: new Date() 
      }]);
    });
    
    socket.on('presente', (data) => {
      setEventos(prev => [...prev, { 
        tipo: 'presente',
        data,
        timestamp: new Date() 
      }]);
    });
    
    socket.on('usuario_entrou', (data) => {
      setEventos(prev => [...prev, { 
        tipo: 'usuario_entrou',
        data,
        timestamp: new Date() 
      }]);
    });
    
    socket.on('usuario_saiu', (data) => {
      setEventos(prev => [...prev, { 
        tipo: 'usuario_saiu',
        data,
        timestamp: new Date() 
      }]);
    });
  };

  // Remove handlers de eventos específicos de sala
  const removerEventosPrograma = () => {
    if (!socket) return;
    
    socket.off('chat_mensagem');
    socket.off('reacao');
    socket.off('presente');
    socket.off('usuario_entrou');
    socket.off('usuario_saiu');
  };

  // Limpar todos os eventos
  const limparEventos = () => {
    setEventos([]);
  };

  // Limpar erro
  const limparErro = () => {
    setError(null);
  };

  const value = {
    socket,
    connected,
    eventos,
    error,
    reconnectAttempts,
    entrarPrograma,
    sairPrograma,
    enviarMensagem,
    enviarReacao,
    enviarPresente,
    limparEventos,
    limparErro,
    forceReconnect
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket deve ser usado dentro de um SocketProvider');
  }
  
  return context;
} 