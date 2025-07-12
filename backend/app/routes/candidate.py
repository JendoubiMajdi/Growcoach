"""
Candidate routes for GrowCoach application
"""
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from bson import ObjectId
from datetime import datetime
import logging
import json
import os

from app import mongo, limiter
from app.models import Candidate
from app.utils.helpers import (
    allowed_file, sanitize_input, success_response, error_response,
    validate_required_fields, generate_filename, save_file
)

candidate_bp = Blueprint('candidate', __name__)

# Initialize model
candidate_model = Candidate(mongo)

@candidate_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_candidate_profile():
    """Get candidate profile"""
    try:
        current_user_id = get_jwt_identity()
        candidate = candidate_model.find_by_id(current_user_id)
        
        if not candidate:
            return error_response("Candidat non trouvé.", 404)

        # Remove sensitive information
        candidate.pop('password', None)
        
        return success_response("Profil récupéré avec succès", candidate)

    except Exception as e:
        logging.error(f"Error fetching candidate profile: {str(e)}")
        return error_response("Erreur lors de la récupération du profil.", 500)

@candidate_bp.route('/update', methods=['PUT'])
@jwt_required()
@limiter.limit("10 per minute")
def update_candidate_profile():
    """Update candidate profile"""
    try:
        current_user_id = get_jwt_identity()
        
        # Handle multipart form data
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form.to_dict()
            
            # Parse JSON fields
            for field in ['education', 'experience', 'professional_formation', 'projects', 'skills']:
                if field in data:
                    try:
                        data[field] = json.loads(data[field])
                    except json.JSONDecodeError:
                        return error_response(f"Format JSON invalide pour {field}.", 400)
            
            # Handle file uploads
            if 'avatar' in request.files:
                avatar_file = request.files['avatar']
                if avatar_file and avatar_file.filename:
                    if allowed_file(avatar_file.filename, {'png', 'jpg', 'jpeg', 'gif'}):
                        filename = generate_filename(avatar_file.filename, prefix="avatar_")
                        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                        avatar_file.save(filepath)
                        data['avatar'] = filename
                    else:
                        return error_response("Format d'image non supporté.", 400)
            
            if 'resume' in request.files:
                resume_file = request.files['resume']
                if resume_file and resume_file.filename:
                    if allowed_file(resume_file.filename, {'pdf', 'doc', 'docx'}):
                        filename = generate_filename(resume_file.filename, prefix="resume_")
                        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                        resume_file.save(filepath)
                        data['resume'] = filename
                    else:
                        return error_response("Format de CV non supporté.", 400)
        
        else:
            # Handle JSON data
            data = request.get_json()
            if not data:
                return error_response("Données requises.", 400)
        
        # Sanitize input
        data = sanitize_input(data)
        
        # Remove fields that shouldn't be updated
        data.pop('email', None)
        data.pop('password', None)
        data.pop('_id', None)
        data.pop('created_at', None)
        data.pop('updated_at', None)
        
        # Update candidate
        updated_candidate = candidate_model.update(current_user_id, data)
        
        if not updated_candidate:
            return error_response("Échec de la mise à jour du profil.", 500)
        
        # Remove sensitive information
        updated_candidate.pop('password', None)
        
        return success_response("Profil mis à jour avec succès", updated_candidate)

    except Exception as e:
        logging.error(f"Error updating candidate profile: {str(e)}")
        return error_response("Erreur lors de la mise à jour du profil.", 500)

@candidate_bp.route('/completion', methods=['GET'])
@jwt_required()
def get_profile_completion():
    """Get profile completion percentage"""
    try:
        current_user_id = get_jwt_identity()
        candidate = candidate_model.find_by_id(current_user_id)
        
        if not candidate:
            return error_response("Candidat non trouvé.", 404)
        
        completion_percentage = candidate_model.calculate_profile_completion(candidate)
        
        return success_response("Pourcentage de completion calculé", {
            "completion_percentage": completion_percentage
        })

    except Exception as e:
        logging.error(f"Error calculating profile completion: {str(e)}")
        return error_response("Erreur lors du calcul de completion.", 500)

