from flask import Blueprint, jsonify, request
from models import db, User, Admin, Department, Student, Instructor, Course, Semester, CourseOffering, Enrollment, Waitlist, Grade, Prerequisite, CourseReview, AuditLog, Tag, CompletedCourse, AllowedTag

from routes.auth import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
from models import AllowedTag
from sqlalchemy import and_


register_courses_bp = Blueprint('register_courses', __name__)

@register_courses_bp.route('/get_course/<course_code>', methods=['GET'])
def get_course_offerings(course_code):
    course = Course.query.filter_by(course_id=course_code).first()
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    offering = CourseOffering.query.filter_by(course_id=course.course_id).first()
    if not offering:
        return jsonify({'error': 'No offerings found for this course'}), 404

    instr = Instructor.query.get(offering.instructor_id)
    user = User.query.get(instr.user_id)
    sem = Semester.query.get(offering.semester_id)

    return jsonify({
        'course_id':   course.course_id,
        'course_name': course.name,
        'credits':     course.credits,
        'offering_id': offering.offering_id,
        'semester_id': sem.semester_id,
        'semester_name': sem.name,
        'instructor_id': instr.instructor_id,
        'instructor_name': user.username,
        'max_seats':   offering.max_seats,
        'current_seats': offering.current_seats
    }), 200

@register_courses_bp.route('/check/<course_id>', methods=['GET'])
def check_eligibility(course_id):
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    user_role = get_jwt()['role']
    student_id = Student.query.filter_by(user_id=user_id).first().student_id
    if not student_id:
        return jsonify({'error': 'Student not found'}), 404
    
    prereq_ids = Prerequisite.query.filter_by(course_id=course_id).all()
    

    # Check if there are any prerequisites not completed
    incomplete_prereqs = Prerequisite.query.filter_by(
        and_(
            Prerequisite.course_id == course_id,
            ~CompletedCourse.query.filter_by(
                student_id=student_id,
                status='passed'
            ).filter(CompletedCourse.course_id == Prerequisite.prereq_course_id).exists()
        )
    ).count()

    prereq_completed = incomplete_prereqs == 0

    passed_before = CompletedCourse.query.filter_by(student_id=student_id, course_id=course_id, status='passed').first()
    if passed_before:
        return jsonify({'allowed': False, 'reason': 'Already completed this course successfully'}), 200
    

    # if not prereq_completed:
    #     return jsonify({'allowed': False, 'reason': 'Missing prerequisites'}), 200

    return jsonify({'allowed': True, 'reason': ''}), 200

#dept check karna bhool gayi rip
@register_courses_bp.route('/tags/<course_id>', methods=['GET'])
def get_tags(course_id):
    # verify_jwt_in_request()
    # user_id = get_jwt_identity()
    # user_role = get_jwt()['role']
    print("checking tags")
    # Get the allowed tags for the given course by joining with the Tag table
    allowed_tags = db.session.query(Tag).join(AllowedTag, AllowedTag.tag_id == Tag.tag_id).filter(AllowedTag.course_id == course_id).all()
    tags = [taggo.name for taggo in allowed_tags]
    return jsonify({'tags': tags}), 200
