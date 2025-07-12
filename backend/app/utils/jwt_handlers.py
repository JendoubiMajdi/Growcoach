"""
JWT token handlers for GrowCoach application
"""
from datetime import datetime
from flask import jsonify

def register_jwt_handlers(jwt_manager, mongo_instance):
    """Register JWT handlers with the application"""
    
    @jwt_manager.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        """Check if JWT token is in the blacklist"""
        jti = jwt_payload["jti"]
        token = mongo_instance.db.token_blacklist.find_one({"jti": jti})
        return token is not None
    
    @jwt_manager.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        """Handle expired tokens"""
        return jsonify({
            "success": False,
            "error": "Token expiré",
            "message": "Votre session a expiré. Veuillez vous reconnecter."
        }), 401
    
    @jwt_manager.invalid_token_loader
    def invalid_token_callback(error):
        """Handle invalid tokens"""
        return jsonify({
            "success": False,
            "error": "Token invalide",
            "message": "Le token fourni n'est pas valide."
        }), 401
    
    @jwt_manager.unauthorized_loader
    def missing_token_callback(error):
        """Handle missing tokens"""
        return jsonify({
            "success": False,
            "error": "Token manquant",
            "message": "Token d'autorisation requis."
        }), 401
    
    @jwt_manager.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        """Handle revoked tokens"""
        return jsonify({
            "success": False,
            "error": "Token révoqué",
            "message": "Ce token a été révoqué."
        }), 401

def blacklist_token(mongo_instance, jti: str):
    """Add a token to the blacklist"""
    mongo_instance.db.token_blacklist.insert_one({
        "jti": jti,
        "created_at": datetime.utcnow()
    })