@candidate_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_candidate_dashboard():
    """Get candidate dashboard data"""
    try:
        current_user_id = get_jwt_identity()
        candidate = candidate_model.find_by_id(current_user_id)
        
        if not candidate:
            return error_response("Candidat non trouvé.", 404)
        
        # Get profile completion
        completion_percentage = candidate_model.calculate_profile_completion(candidate)
        
        # Get job applications count
        applications_count = mongo.db.job_applications.count_documents({
            'candidate_id': current_user_id
        })
        
        # Get recent jobs (last 10)
        recent_jobs = list(mongo.db.jobs.find({
            'is_active': True
        }).sort('created_at', -1).limit(10))
        
        # Convert ObjectId to string for JSON serialization
        for job in recent_jobs:
            job['_id'] = str(job['_id'])
            job['company_id'] = str(job['company_id'])
        
        dashboard_data = {
            'candidate_name': f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}",
            'profile_completion': completion_percentage,
            'applications_count': applications_count,
            'recent_jobs': recent_jobs,
            'profile_complete': completion_percentage >= 80  # Consider 80% as complete
        }
        
        return success_response("Données du tableau de bord récupérées", dashboard_data)

    except Exception as e:
        logging.error(f"Error fetching candidate dashboard: {str(e)}")
        return error_response("Erreur lors de la récupération du tableau de bord.", 500)

@candidate_bp.route('/applications', methods=['GET'])
@jwt_required()
def get_candidate_applications():
    """Get candidate's job applications"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get applications with job details
        pipeline = [
            {'$match': {'candidate_id': current_user_id}},
            {'$lookup': {
                'from': 'jobs',
                'localField': 'job_id',
                'foreignField': '_id',
                'as': 'job'
            }},
            {'$unwind': '$job'},
            {'$lookup': {
                'from': 'companies',
                'localField': 'job.company_id',
                'foreignField': '_id',
                'as': 'company'
            }},
            {'$unwind': '$company'},
            {'$sort': {'applied_at': -1}}
        ]
        
        applications = list(mongo.db.job_applications.aggregate(pipeline))
        
        # Convert ObjectId to string
        for app in applications:
            app['_id'] = str(app['_id'])
            app['job']['_id'] = str(app['job']['_id'])
            app['job']['company_id'] = str(app['job']['company_id'])
            app['company']['_id'] = str(app['company']['_id'])
        
        return success_response("Applications récupérées avec succès", applications)

    except Exception as e:
        logging.error(f"Error fetching candidate applications: {str(e)}")
        return error_response("Erreur lors de la récupération des candidatures.", 500)

@candidate_bp.route('/jobs', methods=['GET'])
def get_available_jobs():
    """Get available jobs for candidates"""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 10)), 50)  # Max 50 per page
        search = request.args.get('search', '')
        location = request.args.get('location', '')
        employment_type = request.args.get('employment_type', '')
        
        # Build filter
        filters = {'is_active': True}
        
        if search:
            filters['$or'] = [
                {'title': {'$regex': search, '$options': 'i'}},
                {'description': {'$regex': search, '$options': 'i'}}
            ]
        
        if location:
            filters['location'] = {'$regex': location, '$options': 'i'}
        
        if employment_type:
            filters['employment_type'] = employment_type
        
        # Get total count
        total = mongo.db.jobs.count_documents(filters)
        
        # Get jobs with pagination
        jobs = list(mongo.db.jobs.find(filters)
                   .sort('created_at', -1)
                   .skip((page - 1) * per_page)
                   .limit(per_page))
        
        # Get company details
        for job in jobs:
            job['_id'] = str(job['_id'])
            job['company_id'] = str(job['company_id'])
            
            # Get company info
            company = mongo.db.companies.find_one({'_id': ObjectId(job['company_id'])})
            if company:
                job['company'] = {
                    'name': company.get('company_name', ''),
                    'logo': company.get('logo', ''),
                    'location': company.get('location', '')
                }
        
        return success_response("Jobs disponibles récupérés", {
            'jobs': jobs,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        })

    except Exception as e:
        logging.error(f"Error fetching available jobs: {str(e)}")
        return error_response("Erreur lors de la récupération des emplois.", 500)

@candidate_bp.route('/job/<job_id>', methods=['GET'])
def get_job_details(job_id):
    """Get job details"""
    try:
        if not ObjectId.is_valid(job_id):
            return error_response("ID de travail invalide.", 400)
        
        job = mongo.db.jobs.find_one({'_id': ObjectId(job_id)})
        
        if not job:
            return error_response("Emploi non trouvé.", 404)
        
        job['_id'] = str(job['_id'])
        job['company_id'] = str(job['company_id'])
        
        # Get company details
        company = mongo.db.companies.find_one({'_id': ObjectId(job['company_id'])})
        if company:
            job['company'] = {
                'name': company.get('company_name', ''),
                'logo': company.get('logo', ''),
                'location': company.get('location', ''),
                'description': company.get('description', ''),
                'website': company.get('website', '')
            }
        
        return success_response("Détails de l'emploi récupérés", job)

    except Exception as e:
        logging.error(f"Error fetching job details: {str(e)}")
        return error_response("Erreur lors de la récupération des détails.", 500)

@candidate_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@candidate_bp.route('/saved-jobs', methods=['GET'])
@jwt_required()
def get_saved_jobs():
    """Get candidate's saved jobs"""
    try:
        current_user_id = get_jwt_identity()
        candidate = candidate_model.find_by_id(current_user_id)
        
        if not candidate:
            return error_response("Candidat non trouvé.", 404)
        
        # Get saved job IDs
        saved_job_ids = candidate.get('saved_jobs', [])
        
        if not saved_job_ids:
            return success_response("Emplois sauvegardés récupérés", [])
        
        # Convert string IDs to ObjectIds
        object_ids = []
        for job_id in saved_job_ids:
            try:
                object_ids.append(ObjectId(job_id))
            except:
                continue
        
        # Fetch saved jobs
        jobs_cursor = mongo.db.jobs.find({'_id': {'$in': object_ids}})
        jobs = []
        
        for job in jobs_cursor:
            # Get company info
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
                'location': job.get('location', ''),
                'job_type': job.get('job_type', ''),
                'experience_level': job.get('experience_level', ''),
                'required_skills': job.get('required_skills', []),
                'job_description': job.get('job_description', ''),
                'created_at': job.get('created_at'),
                'company': company_data
            })
        
        return success_response("Emplois sauvegardés récupérés", jobs)
        
    except Exception as e:
        logging.error(f"Error fetching saved jobs: {str(e)}")
        return error_response("Erreur lors de la récupération des emplois sauvegardés.", 500)

