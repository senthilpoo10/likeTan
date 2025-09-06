# backend/Dockerfile
FROM node:18-bookworm

WORKDIR /app

# Install ts-node-dev globally (or use npx if preferred)
RUN npm install -g ts-node-dev

COPY package*.json ./
RUN npm install --include=dev

COPY . .

# Expose backend port
EXPOSE 8080

# Run dev script
CMD ["npm", "run", "dev"]