# Use official Node.js 20 image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts

# Copy application files
COPY . .

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
