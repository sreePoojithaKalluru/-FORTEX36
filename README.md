# Email Relevance AI System

A full-stack application that uses AI to categorize emails based on professional domains and sends timely deadline notifications.

## 🚀 Features

### Core Functionality
- **AI-Powered Email Analysis**: Automatically analyzes emails to determine relevance based on user's professional domain
- **Domain-Based Registration**: Users register with their professional domain for accurate categorization
- **3-Day Deadline Notifications**: Automatic notifications sent 3 days before email deadlines
- **Smart Filtering**: Filter emails by relevance and search functionality
- **Real-time Notifications**: Track and manage notifications for relevant emails

### User Features
- **Secure Authentication**: JWT-based login and registration system
- **Dashboard**: Overview of email statistics and recent activity
- **Email Management**: Add, view, and categorize emails
- **Notification Center**: Manage deadline reminders and relevant email alerts
- **Professional Domains**: Support for various professional fields

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** with better-sqlite3 for database
- **JWT** for authentication
- **OpenAI API** for AI-powered email analysis
- **node-cron** for scheduled deadline reminders
- **bcryptjs** for password hashing

### Frontend
- **React** with modern hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication

## 📋 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```
   PORT=4000
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

4. **Initialize database**
   ```bash
   npm run init-db
   ```

5. **Start backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start frontend development server**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 🏗️ Project Structure

```
email/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── db.js          # Database connection
│   │   │   └── init.js        # Database initialization
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js        # Authentication routes
│   │   │   ├── user.js        # User profile routes
│   │   │   ├── emails.js      # Email management routes
│   │   │   └── notifications.js # Notification routes
│   │   ├── services/
│   │   │   └── ai.js          # OpenAI integration
│   │   ├── jobs/
│   │   │   └── deadline-reminders.js # Scheduled jobs
│   │   └── index.js           # Express app entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── EmailList.js
│   │   │   └── Notifications.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### User
- `GET /api/user/profile` - Get user profile

### Emails
- `POST /api/emails` - Add new email
- `GET /api/emails` - Get user emails (with optional filters)
- `GET /api/emails/:id` - Get specific email

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

## 🤖 AI Integration

The system uses OpenAI's GPT-4o-mini model to:
1. **Analyze Email Relevance**: Determine if an email is relevant to the user's professional domain
2. **Extract Deadlines**: Identify and extract deadline dates from email content
3. **Provide Context**: Explain why an email is relevant to the user's domain

### AI Prompt Structure
The AI analyzes emails based on:
- User's professional domain
- Email subject and body content
- Contextual relevance to the domain
- Deadline extraction and formatting

## 📅 Notification System

### Deadline Reminders
- **3-Day Advance Warning**: Automatic notifications sent 3 days before deadlines
- **Daily Job Processing**: Scheduled job runs daily at 9 AM UTC
- **Smart Filtering**: Only processes relevant emails with deadlines
- **Duplicate Prevention**: Avoids sending multiple reminders for the same deadline

### Notification Types
1. **Deadline Reminders**: 3-day advance warnings for upcoming deadlines
2. **Relevant Email Alerts**: Notifications for newly categorized relevant emails

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Using parameterized queries

## 🎯 Supported Professional Domains

The system supports various professional domains including:
- Software Development
- Healthcare
- Finance
- Education
- Marketing
- Legal
- Engineering
- Sales
- Human Resources
- Customer Support
- Design
- Research
- Operations
- Consulting
- Other (custom domains)

## 🚀 Usage

1. **Register**: Create an account with your email and professional domain
2. **Add Emails**: Manually add emails or integrate with email services
3. **AI Analysis**: System automatically analyzes email relevance
4. **Monitor**: Check dashboard for statistics and recent activity
5. **Notifications**: Receive timely deadline reminders and relevant email alerts

## 🔄 Development

### Running in Development Mode
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm start
```

### Database Reset
```bash
cd backend && npm run init-db
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=4000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=sk-your-openai-api-key
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure the data directory exists
   - Run `npm run init-db` to initialize database

2. **OpenAI API Errors**
   - Verify your API key is correct
   - Check API quota and billing

3. **Frontend Build Issues**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

4. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Future Enhancements

- **Email Service Integration**: Gmail, Outlook, etc.
- **Mobile App**: React Native application
- **Advanced AI Features**: Custom AI models for specific domains
- **Team Collaboration**: Multi-user workspaces
- **Email Templates**: Pre-built templates for different domains
- **Analytics Dashboard**: Advanced email analytics and insights
