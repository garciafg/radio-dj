const mongoose = require('mongoose');

const ProgramacaoSchema = new mongoose.Schema({
  dj: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DJ',
    required: [true, 'DJ é obrigatório']
  },
  titulo: {
    type: String,
    required: [true, 'Título é obrigatório'],
    maxLength: 100
  },
  descricao: {
    type: String,
    maxLength: 500
  },
  estiloMusical: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EstiloMusical',
    required: [true, 'Estilo musical é obrigatório']
  },
  dataInicio: {
    type: Date,
    required: [true, 'Data de início é obrigatória']
  },
  duracao: {
    type: Number, // duração em minutos
    required: [true, 'Duração é obrigatória'],
    min: 30,
    max: 240
  },
  recorrencia: {
    tipo: {
      type: String,
      enum: ['unica', 'diaria', 'semanal'],
      default: 'unica'
    },
    diasSemana: [{
      type: Number, // 0-6 (Domingo-Sábado)
    }]
  },
  status: {
    type: String,
    enum: ['agendado', 'ao_vivo', 'finalizado', 'cancelado'],
    default: 'agendado'
  },
  imagemCapa: {
    type: String,
    default: 'default-program.png'
  },
  streamUrl: String,
  chatAtivo: {
    type: Boolean,
    default: true
  },
  visualizacoes: {
    type: Number,
    default: 0
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  }
});

// Índice para busca eficiente de programações ativas
ProgramacaoSchema.index({ dataInicio: 1, status: 1 });

module.exports = mongoose.model('Programacao', ProgramacaoSchema); 