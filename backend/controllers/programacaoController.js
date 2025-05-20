const Programacao = require('../models/Programacao');
const Evento = require('../models/Evento');
const Notificacao = require('../models/Notificacao');
const mongoose = require('mongoose');
const multer = require('multer');
const uploadConfig = require('../config/multer');

const upload = multer(uploadConfig);

module.exports = {
  // Criar uma nova programação
  criar: async (req, res) => {
    try {
      const { titulo, descricao, estiloMusical, dataInicio, duracao, recorrencia } = req.body;
      
      const programacao = await Programacao.create({
        dj: req.dj._id,
        titulo,
        descricao,
        estiloMusical,
        dataInicio,
        duracao,
        recorrencia,
        imagemCapa: req.file ? req.file.filename : undefined
      });

      await programacao.populate('estiloMusical');

      res.status(201).json(programacao);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao criar programação.'
      });
    }
  },

  // Listar todas as programações
  listarTodas: async (req, res) => {
    try {
      // Filtros opcionais
      const filtros = {};
      
      if (req.query.status) {
        filtros.status = req.query.status;
      }
      
      if (req.query.estilo) {
        filtros.estiloMusical = req.query.estilo;
      }
      
      const programacoes = await Programacao.find(filtros)
        .populate('dj', 'nome avatar')
        .populate('estiloMusical')
        .sort({ dataInicio: 1 });
      
      res.json(programacoes);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao listar programações.'
      });
    }
  },

  // Obter programação por ID
  obterPorId: async (req, res) => {
    try {
      const programacao = await Programacao.findById(req.params.id)
        .populate('dj', 'nome avatar')
        .populate('estiloMusical');
      
      if (!programacao) {
        return res.status(404).json({
          erro: 'Programação não encontrada.'
        });
      }
      
      res.json(programacao);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao buscar programação.'
      });
    }
  },

  // Listar programações do DJ autenticado
  listarMinhas: async (req, res) => {
    try {
      const programacoes = await Programacao.find({ dj: req.dj._id })
        .populate('estiloMusical')
        .sort({ dataInicio: 1 });
      
      res.json(programacoes);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao listar programações.'
      });
    }
  },

  // Atualizar programação
  atualizar: async (req, res) => {
    try {
      const { titulo, descricao, estiloMusical, dataInicio, duracao, recorrencia } = req.body;
      
      // Verifica se a programação existe e pertence ao DJ autenticado
      const programacao = await Programacao.findOne({
        _id: req.params.id,
        dj: req.dj._id
      });
      
      if (!programacao) {
        return res.status(404).json({
          erro: 'Programação não encontrada ou você não tem permissão para editá-la.'
        });
      }

      // Atualiza os campos
      programacao.titulo = titulo || programacao.titulo;
      programacao.descricao = descricao || programacao.descricao;
      programacao.estiloMusical = estiloMusical || programacao.estiloMusical;
      programacao.dataInicio = dataInicio || programacao.dataInicio;
      programacao.duracao = duracao || programacao.duracao;
      
      if (recorrencia) {
        programacao.recorrencia = recorrencia;
      }
      
      if (req.file) {
        programacao.imagemCapa = req.file.filename;
      }

      await programacao.save();
      await programacao.populate('estiloMusical');
      
      res.json(programacao);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao atualizar programação.'
      });
    }
  },

  // Iniciar/parar transmissão ao vivo
  alterarStatus: async (req, res) => {
    try {
      const { status } = req.body;
      
      // Verifica se o status é válido
      if (!['agendado', 'ao_vivo', 'finalizado', 'cancelado'].includes(status)) {
        return res.status(400).json({
          erro: 'Status inválido.'
        });
      }
      
      // Verifica se a programação existe e pertence ao DJ autenticado
      const programacao = await Programacao.findOne({
        _id: req.params.id,
        dj: req.dj._id
      });
      
      if (!programacao) {
        return res.status(404).json({
          erro: 'Programação não encontrada ou você não tem permissão para editá-la.'
        });
      }

      // Se estiver iniciando uma transmissão ao vivo
      if (status === 'ao_vivo' && programacao.status !== 'ao_vivo') {
        // Finaliza outras transmissões ao vivo do mesmo DJ
        await Programacao.updateMany(
          { dj: req.dj._id, status: 'ao_vivo' },
          { status: 'finalizado' }
        );
      }

      programacao.status = status;
      await programacao.save();
      
      // Emite evento via Socket.IO
      req.io.emit('status_programacao', {
        programacaoId: programacao._id,
        status,
        dj: {
          id: req.dj._id,
          nome: req.dj.nome,
          avatar: req.dj.avatar
        }
      });
      
      res.json(programacao);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao alterar status da programação.'
      });
    }
  },

  // Excluir programação
  excluir: async (req, res) => {
    try {
      // Verifica se a programação existe e pertence ao DJ autenticado
      const programacao = await Programacao.findOne({
        _id: req.params.id,
        dj: req.dj._id
      });
      
      if (!programacao) {
        return res.status(404).json({
          erro: 'Programação não encontrada ou você não tem permissão para excluí-la.'
        });
      }

      // Não permite excluir programações ao vivo
      if (programacao.status === 'ao_vivo') {
        return res.status(400).json({
          erro: 'Não é possível excluir uma programação que está ao vivo.'
        });
      }

      await Programacao.deleteOne({ _id: programacao._id });
      
      res.json({
        mensagem: 'Programação excluída com sucesso.'
      });
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao excluir programação.'
      });
    }
  },

  // Obter eventos da programação
  listarEventos: async (req, res) => {
    try {
      // Paginação
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 20;
      const skip = (pagina - 1) * limite;
      
      const eventos = await Evento.find({
        programacao: req.params.id
      })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limite);
      
      const total = await Evento.countDocuments({
        programacao: req.params.id
      });
      
      res.json({
        eventos,
        paginacao: {
          total,
          pagina,
          limite,
          paginas: Math.ceil(total / limite)
        }
      });
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao listar eventos.'
      });
    }
  }
}; 