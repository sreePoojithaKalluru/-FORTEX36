import { Router } from 'express';
import db from '../db/db.js';
import { requireAuth } from '../middleware/auth.js';
import { analyzeEmailRelevance } from '../services/ai.js';

const router = Router();
router.use(requireAuth);

router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { subject, body, receivedAt } = req.body;
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }
    const user = db.prepare('SELECT domain FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { isRelevant, reason, deadline } = await analyzeEmailRelevance(
      subject,
      body || '',
      user.domain
    );

    const received = receivedAt || new Date().toISOString();
    const { lastID } = db.prepare(
      `INSERT INTO emails (user_id, subject, body, received_at, is_relevant, relevance_reason, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(userId, subject, body || '', received, isRelevant ? 1 : 0, reason, deadline);

    const email = db.prepare('SELECT * FROM emails WHERE id = ?').get(lastID);

    if (isRelevant && deadline) {
      const deadlineDate = new Date(deadline + 'T23:59:59');
      const threeDaysBefore = new Date(deadlineDate);
      threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
      db.prepare(
        `INSERT INTO notifications (user_id, email_id, type, title, message, deadline_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        userId,
        lastID,
        'deadline_reminder',
        `Deadline in 3 days: ${subject}`,
        `This email is relevant to your domain (${user.domain}). Deadline: ${deadline}. ${reason}`,
        deadline
      );
    }

    if (isRelevant && !deadline) {
      db.prepare(
        `INSERT INTO notifications (user_id, email_id, type, title, message)
         VALUES (?, ?, ?, ?, ?)`
      ).run(
        userId,
        lastID,
        'relevant',
        `Relevant to you: ${subject}`,
        `Related to your domain (${user.domain}). ${reason}`
      );
    }

    return res.status(201).json({
      email,
      analysis: { isRelevant, reason, deadline },
    });
  } catch (e) {
    console.error('Add email error:', e);
    return res.status(500).json({ error: 'Failed to process email' });
  }
});

router.get('/', (req, res) => {
  try {
    const userId = req.userId;
    const onlyRelevant = req.query.relevant === 'true';
    let sql = 'SELECT * FROM emails WHERE user_id = ?';
    const params = [userId];
    if (onlyRelevant) {
      sql += ' AND is_relevant = 1';
    }
    sql += ' ORDER BY received_at DESC';
    const emails = db.prepare(sql).all(...params);
    return res.json(emails);
  } catch (e) {
    console.error('List emails error:', e);
    return res.status(500).json({ error: 'Failed to list emails' });
  }
});

router.get('/:id', (req, res) => {
  const userId = req.userId;
  const email = db.prepare('SELECT * FROM emails WHERE id = ? AND user_id = ?').get(
    req.params.id,
    userId
  );
  if (!email) return res.status(404).json({ error: 'Email not found' });
  return res.json(email);
});

export default router;
