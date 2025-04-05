from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)

    __table_args__ = (
        db.CheckConstraint("role IN ('student', 'instructor', 'admin')", name='check_valid_role'),
        db.Index('idx_user_id', 'user_id'),
    )

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {'user_id': self.user_id, 'username': self.username, 'role': self.role, 'email': self.email}


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
    enrollments = db.relationship('Enrollment', backref='student', lazy='dynamic', cascade="all, delete-orphan")
    waitlists = db.relationship('Waitlist', backref='student', lazy='dynamic', cascade="all, delete-orphan")

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

    instructor_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.department_id', ondelete='CASCADE'), nullable=False)
    research_areas = db.Column(db.Text)

    user = db.relationship('User', backref=db.backref('instructor', uselist=False, cascade="all, delete-orphan"))


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

    offerings = db.relationship('CourseOffering', backref='course', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'course_id': self.course_id,
            'name': self.name,
            'description': self.description,
            'credits': self.credits,
            'department_id': self.department_id
        }

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

    offering_id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.String, db.ForeignKey('courses.course_id', ondelete='CASCADE'), nullable=False)
    semester_id = db.Column(db.Integer, db.ForeignKey('semesters.semester_id', ondelete='CASCADE'), nullable=False)
    instructor_id = db.Column(db.Integer, db.ForeignKey('instructors.instructor_id', ondelete='CASCADE'), nullable=False)
    max_seats = db.Column(db.Integer, nullable=False)
    current_seats = db.Column(db.Integer, nullable=False, default=0)

    __table_args__ = (
        db.CheckConstraint('max_seats > 0', name='check_max_seats'),
        db.CheckConstraint('current_seats <= max_seats', name='check_current_vs_max'),
    )

    enrollments = db.relationship('Enrollment', backref='offering', lazy='dynamic', cascade="all, delete-orphan")
    waitlists = db.relationship('Waitlist', backref='offering', lazy='dynamic', cascade="all, delete-orphan")


class Enrollment(db.Model):
    __tablename__ = 'enrollments'

    enrollment_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String, db.ForeignKey('students.student_id', ondelete='CASCADE'), nullable=False)
    offering_id = db.Column(db.Integer, db.ForeignKey('course_offerings.offering_id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    enrollment_date = db.Column(db.DateTime, server_default=db.func.current_timestamp())
    tag = db.Column(db.String(50), nullable=True)

    __table_args__ = (
        db.CheckConstraint("status IN ('enrolled', 'dropped')", name='check_status_valid'),
    )


class Waitlist(db.Model):
    __tablename__ = 'waitlists'

    waitlist_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String, db.ForeignKey('students.student_id', ondelete='CASCADE'), nullable=False)
    offering_id = db.Column(db.Integer, db.ForeignKey('course_offerings.offering_id', ondelete='CASCADE'), nullable=False)
    position = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.current_timestamp())


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

    prerequisite_id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.String, db.ForeignKey('courses.course_id', ondelete='CASCADE'), nullable=False)
    prereq_course_id = db.Column(db.String, db.ForeignKey('courses.course_id', ondelete='CASCADE'), nullable=False)


class CourseReview(db.Model):
    __tablename__ = 'course_reviews'

    review_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String, db.ForeignKey('students.student_id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.String, db.ForeignKey('courses.course_id', ondelete='CASCADE'), nullable=False)
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
