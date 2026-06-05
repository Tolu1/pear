FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/ai ./apps/ai
COPY packages/agent-core ./packages/agent-core
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

RUN pnpm install --filter ai... --frozen-lockfile
RUN pnpm --filter @repo/agent-core build
RUN pnpm --filter ai build

FROM node:22-alpine

RUN apk add --no-cache dumb-init
RUN adduser -D nestjs

WORKDIR /app

COPY --from=builder /app/apps/ai/dist ./apps/ai/dist
COPY --from=builder /app/apps/ai/node_modules ./apps/ai/node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/agent-core/dist ./packages/agent-core/dist
COPY --from=builder /app/packages/agent-core/node_modules ./packages/agent-core/node_modules
COPY --from=builder /app/packages/agent-core/package.json ./packages/agent-core/package.json

USER nestjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/ai/dist/main.js"]
