FROM node:8
WORKDIR /usr/local/src/realtime

ENV REDIS_HOST curveball-cache
ENV REDIS_PORT 6379
ENV NODE_ENV local
ENV JWT_SECRET sEcReT
ENV INTERNAL_SECRET VerySecret
ENV PGUSER root
ENV PGHOST curveball-db
ENV PGPASSWORD password
ENV PGDATABASE curveball
ENV QT_SECRET ExtraSecret
ENV MIXPANEL_TOKEN 948d03478fe4f2bf1527edb7f2c9a2c9
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start"]
