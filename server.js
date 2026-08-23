const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');  // <--- NUEVO: Para manejar rutas de archivos
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos en Neon
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false  // Necesario para Neon
    }
});

// Probar conexión
pool.connect((err) => {
    if (err) {
        console.error('❌ Error al conectar a Neon:', err.stack);
    } else {
        console.log('✅ Conectado exitosamente a Neon (PostgreSQL)');
    }
});

// ========== RUTAS PÚBLICAS ==========

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: '¡Servidor CIBIOMA funcionando! 🚀' });
});

// Obtener todas las especies
app.get('/api/especies', async (req, res) => {
    try {
        const { categoria } = req.query;
        let query = `
            SELECT e.*, c.nombre as categoria_nombre, c.icono 
            FROM especies e
            LEFT JOIN categorias c ON e.categoria_id = c.id
        `;
        const params = [];
        
        if (categoria) {
            query += ` WHERE c.nombre = $1`;
            params.push(categoria);
        }
        
        query += ` ORDER BY e.destacado DESC, e.nombre_comun`;
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error en /api/especies:', error);
        res.status(500).json({ error: 'Error al obtener especies' });
    }
});

// Obtener una especie por ID
app.get('/api/especies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT e.*, c.nombre as categoria_nombre, c.icono 
            FROM especies e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            WHERE e.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Especie no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error en /api/especies/:id:', error);
        res.status(500).json({ error: 'Error al obtener la especie' });
    }
});

// Buscar especies por nombre
app.get('/api/buscar', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json([]);
        }
        const result = await pool.query(`
            SELECT e.*, c.nombre as categoria_nombre, c.icono 
            FROM especies e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            WHERE e.nombre_comun ILIKE $1 OR e.nombre_cientifico ILIKE $1
            ORDER BY e.nombre_comun
        `, [`%${q}%`]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error en /api/buscar:', error);
        res.status(500).json({ error: 'Error en la búsqueda' });
    }
});

// Obtener todas las categorías
app.get('/api/categorias', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias ORDER BY nombre');
        res.json(result.rows);
    } catch (error) {
        console.error('Error en /api/categorias:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

// ========== RUTAS DE ADMINISTRACIÓN (CRUD) ==========

// Crear nueva especie
app.post('/api/admin/especies', async (req, res) => {
    try {
        const { 
            nombre_comun, 
            nombre_cientifico, 
            habitat, 
            alimentacion, 
            dato_curioso, 
            imagen_url, 
            categoria_id, 
            destacado 
        } = req.body;
        
        const result = await pool.query(`
            INSERT INTO especies (
                nombre_comun, 
                nombre_cientifico, 
                habitat, 
                alimentacion, 
                dato_curioso, 
                imagen_url, 
                categoria_id, 
                destacado
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [nombre_comun, nombre_cientifico, habitat, alimentacion, dato_curioso, imagen_url, categoria_id, destacado || false]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error en POST /api/admin/especies:', error);
        res.status(500).json({ error: 'Error al crear especie' });
    }
});

// Actualizar especie
app.put('/api/admin/especies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nombre_comun, 
            nombre_cientifico, 
            habitat, 
            alimentacion, 
            dato_curioso, 
            imagen_url, 
            categoria_id, 
            destacado 
        } = req.body;
        
        const result = await pool.query(`
            UPDATE especies 
            SET 
                nombre_comun = $1, 
                nombre_cientifico = $2, 
                habitat = $3, 
                alimentacion = $4, 
                dato_curioso = $5, 
                imagen_url = $6, 
                categoria_id = $7, 
                destacado = $8
            WHERE id = $9
            RETURNING *
        `, [nombre_comun, nombre_cientifico, habitat, alimentacion, dato_curioso, imagen_url, categoria_id, destacado, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Especie no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error en PUT /api/admin/especies/:id:', error);
        res.status(500).json({ error: 'Error al actualizar especie' });
    }
});

// Eliminar especie
app.delete('/api/admin/especies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM especies WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Especie no encontrada' });
        }
        res.json({ message: 'Especie eliminada correctamente' });
    } catch (error) {
        console.error('Error en DELETE /api/admin/especies/:id:', error);
        res.status(500).json({ error: 'Error al eliminar especie' });
    }
});

// ========== SERVIR FRONTEND (PARA PRODUCCIÓN) ==========
// Esto solo se activa en Vercel (producción)
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    const frontendPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(frontendPath));
    
    // Para cualquier ruta que no sea /api, servir index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});