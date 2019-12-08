FROM node:12
WORKDIR /usr/local/src/realtime

RUN apt-get update && apt-get install -y postgresql

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
ENV NBA_API_KEY pbpasfw9nmq6naunn6eat3nj
ENV NFL_API_KEY peg49d2u6kdwst5qdjv8txks
ENV MIXPANEL_TOKEN 948d03478fe4f2bf1527edb7f2c9a2c9
COPY package*.json ./
RUN npm install --no-save
COPY . .
RUN chmod +x ./wait-for-db.sh
EXPOSE 3001
CMD ["./wait-for-db.sh", "npm", "run", "start"]
