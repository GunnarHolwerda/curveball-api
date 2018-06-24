FROM node:8
WORKDIR /usr/local/src/realtime

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start"]