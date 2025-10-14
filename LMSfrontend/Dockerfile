# Multi-stage build for React/Vite application

# Build stage
FROM node:20-bookworm-slim as build

WORKDIR /app

# Copy only package.json (avoid host-created lockfile issues with optional deps)
COPY package.json ./

# Install dependencies without using a lockfile inside container
RUN npm install --no-package-lock 

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
