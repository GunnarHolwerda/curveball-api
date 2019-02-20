FROM node:8
WORKDIR /app

RUN apt-get update && apt-get install -y postgresql

COPY package*.json ./
RUN npm install --no-save
COPY . .
RUN chmod +x ./wait-for-db.sh
ENV REDIS_HOST curveball-cache
ENV REDIS_PORT 6379
ENV NODE_ENV local
ENV PGUSER root
ENV PGHOST 127.0.0.1
ENV PGPASSWORD password
ENV PGDATABASE curveball
ENV NBA_API_KEY pbpasfw9nmq6naunn6eat3nj
ENV NFL_API_KEY peg49d2u6kdwst5qdjv8txks
CMD ["./wait-for-db.sh", "npm", "run", "update-game-data"]
