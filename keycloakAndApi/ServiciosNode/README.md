# 🐳 Base de Datos Oracle con Docker - Servicios Node.js

Este proyecto usa **Oracle Database XE** en Docker para persistir los datos de estudiantes con servicios en Node.js.

## 📋 Requisitos

- Docker Desktop instalado y corriendo
- Node.js 16+ y npm
- Al menos 2GB de RAM libre para Oracle

## 🚀 Inicio Rápido

### 1. Instalar dependencias de Node.js

```powershell
npm install
```

### 2. Iniciar Oracle Database con Docker

```powershell
docker-compose up -d
```

**⏱️ IMPORTANTE**: Oracle XE puede tardar **2-3 minutos** en estar completamente listo la primera vez.

Este comando:

- ✅ Descarga la imagen de Oracle XE (primera vez, ~2GB)
- ✅ Crea el contenedor `estudiantes_oracle_db`
- ✅ Crea el usuario `estudiantes_app` automáticamente
- ✅ Crea la base de datos y tabla con el script `init-oracle.sql`
- ✅ Inserta 3 estudiantes de ejemplo
- ✅ Expone los puertos 1521 (Oracle) y 5500 (EM Express)

### 3. Verificar que Oracle está listo

```powershell
docker logs estudiantes_oracle_db
```

Espera hasta ver:

```
DATABASE IS READY TO USE!
```

### 4. Ejecutar los servicios Node.js

```powershell
node ClienteUnivalle.js
```

El servidor estará corriendo en: `http://localhost:3000`

## 🛠️ Comandos Útiles de Docker

### Ver logs de Oracle

```powershell
docker logs -f estudiantes_oracle_db
```

### Verificar salud del contenedor

```powershell
docker ps
```

### Detener Oracle

```powershell
docker-compose down
```

### Detener y eliminar todos los datos

```powershell
docker-compose down -v
```

### Reiniciar Oracle

```powershell
docker-compose restart
```

### Conectarse a Oracle (SQL\*Plus)

```powershell
docker exec -it estudiantes_oracle_db sqlplus estudiantes_app/estudiantes_pass_2024@XEPDB1
```

Comandos útiles dentro de SQL\*Plus:

```sql
-- Ver todas las tablas
SELECT table_name FROM user_tables;

-- Ver datos de estudiantes
SELECT * FROM estudiantes;

-- Salir
EXIT;
```

## 📡 Endpoints de la API

### Autenticación

- `POST /login` - Autenticación con Keycloak

### Gestión de Estudiantes (requieren token)

- `GET /listarEstudiantes` - Listar todos los estudiantes
- `GET /obtenerEstudiante/:codigo` - Obtener estudiante por código
- `POST /crearEstudiante` - Crear nuevo estudiante
- `PUT /actualizarEstudiante/:codigo` - Actualizar estudiante
- `DELETE /eliminarEstudiante/:codigo` - Eliminar estudiante

### Ejemplo de uso:

```bash
# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"tu_usuario","password":"tu_password"}'

# Crear estudiante (con token)
curl -X POST http://localhost:3000/crearEstudiante \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{"codigo":"20231111","nombre":"Juan Pérez","promedio":4.5}'
```

## 🗂️ Estructura de Archivos

```
ServiciosNode/
├── docker-compose.yml          # Configuración de Docker
├── init-oracle.sql             # Script de inicialización de Oracle
├── ClienteUnivalle.js          # API Node.js con Express
├── package.json                # Dependencias de Node.js
└── .env.example                # Variables de entorno (ejemplo)
```

## 🔧 Configuración

### Variables de Entorno

Puedes personalizar la configuración creando un archivo `.env`:

```env
ORACLE_USER=estudiantes_app
ORACLE_PASSWORD=estudiantes_pass_2024
ORACLE_DSN=localhost:1521/XEPDB1
PORT=3000
```

### Cambiar Puerto de Oracle

Si el puerto 1521 está en uso, edita `docker-compose.yml`:

```yaml
ports:
  - "1522:1521" # Usa 1522 en lugar de 1521
```

