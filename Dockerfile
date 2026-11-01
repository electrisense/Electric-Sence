# Multi-stage production Dockerfile for Electric Sence LMS & RAG
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and compile Vite frontend
COPY . .
RUN npm run build

# Production runtime image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy dependencies and application build
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and server codebase
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules/tsx ./node_modules/tsx

# Persistent volume directory for SQLite DB and uploaded documents
RUN mkdir -p /data/uploads /data/backups && chown -R node:node /app /data

USER node

EXPOSE 3001

# Default environment for persistent storage mount point
ENV DATA_DIR=/data

CMD ["npm", "start"]

