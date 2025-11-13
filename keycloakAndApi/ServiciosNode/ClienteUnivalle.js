const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const { Issuer } = require('openid-client');

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json()); 

const dbConfig = {
  user: process.env.ORACLE_USER || "estudiantes_app",
  password: process.env.ORACLE_PASSWORD || "estudiantes_pass_2024",
  connectString: process.env.ORACLE_DSN || "localhost:1522/XEPDB1",  // Puerto 1522
  // Configuraciones adicionales para mejorar la estabilidad
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60,
  connectTimeout: 60,
  // Reconexión automática
  retryCount: 3,
  retryDelay: 1000
};

const keycloakConfig = {
  serverUrl: "http://localhost:8082/",
  clientId: "02",
  clientSecret: "R3pDC7dJAQdR01oNo8Wk2d7dUp8mUu5O",
  realm: "arquitectura"
};

let keycloakClient; 
let oraclePool;

// Inicializar pool de conexiones Oracle
async function initOraclePool() {
  try {
    oraclePool = await oracledb.createPool(dbConfig);
    console.log('Pool de conexiones Oracle inicializado correctamente');
  } catch (err) {
    console.error('Error al inicializar pool de Oracle:', err);
    // Reintentar después de 5 segundos
    setTimeout(initOraclePool, 5000);
  }
}

async function initKeycloak() { 
  try { 
    const keycloakIssuer = await 
Issuer.discover(`${keycloakConfig.serverUrl}realms/${keycloakConfig.realm}`)
 ; 
    keycloakClient = new keycloakIssuer.Client({ 
      client_id: keycloakConfig.clientId, 
      client_secret: keycloakConfig.clientSecret, 
      redirect_uris: ['http://localhost:3000/auth/callback'], 
      response_types: ['code'] 
    }); 
    console.log('Keycloak OIDC inicializado correctamente'); 
  } catch (err) { 
    console.error('Error al inicializar Keycloak:', err); 
  } 
} 
initKeycloak(); 
initOraclePool();
 
function tokenRequired(rolRequerido) { 
  return async (req, res, next) => { 
    if (!keycloakClient) { 
      return res.status(503).json({ error: 'Servicio de autenticación no disponible' }); 
    } 
 
    const authHeader = req.headers.authorization; 
    if (!authHeader || !authHeader.startsWith('Bearer ')) { 
      return res.status(401).json({ error: 'Token requerido' }); 
    } 
 
    const token = authHeader.split(' ')[1]; 
 
    try { 
      const userInfo = await keycloakClient.userinfo(token); 
      console.log(userInfo); 
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()); 
 
      const realmRoles = decoded?.realm_access?.roles || []; 
      const clientRoles = decoded?.resource_access?.[keycloakConfig.clientId]?.roles || []; 
      console.log("aca resource access"); 
      console.log(decoded?.resource_access); 
      const todosLosRoles = [...realmRoles, ...clientRoles]; 
 
      console.log("Roles del usuario:", todosLosRoles); 
 
      if (!todosLosRoles.includes(rolRequerido)) { 
        return res.status(403).json({ error: `Acceso denegado: se requiere el rol '${rolRequerido}'` }); 
      } 
 
      req.user = decoded; 
      next(); 
    } catch (err) { 
      console.error('Error al validar token:', err.message); 
      return res.status(401).json({ error: 'Token inválido o expirado' }); 
    } 
  }; 
} 
 
app.post('/login', async (req, res) => { 
  if (!keycloakClient) { 
    return res.status(503).json({ error: 'Servicio de autenticación no disponible' }); 
  } 
 
  const { username, password } = req.body; 
  if (!username || !password) { 
    return res.status(400).json({ error: 'Faltan credenciales' }); 
  } 
 
  try { 
    const tokenSet = await keycloakClient.grant({ 
      grant_type: 'password', 
      username, 
      password, 
      scope: 'openid profile email' 
    }); 
 
    res.status(200).json({ 
      access_token: tokenSet.access_token, 
      refresh_token: tokenSet.refresh_token, 
      expires_in: tokenSet.expires_in, 
      token_type: tokenSet.token_type 
    }); 
  } catch (err) { 
    console.error('Error en login:', err); 
    res.status(401).json({ error: 'Credenciales inválidas o Keycloak no disponible', detalle: err.message }); 
  } 
}); 
 
