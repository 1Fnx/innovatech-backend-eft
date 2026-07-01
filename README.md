# Innovatech Chile - Backend & Database (EFT)

Repositorio del Backend (API REST Node.js) y Base de Datos (MySQL) de la aplicación Tienda de Alimentos para Perritos.

## Estructura del Proyecto

```
.
├── backend/
│   ├── Dockerfile              # Multietapa (builder + runtime) con pnpm
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── server.js
│   ├── .dockerignore
│   └── tests/
│       └── api.test.js         # Tests Jest + Supertest
├── db/
│   ├── Dockerfile
│   └── init.sql
├── docker-compose.yml
├── .github/workflows/
│   ├── cicd-tienda-backend.yml
│   └── cicd-tienda-db.yml
└── README.md
```

## Cómo correr localmente

```bash
# Levantar backend + base de datos
docker-compose up --build

# Probar endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/productos
```

## Cómo correr los tests

```bash
cd backend
pnpm install
pnpm test
```

## Variables de Entorno

| Variable | Descripción | Obligatoria |
|---|---|---|
| PORT | Puerto del backend (default 3000) | No |
| DB_HOST | Host de la base de datos | Sí |
| DB_USER | Usuario MySQL | Sí |
| DB_PASSWORD | Contraseña MySQL | Sí |
| DB_NAME | Nombre de la base de datos | Sí |
| DB_PORT | Puerto MySQL (default 3306) | No |

## Pipeline CI/CD

Se gatilla con cada push a main y ejecuta:

1. **Job test**: instala dependencias con pnpm y corre tests con Jest
2. **Job build-push-deploy**: build Docker, escaneo Trivy, push a ECR, deploy a ECS

## Endpoints de la API

| Método | Endpoint | Descripción |
|---|---|---|
| GET | /api/health | Health check |
| GET | /api/productos | Listar productos |
| GET | /api/productos/:id | Obtener producto |
| POST | /api/productos | Crear producto |
| PUT | /api/productos/:id | Actualizar producto |
| DELETE | /api/productos/:id | Eliminar producto |

## Arquitectura en AWS

- AWS ECS Fargate
- Amazon ECR
- Application Load Balancer
- Security Groups en cascada
- CloudWatch Logs y Metrics
- Autoscaling Target Tracking CPU 50%
