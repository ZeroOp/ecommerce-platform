# Stage 1: Build the Angular app
# Node 22 matches modern Angular CLI requirements
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the project for production
RUN npm run build -- --configuration=production

# Stage 2: Serve the app using Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy the build output from the 'build' stage
# This script handles whether Angular placed the files in a subfolder or directly in dist
COPY --from=build /app/dist/redstore-client /tmp/redstore-client
RUN if [ -d "/tmp/redstore-client/browser" ]; then \
        cp -r /tmp/redstore-client/browser/* .; \
    else \
        cp -r /tmp/redstore-client/* .; \
    fi && rm -rf /tmp/redstore-client

# Copy your nginx.conf to configure the server (Make sure to create this file too!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]