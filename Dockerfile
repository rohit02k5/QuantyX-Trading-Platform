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

# Expose ports (Backend, Execution, Events, Frontend)
EXPOSE 3001 3002 3003 3000

# Default command
CMD ["npm", "run", "dev"]
