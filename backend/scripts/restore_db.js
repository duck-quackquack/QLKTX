import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isIsoDate = (str) => typeof str === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str);

const parseDocument = (doc) => {
  if (!doc || typeof doc !== 'object') return doc;
  if (Array.isArray(doc)) return doc.map(parseDocument);

  const transformed = {};
  for (const [key, val] of Object.entries(doc)) {
    if (key === '_id' && typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)) {
      transformed[key] = new mongoose.Types.ObjectId(val);
    } else if (isIsoDate(val)) {
      transformed[key] = new Date(val);
    } else if (typeof val === 'object' && val !== null) {
      transformed[key] = parseDocument(val);
    } else {
      transformed[key] = val;
    }
  }
  return transformed;
};

const restoreDatabase = async () => {
  const backupPath = path.join(__dirname, '..', 'database_backup.json');
  if (!fs.existsSync(backupPath)) {
    console.error(`Error: Backup file not found at ${backupPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(backupPath, 'utf8');
  const backupData = JSON.parse(rawData);

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/DormitoryDb';
  console.log(`Connecting to ${mongoUri.includes('@') ? mongoUri.replace(/:([^:@]+)@/, ':****@') : mongoUri}...`);
  await mongoose.connect(mongoUri);

  console.log(`Restoring collections into ${mongoose.connection.db.databaseName}...\n`);

  for (const [colName, docs] of Object.entries(backupData)) {
    if (!Array.isArray(docs)) continue;

    const col = mongoose.connection.db.collection(colName);
    await col.deleteMany({}); // Clear existing to prevent duplicate IDs

    if (docs.length > 0) {
      const parsedDocs = docs.map(parseDocument);
      await col.insertMany(parsedDocs);
    }
    console.log(`✔ Restored collection: ${colName} (${docs.length} documents)`);
  }

  console.log(`\n========================================`);
  console.log(`Database successfully restored 100%!`);
  console.log(`========================================`);

  await mongoose.disconnect();
};

restoreDatabase().catch((err) => {
  console.error('Restore failed:', err);
  process.exit(1);
});
