FROM node:22-bookworm-slim

WORKDIR /app

ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/updin?schema=public

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci --legacy-peer-deps

COPY nest-cli.json tsconfig*.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
