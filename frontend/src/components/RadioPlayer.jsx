import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useSocket } from '../contexts/SocketContext';

export default function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [programaAtual, setProgramaAtual] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('programa ao vivo', (programa) => {
        setProgramaAtual(programa);
      });
    }
  }, [socket]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-retro-black border-t-2 border-neon-blue p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Info do programa */}
        <div className="flex items-center space-x-4">
          {programaAtual && (
            <>
              <img 
                src={programaAtual.dj.fotoPerfil} 
                alt={programaAtual.dj.nomeArtistico}
                className="w-12 h-12 rounded-full border-2 border-neon-pink animate-neon-pulse"
              />
              <div>
                <h3 className="text-neon-pink font-display text-sm">
                  {programaAtual.nomePrograma}
                </h3>
                <p className="text-neon-blue font-retro">
                  DJ {programaAtual.dj.nomeArtistico}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Controles do player */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-neon-purple hover:bg-opacity-80 text-retro-black font-bold py-2 px-4 rounded-full transform hover:scale-105 transition-all"
          >
            {isPlaying ? 'Pausar' : 'Tocar'}
          </button>

          <div className="w-32">
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-retro-gray rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Player oculto */}
        <ReactPlayer
          url="URL_DO_SEU_STREAMING"
          playing={isPlaying}
          volume={volume}
          width="0"
          height="0"
        />
      </div>
    </div>
  );
} 