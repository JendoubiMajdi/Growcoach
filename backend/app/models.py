"""
Database models for the GrowCoach application
"""
from datetime import datetime, timedelta
from bson import ObjectId
from pymongo.errors import PyMongoError
import logging

class BaseModel:
    """Base model class with common functionality"""
    
    def __init__(self, mongo, collection_name):
        self.mongo = mongo
        self.collection_name = collection_name
        self.collection = mongo.db[collection_name]
    
    def create(self, data):
        """Create a new document"""
        try:
            data['created_at'] = datetime.utcnow()
            data['updated_at'] = datetime.utcnow()
            result = self.collection.insert_one(data)
            return self.collection.find_one({'_id': result.inserted_id})
        except PyMongoError as e:
            logging.error(f"Error creating {self.collection_name}: {e}")
            raise
    
    def find_by_id(self, id):
        """Find document by ID"""
        try:
            return self.collection.find_one({'_id': ObjectId(id)})
        except PyMongoError as e:
            logging.error(f"Error finding {self.collection_name} by ID: {e}")
            return None
    
    def find_by_email(self, email):
        """Find document by email"""
        try:
            return self.collection.find_one({'email': email})
        except PyMongoError as e:
            logging.error(f"Error finding {self.collection_name} by email: {e}")
            return None
    
    def update(self, id, data):
        """Update document by ID"""
        try:
            data['updated_at'] = datetime.utcnow()
            result = self.collection.update_one(
                {'_id': ObjectId(id)},
                {'$set': data}
            )
            return result.modified_count > 0
        except PyMongoError as e:
            logging.error(f"Error updating {self.collection_name}: {e}")
            return False
    
    def delete(self, id):
        """Delete document by ID"""
        try:
            result = self.collection.delete_one({'_id': ObjectId(id)})
            return result.deleted_count > 0
        except PyMongoError as e:
            logging.error(f"Error deleting {self.collection_name}: {e}")
            return False
    
    def find_all(self, filter_dict=None, limit=None, skip=None):
        """Find all documents with optional filtering"""
        try:
            query = filter_dict or {}
            cursor = self.collection.find(query)
            
            if skip:
                cursor = cursor.skip(skip)
            if limit:
                cursor = cursor.limit(limit)
            
            return list(cursor)
        except PyMongoError as e:
            logging.error(f"Error finding all {self.collection_name}: {e}")
            return []
    
    def count(self, filter_dict=None):
        """Count documents"""
        try:
            query = filter_dict or {}
            return self.collection.count_documents(query)
        except PyMongoError as e:
            logging.error(f"Error counting {self.collection_name}: {e}")
            return 0

class Candidate(BaseModel):
    """Candidate model"""
    
    def __init__(self, mongo):
        super().__init__(mongo, 'candidates')
    
    def create(self, data):
        """Create a new candidate with default values"""
        default_data = {
            'first_name': '',
            'last_name': '',
            'email': '',
            'password': '',
            'phone': '',
            'location': '',
            'bio': '',
            'skills': [],
            'terms_accepted': False,
            'avatar': None,
            'resume': None,
            'education': [],
            'experience': [],
            'professional_formation': [],
            'projects': [],
            'oauth_provider': None,
            'oauth_id': None
        }
        default_data.update(data)
        return super().create(default_data)
    
    def update_profile(self, candidate_id, data):
        """Update candidate profile"""
        allowed_fields = [
            'first_name', 'last_name', 'phone', 'location', 'bio', 'skills',
            'avatar', 'resume', 'education', 'experience', 'professional_formation', 'projects'
        ]
        
        # Filter only allowed fields
        filtered_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        return self.update(candidate_id, filtered_data)
    
    def calculate_profile_completion(self, candidate_id):
        """Calculate profile completion percentage"""
        try:
            candidate = self.find_by_id(candidate_id)
            if not candidate:
                return 0
            
            total_fields = 0
            completed_fields = 0
            
            # Basic info (required fields)
            basic_fields = ['first_name', 'last_name', 'email', 'phone', 'location']
            for field in basic_fields:
                total_fields += 1
                if candidate.get(field):
                    completed_fields += 1
            
            # Bio
            total_fields += 1
            if candidate.get('bio'):
                completed_fields += 1
            
            # Skills
            total_fields += 1
            if candidate.get('skills') and len(candidate['skills']) > 0:
                completed_fields += 1
            
            # Avatar
            total_fields += 1
            if candidate.get('avatar'):
                completed_fields += 1
            
            # Resume
            total_fields += 1
            if candidate.get('resume'):
                completed_fields += 1
            
            # Education
            total_fields += 1
            if candidate.get('education') and len(candidate['education']) > 0:
                completed_fields += 1
            
            # Experience
            total_fields += 1
            if candidate.get('experience') and len(candidate['experience']) > 0:
                completed_fields += 1
            
            return int((completed_fields / total_fields) * 100)
        except Exception as e:
            logging.error(f"Error calculating profile completion: {e}")
            return 0

class Company(BaseModel):
    """Company model"""
    
    def __init__(self, mongo):
        super().__init__(mongo, 'companies')
    
    def create(self, data):
        """Create a new company with default values"""
        default_data = {
            'company_name': '',
            'email': '',
            'password': '',
            'phone': '',
            'location': '',
            'description': '',
            'website': '',
            'industry': '',
            'logo': None,
            'founded_year': None,
            'company_size': '',
            'verified': False
        }
        default_data.update(data)
        return super().create(default_data)
    
    def update_profile(self, company_id, data):
        """Update company profile"""
        allowed_fields = [
            'company_name', 'phone', 'location', 'description', 'website',
            'industry', 'logo', 'founded_year', 'company_size'
        ]
        
        # Filter only allowed fields
        filtered_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        return self.update(company_id, filtered_data)
    
    def verify_company(self, company_id):
        """Verify a company"""
        return self.update(company_id, {'verified': True})

