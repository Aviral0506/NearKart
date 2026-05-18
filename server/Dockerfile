# Use Node.js 18 alpine image for a smaller footprint
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 5000

# Start the Node.js server
CMD ["npm", "start"]
