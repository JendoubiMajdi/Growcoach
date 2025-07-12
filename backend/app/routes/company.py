"""
Company routes for GrowCoach application
"""
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash
from bson import ObjectId
from datetime import datetime
import logging
import os
import re

from app import mongo
from app.utils.helpers import success_response, error_response

def validate_required_fields(data, required_fields):
    """
    Checks if all required fields are present and not empty in the data.
    Returns (True, "") if valid, otherwise (False, error_message).
    """
    for field in required_fields:
        if not data.get(field):
            return False, f"Le champ {field.replace('_', ' ')} est requis."
    return True, ""

def allowed_file(filename, allowed_extensions={'png', 'jpg', 'jpeg', 'gif'}):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def generate_filename(filename, prefix=""):
    """
    Generate a secure and unique filename for uploaded files.
    """
    from werkzeug.utils import secure_filename
    import time
    name = secure_filename(filename)
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
    return f"{prefix}{timestamp}_{name}"

# Simple sanitize_input implementation if not already defined elsewhere
def sanitize_input(data):
    if isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    elif isinstance(data, str):
        return data.strip()
    else:
        return data

company_bp = Blueprint('company', __name__)

@company_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_company_profile():
    """Get company profile"""
    try:
        current_user_id = get_jwt_identity()
        company = mongo.db.companies.find_one({"_id": ObjectId(current_user_id)})
        
        if not company:
            return error_response("Entreprise non trouvée.", 404)
        
        # Remove sensitive information
        company.pop('password', None)
        
        # Add logo URL if exists
        if company.get('logo'):
            company['logo_url'] = f"http://localhost:5000/uploads/{company['logo']}"
        
        return success_response("Profil récupéré avec succès", company)
        
    except Exception as e:
        logging.error(f"Error fetching company profile: {str(e)}")
        return error_response("Erreur lors de la récupération du profil.", 500)

@company_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_company_profile():
    """Update company profile"""
    try:
        current_user_id = get_jwt_identity()
        
        # Handle multipart form data for file uploads
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form.to_dict()
            
            # Handle logo upload
            if 'logo' in request.files:
                logo_file = request.files['logo']
                if logo_file and logo_file.filename:
                    if allowed_file(logo_file.filename, {'png', 'jpg', 'jpeg', 'gif'}):
                        filename = generate_filename(logo_file.filename, prefix="logo_")
                        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                        logo_file.save(filepath)
                        data['logo'] = filename
                    else:
                        return error_response("Format d'image non supporté.", 400)
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
        
        # Update company
        update_result = mongo.db.companies.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$set': data}
        )
        
        if update_result.modified_count == 0:
            return error_response("Échec de la mise à jour du profil.", 500)
        
        # Fetch the updated company data
        updated_company = mongo.db.companies.find_one({"_id": ObjectId(current_user_id)})
        if not updated_company:
            return error_response("Erreur lors de la récupération du profil mis à jour.", 500)
        
        # Remove sensitive information
        updated_company.pop('password', None)
        
        # Add logo URL if exists
        if updated_company.get('logo'):
            updated_company['logo_url'] = f"http://localhost:5000/uploads/{updated_company['logo']}"
        
        return success_response("Profil mis à jour avec succès", updated_company)
        
    except Exception as e:
        logging.error(f"Error updating company profile: {str(e)}")
        return error_response("Erreur lors de la mise à jour du profil.", 500)

