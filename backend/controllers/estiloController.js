const EstiloMusical = require('../models/EstiloMusical');
const mongoose = require('mongoose');

module.exports = {
  // Listar todos os estilos musicais
  listarTodos: async (req, res) => {
    try {
      // Por padrão, lista apenas estilos ativos
      const filtros = {};
      if (!req.query.todos) {
        filtros.ativo = true;
      }
      
      const estilos = await EstiloMusical.find(filtros)
        .sort('nome');
      
      res.json(estilos);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao listar estilos musicais.'
      });
    }
  },

  // Obter estilo musical por ID
  obterPorId: async (req, res) => {
    try {
      const estilo = await EstiloMusical.findById(req.params.id);
      
      if (!estilo) {
        return res.status(404).json({
          erro: 'Estilo musical não encontrado.'
        });
      }

      res.json(estilo);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao buscar estilo musical.'
      });
    }
  },

  // Criar novo estilo musical (Admin)
  criar: async (req, res) => {
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

  // Atualizar estilo musical (Admin)
  atualizar: async (req, res) => {
    try {
      const { nome, descricao, corTema, ativo } = req.body;
      
      // Verifica se o nome já existe em outro estilo
      if (nome) {
        const estiloExistente = await EstiloMusical.findOne({ 
          nome, 
          _id: { $ne: req.params.id } 
        });
        
        if (estiloExistente) {
          return res.status(400).json({
            erro: 'Já existe um estilo musical com este nome.'
          });
        }
      }

      const dadosAtualizados = {};
      
      if (nome) dadosAtualizados.nome = nome;
      if (descricao) dadosAtualizados.descricao = descricao;
      if (corTema) dadosAtualizados.corTema = corTema;
      if (ativo !== undefined) dadosAtualizados.ativo = ativo;
      if (req.file) dadosAtualizados.icone = req.file.filename;

      const estilo = await EstiloMusical.findByIdAndUpdate(
        req.params.id,
        dadosAtualizados,
        { new: true, runValidators: true }
      );

      if (!estilo) {
        return res.status(404).json({
          erro: 'Estilo musical não encontrado.'
        });
      }

      res.json(estilo);
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao atualizar estilo musical.'
      });
    }
  },

  // Remover estilo musical (Admin)
  remover: async (req, res) => {
    try {
      const estilo = await EstiloMusical.findById(req.params.id);
      
      if (!estilo) {
        return res.status(404).json({
          erro: 'Estilo musical não encontrado.'
        });
      }

      // Desativa o estilo ao invés de excluí-lo para manter referências
      estilo.ativo = false;
      await estilo.save();

      res.json({
        mensagem: 'Estilo musical desativado com sucesso.'
      });
    } catch (error) {
      res.status(500).json({
        erro: 'Erro ao remover estilo musical.'
      });
    }
  }
}; 