# Use official Node.js lightweight image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy remaining project files
COPY . .

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]