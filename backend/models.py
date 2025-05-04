from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# file has models for
# User, Admin, Department, Student, Instructor, Course, Semester, CourseOffering, Enrollment, Waitlist, Grade, Prerequisite, CourseReview, AuditLog, Tag, CompletedCourse, AllowedTag
# and their relationships
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=True)

    __table_args__ = (
        db.CheckConstraint("role IN ('student', 'instructor', 'admin')", name='check_valid_role'),
        db.Index('idx_user_id', 'user_id'),
    )

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def set_email(self, email):
        self.email = email

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {'user_id': self.user_id, 'username': self.username, 'role': self.role, 'email': self.email}

class Admin(db.Model):
    __tablename__ = 'admins'

    admin_id = db.Column(db.String, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), unique=True, nullable=False)

    user = db.relationship('User', backref=db.backref('admin', uselist=False, cascade="all, delete-orphan"))

class Department(db.Model):
    __tablename__ = 'departments'

    department_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

    courses = db.relationship('Course', backref='department', lazy='dynamic', cascade="all, delete-orphan")
    instructors = db.relationship('Instructor', backref='department', lazy='dynamic', cascade="all, delete-orphan")
    students = db.relationship('Student', backref='department', lazy='dynamic', cascade="all, delete-orphan")

class Student(db.Model):
    __tablename__ = 'students'

    student_id = db.Column(db.String, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), unique=True, nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.department_id', ondelete='CASCADE'), nullable=False)

    program = db.Column(db.String(50), nullable=False)
    year_of_admission = db.Column(db.Integer, nullable=False)

    contact_number = db.Column(db.BigInteger, nullable=True)
    hostel_room = db.Column(db.String(50), nullable=True)
    dob = db.Column(db.Date, nullable=True)
    nationality = db.Column(db.String(50), nullable=True)
    additional_personal_info = db.Column(db.Text, nullable=True)

    user = db.relationship('User', backref=db.backref('student', uselist=False, cascade="all, delete-orphan"))
    # courses = db.relationship('Course', secondary='completed_courses', backref='students', lazy='dynamic')
    # grades = db.relationship('Grade', backref='student', lazy='dynamic', cascade="all, delete-orphan")
    # enrollments = db.relationship('Enrollment', backref='student', lazy='dynamic', cascade="all, delete-orphan")
    # waitlists = db.relationship('Waitlist', backref='student', lazy='dynamic', cascade="all, delete-orphan")

    __table_args__ = (
        db.UniqueConstraint('student_id', name='uq_student_id'),
        db.Index('idx_student_id', 'student_id'),
    )

    def __init__(self, user_id, department_id, program, year_of_admission,
                 contact_number=None, hostel_room=None, dob=None, nationality=None, additional_personal_info=None):
        self.user_id = user_id
        self.department_id = department_id
        self.program = program
        self.year_of_admission = year_of_admission
        self.contact_number = contact_number
        self.hostel_room = hostel_room
        self.dob = dob
        self.nationality = nationality
        self.additional_personal_info = additional_personal_info

        self.student_id = self.generate_student_id()

    def generate_student_id(self):
        yy = str(self.year_of_admission)[-2:]
        p = self.program[0].upper()
        dd = f"{self.department_id:02d}"

        # Count how many students already exist with same year, program, dept
        count = Student.query.filter_by(
            year_of_admission=self.year_of_admission,
            program=self.program,
            department_id=self.department_id
        ).count()

        nn = f"{count + 1:02d}"

        return f"{yy}{p}{dd}{nn}"

