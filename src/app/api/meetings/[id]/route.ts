import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { updateGoogleEvent, deleteGoogleEvent } from '@/lib/googleCalendar';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.startTime !== undefined) updates.startTime = body.startTime;
    if (body.endTime !== undefined) updates.endTime = body.endTime;
    if (body.type !== undefined) updates.type = body.type;
    if (body.status !== undefined) updates.status = body.status;
    if (body.reminder !== undefined) updates.reminder = body.reminder;
    if (body.location !== undefined) updates.location = body.location;
    if (body.userId !== undefined) updates.userId = body.userId;

    const adminEmail = 'marketingwithafsal@gmail.com';
    const user = await db.getUserByEmail(adminEmail);
    
    // Check if the meeting exists in our DB
    const meetings = await db.getMeetings();
    const existingDbMeeting = meetings.find(m => m.id === id);

    let updatedMeeting;

    if (existingDbMeeting) {
      // It's a DB meeting. Update it in DB.
      updatedMeeting = await db.updateMeeting(id, updates as any);

      // If it's linked to Google Calendar, update there too
      if (existingDbMeeting.googleEventId && user?.googleAccessToken) {
        try {
          // We pass the full updated meeting object
          await updateGoogleEvent(user.googleAccessToken, user.googleRefreshToken || undefined, existingDbMeeting.googleEventId, updatedMeeting);
        } catch (e) {
          console.error('Failed to update Google Calendar event:', e);
        }
      }
    } else {
      // It's likely a Google Calendar event that doesn't exist in our DB
      if (user?.googleAccessToken) {
        try {
          await updateGoogleEvent(user.googleAccessToken, user.googleRefreshToken || undefined, id, body);
          // Return a mock meeting object so UI updates immediately
          return NextResponse.json({ ...body, id });
        } catch (e) {
          console.error('Failed to update standalone Google Calendar event:', e);
          return NextResponse.json({ error: 'Failed to update Google Calendar event' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      }
    }

    return NextResponse.json(updatedMeeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const adminEmail = 'marketingwithafsal@gmail.com';
    const user = await db.getUserByEmail(adminEmail);

    const meetings = await db.getMeetings();
    const existingDbMeeting = meetings.find(m => m.id === id);

    if (existingDbMeeting) {
      // Delete from DB
      await db.deleteMeeting(id);
      
      // If linked to GCal, delete from GCal
      if (existingDbMeeting.googleEventId && user?.googleAccessToken) {
        try {
          await deleteGoogleEvent(user.googleAccessToken, user.googleRefreshToken || undefined, existingDbMeeting.googleEventId);
        } catch (e) {
          console.error('Failed to delete Google Calendar event:', e);
        }
      }
    } else {
      // It might be a standalone GCal event
      if (user?.googleAccessToken) {
        try {
          await deleteGoogleEvent(user.googleAccessToken, user.googleRefreshToken || undefined, id);
        } catch (e) {
          console.error('Failed to delete standalone Google Calendar event:', e);
          return NextResponse.json({ error: 'Failed to delete Google Calendar event' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
  }
}
