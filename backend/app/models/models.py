"""
Database models for GrowCoach application
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
from bson import ObjectId
from pymongo.errors import PyMongoError
import logging

class BaseModel:
    """Base class for all models"""
    
    def __init__(self, mongo_instance):
        self.mongo = mongo_instance
        self.db = mongo_instance.db
    
    def to_dict(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Convert MongoDB document to JSON-serializable dict"""
        if document:
            document['_id'] = str(document['_id'])
            return document
        return {}

class Candidate(BaseModel):
    """Candidate model for handling candidate operations"""
    
    def __init__(self, mongo_instance):
        super().__init__(mongo_instance)
        self.collection = self.db.candidates
    
    def create(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new candidate"""
        try:
            candidate_data['created_at'] = datetime.utcnow()
            candidate_data['updated_at'] = datetime.utcnow()
            
            # Initialize empty arrays for profile sections
            candidate_data.setdefault('education', [])
            candidate_data.setdefault('experience', [])
            candidate_data.setdefault('professional_formation', [])
            candidate_data.setdefault('projects', [])
            candidate_data.setdefault('skills', [])
            
            result = self.collection.insert_one(candidate_data)
            candidate_data['_id'] = result.inserted_id
            return self.to_dict(candidate_data)
        except PyMongoError as e:
            logging.error(f"Error creating candidate: {e}")
            raise
    
    def find_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Find candidate by email"""
        try:
            candidate = self.collection.find_one({'email': email})
            return self.to_dict(candidate) if candidate else None
        except PyMongoError as e:
            logging.error(f"Error finding candidate by email: {e}")
            raise
    
    def find_by_id(self, candidate_id: str) -> Optional[Dict[str, Any]]:
        """Find candidate by ID"""
        try:
            candidate = self.collection.find_one({'_id': ObjectId(candidate_id)})
            return self.to_dict(candidate) if candidate else None
        except PyMongoError as e:
            logging.error(f"Error finding candidate by ID: {e}")
            raise
    
    def update(self, candidate_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update candidate"""
        try:
            update_data['updated_at'] = datetime.utcnow()
            result = self.collection.update_one(
                {'_id': ObjectId(candidate_id)},
                {'$set': update_data}
            )
            
            if result.modified_count:
                return self.find_by_id(candidate_id)
            return None
        except PyMongoError as e:
            logging.error(f"Error updating candidate: {e}")
            raise
    
    def calculate_profile_completion(self, candidate: Dict[str, Any]) -> int:
        """Calculate profile completion percentage"""
        required_fields = [
            'first_name', 'last_name', 'email', 'phone', 'location', 'bio'
        ]
        
        completed_fields = 0
        total_fields = len(required_fields) + 4  # +4 for arrays and avatar
        
        # Check required fields
        for field in required_fields:
            if candidate.get(field):
                completed_fields += 1
        
        # Check if arrays have content
        if candidate.get('education') and len(candidate['education']) > 0:
            completed_fields += 1
        if candidate.get('experience') and len(candidate['experience']) > 0:
            completed_fields += 1
        if candidate.get('skills') and len(candidate['skills']) > 0:
            completed_fields += 1
        if candidate.get('avatar'):
            completed_fields += 1
        
        return int((completed_fields / total_fields) * 100)

class Company(BaseModel):
    """Company model for handling company operations"""
    
    def __init__(self, mongo_instance):
        super().__init__(mongo_instance)
        self.collection = self.db.companies
    
    def create(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new company"""
        try:
            company_data['created_at'] = datetime.utcnow()
            company_data['updated_at'] = datetime.utcnow()
            result = self.collection.insert_one(company_data)
            company_data['_id'] = result.inserted_id
            return self.to_dict(company_data)
        except PyMongoError as e:
            logging.error(f"Error creating company: {e}")
            raise
    
    def find_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Find company by email"""
        try:
            company = self.collection.find_one({'email': email})
            return self.to_dict(company) if company else None
        except PyMongoError as e:
            logging.error(f"Error finding company by email: {e}")
            raise
    
    def find_by_id(self, company_id: str) -> Optional[Dict[str, Any]]:
        """Find company by ID"""
        try:
            company = self.collection.find_one({'_id': ObjectId(company_id)})
            return self.to_dict(company) if company else None
        except PyMongoError as e:
            logging.error(f"Error finding company by ID: {e}")
            raise
    
    def update_profile(self, company_id: str, data: Dict[str, Any]) -> bool:
        """Update company profile"""
        try:
            allowed_fields = [
                'company_name', 'phone', 'location', 'description', 'website',
                'industry', 'logo', 'founded_year', 'company_size'
            ]
            
            # Filter only allowed fields
            filtered_data = {k: v for k, v in data.items() if k in allowed_fields}
            filtered_data['updated_at'] = datetime.utcnow()
            
            result = self.collection.update_one(
                {'_id': ObjectId(company_id)},
                {'$set': filtered_data}
            )
            return result.modified_count > 0
        except PyMongoError as e:
            logging.error(f"Error updating company profile: {e}")
            return False

class Job(BaseModel):
    """Job model for handling job operations"""
    
    def __init__(self, mongo_instance):
        super().__init__(mongo_instance)
        self.collection = self.db.jobs
    
    def create(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new job"""
        try:
            job_data['created_at'] = datetime.utcnow()
            job_data['updated_at'] = datetime.utcnow()
            job_data['is_active'] = True
            result = self.collection.insert_one(job_data)
            job_data['_id'] = result.inserted_id
            return self.to_dict(job_data)
        except PyMongoError as e:
            logging.error(f"Error creating job: {e}")
            raise
    
    def find_all_active(self) -> List[Dict[str, Any]]:
        """Find all active jobs"""
        try:
            jobs = list(self.collection.find({'is_active': True}).sort('created_at', -1))
            return [self.to_dict(job) for job in jobs]
        except PyMongoError as e:
            logging.error(f"Error finding active jobs: {e}")
            raise
    
    def find_by_company(self, company_id: str) -> List[Dict[str, Any]]:
        """Find jobs by company"""
        try:
            jobs = list(self.collection.find({'company_id': company_id}).sort('created_at', -1))
            return [self.to_dict(job) for job in jobs]
        except PyMongoError as e:
            logging.error(f"Error finding jobs by company: {e}")
            raise

class Admin(BaseModel):
    """Admin model for handling admin operations"""
    
    def __init__(self, mongo_instance):
        super().__init__(mongo_instance)
        self.collection = self.db.admins
    
    def find_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Find admin by email"""
        try:
            admin = self.collection.find_one({'email': email})
            return self.to_dict(admin) if admin else None
        except PyMongoError as e:
            logging.error(f"Error finding admin by email: {e}")
            raise

class PasswordResetCode(BaseModel):
    """Password reset code model"""
    
    def __init__(self, mongo_instance):
        super().__init__(mongo_instance)
        self.collection = self.db.password_reset_codes
    
    def create(self, email: str, code: str) -> Dict[str, Any]:
        """Create a password reset code"""
        try:
            reset_data = {
                'email': email,
                'code': code,
                'created_at': datetime.utcnow(),
                'expires_at': datetime.utcnow().replace(hour=23, minute=59, second=59),
                'used': False
            }
            result = self.collection.insert_one(reset_data)
            reset_data['_id'] = result.inserted_id
            return self.to_dict(reset_data)
        except PyMongoError as e:
            logging.error(f"Error creating password reset code: {e}")
            raise
    
    def find_valid_code(self, email: str, code: str) -> Optional[Dict[str, Any]]:
        """Find valid password reset code"""
        try:
            reset_code = self.collection.find_one({
                'email': email,
                'code': code,
                'used': False,
                'expires_at': {'$gt': datetime.utcnow()}
            })
            return self.to_dict(reset_code) if reset_code else None
        except PyMongoError as e:
            logging.error(f"Error finding valid reset code: {e}")
            raise
    
    def mark_as_used(self, reset_id: str) -> bool:
        """Mark reset code as used"""
        try:
            result = self.collection.update_one(
                {'_id': ObjectId(reset_id)},
                {'$set': {'used': True, 'used_at': datetime.utcnow()}}
            )
            return result.modified_count > 0
        except PyMongoError as e:
            logging.error(f"Error marking reset code as used: {e}")
            raise
