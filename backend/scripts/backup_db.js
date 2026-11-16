import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/DormitoryDb';
  console.log(`Connecting to ${mongoUri.includes('@') ? mongoUri.replace(/:([^:@]+)@/, ':****@') : mongoUri}...`);
  await mongoose.connect(mongoUri);

  const collections = await mongoose.connection.db.listCollections().toArray();
  const backupData = {};

  for (const col of collections) {
    const data = await mongoose.connection.db.collection(col.name).find({}).toArray();
    backupData[col.name] = data;
    console.log(`- Backed up collection: ${col.name} (${data.length} documents)`);
  }

  const outputPath = path.join(__dirname, '..', 'database_backup.json');
  fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2), 'utf8');

  console.log(`\n========================================`);
  console.log(`Successfully exported all ${collections.length} collections!`);
  console.log(`Backup saved to: ${outputPath}`);
  console.log(`========================================`);

  await mongoose.disconnect();
};

backupDatabase().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
