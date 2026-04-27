const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

//Get em users (read)
router.get('/get', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar usuários' });
        } else {
            res.json(results);
        }
    });
}); 

//Login em usuários
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
  
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
      try {
      // Buscar usuário pelo email
      db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) {
          res.status(500).json({ error: 'Erro ao fazer login' });
        } else {
          if (results.length === 0) {
            res.status(401).json({ error: 'Credenciais inválidas' });
          } else {
            const user = results[0];
            
            // Comparar senha com hash usando bcrypt
            const senhaValida = await bcrypt.compare(senha, user.senha);
            
            if (senhaValida) {
              // Remove a senha da resposta por segurança
              delete user.senha;
              res.status(200).json({ 
                message: 'Login realizado com sucesso',
                user: user
              });
            } else {
              res.status(401).json({ error: 'Credenciais inválidas' });
            }
          }
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Criar um novo usuário
  router.post('/create', async (req, res) => {
    const { email, senha, nome} = req.body;

    try {
        // Hash da senha usando bcrypt
        const senhaHash = await bcrypt.hash(senha, 10);

        db.query('INSERT INTO usuarios (email, senha, nome) VALUES (?, ?, ?)', [email, senhaHash, nome], (err, results) => {
            if (err) {
                console.error("ERRO:", err);
                res.status(500).json({ error: 'Erro ao criar usuário' });
            } else {
                res.status(201).json({ id: results.insertId, nome, email });
            }
        });
    } catch {
        console.error("Erro ao criar usuário:", err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Erro ao deletar usuário' });
      } else {
        res.status(201).json({ message: 'Usuário deletado com sucesso' });
      }
    });
  });
  

module.exports = router;
