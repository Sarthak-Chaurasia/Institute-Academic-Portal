from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///asc.db'  # Use PostgreSQL in production
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Replace with a secure key

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Register blueprints
from routes.auth import auth_bp
from routes.courses import courses_bp
from routes.registration import registration_bp
from routes.grading import grading_bp
from routes.analytics import analytics_bp
from routes.admin import admin_bp

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(courses_bp, url_prefix='/api')
app.register_blueprint(registration_bp, url_prefix='/api')
app.register_blueprint(grading_bp, url_prefix='/api')
app.register_blueprint(analytics_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create database tables
    app.run(debug=True)