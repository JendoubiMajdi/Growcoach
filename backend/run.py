#!/usr/bin/env python3
"""
GrowCoach Flask Application Entry Point
"""
import os
from app import create_app

# Create the Flask application instance
app = create_app()

if __name__ == '__main__':
    # Development server configuration
    debug_mode = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    port = int(os.getenv('FLASK_PORT', 5000))
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    
    print(f"Starting GrowCoach Flask server on {host}:{port}")
    print(f"Debug mode: {debug_mode}")
    
    app.run(
        host=host,
        port=port,
        debug=debug_mode,
        threaded=True
    )
