# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN mkdir -p uploads

EXPOSE 4000
CMD ["npm", "start"]
