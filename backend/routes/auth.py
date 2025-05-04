from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token, JWTManager, get_jwt
from models import db, User, Student, Instructor, Admin  # Import from models

auth_bp = Blueprint('auth', __name__)
jwt = JWTManager()  # Initialize JWTManager

BLOCKLIST = set()

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user and return a JWT token."""
    data = request.get_json()
    # print("Hi im here with data: ", data)
    if not data or 'username' not in data or 'password' not in data or 'role' not in data:
        print("Missing fields detected")
        return jsonify({"msg": "Missing required fields: username, password, role"}), 400
    
    valid_roles = ['student', 'instructor', 'admin']
    if data['role'] not in valid_roles:
        print(f"Invalid role: {data['role']}")
        return jsonify({"msg": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400
    
    try:
        print("Creating new user...")
        # email = data.get("email")
        username = data['username']
        role = data['role']
        new_user = User(username=username, role=role)
        new_user.set_password(data['password'])
        db.session.add(new_user)
        db.session.commit()
        token = create_access_token(identity=str(new_user.user_id), additional_claims={"role": new_user.role}) 
        # print("token: ", token, "user: ", new_user.username," role: ", new_user.role)
        print("User created successfully")
        if role == 'admin':
            new_admin = Admin(user_id=new_user.user_id,admin_id='admin'+str(new_user.user_id))
            db.session.add(new_admin)
            db.session.commit()
        return jsonify({
            "access_token": token,
            "user": new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating user: {str(e)}")
        return jsonify({"msg": f"Error creating user: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate a user and return a JWT token."""
    # print("Login endpoint hit")
    data = request.get_json()
    # user = User.query.filter_by(username=data.get('username')).first()
    student = Student.query.filter_by(student_id=data.get('Id')).first() or None
    instructor = Instructor.query.filter_by(instructor_id=data.get('Id')).first() or None
    admin = Admin.query.filter_by(admin_id=data.get('Id')).first() or None
    # print("Student: ", student, "Instructor: ", instructor)
    if not student and not instructor and not admin:
        print("User not found")
        return jsonify({"msg": "User not found"}), 404
    if student:
        user = student.user
    elif instructor:
        user = instructor.user
    elif admin:
        user = admin.user
    print("User found: ", user.username, "Role: ", user.role)
    if user and user.check_password(data.get('password')):
        token = create_access_token(identity=str(user.user_id), additional_claims={"role": user.role})
        refresh_token = create_refresh_token(identity=str(user.user_id), additional_claims={"role": user.role})
        # print("token: ", token, "user: ", user.username," role: ", user.role)
        return jsonify(access_token=token, refresh_token = refresh_token), 200
    return jsonify({"msg": "Invalid credentials"}), 401

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    role = get_jwt()["role"]
    new_access = create_access_token(identity=identity,additional_claims={"role": role})
    return jsonify({ "access_token": new_access }), 200

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return jti in BLOCKLIST

@auth_bp.route('/logout_refresh', methods=['DELETE'])
@jwt_required(refresh=True)
def logout_refresh():
    jti = get_jwt()["jti"]
    BLOCKLIST.add(jti)
    return jsonify({"msg": "Refresh token revoked"}), 200


def role_required(role):
    #this jwt_required might cause error as it is related to cookies which we are not doing
    def decorator(fn):
        @jwt_required()
        def wrapper(*args, **kwargs):
            identity = get_jwt_identity()
            if identity['role'] != role:
                return jsonify({"msg": "Unauthorized"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator