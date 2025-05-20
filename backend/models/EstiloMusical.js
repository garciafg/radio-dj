const mongoose = require('mongoose');

const EstiloMusicalSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome do estilo musical é obrigatório'],
    unique: true
  },
  descricao: {
    type: String,
    maxLength: 200
  },
  icone: {
    type: String,
    default: 'default-style-icon.png'
  },
  corTema: {
    type: String,
    default: '#FF00FF' // Cor neon padrão
  },
  ativo: {
    type: Boolean,
    default: true
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EstiloMusical', EstiloMusicalSchema); 