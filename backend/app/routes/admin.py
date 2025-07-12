from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import logging
import os

from app import mongo

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    try:
        filter_type = request.args.get('type')  # 'candidate' ou 'company'
        status_filter = request.args.get('status')
        name_filter = request.args.get('name', '').lower()
        sort_order = request.args.get('sort_order', 'desc')  # 'asc' ou 'desc'
        has_growcoach_formation = request.args.get('has_growcoach_formation')
        
        candidates_query = {}
        if has_growcoach_formation == 'true':
            candidates_query['has_growcoach_formation'] = True
        elif has_growcoach_formation == 'false':
            candidates_query['$or'] = [
                {'has_growcoach_formation': False},
                {'has_growcoach_formation': {'$exists': False}}
            ]

        candidates = mongo.db.candidates.find(candidates_query)
        users = []

        # Process candidates
        for candidate in candidates:
            full_name = f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}".strip()
            created_at = candidate.get('created_at')
            formatted_date = created_at.strftime('%d/%m/%Y') if created_at else None

            users.append({
                '_id': str(candidate.get('_id')),
                'name': full_name,
                'email': candidate.get('email'),
                'type': 'candidate',
                'status': candidate.get('status'),
                'created_at': formatted_date,
                'photo': f"http://localhost:5000/uploads/{candidate.get('avatar')}" if candidate.get('avatar') else None,
                'CV': f"http://localhost:5000/uploads/{candidate.get('resume')}" if candidate.get('resume') else None,
                'adminCV': f"http://localhost:5000/uploads/{candidate.get('adminCV')}" if candidate.get('adminCV') else None,
                'formation_name': ', '.join(candidate.get('growcoach_formation', [])) if isinstance(candidate.get('growcoach_formation', []), list) else candidate.get('growcoach_formation', ''),
                'has_growcoach_formation': (
                    bool(candidate.get('has_growcoach_formation')) or
                    (isinstance(candidate.get('growcoach_formation', []), list) and len(candidate.get('growcoach_formation', [])) > 0)
                )
            })

        if not has_growcoach_formation:
            companies = mongo.db.companies.find()
            for company in companies:
                created_at = company.get('created_at')
                formatted_date = created_at.strftime('%d/%m/%Y') if created_at else None

                users.append({
                    '_id': str(company.get('_id')),
                    'name': company.get('company_name'),
                    'email': company.get('email'),
                    'type': 'company',
                    'status': company.get('status'),
                    'created_at': formatted_date,
                    'logo': f"http://localhost:5000/uploads/{company.get('logo')}" if company.get('logo') else None,
                    'CV': '',
                    'verified': company.get('verified', False)
                })

        # Apply filters
        if filter_type in ['candidate', 'company']:
            users = [u for u in users if u['type'] == filter_type]

        if status_filter in ['approved', 'pending', 'blocked']:
            users = [u for u in users if u['status'] == status_filter]

        if name_filter:
            users = [u for u in users if name_filter in u['name'].lower()]

        # Sort by created_at (you'd need to add proper sorting logic here)
        return jsonify(users), 200

    except Exception as e:
        logging.error(f"Error in get_all_users: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500

@admin_bp.route('/candidates/<candidate_id>/status', methods=['PUT'])
def manage_candidate_status(candidate_id):
    try:
        data = request.get_json()
        
        if 'action' not in data or data['action'] not in ['block', 'unblock']:
            return jsonify({"error": "Invalid action. Use 'block' or 'unblock'"}), 400
        
        candidate = mongo.db.candidates.find_one({"_id": ObjectId(candidate_id)})
        if not candidate:
            return jsonify({"error": "Candidat non trouvé."}), 404
        
        new_status = "blocked" if data['action'] == 'block' else "active"
        
        mongo.db.candidates.update_one(
            {"_id": ObjectId(candidate_id)},
            {"$set": {"status": new_status, "updated_at": datetime.now()}}
        )
        
        return jsonify({
            "success": True,
            "message": f"Candidate {new_status} avec succès",
            "candidate_id": candidate_id,
            "status": new_status
        }), 200
        
    except Exception as e:
        logging.error(f"Error in manage_candidate_status: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@admin_bp.route('/companies/<company_id>/status', methods=['PUT'])
def manage_company_status(company_id):
    try:
        data = request.get_json()
        
        valid_actions = ['verify', 'unverify', 'block', 'unblock']
        if 'action' not in data or data['action'] not in valid_actions:
            return jsonify({
                "error": f"Invalid action. Use one of: {', '.join(valid_actions)}"
            }), 400
        
        company = mongo.db.companies.find_one({"_id": ObjectId(company_id)})
        if not company:
            return jsonify({"error": "Entreprise non trouvée."}), 404
        
        status_map = {
            'verify': {'verified': True, 'status': 'active'},
            'unverify': {'verified': False, 'status': 'active'},
            'block': {'status': 'blocked'},
            'unblock': {'status': 'active'}
        }
        
        update_data = status_map[data['action']]
        update_data['updated_at'] = datetime.now()
        
        mongo.db.companies.update_one(
            {"_id": ObjectId(company_id)},
            {"$set": update_data}
        )
        
        return jsonify({
            "success": True,
            "message": f"Entreprise {data['action']} avec succès",
            "company_id": company_id,
            "status": update_data.get('status', company.get('status')),
            "verified": update_data.get('verified', company.get('verified', False))
        }), 200
        
    except Exception as e:
        logging.error(f"Error in manage_company_status: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500

@admin_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_admin_notifications():
    jwt_data = get_jwt()
    if jwt_data.get('user_type') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    # Only return untreated notifications (not approved or rejected)
    notifications = list(mongo.db.admin_notifications.find({
        "$or": [
            {"status": {"$exists": False}},  # Old notifications without status
            {"status": {"$nin": ["approved", "rejected"]}}  # New notifications that aren't processed
        ]
    }).sort("time", -1))
    
    for n in notifications:
        n['_id'] = str(n['_id'])
        # Mark as unread if not specified
        if 'unread' not in n:
            n['unread'] = True
    
    return jsonify(notifications), 200

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        # Try to delete from candidates
        result = mongo.db.candidates.delete_one({'_id': ObjectId(user_id)})
        if result.deleted_count:
            return jsonify({"success": True, "message": "Candidat supprimé"}), 200

        # Try to delete from companies
        result = mongo.db.companies.delete_one({'_id': ObjectId(user_id)})
        if result.deleted_count:
            return jsonify({"success": True, "message": "Entreprise supprimée"}), 200

        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        logging.error(f"Error deleting user: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        jwt_data = get_jwt()
        if jwt_data.get('user_type') != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        # Get total counts
        total_candidates = mongo.db.candidates.count_documents({})
        total_companies = mongo.db.companies.count_documents({})
        total_jobs = mongo.db.jobs.count_documents({})
        total_applications = mongo.db.job_applications.count_documents({})
        
        # Get pending approvals
        pending_candidates = mongo.db.candidates.count_documents({'status': 'pending'})
        pending_companies = mongo.db.companies.count_documents({'status': 'pending'})
        
        # Get active users
        active_candidates = mongo.db.candidates.count_documents({'status': 'active'})
        active_companies = mongo.db.companies.count_documents({'status': 'active'})
        
        # Get recent registrations (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_candidates = mongo.db.candidates.count_documents({
            'created_at': {'$gte': thirty_days_ago}
        })
        recent_companies = mongo.db.companies.count_documents({
            'created_at': {'$gte': thirty_days_ago}
        })
        
        stats = {
            'total_users': total_candidates + total_companies,
            'total_candidates': total_candidates,
            'total_companies': total_companies,
            'total_jobs': total_jobs,
            'total_applications': total_applications,
            'pending_approvals': pending_candidates + pending_companies,
            'pending_candidates': pending_candidates,
            'pending_companies': pending_companies,
            'active_candidates': active_candidates,
            'active_companies': active_companies,
            'recent_registrations': recent_candidates + recent_companies,
            'recent_candidates': recent_candidates,
            'recent_companies': recent_companies
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        logging.error(f"Error in get_admin_stats: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500

@admin_bp.route('/candidates/<candidate_id>/admin-cv', methods=['GET'])
@jwt_required()
def get_candidate_admin_cv(candidate_id):
    """Get candidate's admin CV file"""
    try:
        jwt_data = get_jwt()
        if jwt_data.get('user_type') != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        candidate = mongo.db.candidates.find_one({"_id": ObjectId(candidate_id)})
        if not candidate:
            return jsonify({"error": "Candidat non trouvé."}), 404
        
        admin_cv = candidate.get('adminCV')
        if not admin_cv:
            return jsonify({"error": "Aucun CV administrateur trouvé."}), 404
        
        # Return the file URL instead of serving the file directly
        return jsonify({
            "success": True,
            "admin_cv_url": f"http://localhost:5000/uploads/{admin_cv}",
            "filename": admin_cv
        }), 200
        
    except Exception as e:
        logging.error(f"Error in get_candidate_admin_cv: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500

@admin_bp.route('/candidates/<candidate_id>/admin-cv', methods=['POST'])
@jwt_required()
def upload_candidate_admin_cv(candidate_id):
    """Upload admin CV for a candidate"""
    try:
        jwt_data = get_jwt()
        if jwt_data.get('user_type') != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        candidate = mongo.db.candidates.find_one({"_id": ObjectId(candidate_id)})
        if not candidate:
            return jsonify({"error": "Candidat non trouvé."}), 404
        
        if 'adminCV' not in request.files:
            return jsonify({"error": "Aucun fichier CV fourni."}), 400
        
        file = request.files['adminCV']
        if file.filename == '':
            return jsonify({"error": "Aucun fichier sélectionné."}), 400
        
        # Check file extension
        allowed_extensions = {'pdf', 'doc', 'docx'}
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({"error": "Format de fichier non autorisé."}), 400
        
        # Generate filename
        from werkzeug.utils import secure_filename
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"admincv_{candidate_id}_{timestamp}_{filename}"
        
        # Save file
        from flask import current_app
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Update candidate record
        mongo.db.candidates.update_one(
            {"_id": ObjectId(candidate_id)},
            {"$set": {"adminCV": filename, "updated_at": datetime.now()}}
        )
        
        return jsonify({
            "success": True,
            "message": "CV administrateur uploadé avec succès",
            "filename": filename,
            "admin_cv_url": f"http://localhost:5000/uploads/{filename}"
        }), 200
        
    except Exception as e:
        logging.error(f"Error in upload_candidate_admin_cv: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500

# Replace the existing notification approval/rejection endpoints with these fixed versions:

@admin_bp.route('/notifications/<notification_id>/approve', methods=['PUT'])
@jwt_required()
def approve_notification(notification_id):
    """Approve a notification (e.g., candidate registration)"""
    try:
        jwt_data = get_jwt()
        if jwt_data.get('user_type') != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        notification = mongo.db.admin_notifications.find_one({"_id": ObjectId(notification_id)})
        if not notification:
            return jsonify({"error": "Notification non trouvée."}), 404

        # Handle different notification types
        notification_type = notification.get('type', '')
        
        if notification_type in ['candidate_registration', 'new_candidate']:
            candidate_id = notification.get('candidate_id')
            if candidate_id:
                result = mongo.db.candidates.update_one(
                    {"_id": ObjectId(candidate_id)},
                    {"$set": {"status": "active", "updated_at": datetime.now()}}
                )
                if result.modified_count:
                    # Delete notification after approval
                    mongo.db.admin_notifications.delete_one({"_id": ObjectId(notification_id)})
                    return jsonify({
                        "success": True,
                        "message": "Candidat approuvé avec succès",
                        "notification_id": notification_id,
                        "action": "approved"
                    }), 200
                else:
                    return jsonify({"error": "Candidat non trouvé."}), 404
        
        elif notification_type == 'company_registration':
            company_id = notification.get('company_id')
            if company_id:
                result = mongo.db.companies.update_one(
                    {"_id": ObjectId(company_id)},
                    {"$set": {"status": "active", "verified": True, "updated_at": datetime.now()}}
                )
                if result.modified_count:
                    # Delete notification after approval
                    mongo.db.admin_notifications.delete_one({"_id": ObjectId(notification_id)})
                    return jsonify({
                        "success": True,
                        "message": "Entreprise approuvée avec succès",
                        "notification_id": notification_id,
                        "action": "approved"
                    }), 200
                else:
                    return jsonify({"error": "Entreprise non trouvée."}), 404
        
        else:
            # Generic approval - just remove the notification
            mongo.db.admin_notifications.delete_one({"_id": ObjectId(notification_id)})
            return jsonify({
                "success": True,
                "message": "Notification approuvée avec succès",
                "notification_id": notification_id,
                "action": "approved"
            }), 200
        
    except Exception as e:
        logging.error(f"Error approving notification: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500

@admin_bp.route('/notifications/<notification_id>/reject', methods=['PUT'])
@jwt_required()
def reject_notification(notification_id):
    """Reject a notification"""
    try:
        jwt_data = get_jwt()
        if jwt_data.get('user_type') != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        notification = mongo.db.admin_notifications.find_one({"_id": ObjectId(notification_id)})
        if not notification:
            return jsonify({"error": "Notification non trouvée."}), 404

        # Handle different notification types
        notification_type = notification.get('type', '')
        
        if notification_type in ['candidate_registration', 'new_candidate']:
            candidate_id = notification.get('candidate_id')
            if candidate_id:
                mongo.db.candidates.update_one(
                    {"_id": ObjectId(candidate_id)},
                    {"$set": {"status": "rejected", "updated_at": datetime.now()}}
                )
        
        elif notification_type == 'company_registration':
            company_id = notification.get('company_id')
            if company_id:
                mongo.db.companies.update_one(
                    {"_id": ObjectId(company_id)},
                    {"$set": {"status": "rejected", "verified": False, "updated_at": datetime.now()}}
                )
        
        # Delete notification after rejection
        mongo.db.admin_notifications.delete_one({"_id": ObjectId(notification_id)})
        
        return jsonify({
            "success": True,
            "message": "Notification rejetée avec succès",
            "notification_id": notification_id,
            "action": "rejected"
        }), 200
        
    except Exception as e:
        logging.error(f"Error rejecting notification: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500
    
@admin_bp.route('/notifications/<notification_id>/mark-read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        jwt_data = get_jwt()
        if jwt_data.get('user_type') != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        result = mongo.db.admin_notifications.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": {"read": True, "read_at": datetime.now(), "updated_at": datetime.now()}}
        )
        
        if result.modified_count:
            return jsonify({
                "success": True,
                "message": "Notification marquée comme lue",
                "notification_id": notification_id
            }), 200
        else:
            return jsonify({"error": "Notification non trouvée."}), 404
        
    except Exception as e:
        logging.error(f"Error marking notification as read: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500

@admin_bp.route('/notifications', methods=['DELETE'])
@jwt_required()
def clear_all_notifications():
    """Clear all notifications"""
    try:
        jwt_data = get_jwt()
        if jwt_data.get('user_type') != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        result = mongo.db.admin_notifications.delete_many({})
        
        return jsonify({
            "success": True,
            "message": f"{result.deleted_count} notifications supprimées",
            "deleted_count": result.deleted_count
        }), 200
        
    except Exception as e:
        logging.error(f"Error clearing notifications: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500

@admin_bp.route('/notifications/<notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """Delete a specific notification"""
    try:
        jwt_data = get_jwt()
        if jwt_data.get('user_type') != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        result = mongo.db.admin_notifications.delete_one({"_id": ObjectId(notification_id)})
        
        if result.deleted_count:
            return jsonify({
                "success": True,
                "message": "Notification supprimée avec succès",
                "notification_id": notification_id
            }), 200
        else:
            return jsonify({"error": "Notification non trouvée."}), 404
        
    except Exception as e:
        logging.error(f"Error deleting notification: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500

@admin_bp.route('/notifications/bulk-approve', methods=['PUT'])
@jwt_required()
def bulk_approve_notifications():
    """Bulk approve multiple notifications"""
    try:
        jwt_data = get_jwt()
        if jwt_data.get('user_type') != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()
        notification_ids = data.get('notification_ids', [])
        
        if not notification_ids:
            return jsonify({"error": "Aucune notification sélectionnée."}), 400
        
        approved_count = 0
        failed_count = 0
        results = []
        
        for notification_id in notification_ids:
            try:
                notification = mongo.db.admin_notifications.find_one({"_id": ObjectId(notification_id)})
                if not notification:
                    results.append({"notification_id": notification_id, "status": "failed", "error": "Notification non trouvée"})
                    failed_count += 1
                    continue
                
                notification_type = notification.get('type', '')
                
                if notification_type == 'candidate_registration':
                    candidate_id = notification.get('candidate_id')
                    if candidate_id:
                        mongo.db.candidates.update_one(
                            {"_id": ObjectId(candidate_id)},
                            {"$set": {"status": "active", "updated_at": datetime.now()}}
                        )
                
                elif notification_type == 'company_registration':
                    company_id = notification.get('company_id')
                    if company_id:
                        mongo.db.companies.update_one(
                            {"_id": ObjectId(company_id)},
                            {"$set": {"status": "active", "verified": True, "updated_at": datetime.now()}}
                        )
                
                # Mark notification as approved
                mongo.db.admin_notifications.update_one(
                    {"_id": ObjectId(notification_id)},
                    {"$set": {"status": "approved", "approved_at": datetime.now(), "updated_at": datetime.now()}}
                )
                
                results.append({"notification_id": notification_id, "status": "approved"})
                approved_count += 1
                
            except Exception as e:
                results.append({"notification_id": notification_id, "status": "failed", "error": str(e)})
                failed_count += 1
        
        return jsonify({
            "success": True,
            "message": f"{approved_count} notifications approuvées, {failed_count} échouées",
            "approved_count": approved_count,
            "failed_count": failed_count,
            "results": results
        }), 200
        
    except Exception as e:
        logging.error(f"Error in bulk approve notifications: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500

@admin_bp.route('/notifications/bulk-reject', methods=['PUT'])
@jwt_required()
def bulk_reject_notifications():
    """Bulk reject multiple notifications"""
    try:
        jwt_data = get_jwt()
        if jwt_data.get('user_type') != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()
        notification_ids = data.get('notification_ids', [])
        
        if not notification_ids:
            return jsonify({"error": "Aucune notification sélectionnée."}), 400
        
        rejected_count = 0
        failed_count = 0
        results = []
        
        for notification_id in notification_ids:
            try:
                notification = mongo.db.admin_notifications.find_one({"_id": ObjectId(notification_id)})
                if not notification:
                    results.append({"notification_id": notification_id, "status": "failed", "error": "Notification non trouvée"})
                    failed_count += 1
                    continue
                
                notification_type = notification.get('type', '')
                
                if notification_type == 'candidate_registration':
                    candidate_id = notification.get('candidate_id')
                    if candidate_id:
                        mongo.db.candidates.update_one(
                            {"_id": ObjectId(candidate_id)},
                            {"$set": {"status": "rejected", "updated_at": datetime.now()}}
                        )
                
                elif notification_type == 'company_registration':
                    company_id = notification.get('company_id')
                    if company_id:
                        mongo.db.companies.update_one(
                            {"_id": ObjectId(company_id)},
                            {"$set": {"status": "rejected", "verified": False, "updated_at": datetime.now()}}
                        )
                
                # Mark notification as rejected
                mongo.db.admin_notifications.update_one(
                    {"_id": ObjectId(notification_id)},
                    {"$set": {"status": "rejected", "rejected_at": datetime.now(), "updated_at": datetime.now()}}
                )
                
                results.append({"notification_id": notification_id, "status": "rejected"})
                rejected_count += 1
                
            except Exception as e:
                results.append({"notification_id": notification_id, "status": "failed", "error": str(e)})
                failed_count += 1
        
        return jsonify({
            "success": True,
            "message": f"{rejected_count} notifications rejetées, {failed_count} échouées",
            "rejected_count": rejected_count,
            "failed_count": failed_count,
            "results": results
        }), 200
        
    except Exception as e:
        logging.error(f"Error in bulk reject notifications: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500

@admin_bp.route('/candidates/<candidate_id>/approve', methods=['POST'])
@jwt_required()
def approve_candidate(candidate_id):
    """Approve a candidate registration"""
    try:
        jwt_data = get_jwt()
        if jwt_data.get('user_type') != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        candidate = mongo.db.candidates.find_one({"_id": ObjectId(candidate_id)})
        if not candidate:
            return jsonify({"error": "Candidat non trouvé."}), 404

        # Update candidate status to active
        result = mongo.db.candidates.update_one(
            {"_id": ObjectId(candidate_id)},
            {"$set": {"status": "active", "updated_at": datetime.now()}}
        )

        if result.modified_count:
            # Remove any related notifications
            mongo.db.admin_notifications.delete_many({
                "candidate_id": candidate_id,
                "type": {"$in": ["new_candidate", "candidate_registration"]}
            })
            
            return jsonify({
                "success": True,
                "message": "Candidat approuvé avec succès",
                "candidate_id": candidate_id,
                "status": "active"
            }), 200
        else:
            return jsonify({"error": "Erreur lors de l'approbation du candidat."}), 500

    except Exception as e:
        logging.error(f"Error in approve_candidate: {str(e)}")
        return jsonify({"error": "Une erreur inattendue s'est produite."}), 500
