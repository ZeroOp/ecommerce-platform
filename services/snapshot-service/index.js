// services/snapshot-service/index.js
const { exec } = require('child_process');
const cron = require('node-cron');
const Minio = require('minio');
const fs = require('fs');
const path = require('path');

// --- Configuration from Environment Variables ---

// Product Database
const PRODUCT_DB_HOST = process.env.PRODUCT_DB_HOST || 'product-db-cluster-rw';
const PRODUCT_DB_USER = process.env.PRODUCT_DB_USER || 'product_admin';
const PRODUCT_DB_PASSWORD = process.env.PRODUCT_DB_PASSWORD; // Must be set
const PRODUCT_DB_NAME = process.env.PRODUCT_DB_NAME || 'product_db';

// Identity Database
const IDENTITY_DB_HOST = process.env.IDENTITY_DB_HOST || 'identity-db-cluster-rw';
const IDENTITY_DB_USER = process.env.IDENTITY_DB_USER || 'identity_admin';
const IDENTITY_DB_PASSWORD = process.env.IDENTITY_DB_PASSWORD; // Must be set
const IDENTITY_DB_NAME = process.env.IDENTITY_DB_NAME || 'identity_db';

// MinIO Configuration
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'redstore.zeroop.dev';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY; // Must be set
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY; // Must be set
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'redstore-main';
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true' || MINIO_ENDPOINT.startsWith('https://');

// --- MinIO Client Initialization ---
const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT.replace(/https?:\/\//, ''), // Remove http/https for MinIO client
  port: MINIO_USE_SSL ? 443 : 9000, // Default MinIO port, adjust if different
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

// --- Helper Functions ---

async function uploadFileToMinio(filePath, objectName) {
  try {
    const fileStream = fs.createReadStream(filePath);
    const fileStat = fs.statSync(filePath);
    await minioClient.putObject(MINIO_BUCKET, objectName, fileStream, fileStat.size);
    console.log(`Successfully uploaded ${objectName} to MinIO bucket ${MINIO_BUCKET}`);
  } catch (error) {
    console.error(`Error uploading ${objectName} to MinIO:`, error);
    throw error;
  } finally {
    // Clean up the local file after upload
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting local file ${filePath}:`, err);
      else console.log(`Deleted local file ${filePath}`);
    });
  }
}

function takePgDump(dbHost, dbUser, dbPassword, dbName, fileName) {
  return new Promise((resolve, reject) => {
    const dumpPath = path.join('/tmp', fileName); // Use /tmp for temporary files
    const command = `PGPASSWORD=${dbPassword} pg_dump -h ${dbHost} -U ${dbUser} -d ${dbName} > ${dumpPath}`;

    console.log(`Starting pg_dump for ${dbName} to ${dumpPath}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`pg_dump for ${dbName} failed: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`pg_dump for ${dbName} warnings: ${stderr}`);
      }
      console.log(`pg_dump for ${dbName} completed successfully.`);
      resolve(dumpPath);
    });
  });
}

async function performSnapshot(dbType, dbHost, dbUser, dbPassword, dbName) {
  if (!dbPassword) {
    console.error(`Skipping ${dbType} snapshot: Database password not provided.`);
    return;
  }
  if (!MINIO_ACCESS_KEY || !MINIO_SECRET_KEY) {
    console.error(`Skipping ${dbType} snapshot: MinIO credentials not provided.`);
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${dbType}-${dbName}-snapshot-${timestamp}.sql`;
  const objectName = `db-snapshots/${dbType}/${fileName}`;

  try {
    const dumpFilePath = await takePgDump(dbHost, dbUser, dbPassword, dbName, fileName);
    await uploadFileToMinio(dumpFilePath, objectName);
  } catch (error) {
    console.error(`Failed to complete snapshot for ${dbType} database:`, error);
  }
}

// --- Main Snapshot Task ---
async function runSnapshotTask() {
  console.log(`[${new Date().toISOString()}] Starting scheduled database snapshot task...`);

  // Check if MinIO bucket exists, create if not
  try {
    const exists = await minioClient.bucketExists(MINIO_BUCKET);
    if (!exists) {
      console.log(`MinIO bucket '${MINIO_BUCKET}' does not exist. Creating it...`);
      await minioClient.makeBucket(MINIO_BUCKET, 'us-east-1'); // Default region, adjust if needed
      console.log(`MinIO bucket '${MINIO_BUCKET}' created successfully.`);
    }
  } catch (error) {
    console.error(`Error checking/creating MinIO bucket '${MINIO_BUCKET}':`, error);
    // Continue, as the upload might still work if the bucket exists but check failed
  }

  await performSnapshot(
    'product',
    PRODUCT_DB_HOST,
    PRODUCT_DB_USER,
    PRODUCT_DB_PASSWORD,
    PRODUCT_DB_NAME
  );

  await performSnapshot(
    'identity',
    IDENTITY_DB_HOST,
    IDENTITY_DB_USER,
    IDENTITY_DB_PASSWORD,
    IDENTITY_DB_NAME
  );

  console.log(`[${new Date().toISOString()}] Database snapshot task finished.`);
}

// --- Schedule the Task ---
// Schedule to run every 2 hours (e.g., at minute 0 of every 2nd hour)
// Cron string: '0 */2 * * *'
// For testing, you might want to run it more frequently, e.g., every minute: '* * * * *'
const CRON_SCHEDULE = process.env.SNAPSHOT_CRON_SCHEDULE || '0 */2 * * *';

console.log(`Snapshot service started. Scheduling task with cron: '${CRON_SCHEDULE}'`);
cron.schedule(CRON_SCHEDULE, runSnapshotTask, {
  scheduled: true,
  timezone: 'Etc/UTC' // Or your desired timezone
});

// Run immediately on startup for initial check/snapshot
runSnapshotTask();
