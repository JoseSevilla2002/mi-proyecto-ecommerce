-- 1. Habilitar GTID (solo si no está activo)
SET GLOBAL ENFORCE_GTID_CONSISTENCY = ON;
SET GLOBAL GTID_MODE = ON;

-- 2. Crear usuario de replicación
CREATE USER IF NOT EXISTS 'repl_user'@'%' IDENTIFIED BY 'PasswordSegura123!';
GRANT REPLICATION SLAVE ON *.* TO 'repl_user'@'%';
FLUSH PRIVILEGES;

-- 3. Crear Base de Datos y Tabla
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

DROP TABLE IF EXISTS productos;
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insertar datos iniciales
INSERT INTO productos (nombre, precio) VALUES ('Laptop Asus Rog', 1500.00);
INSERT INTO productos (nombre, precio) VALUES ('Demo Presentación Final', 199.99);

-- 5. Comprobar
SELECT * FROM productos;

ALTER USER 'repl_user'@'%' IDENTIFIED WITH mysql_native_password BY 'PasswordSegura123!';
FLUSH PRIVILEGES;