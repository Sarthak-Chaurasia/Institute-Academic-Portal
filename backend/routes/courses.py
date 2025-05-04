from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
from models import db, User, Student, Instructor, Department, Course, CourseOffering, Semester, Waitlist, Enrollment, Task, TaskMark, Grade # Import from models
from routes.auth import role_required

courses_bp = Blueprint('courses', __name__)

def get_grade(marks,grading_scheme):
    if grading_scheme == 'absolute':
        if marks >= 90:
            return "AA"
        elif marks >= 80:
            return "AB"
        elif marks >= 70:
            return "BB"
        elif marks >= 60:
            return "BC"
        elif marks >= 50:
            return "CC"
        elif marks >= 40:
            return "CD"
        elif marks >= 30:
            return "DD"
        else:
            return "FR"
    # elif grading_scheme == 'relative':

@courses_bp.route('/departments', methods=['GET'])
@jwt_required()
def get_departments():
    departments = Department.query.all()
    return jsonify([{'id': dept.department_id, 'name': dept.name} for dept in departments]), 200

@courses_bp.route('', methods=['GET'],strict_slashes=False)
def get_courses():
    courses = Course.query.all()
    if not courses:
        return jsonify({"msg": "No courses found"}), 404
    else :
        print(f"Found {len(courses)} courses")
    return jsonify([course.to_dict() for course in courses]), 200

@courses_bp.route('/department/<department_id>', methods=['GET'])
@jwt_required()
def get_courses_by_department(department_id):
    courses = Course.query.filter_by(department_id=department_id).all()
    if not courses:
        return jsonify({"msg": f"No courses found for department {department_id}"}), 404
    return jsonify([course.to_dict() for course in courses]), 200


@courses_bp.route('/mycourses', methods=['GET'], strict_slashes=False)
def get_my_courses():
    # print("HEADERS:", dict(request.headers))
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    user_role = get_jwt()['role']
    user = User.query.filter_by(user_id=user_id).first()
    if user_role == 'student':
        query = Student.query.filter_by(user_id=user_id).first()
    elif user_role == 'instructor':
        query = Instructor.query.filter_by(user_id=user_id).first()
    else:
        return jsonify({"msg": "Invalid role"}), 400
    # if user_role == 'student':
    #     courses = query.courses
    if user_role == 'instructor':
        courses = query.offerings
    else:
        return jsonify({"msg": "Invalid role"}), 400
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
        if(not course_code or not course_name or not tags or not max_seats or not credits):
            return jsonify({"msg": "Missing required fields"}), 400
        
        instructor_id = Instructor.query.filter_by(user_id=user_id).first().user_id if user_role == 'instructor' else None
        department_id = Instructor.query.filter_by(user_id=user_id).first().department_id if user_role == 'instructor' else None

        new_course = Course(course_id=course_code, name=course_name, description=description, credits=credits, department_id=department_id)
        db.session.add(new_course)
        if semester:
            new_course.offerings = CourseOffering(
                semester_id=semester,
                max_seats=max_seats,
                current_seats=0,
                instructor_id=instructor_id,
            )
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
    
