FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY client/ ./
RUN npm run build

FROM node:20-alpine AS server-deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/src/index.js"]
