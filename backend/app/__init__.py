import os
from pathlib import Path
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
from authlib.integrations.flask_client import OAuth

# Initialize extensions
mongo = PyMongo()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address)
mail = Mail()
oauth = OAuth()

def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    from config.config import config
    app.config.from_object(config[config_name])
    
    # Ensure upload directory exists
    upload_folder = Path(app.config['UPLOAD_FOLDER'])
    upload_folder.mkdir(exist_ok=True)
    
    # Initialize extensions with app
    mongo.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    mail.init_app(app)
    oauth.init_app(app)
    
    # Configure CORS
    CORS(app, 
         resources={
             r"/*": {
                 "origins": ["http://localhost:3000", "http://localhost:5173"],
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                 "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
                 "supports_credentials": True
             }
         })
    
    # Handle preflight requests explicitly
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            origin = request.headers.get('Origin')
            response = jsonify({})
            
            # Allow specific origins that match our CORS config
            if origin in ["http://localhost:3000", "http://localhost:5173"]:
                response.headers.add("Access-Control-Allow-Origin", origin)
            else:
                response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
                
            response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With")
            response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response
    
    # Register blueprints
    from app.routes.main import main_bp
    from app.routes.auth import auth_bp
    from app.routes.candidate import candidate_bp
    from app.routes.company import company_bp
    from app.routes.admin import admin_bp
    from app.routes.job import job_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(candidate_bp, url_prefix='/candidate')
    app.register_blueprint(company_bp, url_prefix='/company')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(job_bp, url_prefix='/job')
    
    # Register error handlers
    from app.utils.error_handlers import register_error_handlers
    register_error_handlers(app)
    
    # Register JWT handlers
    from app.utils.jwt_handlers import register_jwt_handlers
    register_jwt_handlers(jwt, mongo)
    
    return app