@courses_bp.route('/edit-course', methods=['POST'], strict_slashes=False)
def edit_course():
    try:
        data = request.get_json()
        # print("[DEBUG] Received data:", data)

        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user_role = get_jwt()['role']
        # print(f"[DEBUG] JWT verified. User ID: {user_id}, Role: {user_role}")

        if user_role == 'admin':
            previous_course_code = data.get('prev_course_id') or None
            course_code = data.get('course_id') or None
            print(f"[DEBUG] Previous Course Code: {previous_course_code}, New Course Code: {course_code}")

            existing_course = Course.query.filter_by(course_id=previous_course_code).first()
            if not existing_course:
                print("[DEBUG] Course does not exist.")
                return jsonify({"msg": "Course does not exist"}), 400

            print("[DEBUG] Fetched existing course successfully.")

            course_name = data.get('name') or None
            prev_semester = data.get('prev_semester') or None
            semester = data.get('semester') or None
            max_seats = data.get('max_seats') or None
            credits = data.get('credits') or None
            prerequisites = data.get('prerequisites') 
            description = data.get('description') or None
            tags = data.get('tags') or None

            instructor_id = data.get('instructor_id') or None
            department_id = data.get('department_id') or None

            print(f"[DEBUG] Input Instructor ID: {instructor_id}, Department ID: {department_id}")

            if not department_id and instructor_id:
                instructor = Instructor.query.filter_by(instructor_id=instructor_id).first()
                if instructor:
                    department_id = instructor.department_id
                    print(f"[DEBUG] Retrieved Department ID from Instructor: {department_id}")
                else:
                    print("[DEBUG] Instructor not found, department ID could not be set.")
            else:
                department_id = None
                print("[DEBUG] Department ID explicitly set to None.")

            if course_code:
                if Course.query.filter_by(course_id=course_code).first():
                    print("[DEBUG] Course code already exists.")
                    return jsonify({"msg": "Course code already exists"}), 400
                existing_course.course_id = course_code
                print("[DEBUG] Course code updated.")

            if course_name:
                if Course.query.filter_by(name=course_name).first():
                    print("[DEBUG] Course name already exists.")
                    return jsonify({"msg": "Course name already exists"}), 400
                existing_course.name = course_name
                print("[DEBUG] Course name updated.")

            if description:
                existing_course.description = description
                print("[DEBUG] Description updated.")

            if credits:
                existing_course.credits = credits
                print("[DEBUG] Credits updated.")

            if department_id:
                existing_course.department_id = department_id
                print("[DEBUG] Department ID updated.")

            offering = None
            if prev_semester and course_code:
                offering = CourseOffering.query.filter_by(course_id=course_code, semester_id=prev_semester).first()
            elif prev_semester and previous_course_code:
                offering = CourseOffering.query.filter_by(course_id=previous_course_code, semester_id=prev_semester).first()

            if offering:
                print(f"[DEBUG] Existing offering found for course_id={previous_course_code}, semester={prev_semester}")
                if semester and offering.semester_id != semester:
                    offering.semester_id = semester
                    print("[DEBUG] Semester updated to" f"{offering.semester_id}.")
                if max_seats and offering.max_seats != max_seats:
                    offering.max_seats = max_seats
                    print("[DEBUG] Max seats updated.")
                if instructor_id and offering.instructor_id != instructor_id:
                    offering.instructor_id = instructor_id
                    print("[DEBUG] Instructor ID updated.")
            else:
                if semester and max_seats and instructor_id:
                    new_offering = CourseOffering(
                        course_id=previous_course_code,
                        semester_id=semester,
                        max_seats=max_seats,
                        current_seats=0,
                        instructor_id=instructor_id
                    )
                    db.session.add(new_offering)
                    print(f"[DEBUG] New CourseOffering created for course_id={previous_course_code}, semester={semester}")
                elif not semester and not instructor_id and not max_seats:
                    print("[DEBUG] NO update for offering filed")
                else:
                    print("[DEBUG] Missing semester/instructor/max_seats fields for new offering.")
                    return jsonify({"msg": "Missing semester fields required for course"}), 400

            if prerequisites:
                existing_course.edit_prereqs_recursive(prerequisites)
                print("[DEBUG] Prerequisites updated.")

            if tags:
                existing_course.edit_tags(tags)
                print("[DEBUG] Tags updated.")

            db.session.commit()
            print("[DEBUG] DB commit successful.")
            return jsonify(existing_course.to_dict()), 200
        elif user_role == 'instructor':
            previous_course_code = data.get('prev_course_id') or None
            print(f"[DEBUG] Previous Course Code: {previous_course_code}")
            existing_course = Course.query.filter_by(course_id=previous_course_code).first()
            if not existing_course:
                print("[DEBUG] Course does not exist.")
                return jsonify({"msg": "Course does not exist"}), 400
            prerequisites = data.get('prerequisites')
            description = data.get('description') or None
            if description:
                existing_course.description = description
                print("[DEBUG] Description updated.") 
            if prerequisites:
                existing_course.edit_prereqs_recursive(prerequisites)
                print("[DEBUG] Prerequisites updated.")
            db.session.commit()
            print("[DEBUG] DB commit successful.")
            return jsonify(existing_course.to_dict()), 200
        else:
            print("[DEBUG] User role is not admin or instructor.")
            return jsonify({"msg": "You are not authorized to perform this action"}), 403
    

    except Exception as e:
        print("[ERROR]", str(e))
        return jsonify({"msg": "Error editing course", "error": str(e)}), 500

