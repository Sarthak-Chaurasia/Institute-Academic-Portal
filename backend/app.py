import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, User, Course, Enrollment, Grade  # Import models
from datetime import timedelta

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)

def create_app():
    app = Flask(__name__)
    # CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    # CORS(app, resources={r"/api/*": {
    # "origins": "http://localhost:3000",
    # "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    # "allow_headers": ["Content-Type", "Authorization"],}},supports_credentials=True)
    CORS(app, supports_credentials=True)  # For allowing all origins




    # Environment variables
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_HOST = os.getenv('DB_HOST')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME')

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Replace with a secure key
    app.config["JWT_ACCESS_TOKEN_EXPIRES"]  = timedelta(minutes=15)    # short-lived
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)       # long-lived
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 20,
    'max_overflow': 10,
    'pool_timeout':10,   # Optional: timeout (in seconds) for getting a connection from the pool
    'pool_recycle': 1800  # Optional: recycle connections after 30 minutes
}

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.courses import courses_bp
    from routes.register import register_bp
    from routes.register_courses import register_courses_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(register_bp, url_prefix='/api/register')
    app.register_blueprint(register_courses_bp, url_prefix='/api/register_courses')
    # Create tables
    with app.app_context():
        db.create_all()
        

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
