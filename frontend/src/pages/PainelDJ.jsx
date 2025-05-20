import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function PainelDJ() {
  const { dj } = useAuth();
  const [programacoes, setProgramacoes] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nomePrograma: '',
    diasSemana: [],
    horarioInicio: '',
    horarioFim: ''
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [programacoesResponse, notificacoesResponse] = await Promise.all([
          api.get('/programacao/minhas'),
          api.get('/dj/notificacoes')
        ]);

        setProgramacoes(programacoesResponse.data);
        setNotificacoes(notificacoesResponse.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const handleProgramacaoSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/programacao', formData);
      setProgramacoes([...programacoes, response.data]);
      setFormData({
        nomePrograma: '',
        diasSemana: [],
        horarioInicio: '',
        horarioFim: ''
      });
    } catch (error) {
      console.error('Erro ao criar programação:', error);
    }
  };

  const handleDiaSemanaChange = (dia) => {
    setFormData(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter(d => d !== dia)
        : [...prev.diasSemana, dia]
    }));
  };

  const marcarAoVivo = async (programacaoId) => {
    try {
      const response = await api.put(`/programacao/${programacaoId}/ao-vivo`);
      setProgramacoes(programacoes.map(prog => 
        prog._id === programacaoId ? response.data : prog
      ));
    } catch (error) {
      console.error('Erro ao marcar programa como ao vivo:', error);
    }
  };

  const marcarNotificacaoComoLida = async (notificacaoId) => {
    try {
      await api.put(`/dj/notificacoes/${notificacaoId}`);
      setNotificacoes(notificacoes.map(notif => 
        notif._id === notificacaoId ? { ...notif, lida: true } : notif
      ));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-neon-blue"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Perfil */}
      <div className="bg-retro-dark rounded-lg p-6 border border-neon-purple">
        <div className="text-center mb-6">
          <img
            src={dj.fotoPerfil}
            alt={dj.nomeArtistico}
            className="w-32 h-32 rounded-full border-4 border-neon-pink mx-auto mb-4"
          />
          <h2 className="text-2xl font-display text-neon-pink">{dj.nomeArtistico}</h2>
          <p className="text-neon-blue">{dj.cidade}/{dj.uf}</p>
        </div>
        <div className="space-y-2">
          {dj.estilosMusicais.map(estilo => (
            <span
              key={estilo._id}
              className="inline-block px-3 py-1 rounded-full bg-neon-purple bg-opacity-20 text-neon-purple text-sm mr-2"
            >
              {estilo.nome}
            </span>
          ))}
        </div>
      </div>

      {/* Programações */}
      <div className="lg:col-span-2 space-y-8">
        {/* Nova Programação */}
        <div className="bg-retro-dark rounded-lg p-6 border border-neon-green">
          <h3 className="text-xl font-display text-neon-green mb-4">Nova Programação</h3>
          <form onSubmit={handleProgramacaoSubmit} className="space-y-4">
            <div>
              <label className="text-neon-blue text-sm block mb-1">Nome do Programa</label>
              <input
                type="text"
                value={formData.nomePrograma}
                onChange={(e) => setFormData({ ...formData, nomePrograma: e.target.value })}
                className="w-full bg-retro-black border border-neon-purple rounded px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="text-neon-blue text-sm block mb-1">Dias da Semana</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'].map(dia => (
                  <label key={dia} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.diasSemana.includes(dia)}
                      onChange={() => handleDiaSemanaChange(dia)}
                      className="form-checkbox text-neon-green"
                    />
                    <span className="text-white capitalize">{dia}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-neon-blue text-sm block mb-1">Horário Início</label>
                <input
                  type="time"
                  value={formData.horarioInicio}
                  onChange={(e) => setFormData({ ...formData, horarioInicio: e.target.value })}
                  className="w-full bg-retro-black border border-neon-purple rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-neon-blue text-sm block mb-1">Horário Fim</label>
                <input
                  type="time"
                  value={formData.horarioFim}
                  onChange={(e) => setFormData({ ...formData, horarioFim: e.target.value })}
                  className="w-full bg-retro-black border border-neon-purple rounded px-3 py-2 text-white"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-neon-green text-black font-bold py-2 rounded hover:bg-opacity-80 transition-colors"
            >
              Criar Programação
            </button>
          </form>
        </div>

        {/* Lista de Programações */}
        <div className="space-y-4">
          <h3 className="text-xl font-display text-neon-purple">Minhas Programações</h3>
          {programacoes.map(prog => (
            <div
              key={prog._id}
              className="bg-retro-dark rounded-lg p-4 border border-neon-purple flex items-center justify-between"
            >
              <div>
                <h4 className="text-neon-pink font-bold">{prog.nomePrograma}</h4>
                <p className="text-neon-blue text-sm">
                  {prog.diasSemana.map(dia => dia.charAt(0).toUpperCase() + dia.slice(1)).join(', ')}
                </p>
                <p className="text-retro-light text-sm">
                  {prog.horarioInicio} - {prog.horarioFim}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  prog.aprovado 
                    ? 'bg-green-500 bg-opacity-20 text-green-500'
                    : 'bg-yellow-500 bg-opacity-20 text-yellow-500'
                }`}>
                  {prog.aprovado ? 'Aprovado' : 'Pendente'}
                </span>
                {prog.aprovado && (
                  <button
                    onClick={() => marcarAoVivo(prog._id)}
                    className={`px-4 py-2 rounded ${
                      prog.aoVivo
                        ? 'bg-red-500 hover:bg-opacity-80'
                        : 'bg-neon-green hover:bg-opacity-80'
                    } text-black font-bold transition-colors`}
                  >
                    {prog.aoVivo ? 'Encerrar' : 'Ao Vivo'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notificações */}
      <div className="lg:col-span-3">
        <h3 className="text-xl font-display text-neon-blue mb-4">Notificações</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notificacoes.map(notif => (
            <div
              key={notif._id}
              className={`bg-retro-dark rounded-lg p-4 border ${
                notif.lida ? 'border-retro-gray' : 'border-neon-blue animate-pulse'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-neon-pink font-bold">{notif.titulo}</h4>
                <span className={`text-xs ${
                  notif.lida ? 'text-retro-gray' : 'text-neon-blue'
                }`}>
                  {new Date(notif.dataCriacao).toLocaleDateString()}
                </span>
              </div>
              <p className="text-retro-light mb-4">{notif.mensagem}</p>
              {!notif.lida && (
                <button
                  onClick={() => marcarNotificacaoComoLida(notif._id)}
                  className="text-sm text-neon-green hover:text-opacity-80 transition-colors"
                >
                  Marcar como lida
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 