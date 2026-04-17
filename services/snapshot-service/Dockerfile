# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Install PostgreSQL client for pg_dump
RUN apk add --no-cache postgresql-client

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source
COPY . .

# Your app binds to port 8080, but this service doesn't need to expose a port
# It's a background worker.

# Command to run the app
CMD [ "npm", "start" ]
