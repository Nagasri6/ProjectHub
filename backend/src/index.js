import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { router } from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { User } from './models/User.js';

const app = express();
const allowedOrigins = new Set(env.frontendOrigins);
const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/;

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  if (!env.isProduction && localOriginPattern.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin not allowed: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'ProjectHub API' });
});

app.use('/api', router);
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDb();

  // Development only: seed an empty database so local work has realistic data.
  // Production never auto-seeds. Use `npm run seed` locally if you need to reset.
  const allowDevSeed = !env.isProduction && process.env.SEED !== 'false';
  if (allowDevSeed && (await User.countDocuments()) === 0) {
    const { seed } = await import('./seed/seed.js');
    await seed();
  }

  app.listen(env.port, env.host, () => {
    console.log(`ProjectHub API listening on ${env.host}:${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error.message);
  process.exit(1);
});
