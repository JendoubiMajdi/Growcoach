from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from dateutil.parser import parse
import logging

from app import mongo

job_bp = Blueprint('job', __name__)

def format_created_at(value):
    if not value:
        return ''
    if isinstance(value, datetime):
        return value.strftime('%Y-%m-%d')
    try:
        return parse(str(value)).strftime('%Y-%m-%d')
    except Exception:
        return str(value)

@job_bp.route('/', methods=['GET'])
def get_all_jobs_public():
    try:
        jobs_cursor = mongo.db.jobs.find().sort('created_at', -1)
        jobs = []
        for job in jobs_cursor:
            company_data = {}
            if job.get('company_id'):
                company = mongo.db.companies.find_one({'_id': ObjectId(job['company_id'])})
                if company:
                    company_data = {
                        'company_name': company.get('company_name', ''),
                        'company_logo': company.get('logo', ''),
                        'company_location': company.get('location', '')
                    }
            jobs.append({
                '_id': str(job.get('_id')),
                'job_title': job.get('job_title', ''),
                'salary': job.get('salary', ''),
                'looking_for_profile': job.get('looking_for_profile', ''),
                'required_experience': job.get('required_experience', ''),
                'required_skills': job.get('required_skills', []),
                'status': job.get('status', 'draft'),
                'created_at': format_created_at(job.get('created_at')),
                'company_id': str(job.get('company_id')) if job.get('company_id') else '',
                'applicants': job.get('applicants', []),
                **company_data  
            })
        return jsonify(jobs), 200
    except Exception as e:
        logging.error(f"Error in get_all_jobs_public: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500

@job_bp.route('/<job_id>/apply', methods=['POST'])
@jwt_required()
def apply_to_job(job_id):
    try:
        data = request.get_json()
        candidate_id = data.get('candidate_id')
        if not candidate_id:
            return jsonify({'error': 'Missing candidate_id'}), 400
            
        job = mongo.db.jobs.find_one({'_id': ObjectId(job_id)})
        if not job:
            return jsonify({'error': 'Offre non trouvée.'}), 404
            
        # Prevent duplicate applications
        if candidate_id in job.get('applications', []):
            return jsonify({'error': 'Candidature déjà envoyée.'}), 400
            
        mongo.db.jobs.update_one(
            {'_id': ObjectId(job_id)},
            {'$addToSet': {'applications': candidate_id}}
        )
        
        return jsonify({'message': 'Candidature envoyée avec succès.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@job_bp.route('/create', methods=['POST'])
@jwt_required()
def create_job():
    try:
        data = request.get_json()
        current_user = get_jwt_identity()
        
        required_fields = ['job_title', 'salary', 'looking_for_profile', 'required_experience', 'required_skills']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        job = {
            'job_title': data['job_title'],
            'salary': data['salary'],
            'looking_for_profile': data['looking_for_profile'], 
            'required_experience': data['required_experience'],
            'required_skills': data['required_skills'],
            'status': 'draft',
            'created_at': datetime.utcnow(),  
            'company_id': current_user['id'],
            'applicants': []
        }
        
        mongo.db.jobs.insert_one(job)
        
        return jsonify({'message': 'Job created successfully.'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