app.get('/listaEstudiantes', tokenRequired("usuario_univalle"), async (req, res) => { 
  let connection; 
  try {
    if (!oraclePool) {
      return res.status(503).json({ error: 'Base de datos no disponible' });
    }
    connection = await oraclePool.getConnection(); 
    const result = await connection.execute(
      "SELECT codigo, nombre, promedio, fecha_creacion FROM estudiantes ORDER BY nombre", 
      [], 
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ); 
    res.status(200).json(result.rows); 
  } catch (err) { 
    console.error('Error al listar estudiantes:', err); 
    res.status(500).json({ error: 'Error al listar estudiantes', detalle: err.message }); 
  } finally { 
    if (connection) await connection.close().catch(console.error); 
  } 
}); 
 
app.get('/obtenerEstudiante/:codigo', tokenRequired("usuario_univalle"), async (req, res) => { 
  let connection; 
  try {
    if (!oraclePool) {
      return res.status(503).json({ error: 'Base de datos no disponible' });
    }
    connection = await oraclePool.getConnection(); 
    const result = await connection.execute(
      "SELECT codigo, nombre, promedio, fecha_creacion FROM estudiantes WHERE codigo = :codigo", 
      [req.params.codigo], 
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0) {
      res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error al buscar estudiante:', err); 
    res.status(500).json({ error: 'Error al buscar estudiante', detalle: err.message }); 
  } finally { 
    if (connection) await connection.close().catch(console.error); 
  } 
});

app.post('/crearEstudiante', tokenRequired("usuario_univalle"), async (req, res) => {
  let connection;
  try {
    const { codigo, nombre, promedio } = req.body;

    if (!codigo || !nombre || promedio === undefined) {
      return res.status(400).json({ error: 'Faltan datos requeridos (codigo, nombre, promedio)' });
    }

    if (promedio < 0 || promedio > 5) {
      return res.status(400).json({ error: 'El promedio debe estar entre 0 y 5' });
    }

    if (!oraclePool) {
      return res.status(503).json({ error: 'Base de datos no disponible' });
    }
    connection = await oraclePool.getConnection();
    await connection.execute(
      `INSERT INTO estudiantes (codigo, nombre, promedio) VALUES (:codigo, :nombre, :promedio)`,
      { codigo, nombre, promedio },
      { autoCommit: true }
    );

    res.status(201).json({ mensaje: 'Estudiante creado exitosamente' });
  } catch (err) {
    console.error('Error al crear estudiante:', err);
    if (err.errorNum === 1) { // ORA-00001: unique constraint violated
      res.status(400).json({ error: 'El código del estudiante ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear estudiante', detalle: err.message });
    }
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

app.put('/actualizarEstudiante/:codigo', tokenRequired("usuario_univalle"), async (req, res) => {
  let connection;
  try {
    const { codigo } = req.params;
    const { nombre, promedio } = req.body;

    if (!nombre && promedio === undefined) {
      return res.status(400).json({ error: 'Debe proporcionar al menos nombre o promedio' });
    }

    if (promedio !== undefined && (promedio < 0 || promedio > 5)) {
      return res.status(400).json({ error: 'El promedio debe estar entre 0 y 5' });
    }

    if (!oraclePool) {
      return res.status(503).json({ error: 'Base de datos no disponible' });
    }
    connection = await oraclePool.getConnection();
    
    const result = await connection.execute(
      `UPDATE estudiantes 
       SET nombre = :nombre, promedio = :promedio 
       WHERE codigo = :codigo`,
      { codigo, nombre, promedio },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    } else {
      res.status(200).json({ mensaje: 'Estudiante actualizado exitosamente' });
    }
  } catch (err) {
    console.error('Error al actualizar estudiante:', err);
    res.status(500).json({ error: 'Error al actualizar estudiante', detalle: err.message });
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
});

app.delete('/eliminarEstudiante/:codigo', tokenRequired("usuario_univalle"), async (req, res) => {
  let connection;
  try {
    const { codigo } = req.params;

    if (!oraclePool) {
      return res.status(503).json({ error: 'Base de datos no disponible' });
    }
    connection = await oraclePool.getConnection();
    
    const result = await connection.execute(
      `DELETE FROM estudiantes WHERE codigo = :codigo`,
      [codigo],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    } else {
      res.status(200).json({ mensaje: 'Estudiante eliminado exitosamente' });
    }
  } catch (err) {
    console.error('Error al eliminar estudiante:', err);
    res.status(500).json({ error: 'Error al eliminar estudiante', detalle: err.message });
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}); 
app.use((req, res) => { 
res.status(404).json({ error: 'Ruta no encontrada' }); 
}); 
app.listen(port, () => { 
console.log(`🚀 Servidor corriendo en http://localhost:${port}`); 
});