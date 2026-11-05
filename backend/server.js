const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexiones a los puertos de tu Docker Compose
const poolMaster = mysql.createPool({ host: '127.0.0.1', port: 3306, user: 'root', password: 'rootpassword', database: 'ecommerce' });
const poolReplica1 = mysql.createPool({ host: '127.0.0.1', port: 3307, user: 'root', password: 'rootpassword', database: 'ecommerce' });
const poolReplica2 = mysql.createPool({ host: '127.0.0.1', port: 3308, user: 'root', password: 'rootpassword', database: 'ecommerce' });

// 1. Endpoint para Insertar (MASTER - 3306)
app.post('/api/master/productos', async (req, res) => {
    try {
        const { nombre, precio } = req.body;
        const [result] = await poolMaster.execute('INSERT INTO productos (nombre, precio) VALUES (?, ?)', [nombre, precio]);
        res.json({ status: 'SUCCESS', message: 'Producto insertado en MASTER', insertId: result.insertId });
    } catch (err) {
        res.status(500).json({ status: 'ERROR', error: err.message });
    }
});

// 2. Endpoint para Consultar en cualquier nodo
app.get('/api/nodo/:puerto/productos', async (req, res) => {
    const pool = req.params.puerto === '3306' ? poolMaster : (req.params.puerto === '3307' ? poolReplica1 : poolReplica2);
    try {
        const [rows] = await pool.query('SELECT * FROM productos ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Endpoint para simular error de escritura en Réplica (read_only)
app.post('/api/replica/:puerto/productos', async (req, res) => {
    const pool = req.params.puerto === '3307' ? poolReplica1 : poolReplica2;
    try {
        const { nombre, precio } = req.body;
        await pool.execute('INSERT INTO productos (nombre, precio) VALUES (?, ?)', [nombre, precio]);
        res.json({ status: 'SUCCESS' });
    } catch (err) {
        // Retorna HTTP 400 con el código de error oficial de MySQL (1290)
        res.status(400).json({ status: 'BLOCKED', code: err.errno, message: err.message });
    }
});

app.listen(3000, () => console.log('🚀 Backend escuchando en http://localhost:3000'));