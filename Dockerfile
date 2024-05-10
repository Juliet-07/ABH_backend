# Use a base image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

# Expose the redis port
EXPOSE 6379

# Start the application
CMD ["npm", "start"]