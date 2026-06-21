import { google } from 'googleapis';

// The credentials will be loaded from process.env
// Ensure these exist in .env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI

export function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl(userId: string) {
  const oauth2Client = getGoogleOAuthClient();
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token
    prompt: 'consent', // Force consent prompt to guarantee refresh token is returned
    scope: scopes,
    state: userId, // Pass userId as state to retrieve it in callback
  });
}

// Wrapper for initialized calendar client
export function getCalendarClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = getGoogleOAuthClient();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken || undefined,
  });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function fetchGoogleEvents(accessToken: string, refreshToken?: string, timeMin?: Date, timeMax?: Date) {
  const calendar = getCalendarClient(accessToken, refreshToken);
  
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin ? timeMin.toISOString() : new Date().toISOString(), // Default to today onwards
    timeMax: timeMax ? timeMax.toISOString() : undefined,
    maxResults: 250,
    singleEvents: true,
    orderBy: 'startTime',
  });
  
  return response.data.items || [];
}

export async function createGoogleEvent(accessToken: string, refreshToken: string | undefined, meeting: any) {
  const calendar = getCalendarClient(accessToken, refreshToken);
  
  const event = {
    summary: meeting.title,
    description: meeting.description || '',
    location: meeting.location || '',
    start: {
      dateTime: new Date(meeting.startTime).toISOString(),
      timeZone: 'Asia/Kolkata', // Ideally should be user's timezone
    },
    end: {
      dateTime: new Date(meeting.endTime).toISOString(),
      timeZone: 'Asia/Kolkata',
    },
  };
  
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });
  
  return response.data;
}

export async function updateGoogleEvent(accessToken: string, refreshToken: string | undefined, eventId: string, meeting: any) {
  const calendar = getCalendarClient(accessToken, refreshToken);
  
  const event = {
    summary: meeting.title,
    description: meeting.description || '',
    location: meeting.location || '',
    start: {
      dateTime: new Date(meeting.startTime).toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: new Date(meeting.endTime).toISOString(),
      timeZone: 'Asia/Kolkata',
    },
  };
  
  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId: eventId,
    requestBody: event,
  });
  
  return response.data;
}

export async function deleteGoogleEvent(accessToken: string, refreshToken: string | undefined, eventId: string) {
  const calendar = getCalendarClient(accessToken, refreshToken);
  
  await calendar.events.delete({
    calendarId: 'primary',
    eventId: eventId,
  });
  
  return true;
}
