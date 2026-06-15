const express = require('express');
const routes = express.Router();
const db = require('../db');

routes.get('/', (req, res) => {
  db.query('SELECT * FROM corredores ORDER BY id DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar corredores' });
    }

    res.json(results);
  });
});

routes.post('/create', (req, res) => {
  const { unidade, nome, turma } = req.body;

  if (!unidade || !nome || !turma) {
    return res.status(400).json({ error: 'Unidade, nome e turma sao obrigatorios' });
  }

  db.query(
    'INSERT INTO corredores (unidade, nome, turma) VALUES (?, ?, ?)',
    [unidade, nome, turma],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar corredor' });
      }

      res.status(201).json({ id: results.insertId, unidade, nome, turma });
    }
  );
});

routes.put('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { unidade, nome, turma } = req.body;

  if (!unidade || !nome || !turma) {
    return res.status(400).json({ error: 'Unidade, nome e turma sao obrigatorios' });
  }

  db.query(
    'UPDATE corredores SET unidade = ?, nome = ?, turma = ? WHERE id = ?',
    [unidade, nome, turma, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar corredor' });
      }

      res.status(200).json({ id, unidade, nome, turma });
    }
  );
});

routes.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM corredores WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar corredor' });
    }

    res.status(200).json({ message: 'Corredor deletado com sucesso' });
  });
});

routes.get('/ranking/melhores-tempos', (req, res) => {
  db.query(`
    SELECT
      c.id,
      c.unidade,
      c.nome,
      c.turma,
      MIN(v.tempo) AS melhor_tempo,
      COUNT(v.id) AS total_voltas
    FROM corredores c
    LEFT JOIN voltas v ON c.id = v.corredores_id
    GROUP BY c.id, c.unidade, c.nome, c.turma
    ORDER BY melhor_tempo IS NULL, melhor_tempo ASC, c.nome ASC
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar ranking' });
    }

    res.json(results);
  });
});

routes.get('/voltas/recentes', (req, res) => {
  db.query(`
    SELECT v.id, v.tempo, v.data, c.unidade, c.nome AS corredor_nome, c.turma
    FROM voltas v
    JOIN corredores c ON v.corredores_id = c.id
    ORDER BY v.data DESC
    LIMIT 10
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar voltas recentes' });
    }

    res.json(results);
  });
});

routes.get('/:id/voltas', (req, res) => {
  const { id } = req.params;

  db.query(`
    SELECT v.*, c.nome AS corredor_nome
    FROM voltas v
    JOIN corredores c ON v.corredores_id = c.id
    WHERE v.corredores_id = ?
    ORDER BY v.data DESC
  `, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar voltas do corredor' });
    }

    res.json(results);
  });
});

routes.post('/:id/volta', (req, res) => {
  const { id } = req.params;
  const { tempo, data } = req.body;

  if (!tempo) {
    return res.status(400).json({ error: 'Tempo e obrigatorio' });
  }

  db.query('SELECT id FROM corredores WHERE id = ?', [id], (err, corredores) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar corredor' });
    }

    if (corredores.length === 0) {
      return res.status(404).json({ error: 'Corredor nao encontrado' });
    }

    const sql = data
      ? 'INSERT INTO voltas (tempo, data, corredores_id) VALUES (?, ?, ?)'
      : 'INSERT INTO voltas (tempo, corredores_id) VALUES (?, ?)';
    const params = data ? [tempo, data, id] : [tempo, id];

    db.query(sql, params, (insertErr, results) => {
      if (insertErr) {
        return res.status(500).json({ error: 'Erro ao registrar volta' });
      }

      res.status(201).json({
        id: results.insertId,
        tempo,
        corredor_id: Number(id),
        message: 'Volta registrada com sucesso'
      });
    });
  });
});

routes.get('/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM corredores WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar corredor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Corredor nao encontrado' });
    }

    res.status(200).json(results[0]);
  });
});

module.exports = routes;
