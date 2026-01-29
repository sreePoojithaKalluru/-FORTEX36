import { google } from 'googleapis';
import db from '../db/db.js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export function getAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email'
  ];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: Math.random().toString(36).substring(7) // Add state parameter for security
  });
}

export async function saveTokens(userId, tokens) {
  try {
    db.prepare(`
      INSERT OR REPLACE INTO gmail_tokens 
      (user_id, access_token, refresh_token, expiry_date) 
      VALUES (?, ?, ?, ?)
    `).run(
      userId,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expiry_date || new Date(Date.now() + 3600000).toISOString()
    );
    return true;
  } catch (error) {
    console.error('Error saving tokens:', error);
    return false;
  }
}

export async function getUserTokens(userId) {
  try {
    const tokens = db.prepare(`
      SELECT access_token, refresh_token, expiry_date 
      FROM gmail_tokens WHERE user_id = ?
    `).get(userId);
    
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    return null;
  }
}

export async function refreshAccessToken(userId) {
  try {
    const tokens = await getUserTokens(userId);
    if (!tokens || !tokens.refresh_token) {
      throw new Error('No refresh token available');
    }

    oauth2Client.setCredentials({
      refresh_token: tokens.refresh_token
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    
    await saveTokens(userId, {
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token || tokens.refresh_token,
      expiry_date: credentials.expiry_date
    });

    return credentials.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

export async function getUserEmails(userId, maxResults = 10) {
  try {
    const tokens = await getUserTokens(userId);
    if (!tokens) {
      throw new Error('No Gmail tokens found for user');
    }

    // Check if token is expired and refresh if needed
    if (new Date(tokens.expiry_date) < new Date()) {
      const newAccessToken = await refreshAccessToken(userId);
      if (!newAccessToken) {
        throw new Error('Failed to refresh access token');
      }
      tokens.access_token = newAccessToken;
    }

    oauth2Client.setCredentials({
      access_token: tokens.access_token
    });

    // Get list of messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults,
      q: 'in:inbox'
    });

    if (!response.data.messages) {
      return [];
    }

    // Get full message details
    const emails = [];
    for (const message of response.data.messages) {
      const msgDetail = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const headers = msgDetail.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      
      // Extract email body
      let body = '';
      if (msgDetail.data.payload.parts) {
        for (const part of msgDetail.data.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
            break;
          }
        }
      } else if (msgDetail.data.payload.body.data) {
        body = Buffer.from(msgDetail.data.payload.body.data, 'base64').toString('utf-8');
      }

      emails.push({
        id: message.id,
        subject: subject,
        from: from,
        body: body,
        date: date,
        threadId: msgDetail.data.threadId
      });
    }

    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

export async function syncGmailEmails(userId) {
  try {
    const emails = await getUserEmails(userId, 20);
    const syncedEmails = [];

    for (const email of emails) {
      // Check if email already exists
      const existing = db.prepare(`
        SELECT id FROM emails 
        WHERE user_id = ? AND subject = ? AND received_at = ?
      `).get(userId, email.subject, email.date);

      if (!existing) {
        // Insert new email
        const { lastID } = db.prepare(`
          INSERT INTO emails (user_id, subject, body, received_at, is_relevant, relevance_reason, deadline)
          VALUES (?, ?, ?, ?, 0, NULL, NULL)
        `).run(userId, email.subject, email.body, email.date);

        syncedEmails.push({
          id: lastID,
          subject: email.subject,
          from: email.from
        });
      }
    }

    return syncedEmails;
  } catch (error) {
    console.error('Error syncing emails:', error);
    throw error;
  }
}
