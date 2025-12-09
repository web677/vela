FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com/
RUN npm install

COPY . .

EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--host"]
