const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query(`
    SELECT v.id, v.tempo, v.data, v.pista, v.corredores_id, c.nome AS corredor_nome, c.turma
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
    SELECT v.id, v.tempo, v.data, v.pista, c.nome AS corredor_nome, c.turma
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

    const { pista } = req.body;

    if (!pista || String(pista).trim().length === 0) {
      return res.status(400).json({ error: 'pista e obrigatoria' });
    }

    const sql = dataVolta
      ? 'INSERT INTO voltas (tempo, data, pista, corredores_id) VALUES (?, ?, ?, ?)'
      : 'INSERT INTO voltas (tempo, pista, corredores_id) VALUES (?, ?, ?)';

    const params = dataVolta
      ? [tempo, dataVolta, pista, corredorId]
      : [tempo, pista, corredorId];

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

// Dashboard: todas as voltas por corredor + melhor volta por pista
router.get('/dashboard', (req, res) => {
  const sql = `
    SELECT 
      c.id AS corredor_id,
      c.nome AS corredor_nome,
      c.turma,
      v.id AS volta_id,
      v.tempo,
      v.data,
      v.pista
    FROM corredores c
    LEFT JOIN voltas v ON v.corredores_id = c.id
    ORDER BY c.nome ASC, v.data DESC, v.id DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
    }

    // Melhor volta por corredor
    const porCorredorMap = new Map();
    // Melhor volta global por pista
    const melhorPorPistaMap = new Map();

    for (const r of rows) {
      const corredorKey = r.corredor_id;
      if (!porCorredorMap.has(corredorKey)) {
        porCorredorMap.set(corredorKey, {
          corredor_id: r.corredor_id,
          nome: r.corredor_nome,
          turma: r.turma,
          melhorVolta: null,
          voltas: []
        });
      }

      // Se o LEFT JOIN vier sem volta, v.* fica null
      const hasVolta = r.volta_id !== null && r.volta_id !== undefined;

      if (hasVolta) {
        const volta = {
          volta_id: r.volta_id,
          tempo: r.tempo,
          data: r.data,
          pista: r.pista
        };

        const corredor = porCorredorMap.get(corredorKey);
        corredor.voltas.push(volta);

        if (!corredor.melhorVolta || Number(volta.tempo) < Number(corredor.melhorVolta.tempo)) {
          corredor.melhorVolta = volta;
        }

        // melhor por pista (entre todos os corredores)
        const pistaKey = String(r.pista || '').trim();
        if (pistaKey) {
          const current = melhorPorPistaMap.get(pistaKey);
          if (!current || Number(volta.tempo) < Number(current.tempo)) {
            melhorPorPistaMap.set(pistaKey, {
              pista: pistaKey,
              tempo: volta.tempo,
              corredor_id: corredorKey,
              corredor_nome: r.corredor_nome
            });
          }
        }
      }
    }

    const porCorredor = Array.from(porCorredorMap.values());
    // Ordena voltas com tempo mais recente no backend (já veio por data desc). Mantém.

    const melhorPorPista = Array.from(melhorPorPistaMap.values())
      .sort((a, b) => Number(a.tempo) - Number(b.tempo));

    return res.json({ porCorredor, melhorPorPista });
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
