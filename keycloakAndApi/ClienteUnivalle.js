const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const { Issuer } = require('openid-client');

const app = express();
const port = 3000;

app.use(cors({
  origin: 'localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 

const dbConfig = {
  user: "claseMartes",
  password: "uptc",
  connectString: "localhost:1521/xe"
};

const keycloakConfig = {
  serverUrl: "http://localhost:8082/",
  clientId: "02",
  clientSecret: "R3pDC7dJAQdR01oNo8Wk2d7dUp8mUu5O",
  realm: "arquitectura"
};

let keycloakClient; 
 
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
 
app.get('/estudiantes', tokenRequired("usuario_univalle"), async (req, res) => { 
  let connection; 
  try { 
    connection = await oracledb.getConnection(dbConfig); 
    const result = await connection.execute("SELECT * FROM ESTUDIANTE", [], { outFormat: oracledb.OUT_FORMAT_OBJECT }); 
    res.status(200).json(result.rows); 
  } catch (err) { 
    console.error('Error al listar estudiantes:', err); 
    res.status(500).json({ error: 'Error al listar estudiantes' }); 
  } finally { 
    if (connection) await connection.close().catch(console.error); 
  } 
}); 
 
app.get('/listaEstudiantes/:id', tokenRequired("usuario_univalle"), async (req, res) => { 
  let connection; 
  try { 
    connection = await oracledb.getConnection(dbConfig); 
    const result = await connection.execute("SELECT * FROM ESTUDIANTE WHERE ID = :id", [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Estudiante no encontrado' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
console.error('Error al buscar estudiante:', err); 
res.status(500).json({ error: 'Error al buscar estudiante' }); 
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