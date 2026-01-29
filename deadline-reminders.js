import cron from 'node-cron';
import db from '../db/db.js';

/**
 * Daily job: create "3 days before deadline" notifications for emails
 * whose deadline is exactly 3 days from today.
 */
function runDeadlineReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inThree = new Date(today);
  inThree.setDate(inThree.getDate() + 3);
  const deadlineStr = inThree.toISOString().slice(0, 10);

  const emails = db.prepare(
    `SELECT e.id, e.user_id, e.subject, e.deadline, u.domain
     FROM emails e
     JOIN users u ON u.id = e.user_id
     WHERE e.deadline = ? AND e.is_relevant = 1`
  ).all(deadlineStr);

  for (const e of emails) {
    const existing = db.prepare(
      `SELECT id FROM notifications
       WHERE user_id = ? AND email_id = ? AND type = 'deadline_reminder'`
    ).get(e.user_id, e.id);
    if (existing) continue;

    db.prepare(
      `INSERT INTO notifications (user_id, email_id, type, title, message, deadline_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      e.user_id,
      e.id,
      'deadline_reminder',
      `Deadline in 3 days: ${e.subject}`,
      `This email is relevant to your domain (${e.domain}). Action before ${e.deadline}.`,
      e.deadline
    );
  }
}

export function scheduleDeadlineReminders() {
  cron.schedule('0 9 * * *', runDeadlineReminders, { timezone: 'UTC' });
  runDeadlineReminders();
}
