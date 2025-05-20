const express = require('express');
const router = express.Router();
const djController = require('../controllers/djController');
const { verificarToken, verificarAprovacao } = require('../middlewares/auth');
const { uploadAvatar, handleUploadError } = require('../middlewares/upload');

// Rotas públicas
router.get('/', djController.listarTodos);
router.get('/:id', djController.obterPorId);
router.get('/:id/programacoes', djController.listarProgramacoes);

// Rotas protegidas
router.use(verificarToken);
router.use(verificarAprovacao);

// Atualizar perfil com upload de avatar
router.put('/:id',
  uploadAvatar,
  handleUploadError,
  djController.atualizarPerfil
);

// Notificações
router.get('/notificacoes/minhas', djController.listarNotificacoes);
router.put('/notificacoes/:notificacaoId', djController.marcarNotificacaoLida);

module.exports = router; 