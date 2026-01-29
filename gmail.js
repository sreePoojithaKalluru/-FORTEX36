import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import db from '../db/db.js';

const router = Router();

// Mock Gmail authorization
router.get('/gmail/auth', requireAuth, (req, res) => {
  try {
    // Return a mock auth URL
    const authUrl = `https://accounts.google.com/oauth/authorize?client_id=mock&redirect_uri=${encodeURIComponent(process.env.GMAIL_REDIRECT_URI)}&response_type=code&scope=email`;
    res.json({ authUrl });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    res.status(500).json({ error: 'Failed to get authorization URL' });
  }
});

// Mock Gmail OAuth callback
router.get('/gmail/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return res.status(400).send(`
        <html>
          <head><title>OAuth Error</title></head>
          <body>
            <h2>OAuth Error: ${error}</h2>
            <p>Please check your Google Cloud Console configuration.</p>
            <p>Error: ${error}</p>
            <script>
              setTimeout(() => window.close(), 5000);
            </script>
          </body>
        </html>
      `);
    }

    if (!code) {
      return res.status(400).send(`
        <html>
          <head><title>Missing Authorization Code</title></head>
          <body>
            <h2>Missing Authorization Code</h2>
            <p>The authorization code was not provided.</p>
            <script>
              setTimeout(() => window.close(), 5000);
            </script>
          </body>
        </html>
      `);
    }

    // Mock successful connection
    console.log('Mock Gmail connected successfully');
    
    res.send(`
      <html>
        <head>
          <title>Gmail Connected</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: #4CAF50; }
            .icon { font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="icon">✅</div>
          <h2 class="success">Gmail Successfully Connected!</h2>
          <p>Your Gmail account has been connected to Email Relevance AI.</p>
          <p>You can now sync your emails for AI analysis.</p>
          <p>This window will close automatically.</p>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in Gmail callback:', error);
    res.status(500).send(`
      <html>
        <head><title>Connection Error</title></head>
        <body>
          <h2>Connection Error</h2>
          <p>Failed to connect Gmail: ${error.message}</p>
          <p>Please check your Google Cloud Console settings.</p>
          <script>
            setTimeout(() => window.close(), 5000);
          </script>
        </body>
      </html>
    `);
  }
});

// Mock Gmail sync with sample emails
router.post('/gmail/sync', requireAuth, async (req, res) => {
  try {
    // Mock sample emails
    const mockEmails = [
      {
        id: 'mock_1',
        subject: 'New Software Development Project',
        body: 'We are looking for experienced developers to join our new project. The deadline for applications is 2024-02-15. This is a great opportunity for software engineers.',
        sender: 'techcompany@example.com',
        date: new Date().toISOString(),
        isRelevant: true,
        reason: 'This email contains relevant information for Software Development professionals',
        deadline: '2024-02-15'
      },
      {
        id: 'mock_2',
        subject: 'Team Meeting Tomorrow',
        body: 'Don\'t forget about our team meeting tomorrow at 2 PM. We will discuss the upcoming project milestones.',
        sender: 'manager@example.com',
        date: new Date().toISOString(),
        isRelevant: true,
        reason: 'Important updates related to Software Development industry',
        deadline: null
      },
      {
        id: 'mock_3',
        subject: 'Weekly Newsletter',
        body: 'Check out this week\'s newsletter with the latest news and updates from around the world.',
        sender: 'newsletter@example.com',
        date: new Date().toISOString(),
        isRelevant: false,
        reason: 'This email is not relevant to your Software Development domain',
        deadline: null
      },
      {
        id: 'mock_4',
        subject: 'Code Review Request',
        body: 'Please review the latest pull request for the authentication module. The code review deadline is 2024-01-25.',
        sender: 'colleague@example.com',
        date: new Date().toISOString(),
        isRelevant: true,
        reason: 'Content aligns with your professional domain in Software Development',
        deadline: '2024-01-25'
      },
      {
        id: 'mock_5',
        subject: 'Security Update Required',
        body: 'Important security update for your development environment. Please update your dependencies by 2024-02-01.',
        sender: 'security@example.com',
        date: new Date().toISOString(),
        isRelevant: true,
        reason: 'Professional development opportunity in Software Development',
        deadline: '2024-02-01'
      }
    ];

    // Save mock emails to database
    for (const email of mockEmails) {
      const existing = db.prepare('SELECT id FROM emails WHERE id = ?').get(email.id);
      if (!existing) {
        db.prepare(`
          INSERT INTO emails (id, user_id, subject, body, sender, date, is_relevant, reason, deadline)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          email.id,
          req.userId,
          email.subject,
          email.body,
          email.sender,
          email.date,
          email.isRelevant,
          email.reason,
          email.deadline
        );
      }
    }

    res.json({ 
      message: 'Emails synced successfully', 
      syncedCount: mockEmails.length,
      emails: mockEmails 
    });
  } catch (error) {
    console.error('Error syncing emails:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mock Gmail connection status
router.get('/gmail/status', requireAuth, async (req, res) => {
  try {
    // Always return connected for demo
    res.json({ 
      connected: true,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking Gmail status:', error);
    res.status(500).json({ error: 'Failed to check Gmail status' });
  }
});

export default router;
