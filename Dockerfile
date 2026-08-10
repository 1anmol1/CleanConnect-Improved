# Stage 1: Build the React frontend
FROM node:20-alpine AS client-build
WORKDIR /app/client

# Install frontend dependencies
COPY client/package*.json ./
RUN npm install

# Copy frontend source and build
COPY client/ ./
# Add environment variables needed for build (if any)
RUN npm run build

# Stage 2: Setup the Node backend
FROM node:20-alpine
WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy backend source
COPY server/ ./

# Copy built frontend assets to the backend's public folder
COPY --from=client-build /app/client/dist ./public

# Expose backend port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
