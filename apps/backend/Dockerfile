FROM node:22-alpine AS base
RUN corepack enable
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"

FROM base AS builder
WORKDIR /app

COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm --filter @repo/emails build
RUN pnpm --filter backend build

RUN pnpm --filter=backend --prod deploy /prod/backend

FROM base
RUN apk add --no-cache dumb-init
RUN adduser -D nestjs

WORKDIR /app
COPY --from=builder --chown=nestjs:nestjs /prod/backend ./

USER nestjs

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
