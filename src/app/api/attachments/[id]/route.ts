import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deleteFileFromSupabase } from '@/lib/supabaseClient';

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    
    // Get all attachments to find the one we need
    const attachments = await (db as any).getAttachments();
    const attachment = attachments.find((a: any) => a.id === id);
    
    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Attempt to delete from Supabase Storage, but don't fail if it's already gone
    try {
      await deleteFileFromSupabase(attachment.filename);
    } catch (supabaseError) {
      console.log('File might already be deleted from Supabase:', supabaseError);
    }

    // Delete metadata from DB
    await (db as any).deleteAttachment(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Attachment deletion error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete attachment' }, { status: 500 });
  }
}
