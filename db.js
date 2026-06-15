const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

//Criando conexão ao banco de dados
const connection = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT
});

// Debug/validação: ajuda a identificar rapidamente problemas de conexão
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    console.error('Variáveis de ambiente do banco incompletas. Verifique DB_HOST/DB_USER/DB_NAME.');
}

if (!process.env.DB_PORT) {
    console.warn('DB_PORT não definido no .env. Usando porta padrão do MySQL (3306).');
}


//Consulta de funcionalidade
connection.connect((err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        return;
    } else {
        console.log("Conexão bem-sucedida ao banco de dados!")
    }
});

module.exports = connection;