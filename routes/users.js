const express = require('express');
const routes = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

routes.get('/', (req, res) => {
  db.query('SELECT id, nome, email FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar usuarios' });
    }

    res.json(results);
  });
});

routes.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha sao obrigatorios' });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET nao configurado' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer login' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    const user = results[0];
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    delete user.senha;
    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user
    });
  });
});

routes.post('/create', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha sao obrigatorios' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    db.query(
      'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senhaHash],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao criar usuario' });
        }

        res.status(201).json({ id: results.insertId, nome, email });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

routes.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email sao obrigatorios' });
  }

  try {
    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      db.query(
        'UPDATE users SET nome = ?, email = ?, senha = ? WHERE id = ?',
        [nome, email, senhaHash, id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao atualizar usuario' });
          }

          res.status(200).json({ id, nome, email });
        }
      );
      return;
    }

    db.query(
      'UPDATE users SET nome = ?, email = ? WHERE id = ?',
      [nome, email, id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao atualizar usuario' });
        }

        res.status(200).json({ id, nome, email });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

routes.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar usuario' });
    }

    res.status(200).json({ message: 'Usuario deletado com sucesso' });
  });
});

routes.get('/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT id, nome, email FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar usuario' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario nao encontrado' });
    }

    res.status(200).json(results[0]);
  });
});

module.exports = routes;
