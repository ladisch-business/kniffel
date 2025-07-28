FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Clean up dev dependencies after build
RUN npm ci --only=production && npm cache clean --force

EXPOSE 3001

CMD ["npm", "start"]
