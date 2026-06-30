# Innovatech Chile - Backend & Database (Examen Final Transversal - EFT)

Repositorio del Backend (API REST Node.js) y la Base de Datos (MySQL) de la aplicación **Tienda de Alimentos para Perritos**, parte del caso Innovatech Chile.

Este repositorio cubre los requerimientos del Examen Final Transversal (EFT) de la asignatura ISY1101 - Introducción a Herramientas DevOps.

## Estructura del Proyecto

```
.
├── backend/                    # API REST (Node.js + Express)
│   ├── Dockerfile              # Multietapa (builder + runtime) con pnpm
│   ├── package.json
│   ├── pnpm-lock.yaml          # Lockfile (commiteado para reproducibilidad)
│   ├── server.js
│   ├── .dockerignore
│   └── tests/
│       └── api.test.js         # Tests Jest + Supertest
├── db/                         # Base de datos (MySQL)
│   ├── Dockerfile
│   └── init.sql                # Script de inicialización
├── docker-compose.yml          # Entorno local
├── .github/workflows/
│   ├── cicd-tienda-backend.yml # Pipeline backend
│   └── cicd-tienda-db.yml      # Pipeline base de datos
└── README.md
```

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Lenguaje Backend | Node.js 18 |
| Framework | Express 4 |
| Base de Datos | MySQL 8 |
| Driver MySQL | mysql2 |
| Testing | Jest + Supertest |
| Gestor de paquetes | **pnpm 9** (más seguro y rápido que npm) |
| Contenedorización | Docker (multietapa) |
| Orquestación local | Docker Compose |
| CI/CD | GitHub Actions |
| Registro de imágenes | Amazon ECR |
| Orquestación cloud | AWS ECS Fargate |

## ¿Por qué pnpm en lugar de npm?

Este proyecto utiliza **pnpm** como gestor de paquetes por mejoras de seguridad:

- **Dependencias estrictas**: pnpm no permite usar paquetes que no estén explícitamente declarados
- **`--frozen-lockfile`**: exige que el lockfile coincida exactamente, evitando instalaciones inesperadas
- **`--ignore-scripts`**: bloquea scripts post-install (vector común en ataques de supply chain)
- **Más rápido en CI/CD**: cache global por contenido en lugar de duplicar dependencias

## Cómo correr el proyecto localmente

### Requisitos previos

- Docker Desktop instalado y corriendo
- Git
- (Opcional) Node.js 18+ y pnpm si quieres correr tests fuera del contenedor

Si no tienes pnpm instalado:

```bash
npm install -g pnpm@9
```

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/<tu-usuario>/innovatech-backend-eft.git
cd innovatech-backend-eft
```

### Paso 2: Generar el lockfile (solo la primera vez)

Si el repositorio no tiene `pnpm-lock.yaml`, genéralo:

```bash
cd backend
pnpm install
git add pnpm-lock.yaml
git commit -m "Add pnpm lockfile"
cd ..
```

### Paso 3: Levantar el entorno

```bash
docker-compose up --build
```

Esto construye las imágenes del backend y la DB, las levanta en una red interna y deja el backend escuchando en `http://localhost:3000`.

### Paso 4: Validar que todo funciona

Abrir en otra terminal:

```bash
# Endpoint de salud
curl http://localhost:3000/api/health

# Listar productos
curl http://localhost:3000/api/productos
```

### Paso 5: Detener el entorno

```bash
docker-compose down
```

Para borrar también los datos persistentes de la base:

```bash
docker-compose down -v
```

## Cómo correr los tests

### Localmente sin Docker

```bash
cd backend
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
```

### Dentro del contenedor

```bash
docker-compose run --rm backend pnpm test
```

Los tests cubren:

- Endpoint de salud (`/api/health`)
- Validación de payloads (POST, PUT)
- Estructura de respuestas

## Variables de Entorno

| Variable | Descripción | Obligatoria |
|---|---|---|
| `PORT` | Puerto del backend (default 3000) | No |
| `DB_HOST` | Host de la base de datos | **Sí** |
| `DB_USER` | Usuario MySQL | **Sí** |
| `DB_PASSWORD` | Contraseña MySQL | **Sí** |
| `DB_NAME` | Nombre de la base de datos | **Sí** |
| `DB_PORT` | Puerto MySQL (default 3306) | No |

**Importante**: el backend rechaza arrancar si las variables obligatorias no están definidas. Esto es intencional, para evitar exponer credenciales por defecto.

## Pipeline CI/CD

El pipeline (`cicd-tienda-backend.yml`) se gatilla con cada push a `main` y ejecuta:

1. **Job `test`**: instala dependencias con pnpm y corre los tests con Jest + Supertest
2. **Job `build-push-deploy`** (solo si los tests pasan):
   - Login en Amazon ECR
   - Build de la imagen Docker
   - Escaneo de vulnerabilidades con Trivy
   - Push de la imagen a ECR (tag SHA + tag latest)
   - Actualización de la Task Definition de ECS
   - Deploy con `wait-for-service-stability`

### Secrets requeridos en GitHub

| Secret | Descripción |
|---|---|
| `AWS_ACCESS_KEY_ID` | Credencial AWS |
| `AWS_SECRET_ACCESS_KEY` | Credencial AWS |
| `AWS_SESSION_TOKEN` | Token de sesión (AWS Academy) |
| `AWS_REGION` | Región AWS (ej. us-east-1) |

## Endpoints de la API

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Health check del servicio |
| GET | `/api/productos` | Listar todos los productos |
| GET | `/api/productos/:id` | Obtener un producto por ID |
| POST | `/api/productos` | Crear un nuevo producto |
| PUT | `/api/productos/:id` | Actualizar un producto |
| DELETE | `/api/productos/:id` | Eliminar un producto |

## Arquitectura en AWS

El backend se despliega en una arquitectura serverless orquestada:

- **AWS ECS Fargate** ejecuta los contenedores
- **Amazon ECR** almacena las imágenes
- **Application Load Balancer** distribuye el tráfico
- **Security Groups en cascada** aíslan cada capa
- **CloudWatch** registra logs y métricas

El diagrama detallado de arquitectura se encuentra en el informe del proyecto.

## Seguridad

Buenas prácticas aplicadas:

- Sin valores hardcoded sensibles en el código (credenciales solo vía env vars)
- Dockerfile multietapa con imagen final minimalista (alpine)
- Usuario no-root en el contenedor
- `pnpm install --frozen-lockfile --ignore-scripts` en el pipeline
- Escaneo de vulnerabilidades con Trivy antes del push a ECR
- Security Groups restrictivos en AWS (solo permiten tráfico desde el origen esperado)
