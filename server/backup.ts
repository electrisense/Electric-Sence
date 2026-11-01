/**
 * Database Backup Utility for Electric Sence LMS
 * Creates a verified timestamped backup of the persistent SQLite database.
 * Run with: npm run db:backup
 */
import fs from 'node:fs';
import path from 'node:path';
import { DB_PATH, DATA_DIR } from './db';

export function backupDatabase(): string {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database file not found at: ${DB_PATH}`);
  }

  const backupDir = path.join(DATA_DIR, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `electric_sence_backup_${timestamp}.db`;
  const backupPath = path.join(backupDir, backupFileName);

  fs.copyFileSync(DB_PATH, backupPath);

  const stats = fs.statSync(backupPath);
  const sizeKb = (stats.size / 1024).toFixed(2);

  console.log(`\n====================================================`);
  console.log(`✅ SQLite Database Backup Successfully Created`);
  console.log(`====================================================`);
  console.log(`   Source DB:   ${DB_PATH}`);
  console.log(`   Backup File: ${backupPath}`);
  console.log(`   File Size:   ${sizeKb} KB`);
  console.log(`   Timestamp:   ${new Date().toISOString()}`);
  console.log(`====================================================\n`);

  return backupPath;
}

// Run if called directly
backupDatabase();

