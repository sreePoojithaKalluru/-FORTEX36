import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import emailsRoutes from './routes/emails.js';
import notificationsRoutes from './routes/notifications.js';
import gmailRoutes from './routes/gmail.js';
import { scheduleDeadlineReminders } from './jobs/deadline-reminders.js';
import db from './db/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/emails', emailsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/auth', gmailRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));

scheduleDeadlineReminders();

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
