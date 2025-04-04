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


class Student(db.Model):
    __tablename__ = 'students'

    student_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.department_id'), nullable=False)

    user = db.relationship('User', backref=db.backref('student', uselist=False))
    department = db.relationship('Department', backref='students')


class Instructor(db.Model):
    __tablename__ = 'instructors'

    instructor_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.department_id'), nullable=False)
    research_areas = db.Column(db.Text)

    user = db.relationship('User', backref=db.backref('instructor', uselist=False))
    department = db.relationship('Department', backref='instructors')


class Course(db.Model):
    __tablename__ = 'courses'

    course_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    credits = db.Column(db.Integer, nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.department_id'), nullable=False)

    __table_args__ = (
        db.CheckConstraint('credits > 0', name='check_credits_positive'),
    )

    department = db.relationship('Department', backref='courses')


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
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    semester_id = db.Column(db.Integer, db.ForeignKey('semesters.semester_id'), nullable=False)
    instructor_id = db.Column(db.Integer, db.ForeignKey('instructors.instructor_id'), nullable=False)
    max_seats = db.Column(db.Integer, nullable=False)
    current_seats = db.Column(db.Integer, nullable=False, default=0)

    __table_args__ = (
        db.CheckConstraint('max_seats > 0', name='check_max_seats'),
        db.CheckConstraint('current_seats <= max_seats', name='check_current_vs_max'),
    )


class Enrollment(db.Model):
    __tablename__ = 'enrollments'

    enrollment_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    offering_id = db.Column(db.Integer, db.ForeignKey('course_offerings.offering_id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    enrollment_date = db.Column(db.DateTime, server_default=db.func.current_timestamp())

    __table_args__ = (
        db.CheckConstraint("status IN ('enrolled', 'dropped')", name='check_status_valid'),
    )


class Waitlist(db.Model):
    __tablename__ = 'waitlists'

    waitlist_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    offering_id = db.Column(db.Integer, db.ForeignKey('course_offerings.offering_id'), nullable=False)
    position = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.current_timestamp())


class Grade(db.Model):
    __tablename__ = 'grades'

    grade_id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey('enrollments.enrollment_id'), unique=True, nullable=False)
    grade = db.Column(db.String(2), nullable=False)
    submission_date = db.Column(db.DateTime, server_default=db.func.current_timestamp())

    __table_args__ = (
        db.CheckConstraint("grade IN ('A', 'B', 'C', 'D', 'F')", name='check_grade_values'),
    )


class Prerequisite(db.Model):
    __tablename__ = 'prerequisites'

    prerequisite_id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    prereq_course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)


class CourseReview(db.Model):
    __tablename__ = 'course_reviews'

    review_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, server_default=db.func.current_timestamp())

    __table_args__ = (
        db.CheckConstraint('rating BETWEEN 1 AND 5', name='check_rating_range'),
    )


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    log_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.current_timestamp())
    details = db.Column(db.Text)