@courses_bp.route('/<course_id>/wl_enrl', methods=['POST'], strict_slashes=False)
def wl_enrl_course(course_id):
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    user_role = get_jwt()['role']
    course = Course.query.filter_by(course_id=course_id).first()
    if not course:
        return jsonify({"msg": "Course not found"}), 404
    if user_role == 'instructor':
        instructor_id = Instructor.query.filter_by(user_id=user_id).first().instructor_id
        current_semester = Semester.query.order_by(Semester.start_date.desc()).first()
        offering = CourseOffering.query.filter_by(course_id=course_id, instructor_id=instructor_id, semester_id=current_semester.semester_id).all()[0]
        if not offering:
            # print(f"Found {len(offering)} offerings for instructor {instructor_id}")
            return jsonify({"msg": "No offerings found for this course"}), 404
        action = request.args.get('action')
        student_id = request.args.get('student_id')
        offering_id = offering.offering_id
        if student_id == 'all' and action == 'clear_waitlist':
            waitlist_entries = Waitlist.query.filter_by(offering_id=offering_id).all()
            for entry in waitlist_entries:
                db.session.delete(entry)
            db.session.commit()
            return jsonify({"msg": "All students have been removed from the waitlist"}), 200
        waitlist_entry = Waitlist.query.filter_by(offering_id=offering_id, student_id=student_id).first()
        enrollment_entry = Enrollment.query.filter_by(offering_id=offering_id, student_id=student_id).first()

        if action == 'decline':
            db.session.delete(waitlist_entry)
            db.session.commit()
            return jsonify({"msg": "Student has been removed from the waitlist"}), 200
        elif action == 'accept':
            tag = waitlist_entry.tag
            enrollment = Enrollment(
                student_id=student_id,
                offering_id=offering.offering_id,
                tag=tag,
                status='enrolled'
            )
            db.session.add(enrollment)
            db.session.delete(waitlist_entry)
            db.session.commit()

            return jsonify({"msg": "Student has been enrolled and removed from the waitlist"}), 200
        elif action == 'kick':
            if enrollment_entry:
                db.session.delete(enrollment_entry)
                db.session.commit()
                return jsonify({"msg": "Student has been removed from the course"}), 200
            else:
                return jsonify({"msg": "Student is not enrolled in this course"}), 404
        elif action == 'marks':
            data = request.get_json()
            name = data.get('name')
            marks = data.get('marks')
            task = Task.query.filter_by(name=name, offering_id=offering_id).first()
            if not task:
                return jsonify({"msg": "Task not found"}), 404
            task_id = task.task_id
            enrollment_id = Enrollment.query.filter_by(offering_id=offering_id, student_id=student_id).first().enrollment_id
            taskmark = TaskMark.query.filter_by(task_id=task_id, enrollment_id=enrollment_id).first()
            if taskmark:
                taskmark.marks_obtained = marks
                db.session.commit()
                return jsonify({"msg": "Marks updated successfully"}), 200
            else:
                taskmark = TaskMark(
                    task_id=task_id,
                    enrollment_id=enrollment_id,
                    marks_obtained=marks
                )
                db.session.add(taskmark)
                db.session.commit()
                return jsonify({"msg": "Marks added successfully"}), 201
        else:
            return jsonify({"msg": "Invalid action"}), 400
    else:
        return jsonify({"msg": "You are not authorized to perform this action"}), 403
            
