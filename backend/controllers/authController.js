const jwt = require('jsonwebtoken');
const DJ = require('../models/DJ');

const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

module.exports = {
  // Registro de novo DJ
  registro: async (req, res) => {
    try {
      const { nome, email, senha, biografia, redesSociais } = req.body;

      // Verifica se já existe um DJ com este email
      const djExistente = await DJ.findOne({ email });
      if (djExistente) {
        return res.status(400).json({
          erro: 'Email já cadastrado.'
        });
      }

      // Cria o novo DJ
      const dj = await DJ.create({
        nome,
        email,
        senha,
        biografia,
        redesSociais,
        avatar: req.file ? req.file.filename : undefined
      });

      // Remove a senha do objeto de resposta
      dj.senha = undefined;

      // Gera o token JWT
      const token = gerarToken(dj._id);

      res.status(201).json({
        dj,
        token
      });
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao registrar DJ. Tente novamente.'
      });
    }
  },

  // Login de DJ
  login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      // Busca o DJ pelo email e inclui o campo senha
      const dj = await DJ.findOne({ email }).select('+senha');
      
      if (!dj) {
        return res.status(401).json({
          erro: 'Email ou senha inválidos.'
        });
      }

      // Verifica a senha
      const senhaCorreta = await dj.compararSenha(senha);
      if (!senhaCorreta) {
        return res.status(401).json({
          erro: 'Email ou senha inválidos.'
        });
      }

      // Remove a senha do objeto de resposta
      dj.senha = undefined;

      // Gera o token JWT
      const token = gerarToken(dj._id);

      res.json({
        dj,
        token
      });
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao fazer login. Tente novamente.'
      });
    }
  },

  // Recuperar informações do DJ autenticado
  perfil: async (req, res) => {
    try {
      const dj = await DJ.findById(req.dj._id)
        .populate('estilosMusicais');

      res.json(dj);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao recuperar perfil. Tente novamente.'
      });
    }
  }
}; 