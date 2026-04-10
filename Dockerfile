# ===========================================
# Pulso — Multi-stage Dockerfile
# ===========================================

# ── Stage 1: Dependencies ──────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci

# ── Stage 2: Build ─────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate precisa do schema
RUN npx prisma generate

# Build SvelteKit (adapter-node)
RUN npm run build

# Prune devDependencies
RUN npm prune --omit=dev

# ── Stage 3: Runtime ───────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV ORIGIN=http://localhost:3000

# Instalar apenas o necessário para bcrypt (compilação nativa)
RUN apk add --no-cache libc6-compat

# Copiar artefatos do build
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY aws/seed-prod.mjs ./seed-prod.mjs

EXPOSE 3000

# Rodar migrations/push + start
CMD ["sh", "-c", "npx prisma db push --skip-generate && node build"]
