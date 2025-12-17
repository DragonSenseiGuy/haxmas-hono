import "dotenv/config"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { Database } from "bun:sqlite"

const sqlite = new Database(process.env.DB_FILE_NAME || "./database.db")

sqlite.run(`
  CREATE TABLE IF NOT EXISTS wishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    item TEXT NOT NULL,
    fulfilled INTEGER DEFAULT 0 NOT NULL,
    created_at INTEGER NOT NULL
  )
`)

export const db = drizzle(sqlite)