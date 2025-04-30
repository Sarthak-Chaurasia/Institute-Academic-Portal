from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
from models import db, User, Student, Instructor, Department, Course, CourseOffering, Semester, Waitlist, Enrollment

# Assuming courses_bp is already defined in the original file

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('/departments', methods=['GET'], strict_slashes=False)
def get_departments():
    departments = Department.query.all()
    if not departments:
        return jsonify({"msg": "No departments found"}), 404
    return jsonify([dept.to_dict() for dept in departments]), 200

@courses_bp.route('/departments/<int:department_id>/courses', methods=['GET'], strict_slashes=False)
def get_courses_by_department(department_id):
    courses = Course.query.filter_by(department_id=department_id).all()
    if not courses:
        return jsonify({"msg": "No courses found for this department"}), 404
    return jsonify([course.to_dict() for course in courses]), 200

@courses_bp.route('/add-course', methods=['POST'], strict_slashes=False)
def add_course():
    try:
        data = request.get_json()
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user_role = get_jwt()['role']
        if user_role != 'admin':
            return jsonify({"msg": "Unauthorized"}), 403
        course_code = data.get('course_id') or None
        existing_course = Course.query.filter_by(course_id=course_code).first()
        if existing_course:
            return jsonify({"msg": "Course already exists"}), 400
        course_name = data.get('name') or None
        semester = data.get('semester') or None
        max_seats = data.get('max_seats') or None
        credits = data.get('credits') or None
        prerequisites = data.get('prerequisites')
        description = data.get('description') or None
        tags = data.get('tags') or None
        department_id = data.get('department_id')
        instructor_id = data.get('instructor_id')
        
        if not (course_code and course_name and tags and max_seats and credits and department_id):
            return jsonify({"msg": "Missing required fields"}), 400
        if semester and not instructor_id:
            return jsonify({"msg": "Instructor ID is required when specifying semester"}), 400

        new_course = Course(
            course_id=course_code,
            name=course_name,
            description=description,
            credits=credits,
            department_id=department_id
        )
        db.session.add(new_course)
        if semester:
            offering = CourseOffering(
                course_id=course_code,
                semester_id=semester,
                max_seats=max_seats,
                current_seats=0,
                instructor_id=instructor_id
            )
            db.session.add(offering)
        if prerequisites:
            new_course.add_prereqs_recursive(prerequisites)
        if tags:
            new_course.add_tags(tags)

        db.session.commit()
        return jsonify(new_course.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding course: {e}")
        return jsonify({"msg": "Internal server error"}), 500