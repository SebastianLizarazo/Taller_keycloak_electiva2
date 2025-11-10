# Configuración Local de AWS

Copia este archivo y renómbralo a `application-local.properties` con tus credenciales:

```properties
aws.accessKeyId=TU_ACCESS_KEY_AQUI
aws.secretAccessKey=TU_SECRET_KEY_AQUI
aws.region=us-east-1
```

Luego ejecuta la aplicación con:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**IMPORTANTE**: Nunca subas `application-local.properties` a Git. Este archivo ya está excluido en `.gitignore`.
