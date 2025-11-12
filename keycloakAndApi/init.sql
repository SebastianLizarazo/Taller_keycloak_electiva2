-- Script de inicialización de la base de datos
-- Se ejecuta automáticamente cuando se crea el contenedor

-- Crear la tabla de estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
    codigo VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    promedio DECIMAL(3,2) CHECK (promedio >= 0 AND promedio <= 5),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos datos de ejemplo (opcional)
INSERT INTO estudiantes (codigo, nombre, promedio) VALUES
    ('20201234', 'Juan Pérez', 4.5),
    ('20205678', 'María González', 4.8),
    ('20209012', 'Carlos Rodríguez', 3.9)
ON CONFLICT (codigo) DO NOTHING;

-- Crear índice para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_estudiantes_nombre ON estudiantes(nombre);