@company_bp.route('/candidates', methods=['GET'])
@jwt_required()
def get_candidates_for_company():
    """Get all candidates for company to browse"""
    try:
        # Get all candidates from the database
        candidates = list(mongo.db.candidates.find({}, {
            'first_name': 1,
            'last_name': 1,
            'email': 1,
            'skills': 1,
            'education': 1,
            'experience': 1,
            'resume': 1,
            'adminCV': 1,
            'avatar': 1,
            'bio': 1,
            'status': 1
        }))

        candidate_list = []
        for candidate in candidates:
            # Get latest education and experience
            latest_education = candidate.get('education', [{}])[-1] if candidate.get('education') else {}
            latest_experience = candidate.get('experience', [{}])[-1] if candidate.get('experience') else {}

            candidate_list.append({
                'id': str(candidate.get('_id')),
                'firstName': candidate.get('first_name', ''),
                'lastName': candidate.get('last_name', ''),
                'email': candidate.get('email', ''),
                'skills': candidate.get('skills', []),
                'education': latest_education,
                'experience': latest_experience,
                'bio': candidate.get('bio', ''),
                'resume_url': f"http://localhost:5000/uploads/{candidate.get('resume')}" if candidate.get('resume') else None,
                'adminCV': f"http://localhost:5000/uploads/{candidate.get('adminCV')}" if candidate.get('adminCV') else None,
                'avatar_url': f"http://localhost:5000/uploads/{candidate.get('avatar')}" if candidate.get('avatar') else None,
                'status': candidate.get('status', 'pending')
            })

        return success_response("Candidats récupérés avec succès", candidate_list)

    except Exception as e:
        logging.error(f"Error fetching candidates: {str(e)}")
        return error_response("Erreur lors de la récupération des candidats.", 500)

@company_bp.route('/verification-status', methods=['GET'])
@jwt_required()
def get_verification_status():
    """Get company verification status"""
    try:
        user_id = get_jwt_identity()
        
        # Check if there's a pending verification request
        pending_request = mongo.db.admin_notifications.find_one({
            "company_id": str(user_id),
            "type": "verification_request",
            "unread": True
        })
        
        return success_response("Statut de vérification récupéré", {
            "pending": bool(pending_request)
        })
        
    except Exception as e:
        logging.error(f"Error getting verification status: {str(e)}")
        return error_response("Erreur lors de la récupération du statut.", 500)

@company_bp.route('/request-verification', methods=['POST'])
@jwt_required()
def request_verification():
    """Request company verification"""
    try:
        user_id = get_jwt_identity()
        
        company = mongo.db.companies.find_one({"_id": ObjectId(user_id)})
        if not company:
            return error_response("Entreprise non trouvée.", 404)

        # Check if already verified
        if company.get('verified'):
            return error_response("Entreprise déjà vérifiée.", 400)

        # Check if there's already a pending request
        existing_request = mongo.db.admin_notifications.find_one({
            "company_id": str(user_id),
            "type": "verification_request",
            "unread": True
        })
        
        if existing_request:
            return error_response("Demande de vérification déjà en cours.", 400)

        # Create admin notification
        notification = {
            "text": f"{company['company_name']} a fait une demande de vérification.",
            "time": datetime.utcnow().isoformat(),
            "unread": True,
            "type": "verification_request",
            "company_id": str(company['_id']),
            "company_name": company['company_name']
        }
        mongo.db.admin_notifications.insert_one(notification)

        return success_response("Demande de vérification envoyée avec succès.")

    except Exception as e:
        logging.error(f"Error requesting verification: {str(e)}")
        return error_response("Erreur lors de la demande de vérification.", 500)

@company_bp.route('/jobs', methods=['GET'])
@jwt_required()
def get_company_jobs():
    """Get all jobs posted by the company"""
    try:
        current_user_id = get_jwt_identity()

        jobs = list(mongo.db.jobs.find({
            'company_id': ObjectId(current_user_id)
        }).sort('created_at', -1))

        job_list = []
        for job in jobs:
            job_list.append({
                '_id': str(job.get('_id')),
                'job_title': job.get('job_title', ''),
                'salary': job.get('salary', ''),
                'looking_for_profile': job.get('looking_for_profile', ''),
                'required_experience': job.get('required_experience', ''),
                'required_skills': job.get('required_skills', []),
                'status': job.get('status', 'active'),
                'created_at': job.get('created_at').strftime('%Y-%m-%d') if job.get('created_at') else '',
                'applicants': job.get('applicants', []),
                'applicants_count': len(job.get('applicants', []))
            })

        return success_response("Emplois récupérés avec succès", job_list)

    except Exception as e:
        logging.error(f"Error fetching company jobs: {str(e)}")
        return error_response("Erreur lors de la récupération des emplois.", 500)

