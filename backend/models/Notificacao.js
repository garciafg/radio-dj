const mongoose = require('mongoose');

const NotificacaoSchema = new mongoose.Schema({
  destinatario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DJ',
    required: [true, 'Destinatário é obrigatório']
  },
  tipo: {
    type: String,
    enum: ['aprovacao_dj', 'nova_programacao', 'cancelamento', 'sistema', 'seguidor'],
    required: [true, 'Tipo de notificação é obrigatório']
  },
  titulo: {
    type: String,
    required: [true, 'Título é obrigatório']
  },
  mensagem: {
    type: String,
    required: [true, 'Mensagem é obrigatória']
  },
  lida: {
    type: Boolean,
    default: false
  },
  dados: {
    type: mongoose.Schema.Types.Mixed // Dados adicionais específicos do tipo de notificação
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  }
});

// Índice para busca eficiente de notificações não lidas
NotificacaoSchema.index({ destinatario: 1, lida: 1, dataCriacao: -1 });

module.exports = mongoose.model('Notificacao', NotificacaoSchema); 