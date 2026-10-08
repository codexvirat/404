FROM node:22-alpine

WORKDIR /app

COPY server/package*.json server/
RUN npm ci --prefix server --omit=dev

COPY client/package*.json client/
RUN npm ci --prefix client

COPY server server
COPY client client
RUN npm run build --prefix client

ENV NODE_ENV=production
ENV PORT=5050
EXPOSE 5050

CMD ["node", "server/index.js"]
