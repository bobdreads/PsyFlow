// prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'app/prisma/schema.prisma', // caminho até seu schema
  migrations: {
    path: 'app/prisma/migrations',    // opcional, mas recomendado
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
