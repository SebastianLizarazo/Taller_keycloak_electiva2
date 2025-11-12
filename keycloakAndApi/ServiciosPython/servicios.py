from flask import Flask, request, jsonify
from flask_cors import CORS
from keycloak import KeycloakOpenID
from EstudianteGestion import EstudianteEjemplo
from estudiante_repository import EstudianteRepository
from functools import wraps

app = Flask(__name__)
app.secret_key = "uptc"
CORS(app)

# Inicializar el repositorio de base de datos
db = EstudianteRepository()


keycloak_openid = KeycloakOpenID(
    server_url="http://localhost:8082/",
    client_id="003",
    realm_name="arquitectura",
    client_secret_key="jpLy1tkBjKFaoirreUnzzfljIXutFx8L"
)


def tiene_rol(token_info, cliente_id, rol_requerido):
    try:
        roles = token_info["resource_access"][cliente_id]["roles"]
        return rol_requerido in roles
    except KeyError:
        return False


def token_required(rol_requerido):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            auth_header = request.headers.get('Authorization', None)
            if not auth_header:
                return jsonify({"error": "Token requerido"}), 401

            try:
                token = auth_header.split(" ")[1]
                userinfo = keycloak_openid.decode_token(
                    token
                )
            except Exception as e:
                print("Error al decodificar token:", str(e))
                return jsonify({"error": "Token inválido o expirado"}), 401

            if not tiene_rol(userinfo, keycloak_openid.client_id, rol_requerido):
                return jsonify({"error": f"Acceso denegado: se requiere el rol '{rol_requerido}'"}), 403

            return f(userinfo, *args, **kwargs)
        return decorated
    return decorator


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Faltan credenciales"}), 400

    try:
        token = keycloak_openid.token(username, password)
        return jsonify({
            "access_token": token['access_token'],
            "refresh_token": token['refresh_token'],
            "expires_in": token['expires_in'],
            "token_type": token['token_type']
        }), 200
    except Exception as e:
        return jsonify({"error": "Credenciales inválidas o Keycloak no disponible", "detalle": str(e)}), 401


@app.route('/listaEstudiantes', methods=['GET'])
@token_required(rol_requerido="usuario_uptc")
def lista_estudiantes(userinfo):
    estudiantes = db.obtener_estudiantes()
    return jsonify([est.to_json() for est in estudiantes])


@app.route('/crearEstudiante', methods=['POST'])
@token_required(rol_requerido="usuario_uptc")
def crear_estudiante(userinfo):
    data = request.get_json()
    nombre = data.get('nombre')
    codigo = data.get('codigo')
    promedio = data.get('promedio')

    estudiante = EstudianteEjemplo(nombre, codigo, promedio)

    if db.crear_estudiante(estudiante):
        return jsonify({"mensaje": "Estudiante creado exitosamente"}), 201
    else:
        return jsonify({"error": "El código del estudiante ya existe"}), 400


@app.route('/obtenerEstudiante/<codigo>', methods=['GET'])
@token_required(rol_requerido="usuario_uptc")
def obtener_estudiante(userinfo, codigo):
    estudiante = db.obtener_estudiante_por_codigo(codigo)

    if estudiante is not None:
        return jsonify(estudiante.to_json()), 200
    else:
        return jsonify({"mensaje": "Estudiante no encontrado"}), 404


@app.route('/actualizarEstudiante/<codigo>', methods=['PUT'])
@token_required(rol_requerido="usuario_uptc")
def actualizar_estudiante(userinfo, codigo):
    data = request.get_json()
    nombre = data.get('nombre')
    promedio = data.get('promedio')

    estudiante = EstudianteEjemplo(nombre, codigo, promedio)

    if db.actualizar_estudiante(codigo, estudiante):
        return jsonify({"mensaje": "Estudiante actualizado exitosamente"}), 200
    else:
        return jsonify({"mensaje": "Estudiante no encontrado"}), 404


@app.route('/eliminarEstudiante/<codigo>', methods=['DELETE'])
@token_required(rol_requerido="usuario_uptc")
def eliminar_estudiante(userinfo, codigo):
    if db.eliminar_estudiante(codigo):
        return jsonify({"mensaje": "Estudiante eliminado exitosamente"}), 200
    else:
        return jsonify({"mensaje": "Estudiante no encontrado"}), 404


if __name__ == '__main__':
    try:
        app.run(debug=True)
    finally:
        # Cerrar la conexión cuando se detenga el servidor
        db.cerrar_conexion()
