-- 1. Desactivar temporalmente la protección de solo lectura
SET GLOBAL super_read_only = OFF;
SET GLOBAL read_only = OFF;

-- 2. Detener hilos de replicación
STOP REPLICA;

-- 3. Configurar la conexión completa incluyendo la clave RSA
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='mysql-master',
  SOURCE_USER='repl_user',
  SOURCE_PASSWORD='PasswordSegura123!',
  SOURCE_AUTO_POSITION=1,
  GET_SOURCE_PUBLIC_KEY=1;

-- 4. Iniciar la replicación
START REPLICA;

-- 5. Reactivar la seguridad de solo lectura
SET GLOBAL read_only = ON;
SET GLOBAL super_read_only = ON;

-- 6. Verificar el estado
SHOW REPLICA STATUS;