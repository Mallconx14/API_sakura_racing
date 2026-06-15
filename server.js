const app = require('./app');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});