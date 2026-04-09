const express = require('express');
const router = express.Router();
const db = require('../db');

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

//Post em usuários (create)
router.post('/post', (req, res) => {
    const { email, senha, nome } = req.body;
    db.query('INSERT INTO users (email, senha, nome) VALUES (?, ?, ?)', [email, senha, nome], (err, results) => {
        if (err) {
            console.error("ERRO:", err);
            res.status(500).json({ error: 'Erro ao inserir informações'});
        } else {
            res.json(results);
        }   
    });
});


module.exports = router;