const DJ = require('../models/DJ');
const Programacao = require('../models/Programacao');
const Notificacao = require('../models/Notificacao');
const EstiloMusical = require('../models/EstiloMusical');
const mongoose = require('mongoose');

module.exports = {
  // Dashboard - Estatísticas gerais
  dashboard: async (req, res) => {
    try {
      const [
        totalDJs, 
        djsPendentes, 
        totalProgramacoes, 
        programacoesAoVivo
      ] = await Promise.all([
        DJ.countDocuments({ aprovado: true }),
        DJ.countDocuments({ aprovado: false }),
        Programacao.countDocuments(),
        Programacao.countDocuments({ status: 'ao_vivo' })
      ]);

      res.json({
        estatisticas: {
          totalDJs,
          djsPendentes,
          totalProgramacoes,
          programacoesAoVivo
        }
      });
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao obter estatísticas.'
      });
    }
  },

  // Listar DJs pendentes de aprovação
  listarDjsPendentes: async (req, res) => {
    try {
      const djs = await DJ.find({ aprovado: false })
        .select('-senha')
        .populate('estilosMusicais')
        .sort('-dataCadastro');

      res.json(djs);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao listar DJs pendentes.'
      });
    }
  },

  // Aprovar DJ
  aprovarDj: async (req, res) => {
    try {
      const dj = await DJ.findByIdAndUpdate(
        req.params.id,
        { aprovado: true },
        { new: true }
      ).select('-senha');

      if (!dj) {
        return res.status(404).json({
          erro: 'DJ não encontrado.'
        });
      }

      // Cria notificação para o DJ aprovado
      await Notificacao.create({
        destinatario: dj._id,
        tipo: 'aprovacao_dj',
        titulo: 'Cadastro Aprovado!',
        mensagem: 'Parabéns! Seu cadastro foi aprovado. Agora você pode começar a criar suas programações.'
      });

      res.json({
        mensagem: 'DJ aprovado com sucesso.',
        dj
      });
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao aprovar DJ.'
      });
    }
  },

  // Rejeitar DJ
  rejeitarDj: async (req, res) => {
    try {
      const { motivo } = req.body;

      const dj = await DJ.findById(req.params.id);
      if (!dj) {
        return res.status(404).json({
          erro: 'DJ não encontrado.'
        });
      }

      // Cria notificação antes de excluir
      await Notificacao.create({
        destinatario: dj._id,
        tipo: 'sistema',
        titulo: 'Cadastro Rejeitado',
        mensagem: motivo || 'Seu cadastro não foi aprovado.'
      });

      // Remove o DJ
      await DJ.findByIdAndDelete(req.params.id);

      res.json({
        mensagem: 'DJ rejeitado com sucesso.'
      });
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao rejeitar DJ.'
      });
    }
  },

  // Listar programações pendentes
  listarProgramacoesPendentes: async (req, res) => {
    try {
      const programacoes = await Programacao.find({ status: 'agendado' })
        .populate('dj', 'nome avatar')
        .populate('estiloMusical')
        .sort('dataInicio');

      res.json(programacoes);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao listar programações pendentes.'
      });
    }
  },

  // Enviar notificação para todos os DJs
  enviarNotificacaoGeral: async (req, res) => {
    try {
      const { titulo, mensagem, tipoDestinatario } = req.body;

      if (!titulo || !mensagem) {
        return res.status(400).json({
          erro: 'Título e mensagem são obrigatórios.'
        });
      }

      let filtro = {};
      
      // Filtra os destinatários se especificado
      if (tipoDestinatario === 'aprovados') {
        filtro = { aprovado: true };
      } else if (tipoDestinatario === 'pendentes') {
        filtro = { aprovado: false };
      }

      // Busca todos os DJs pelo filtro
      const djs = await DJ.find(filtro).select('_id');

      // Cria um array de notificações para inserção em massa
      const notificacoes = djs.map(dj => ({
        destinatario: dj._id,
        tipo: 'sistema',
        titulo,
        mensagem
      }));

      await Notificacao.insertMany(notificacoes);

      res.json({
        mensagem: `Notificação enviada para ${djs.length} DJs.`
      });
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao enviar notificação.'
      });
    }
  },

  // Gerenciar status de programação
  gerenciarProgramacao: async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!['agendado', 'cancelado'].includes(status)) {
        return res.status(400).json({
          erro: 'Status inválido.'
        });
      }

      const programacao = await Programacao.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      )
      .populate('dj', 'nome avatar email')
      .populate('estiloMusical');

      if (!programacao) {
        return res.status(404).json({
          erro: 'Programação não encontrada.'
        });
      }

      // Cria notificação para o DJ
      let mensagem;
      if (status === 'agendado') {
        mensagem = `Sua programação "${programacao.titulo}" foi aprovada.`;
      } else {
        mensagem = `Sua programação "${programacao.titulo}" foi cancelada.`;
      }

      await Notificacao.create({
        destinatario: programacao.dj._id,
        tipo: 'nova_programacao',
        titulo: status === 'agendado' ? 'Programação Aprovada' : 'Programação Cancelada',
        mensagem,
        dados: {
          programacaoId: programacao._id
        }
      });

      res.json({
        mensagem: `Programação ${status === 'agendado' ? 'aprovada' : 'cancelada'} com sucesso.`,
        programacao
      });
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao gerenciar programação.'
      });
    }
  },
  
  // Criar estilo musical
  criarEstiloMusical: async (req, res) => {
    try {
      const { nome, descricao, corTema } = req.body;
      
      // Verifica se já existe estilo com o mesmo nome
      const estiloExistente = await EstiloMusical.findOne({ nome });
      if (estiloExistente) {
        return res.status(400).json({
          erro: 'Já existe um estilo musical com este nome.'
        });
      }

      const estilo = await EstiloMusical.create({
        nome,
        descricao,
        corTema,
        icone: req.file ? req.file.filename : undefined
      });

      res.status(201).json(estilo);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao criar estilo musical.'
      });
    }
  },

  // Listar estilos musicais
  listarEstilosMusicais: async (req, res) => {
    try {
      const estilos = await EstiloMusical.find().sort('nome');
      res.json(estilos);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao listar estilos musicais.'
      });
    }
  }
}; 