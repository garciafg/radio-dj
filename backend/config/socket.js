const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const DJ = require('../models/DJ');
const Evento = require('../models/Evento');

module.exports = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST']
    }
  });

  // Middleware de autenticação do Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Autenticação necessária'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const dj = await DJ.findById(decoded.id);

      if (!dj) {
        return next(new Error('DJ não encontrado'));
      }

      socket.dj = dj;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  // Gerenciamento de conexões
  io.on('connection', (socket) => {
    console.log(`DJ ${socket.dj.nome} conectado`);

    // Entrar em uma sala de programação
    socket.on('entrar_programa', async (programaId) => {
      socket.join(`programa_${programaId}`);
      
      // Notifica outros usuários
      socket.to(`programa_${programaId}`).emit('usuario_entrou', {
        nome: socket.dj.nome,
        avatar: socket.dj.avatar
      });
    });

    // Enviar mensagem no chat
    socket.on('chat_mensagem', async (data) => {
      const { programaId, mensagem } = data;

      // Salva o evento de chat
      const evento = await Evento.create({
        tipo: 'chat',
        programacao: programaId,
        usuario: {
          nome: socket.dj.nome,
          avatar: socket.dj.avatar,
          id: socket.dj._id
        },
        conteudo: {
          mensagem
        }
      });

      // Envia para todos na sala
      io.to(`programa_${programaId}`).emit('chat_mensagem', {
        evento,
        dj: {
          nome: socket.dj.nome,
          avatar: socket.dj.avatar
        }
      });
    });

    // Enviar reação
    socket.on('reacao', async (data) => {
      const { programaId, reacao } = data;

      const evento = await Evento.create({
        tipo: 'reacao',
        programacao: programaId,
        usuario: {
          nome: socket.dj.nome,
          avatar: socket.dj.avatar,
          id: socket.dj._id
        },
        conteudo: {
          reacao
        }
      });

      io.to(`programa_${programaId}`).emit('reacao', {
        evento,
        dj: {
          nome: socket.dj.nome,
          avatar: socket.dj.avatar
        }
      });
    });

    // Enviar presente
    socket.on('presente', async (data) => {
      const { programaId, presente, valor } = data;

      const evento = await Evento.create({
        tipo: 'presente',
        programacao: programaId,
        usuario: {
          nome: socket.dj.nome,
          avatar: socket.dj.avatar,
          id: socket.dj._id
        },
        conteudo: {
          presente: {
            tipo: presente,
            valor
          }
        }
      });

      io.to(`programa_${programaId}`).emit('presente', {
        evento,
        dj: {
          nome: socket.dj.nome,
          avatar: socket.dj.avatar
        }
      });
    });

    // Sair de uma sala de programação
    socket.on('sair_programa', (programaId) => {
      socket.leave(`programa_${programaId}`);
      
      // Notifica outros usuários
      socket.to(`programa_${programaId}`).emit('usuario_saiu', {
        nome: socket.dj.nome,
        avatar: socket.dj.avatar
      });
    });

    // Desconexão
    socket.on('disconnect', () => {
      console.log(`DJ ${socket.dj.nome} desconectado`);
    });
  });

  return io;
}; 