class Instructor(db.Model):
    __tablename__ = 'instructors'

    instructor_id = db.Column(db.String, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), unique=True, nullable=False)
    # name = db.Column(db.String(100), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.department_id', ondelete='CASCADE'), nullable=False)
    research_areas = db.Column(db.Text)

    user = db.relationship('User', backref=db.backref('instructor', uselist=False, cascade="all, delete-orphan"))
    offerings = db.relationship('CourseOffering', backref='instructor', lazy='dynamic', cascade="all, delete-orphan")


    def instructor_id_generator(self):
        return self.user.username + '_' + str(self.user.user_id)
    
    def __init__(self, user_id, department_id, instructor_id, research_areas=None):
        self.user_id = user_id
        self.department_id = department_id
        self.instructor_id = instructor_id or self.instructor_id_generator()
        self.research_areas = research_areas

class Course(db.Model):
    __tablename__ = 'courses'

    course_id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    credits = db.Column(db.Integer, nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.department_id', ondelete='CASCADE'), nullable=False)

    __table_args__ = (
        db.CheckConstraint('credits > 0', name='check_credits_positive'),
        db.Index('idx_course_id', 'course_id'),
    )

    prerequisites = db.relationship('Prerequisite', backref='course', lazy='dynamic', cascade="all, delete-orphan", foreign_keys='[Prerequisite.course_id]')
    offerings = db.relationship('CourseOffering', backref='course', lazy='dynamic', cascade="all, delete-orphan")
    allowed_tags = db.relationship('AllowedTag', backref='course_for_tag', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'course_id': self.course_id,
            'name': self.name,
            'description': self.description,
            'credits': self.credits,
            'department_id': self.department_id
        }
    def add_prereqs_recursive(self, prereq_course_ids):
        visited = set()
        queue = list(prereq_course_ids)

        while queue:
            current = queue.pop(0)
            
            if current == str(self.course_id):  # prevent self-reference
                continue

            if current in visited:
                continue
            visited.add(current)

            if Prerequisite.query.filter_by(
                course_id=self.course_id,
                prereq_course_id=current
            ).first():
                continue

            self.prerequisites.append(Prerequisite(
                course_id=self.course_id,
                prereq_course_id=current
            ))

            indirects = Prerequisite.query.with_entities(
                Prerequisite.prereq_course_id
            ).filter_by(course_id=current).all()
            queue.extend([pr[0] for pr in indirects])

    def edit_prereqs_recursive(self, prereq_course_ids):
        for cid in prereq_course_ids:
            is_removal = isinstance(cid, str) and cid.startswith('-')
            course_id = cid[1:] if is_removal else cid

            if is_removal:
                Prerequisite.query.filter_by(
                    course_id=self.course_id,
                    prereq_course_id=course_id
                ).delete()
            else:
                self.add_prereqs_recursive([course_id])

    def add_tags(self, tag_entries):
        for entry in tag_entries:
            if '=' in entry:
                tag_base, dept_part = entry.split('=')
                dept_ids = [int(d.strip()) for d in dept_part.split(',')]
            else:
                tag_base = entry.strip()
                dept_ids = [0]  # All departments by default

            tag = Tag.query.filter_by(name=tag_base).first()
            if not tag:
                raise ValueError(f"Tag '{tag_base}' not found.")

            for dept_id in dept_ids:
                allowed_tag = AllowedTag(
                    department_id=dept_id,
                    tag_id=tag.tag_id
                )
                self.allowed_tags.append(allowed_tag)

    def edit_tags(self, tag_entries):
        for entry in tag_entries:
            is_removal = entry.startswith('-')
            raw = entry[1:] if is_removal else entry

            if '=' in raw:
                tag_base, dept_part = raw.split('=')
                dept_ids = [int(d.strip()) for d in dept_part.split(',')]
            else:
                tag_base = raw.strip()
                dept_ids = [0]  # Default to all depts

            tag = Tag.query.filter_by(name=tag_base).first()
            if not tag:
                raise ValueError(f"Tag '{tag_base}' not found.")

            for dept_id in dept_ids:
                if is_removal:
                    AllowedTag.query.filter_by(
                        department_id=dept_id,
                        tag_id=tag.tag_id,
                        course_id=self.course_id
                    ).delete()
                else:
                    self.allowed_tags.append(AllowedTag(
                        department_id=dept_id,
                        tag_id=tag.tag_id
                    ))

class Semester(db.Model):
    __tablename__ = 'semesters'

    semester_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    add_deadline = db.Column(db.Date, nullable=False)
    drop_deadline = db.Column(db.Date, nullable=False)

class CourseOffering(db.Model):
    __tablename__ = 'course_offerings'

    offering_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    course_id = db.Column(db.String, db.ForeignKey('courses.course_id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False)
    semester_id = db.Column(db.Integer, db.ForeignKey('semesters.semester_id', ondelete='CASCADE'), nullable=False)
    instructor_id = db.Column(db.Integer, db.ForeignKey('instructors.instructor_id', ondelete='CASCADE'), nullable=False)
    max_seats = db.Column(db.Integer, nullable=False)
    current_seats = db.Column(db.Integer, nullable=False, default=0)

    __table_args__ = (
        db.CheckConstraint('max_seats > 0', name='check_max_seats'),
        db.CheckConstraint('current_seats <= max_seats', name='check_current_vs_max'),
        db.UniqueConstraint('course_id', 'semester_id', name='uix_course_semester'),
    )

    enrollments = db.relationship('Enrollment', backref='offering', lazy='dynamic', cascade="all, delete-orphan")
    waitlists = db.relationship('Waitlist', backref='offering', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'offering_id': self.offering_id,
            'course_id': self.course_id,
            'semester_id': self.semester_id,
            'instructor_id': self.instructor_id,
            'max_seats': self.max_seats,
            'current_seats': self.current_seats
        }

class Task(db.Model):
    __tablename__ = 'tasks'

    task_id = db.Column(db.Integer, primary_key=True)
    offering_id = db.Column(db.Integer, db.ForeignKey('course_offerings.offering_id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    max_marks = db.Column(db.Float, nullable=False)
    release_date = db.Column(db.DateTime,server_default=db.func.current_timestamp())
    due_date = db.Column(db.DateTime, nullable=False)

    offering = db.relationship('CourseOffering', backref='tasks')

    def to_dict(self):
        return {
            'task_id': self.task_id,
            'offering_id': self.offering_id,
            'name': self.name,
            'max_marks': self.max_marks,
            'release_date': self.release_date,
            'due_date': self.due_date
        }
    
    __table_args__ = (
        db.UniqueConstraint('offering_id', 'name', name='uix_offering_name'),
        db.CheckConstraint('max_marks > 0', name='check_max_marks_positive'),
        db.CheckConstraint('due_date > release_date', name='check_due_after_release'),
    )

class TaskMark(db.Model):
    __tablename__ = 'task_marks'

    taskmark_id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey('enrollments.enrollment_id', ondelete='CASCADE'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.task_id', ondelete='CASCADE'), nullable=False)
    marks_obtained = db.Column(db.Float, nullable=True)

    __table_args__ = (
        db.UniqueConstraint('enrollment_id', 'task_id', name='uix_enrollment_task'),
    )

    def to_dict(self):
        return {
            'taskmark_id': self.taskmark_id,
            'enrollment_id': self.enrollment_id,
            'task_id': self.task_id,
            'marks_obtained': self.marks_obtained
        }

    enrollment = db.relationship('Enrollment', backref='task_marks')
    task = db.relationship('Task', backref='marks')

class Enrollment(db.Model):
    __tablename__ = 'enrollments'

    enrollment_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String, db.ForeignKey('students.student_id', ondelete='CASCADE'), nullable=False)
    offering_id = db.Column(db.Integer, db.ForeignKey('course_offerings.offering_id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    enrollment_date = db.Column(db.DateTime, server_default=db.func.current_timestamp())
    tag = db.Column(db.String(50), nullable=True)
    attendance = db.Column(db.Float, nullable=True)  # New field for attendance

    __table_args__ = (
        db.CheckConstraint("status IN ('enrolled', 'dropped')", name='check_status_valid'),
    )

    def to_dict(self):
        return {
            'enrollment_id': self.enrollment_id,
            'student_id': self.student_id,
            'offering_id': self.offering_id,
            'status': self.status,
            'enrollment_date': self.enrollment_date,
            'tag': self.tag
        }

class Waitlist(db.Model):
    __tablename__ = 'waitlists'
    waitlist_id = db.Column(db.Integer, primary_key=True)
    student_id  = db.Column(db.String,  db.ForeignKey('students.student_id', ondelete='CASCADE'), nullable=False)
    offering_id = db.Column(db.Integer, db.ForeignKey('course_offerings.offering_id', ondelete='CASCADE'), nullable=False)
    position    = db.Column(db.Integer, nullable=False)
    tag         = db.Column(db.String(50), nullable=False)          # ← new
    timestamp   = db.Column(db.DateTime, server_default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'waitlist_id': self.waitlist_id,
            'student_id': self.student_id,
            'offering_id': self.offering_id,
            'position': self.position,
            'tag': self.tag,  # ← new
            'timestamp': self.timestamp
        }

class Grade(db.Model):
    __tablename__ = 'grades'

    grade_id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey('enrollments.enrollment_id', ondelete='CASCADE'), unique=True, nullable=False)
    grade = db.Column(db.String(2), nullable=False)
    submission_date = db.Column(db.DateTime, server_default=db.func.current_timestamp())

    __table_args__ = (
        db.CheckConstraint("grade IN ('A', 'B', 'C', 'D', 'F')", name='check_grade_values'),
    )

class Prerequisite(db.Model):
    __tablename__ = 'prerequisites'

    prerequisite_id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    course_id = db.Column(db.String, db.ForeignKey('courses.course_id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False)
    prereq_course_id = db.Column(db.String, db.ForeignKey('courses.course_id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False)

    # course = db.relationship('Course', foreign_keys=[course_id], backref=db.backref('prerequisites', lazy='dynamic'))
    # prereq_course = db.relationship('Course', foreign_keys=[prereq_course_id], backref=db.backref('prereqs_for', lazy='dynamic'))
    def to_dict(self):
        return {
            'prerequisite_id': self.prerequisite_id,
            'course_id': self.course_id,
            'prereq_course_id': self.prereq_course_id
        }

class CourseReview(db.Model):
    __tablename__ = 'course_reviews'

    review_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String, db.ForeignKey('students.student_id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.String, db.ForeignKey('courses.course_id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, server_default=db.func.current_timestamp())

    __table_args__ = (
        db.CheckConstraint('rating BETWEEN 1 AND 5', name='check_rating_range'),
    )

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    log_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    action = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.current_timestamp())
    details = db.Column(db.Text)

class Tag(db.Model):
    __tablename__ = 'tag'

    tag_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

class CompletedCourse(db.Model):
    __tablename__ = 'completed_courses'

    student_id = db.Column(db.String, db.ForeignKey('students.student_id', ondelete='CASCADE'), primary_key=True)
    course_id = db.Column(db.String, db.ForeignKey('courses.course_id', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True)
    status = db.Column(db.String(10), nullable=False)

    __table_args__ = (
        db.CheckConstraint("status IN ('passed', 'failed')", name='check_completed_status_valid'),
    )

class AllowedTag(db.Model):
    __tablename__ = 'allowedtags'

    allowed_tag_id = db.Column(db.Integer, primary_key=True)  # Unique ID for allowed tag mapping
    department_id = db.Column(db.Integer, db.ForeignKey('departments.department_id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.String, db.ForeignKey('courses.course_id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.tag_id', ondelete='CASCADE'), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('department_id', 'course_id', 'tag_id'),
    )

    def to_dict(self):
        return {
            'allowed_tag_id': self.allowed_tag_id,
            'department_id': self.department_id,
            'course_id': self.course_id,
            'tag_id': self.tag_id
        }
    