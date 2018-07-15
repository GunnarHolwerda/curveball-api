FROM node:8
WORKDIR /usr/local/src/realtime

ENV REDIS_HOST infrastructure_curveball-cache_1
ENV REDIS_PORT 6379
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start"]