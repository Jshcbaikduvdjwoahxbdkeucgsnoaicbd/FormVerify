import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false, // Disable automatic body parsing by Next.js
  },
};

export default function handler(req, res) {
  if (req.method === 'POST') {
    const form = new IncomingForm();
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Create upload directory if it does not exist
    }
    form.uploadDir = uploadDir;

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(500).json({ error: 'Error processing the request.' });
      }

      const { discordId, username } = fields;
      const webhookUrl = 'https://discord.com/api/webhooks/1331601134481182782/G_OWUODNWe-D-piXEb_q6BlDQidRQ-gDuijYURYWGhF4Tjw9AZ7hca_4ZizK5prAHcal';

      // Send data to webhook with @everyone mention
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `@everyone\nNew submission:\n**Discord ID**: ${discordId}\n**Username**: ${username}`
        }),
      });

      const oldPath = files.file.filepath;
      const newFileName = `${Date.now()}-${files.file.originalFilename}`;
      const newPath = path.join(uploadDir, newFileName);

      fs.rename(oldPath, newPath, (renameErr) => {
        if (renameErr) {
          console.error('Error saving file:', renameErr);
          return res.status(500).json({ error: 'File upload failed.' });
        }

        res.status(200).json({
          discordId,
          username,
          fileUrl: `/uploads/${newFileName}`,
        });
      });
    });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
