FROM node:8
WORKDIR /usr/local/src/realtime

ENV REDIS_HOST infrastructure_curveball-cache_1
ENV REDIS_PORT 6379
ENV NODE_ENV local
ENV JWT_SECRET sEcReT
ENV INTERNAL_SECRET VerySecret
ENV PGUSER root
ENV PGHOST infrastructure_curveball-db_1
ENV PGPASSWORD password
ENV PGDATABASE curveball
ENV QT_SECRET ExtraSecret
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start"]
