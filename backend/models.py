# models.py
from werkzeug.security import generate_password_hash, check_password_hash
from app import db  # Import db from app

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'instructor', 'admin'

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {'id': self.id, 'username': self.username, 'role': self.role}

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    credits = db.Column(db.Integer, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    prerequisites = db.relationship('Course', secondary='prerequisites',
                                   primaryjoin='Course.id==prerequisites.c.course_id',
                                   secondaryjoin='Course.id==prerequisites.c.prereq_id')

    def to_dict(self):
        return {
            'id': self.id, 'code': self.code, 'name': self.name,
            'description': self.description, 'credits': self.credits,
            'capacity': self.capacity
        }

# Association table for prerequisites
prerequisites = db.Table('prerequisites',
    db.Column('course_id', db.Integer, db.ForeignKey('course.id'), primary_key=True),
    db.Column('prereq_id', db.Integer, db.ForeignKey('course.id'), primary_key=True)
)

class Enrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    semester = db.Column(db.String(20), nullable=False)

class Grade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    grade = db.Column(db.String(2), nullable=False)  # e.g., 'AA', 'AB', etc.