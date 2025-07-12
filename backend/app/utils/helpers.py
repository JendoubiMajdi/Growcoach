"""
Utility helper functions for GrowCoach application
"""
import os
import re
import json
import secrets
import random
from typing import Dict, Any, Union, List
from bleach import clean
from werkzeug.utils import secure_filename
from pathlib import Path
from flask import current_app, jsonify

def allowed_file(filename: str, allowed_extensions: set = None) -> bool:
    """Check if the uploaded file has an allowed extension"""
    if not filename:
        return False
    
    if allowed_extensions is None:
        allowed_extensions = current_app.config['ALLOWED_EXTENSIONS']
    
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def sanitize_input(data: Union[Dict[str, Any], str, List]) -> Union[Dict[str, Any], str, List]:
    """Sanitize all string inputs to prevent XSS"""
    if isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    elif isinstance(data, str):
        return clean(data)
    return data

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password: str) -> tuple[bool, str]:
    """Validate password strength"""
    if len(password) < 8:
        return False, "Le mot de passe doit contenir au moins 8 caractères"
    
    if not re.search(r'[A-Z]', password):
        return False, "Le mot de passe doit contenir au moins une lettre majuscule"
    
    if not re.search(r'[a-z]', password):
        return False, "Le mot de passe doit contenir au moins une lettre minuscule"
    
    if not re.search(r'\d', password):
        return False, "Le mot de passe doit contenir au moins un chiffre"
    
    return True, "Mot de passe valide"

def generate_reset_code() -> str:
    """Generate a 6-digit password reset code"""
    return ''.join(random.choices('0123456789', k=6))

def generate_secure_filename(filename: str) -> str:
    """Generate a secure filename with timestamp"""
    if not filename:
        return None
    
    # Get file extension
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    # Generate secure filename with timestamp
    timestamp = secrets.token_hex(8)
    return f"{timestamp}.{ext}" if ext else timestamp

def generate_filename(filename: str, prefix: str = "") -> str:
    """Generate a filename with optional prefix"""
    if not filename:
        return None
    
    # Get file extension
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    # Generate filename with timestamp
    from datetime import datetime
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    base_name = f"{prefix}_{timestamp}" if prefix else timestamp
    
    return f"{base_name}.{ext}" if ext else base_name

def save_uploaded_file(file, prefix: str = "") -> str:
    """Save an uploaded file and return the filename"""
    if not file or not allowed_file(file.filename):
        return None
    
    # Generate secure filename
    original_filename = secure_filename(file.filename)
    filename = f"{prefix}_{generate_secure_filename(original_filename)}" if prefix else generate_secure_filename(original_filename)
    
    # Save file
    upload_folder = Path(current_app.config['UPLOAD_FOLDER'])
    file_path = upload_folder / filename
    file.save(str(file_path))
    
    return filename

def save_file(file, upload_folder, prefix=""):
    """Save uploaded file with secure filename - legacy function"""
    if file and allowed_file(file.filename):
        from datetime import datetime
        filename = secure_filename(f"{prefix}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        return filename
    return None

def format_date(date_str: str) -> str:
    """Format date string for display"""
    if not date_str:
        return ""
    
    try:
        from datetime import datetime
        date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return date_obj.strftime('%d/%m/%Y')
    except:
        return date_str

def parse_json_field(field_data: str) -> List[Dict[str, Any]]:
    """Parse JSON field from form data"""
    if isinstance(field_data, str):
        try:
            return json.loads(field_data)
        except json.JSONDecodeError:
            return []
    elif isinstance(field_data, list):
        return field_data
    return []

def calculate_profile_completion(candidate: Dict[str, Any]) -> int:
    """Calculate profile completion percentage"""
    required_fields = [
        'first_name', 'last_name', 'email', 'phone', 'location', 'bio'
    ]
    
    completed_fields = 0
    total_fields = len(required_fields) + 4  # +4 for arrays and avatar
    
    # Check required fields
    for field in required_fields:
        if candidate.get(field) and str(candidate[field]).strip():
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

def success_response(message, data=None, status_code=200):
    """Standard success response format"""
    response = {
        "success": True,
        "message": message
    }
    if data:
        response["data"] = data
    return jsonify(response), status_code

def error_response(message: str, status_code: int = 400, error_code: str = None) -> tuple:
    """Create a standardized error response"""
    response = {
        "success": False,
        "error": message
    }
    
    if error_code:
        response["error_code"] = error_code
    
    from flask import jsonify
    return jsonify(response), status_code

def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> tuple[bool, str]:
    """Validate that all required fields are present"""
    missing_fields = []
    for field in required_fields:
        if field not in data or not data[field]:
            missing_fields.append(field)
    
    if missing_fields:
        return False, f"Champs requis manquants: {', '.join(missing_fields)}"
    
    return True, ""

def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    if not phone:
        return True  # Phone is optional
    
    # Remove spaces and special characters
    clean_phone = re.sub(r'[^\d+]', '', phone)
    
    # Check if it's a valid international format
    if re.match(r'^\+?[1-9]\d{1,14}$', clean_phone):
        return True
    
    return False

def validate_url(url: str) -> bool:
    """Validate URL format"""
    if not url:
        return True  # URL is optional
    
    url_pattern = r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$'
    return re.match(url_pattern, url) is not None

def is_valid_object_id(id_string: str) -> bool:
    """Check if string is a valid MongoDB ObjectId"""
    try:
        from bson import ObjectId
        ObjectId(id_string)
        return True
    except:
        return False

def convert_to_object_id(id_string: str):
    """Convert string to MongoDB ObjectId"""
    try:
        from bson import ObjectId
        return ObjectId(id_string)
    except:
        return None
