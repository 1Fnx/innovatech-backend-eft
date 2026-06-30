FROM mysql:8.0

# Copiar script de inicialización
# MySQL ejecuta automáticamente cualquier .sql en este directorio
# en el primer arranque del contenedor
COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
