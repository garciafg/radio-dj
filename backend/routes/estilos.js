const express = require('express');
const router = express.Router();
const estiloController = require('../controllers/estiloController');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');
const { uploadEstilo, handleUploadError } = require('../middlewares/upload');

// Rotas públicas
router.get('/', estiloController.listarTodos);
router.get('/:id', estiloController.obterPorId);

// Rotas protegidas (apenas admin)
router.use(verificarToken);
router.use(verificarAdmin);

// Criar estilo musical com upload de ícone
router.post('/',
  uploadEstilo,
  handleUploadError,
  estiloController.criar
);

// Atualizar estilo musical com upload de ícone
router.put('/:id',
  uploadEstilo,
  handleUploadError,
  estiloController.atualizar
);

// Remover estilo musical
router.delete('/:id', estiloController.remover);

module.exports = router; 