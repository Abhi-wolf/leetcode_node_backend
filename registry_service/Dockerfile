# STAGE 01

FROM node:lts-alpine3.23 AS builder

WORKDIR /leetcode-server/registry-service

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# STAGE 02
FROM node:lts-alpine3.23 AS production

WORKDIR /leetcode-server/registry-service

COPY package*.json ./

RUN npm ci

COPY --from=builder /leetcode-server/registry-service/dist ./dist

CMD ["npm", "start"]