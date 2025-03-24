-- Create Tables

-- Users table for authentication and role management
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
    email VARCHAR(100) UNIQUE NOT NULL
);

-- Departments table to categorize courses, students, and instructors
CREATE TABLE Departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Students table for student-specific information
CREATE TABLE Students (
    student_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES Users(user_id),
    name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL REFERENCES Departments(department_id)
);

-- Instructors table for instructor-specific details
CREATE TABLE Instructors (
    instructor_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES Users(user_id),
    name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL REFERENCES Departments(department_id),
    research_areas TEXT
);

-- Courses table for the course catalog
CREATE TABLE Courses (
    course_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    credits INT NOT NULL CHECK (credits > 0),
    department_id INT NOT NULL REFERENCES Departments(department_id)
);

-- Semesters table to track academic terms
CREATE TABLE Semesters (
    semester_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    add_deadline DATE NOT NULL,
    drop_deadline DATE NOT NULL,
    CHECK (start_date < end_date),
    CHECK (add_deadline <= drop_deadline)
);

-- CourseOfferings table to link courses to semesters and instructors
CREATE TABLE CourseOfferings (
    offering_id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES Courses(course_id),
    semester_id INT NOT NULL REFERENCES Semesters(semester_id),
    instructor_id INT NOT NULL REFERENCES Instructors(instructor_id),
    max_seats INT NOT NULL CHECK (max_seats > 0),
    current_seats INT NOT NULL DEFAULT 0 CHECK (current_seats <= max_seats),
    UNIQUE (course_id, semester_id)
);

-- Enrollments table to manage student registrations
CREATE TABLE Enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES Students(student_id),
    offering_id INT NOT NULL REFERENCES CourseOfferings(offering_id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('enrolled', 'dropped')),
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, offering_id)
);

-- Waitlists table to handle waitlisted students
CREATE TABLE Waitlists (
    waitlist_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES Students(student_id),
    offering_id INT NOT NULL REFERENCES CourseOfferings(offering_id),
    position INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, offering_id),
    UNIQUE (offering_id, position)
);

-- Grades table to record student grades
CREATE TABLE Grades (
    grade_id SERIAL PRIMARY KEY,
    enrollment_id INT UNIQUE NOT NULL REFERENCES Enrollments(enrollment_id),
    grade VARCHAR(2) NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prerequisites table to define course prerequisites
CREATE TABLE Prerequisites (
    prerequisite_id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES Courses(course_id),
    prereq_course_id INT NOT NULL REFERENCES Courses(course_id),
    UNIQUE (course_id, prereq_course_id),
    CHECK (course_id != prereq_course_id)
);

-- CourseReviews table for student feedback on courses
CREATE TABLE CourseReviews (
    review_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES Students(student_id),
    course_id INT NOT NULL REFERENCES Courses(course_id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- InstructorReviews table for student feedback on instructors
CREATE TABLE InstructorReviews (
    review_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES Students(student_id),
    instructor_id INT NOT NULL REFERENCES Instructors(instructor_id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AuditLogs table to track system activities
CREATE TABLE AuditLogs (
    log_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES Users(user_id),
    action VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

-- Create Indexes for Performance Optimization

CREATE INDEX idx_enrollments_student ON Enrollments(student_id);
CREATE INDEX idx_enrollments_offering ON Enrollments(offering_id);
CREATE INDEX idx_grades_enrollment ON Grades(enrollment_id);
CREATE INDEX idx_courseofferings_course ON CourseOfferings(course_id);
CREATE INDEX idx_courseofferings_semester ON CourseOfferings(semester_id);
CREATE INDEX idx_waitlists_offering ON Waitlists(offering_id);
CREATE INDEX idx_waitlists_position ON Waitlists(position);
CREATE INDEX idx_prerequisites_course ON Prerequisites(course_id);
CREATE INDEX idx_prerequisites_prereq ON Prerequisites(prereq_course_id);

-- Create Views for Simplified Queries

-- View for current course enrollments
CREATE VIEW CurrentEnrollments AS
SELECT 
    s.name AS student_name, 
    c.name AS course_name, 
    i.name AS instructor_name, 
    co.semester_id
FROM Students s
JOIN Enrollments e ON s.student_id = e.student_id
JOIN CourseOfferings co ON e.offering_id = co.offering_id
JOIN Courses c ON co.course_id = c.course_id
JOIN Instructors i ON co.instructor_id = i.instructor_id
WHERE e.status = 'enrolled';

-- View for grade distributions
CREATE VIEW GradeDistributions AS
SELECT 
    co.course_id, 
    co.semester_id, 
    g.grade, 
    COUNT(*) AS count
FROM Grades g
JOIN Enrollments e ON g.enrollment_id = e.enrollment_id
JOIN CourseOfferings co ON e.offering_id = co.offering_id
GROUP BY co.course_id, co.semester_id, g.grade;