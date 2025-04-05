from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
from models import db, User, Student, Instructor, Department  # Import from models
from routes.auth import role_required  
from datetime import datetime 


register_bp = Blueprint('register', __name__)

@register_bp.route('', methods=['POST'])
# @jwt_required()
def register():
    print("Headers received:", dict(request.headers)) 
    try:
        """Register a new user."""
        data = request.get_json()
        print("Data received: ", data)
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user_role = get_jwt()['role']
        print("Current user: ", user_id, "Role: ", user_role)
        
        if not data or 'program' not in data or 'department' not in data or 'year_of_admission' not in data:
            return jsonify({"msg": "Missing required fields"}), 400

        valid_roles = ['student', 'instructor', 'admin']
        if user_role not in valid_roles:
            return jsonify({"msg": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400

        try:

            # Add to corresponding role table
            if user_role == 'student':
                program = data.get("program")
                department = data.get("department") 
                year_of_admission = int(data.get("year_of_admission")) if data.get("year_of_admission") else None
                contact_number = int(data.get("contact_number")) if data.get("contact_number") else None
                hostel = data.get("hostel") or None
                dob_raw = data.get("dob")
                dob = datetime.strptime(dob_raw, "%Y-%m-%d").date() if dob_raw else None
                nationality=data.get("nationality") or None
                additional_info = data.get("additional_info") or None
                
                department_id = Department.query.filter_by(name=department).first()
       
                new_student = Student(user_id=user_id, department_id=department_id.department_id, program=program, year_of_admission=year_of_admission,contact_number=contact_number,
                                      hostel_room=hostel,dob=dob,nationality=nationality,additional_personal_info=additional_info)
                if not new_student:
                    return jsonify({"msg": "Failed to create new student"}), 500
                db.session.add(new_student)
                print("Student added successfully")
            # elif role == 'instructor':
            #     instructor_id = data.get("instructor_id")
            #     department_id = data.get("department_id")
            #     if not instructor_id or not department_id:
            #         return jsonify({"msg": "instructor_id and department_id are required for instructor"}), 400

            #     new_instructor = Instructor(instructor_id=instructor_id, user_id=new_user.user_id, department_id=department_id)
            #     db.session.add(new_instructor)
            else:
                return jsonify({"msg": "Role is not student"}), 400

            db.session.commit()
            print("Session committed successfully")
        except Exception as e:
            db.session.rollback()
            return jsonify({"msg": str(e)}), 500

        return jsonify({"msg": "User registered successfully"}), 201


    except Exception as e:
        db.session.rollback()
        print(f"Error in registration: {str(e)}")
        return jsonify({"msg": str(e)}), 500
    