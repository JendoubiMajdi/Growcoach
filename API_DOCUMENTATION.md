# GrowCoach API Documentation

Base URL: `http://localhost:5000`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication Routes (`/auth`)

#### POST `/auth/login`
Login user (candidate, company, or admin)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "access_token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "candidate|company|admin",
    "profile": {...}
  }
}
```

#### POST `/auth/register`
Register new candidate

**Request Body:**
```json
{
  "email": "candidate@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

#### POST `/auth/company-register`
Register new company

**Request Body:**
```json
{
  "email": "company@example.com",
  "password": "password123",
  "company_name": "Tech Corp",
  "industry": "Technology",
  "website": "https://techcorp.com"
}
```

#### POST `/auth/logout`
Logout user (requires authentication)

#### POST `/auth/forgot-password`
Request password reset

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST `/auth/reset-password`
Reset password with code

**Request Body:**
```json
{
  "email": "user@example.com",
  "reset_code": "123456",
  "new_password": "newpassword123"
}
```

### Candidate Routes (`/candidate`)

#### GET `/candidate/profile`
Get candidate profile (requires authentication)

**Response:**
```json
{
  "id": "candidate_id",
  "email": "candidate@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "skills": ["Python", "JavaScript"],
  "experience": [...],
  "education": [...],
  "cv_filename": "john_doe_cv.pdf"
}
```

#### PUT `/candidate/profile`
Update candidate profile (requires authentication)

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "skills": ["Python", "JavaScript", "React"],
  "bio": "Experienced developer..."
}
```

#### POST `/candidate/upload-cv`
Upload CV (requires authentication)

**Request:** Multipart form data with 'cv' file

#### GET `/candidate/applications`
Get candidate job applications (requires authentication)

**Response:**
```json
{
  "applications": [
    {
      "id": "application_id",
      "job_id": "job_id",
      "job_title": "Software Developer",
      "company_name": "Tech Corp",
      "status": "pending|accepted|rejected",
      "applied_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Company Routes (`/company`)

#### GET `/company/profile`
Get company profile (requires authentication)

#### PUT `/company/profile`
Update company profile (requires authentication)

**Request Body:**
```json
{
  "company_name": "Tech Corp",
  "industry": "Technology",
  "website": "https://techcorp.com",
  "description": "Leading tech company...",
  "location": "San Francisco, CA"
}
```

#### GET `/company/jobs`
Get company job postings (requires authentication)

#### POST `/company/jobs`
Create new job posting (requires authentication)

**Request Body:**
```json
{
  "title": "Senior Software Developer",
  "description": "We are looking for...",
  "requirements": ["5+ years experience", "Python", "React"],
  "salary_range": "$80,000 - $120,000",
  "location": "San Francisco, CA",
  "job_type": "full-time|part-time|contract",
  "experience_level": "junior|mid|senior"
}
```

#### GET `/company/applications`
Get applications for company jobs (requires authentication)

### Job Routes (`/job`)

#### GET `/job/search`
Search jobs

**Query Parameters:**
- `keyword`: Search keyword
- `location`: Job location
- `job_type`: Job type
- `experience_level`: Experience level
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Response:**
```json
{
  "jobs": [
    {
      "id": "job_id",
      "title": "Software Developer",
      "company_name": "Tech Corp",
      "location": "San Francisco, CA",
      "salary_range": "$80,000 - $120,000",
      "job_type": "full-time",
      "posted_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

#### GET `/job/:id`
Get job details

#### POST `/job/:id/apply`
Apply for job (requires candidate authentication)

**Request Body:**
```json
{
  "cover_letter": "I am interested in this position because..."
}
```

### Admin Routes (`/admin`)

#### GET `/admin/dashboard`
Get admin dashboard statistics (requires admin authentication)

**Response:**
```json
{
  "total_candidates": 150,
  "total_companies": 25,
  "total_jobs": 75,
  "total_applications": 300,
  "recent_signups": [...],
  "recent_applications": [...]
}
```

#### GET `/admin/users`
Get all users (requires admin authentication)

#### GET `/admin/jobs`
Get all jobs (requires admin authentication)

#### GET `/admin/applications`
Get all applications (requires admin authentication)

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created successfully
- `400`: Bad request (invalid data)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `409`: Conflict (duplicate data)
- `422`: Validation error
- `429`: Too many requests (rate limited)
- `500`: Internal server error

## Rate Limiting

Most endpoints are rate limited:
- Authentication endpoints: 10 requests per minute
- Other endpoints: 100 requests per minute

## File Upload

- Maximum file size: 16MB
- Supported formats: PDF, DOC, DOCX, PNG, JPG, JPEG
- Files are stored in `/uploads` directory
- Access uploaded files via `/uploads/<filename>`

## WebSocket Events (Future Enhancement)

Real-time notifications will be implemented using WebSocket connections for:
- New job applications
- Application status updates
- New job postings
- System notifications
