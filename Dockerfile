FROM node:20-alpine

# Install OpenSSL (Required for Prisma on Alpine)
RUN apk add --no-cache openssl

WORKDIR /app

# Copy root manifest
COPY package*.json ./

# Copy workspace packages
COPY packages ./packages
COPY apps ./apps

# Install dependencies (Force include devDependencies to ensure tsc is available)
RUN npm install --include=dev

# Generate Prisma Client
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

# Build Shared Packages
RUN npm run build --workspace=packages/database
RUN npm run build --workspace=packages/types

# Build Backend Services
RUN npm run build --workspace=apps/backend
RUN npm run build --workspace=apps/execution-service
RUN npm run build --workspace=apps/event-service

# Verify Builds (Fail if dist is missing)
RUN ls -la apps/backend/dist/index.js
RUN ls -la apps/execution-service/dist/index.js
RUN ls -la apps/event-service/dist/index.js

# Expose ports (Backend, Execution, Events, Frontend)
EXPOSE 3001 3002 3003 3000

# Default command (Overridden by Railway Custom Start Command)
CMD ["npm", "run", "dev"]
