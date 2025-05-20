const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DJSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    select: false
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  biografia: {
    type: String,
    maxLength: 500
  },
  estilosMusicais: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EstiloMusical'
  }],
  aprovado: {
    type: Boolean,
    default: false
  },
  dataCadastro: {
    type: Date,
    default: Date.now
  },
  redesSociais: {
    instagram: String,
    twitter: String,
    soundcloud: String
  }
});

// Middleware para hash da senha antes de salvar
DJSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

// Método para comparar senhas
DJSchema.methods.compararSenha = async function(senhaInformada) {
  return await bcrypt.compare(senhaInformada, this.senha);
};

module.exports = mongoose.model('DJ', DJSchema); 