Y actualiza la variable `ORACLE_DSN`:

```env
ORACLE_DSN=localhost:1522/XEPDB1
```

## 📊 Datos de Ejemplo

El archivo `init-oracle.sql` crea 3 estudiantes de ejemplo:

- Ana Martínez (20201234) - Promedio: 4.2
- Pedro Sánchez (20205678) - Promedio: 4.7
- Laura Torres (20209012) - Promedio: 3.8

## ✅ Verificar Funcionamiento

### 1. Verificar conexión a Oracle

```powershell
docker exec estudiantes_oracle_db sqlplus estudiantes_app/estudiantes_pass_2024@XEPDB1 <<< "SELECT COUNT(*) FROM estudiantes;"
```

### 2. Probar API

```powershell
# En una terminal ejecuta el servidor:
node ClienteUnivalle.js

# En otra terminal (necesitas autenticarte primero):
curl http://localhost:3000/listarEstudiantes -H "Authorization: Bearer TOKEN"
```

## 🔄 Resetear la Base de Datos

Si necesitas empezar de cero:

```powershell
docker-compose down -v
docker-compose up -d
```

Espera 2-3 minutos hasta que Oracle esté completamente iniciado.

## 🐛 Solución de Problemas

### Error: "Connection refused" o "TNS: could not resolve the connect identifier"

1. Verifica que Oracle esté corriendo:

   ```powershell
   docker ps | findstr oracle
   ```

2. Espera a que Oracle termine de iniciar:

   ```powershell
   docker logs estudiantes_oracle_db | findstr "READY"
   ```

3. Verifica la conexión con:
   ```powershell
   docker exec estudiantes_oracle_db sqlplus estudiantes_app/estudiantes_pass_2024@XEPDB1 <<< "SELECT 1 FROM DUAL;"
   ```

### Error: "ORA-12541: TNS:no listener"

Oracle aún no ha terminado de iniciar. Espera unos minutos más.

### Error: "Cannot find module 'oracledb'"

```powershell
npm install
```

### Oracle consume mucha memoria

Oracle XE necesita al menos 2GB de RAM. Si tu sistema tiene limitaciones:

- Cierra otras aplicaciones
- Considera usar PostgreSQL (más ligero) como en ServiciosPython

### El contenedor se reinicia constantemente

Verifica los logs:

```powershell
docker logs estudiantes_oracle_db
```

Posibles causas:

- No hay suficiente memoria (mínimo 2GB)
- No hay suficiente espacio en disco

## 📦 Acceder a Oracle EM Express (Interfaz Web)

Oracle Express incluye una interfaz web en:

```
https://localhost:5500/em
```

Credenciales:

- Usuario: `SYS`
- Contraseña: `OraclePass2024`
- Rol: `SYSDBA`

## 📦 Backup de Datos

### Exportar datos

```powershell
docker exec estudiantes_oracle_db expdp estudiantes_app/estudiantes_pass_2024@XEPDB1 tables=estudiantes directory=DATA_PUMP_DIR dumpfile=estudiantes.dmp
```

### Verificar archivos exportados

```powershell
docker exec estudiantes_oracle_db ls -l /opt/oracle/admin/XE/dpdump/
```

## 🆚 Comparación con PostgreSQL (ServiciosPython)

| Característica | Oracle XE           | PostgreSQL              |
| -------------- | ------------------- | ----------------------- |
| Tamaño imagen  | ~2 GB               | ~80 MB                  |
| RAM mínima     | 2 GB                | 256 MB                  |
| Tiempo inicio  | 2-3 min             | 5-10 seg                |
| Licencia       | Gratis (límites)    | Open Source             |
| Mejor para     | Empresarial, PL/SQL | Desarrollo, menor carga |

## 🎓 Notas Importantes

- Oracle XE tiene limitaciones: 2 CPUs, 2GB RAM, 12GB datos
- El contenedor `gvenzl/oracle-xe` es una imagen comunitaria popular y confiable
- La primera vez que inicies Oracle tardará más (descarga + inicialización)
- Los datos persisten entre reinicios del contenedor (volumen `oracle_data`)
