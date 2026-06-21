import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploadBufferToSupabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const attachments = await (db as any).getAttachments();
    return NextResponse.json(attachments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name;
    const mimeType = file.type;
    const size = file.size;

    // Generate unique filename for Supabase
    const uniqueId = crypto.randomUUID();
    const extension = originalName.split('.').pop();
    const filename = `${uniqueId}.${extension}`;

    // Upload to Supabase Storage
    const url = await uploadBufferToSupabase(buffer, filename, mimeType);

    // Determine category
    let category = 'other';
    if (mimeType.startsWith('image/')) category = 'image';
    else if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) category = 'media';
    else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) category = 'document';
    else if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) category = 'archive';

    // Save metadata to DB
    const attachment = await (db as any).createAttachment({
      filename,
      originalName,
      mimeType,
      size,
      url,
      category,
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error: any) {
    console.error('Attachment upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload attachment' }, { status: 500 });
  }
}