class Admin(BaseModel):
    """Admin model"""
    
    def __init__(self, mongo):
        super().__init__(mongo, 'admin')
    
    def create(self, data):
        """Create a new admin with default values"""
        default_data = {
            'email': '',
            'password': '',
            'role': 'admin',
            'permissions': [],
            'active': True
        }
        default_data.update(data)
        return super().create(default_data)

class Job(BaseModel):
    """Job model"""
    
    def __init__(self, mongo):
        super().__init__(mongo, 'jobs')
    
    def create(self, data):
        """Create a new job with default values"""
        default_data = {
            'title': '',
            'company_id': '',
            'description': '',
            'requirements': [],
            'location': '',
            'salary_min': None,
            'salary_max': None,
            'employment_type': '',
            'remote_work': False,
            'benefits': [],
            'application_deadline': None,
            'status': 'active',
            'applications_count': 0,
            'views_count': 0
        }
        default_data.update(data)
        return super().create(default_data)
    
    def find_by_company(self, company_id):
        """Find all jobs by company"""
        try:
            return self.collection.find({'company_id': company_id}).sort('created_at', -1)
        except PyMongoError as e:
            logging.error(f"Error finding jobs by company: {e}")
            return []
    
    def search_jobs(self, query_params):
        """Search jobs with filters"""
        try:
            filters = {}
            
            # Title search
            if query_params.get('title'):
                filters['title'] = {'$regex': query_params['title'], '$options': 'i'}
            
            # Location search
            if query_params.get('location'):
                filters['location'] = {'$regex': query_params['location'], '$options': 'i'}
            
            # Employment type
            if query_params.get('employment_type'):
                filters['employment_type'] = query_params['employment_type']
            
            # Remote work
            if query_params.get('remote_work') is not None:
                filters['remote_work'] = query_params['remote_work']
            
            # Salary range
            if query_params.get('salary_min') or query_params.get('salary_max'):
                salary_filter = {}
                if query_params.get('salary_min'):
                    salary_filter['$gte'] = query_params['salary_min']
                if query_params.get('salary_max'):
                    salary_filter['$lte'] = query_params['salary_max']
                filters['salary_min'] = salary_filter
            
            # Only active jobs
            filters['status'] = 'active'
            
            return list(self.collection.find(filters).sort('created_at', -1))
        except PyMongoError as e:
            logging.error(f"Error searching jobs: {e}")
            return []
    
    def increment_views(self, job_id):
        """Increment job views count"""
        try:
            self.collection.update_one(
                {'_id': ObjectId(job_id)},
                {'$inc': {'views_count': 1}}
            )
        except PyMongoError as e:
            logging.error(f"Error incrementing job views: {e}")

class JobApplication(BaseModel):
    """Job application model"""
    
    def __init__(self, mongo):
        super().__init__(mongo, 'job_applications')
    
    def create(self, data):
        """Create a new job application"""
        default_data = {
            'job_id': '',
            'candidate_id': '',
            'cover_letter': '',
            'status': 'pending',
            'applied_at': datetime.utcnow(),
            'resume_filename': None,
            'additional_documents': []
        }
        default_data.update(data)
        return super().create(default_data)
    
    def find_by_candidate(self, candidate_id):
        """Find all applications by candidate"""
        try:
            return list(self.collection.find({'candidate_id': candidate_id}).sort('applied_at', -1))
        except PyMongoError as e:
            logging.error(f"Error finding applications by candidate: {e}")
            return []
    
    def find_by_job(self, job_id):
        """Find all applications for a job"""
        try:
            return list(self.collection.find({'job_id': job_id}).sort('applied_at', -1))
        except PyMongoError as e:
            logging.error(f"Error finding applications by job: {e}")
            return []
    
    def update_status(self, application_id, status):
        """Update application status"""
        valid_statuses = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected']
        if status not in valid_statuses:
            raise ValueError(f"Invalid status: {status}")
        
        return self.update(application_id, {'status': status})

class PasswordResetCode(BaseModel):
    """Password reset code model"""
    
    def __init__(self, mongo):
        super().__init__(mongo, 'password_resets')
    
    def create(self, email, code, expires_in_minutes=15):
        """Create a new password reset code"""
        data = {
            'email': email,
            'code': code,
            'expires_at': datetime.utcnow() + timedelta(minutes=expires_in_minutes),
            'used': False
        }
        return super().create(data)
    
    def find_valid_code(self, email, code):
        """Find valid reset code"""
        try:
            return self.collection.find_one({
                'email': email,
                'code': code,
                'used': False,
                'expires_at': {'$gt': datetime.utcnow()}
            })
        except PyMongoError as e:
            logging.error(f"Error finding valid reset code: {e}")
            return None
    
    def mark_as_used(self, reset_id):
        """Mark reset code as used"""
        return self.update(reset_id, {'used': True})
    
    def cleanup_expired(self):
        """Remove expired reset codes"""
        try:
            result = self.collection.delete_many({
                'expires_at': {'$lt': datetime.utcnow()}
            })
            return result.deleted_count
        except PyMongoError as e:
            logging.error(f"Error cleaning up expired reset codes: {e}")
            return 0
