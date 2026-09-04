import dotenv from 'dotenv';

dotenv.config();

/** Reads a required variable, failing loudly at boot rather than at first use. */
function required(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        'Copy apps/api/.env.example to apps/api/.env and fill it in.'
    );
  }
  return value;
}

function optional(key, fallback) {
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : value;
}

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  isProduction: optional('NODE_ENV', 'development') === 'production',
  port: Number(optional('PORT', 5000)),
  apiPrefix: optional('API_PREFIX', '/api/v1'),

  databaseUrl: required('DATABASE_URL'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpires: optional('JWT_ACCESS_EXPIRES', '15m'),
    refreshExpires: optional('JWT_REFRESH_EXPIRES', '7d'),
  },

  corsOrigins: optional('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  /** Where to ping so the Next.js app drops its cache after a content change. */
  revalidate: {
    url: optional('REVALIDATE_URL', ''),
    secret: optional('REVALIDATE_SECRET', ''),
  },

  uploadDir: optional('UPLOAD_DIR', 'uploads'),
  maxUploadBytes: Number(optional('MAX_UPLOAD_MB', 5)) * 1024 * 1024,
  publicBaseUrl: optional('PUBLIC_BASE_URL', 'http://localhost:5000').replace(/\/$/, ''),

  mail: {
    host: optional('SMTP_HOST', ''),
    port: Number(optional('SMTP_PORT', 587)),
    user: optional('SMTP_USER', ''),
    pass: optional('SMTP_PASS', ''),
    from: optional('MAIL_FROM', 'AKM School <no-reply@akmpublicschool.in>'),
    notifyTo: optional('ENQUIRY_NOTIFY_TO', ''),
    /** With no SMTP host configured, mail is logged instead of sent. */
    get enabled() {
      return Boolean(this.host);
    },
  },

  seed: {
    adminName: optional('SEED_ADMIN_NAME', 'School Administrator'),
    adminEmail: optional('SEED_ADMIN_EMAIL', 'admin@akmpublicschool.in'),
    adminPassword: optional('SEED_ADMIN_PASSWORD', 'Admin@12345'),
  },
};

export default env;
