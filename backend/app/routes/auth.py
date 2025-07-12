"""
Authentication routes for GrowCoach application
"""
from flask import Blueprint, jsonify, request, redirect, url_for, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt, get_jwt_identity, unset_jwt_cookies
from werkzeug.security import check_password_hash, generate_password_hash
from flask_mail import Message
from datetime import datetime, timedelta
from pymongo.errors import PyMongoError
import logging
import re
import random
import secrets

from app import mongo, limiter, mail, oauth
from app.models import Candidate, Company, Admin, PasswordResetCode
from app.utils.helpers import (
    sanitize_input, validate_email, validate_password, 
    generate_reset_code, success_response, error_response
)
from app.utils.jwt_handlers import blacklist_token

auth_bp = Blueprint('auth', __name__)

# Initialize models
candidate_model = Candidate(mongo)
company_model = Company(mongo)
admin_model = Admin(mongo)
reset_code_model = PasswordResetCode(mongo)

# Configure Google OAuth - will be set up in the route handler
google = None

def setup_oauth():
    """Setup OAuth configuration"""
    global google
    if google is None:
        google = oauth.register(
            name='google',
            client_id=current_app.config.get('GOOGLE_CLIENT_ID'),
            client_secret=current_app.config.get('GOOGLE_CLIENT_SECRET'),
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={'scope': 'openid email profile'}
        )

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        logging.info(f"Received login request for email: {data.get('email', 'N/A')}")

        if not data.get('email') or not data.get('password'):
            return error_response("L'e-mail et le mot de passe sont requis.", 400)

        email = sanitize_input(data['email'])
        password = data['password']

        if not validate_email(email):
            return error_response("Format d'e-mail invalide.", 400)

        # Check in candidates collection
        candidate = candidate_model.find_by_email(email)
        if candidate and check_password_hash(candidate['password'], password):
            access_token = create_access_token(
                identity=str(candidate['_id']),
                additional_claims={"user_type": "candidate"}
            )
            return success_response("Connexion réussie", {
                "token": access_token,
                "user_id": candidate['_id'],
                "first_name": candidate['first_name'],
                "last_name": candidate['last_name'],
                "email": candidate['email'],
                "role": "candidate"
            })

        # Check in companies collection
        company = company_model.find_by_email(email)
        if company and check_password_hash(company['password'], password):
            access_token = create_access_token(
                identity=str(company['_id']),
                additional_claims={"user_type": "company"}
            )
            return success_response("Connexion réussie", {
                "token": access_token,
                "user_id": company['_id'],
                "company_name": company['company_name'],
                "email": company['email'],
                "role": "company"
            })

        # Check in admins collection
        admin = admin_model.find_by_email(email)
        if admin and check_password_hash(admin['password'], password):
            access_token = create_access_token(
                identity=str(admin['_id']),
                additional_claims={"user_type": "admin"}
            )
            return success_response("Connexion réussie", {
                "token": access_token,
                "user_id": admin['_id'],
                "email": admin['email'],
                "role": "admin"
            })

        return error_response("E-mail ou mot de passe incorrect.", 401)

    except Exception as e:
        logging.error(f"Login error: {e}")
        return error_response("Erreur lors de la connexion.", 500)

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout endpoint"""
    try:
        jti = get_jwt()["jti"]
        blacklist_token(mongo, jti)
        
        response = jsonify({"message": "Déconnexion réussie"})
        unset_jwt_cookies(response)
        return response
    except Exception as e:
        logging.error(f"Logout error: {e}")
        return error_response("Erreur lors de la déconnexion.", 500)

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'password', 'role']
        for field in required_fields:
            if not data.get(field):
                return error_response(f"Le champ {field} est requis.", 400)
        
        # Sanitize inputs
        first_name = sanitize_input(data['first_name'])
        last_name = sanitize_input(data['last_name'])
        email = sanitize_input(data['email'])
        password = data['password']
        role = data['role']
        
        # Validate email
        if not validate_email(email):
            return error_response("Format d'e-mail invalide.", 400)
        
        # Validate password
        is_valid, message = validate_password(password)
        if not is_valid:
            return error_response(message, 400)
        
        # Check if user already exists
        if (candidate_model.find_by_email(email) or 
            company_model.find_by_email(email) or 
            admin_model.find_by_email(email)):
            return error_response("Un utilisateur avec cet e-mail existe déjà.", 409)
        
        # Hash password
        hashed_password = generate_password_hash(password)
        
        # Create user based on role
        if role == 'candidate':
            user_data = {
                'first_name': first_name,
                'last_name': last_name,
                'email': email,
                'password': hashed_password,
                'phone': sanitize_input(data.get('phone', '')),
                'location': sanitize_input(data.get('location', '')),
                'bio': '',
                'skills': [],
                'terms_accepted': data.get('terms_accepted', False),
                'avatar': None,
                'resume': None
            }
            user = candidate_model.create(user_data)
            
        elif role == 'company':
            user_data = {
                'company_name': sanitize_input(data.get('company_name', '')),
                'email': email,
                'password': hashed_password,
                'phone': sanitize_input(data.get('phone', '')),
                'location': sanitize_input(data.get('location', '')),
                'description': sanitize_input(data.get('description', '')),
                'website': sanitize_input(data.get('website', '')),
                'industry': sanitize_input(data.get('industry', ''))
            }
            user = company_model.create(user_data)
        
        else:
            return error_response("Rôle invalide.", 400)
        
        # Create access token
        access_token = create_access_token(identity=str(user['_id']))
        
        return success_response("Inscription réussie", {
            "token": access_token,
            "user_id": user['_id'],
            "role": role
        }, 201)
        
    except Exception as e:
        logging.error(f"Registration error: {e}")
        return error_response("Erreur lors de l'inscription.", 500)

@auth_bp.route('/forgot-password', methods=['POST'])
@limiter.limit("3 per minute")
def forgot_password():
    """Request password reset"""
    try:
        data = request.get_json()
        email = sanitize_input(data.get('email', ''))
        
        if not validate_email(email):
            return error_response("Format d'e-mail invalide.", 400)
        
        # Check if user exists
        user = (candidate_model.find_by_email(email) or 
                company_model.find_by_email(email) or 
                admin_model.find_by_email(email))
        
        if not user:
            # Don't reveal if email exists for security
            return success_response(
                "Si cet e-mail existe, un code de réinitialisation a été envoyé."
            )
        
        # Generate reset code
        reset_code = generate_reset_code()
        
        # Save reset code to database
        reset_code_model.create(email, reset_code)
        
        # Send email
        try:
            msg = Message(
                subject="Code de réinitialisation du mot de passe",
                recipients=[email],
                html=f"""
                <h2>Réinitialisation du mot de passe</h2>
                <p>Votre code de réinitialisation est : <strong>{reset_code}</strong></p>
                <p>Ce code expire à la fin de la journée.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail.</p>
                """
            )
            mail.send(msg)
            logging.info(f"Password reset email sent to {email}")
        except Exception as e:
            logging.error(f"Failed to send email: {e}")
            # In development, log the code
            if current_app.debug:
                logging.info(f"DEBUG - Reset code for {email}: {reset_code}")
        
        return success_response(
            "Si cet e-mail existe, un code de réinitialisation a été envoyé."
        )
        
    except Exception as e:
        logging.error(f"Forgot password error: {e}")
        return error_response("Erreur lors de la demande de réinitialisation.", 500)

@auth_bp.route('/verify-reset-code', methods=['POST'])
@limiter.limit("10 per minute")
def verify_reset_code():
    """Verify password reset code"""
    try:
        data = request.get_json()
        email = sanitize_input(data.get('email', ''))
        code = sanitize_input(data.get('code', ''))
        
        if not email or not code:
            return error_response("E-mail et code requis.", 400)
        
        # Check if code is valid
        reset_record = reset_code_model.find_valid_code(email, code)
        
        if not reset_record:
            return error_response("Code invalide ou expiré.", 400)
        
        return success_response("Code vérifié avec succès.")
        
    except Exception as e:
        logging.error(f"Verify reset code error: {e}")
        return error_response("Erreur lors de la vérification du code.", 500)

@auth_bp.route('/reset-password', methods=['POST'])
@limiter.limit("5 per minute")
def reset_password():
    """Reset password using verified code"""
    try:
        data = request.get_json()
        email = sanitize_input(data.get('email', ''))
        code = sanitize_input(data.get('code', ''))
        new_password = data.get('new_password', '')
        
        if not email or not code or not new_password:
            return error_response("E-mail, code et nouveau mot de passe requis.", 400)
        
        # Validate new password
        is_valid, message = validate_password(new_password)
        if not is_valid:
            return error_response(message, 400)
        
        # Verify code again
        reset_record = reset_code_model.find_valid_code(email, code)
        if not reset_record:
            return error_response("Code invalide ou expiré.", 400)
        
        # Hash new password
        hashed_password = generate_password_hash(new_password)
        
        # Update password in appropriate collection
        user_updated = False
        for model in [candidate_model, company_model, admin_model]:
            user = model.find_by_email(email)
            if user:
                model.update(user['_id'], {'password': hashed_password})
                user_updated = True
                break
        
        if not user_updated:
            return error_response("Utilisateur non trouvé.", 404)
        
        # Mark reset code as used
        reset_code_model.mark_as_used(reset_record['_id'])
        
        return success_response("Mot de passe réinitialisé avec succès.")
        
    except Exception as e:
        logging.error(f"Reset password error: {e}")
        return error_response("Erreur lors de la réinitialisation du mot de passe.", 500)

@auth_bp.route('/oauth/<provider>')
def oauth_login(provider):
    """Initiate OAuth login"""
    try:
        if provider == 'google':
            setup_oauth()
            redirect_uri = url_for('auth.oauth_callback', provider='google', _external=True)
            return google.authorize_redirect(redirect_uri)
        else:
            return error_response("Fournisseur OAuth non supporté.", 400)
    except Exception as e:
        logging.error(f"OAuth login error: {e}")
        return error_response("Erreur lors de l'authentification OAuth.", 500)

@auth_bp.route('/oauth/<provider>/callback')
def oauth_callback(provider):
    """Handle OAuth callback"""
    try:
        if provider == 'google':
            setup_oauth()
            token = google.authorize_access_token()
            user_info = token.get('userinfo')
            
            if user_info:
                email = user_info['email']
                
                # Check if user exists
                user = candidate_model.find_by_email(email)
                if not user:
                    # Create new candidate
                    user_data = {
                        'first_name': user_info.get('given_name', ''),
                        'last_name': user_info.get('family_name', ''),
                        'email': email,
                        'password': generate_password_hash(secrets.token_urlsafe(32)),
                        'phone': '',
                        'location': '',
                        'bio': '',
                        'skills': [],
                        'terms_accepted': True,
                        'avatar': user_info.get('picture'),
                        'resume': None,
                        'oauth_provider': 'google',
                        'oauth_id': user_info['sub']
                    }
                    user = candidate_model.create(user_data)
                
                # Create access token
                access_token = create_access_token(identity=str(user['_id']))
                
                # Redirect to frontend with token
                frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
                return redirect(f"{frontend_url}/oauth-success?token={access_token}")
        
        return error_response("Échec de l'authentification OAuth.", 400)
        
    except Exception as e:
        logging.error(f"OAuth callback error: {e}")
        return error_response("Erreur lors du callback OAuth.", 500)

@auth_bp.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify if token is valid"""
    try:
        user_id = get_jwt_identity()
        return success_response("Token valide", {"user_id": user_id})
    except Exception as e:
        logging.error(f"Token verification error: {e}")
        return error_response("Token invalide.", 401)

@auth_bp.route('/check-auth', methods=['GET'])
@jwt_required(optional=True)
def check_auth():
    """Check if user is authenticated"""
    current_user = get_jwt_identity()
    if current_user:
        jwt_data = get_jwt()
        return success_response("Utilisateur authentifié", {
            "authenticated": True,
            "user_type": jwt_data.get('user_type', 'unknown')
        })
    return success_response("Utilisateur non authentifié", {"authenticated": False})
