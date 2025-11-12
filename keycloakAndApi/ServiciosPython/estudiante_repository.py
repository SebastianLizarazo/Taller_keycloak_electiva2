"""
Repositorio para manejar operaciones de base de datos con PostgreSQL
"""
import psycopg2
from psycopg2 import IntegrityError, Error
from database_config import get_connection_params
from EstudianteGestion import EstudianteEjemplo


class EstudianteRepository:

    def __init__(self):
        """Inicializa la conexión a PostgreSQL"""
        try:
            params = get_connection_params()
            self.connection = psycopg2.connect(**params)
            print("✅ Conexión exitosa a PostgreSQL")
        except Error as error:
            print(f"❌ Error al conectar a PostgreSQL: {error}")
            raise

    def crear_estudiante(self, estudiante):
        """Inserta un nuevo estudiante en la base de datos"""
        try:
            cursor = self.connection.cursor()
            sql = """
                INSERT INTO estudiantes (codigo, nombre, promedio)
                VALUES (%s, %s, %s)
            """
            cursor.execute(sql, (
                estudiante.codigo,
                estudiante.nombre,
                estudiante.promedio
            ))
            self.connection.commit()
            cursor.close()
            return True
        except IntegrityError:
            # El código ya existe
            self.connection.rollback()
            return False
        except Error as error:
            print(f"Error al crear estudiante: {error}")
            self.connection.rollback()
            return False

    def obtener_estudiantes(self):
        """Obtiene todos los estudiantes de la base de datos"""
        try:
            cursor = self.connection.cursor()
            sql = "SELECT codigo, nombre, promedio FROM estudiantes ORDER BY nombre"
            cursor.execute(sql)

            estudiantes = []
            for row in cursor:
                estudiante = EstudianteEjemplo(
                    nombre=row[1],
                    codigo=row[0],
                    promedio=float(row[2])
                )
                estudiantes.append(estudiante)

            cursor.close()
            return estudiantes
        except Error as error:
            print(f"Error al obtener estudiantes: {error}")
            return []

    def obtener_estudiante_por_codigo(self, codigo):
        """Obtiene un estudiante específico por su código"""
        try:
            cursor = self.connection.cursor()
            sql = "SELECT codigo, nombre, promedio FROM estudiantes WHERE codigo = %s"
            cursor.execute(sql, (codigo,))

            row = cursor.fetchone()
            cursor.close()

            if row:
                return EstudianteEjemplo(
                    nombre=row[1],
                    codigo=row[0],
                    promedio=float(row[2])
                )
            return None
        except Error as error:
            print(f"Error al obtener estudiante: {error}")
            return None

    def actualizar_estudiante(self, codigo, estudiante):
        """Actualiza los datos de un estudiante existente"""
        try:
            cursor = self.connection.cursor()
            sql = """
                UPDATE estudiantes 
                SET nombre = %s, promedio = %s
                WHERE codigo = %s
            """
            cursor.execute(sql, (
                estudiante.nombre,
                estudiante.promedio,
                codigo
            ))
            self.connection.commit()
            rows_affected = cursor.rowcount
            cursor.close()
            return rows_affected > 0
        except Error as error:
            print(f"Error al actualizar estudiante: {error}")
            self.connection.rollback()
            return False

    def eliminar_estudiante(self, codigo):
        """Elimina un estudiante de la base de datos"""
        try:
            cursor = self.connection.cursor()
            sql = "DELETE FROM estudiantes WHERE codigo = %s"
            cursor.execute(sql, (codigo,))
            self.connection.commit()
            rows_affected = cursor.rowcount
            cursor.close()
            return rows_affected > 0
        except Error as error:
            print(f"Error al eliminar estudiante: {error}")
            self.connection.rollback()
            return False

    def cerrar_conexion(self):
        """Cierra la conexión a la base de datos"""
        if self.connection:
            self.connection.close()
            print("✅ Conexión cerrada")
