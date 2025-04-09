# ASC+: A Comprehensive Academic Student Center for IITB
22B0930: Mrinal Garg \
22B1068: Tanishka Kabra \
22B1016: Jahnvi Shaw \
22B1014: Sarthak Chaurasia 

What has been done up until now:
- The backend is in Flask
- The frontend is React 
- ER diagram is available in backend/ folder (er_diagram.pdf)
- Sample .sql files are available in setup_scripts/ folder
- User Signup and Login have been implemented (for both Students and Instructors)
- Upon Signup, redirected to Registration page to fill personal details
- Frontend itself doesn't allow access to protected APIs if not logged in
- Used jwt_required for authentication
- Implemented an All Courses page to display course list
- Implemented a Personal Details page to display the data entered at the time of registration

# What remains:
## Students: 
- Make a portal for course registration for each student
- Enforce course prerequisite checking
- Waitlist Management: If a course is full, students can be added to a waitlist and automatically enroll them when seat opens up
- Add / Drop functionality for courses during registration time
- Past grading stats
- Past Performance summary for students
- Course review / feedback form

## Instructors: 
- Grade entry portal
- Access to feedback given by students


