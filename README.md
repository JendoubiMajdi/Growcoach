# GrowCoach - Job Recruitment Platform

A comprehensive job recruitment platform built with Flask (Python) backend and React TypeScript frontend, designed to connect job seekers with employers efficiently.

## 🚀 Features

### For Candidates
- **Account Management**: Register, login, and manage professional profiles
- **Job Search**: Browse and apply for job opportunities
- **Profile Management**: Upload CV, add skills, experience, and education
- **Application Tracking**: Track job application status
- **OAuth Integration**: Login with Google account

### For Companies
- **Company Profiles**: Create and manage company information
- **Job Posting**: Post job openings with detailed descriptions
- **Candidate Management**: Review and manage job applications
- **Application Tracking**: Track hiring process and candidate status

### For Administrators
- **Dashboard**: Monitor platform activity and user metrics
- **User Management**: Manage candidate and company accounts
- **Job Oversight**: Monitor job postings and applications
- **Analytics**: View platform statistics and insights

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: MongoDB with PyMongo
- **Authentication**: JWT with Flask-JWT-Extended
- **Email**: Flask-Mail for notifications
- **Rate Limiting**: Flask-Limiter
- **OAuth**: Google OAuth integration
- **File Upload**: Support for CV and document uploads
- **Security**: Input sanitization and validation

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **HTTP Client**: Fetch API

## 📋 Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16 or higher
- **MongoDB**: 4.4 or higher
- **npm** or **yarn**

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/JendoubiMajdi/Growcoach.git
cd Growcoach
```

### 2. Backend Setup

#### Navigate to Backend Directory
```bash
cd backend
```

#### Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your configuration:
   ```bash
   # Database
   MONGO_URI=mongodb://localhost:27017/growcoach
   
   # JWT Secret
   JWT_SECRET_KEY=your-super-secret-jwt-key-here
   
   # Email Configuration
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@example.com
   MAIL_PASSWORD=your-app-password
   MAIL_DEFAULT_SENDER=your-email@example.com
   
   # OAuth (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

### 3. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd ../client
```

#### Install Dependencies
```bash
npm install
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
python run.py
```
The backend will run on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd client
npm run dev
```
The frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
Growcoach/
├── backend/
│   ├── app/
│   │   ├── __init__.py              # Flask app factory
│   │   ├── models.py                # Database models
│   │   ├── routes/
│   │   │   ├── auth.py              # Authentication routes
│   │   │   ├── candidate.py         # Candidate endpoints
│   │   │   ├── company.py           # Company endpoints
│   │   │   ├── admin.py             # Admin endpoints
│   │   │   ├── job.py               # Job posting endpoints
│   │   │   └── main.py              # Main routes
│   │   └── utils/
│   │       ├── error_handlers.py    # Error handling
│   │       ├── jwt_handlers.py      # JWT token handling
│   │       └── helpers.py           # Utility functions
│   ├── config/
│   │   ├── __init__.py
│   │   └── config.py                # Configuration settings
│   ├── uploads/                     # File uploads directory
│   ├── run.py                       # Application entry point
│   ├── requirements.txt             # Python dependencies
│   └── .env.example                 # Environment variables template
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/               # Admin components
│   │   │   ├── Candidate/           # Candidate components
│   │   │   ├── Company/             # Company components
│   │   │   └── services/            # API services
│   │   ├── context/                 # React context providers
│   │   ├── App.tsx                  # Main App component
│   │   └── main.tsx                 # App entry point
│   ├── public/                      # Static assets
│   ├── package.json                 # Node.js dependencies
│   └── vite.config.ts               # Vite configuration
├── .gitignore                       # Git ignore rules
└── README.md                        # Project documentation
```

## 🔐 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/google` - Google OAuth login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Candidates
- `POST /auth/register` - Register new candidate
- `GET /candidate/profile` - Get candidate profile
- `PUT /candidate/profile` - Update candidate profile
- `POST /candidate/upload-cv` - Upload CV
- `GET /candidate/applications` - Get job applications

### Companies
- `POST /auth/company-register` - Register new company
- `GET /company/profile` - Get company profile
- `PUT /company/profile` - Update company profile
- `GET /company/jobs` - Get company job postings
- `POST /company/jobs` - Create job posting

### Jobs
- `GET /job/search` - Search jobs
- `GET /job/:id` - Get job details
- `POST /job/:id/apply` - Apply for job

### Admin
- `GET /admin/dashboard` - Admin dashboard data
- `GET /admin/users` - Get all users
- `GET /admin/jobs` - Get all jobs
- `GET /admin/applications` - Get all applications

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd client
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### Frontend
```bash
cd client
npm run build
```

## 🔧 Configuration

### Database Setup
1. Install MongoDB
2. Create a database named `growcoach`
3. Update `MONGO_URI` in your `.env` file

### Email Configuration
1. Enable 2FA on your Gmail account
2. Generate an app password
3. Update email settings in `.env`

### OAuth Setup (Optional)
1. Create a Google Cloud project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

## 🚀 Deployment

### Backend Deployment
- Configure environment variables for production
- Use a production WSGI server like Gunicorn
- Set up reverse proxy with Nginx
- Configure SSL certificates

### Frontend Deployment
- Build the production version
- Deploy to static hosting service (Netlify, Vercel, etc.)
- Configure environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Majdi Jendoubi** - *Initial work* - [JendoubiMajdi](https://github.com/JendoubiMajdi)

## 📞 Support

For support, email majdi.jendoubi@esprit.tn or create an issue in the GitHub repository.

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Video interview integration
- [ ] AI-powered job matching
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with LinkedIn
- [ ] Automated screening questionnaires
