import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEV_JWT_FALLBACK = 'projecthub-dev-secret-change-me';
const KNOWN_INSECURE_SECRETS = new Set([
  DEV_JWT_FALLBACK,
  'replace-with-a-long-random-secret',
  'projecthub-local-dev-secret',
]);

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

function resolveJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (isProduction) {
    if (!secret) {
      throw new Error('JWT_SECRET is required when NODE_ENV=production');
    }
    if (KNOWN_INSECURE_SECRETS.has(secret)) {
      throw new Error('JWT_SECRET cannot be a known development default when NODE_ENV=production');
    }
    return secret;
  }

  return secret || DEV_JWT_FALLBACK;
}

function resolveFrontendOrigins() {
  const origins = [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    ...(process.env.CORS_ORIGINS || '').split(','),
  ]
    .map((value) => value?.trim())
    .filter(Boolean);

  if (isProduction && origins.length === 0) {
    throw new Error('FRONTEND_URL or CORS_ORIGINS is required when NODE_ENV=production');
  }

  return origins;
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  host: process.env.HOST || '0.0.0.0',
  frontendUrl: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173',
  frontendOrigins: resolveFrontendOrigins(),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/projecthub',
  jwtSecret: resolveJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
  nodeEnv,
  isProduction,
};
