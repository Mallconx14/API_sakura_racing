const express = require('express');
const app = express();

app.use(express.json());

//Rotas
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

module.exports = app;