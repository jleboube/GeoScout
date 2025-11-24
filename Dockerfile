# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build arguments for environment variables
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Build the application
RUN npm run build

# Stage 3: Production runner with Nginx
FROM nginx:alpine AS runner

# Copy nginx configuration first
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder (this will overwrite default nginx files)
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port (will be mapped to obscure port in docker-compose)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
