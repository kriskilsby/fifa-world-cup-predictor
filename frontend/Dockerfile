# frontend/Dockerfile

FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS dev

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--webpack", "--hostname", "0.0.0.0"]

FROM base AS builder

RUN npm ci

COPY . .

RUN npm run build

FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["npm", "start"]