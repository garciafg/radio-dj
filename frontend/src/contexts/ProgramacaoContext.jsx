import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const ProgramacaoContext = createContext({});

export function ProgramacaoProvider({ children }) {
  const [programacoes, setProgramacoes] = useState([]);
  const [programacaoAtual, setProgramacaoAtual] = useState(null);
  const [minhasProgramacoes, setMinhasProgramacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { signed } = useAuth();
  const { socket, connected } = useSocket();

  // Carregar todas as programações
  useEffect(() => {
    const carregarProgramacoes = async () => {
      try {
        setLoading(true);
        const response = await api.get('/programacao');
        setProgramacoes(response.data);
        
        // Define a programação atual (ao vivo)
        const aoVivo = response.data.find(prog => prog.status === 'ao_vivo');
        if (aoVivo) {
          setProgramacaoAtual(aoVivo);
        } else {
          // Se não houver ao vivo, verifica a próxima
          const proxima = response.data
            .filter(prog => prog.status === 'agendado')
            .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))[0];
          
          setProgramacaoAtual(proxima || null);
        }
      } catch (err) {
        setError('Erro ao carregar programações');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    carregarProgramacoes();
  }, []);

  // Integração com Socket.IO para atualizar programações em tempo real
  useEffect(() => {
    if (!socket || !connected) return;

    // Atualiza quando o status de uma programação muda
    socket.on('status_programacao', (data) => {
      const { programacaoId, status, dj } = data;
      
      // Atualiza lista de programações
      setProgramacoes(prev => 
        prev.map(prog => {
          // Se estamos iniciando uma transmissão ao vivo,
          // marcar outras programações ao vivo como finalizadas
          if (status === 'ao_vivo' && prog.status === 'ao_vivo' && prog._id !== programacaoId) {
            return { ...prog, status: 'finalizado' };
          }
          return prog._id === programacaoId ? { ...prog, status } : prog;
        })
      );
      
      // Atualiza minhas programações se for o DJ atual
      setMinhasProgramacoes(prev => 
        prev.map(prog => prog._id === programacaoId ? { ...prog, status } : prog)
      );
      
      // Atualiza programação atual se necessário
      if (status === 'ao_vivo') {
        const progAtualizada = programacoes.find(p => p._id === programacaoId);
        if (progAtualizada) {
          setProgramacaoAtual({ ...progAtualizada, status });
        }
      } else if (programacaoAtual?._id === programacaoId) {
        setProgramacaoAtual(null);
      }
    });

    // Escuta por nova programação criada
    socket.on('nova_programacao', (programacao) => {
      setProgramacoes(prev => [...prev, programacao]);
    });

    // Escuta por programação atualizada
    socket.on('programacao_atualizada', (programacao) => {
      setProgramacoes(prev => 
        prev.map(prog => prog._id === programacao._id ? programacao : prog)
      );
      
      if (programacaoAtual?._id === programacao._id) {
        setProgramacaoAtual(programacao);
      }
    });

    // Escuta por programação excluída
    socket.on('programacao_excluida', (id) => {
      setProgramacoes(prev => prev.filter(prog => prog._id !== id));
      
      if (programacaoAtual?._id === id) {
        setProgramacaoAtual(null);
      }
    });

    return () => {
      socket.off('status_programacao');
      socket.off('nova_programacao');
      socket.off('programacao_atualizada');
      socket.off('programacao_excluida');
    };
  }, [socket, connected, programacoes, programacaoAtual]);

  // Carregar programações do DJ autenticado
  useEffect(() => {
    const carregarMinhasProgramacoes = async () => {
      if (!signed) {
        setMinhasProgramacoes([]);
        return;
      }

      try {
        const response = await api.get('/programacao/minhas/lista');
        setMinhasProgramacoes(response.data);
      } catch (err) {
        console.error('Erro ao carregar suas programações:', err);
      }
    };

    carregarMinhasProgramacoes();
  }, [signed]);

  // Criar nova programação
  const criarProgramacao = async (dadosProgramacao, imagemCapa) => {
    try {
      const formData = new FormData();
      
      // Adicionar dados da programação
      Object.keys(dadosProgramacao).forEach(key => {
        if (key === 'recorrencia') {
          formData.append(key, JSON.stringify(dadosProgramacao[key]));
        } else {
          formData.append(key, dadosProgramacao[key]);
        }
      });
      
      // Adicionar imagem se existir
      if (imagemCapa) {
        formData.append('imagemCapa', imagemCapa);
      }

      const response = await api.post('/programacao', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMinhasProgramacoes(prev => [...prev, response.data]);
      
      return { sucesso: true, programacao: response.data };
    } catch (err) {
      return { 
        sucesso: false, 
        erro: err.response?.data?.erro || 'Erro ao criar programação' 
      };
    }
  };

  // Atualizar programação
  const atualizarProgramacao = async (id, dadosProgramacao, imagemCapa) => {
    try {
      const formData = new FormData();
      
      // Adicionar dados da programação
      Object.keys(dadosProgramacao).forEach(key => {
        if (key === 'recorrencia') {
          formData.append(key, JSON.stringify(dadosProgramacao[key]));
        } else {
          formData.append(key, dadosProgramacao[key]);
        }
      });
      
      // Adicionar imagem se existir
      if (imagemCapa) {
        formData.append('imagemCapa', imagemCapa);
      }

      const response = await api.put(`/programacao/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Atualiza os estados
      setMinhasProgramacoes(prev => 
        prev.map(prog => prog._id === id ? response.data : prog)
      );
      
      setProgramacoes(prev => 
        prev.map(prog => prog._id === id ? response.data : prog)
      );
      
      if (programacaoAtual?._id === id) {
        setProgramacaoAtual(response.data);
      }
      
      return { sucesso: true, programacao: response.data };
    } catch (err) {
      return { 
        sucesso: false, 
        erro: err.response?.data?.erro || 'Erro ao atualizar programação' 
      };
    }
  };

  // Alterar status da programação (ao vivo, finalizada, etc.)
  const alterarStatus = async (id, status) => {
    try {
      const response = await api.put(`/programacao/${id}/status`, { status });
      
      // Atualiza os estados
      setMinhasProgramacoes(prev => 
        prev.map(prog => prog._id === id ? response.data : prog)
      );
      
      setProgramacoes(prev => {
        const updated = prev.map(prog => {
          // Se estamos iniciando uma transmissão ao vivo,
          // marcar outras programações ao vivo como finalizadas
          if (status === 'ao_vivo' && prog.status === 'ao_vivo' && prog._id !== id) {
            return { ...prog, status: 'finalizado' };
          }
          return prog._id === id ? response.data : prog;
        });
        
        return updated;
      });
      
      // Atualiza programação atual se necessário
      if (status === 'ao_vivo') {
        setProgramacaoAtual(response.data);
      } else if (programacaoAtual?._id === id) {
        setProgramacaoAtual(null);
      }
      
      return { sucesso: true, programacao: response.data };
    } catch (err) {
      return { 
        sucesso: false, 
        erro: err.response?.data?.erro || 'Erro ao alterar status da programação' 
      };
    }
  };

  // Excluir programação
  const excluirProgramacao = async (id) => {
    try {
      await api.delete(`/programacao/${id}`);
      
      // Atualiza os estados
      setMinhasProgramacoes(prev => prev.filter(prog => prog._id !== id));
      setProgramacoes(prev => prev.filter(prog => prog._id !== id));
      
      if (programacaoAtual?._id === id) {
        setProgramacaoAtual(null);
      }
      
      return { sucesso: true };
    } catch (err) {
      return { 
        sucesso: false, 
        erro: err.response?.data?.erro || 'Erro ao excluir programação' 
      };
    }
  };

  const value = {
    programacoes,
    programacaoAtual,
    minhasProgramacoes,
    loading,
    error,
    criarProgramacao,
    atualizarProgramacao,
    alterarStatus,
    excluirProgramacao
  };

  return (
    <ProgramacaoContext.Provider value={value}>
      {children}
    </ProgramacaoContext.Provider>
  );
}

export function useProgramacao() {
  const context = useContext(ProgramacaoContext);
  
  if (!context) {
    throw new Error('useProgramacao deve ser usado dentro de um ProgramacaoProvider');
  }
  
  return context;
} 