# Base node image
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Generate Prisma Client & Build API
RUN npx prisma generate --schema=prisma/schema.prisma
RUN pnpm turbo run build --filter=api...

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create app user
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer /app .

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]