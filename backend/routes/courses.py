from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models import db, Course  # Import from models
from routes.auth import role_required

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('/', methods=['GET'])
def get_courses():
    print("Hitting /courses")
    courses = Course.query.all()
    if not courses:
        return jsonify({"msg": "No courses found"}), 404
    else :
        print(f"Found {len(courses)} courses")
    return jsonify([course.to_dict() for course in courses]), 200

@courses_bp.route('/', methods=['POST'])
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