import { Router } from 'express';
import db from '../db/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  try {
    const userId = req.userId;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const unreadOnly = req.query.unread === 'true';
    let sql = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];
    if (unreadOnly) {
      sql += ' AND read_at IS NULL';
    }
    sql += ' ORDER BY created_at DESC';
    if (limit) {
      sql += ' LIMIT ?';
      params.push(limit);
    }
    const list = db.prepare(sql).all(...params);
    return res.json(list);
  } catch (e) {
    console.error('List notifications error:', e);
    return res.status(500).json({ error: 'Failed to list notifications' });
  }
});

router.put('/:id/read', (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  const n = db.prepare('SELECT id FROM notifications WHERE id = ? AND user_id = ?').get(id, userId);
  if (!n) return res.status(404).json({ error: 'Notification not found' });
  db.prepare('UPDATE notifications SET read_at = datetime(\'now\') WHERE id = ?').run(id);
  return res.json({ ok: true });
});

router.patch('/:id/read', (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  const n = db.prepare('SELECT id FROM notifications WHERE id = ? AND user_id = ?').get(id, userId);
  if (!n) return res.status(404).json({ error: 'Notification not found' });
  db.prepare('UPDATE notifications SET read_at = datetime(\'now\') WHERE id = ?').run(id);
  return res.json({ ok: true });
});

router.put('/read-all', (req, res) => {
  const userId = req.userId;
  db.prepare('UPDATE notifications SET read_at = datetime(\'now\') WHERE user_id = ? AND read_at IS NULL').run(userId);
  return res.json({ ok: true });
});

router.patch('/read-all', (req, res) => {
  const userId = req.userId;
  db.prepare('UPDATE notifications SET read_at = datetime(\'now\') WHERE user_id = ? AND read_at IS NULL').run(userId);
  return res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  const n = db.prepare('SELECT id FROM notifications WHERE id = ? AND user_id = ?').get(id, userId);
  if (!n) return res.status(404).json({ error: 'Notification not found' });
  db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
  return res.json({ ok: true });
});

export default router;
