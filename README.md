# 🚀 Rocket

Admin panel — pnpm + Turborepo monorepo.

## Struktura

```
apps/
  web/      Next.js 15 (App Router, TS, src/)   → http://localhost:3000
  api/      NestJS                               → http://localhost:4000/api/v1
packages/
  shared/   Zod sxemalar, enums, typelar (web + api)
  config/   tsconfig / eslint / prettier bazasi
docker-compose.yml   mongo, redis, minio, mailpit
```

## Talablar

Node >= 20, pnpm 10, Docker.

## Ishga tushirish

```bash
# 1. env fayllarni tayyorlang
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 2. infratuzilmani ko'taring
docker compose up -d        # mongo:27017, redis:6379, minio:9000/9001, mailpit:1025/8025

# 3. bog'liqliklar
pnpm install

# 4. ikkala appni birga ishga tushiring
pnpm dev
```

## Skriptlar (root)

| Buyruq | Vazifa |
|---|---|
| `pnpm dev` | web + api birga (Turborepo) |
| `pnpm build` | hamma paketni build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript tekshiruvi |
| `pnpm format` | Prettier |

## Infra panellari (dev)

- MinIO konsoli: http://localhost:9001 (minioadmin / minioadmin)
- Mailpit (email): http://localhost:8025
