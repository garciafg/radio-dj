const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');
const { uploadAvatar, handleUploadError } = require('../middlewares/upload');

// Rota de registro com upload de avatar
router.post('/registro', 
  uploadAvatar,
  handleUploadError,
  authController.registro
);

// Rota de login
router.post('/login', authController.login);

// Rota para recuperar perfil do DJ autenticado
router.get('/perfil', 
  verificarToken,
  authController.perfil
);

module.exports = router; 