@company_bp.route('/jobs', methods=['POST'])
@jwt_required()
def create_job():
    """Create a new job posting"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return error_response("Données requises.", 400)
        
        # Validate required fields
        required_fields = ['job_title', 'salary', 'looking_for_profile', 'required_experience']
        is_valid, message = validate_required_fields(data, required_fields)
        if not is_valid:
            return error_response(message, 400)
        
        # Sanitize input
        data = sanitize_input(data)
        
        # Process skills
        required_skills = []
        if 'required_skills' in data:
            if isinstance(data['required_skills'], str):
                required_skills = [skill.strip().lower() for skill in data['required_skills'].split(',') if skill.strip()]
            elif isinstance(data['required_skills'], list):
                required_skills = [skill.lower() for skill in data['required_skills']]

        job_data = {
            'company_id': ObjectId(current_user_id),
            'job_title': data['job_title'].lower(),
            'salary': data['salary'],
            'looking_for_profile': data['looking_for_profile'].lower(),
            'required_experience': data['required_experience'],
            'required_skills': required_skills,
            'status': 'active',
            'applicants': []
        }

        job = mongo.db.jobs.insert_one(job_data)
        
        return success_response("Offre créée avec succès", {
            "job_id": str(job.inserted_id)
        }, 201)

    except Exception as e:
        logging.error(f"Error creating job: {str(e)}")
        return error_response("Erreur lors de la création de l'offre.", 500)
        
        update_data = {}
        logo_filename = company.get('logo')
        
        # Handle file upload
        if 'logo' in request.files:
            logo = request.files['logo']
            if logo.filename != '':
                if not allowed_file(logo.filename):
                    return jsonify({"error": "Type de fichier invalide pour le logo."}), 400
                
                upload_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')
                if logo_filename:
                    try:
                        os.remove(os.path.join(upload_folder, logo_filename))
                    except OSError:
                        pass
                
                logo_filename = save_file(logo, upload_folder, f"logo_{current_user_id}")
                if logo_filename:
                    update_data['logo'] = logo_filename
        
        # Update fields from form data
        form_fields = ['company_name', 'email', 'phone', 'location', 'website', 
                     'description', 'industry', 'company_size', 'founded_year']
        
        for field in form_fields:
            if field in request.form:
                update_data[field] = request.form[field]
        
        # Validate required fields
        if 'company_name' in update_data and not update_data['company_name']:
            return jsonify({"error": "Le nom de l'entreprise est requis."}), 400
        if 'email' in update_data and not update_data['email']:
            return jsonify({"error": "L'e-mail est requis."}), 400
        
        update_data['updated_at'] = datetime.now()
        
        mongo.db.companies.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$set': update_data}
        )
        
        updated_company = mongo.db.companies.find_one({'_id': ObjectId(current_user_id)})
        response_data = {
            'company_name': updated_company.get('company_name'),
            'email': updated_company.get('email'),
            'phone': updated_company.get('phone', ''),
            'location': updated_company.get('location', ''),
            'website': updated_company.get('website', ''),
            'description': updated_company.get('description', ''),
            'industry': updated_company.get('industry', ''),
            'company_size': updated_company.get('company_size', ''),
            'founded_year': updated_company.get('founded_year', ''),
            'verified': updated_company.get('verified', False),
            'logo_url': f"http://localhost:5000/uploads/{updated_company.get('logo')}" if updated_company.get('logo') else None
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        logging.error(f"Error updating company profile: {str(e)}")
        return jsonify({"error": "Une erreur s'est produite lors de la mise à jour du profil."}), 500

@company_bp.route('/jobs/<job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    """Update a specific job"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['job_title', 'salary', 'looking_for_profile', 'required_experience']
        for field in required_fields:
            if not data.get(field):
                return error_response(f"Le champ {field} est requis.", 400)
        
        # Check if job exists and belongs to current company
        job = mongo.db.jobs.find_one({'_id': ObjectId(job_id)})
        if not job:
            return error_response("Offre d'emploi non trouvée.", 404)
        
        if str(job.get('company_id')) != current_user_id:
            return error_response("Vous n'êtes pas autorisé à modifier cette offre.", 403)
        
        # Update job data
        job_data = {
            'job_title': sanitize_input(data.get('job_title', '')),
            'salary': sanitize_input(data.get('salary', '')),
            'looking_for_profile': sanitize_input(data.get('looking_for_profile', '')),
            'required_experience': sanitize_input(data.get('required_experience', '')),
            'required_skills': data.get('required_skills', []),
            'status': data.get('status', 'active'),
            'updated_at': datetime.utcnow()
        }
        
        # Update job
        result = mongo.db.jobs.update_one(
            {'_id': ObjectId(job_id)},
            {'$set': job_data}
        )
        
        if result.modified_count > 0:
            updated_job = mongo.db.jobs.find_one({'_id': ObjectId(job_id)})
            return success_response("Offre d'emploi mise à jour avec succès", {
                '_id': str(updated_job['_id']),
                'job_title': updated_job.get('job_title', ''),
                'salary': updated_job.get('salary', ''),
                'looking_for_profile': updated_job.get('looking_for_profile', ''),
                'required_experience': updated_job.get('required_experience', ''),
                'required_skills': updated_job.get('required_skills', []),
                'status': updated_job.get('status', 'active')
            })
        else:
            return error_response("Aucune modification apportée.", 400)
        
    except Exception as e:
        logging.error(f"Error updating job: {str(e)}")
        return error_response("Erreur lors de la mise à jour de l'offre d'emploi.", 500)

