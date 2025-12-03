import { neon, neonConfig } from '@neondatabase/serverless'
import dotenv from 'dotenv'
dotenv.config()

neonConfig.fetchConnectionCache = true
neonConfig.pipelineTLS = true
neonConfig.pipelineConnect = 1

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env

export const sql = neon(
  `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`
)
