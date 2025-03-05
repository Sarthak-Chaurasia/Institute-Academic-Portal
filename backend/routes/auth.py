from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if user and user.check_password(data.get('password')):
        token = create_access_token(identity={'id': user.id, 'role': user.role})
        return jsonify(access_token=token), 200
    return jsonify({"msg": "Invalid credentials"}), 401

# Role-based decorator
def role_required(role):
    def decorator(fn):
        @jwt_required()
        def wrapper(*args, **kwargs):
            identity = get_jwt_identity()
            if identity['role'] != role:
                return jsonify({"msg": "Unauthorized"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator