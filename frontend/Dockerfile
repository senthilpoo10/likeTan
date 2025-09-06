# frontend/Dockerfile
FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./
# RUN npm install --include=dev
RUN npm install && npm rebuild

COPY . .

# Expose Vite dev server port (default is 5173)
EXPOSE 5173

CMD ["npm", "run", "dev"]