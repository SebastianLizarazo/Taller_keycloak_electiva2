# 🐳 Base de Datos con Docker - Servicios Python

Este proyecto usa **PostgreSQL** en Docker para persistir los datos de estudiantes.

## 📋 Requisitos

- Docker Desktop instalado y corriendo
- Python 3.10+
- pip

## 🚀 Inicio Rápido

### 1. Instalar dependencias de Python

```powershell
pip install psycopg2-binary flask flask-cors python-keycloak
```

### 2. Iniciar la base de datos con Docker

```powershell
docker-compose up -d
```

Este comando:

- ✅ Descarga la imagen de PostgreSQL (primera vez)
- ✅ Crea el contenedor `estudiantes_db`
- ✅ Crea la base de datos y tabla automáticamente
- ✅ Inserta datos de ejemplo
- ✅ Expone el puerto 5432

### 3. Verificar que la BD está corriendo

```powershell
docker ps
```

Deberías ver algo como:

```
CONTAINER ID   IMAGE                COMMAND                  STATUS         PORTS                    NAMES
abc123def456   postgres:16-alpine   "docker-entrypoint.s…"   Up 2 minutes   0.0.0.0:5432->5432/tcp   estudiantes_db
```

### 4. Ejecutar los servicios

```powershell
python servicios.py
```

## 🛠️ Comandos Útiles de Docker

### Ver logs de la base de datos

```powershell
docker logs estudiantes_db
```

### Detener la base de datos

```powershell
docker-compose down
```

### Detener y eliminar datos

```powershell
docker-compose down -v
```

### Reiniciar la base de datos

```powershell
docker-compose restart
```

### Conectarse a la base de datos (psql)

```powershell
docker exec -it estudiantes_db psql -U estudiantes_app -d estudiantes_db
```

Comandos útiles dentro de psql:

```sql
-- Ver todas las tablas
\dt

-- Ver datos de estudiantes
SELECT * FROM estudiantes;

-- Salir
\q
```

## 🗂️ Estructura de Archivos

```
keycloakAndApi/
├── docker-compose.yml          # Configuración de Docker
├── init.sql                    # Script de inicialización de BD
├── database_config.py          # Configuración de conexión
├── estudiante_repository.py   # Operaciones de BD (CRUD)
├── servicios.py                # API Flask
└── .env.example                # Variables de entorno (ejemplo)
```

## 🔧 Configuración

### Variables de Entorno

Puedes personalizar la configuración creando un archivo `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=estudiantes_db
DB_USER=estudiantes_app
DB_PASSWORD=estudiantes_pass_2024
```

## 📊 Datos de Ejemplo

El archivo `init.sql` crea 3 estudiantes de ejemplo:

- Juan Pérez (20201234) - Promedio: 4.5
- María González (20205678) - Promedio: 4.8
- Carlos Rodríguez (20209012) - Promedio: 3.9

## ✅ Verificar Funcionamiento

1. **Comprobar conexión a BD:**

```powershell
python -c "from estudiante_repository import EstudianteRepository; db = EstudianteRepository(); print('✅ Conexión exitosa'); db.cerrar_conexion()"
```

2. **Probar API:**

```powershell
# En una terminal ejecuta:
python servicios.py

# En otra terminal:
curl http://localhost:5000/listaEstudiantes
```

## 🔄 Resetear la Base de Datos

Si necesitas empezar de cero:

```powershell
docker-compose down -v
docker-compose up -d
```

Esto elimina todos los datos y vuelve a crear la BD con los datos de ejemplo.

## 🐛 Solución de Problemas

### Error: "Connection refused"

- Verifica que Docker esté corriendo: `docker ps`
- Reinicia el contenedor: `docker-compose restart`

### Error: "No module named 'psycopg2'"

```powershell
pip install psycopg2-binary
```

### El puerto 5432 ya está en uso

Si tienes PostgreSQL instalado localmente, cambia el puerto en `docker-compose.yml`:

```yaml
ports:
  - "5433:5432" # Usa 5433 en lugar de 5432
```

Y actualiza `database_config.py`:

```python
'port': os.getenv('DB_PORT', '5433'),
```

## 📦 Backup de Datos

### Exportar datos

```powershell
docker exec estudiantes_db pg_dump -U estudiantes_app estudiantes_db > backup.sql
```

### Importar datos

```powershell
docker exec -i estudiantes_db psql -U estudiantes_app -d estudiantes_db < backup.sql
```