@courses_bp.route('/<course_id>/tasks', methods=['GET'], strict_slashes=False)
def get_course_tasks(course_id):
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user_role = get_jwt()['role']
        print(f"User ID: {user_id}, Role: {user_role}") 
        print(f"Course ID: {course_id}")
        current_semester = Semester.query.order_by(Semester.start_date.desc()).first()
        print(f"Current Semester: {current_semester.semester_id}")
        offerings = CourseOffering.query.filter_by(course_id=course_id, semester_id=current_semester.semester_id).first()
        if not offerings:
            return jsonify({"msg": "Course offering not found for given course_id,sem_id"}), 404
        if user_role == 'instructor':
            instructor_id = Instructor.query.filter_by(user_id=user_id).first().instructor_id
            offering = CourseOffering.query.filter_by(course_id=course_id, instructor_id=instructor_id, semester_id=current_semester.semester_id).first()
            if not offering:
                return jsonify({"msg": "No offerings found for this course for you for course,sem_id,instructor_id"}), 404
            tasks = offering.tasks
            for task in tasks:
                print(task.to_dict())
            return jsonify([task.to_dict() for task in tasks]), 200
        else:
            return jsonify({"msg": "You are not authorized to perform this action"}), 403
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"msg": "Internal server error"}), 500
    
@courses_bp.route('/<course_id>/tasks', methods=['POST'], strict_slashes=False)
def add_course_task(course_id):
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user_role = get_jwt()['role']
        current_semester = Semester.query.order_by(Semester.start_date.desc()).first()
        if user_role == 'instructor':
            instructor_id = Instructor.query.filter_by(user_id=user_id).first().instructor_id
            offering = CourseOffering.query.filter_by(course_id=course_id, instructor_id=instructor_id, semester_id=current_semester.semester_id).first()
            if not offering:
                return jsonify({"msg": "No offerings found for this course for you for course,sem_id,instructor_id"}), 404
            data = request.get_json()
            print(f"Data received: {data}")
            prev_name = data.get('prev_name') or None
            name = data.get('name')
            max_marks = data.get('max_marks') or None
            due_date = data.get('due_date') or None
            existing_task = Task.query.filter_by(name=prev_name, offering_id=offering.offering_id).first()
            if existing_task:
                print(f"Existing task found: {existing_task.to_dict()}")
                action = data.get('action')
                if action == 'delete':
                    db.session.delete(existing_task)
                    db.session.commit()
                    return jsonify({"msg": "Task deleted successfully"}), 200
                if name is not None and name != existing_task.name:
                    existing_task.name = name
                if max_marks is not None and max_marks != existing_task.max_marks:
                    existing_task.max_marks = max_marks
                if due_date is not None and due_date != existing_task.due_date:
                    existing_task.due_date = due_date
                # total_marks = db.session.query(db.func.coalesce(db.func.sum(Task.max_marks), 0)).filter_by(offering_id=offering.offering_id).scalar()
                # if max_marks is not None and total_marks + float(max_marks) > 100:
                #     print(f"Total max marks for tasks exceeds 100: {total_marks}")
                #     return jsonify({"msg": "Total max marks for tasks exceeds 100"}), 400
                db.session.commit()
                return jsonify(existing_task.to_dict()), 200
            else:
                if not name or not max_marks or not due_date:
                    return jsonify({"msg": "Missing required fields"}), 400
                new_task = Task(
                    offering_id=offering.offering_id,
                    name=name,
                    max_marks=max_marks,
                    due_date=due_date,
                )
                # total_marks = db.session.query(db.func.coalesce(db.func.sum(Task.max_marks), 0)).filter_by(offering_id=offering.offering_id).scalar()
                # if total_marks + float(max_marks) > 100:
                #     print(f"Total max marks for tasks exceeds 100: {total_marks}")
                #     return jsonify({"msg": "Total max marks for tasks exceeds 100"}), 400
                db.session.add(new_task)
                db.session.commit()
                return jsonify(new_task.to_dict()), 201
        else:
            return jsonify({"msg": "You are not authorized to perform this action"}), 403
    except Exception as e:
        print(f"Error: {e}")
        # db.session.rollback()
        return jsonify({"msg": "Internal server error"}), 500
    
