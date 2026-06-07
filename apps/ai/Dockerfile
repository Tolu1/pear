FROM node:22-alpine AS base
RUN corepack enable
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"

FROM base AS builder
WORKDIR /app

COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm --filter @repo/agent-core build
RUN pnpm --filter ai build

RUN pnpm --filter=ai --prod deploy /prod/ai

FROM base
RUN apk add --no-cache dumb-init
RUN adduser -D nestjs

WORKDIR /app
COPY --from=builder --chown=nestjs:nestjs /prod/ai ./

USER nestjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
