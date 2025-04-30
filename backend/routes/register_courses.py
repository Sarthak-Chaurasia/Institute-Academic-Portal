from flask import Blueprint, jsonify, request
from models import db, User, Admin, Department, Student, Instructor, Course, Semester, CourseOffering, Enrollment, Waitlist, Grade, Prerequisite, CourseReview, AuditLog, Tag, CompletedCourse, AllowedTag

from routes.auth import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
from flask_jwt_extended.exceptions import JWTExtendedException
from models import AllowedTag
from sqlalchemy import and_, or_
from werkzeug.exceptions import HTTPException
import traceback

# Helper function to get the current semester ID
def get_current_semester_id():
    current_semester = Semester.query.order_by(Semester.start_date.desc()).first()
    return current_semester.semester_id if current_semester else None


register_courses_bp = Blueprint('register_courses', __name__)

@register_courses_bp.route('/get_course/<course_code>', methods=['GET'])
@jwt_required()
def get_course_offerings(course_code):
    print("Fetching course offerings for course code:", course_code)
    course = Course.query.filter_by(course_id=course_code).first()
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    print("course 1:", course_code)
    offering = CourseOffering.query.filter_by(course_id=course.course_id).first()
    if not offering:
        return jsonify({'error': 'No offerings found for this course'}), 404
    print("course 2:", course_code)
    instr = Instructor.query.get(offering.instructor_id)
    user = User.query.get(instr.user_id)
    sem = Semester.query.get(offering.semester_id)
    print("course details")
    print(course.course_id, course.name, course.credits)
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
@jwt_required()
def get_tags(course_id):
    print("Fetching tags for course ID:", course_id)
    user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=user_id).first()
    print("1Fetching tags for course ID:", course_id, user_id, student)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    print("2Fetching tags for course ID:", course_id)
    student_id = student.student_id
    student_dept = student.department_id
    allowed_tags = db.session.query(Tag).join(AllowedTag, AllowedTag.tag_id == Tag.tag_id).filter(
        and_(
            AllowedTag.course_id == course_id,
            AllowedTag.department_id == student_dept,
        )
    ).all()
    print("3Fetching tags for course ID:", course_id)
    tags = [taggo.name for taggo in allowed_tags]
    return jsonify({'tags': tags}), 200

@register_courses_bp.route('/status', methods=['GET'])
@jwt_required()
def registration_status():
    user_id  = get_jwt_identity()
    student  = Student.query.filter_by(user_id=user_id).first_or_404()
    sid      = student.student_id

    out = []
    # 1) all enrolled
    for e in Enrollment.query.filter_by(student_id=sid).all():
        off = e.offering
        out.append({
          'offering_id':   off.offering_id,
          'course_id':     off.course_id,
          'course_name':   off.course.name,
          'credits':       off.course.credits,
          'semester_name': off.semester_id,
          'tag':           e.tag,
          'status':        'registered',
          'waitlist_pos':  None,
          'waitlist_total':None
        })

    # 2) all waitlisted
    for w in Waitlist.query.filter_by(student_id=sid).all():
        off   = w.offering
        total = Waitlist.query.filter_by(offering_id=off.offering_id).count()
        out.append({
          'offering_id':   off.offering_id,
          'course_id':     off.course_id,
          'course_name':   off.course.name,
          'credits':       off.course.credits,
          'semester_name': off.semester_id,
        #   'tag':           w.tag,
          'status':        'waitlisted',
          'waitlist_pos':  w.position,
          'waitlist_total':total
        })

    return jsonify(out), 200

@register_courses_bp.route('/register', methods=['POST'])
@jwt_required()
def register_course():
    user_id     = get_jwt_identity()
    student     = Student.query.filter_by(user_id=user_id).first_or_404()
    req         = request.get_json()
    offering_id = req.get('offering_id')
    tag         = req.get('tag')
    off         = CourseOffering.query.get_or_404(offering_id)

    # — prevent duplicate enroll/waitlist
    if Enrollment.query.filter_by(student_id=student.student_id, offering_id=offering_id).first() \
    or Waitlist.query.filter_by(student_id=student.student_id, offering_id=offering_id).first():
        return jsonify({'error': 'Already enrolled or waitlisted'}), 400

    if off.current_seats < off.max_seats:
        # enroll immediately
        e = Enrollment(
          student_id = student.student_id,
          offering_id= offering_id,
          status     = 'enrolled',
          tag        = tag
        )
        off.current_seats += 1
        db.session.add(e)
        db.session.commit()
        return jsonify({'status': 'registered'}), 200
    else:
        # add to waitlist
        pos = Waitlist.query.filter_by(offering_id=offering_id).count() + 1
        w = Waitlist(
          student_id = student.student_id,
          offering_id= offering_id,
          position   = pos,
          tag        = tag
        )
        db.session.add(w)
        db.session.commit()
        return jsonify({'status': 'waitlisted', 'position': pos}), 200
    