@candidate_bp.route('/save-job', methods=['POST'])
@jwt_required()
def save_job():
    """Save a job for later"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        job_id = data.get('job_id')
        if not job_id:
            return error_response("ID de l'emploi requis.", 400)
        
        # Check if job exists
        job = mongo.db.jobs.find_one({'_id': ObjectId(job_id)})
        if not job:
            return error_response("Emploi non trouvé.", 404)
        
        # Add job to saved jobs
        result = mongo.db.candidates.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$addToSet': {'saved_jobs': job_id}}
        )
        
        if result.modified_count > 0:
            return success_response("Emploi sauvegardé avec succès", {"job_id": job_id})
        else:
            return success_response("Emploi déjà sauvegardé", {"job_id": job_id})
        
    except Exception as e:
        logging.error(f"Error saving job: {str(e)}")
        return error_response("Erreur lors de la sauvegarde.", 500)

@candidate_bp.route('/unsave-job', methods=['POST'])
@jwt_required()
def unsave_job():
    """Remove a job from saved jobs"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        job_id = data.get('job_id')
        if not job_id:
            return error_response("ID de l'emploi requis.", 400)
        
        # Remove job from saved jobs
        result = mongo.db.candidates.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$pull': {'saved_jobs': job_id}}
        )
        
        if result.modified_count > 0:
            return success_response("Emploi retiré des favoris", {"job_id": job_id})
        else:
            return success_response("Emploi non trouvé dans les favoris", {"job_id": job_id})
        
    except Exception as e:
        logging.error(f"Error unsaving job: {str(e)}")
        return error_response("Erreur lors du retrait.", 500)
