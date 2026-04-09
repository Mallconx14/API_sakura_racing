const express = require('express');
const router = express.Router();
const db = require('../db');

//Get em corredores (read)
router.get('/get', (req, res) => {
    db.query('SELECT * FROM corredores', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar usuários' });
        } else {
            res.json(results);
        }
    });
}); 

//Post em corredores (create)
router.post('/post', (req, res) => {
    const { nome, email, equipe, senha } = req.body;
    db.query('INSERT INTO corredores (nome, email, equipe, senha) VALUES (?, ?, ?, ?)', [nome, email, equipe, senha], (err, results) => {
        if (err) {
            console.error("ERRO:", err);
            res.status(500).json({ error: 'Erro ao inserir informações'});
        } else {
            res.json(results);
        }   
    });
});

module.exports = router;