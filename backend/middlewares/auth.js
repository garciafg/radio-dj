const jwt = require('jsonwebtoken');
const DJ = require('../models/DJ');

module.exports = {
  // Middleware para verificar token JWT
  verificarToken: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          erro: 'Acesso negado. Token não fornecido.' 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const dj = await DJ.findById(decoded.id);

      if (!dj) {
        return res.status(401).json({ 
          erro: 'Token inválido. Usuário não encontrado.' 
        });
      }

      req.dj = dj;
      next();
    } catch (error) {
      return res.status(401).json({ 
        erro: 'Token inválido ou expirado.' 
      });
    }
  },

  // Middleware para verificar se o DJ está aprovado
  verificarAprovacao: (req, res, next) => {
    if (!req.dj.aprovado) {
      return res.status(403).json({
        erro: 'Acesso negado. Aguardando aprovação do administrador.'
      });
    }
    next();
  },

  // Middleware para verificar se é administrador
  verificarAdmin: (req, res, next) => {
    if (!req.dj.admin) {
      return res.status(403).json({
        erro: 'Acesso negado. Apenas administradores podem acessar este recurso.'
      });
    }
    next();
  }
}; 