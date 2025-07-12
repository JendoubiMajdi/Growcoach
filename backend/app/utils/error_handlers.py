from flask import jsonify

def register_error_handlers(app):
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "error": "Requête invalide",
            "message": "La requête contient des données invalides"
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            "success": False,
            "error": "Non autorisé",
            "message": "Authentification requise"
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            "success": False, 
            "error": "Interdit",
            "message": "Vous n'avez pas la permission."
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "Non trouvé",
            "message": "Ressource non trouvée"
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "success": False,
            "error": "Erreur interne du serveur",
            "message": "Une erreur inattendue s'est produite."
        }), 500
