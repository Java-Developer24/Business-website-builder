/**
 * Database configuration loader (ENV-based)
 * Local + production friendly
 */
import { env } from "node:process";

export interface DatabaseCredentials {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export function getDatabaseCredentials(): DatabaseCredentials {
  const host = env.DB_HOST;
  const port = env.DB_PORT;
  const user = env.DB_USER;
  const password = env.DB_PASSWORD;
  const database = env.DB_NAME;

  if (!host || !port || !user || !database) {
    throw new Error(
      "Missing database environment variables. Required: DB_HOST, DB_PORT, DB_USER, DB_NAME"
    );
  }

  return {
    host,
    port: Number(port),
    user,
    password: password || "",
    database,
  };
}
