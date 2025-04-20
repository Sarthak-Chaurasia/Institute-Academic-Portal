from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
from models import db, User, Student, Instructor, Department  # Import from models
from routes.auth import role_required  
from datetime import datetime 


register_bp = Blueprint('register', __name__)

@register_bp.route('/personal-details', methods=['GET'])
# @jwt_required()
def get_personal_details():
    print("HEADERS:", dict(request.headers))
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
    
    department = Department.query.filter_by(department_id=query.department_id).first() if query else None
    if user_role == 'student':
        return jsonify({
            "Name": user.username,
            "Identity": query.student_id,
            "Email": user.email,
            "Program": query.program,
            "Department": department.name if department else None,
            "Year of Admission": query.year_of_admission,
            "Contact Number": query.contact_number,
            "Hostel": query.hostel_room,
            "DOB" : query.dob,
            "Nationality" : query.nationality,
            "Additional Personal Info": query.additional_personal_info
        }), 200
    elif user_role == 'instructor':
        return jsonify({
            "Name": user.username,
            "Identity": query.instructor_id,
            "Email": user.email,
            "Department": department.name if department else None,
            "Research Areas": query.research_areas
        }), 200
    else:
        return jsonify({"msg": "Invalid role"}), 400
    


@register_bp.route('', methods=['POST'])
@jwt_required()
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
            elif user_role == 'instructor':
                department = data.get("department") or None
                username = data.get("username") or None
                research_areas = data.get("research_areas") or None

                department_id = Department.query.filter_by(name=department).first().department_id if department else None
                
                if(Instructor.query.filter_by(instructor_id=username).first()):
                    return jsonify({"msg": "Username already taken enter a different username"}), 409
                if not username:
                    return jsonify({"msg": "Username is required"}), 400
                new_instructor = Instructor(user_id=user_id, department_id=department_id, instructor_id=str(username), research_areas=research_areas)
                if not new_instructor:
                    return jsonify({"msg": "Failed to create new instructor"}), 500
                db.session.add(new_instructor)
                print("Instructor added successfully")
            else:
                return jsonify({"msg": "Role is not student"}), 400
            user = User.query.filter_by(user_id=user_id).first()
            id = new_student.student_id if user_role == 'student' else new_instructor.instructor_id if user_role == 'instructor' else None
            user.set_email(id+"@iitb.ac.in")
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
    