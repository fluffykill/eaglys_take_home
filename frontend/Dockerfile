FROM node:20.5.0

WORKDIR /frontend

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

# RUN npm run build

CMD ["sh", "-c", "npm run start"]