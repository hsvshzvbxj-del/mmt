FROM node:20-alpine AS client-builder
WORKDIR /app/client
RUN npm config set registry https://registry.npmjs.org/
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

FROM node:20-alpine AS server-builder
WORKDIR /app/server
RUN npm config set registry https://registry.npmjs.org/
COPY server/package*.json ./
RUN npm install
COPY server/ .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
RUN npm config set registry https://registry.npmjs.org/
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/package.json ./package.json
COPY --from=server-builder /app/server/package-lock.json ./package-lock.json
RUN npm ci --omit=dev
COPY --from=client-builder /app/client/dist ./public

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]
