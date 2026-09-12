# Multi-stage Dockerfile for Life RPG
# Stage 1: Build the React client
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Copy server dependencies and code
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./

# Copy built frontend assets to client/dist for unified serving
COPY --from=client-builder /app/client/dist /app/client/dist

EXPOSE 5001

CMD ["node", "index.js"]
