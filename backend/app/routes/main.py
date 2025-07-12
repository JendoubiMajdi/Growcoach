"""
Main routes for GrowCoach application
"""
from flask import Blueprint, jsonify, request, send_from_directory, current_app
from datetime import datetime
from pathlib import Path
import os
import logging

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    """Home endpoint"""
    return jsonify({
        "message": "Welcome to the GrowCoach API!",
        "version": "1.0.0",
        "status": "healthy"
    })

@main_bp.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": str(datetime.utcnow())
    })

@main_bp.route('/test', methods=['GET', 'POST'])
def test_route():
    """Test endpoint for debugging"""
    return jsonify({
        "message": "Test route working!",
        "method": request.method,
        "headers": dict(request.headers)
    })

@main_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    import os
    from pathlib import Path
    
    # Get absolute path to uploads folder
    upload_folder = current_app.config.get('UPLOAD_FOLDER', './uploads')
    if not os.path.isabs(upload_folder):
        # Convert relative path to absolute path
        base_dir = Path(__file__).parent.parent.parent  # Go up to backend directory
        upload_folder = base_dir / upload_folder
    
    return send_from_directory(str(upload_folder), filename)

@main_bp.route('/jobs', methods=['GET'])
def get_all_jobs():
    """Get all jobs for public viewing"""
    try:
        from app import mongo
        from bson import ObjectId
        
        jobs_cursor = mongo.db.jobs.find({'status': 'active'}).sort('created_at', -1)
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
                'company': company_data,
                'applications_count': len(job.get('applications', []))
            })
        
        return jsonify(jobs)
        
    except Exception as e:
        logging.error(f"Error fetching jobs: {str(e)}")
        return jsonify({'error': 'Erreur lors de la récupération des emplois.'}), 500
