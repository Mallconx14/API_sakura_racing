const express = require('express');
const app = express();

app.use(express.json());

//Rotas
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

const corredoresRoutes = require('./routes/corredores');
app.use('/corredores', corredoresRoutes);

const voltasRoutes = require('./routes/voltas');
app.use('/voltas', voltasRoutes);

module.exports = app;