@company_bp.route('/jobs/<job_id>/status', methods=['PUT'])
@jwt_required()
def update_job_status(job_id):
    """Update job status"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        status = data.get('status')
        if status not in ['active', 'inactive', 'closed']:
            return error_response("Statut invalide.", 400)
        
        # Check if job exists and belongs to current company
        job = mongo.db.jobs.find_one({'_id': ObjectId(job_id)})
        if not job:
            return error_response("Offre d'emploi non trouvée.", 404)
        
        if str(job.get('company_id')) != current_user_id:
            return error_response("Vous n'êtes pas autorisé à modifier cette offre.", 403)
        
        # Update job status
        result = mongo.db.jobs.update_one(
            {'_id': ObjectId(job_id)},
            {'$set': {'status': status, 'updated_at': datetime.utcnow()}}
        )
        
        if result.modified_count > 0:
            return success_response("Statut de l'offre d'emploi mis à jour", {
                '_id': job_id,
                'status': status
            })
        else:
            return error_response("Aucune modification apportée.", 400)
        
    except Exception as e:
        logging.error(f"Error updating job status: {str(e)}")
        return error_response("Erreur lors de la mise à jour du statut.", 500)

@company_bp.route('/jobs/<job_id>/applicants', methods=['GET'])
@jwt_required()
def get_job_applicants(job_id):
    """Get applicants for a specific job"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if job exists and belongs to current company
        job = mongo.db.jobs.find_one({'_id': ObjectId(job_id)})
        if not job:
            return error_response("Offre d'emploi non trouvée.", 404)
        
        if str(job.get('company_id')) != current_user_id:
            return error_response("Vous n'êtes pas autorisé à voir ces candidatures.", 403)
        
        # Get applicants - check both 'applications' and 'applicants' fields for compatibility
        applicant_ids = job.get('applications', []) or job.get('applicants', [])
        applicants = []
        
        for applicant_id in applicant_ids:
            try:
                candidate = mongo.db.candidates.find_one({'_id': ObjectId(applicant_id)})
                if candidate:
                    applicants.append({
                        'id': str(candidate['_id']),
                        'firstName': candidate.get('first_name', ''),
                        'lastName': candidate.get('last_name', ''),
                        'email': candidate.get('email', ''),
                        'resume_url': candidate.get('resume', ''),
                        'adminCV': candidate.get('resume', ''),
                        'skills': candidate.get('skills', [])
                    })
            except Exception as e:
                logging.error(f"Error processing candidate {applicant_id}: {str(e)}")
                continue
        
        return success_response("Candidatures récupérées", applicants)
        
    except Exception as e:
        logging.error(f"Error getting job applicants: {str(e)}")
        return error_response("Erreur lors de la récupération des candidatures.", 500)

