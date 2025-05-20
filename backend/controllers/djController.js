const DJ = require('../models/DJ');
const Programacao = require('../models/Programacao');
const Notificacao = require('../models/Notificacao');
const mongoose = require('mongoose');
const multer = require('multer');
const uploadConfig = require('../config/multer');

const upload = multer(uploadConfig);

module.exports = {
  // Obter todos os DJs
  listarTodos: async (req, res) => {
    try {
      const djs = await DJ.find({ aprovado: true })
        .select('-senha')
        .populate('estilosMusicais');
      
      res.json(djs);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao listar DJs.'
      });
    }
  },

  // Obter DJ por ID
  obterPorId: async (req, res) => {
    try {
      const dj = await DJ.findById(req.params.id)
        .select('-senha')
        .populate('estilosMusicais');
      
      if (!dj) {
        return res.status(404).json({
          erro: 'DJ não encontrado.'
        });
      }

      res.json(dj);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao buscar DJ.'
      });
    }
  },

  // Atualizar perfil do DJ
  atualizarPerfil: async (req, res) => {
    try {
      const { nome, biografia, redesSociais, estilosMusicais } = req.body;
      
      // Verifica se o DJ é o dono do perfil
      if (req.dj._id.toString() !== req.params.id) {
        return res.status(403).json({
          erro: 'Você não tem permissão para atualizar este perfil.'
        });
      }

      const dadosAtualizados = {
        nome,
        biografia,
        redesSociais
      };

      if (estilosMusicais && Array.isArray(estilosMusicais)) {
        dadosAtualizados.estilosMusicais = estilosMusicais;
      }

      if (req.file) {
        dadosAtualizados.avatar = req.file.filename;
      }

      const dj = await DJ.findByIdAndUpdate(
        req.params.id,
        dadosAtualizados,
        { new: true, runValidators: true }
      ).select('-senha');

      res.json(dj);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao atualizar perfil.'
      });
    }
  },

  // Listar programações de um DJ
  listarProgramacoes: async (req, res) => {
    try {
      const programacoes = await Programacao.find({ dj: req.params.id })
        .populate('estiloMusical');
      
      res.json(programacoes);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao listar programações.'
      });
    }
  },

  // Listar notificações do DJ autenticado
  listarNotificacoes: async (req, res) => {
    try {
      const notificacoes = await Notificacao.find({
        destinatario: req.dj._id
      }).sort('-dataCriacao');
      
      res.json(notificacoes);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao listar notificações.'
      });
    }
  },

  // Marcar notificação como lida
  marcarNotificacaoLida: async (req, res) => {
    try {
      const notificacao = await Notificacao.findOneAndUpdate(
        { 
          _id: req.params.notificacaoId,
          destinatario: req.dj._id
        },
        { lida: true },
        { new: true }
      );
      
      if (!notificacao) {
        return res.status(404).json({
          erro: 'Notificação não encontrada.'
        });
      }
      
      res.json(notificacao);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao atualizar notificação.'
      });
    }
  }
}; 