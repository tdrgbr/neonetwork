
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;     
neonConfig.useSecureWebSocket = true;  
neonConfig.pipelineConnect = 1;     

dotenv.config()
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env

export const pool = new Pool({
  connectionString: `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`,
  ssl: { rejectUnauthorized: false },
});
