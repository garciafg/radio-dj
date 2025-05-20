const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Gera um nome único para o arquivo
    const hash = crypto.randomBytes(8).toString('hex');
    const fileName = `${hash}-${file.originalname}`;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  // Verifica se o arquivo é uma imagem
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'));
  }
};

module.exports = {
  // Upload de avatar do DJ
  uploadAvatar: multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 2 * 1024 * 1024 // 2MB
    }
  }).single('avatar'),

  // Upload de imagem de capa da programação
  uploadProgramacao: multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }).single('imagemCapa'),

  // Upload de ícone do estilo musical
  uploadEstilo: multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 1 * 1024 * 1024 // 1MB
    }
  }).single('icone'),

  // Tratamento de erros do Multer
  handleUploadError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          erro: 'Arquivo muito grande. Tamanho máximo permitido excedido.'
        });
      }
      return res.status(400).json({
        erro: 'Erro no upload do arquivo.'
      });
    }
    
    if (err) {
      return res.status(400).json({
        erro: err.message
      });
    }
    
    next();
  }
}; 