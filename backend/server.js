require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/radio', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Middleware para disponibilizar io nas rotas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/djs', require('./routes/djs'));
app.use('/api/programacao', require('./routes/programacao'));
app.use('/api/estilos', require('./routes/estilos'));
app.use('/api/admin', require('./routes/admin'));

// Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });

  // Eventos de chat
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  // Eventos de programação ao vivo
  socket.on('programa ao vivo', (programa) => {
    io.emit('programa ao vivo', programa);
  });

  // Eventos para salas específicas de programação
  socket.on('entrar_programa', (programaId) => {
    socket.join(`programa:${programaId}`);
    socket.to(`programa:${programaId}`).emit('usuario_entrou', {
      socketId: socket.id,
      timestamp: new Date()
    });
  });

  socket.on('sair_programa', (programaId) => {
    socket.leave(`programa:${programaId}`);
    socket.to(`programa:${programaId}`).emit('usuario_saiu', {
      socketId: socket.id,
      timestamp: new Date()
    });
  });

  socket.on('chat_mensagem', ({ programaId, mensagem }) => {
    io.to(`programa:${programaId}`).emit('chat_mensagem', {
      socketId: socket.id,
      mensagem,
      timestamp: new Date()
    });
  });

  socket.on('reacao', ({ programaId, reacao }) => {
    io.to(`programa:${programaId}`).emit('reacao', {
      socketId: socket.id,
      reacao,
      timestamp: new Date()
    });
  });

  socket.on('presente', ({ programaId, presente, valor }) => {
    io.to(`programa:${programaId}`).emit('presente', {
      socketId: socket.id,
      presente,
      valor,
      timestamp: new Date()
    });
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    erro: 'Erro interno do servidor.'
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 