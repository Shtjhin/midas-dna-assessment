const express = require("express");
const { Pool } = require("pg");

const app = express();
const ADMIN_CODE = process.env.ADMIN_CODE || "MIDAS2026";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

let schemaPromise = null;
function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = pool.query(`
    CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    stage TEXT,
    assessor TEXT,
    date TIMESTAMPTZ NOT NULL,
    value_scores JSONB NOT NULL,
    total INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE submissions ADD COLUMN IF NOT EXISTS gender TEXT;
    ALTER TABLE submissions ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
    `);
  }
  return schemaPromise;
}

app.use(express.json({ limit: "1mb" }));

app.use(async (req, res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (err) {
    console.error("Schema init failed:", err);
    res.status(500).json({ error: "Database not ready" });
  }
});

function requireAdmin(req, res, next) {
  const code = req.get("x-admin-code");
  if (!code || code !== ADMIN_CODE) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function rowToEntry(r) {
  return {
    id: r.id,
    name: r.name,
    gender: r.gender || "",
    role: r.role || "",
    email: r.email || "",
    stage: r.stage || "",
    assessor: r.assessor || "",
    date: r.date,
    startedAt: r.started_at,
    valueScores: r.value_scores,
    total: r.total,
  };
}

app.post("/api/submissions", async (req, res) => {
  try {
    const e = req.body || {};
    if (!e.id || !e.name || !e.valueScores || typeof e.total !== "number") {
      return res.status(400).json({ error: "Invalid submission payload" });
    }
    await pool.query(
      `INSERT INTO submissions (id, name, gender, role, email, stage, assessor, date, started_at, value_scores, total)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (id) DO NOTHING`,
      [e.id, e.name, e.gender || "", e.role || "", e.email || "", e.stage || "", e.assessor || "",
       e.date || new Date().toISOString(), e.startedAt || null, JSON.stringify(e.valueScores), e.total]
      );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("POST /api/submissions failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/submissions", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, gender, role, email, stage, assessor, date, started_at, value_scores, total FROM submissions ORDER BY date DESC"
      );
    res.json(rows.map(rowToEntry));
  } catch (err) {
    console.error("GET /api/submissions failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/submissions/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM submissions WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/submissions/:id failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/submissions", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM submissions");
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/submissions failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/healthz", (req, res) => res.json({ ok: true }));

module.exports = app;
