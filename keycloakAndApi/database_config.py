"""
Configuración de la base de datos PostgreSQL
"""
import os

# Configuración de PostgreSQL
POSTGRES_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'estudiantes_db'),
    'user': os.getenv('DB_USER', 'estudiantes_app'),
    'password': os.getenv('DB_PASSWORD', 'estudiantes_pass_2024'),
}

# String de conexión completo


def get_connection_params():
    """Retorna los parámetros de conexión"""
    return POSTGRES_CONFIG
