from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app import db
from models import Course
from routes.auth import role_required

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('/courses', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    return jsonify([course.to_dict() for course in courses]), 200

@courses_bp.route('/courses', methods=['POST'])
@jwt_required()
@role_required('admin')
def add_course():
    data = request.get_json()
    course = Course(
        code=data['code'], name=data['name'], description=data.get('description'),
        credits=data['credits'], capacity=data['capacity']
    )
    db.session.add(course)
    db.session.commit()
    return jsonify(course.to_dict()), 201