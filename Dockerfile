# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Set Node memory limit for build
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy package files
COPY package*.json ./

# Install dependencies with reduced memory footprint
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Build the application with memory limit
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install serve to run the static files
RUN npm install -g serve

# Copy built assets from build stage
COPY --from=build /app/dist ./dist

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "8080"]
