const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query(`
    SELECT v.id, v.tempo, v.data, v.corredores_id, c.nome AS corredor_nome, c.turma
    FROM voltas v
    JOIN corredores c ON c.id = v.corredores_id
    ORDER BY v.data DESC
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar voltas' });
    }

    res.json(results);
  });
});

router.get('/get', (req, res) => {
  db.query('SELECT * FROM voltas ORDER BY data DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar voltas' });
    }

    res.json(results);
  });
});

router.get('/recentes', (req, res) => {
  db.query(`
    SELECT v.id, v.tempo, v.data, c.nome AS corredor_nome, c.turma
    FROM voltas v
    JOIN corredores c ON c.id = v.corredores_id
    ORDER BY v.data DESC
    LIMIT 10
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar voltas recentes' });
    }

    res.json(results);
  });
});

router.post('/post', (req, res) => {
  const corredorId = req.body.corredor_id || req.body.corredores_id || req.body.id;
  const { tempo, data, dt } = req.body;
  const dataVolta = data || dt || null;

  if (!corredorId || !tempo) {
    return res.status(400).json({ error: 'corredor_id e tempo sao obrigatorios' });
  }

  db.query('SELECT id FROM corredores WHERE id = ?', [corredorId], (err, corredores) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar corredor' });
    }

    if (corredores.length === 0) {
      return res.status(404).json({ error: 'Corredor nao encontrado' });
    }

    const sql = dataVolta
      ? 'INSERT INTO voltas (tempo, data, corredores_id) VALUES (?, ?, ?)'
      : 'INSERT INTO voltas (tempo, corredores_id) VALUES (?, ?)';
    const params = dataVolta
      ? [tempo, dataVolta, corredorId]
      : [tempo, corredorId];

    db.query(sql, params, (insertErr, results) => {
      if (insertErr) {
        return res.status(500).json({ error: 'Erro ao inserir volta' });
      }

      res.status(201).json({
        id: results.insertId,
        tempo,
        data: dataVolta,
        corredor_id: Number(corredorId),
        message: 'Volta registrada com sucesso'
      });
    });
  });
});

router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM voltas WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar volta' });
    }

    res.status(200).json({ message: 'Volta deletada com sucesso' });
  });
});

module.exports = router;
