# =========================================================
# Etapa 1: Builder
# Instala dependencias (incluidas dev) para correr tests
# Usa pnpm para mejor seguridad e instalación más rápida
# =========================================================
FROM node:18-alpine AS builder

# Instalar pnpm globalmente
RUN npm install -g pnpm@9

WORKDIR /app

# Copiar manifiestos primero para aprovechar cache de Docker
COPY package.json pnpm-lock.yaml ./

# Instalar TODAS las dependencias (incluidas dev para testing)
# --frozen-lockfile: exige que el lockfile coincida exactamente (seguridad)
# --ignore-scripts: no ejecuta scripts post-install (mitiga supply chain attacks)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copiar el resto del código fuente
COPY . .

# =========================================================
# Etapa 2: Runtime
# Imagen minimalista solo con dependencias de producción
# =========================================================
FROM node:18-alpine AS runtime

# Instalar pnpm en runtime también
RUN npm install -g pnpm@9

# Crear usuario no-root para mejorar seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiar solo lo necesario para correr la app
COPY package.json pnpm-lock.yaml ./

# Instalar solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile --ignore-scripts && \
    pnpm store prune

# Copiar el código fuente desde el builder
COPY --from=builder /app/server.js ./

# Cambiar al usuario no-root
USER appuser

# Health check nativo de Docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

EXPOSE 3000

CMD ["node", "server.js"]
