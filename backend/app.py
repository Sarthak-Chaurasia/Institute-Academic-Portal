# app.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)
db = SQLAlchemy()
# Do NOT define db globally yet
def create_app():
    app = Flask(__name__)

    # Environment variables
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_HOST = os.getenv('DB_HOST')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME')
    print(DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Replace with a secure key

    # Initialize extensions
    db = SQLAlchemy(app)  # Initialize db with app directly here
    jwt = JWTManager(app)

    # Import models and blueprints inside app context
    with app.app_context():
        # Import models
        from models import User, Course, Enrollment, Grade, prerequisites
        # Register blueprints
        from routes.auth import auth_bp
        from routes.courses import courses_bp
        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(courses_bp, url_prefix='/courses')

        # Optional: Create tables here if needed
        # db.create_all()

    return app, db  # Return db for use in __main__

if __name__ == '__main__':
    app, db = create_app()
    with app.app_context():
        db.create_all()  # Create database tables
    app.run(debug=True)