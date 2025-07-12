import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Initialize database
const dbPath = path.join(process.cwd(), 'app/db/playgrounds.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS playgrounds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS queries (
    id TEXT PRIMARY KEY,
    playground_id TEXT NOT NULL,
    query TEXT NOT NULL,
    result TEXT,
    status TEXT DEFAULT 'success',
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playground_id) REFERENCES playgrounds (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_tables (
    id TEXT PRIMARY KEY,
    playground_id TEXT NOT NULL,
    table_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playground_id) REFERENCES playgrounds (id) ON DELETE CASCADE
  );
`);

// Sample data setup
const sampleDataDb = new Database(':memory:');
sampleDataDb.exec(`
  CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT,
    salary INTEGER,
    hire_date DATE
  );

  CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    budget INTEGER
  );

  INSERT INTO departments (name, budget) VALUES 
    ('Engineering', 1000000),
    ('Marketing', 500000),
    ('Sales', 750000),
    ('HR', 300000);

  INSERT INTO employees (name, department, salary, hire_date) VALUES 
    ('John Doe', 'Engineering', 85000, '2022-01-15'),
    ('Jane Smith', 'Marketing', 65000, '2021-03-20'),
    ('Bob Johnson', 'Engineering', 92000, '2020-07-10'),
    ('Alice Brown', 'Sales', 58000, '2023-02-01'),
    ('Charlie Wilson', 'HR', 55000, '2021-11-05'),
    ('Diana Davis', 'Engineering', 78000, '2022-05-12'),
    ('Eve Miller', 'Marketing', 62000, '2023-01-08'),
    ('Frank Garcia', 'Sales', 71000, '2022-09-15');
`);

export interface Playground {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Query {
  id: string;
  playground_id: string;
  query: string;
  result: string;
  status: 'success' | 'error';
  executed_at: string;
}

export interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTime: number;
}

export class DatabaseManager {
  static getPlaygrounds(): Playground[] {
    const stmt = db.prepare('SELECT * FROM playgrounds ORDER BY updated_at DESC');
    return stmt.all() as Playground[];
  }

  static createPlayground(name: string): Playground {
    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO playgrounds (id, name) VALUES (?, ?)');
    stmt.run(id, name);
    return this.getPlayground(id)!;
  }

  static getPlayground(id: string): Playground | null {
    const stmt = db.prepare('SELECT * FROM playgrounds WHERE id = ?');
    return stmt.get(id) as Playground | null;
  }

  static updatePlayground(id: string, name: string): void {
    const stmt = db.prepare('UPDATE playgrounds SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(name, id);
  }

  static deletePlayground(id: string): void {
    const stmt = db.prepare('DELETE FROM playgrounds WHERE id = ?');
    stmt.run(id);
  }

  static getQueries(playgroundId: string): Query[] {
    const stmt = db.prepare('SELECT * FROM queries WHERE playground_id = ? ORDER BY executed_at DESC LIMIT 50');
    return stmt.all(playgroundId) as Query[];
  }

 static executeQuery(playgroundId: string, query: string): QueryResult {
  const startTime = Date.now();
  let result: QueryResult;

  try {
    const stmt = sampleDataDb.prepare(query);
    let rows: any[] = [];
    let columns: string[] = [];

    if (query.trim().toLowerCase().startsWith('select')) {
      rows = stmt.all();
      columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    } else {
      stmt.run();
      rows = [{ message: 'Query executed successfully' }];
      columns = ['message'];
    }

    result = {
      columns,
      rows,
      rowCount: rows.length,
      executionTime: Date.now() - startTime
    };

    this.storeQuery(playgroundId, query, JSON.stringify(result), 'success');
  } catch (error) {
    result = {
      columns: [],
      rows: [],
      rowCount: 0,
      executionTime: Date.now() - startTime
    };
    this.storeQuery(playgroundId, query, (error as Error).message, 'error');
    throw error;
  }

  return result;
}


  private static storeQuery(playgroundId: string, query: string, result: string, status: 'success' | 'error'): void {
    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO queries (id, playground_id, query, result, status) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, playgroundId, query, result, status);
  }
}
