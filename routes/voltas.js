const express = require('express');
const router = express.Router();
const db = require('../db');

//Get em voltas (read)
router.get('/get', (req, res) => {
    db.query('SELECT * FROM voltas', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar voltas:', err });
        } else {
            res.json(results);
        }
    });
}); 

//Post em voltas (create)
router.post('/post', (req, res) => {
    const { id, tempo, dt } = req.body;
    db.query('INSERT INTO voltas (id, tempo, dt) VALUES (?, ?, ?)', [id, tempo, dt], (err, results) => {
        if (err) {
            console.error("ERRO:", err);
            res.status(500).json({ error: 'Erro ao inserir informações'});
        } else {
            res.json(results);
        }   
    });
});

router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao deletar volta:', err });
          } else {
            res.status(201).json({ message: 'Volta deletada com sucesso!' });
          }  
    })
})

module.exports = router;