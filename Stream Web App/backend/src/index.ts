import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin
// Make sure GOOGLE_APPLICATION_CREDENTIALS environment variable is set
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'steam-web-app-606e9.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.post('/record', async (req, res) => {
  const { url, userId } = req.body;

  if (!url || !userId) {
    return res.status(400).json({ error: 'URL and userId are required' });
  }

  const recordingId = uuidv4();
  const docRef = db.collection('recordings').doc(recordingId);

  try {
    await docRef.set({
      id: recordingId,
      url,
      userId,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(202).json({ message: 'Recording started', id: recordingId });

    // Start background recording process
    startRecording(url, userId, recordingId, docRef);
  } catch (error) {
    console.error('Error starting recording:', error);
    res.status(500).json({ error: 'Failed to start recording' });
  }
});

async function startRecording(url: string, userId: string, recordingId: string, docRef: admin.firestore.DocumentReference) {
  const outputFilename = `recordings/${recordingId}.mp4`;
  const localFilePath = path.join(__dirname, `../temp_${recordingId}.mp4`);

  await docRef.update({ status: 'recording' });

  // Spawn yt-dlp to download the stream/video
  // -f "bestvideo[height<=720]+bestaudio/best[height<=720]" forces maximum 720p resolution
  const ytdlpArgs = [
    '-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]/best',
    '--merge-output-format', 'mp4',
    '-o', localFilePath,
    url
  ];

  console.log(`Starting yt-dlp for ${recordingId} with url: ${url}`);
  const ytdlpProcess = spawn('yt-dlp', ytdlpArgs);

  ytdlpProcess.stdout.on('data', (data) => {
    console.log(`[yt-dlp ${recordingId}]: ${data}`);
  });

  ytdlpProcess.stderr.on('data', (data) => {
    console.error(`[yt-dlp ${recordingId} ERROR]: ${data}`);
  });

  ytdlpProcess.on('close', async (code) => {
    console.log(`yt-dlp process for ${recordingId} exited with code ${code}`);

    if (code === 0 && fs.existsSync(localFilePath)) {
      try {
        // Upload to Firebase Storage
        console.log(`Uploading ${recordingId} to Firebase Storage...`);
        const [file] = await bucket.upload(localFilePath, {
          destination: `users/${userId}/${outputFilename}`,
          metadata: {
            contentType: 'video/mp4',
          }
        });

        const downloadUrl = await file.getSignedUrl({
          action: 'read',
          expires: '01-01-2100' // Generate a long-lived URL or use Firebase Client SDK to fetch download URL
        });

        // Update Firestore
        await docRef.update({
          status: 'completed',
          downloadUrl: downloadUrl[0],
          completedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Recording ${recordingId} completed successfully.`);
      } catch (uploadError) {
        console.error(`Error uploading ${recordingId}:`, uploadError);
        await docRef.update({ status: 'error', error: 'Upload failed' });
      } finally {
        // Clean up local file
        fs.unlinkSync(localFilePath);
      }
    } else {
      await docRef.update({ status: 'error', error: 'Download failed' });
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
