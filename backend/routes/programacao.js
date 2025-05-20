const express = require('express');
const router = express.Router();
const programacaoController = require('../controllers/programacaoController');
const { verificarToken, verificarAprovacao } = require('../middlewares/auth');
const { uploadProgramacao, handleUploadError } = require('../middlewares/upload');

// Rotas públicas
router.get('/', programacaoController.listarTodas);
router.get('/:id', programacaoController.obterPorId);
router.get('/:id/eventos', programacaoController.listarEventos);

// Rotas protegidas
router.use(verificarToken);
router.use(verificarAprovacao);

// Criar programação com upload de imagem
router.post('/',
  uploadProgramacao,
  handleUploadError,
  programacaoController.criar
);

// Listar programações do usuário autenticado
router.get('/minhas/lista', programacaoController.listarMinhas);

// Atualizar programação com upload de imagem
router.put('/:id',
  uploadProgramacao,
  handleUploadError,
  programacaoController.atualizar
);

// Alterar status da programação (ao vivo, encerrada, etc)
router.put('/:id/status', programacaoController.alterarStatus);

// Excluir programação
router.delete('/:id', programacaoController.excluir);

module.exports = router; 