import { NextResponse } from 'next/server';
import { optimizeNewsImage } from '@/lib/imageOptimizer';
import crypto from 'crypto';
import * as ftp from 'basic-ftp';
import { Readable } from 'stream';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalSizeKB = Math.round(buffer.length / 1024);

    // Step 1: In-memory optimization using sharp
    const compressedBuffer = await optimizeNewsImage(buffer);
    const compressedSizeKB = Math.round(compressedBuffer.length / 1024);
    const savedKB = originalSizeKB - compressedSizeKB;

    // Step 2: Generate unique filename
    const filename = `news_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.webp`;
    let fileUrl = '';

    // Step 3: Stream directly to Hostinger FTP
    const client = new ftp.Client();
    client.ftp.verbose = false;
    
    try {
      await client.access({
        host: process.env.HOSTINGER_FTP_HOST,
        user: process.env.HOSTINGER_FTP_USER,
        password: process.env.HOSTINGER_FTP_PASSWORD,
        secure: false, // Port 21, explicitly insecure or let basic-ftp handle explicit FTPS if needed
      });
      
      const remotePath = `/public_html/uploads/news/${filename}`;
      
      // We ensure the directory exists before uploading if possible,
      // but usually public_html/uploads/news should be pre-created by admin.
      await client.ensureDir('/public_html/uploads/news');
      
      // Stream buffer directly over FTP
      const readable = Readable.from(compressedBuffer);
      await client.uploadFrom(readable, remotePath);
      
      const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL || 'https://rednewsbharat.live/uploads/news';
      fileUrl = `${mediaUrl}/${filename}`;
      
    } catch (ftpError) {
      console.error('FTP Upload Error:', ftpError);
      return NextResponse.json({ success: false, error: 'Failed to upload to Hostinger FTP' }, { status: 500 });
    } finally {
      // Safely close the FTP connection
      client.close();
    }

    // Step 4: Return JSON payload
    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename,
      savedKB
    });

  } catch (error) {
    console.error('Upload Process Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error during upload' }, { status: 500 });
  }
}
