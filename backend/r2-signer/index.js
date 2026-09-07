import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Client, Account } from 'node-appwrite';
import crypto from 'crypto';

// Initialize S3 Client targeting Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'my-library-vault';
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || '';

export default async ({ req, res, log, error }) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Appwrite-JWT',
  };

  if (req.method === 'OPTIONS') {
    return res.text('', 204, corsHeaders);
  }

  try {
    // 1. Verify User Authentication via Appwrite JWT
    const jwt = req.headers['x-appwrite-jwt'] || req.headers['authorization']?.replace('Bearer ', '');
    if (!jwt) {
      return res.json({ error: 'Unauthorized: Appwrite JWT token is required' }, 401, corsHeaders);
    }

    const appwriteClient = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '')
      .setJWT(jwt);

    const account = new Account(appwriteClient);
    const user = await account.get();
    const userId = user.$id;

    const path = req.path || '/';

    // 2. Generate Presigned Upload PUT URL
    if (path.includes('/upload-url') && req.method === 'POST') {
      const { fileName, fileType, category } = JSON.parse(req.body || '{}');
      if (!fileName || !fileType || !category) {
        return res.json({ error: 'fileName, fileType, and category are required.' }, 400, corsHeaders);
      }

      // Safe isolated file key: {userId}/{category}/{uniqueId}_{sanitizedFileName}
      const uniqueId = crypto.randomBytes(8).toString('hex');
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileKey = `${userId}/${category}/${uniqueId}_${sanitizedName}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 }); // 15 minutes
      const publicUrl = PUBLIC_DOMAIN ? `${PUBLIC_DOMAIN}/${fileKey}` : '';

      return res.json({ uploadUrl, fileKey, publicUrl }, 200, corsHeaders);
    }

    // 3. Generate Presigned Download GET URL (for private files like PDFs or APKs)
    if (path.includes('/download-url') && req.method === 'GET') {
      const key = req.query?.key;
      if (!key) {
        return res.json({ error: 'Object key is required.' }, 400, corsHeaders);
      }

      // Ensure user can only access their own user directory
      if (!key.startsWith(`${userId}/`)) {
        return res.json({ error: 'Forbidden: You cannot access files outside your personal vault.' }, 403, corsHeaders);
      }

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const downloadUrl = await getSignedUrl(r2Client, command, { expiresIn: 1800 }); // 30 minutes
      return res.json({ url: downloadUrl }, 200, corsHeaders);
    }

    // 4. Delete File Handler (Cleanup orphaned files)
    if (path.includes('/delete-file') && req.method === 'DELETE') {
      const { key } = JSON.parse(req.body || '{}');
      if (!key || !key.startsWith(`${userId}/`)) {
        return res.json({ error: 'Invalid or forbidden object key.' }, 400, corsHeaders);
      }

      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        })
      );

      return res.json({ success: true, message: 'File deleted from Cloudflare R2.' }, 200, corsHeaders);
    }

    return res.json({ error: 'Endpoint not found.' }, 404, corsHeaders);
  } catch (err) {
    error('R2 Signer Error: ' + err.message);
    return res.json({ error: err.message || 'Internal Server Error' }, 500, corsHeaders);
  }
};