@company_bp.route('/signup', methods=['POST'])
def company_signup():
    """Company signup route"""
    try:
        data = request.form

        required_fields = ['company_name', 'email', 'password', 'confirm_password', 'industry']
        for field in required_fields:
            if not data.get(field):
                return error_response(f"{field.replace('_', ' ').capitalize()} est requis(e)", 400)

        # Email format validation
        email = data['email']
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return error_response("Format d'e-mail invalide", 400)

        # Password strength validation
        password = data['password']
        if len(password) < 8:
            return error_response("Le mot de passe doit contenir au moins 8 caractères.", 400)
        if password != data['confirm_password']:
            return error_response("Les mots de passe ne correspondent pas.", 400)

        # Unique email check (candidates & companies)
        if mongo.db.companies.find_one({'email': email}) or mongo.db.candidates.find_one({'email': email}):
            return error_response("E-mail déjà enregistré.", 400)

        # Check file extension function
        def allowed_file(filename):
            allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
            return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

        # Check if logo file is present (optional)
        logo_filename = None
        if 'logo' in request.files:
            logo = request.files['logo']
            if logo.filename != '':
                if not allowed_file(logo.filename):
                    return error_response("Type de fichier invalide pour le logo.", 400)
                
                logo_filename = secure_filename(f"logo_{datetime.now().strftime('%Y%m%d%H%M%S')}_{logo.filename}")
                upload_folder = os.path.join(os.getcwd(), 'uploads')
                os.makedirs(upload_folder, exist_ok=True)
                logo.save(os.path.join(upload_folder, logo_filename))

        # Create company document
        company = {
            'company_name': data['company_name'],
            'email': data['email'],
            'password': generate_password_hash(data['password']),
            'phone': data.get('phone', ''),
            'location': data.get('location', ''),
            'website': data.get('website', ''),
            'description': data.get('description', ''),
            'industry': data['industry'],
            'company_size': data.get('company_size', ''),
            'founded_year': data.get('founded_year', ''),
            'terms_accepted': True if data.get('terms_accepted', '').lower() == 'true' else False,
            'logo': logo_filename,
            'status': 'pending',  # Pending admin approval
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
            'jobs_posted': [],
            'verified': False
        }
        
        # Insert into database
        result = mongo.db.companies.insert_one(company)
        
        # Generate JWT token for the new company
        access_token = create_access_token(
            identity=str(result.inserted_id),
            additional_claims={"user_type": "company"}
        )

        # Create admin notification
        notification = {
            "text": f"Nouvelle inscription d'entreprise: {company['company_name']}",
            "time": datetime.now(),
            "unread": True,
            "type": "company_registration",
            "company_id": str(result.inserted_id),
            "company_name": company['company_name']
        }
        mongo.db.admin_notifications.insert_one(notification)

        response_data = {
            "status": "pending",
            "token": access_token,
            "company_id": str(result.inserted_id),
            "company_name": company['company_name'],
            "email": company['email'],
            "user_type": "company"
        }

        if logo_filename:
            response_data["logo_url"] = f"http://localhost:5000/uploads/{logo_filename}"

        return success_response("Entreprise enregistrée avec succès. Votre compte est en attente d'approbation.", response_data, 201)
        
    except Exception as e:
        logging.error(f"Error in company_signup: {str(e)}")
        return error_response("Une erreur inattendue s'est produite lors de l'inscription.", 500)

    # Alternative approach in handleSubmit:
    # The following block is JavaScript/TypeScript and should not be in a Python file.
    # if (result.success) {
    #   // Store token and user info
    #   localStorage.setItem('authToken', result.data.token);
    #   localStorage.setItem('userType', result.data.user_type);
    #   localStorage.setItem('userId', result.data.company_id);
    #   
    #   // Show success message
    #   alert('Inscription réussie ! Votre compte est en attente d\'approbation par un administrateur.');
    #   
    #   // Redirect to login page instead
    #   navigate('/login?message=company_registration_success');
    # } else {
    #   setErrors({ form: result.error || 'Échec de l\'inscription. Veuillez réessayer.' });
    # }
