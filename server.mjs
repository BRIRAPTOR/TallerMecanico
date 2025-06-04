import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
dotenv.config();

// Obtener las variables de entorno
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

// Configuración de la conexión a la base de datos
const db = mysql.createPool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
});

// Función para manejar errores globalmente
const enviarError = (res, mensaje, statusCode = 400) => {
    res.status(statusCode).json({ error: mensaje });
};

// Middleware para verificar el JWT
const verifyToken = (req, res, next) => {
    const token = req.cookies.token; // Token de cookie o encabezado

    if (!token) {
        return enviarError(res, 'Token no proporcionado.', 401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return enviarError(res, 'Token no válido.', 403);
        }
        req.user = decoded;  // Se adjunta el usuario decodificado en la solicitud
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    if (req.user.rol !== 'administrador') {
        return enviarError(res, 'Acceso no permitido.', 403);
    }
    next();
};


// Rutas de autenticación (excluyendo login y registro)
app.post('/login', async (req, res) => {
    const { nombre_usuario, contrasena } = req.body;

    try {
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE nombre_usuario = ?', [nombre_usuario]);
        const usuario = usuarios[0];

        if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
            return enviarError(res, 'Usuario o contraseña incorrectos.', 401);
        }

        const token = jwt.sign({
            id: usuario.id,
            nombre: usuario.nombre_usuario,
            rol: usuario.rol,
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60,  // 1 hora
        }).status(200).send('Inicio de sesión exitoso.');
    } catch (error) {
        console.error('Error al realizar el inicio de sesión:', error);
        return enviarError(res, 'Error interno del servidor.', 500);
    }
});

// Log out (Eliminación del token del cliente)
app.post('/logout', verifyToken, (req, res) => {
    res.clearCookie('token').json({ message: 'Logout successful.' }).status(200);
});

