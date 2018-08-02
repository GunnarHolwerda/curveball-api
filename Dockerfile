FROM node:8
WORKDIR /usr/local/src/realtime

ENV REDIS_HOST infrastructure_curveball-cache_1
ENV REDIS_PORT 6379
ENV NODE_ENV dev
ENV SSL_CERT_PATH /etc/ssl/private/cert.pem
ENV SSL_CERT_KEY /etc/ssl/private/key.pem
ENV JWT_SECRET sEcReT
ENV INTERNAL_SECRET VerySecret
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start"]
