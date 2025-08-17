// Lightweight Google Calendar helper using Google Identity Services token client

const GIS_SRC = 'https://accounts.google.com/gsi/client';

let gisLoaded = false;
let loadPromise: Promise<void> | null = null;
let tokenClient: any;

async function loadGis(): Promise<void> {
  if (gisLoaded) return;
  if (loadPromise) return loadPromise;
  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

async function getAccessToken(scopes: string[]): Promise<string> {
  await loadGis();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
  if (!clientId) throw new Error('Google Calendar not configured. Set VITE_GOOGLE_CLIENT_ID in your .env');

  return new Promise<string>((resolve, reject) => {
    // @ts-ignore
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: scopes.join(' '),
      callback: (resp: any) => {
        if (resp && resp.access_token) {
          resolve(resp.access_token);
        } else {
          reject(new Error('No access token received'));
        }
      }
    });
    tokenClient.requestAccessToken();
  });
}

export interface CalendarEventInput {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
}

export async function createGoogleCalendarEvent(input: CalendarEventInput): Promise<any> {
  const accessToken = await getAccessToken(['https://www.googleapis.com/auth/calendar.events']);
  const body = {
    summary: input.summary,
    description: input.description || '',
    start: { dateTime: input.start.toISOString() },
    end: { dateTime: input.end.toISOString() },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Calendar error: ${res.status} ${err}`);
  }
  return res.json();
}

// Public helpers to manage connection state
const CALENDAR_FLAG_KEY = 'googleCalendarConnected';

export function isGoogleConnected(): boolean {
  return typeof localStorage !== 'undefined' && !!localStorage.getItem(CALENDAR_FLAG_KEY);
}

export async function connectGoogleCalendar(): Promise<boolean> {
  try {
    // Request a broad calendar scope so subsequent calls can create events
    await getAccessToken(['https://www.googleapis.com/auth/calendar']);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CALENDAR_FLAG_KEY, '1');
    }
    return true;
  } catch (err) {
    return false;
  }
}

export async function ensureGoogleCalendarAuth(): Promise<boolean> {
  if (isGoogleConnected()) return true;
  return connectGoogleCalendar();
}


