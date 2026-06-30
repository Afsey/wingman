import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

import { fetchGoogleEvents, createGoogleEvent } from '@/lib/googleCalendar';

export async function GET(req: NextRequest) {
  try {
    const meetings = await db.getMeetings();
    
    // Attempt to fetch Google Calendar events for the admin user
    const adminEmail = 'marketingwithafsal@gmail.com';
    const user = await db.getUserByEmail(adminEmail);
    
    let allMeetings = [...meetings];
    let googleSyncError = false;

    if (user && user.googleAccessToken) {
      try {
        // Fetch events from the start of the current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const googleEvents = await fetchGoogleEvents(user.googleAccessToken, user.googleRefreshToken || undefined, startOfMonth);
        
        // Map google events to Meeting format
        const mappedEvents = googleEvents.map(event => {
          // Skip if this event is already synced and exists in our DB
          if (meetings.some(m => m.googleEventId === event.id)) {
            return null;
          }

          return {
            id: event.id || crypto.randomUUID(), // use gcal ID as our UI ID
            title: event.summary || 'Busy',
            description: event.description || '',
            startTime: (event.start?.dateTime || event.start?.date || new Date().toISOString()) as string,
            endTime: (event.end?.dateTime || event.end?.date || new Date().toISOString()) as string,
            type: 'meeting',
            status: 'scheduled',
            location: event.location || '',
            reminder: 'none',
            userId: user.id,
            googleEventId: event.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }).filter(Boolean) as any[];

        allMeetings = [...allMeetings, ...mappedEvents];
      } catch (gcalError) {
        console.error('Failed to fetch Google Calendar events:', gcalError);
        googleSyncError = true;
        // Continue and just return local meetings if Google sync fails
      }
    }

    // Sort by startTime asc
    const sorted = allMeetings.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return NextResponse.json({ meetings: sorted, googleSyncError });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Try to get admin user
    const adminEmail = 'marketingwithafsal@gmail.com';
    const user = await db.getUserByEmail(adminEmail);
    
    let googleEventId = null;
    
    // If user is connected to Google, push the event
    if (user && user.googleAccessToken) {
      try {
        const gcalEvent = await createGoogleEvent(user.googleAccessToken, user.googleRefreshToken || undefined, body);
        if (gcalEvent && gcalEvent.id) {
          googleEventId = gcalEvent.id;
        }
      } catch (gcalError) {
        console.error('Failed to create event in Google Calendar:', gcalError);
      }
    }

    const meeting = await db.createMeeting({
      title: body.title,
      description: body.description || null,
      startTime: body.startTime,
      endTime: body.endTime,
      type: body.type || 'meeting',
      status: body.status || 'scheduled',
      userId: body.userId || null,
      reminder: body.reminder || null,
      location: body.location || null,
      googleEventId: googleEventId,
    } as any);
    return NextResponse.json(meeting, { status: 201 });
  } catch (error: any) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: 'Failed to create meeting', details: error?.message, stack: error?.stack }, { status: 500 });
  }
}