@register_courses_bp.route('/<int:offering_id>', methods=['DELETE'])
@jwt_required()
def drop_course(offering_id):
    user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=user_id).first_or_404()
    sid     = student.student_id
    off     = CourseOffering.query.get_or_404(offering_id)

    # 1) If enrolled → remove and free a seat, promote waitlist head
    e = Enrollment.query.filter_by(student_id=sid, offering_id=offering_id).first()
    if e:
        db.session.delete(e)
        off.current_seats -= 1

        # promote
        head = Waitlist.query.filter_by(offering_id=offering_id).order_by(Waitlist.position).first()
        if head:
            # create enrollment for them
            new_e = Enrollment(
              student_id = head.student_id,
              offering_id= offering_id,
              status     = 'enrolled',
              tag        = head.tag
            )
            off.current_seats += 1
            db.session.add(new_e)
            # remove from waitlist
            db.session.delete(head)

            # shift everyone up
            rest = Waitlist.query.filter(
              Waitlist.offering_id==offering_id,
              Waitlist.position> head.position
            ).all()
            for w in rest: w.position -= 1

        db.session.commit()
        return '', 204

    # 2) Else if waitlisted → remove and re-index
    w = Waitlist.query.filter_by(student_id=sid, offering_id=offering_id).first()
    if w:
        pos = w.position
        db.session.delete(w)
        rest = Waitlist.query.filter(
          Waitlist.offering_id==offering_id,
          Waitlist.position> pos
        ).all()
        for r in rest: r.position -= 1
        db.session.commit()
        return '', 204

    return jsonify({'error': 'Not enrolled or waitlisted'}), 404

@register_courses_bp.route('/<int:offering_id>', methods=['PUT'])
@jwt_required()
def change_tag(offering_id):
    user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=user_id).first_or_404()
    sid     = student.student_id

    data    = request.get_json() or {}
    new_tag = data.get('new_tag')
    if not new_tag:
        return jsonify({'error': 'new_tag is required'}), 400

    off = CourseOffering.query.get_or_404(offering_id)

    # --- 1) Remove existing enrollment or waitlist entry ---
    enrollment = Enrollment.query.filter_by(
        student_id=sid,
        offering_id=offering_id
    ).first()

    if enrollment:
        # Drop enrollment, free a seat
        db.session.delete(enrollment)
        off.current_seats -= 1

        # Promote the head of the waitlist, if any
        head = Waitlist.query.filter_by(offering_id=offering_id) \
                             .order_by(Waitlist.position) \
                             .first()
        if head:
            promoted = Enrollment(
                student_id  = head.student_id,
                offering_id = offering_id,
                status      = 'enrolled',
                tag         = head.tag
            )
            db.session.add(promoted)
            off.current_seats += 1
            # Remove them from waitlist
            original_pos = head.position
            db.session.delete(head)

            # Shift everyone else up
            followers = Waitlist.query.filter(
                Waitlist.offering_id == offering_id,
                Waitlist.position      > original_pos
            ).all()
            for w in followers:
                w.position -= 1

    else:
        # Maybe they were on the waitlist
        wait = Waitlist.query.filter_by(
            student_id=sid,
            offering_id=offering_id
        ).first()
        if wait:
            pos = wait.position
            db.session.delete(wait)

            # Re-index the rest
            followers = Waitlist.query.filter(
                Waitlist.offering_id == offering_id,
                Waitlist.position      > pos
            ).all()
            for w in followers:
                w.position -= 1
        else:
            return jsonify({'error': 'Not enrolled or waitlisted'}), 404

    # --- 2) Re-register under the new tag ---
    if off.current_seats < off.max_seats:
        # Seat available → enroll immediately
        new_enroll = Enrollment(
            student_id  = sid,
            offering_id = offering_id,
            status      = 'enrolled',
            tag         = new_tag
        )
        off.current_seats += 1
        db.session.add(new_enroll)

        db.session.commit()
        return jsonify({'status': 'registered'}), 200

    else:
        # No seats → join the end of the waitlist
        new_position = Waitlist.query.filter_by(offering_id=offering_id).count() + 1
        new_wait = Waitlist(
            student_id  = sid,
            offering_id = offering_id,
            position    = new_position,
            tag         = new_tag
        )
        db.session.add(new_wait)
        db.session.commit()
        return jsonify({
            'status':   'waitlisted',
            'position': new_position
        }), 200

@register_courses_bp.route('/search', methods=['GET'])
@jwt_required()
def search_courses():
    print("Searching for courses")
    q = request.args.get('query', '').strip()
    if not q:
        return jsonify([]), 200
    print("Query:", q)

    # find up to 10 matching courses by code or name prefix
    courses = (Course.query
               .filter(
                 or_(
                   Course.course_id.ilike(f'{q}%'),
                   Course.name.ilike(f'{q}%')
                 )
               )
               .limit(10)
               .all())
    print("Courses found:", len(courses))
    suggestions = []
    for c in courses:
        off = c.offerings.filter_by(semester_id=get_current_semester_id()).first()
        if not off:
            # this course simply isn’t offered right now
            continue

        suggestions.append({
            'offering_id':   off.offering_id,
            'course_id':     c.course_id,
            'course_name':   c.name,
            'credits':       c.credits
        })

    return jsonify(suggestions), 200

@register_courses_bp.route('/offerings', methods=['GET'])
# @jwt_required()
def get_offerings():

    print("Fetching all course offerings")
    # Get all course offerings for the current semester
    current_semester = Semester.query.order_by(Semester.start_date.desc()).first()
    offerings = CourseOffering.query.filter_by(semester_id=current_semester.semester_id).all()

    # Prepare the response data
    response_data = []
    for offering in offerings:
        course = Course.query.get(offering.course_id)
        instructor = Instructor.query.get(offering.instructor_id)
        user = User.query.get(instructor.user_id)

        response_data.append({
            'offering_id':   offering.offering_id,
            'course_id':     course.course_id,
            'course_name':   course.name,
            'credits':       course.credits,
            'semester_name': current_semester.name,
            'instructor_name': user.username,
            'max_seats':     offering.max_seats,
            'current_seats': offering.current_seats
        })
    print("Number of offerings:", len(response_data))
    return jsonify(response_data), 200






