import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL;

  if (!databaseUrl) {
    return res.status(503).json({
      connected: false,
      error: 'DATABASE_URL environment variable is not configured',
    });
  }

  try {
    const sql = neon(databaseUrl);
    const result = await sql`SELECT NOW() as current_time, current_database() as database_name`;
    return res.status(200).json({
      connected: true,
      serverTime: result[0]?.current_time,
      database: result[0]?.database_name,
    });
  } catch (err: any) {
    return res.status(500).json({
      connected: false,
      error: err.message || 'Database connection error',
    });
  }
}