@courses_bp.route('/<course_id>', methods=['GET'], strict_slashes=False)
def get_course(course_id):
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    user_role = get_jwt()['role']
    course = Course.query.filter_by(course_id=course_id).first()
    need_offerings = request.args.get('need_offerings')
    if not course:
        return jsonify({"msg": "Course not found"}), 404
    if user_role == 'instructor' and need_offerings=='true':
        instructor_id = Instructor.query.filter_by(user_id=user_id).first().instructor_id
        offerings = CourseOffering.query.filter_by(course_id=course_id, instructor_id=instructor_id).all()
        result = []
        for offering in offerings:
            enrollments = Enrollment.query.filter_by(offering_id=offering.offering_id).all()
            offering_dict = offering.to_dict()
            offering_dict['waitlists'] = [w.to_dict() for w in offering.waitlists]
            offering_dict['enrollments'] = []
            for enrollment in enrollments:
                enrollment_id = enrollment.enrollment_id
                grade = Grade.query.filter_by(enrollment_id=enrollment_id).first()
                taskmarks = TaskMark.query.filter_by(enrollment_id=enrollment_id).all()
                total_marks = 0
                for taskmark in taskmarks:
                    max_marks = taskmark.task.max_marks
                    marks = taskmark.marks_obtained * max_marks / 100 if max_marks > 0 else 0
                    total_marks += marks
                enrollment_dict = enrollment.to_dict()
                enrollment_dict['grade'] = grade.to_dict() if grade else "NA"
                enrollment_dict['total_marks'] = total_marks
                offering_dict['enrollments'].append(enrollment_dict)
            result.append(offering_dict)
        print(f"Found {len(result)} offerings for instructor {instructor_id}")
        return jsonify(result), 200
    elif user_role == 'admin' or user_role == 'instructor':
        offerings = course.offerings
        prerequisites = course.prerequisites
        allowed_tags = course.allowed_tags
        if offerings:
            offerings = [offering.to_dict() for offering in offerings]
        if prerequisites:
            prerequisites = [prereq.to_dict() for prereq in prerequisites]
        if allowed_tags:
            allowed_tags = [tag.to_dict() for tag in allowed_tags]
        course_dict = course.to_dict()
        course_dict['offerings'] = offerings
        course_dict['prerequisites'] = prerequisites
        course_dict['allowed_tags'] = allowed_tags
        return jsonify(course_dict), 200
    

    return jsonify(course.to_dict()), 200

@courses_bp.route('/<course_id>', methods=['POST'], strict_slashes=False)

def update_course(course_id):
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    user_role = get_jwt()['role']
    course = Course.query.filter_by(course_id=course_id).first()
    if not course:
        return jsonify({"msg": "Course not found"}), 404
    if user_role == 'admin':
        data = request.get_json()
        course.name = data.get('name', course.name)
        course.description = data.get('description', course.description)
        db.session.commit()
        return jsonify(course.to_dict()), 200
    elif user_role == 'instructor':
        instructor_id = Instructor.query.filter_by(user_id=user_id).first().instructor_id
        current_semester = Semester.query.order_by(Semester.start_date.desc()).first()
        offering = CourseOffering.query.filter_by(course_id=course_id, instructor_id=instructor_id, semester_id=current_semester.semester_id).first()
        if not offering:
            return jsonify({"msg": "No offerings found for this course"}), 404  
        enrollments = Enrollment.query.filter_by(offering_id=offering.offering_id).all()
        grading_scheme = request.args.get('grading_scheme')
        for enrollment in enrollments:
            grade_entry = Grade.query.filter_by(enrollment_id=enrollment.enrollment_id).first()
            total_marks = 0
            taskmarks = TaskMark.query.filter_by(enrollment_id=enrollment.enrollment_id).all()
            for taskmark in taskmarks:
                max_marks = taskmark.task.max_marks
                marks = taskmark.marks_obtained * max_marks / 100 if max_marks > 0 else 0
                total_marks += marks
            print(f"Total marks for enrollment {enrollment.enrollment_id}: {total_marks}")
            print(f"Grading scheme: {grading_scheme}")
            new_grade = get_grade(total_marks,grading_scheme)
            if grade_entry:
                grade_entry.grade = new_grade
            else:
                new_grade_entry = Grade(
                    enrollment_id=enrollment.enrollment_id,
                    grade=new_grade
                )
                db.session.add(new_grade_entry)
            # enrollment.status = 'completed'
            db.session.commit()
        return jsonify({"msg": "Grades updated successfully"}), 200
    else:
        return jsonify({"msg": "You are not authorized to perform this action"}), 403
