from datetime import datetime
from flask import current_app
from werkzeug.security import generate_password_hash
import os


class Candidate:
    def __init__(self, mongo):
        self.mongo = mongo

    def create_candidate(self, data):
        """
        Create a new candidate record in the database.
        """
        if 'password' in data:
            data['password'] = generate_password_hash(data['password'])

        # Handle avatar file
        avatar = data.get('avatar')
        if avatar:
            avatar_filename = self._save_file(avatar, prefix="avatar")
            data['avatar'] = avatar_filename

        # Handle resume file
        resume = data.get('resume')
        if resume:
            resume_filename = self._save_file(resume, prefix="resume")
            data['resume'] = resume_filename

        result = self.mongo.db.candidates.insert_one(data)
        return str(result.inserted_id)

    def get_candidate_by_email(self, email):
        return self.mongo.db.candidates.find_one({'email': email})

    def _save_file(self, file_obj, prefix):
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        filename = f"{prefix}_{timestamp}_{file_obj.filename}"
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file_obj.save(file_path)
        return filename


class Company:
    def __init__(self, mongo):
        self.mongo = mongo

    def create_company(self, data):
        """
        Create a new company record in the database.
        """
        if 'password' in data:
            data['password'] = generate_password_hash(data['password'])

        # Handle logo file
        logo = data.get('logo')
        if logo:
            logo_filename = self._save_file(logo, prefix="logo")
            data['logo'] = logo_filename

        result = self.mongo.db.companies.insert_one(data)
        return str(result.inserted_id)

    def get_company_by_email(self, email):
        return self.mongo.db.companies.find_one({'email': email})

    def _save_file(self, file_obj, prefix):
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        filename = f"{prefix}_{timestamp}_{file_obj.filename}"
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file_obj.save(file_path)
        return filename
