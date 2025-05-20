const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

// Todas as rotas de admin são protegidas
router.use(verificarToken);
router.use(verificarAdmin);

// Dashboard
router.get('/dashboard', adminController.dashboard);

// Gerenciamento de DJs
router.get('/djs/pendentes', adminController.listarDjsPendentes);
router.put('/djs/:id/aprovar', adminController.aprovarDj);
router.delete('/djs/:id/rejeitar', adminController.rejeitarDj);

// Gerenciamento de programações
router.get('/programacoes/pendentes', adminController.listarProgramacoesPendentes);
router.put('/programacoes/:id/gerenciar', adminController.gerenciarProgramacao);

// Gerenciamento de Estilos Musicais
router.post('/estilos', adminController.criarEstiloMusical);
router.get('/estilos', adminController.listarEstilosMusicais);

// Notificações
router.post('/notificacoes/geral', adminController.enviarNotificacaoGeral);

module.exports = router; 