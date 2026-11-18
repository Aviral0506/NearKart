# Use Node.js 20 alpine image
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

EXPOSE 5000

# Start the Node.js server
CMD ["npm", "start"]
