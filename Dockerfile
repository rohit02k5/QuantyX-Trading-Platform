FROM node:20-alpine

WORKDIR /app

# Copy root manifest
COPY package*.json ./

# Copy workspace packages
COPY packages ./packages
COPY apps ./apps

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

# Build Shared Packages
RUN npm run build --workspace=packages/database
RUN npm run build --workspace=packages/types

# Build Backend Services
RUN npm run build --workspace=apps/backend
RUN npm run build --workspace=apps/execution-service
RUN npm run build --workspace=apps/event-service

# Expose ports (Backend, Execution, Events, Frontend)
EXPOSE 3001 3002 3003 3000

# Default command (Overridden by Railway Custom Start Command)
CMD ["npm", "run", "dev"]
