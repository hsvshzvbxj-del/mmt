FROM node:20-slim AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

FROM node:20-slim AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npm run build

FROM node:20-slim AS production
WORKDIR /app
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/package.json ./package.json
COPY --from=server-builder /app/server/package-lock.json ./package-lock.json
RUN npm ci --omit=dev
COPY --from=client-builder /app/client/dist ./public

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]
