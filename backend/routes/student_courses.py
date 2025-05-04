from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
from models import db, User, Student, CompletedCourse, Prerequisite, Course
from routes.auth import role_required

student_courses_bp = Blueprint('student_courses', __name__)

@student_courses_bp.route('/student/completed_courses', methods=['GET'])
@jwt_required()
def get_completed_courses():
    """Retrieve all completed courses for the authenticated student."""
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user_role = get_jwt()['role']

        if user_role != 'student':
            return jsonify({"msg": "Only students can access completed courses"}), 403

        student = Student.query.filter_by(user_id=user_id).first()
        if not student:
            return jsonify({"msg": "Student not found"}), 404

        completed_courses = CompletedCourse.query.filter_by(
            student_id=student.student_id
        ).all()

        # Return list of course IDs with status
        return jsonify({
            "completed": [
                {
                    "course_id": cc.course_id,
                    "status": cc.status
                } for cc in completed_courses
            ]
        }), 200

    except Exception as e:
        return jsonify({"msg": f"Error retrieving completed courses: {str(e)}"}), 500

@student_courses_bp.route('/courses/prerequisites', methods=['GET'])
@jwt_required()
def get_prerequisites():
    """Retrieve all course prerequisites."""
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user_role = get_jwt()['role']

        if user_role != 'student':
            return jsonify({"msg": "Only students can access prerequisites"}), 403

        # Fetch all prerequisites and group by course_id
        prerequisites = Prerequisite.query.all()
        prereq_map = {}
        for prereq in prerequisites:
            if prereq.course_id not in prereq_map:
                prereq_map[prereq.course_id] = []
            prereq_map[prereq.course_id].append(prereq.prereq_course_id)

        # Return prerequisites as a list of objects with course_id and prereqs
        return jsonify([
            {
                "course_id": course_id,
                "prereqs": prereqs
            } for course_id, prereqs in prereq_map.items()
        ]), 200

    except Exception as e:
        return jsonify({"msg": f"Error retrieving prerequisites: {str(e)}"}), 500