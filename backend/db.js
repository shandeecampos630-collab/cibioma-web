const { Pool } = require('pg');
require('dotenv').config();

// Determinar si estamos en producción (Vercel) o local
const isProduction = process.env.VERCEL === '1' || process.env.DATABASE_URL?.includes('neon.tech');

let poolConfig;

if (isProduction) {
    // Configuración para producción (Vercel + Neon)
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false  // Necesario para Neon
        }
    };
} else {
    // Configuración para desarrollo local
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cibioma_db',
    };
}

const pool = new Pool(poolConfig);

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