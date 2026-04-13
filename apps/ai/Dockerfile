FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/ai ./apps/ai

RUN pnpm install --filter ai --frozen-lockfile
RUN pnpm --filter ai build

FROM node:22-alpine

RUN apk add --no-cache dumb-init
RUN adduser -D nestjs

WORKDIR /app

COPY --from=builder /app/apps/ai/dist ./apps/ai/dist
COPY --from=builder /app/node_modules ./node_modules

USER nestjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/ai/dist/main.js"]
