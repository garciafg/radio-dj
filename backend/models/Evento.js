const mongoose = require('mongoose');

const EventoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['chat', 'reacao', 'presente', 'seguir'],
    required: [true, 'Tipo de evento é obrigatório']
  },
  programacao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programacao',
    required: [true, 'Programação é obrigatória']
  },
  usuario: {
    nome: String,
    avatar: String,
    id: mongoose.Schema.Types.ObjectId
  },
  conteudo: {
    mensagem: String,
    reacao: String,
    presente: {
      tipo: String,
      valor: Number
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Índice para busca eficiente de eventos por programação
EventoSchema.index({ programacao: 1, timestamp: -1 });

module.exports = mongoose.model('Evento', EventoSchema); 