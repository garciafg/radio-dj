const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadConfig = require('../config/multer');
const { authMiddleware } = require('../middlewares/auth');
const djController = require('../controllers/djController');

const upload = multer(uploadConfig);

router.use(authMiddleware);

router.put('/perfil', djController.atualizarPerfil);
router.post('/foto', upload.single('foto'), djController.uploadFotoPerfil);
router.get('/notificacoes', djController.listarNotificacoes);
router.put('/notificacoes/:id', djController.marcarNotificacaoComoLida);

module.exports = router; 