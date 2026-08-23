const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Probar la conexión
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error al conectar a PostgreSQL:', err.stack);
    } else {
        console.log('✅ Conectado exitosamente a PostgreSQL');
        release();
    }
});

module.exports = pool;