SIH Registration Portal website

A comprehensive backend system for the Smart India Hackathon (SIH) registration portal built with Next.js API Routes, MongoDB, Firebase Authentication, and Cloudinary for file storage.

## 🏗️ Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK + Custom JWT
- **File Storage**: Cloudinary
- **Email**: Nodemailer (SMTP)
- **File Processing**: multer, xlsx for Excel processing
- **Validation**: Custom validation utilities

### User Roles

- **Team Leader**: Can register teams, access team portal, submit tasks
- **Admin/Evaluator**: Manage teams, problem statements, assign tasks, send emails
- **Team Members**: Information collected during registration (no login required)

## 📁 Project Structure

```
├── app/api/                          # API Routes
│   ├── auth/                         # Authentication endpoints
│   │   ├── admin-register/           # Admin registration
│   │   └── verify/                   # User verification
│   ├── admin/                        # Admin-only endpoints
│   │   ├── teams/                    # Team management
│   │   ├── problem-statements/       # PS management
│   │   └── tasks/                    # Task management
│   ├── problem-statements/           # Public PS endpoints
│   ├── teamRegistration/             # Team registration
│   └── upload/                       # File upload utility
├── lib/                              # Core utilities
│   ├── firebase-admin.ts             # Firebase config
│   ├── mongodb.ts                    # Database connection
│   ├── middleware/                   # Auth middleware
│   └── utils/                        # Utility functions
└── models/                           # Database models
    ├── User.ts                       # User model
    ├── Team.ts                       # Team model
    ├── ProblemStatement.ts           # Problem Statement model
    └── Task.ts                       # Task model
```

## 🔧 Environment Setup

Create a `.env.local` file with the following variables:

```env
# MongoDB Atlas (M0 Free Tier - Perfect for 50 teams!)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sih-reg?retryWrites=true&w=majority

# OR MongoDB Local (For Development)
# MONGODB_URI=mongodb://localhost:27017/sih-reg
# Firebase Configuration
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sih-reg

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Admin Registration Secret Keys (Role-Based)
EVALUATOR_REGISTRATION_SECRET=your-evaluator-secret-key
SUPER_ADMIN_REGISTRATION_SECRET=your-super-admin-secret-key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=SIH Registration <your-email@gmail.com>
```

## 🗄️ Database Models

### User Model

```typescript
interface IUser {
  email: string;
  name: string;
  role: "leader" | "admin";
  firebaseUid: string;
  team?: ObjectId; // Reference to Team
}
```

### Team Model

```typescript
interface ITeam {
  teamName: string;
  leader: ObjectId; // Reference to User
  members: ITeamMember[]; // Array of 5 members
  problemStatement: ObjectId; // Reference to ProblemStatement
  status: "registered" | "selected" | "rejected" | "finalist";
  tasks: ITaskSubmission[];
}
```

### Problem Statement Model

```typescript
interface IProblemStatement {
  psNumber: string;
  title: string;
  description: string;
  domain: string;
  link: string;
  teamCount: number;
  maxTeams: number; // Default: 3
  isActive: boolean;
}
```

### Task Model

```typescript
interface ITask {
  title: string;
  description: string;
  fields: ITaskField[]; // Dynamic form fields
  assignedTo: ObjectId[]; // Array of Team references
  dueDate?: Date;
  isActive: boolean;
  createdBy: ObjectId; // Reference to admin User
}
```

## 🔐 Authentication Flow

### Team Leader (Google OAuth)

1. User signs in with Google
2. Firebase returns user info
3. Backend creates/updates User record with role 'leader'
4. JWT token issued for API access

### Admin (Email/Password + Role-Based Secret Key)

1. Admin provides email, password, and secret key
2. Backend validates secret key and determines role:
   - `EVALUATOR_REGISTRATION_SECRET` → creates evaluator account
   - `SUPER_ADMIN_REGISTRATION_SECRET` → creates super-admin account
3. Firebase user created with email/password
4. User record created with appropriate role
5. Custom token generated for immediate login

## 📝 API Endpoints

### Authentication

- `POST /api/auth/admin-register` - Register admin account
- `GET /api/auth/verify` - Verify current user
- `POST /api/auth/verify` - Sync user after Google OAuth

### Team Management

- `POST /api/teamRegistration` - Register new team
- `GET /api/teamRegistration` - Get leader's team info

### Problem Statements