// Rutas públicas (registro)
app.post('/registro', async (req, res) => {
    const { nombre_usuario, correo, contrasena } = req.body;

    if (!nombre_usuario || !correo || !contrasena) {
        return enviarError(res, 'Todos los campos son obligatorios.', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        return enviarError(res, 'El formato del correo no es válido.', 400);
    }

    if (contrasena.length < 6) {
        return enviarError(res, 'La contraseña debe tener al menos 6 caracteres.', 400);
    }

    try {
        const [usuariosExistentes] = await db.query('SELECT * FROM usuarios WHERE correo = ? OR nombre_usuario = ?', [correo, nombre_usuario]);
        if (usuariosExistentes.length > 0) {
            return enviarError(res, 'El nombre de usuario o correo ya está registrado.', 400);
        }

        const hash = await bcrypt.hash(contrasena, 10);
        const [result] = await db.query('INSERT INTO usuarios (nombre_usuario, correo, contrasena) VALUES (?, ?, ?)', [nombre_usuario, correo, hash]);

        res.status(201).json({
            message: 'Usuario registrado correctamente.',
            usuario: { id: result.insertId, nombre_usuario, correo }
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return enviarError(res, 'Error interno del servidor.', 500);
    }
});

// Rutas protegidas (productos, carrito, etc.)
app.post('/productos', verifyToken, verifyAdmin, async (req, res) => {
    const { nombre, descripcion, precio, stock, imagen } = req.body;

    const query = 'INSERT INTO productos (nombre, descripcion, precio, stock, imagen) VALUES (?, ?, ?, ?, ?)';
    try {
        const [result] = await db.query(query, [nombre, descripcion, precio, stock, imagen]);
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Error al crear el producto:', error);
        return enviarError(res, 'Error al crear el producto.', 500);
    }
});

// Leer Productos
app.get('/productos', async (req, res) => {
    try {
        const [productos] = await db.query('SELECT * FROM productos');
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return enviarError(res, 'Error al obtener productos.', 500);
    }
});

// Obtener productos del carrito del usuario
app.get('/productoscarrito', verifyToken, async (req, res) => {
    const user_id = req.user.id;  // El ID de usuario está en el JWT

    try {
        const [productos] = await db.query(
            'SELECT c.usuario_id, c.producto_id, c.cantidad, p.nombre, p.descripcion, p.precio, p.imagen ' +
            'FROM carrito AS c ' +
            'JOIN productos AS p ON c.producto_id = p.id ' +
            'WHERE c.usuario_id = ?',
            [user_id]
        );
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos del carrito:', error);
        return enviarError(res, 'Error al obtener productos del carrito.', 500);
    }
});

// Actualizar Producto
app.put('/productos/:id', verifyToken, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, imagen } = req.body;

    const query = 'UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, imagen=? WHERE id=?';
    const [result] = await db.query(query, [nombre, descripcion, precio, stock, imagen, id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.send('Producto actualizado');
});

app.delete('/productos/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.send('Producto eliminado');
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


app.delete('/productocarrito/:prod_id', verifyToken, async (req, res) => {
    try {
        const user_id = req.user.id;
        const { prod_id } = req.params;

        const [result] = await db.query('DELETE FROM carrito WHERE producto_id = ? AND usuario_id = ?', [prod_id, user_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

        res.send('Producto eliminado del carrito');
    } catch (error) {
        console.error('Error al eliminar el producto del carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Generar ticket de compra
app.get('/ticket/:numero_venta', verifyToken, async (req, res) => {
    const { numero_venta } = req.params;

    try {
        // Obtener información básica de la compra
        const [compra] = await db.query(`
            SELECT hc.usuario_id, hc.total, hc.fecha, u.nombre_usuario
            FROM historial_compras AS hc
            JOIN usuarios AS u ON hc.usuario_id = u.id
            WHERE hc.id = ? AND hc.usuario_id = ?
        `, [numero_venta, req.user.id]);

        if (!compra.length) {
            return enviarError(res, 'Compra no encontrada o no pertenece al usuario.', 404);
        }

        const { total, fecha } = compra[0];

        // Obtener el detalle de la compra
        const [detalle] = await db.query(`
            SELECT dc.producto_id, dc.cantidad, dc.precio_unitario, p.nombre
            FROM detalle_compras AS dc
            JOIN productos AS p ON dc.producto_id = p.id
            WHERE dc.historial_id = ?
        `, [numero_venta]);

        if (!detalle.length) {
            return enviarError(res, 'No se encontraron productos para esta compra.', 404);
        }

        // Construir el ticket
        const ticket = {
            nombre_negocio: "Taller mecánico 1",
            fecha,
            numero_venta,
            productos: detalle.map(item => ({
                producto: item.nombre,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal: item.cantidad * item.precio_unitario,
            })),
            total,
        };

        res.json(ticket);
    } catch (error) {
        console.error('Error al generar el ticket:', error);
        return enviarError(res, 'Error al generar el ticket.', 500);
    }
});

app.get('/historial-compras', verifyToken, async (req, res) => {
    const usuario_id = req.user.id;

    try {
        const [historial] = await db.query(`
            SELECT hc.id, hc.total, hc.fecha, 
                   GROUP_CONCAT(CONCAT(dc.cantidad, 'x ', p.nombre) SEPARATOR ', ') AS detalle
            FROM historial_compras hc
            JOIN detalle_compras dc ON hc.id = dc.historial_id
            JOIN productos p ON dc.producto_id = p.id
            WHERE hc.usuario_id = ?
            GROUP BY hc.id
            ORDER BY hc.fecha DESC
        `, [usuario_id]);

        if (!historial.length) {
            return enviarError(res, 'No se encontraron compras.', 404);
        }

        res.json(historial);
    } catch (error) {
        console.error('Error al obtener el historial:', error);
        return enviarError(res, 'Error al obtener el historial.', 500);
    }
});

app.get('/admin/historial-compras', verifyToken, verifyAdmin, async (req, res) => {
    const { usuario_id, fecha_inicio, fecha_fin } = req.query;

    let query = `
        SELECT hc.id, hc.total, hc.fecha, u.nombre_usuario,
               GROUP_CONCAT(CONCAT(dc.cantidad, 'x ', p.nombre) SEPARATOR ', ') AS detalle
        FROM historial_compras hc
        JOIN usuarios u ON hc.usuario_id = u.id
        JOIN detalle_compras dc ON hc.id = dc.historial_id
        JOIN productos p ON dc.producto_id = p.id
    `;
    const params = [];

    if (usuario_id || fecha_inicio || fecha_fin) {
        query += 'WHERE ';
        if (usuario_id) {
            query += 'hc.usuario_id = ? ';
            params.push(usuario_id);
        }
        if (fecha_inicio) {
            query += (params.length ? 'AND ' : '') + 'hc.fecha >= ? ';
            params.push(fecha_inicio);
        }
        if (fecha_fin) {
            query += (params.length ? 'AND ' : '') + 'hc.fecha <= ? ';
            params.push(fecha_fin);
        }
    }

    query += 'GROUP BY hc.id ORDER BY hc.fecha DESC';

    try {
        const [historial] = await db.query(query, params);

        if (!historial.length) {
            return enviarError(res, 'No se encontraron compras.', 404);
        }

        res.json(historial);
    } catch (error) {
        console.error('Error al obtener el historial como administrador:', error);
        return enviarError(res, 'Error al obtener el historial.', 500);
    }
});


// Agregar producto al carrito
app.post('/carrito', verifyToken, async (req, res) => {
    const { producto_id, cantidad } = req.body;
    const usuario_id = req.user.id;  // Tomar el ID del usuario desde el token

    try {
        const [productos] = await db.query('SELECT * FROM productos WHERE id = ?', [producto_id]);
        const producto = productos[0];

        if (!producto || producto.stock < cantidad) {
            return enviarError(res, 'Stock insuficiente o producto no encontrado.', 400);
        }

        await db.query('INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)', [usuario_id, producto_id, cantidad]);
        res.status(200).send('Producto añadido al carrito.');
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        return enviarError(res, 'Error al agregar producto al carrito.', 500);
    }
});
app.post('/agregar-fondos', verifyToken, async (req, res) => {
    let { monto } = req.body;
    const usuario_id = req.user.id;


    // Asegurarse de que el monto es un número válido
    monto = parseFloat(monto);  // Convierte el monto a número flotante

    if (isNaN(monto) || monto <= 0) {
        return enviarError(res, 'El monto debe ser un número positivo mayor que cero.', 400);
    }

    // Verificar que el monto no supere el límite
    if (monto > 999999999999) {
        return enviarError(res, 'El monto no puede superar los 999,999,999,999 pesos.', 400);
    }

    try {
        const [usuario] = await db.query('SELECT fondos FROM usuarios WHERE id = ?', [usuario_id]);
        if (!usuario.length) {
            return enviarError(res, 'Usuario no encontrado.', 404);
        }

        // Actualizar fondos
        const nuevosFondos = parseFloat(usuario[0].fondos) + monto;

        if (monto > 0) {
        await db.query('UPDATE usuarios SET fondos = ? WHERE id = ?', [nuevosFondos, usuario_id]);
        res.status(200).json({ message: 'Fondos agregados correctamente.' });
        } else {
            return enviarError(res, 'No se puede agregar más fondos si el saldo es 0.', 400);
        }

    } catch (error) {
        console.error('Error al agregar fondos:', error);
        return enviarError(res, 'Error al agregar fondos.', 500);
    }
});


// Procesar compra
app.post('/comprar',verifyToken, async (req, res) => {
    const usuario_id = req.user.id;  // Tomar el ID del usuario desde el token

    try {
        const [usuarios] = await db.query('SELECT fondos FROM usuarios WHERE id = ?', [usuario_id]);
        const fondosUsuario = usuarios[0];

        const [carrito] = await db.query(`SELECT c.*, p.precio FROM carrito c JOIN productos p ON c.producto_id = p.id WHERE c.usuario_id = ?`, [usuario_id]);

        if (!carrito.length) return enviarError(res, 'El carrito está vacío.', 400);

        const total = carrito.reduce((sum, item) => sum + item.cantidad * item.precio, 0);

        if (fondosUsuario.fondos < total) {
            return enviarError(res, 'Fondos insuficientes.', 400);
        }

        await db.query('UPDATE usuarios SET fondos = fondos - ? WHERE id = ?', [total, usuario_id]);

        const [compra] = await db.query('INSERT INTO historial_compras (usuario_id, total) VALUES (?, ?)', [usuario_id, total]);

        for (const item of carrito) {
            await db.query(
                'INSERT INTO detalle_compras (historial_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)', 
                [compra.insertId, item.producto_id, item.cantidad, item.precio]
            );
            await db.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [item.cantidad, item.producto_id]);
        }

        await db.query('DELETE FROM carrito WHERE usuario_id = ?', [usuario_id]);
        res.status(200).send('Compra procesada exitosamente.');
    } catch (error) {
        console.error('Error al procesar la compra:', error);
        return enviarError(res, 'Error al procesar la compra.', 500);
    }
});

// ——— Rutas Usuarios ———
app.get('/api/mecanicos', async (req, res) => {
    let sql = 'SELECT id, nombre_usuario, rol FROM usuarios where rol = "mecanico"';
    try {
        const [rows] = await db.query(sql);
        return res.json(rows);
    } catch (err) {
        return enviarError(res, err.message, 500);
    }
});
app.get('/api/clientes', async (req, res) => {
    let sql = 'SELECT id, nombre_usuario, rol FROM usuarios where rol = "cliente"';
    try {
        const [rows] = await db.query(sql);
        return res.json(rows);
    } catch (err) {
        return enviarError(res, err.message, 500);
    }
});
app.post('/api/citas', (req, res) => {
    const { usuario_id, mecanico_id, fecha, hora, nota } = req.body;

    if (!usuario_id || !mecanico_id || !fecha || !hora) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    const sql = `INSERT INTO citas (usuario_id, mecanico_id, fecha, hora, nota)
                 VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [usuario_id, mecanico_id, fecha, hora, nota]);

       return  res.status(201).json({
            mensaje: 'Cita guardada correctamente',
        });

});

app.get('/api/citas', async (req, res) => {
   let sql  = "SELECT * FROM citas";
   try {
        const [rows] = await db.query(sql);
        return res.status(200).json(rows);
    } catch (err) {
        return enviarError(res, err.message, 500);
    }
});

app.get('/api/user/:id', async (req, res) => {
    const id = req.params.id;
    const sql = "SELECT nombre_usuario FROM usuarios WHERE id = ?";

    try {
        const [rows] = await db.query(sql, [id]); // ¡Aquí se pasa el parámetro!
        return res.status(200).json(rows);
    } catch (err) {
        return enviarError(res, err.message, 500);
    }
});


// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
});
