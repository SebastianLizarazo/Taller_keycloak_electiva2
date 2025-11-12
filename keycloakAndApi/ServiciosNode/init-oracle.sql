-- Script de inicialización para Oracle Database
-- Se ejecuta automáticamente cuando se crea el contenedor

-- El usuario estudiantes_app ya se crea automáticamente por las variables de entorno
-- Solo necesitamos crear la tabla y datos de ejemplo

-- Crear la tabla de estudiantes
CREATE TABLE estudiantes (
    codigo VARCHAR2(20) PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL,
    promedio NUMBER(3,2) CHECK (promedio >= 0 AND promedio <= 5),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos datos de ejemplo
INSERT INTO estudiantes (codigo, nombre, promedio) VALUES ('20201234', 'Ana Martínez', 4.2);
INSERT INTO estudiantes (codigo, nombre, promedio) VALUES ('20205678', 'Pedro Sánchez', 4.7);
INSERT INTO estudiantes (codigo, nombre, promedio) VALUES ('20209012', 'Laura Torres', 3.8);

COMMIT;

-- Crear índice para búsquedas más rápidas
CREATE INDEX idx_estudiantes_nombre ON estudiantes(nombre);

-- Mostrar información
SELECT 'Tabla ESTUDIANTES creada con ' || COUNT(*) || ' registros' AS info FROM estudiantes;
