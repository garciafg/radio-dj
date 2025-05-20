import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const [djs, setDjs] = useState([]);
  const [programaAtual, setProgramaAtual] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [djsResponse, programacaoResponse] = await Promise.all([
          api.get('/dj'),
          api.get('/programacao')
        ]);

        setDjs(djsResponse.data);
        
        // Encontrar programa atual baseado no horário
        const agora = new Date();
        const diaSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][agora.getDay()];
        const horaAtual = `${agora.getHours()}:${agora.getMinutes()}`;

        const programaAtivo = programacaoResponse.data.find(prog => 
          prog.aoVivo && 
          prog.diasSemana.includes(diaSemana) &&
          prog.horarioInicio <= horaAtual &&
          prog.horarioFim > horaAtual
        );

        setProgramaAtual(programaAtivo);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    carregarDados();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-neon-purple via-retro-black to-retro-black opacity-75"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="relative h-full flex items-center justify-center text-center">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-display text-neon-pink animate-neon-pulse">
              Web Rádio Retrô
            </h1>
            <p className="text-xl text-neon-blue">
              A melhor música dos anos 80 e 90
            </p>
            <Link
              to="/programacao"
              className="inline-block mt-4 px-8 py-3 bg-neon-green text-black font-bold rounded-full hover:bg-opacity-80 transition-all transform hover:scale-105"
            >
              Ver Programação
            </Link>
          </div>
        </div>
      </section>

      {/* Programa Atual */}
      {programaAtual && (
        <section className="bg-retro-dark rounded-lg p-8 border-2 border-neon-blue">
          <h2 className="text-2xl font-display text-neon-blue mb-4">No Ar Agora</h2>
          <div className="flex items-center space-x-6">
            <img
              src={programaAtual.dj.fotoPerfil}
              alt={programaAtual.dj.nomeArtistico}
              className="w-24 h-24 rounded-full border-4 border-neon-pink animate-neon-pulse"
            />
            <div>
              <h3 className="text-xl text-neon-pink">{programaAtual.nomePrograma}</h3>
              <p className="text-neon-green">DJ {programaAtual.dj.nomeArtistico}</p>
              <p className="text-retro-light">{programaAtual.dj.cidade}/{programaAtual.dj.uf}</p>
            </div>
          </div>
        </section>
      )}

      {/* Nossa Equipe */}
      <section>
        <h2 className="text-2xl font-display text-neon-purple mb-8">Nossa Equipe</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {djs.map(dj => (
            <div 
              key={dj._id}
              className="bg-retro-dark rounded-lg p-4 border border-neon-purple hover:border-neon-pink transition-colors"
            >
              <img
                src={dj.fotoPerfil}
                alt={dj.nomeArtistico}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg text-neon-pink">{dj.nomeArtistico}</h3>
              <p className="text-retro-light">{dj.cidade}/{dj.uf}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {dj.estilosMusicais.map(estilo => (
                  <span
                    key={estilo._id}
                    className="px-2 py-1 text-xs rounded-full bg-neon-blue bg-opacity-20 text-neon-blue"
                  >
                    {estilo.nome}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sobre */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl font-display text-neon-green mb-4">Sobre a Rádio</h2>
          <p className="text-retro-light mb-4">
            Nossa web rádio é dedicada aos amantes da música eletrônica e da cultura dos anos 80 e 90.
            Com uma equipe de DJs talentosos, trazemos o melhor da música 24 horas por dia.
          </p>
          <p className="text-retro-light">
            Transmitimos direto dos melhores clubes e eventos, com programação variada e muita interação
            com nossos ouvintes.
          </p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-radial from-neon-blue to-transparent opacity-20"></div>
          <img
            src="/images/studio.jpg"
            alt="Estúdio da Rádio"
            className="rounded-lg shadow-2xl"
          />
        </div>
      </section>
    </div>
  );
} 