- `GET /api/problem-statements` - Get available problem statements
- `GET /api/admin/problem-statements` - Admin: Get all PSs
- `POST /api/admin/problem-statements` - Admin: Bulk upload PSs
- `PUT /api/admin/problem-statements` - Admin: Toggle PS active status
- `GET /api/admin/problem-statements/template` - Download Excel template

### Team Administration

- `GET /api/admin/teams` - Get all teams (with pagination/filtering)
- `PUT /api/admin/teams` - Update team status

### Task Management

- `GET /api/admin/tasks` - Get all tasks
- `POST /api/admin/tasks` - Create and assign tasks
- `PUT /api/admin/tasks` - Update task status

### File Upload

- `POST /api/upload` - Upload files to Cloudinary

## 🎯 Key Features

### Team Registration Validation

- **Team Size**: Exactly 6 members (1 leader + 5 members)
- **Gender Diversity**: At least 1 female member required
- **Unique Constraints**: Team name, member emails must be unique
- **Problem Statement Availability**: Max 3 teams per PS

### Admin Features

- **Bulk Problem Statement Upload**: Excel/CSV file processing
- **Dynamic Task Creation**: Configurable form fields
- **Team Status Management**: Update registration status
- **Email Notifications**: Automated emails for registration/tasks

### Security & Validation

- **Firebase Authentication**: Secure token-based auth
- **Input Sanitization**: All user inputs validated and sanitized
- **File Upload Security**: Type and size validation
- **Rate Limiting**: Built-in protection (can be added)

## 📧 Email Notifications

### Registration Confirmation

Sent automatically when team registers successfully:

- Team details confirmation
- Problem statement information
- Next steps guidance

### Task Assignment

Sent when admin assigns tasks to teams:

- Task title and description
- Due date (if specified)
- Portal login instructions

## 📊 Problem Statement Management

### Excel Template Format

```
| psNumber | title | description | domain | link | maxTeams |
|----------|-------|-------------|--------|------|----------|
| SIH001   | ...   | ...         | ...    | ...  | 3        |
```

### Bulk Upload Process

1. Admin downloads template from `/api/admin/problem-statements/template`
2. Fills in problem statement data
3. Uploads via admin panel
4. System validates and imports data
5. Duplicate detection and error reporting

## 🔧 Development Setup

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd sih-reg
   npm install
   ```

2. **Environment Configuration**

   - Copy `.env.example` to `.env.local`
   - Update all environment variables

3. **Firebase Setup**

   - Create Firebase project
   - Enable Authentication (Google Sign-In, Email/Password)
   - Download service account key
   - Place in `lib/firebase-admin-key.json`

4. **MongoDB Setup**

   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in environment

5. **Cloudinary Setup**

   - Create Cloudinary account
   - Get API credentials
   - Update environment variables

6. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🚀 Production Deployment

### Environment Variables

Ensure all production environment variables are properly configured:

- Strong JWT secrets
- Production MongoDB connection string
- Verified email SMTP settings
- Cloudinary production credentials

### Security Considerations

- Use HTTPS in production
- Implement rate limiting
- Regular security audits
- Monitor file upload sizes
- Validate all user inputs

## 🧪 Testing

### API Testing

```bash
# Test admin registration (evaluator)
curl -X POST http://localhost:3000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Evaluator","email":"evaluator@test.com","password":"password","secretKey":"your-evaluator-secret"}'

# Test admin registration (super-admin)
curl -X POST http://localhost:3000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Super Admin","email":"admin@test.com","password":"password","secretKey":"your-super-admin-secret"}'

# Test problem statements
curl http://localhost:3000/api/problem-statements
```

### Database Testing

- Use MongoDB Compass for database inspection
- Test data validation rules
- Verify indexes are created properly

## 📈 Monitoring & Logging

### Application Logs

- All API endpoints include error logging
- User authentication events logged
- File upload activities tracked

### Database Monitoring

- Connection status monitoring
- Query performance tracking
- Index usage analysis

## 🔄 Future Enhancements

- **Real-time Notifications**: WebSocket implementation
- **Advanced Analytics**: Team performance metrics
- **Mobile App Support**: API optimization for mobile
- **Caching Layer**: Redis implementation for better performance
- **Advanced Security**: Rate limiting, DDoS protection
- **Backup System**: Automated database backups

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@sih-portal.com or create an issue in the repository.

---

**Built with ❤️ for Smart India Hackathon 2025**
