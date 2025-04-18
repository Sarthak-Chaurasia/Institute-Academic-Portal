-- Users table for authentication and role management
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
    email VARCHAR(100)
);
CREATE INDEX idx_user_id ON users(user_id);

-- Departments table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Students table
CREATE TABLE students (
    student_id VARCHAR PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    department_id INT NOT NULL REFERENCES departments(department_id) ON DELETE CASCADE,
    program VARCHAR(50) NOT NULL,
    year_of_admission INT NOT NULL,
    contact_number BIGINT,
    hostel_room VARCHAR(50),
    dob DATE,
    nationality VARCHAR(50),
    additional_personal_info TEXT,
    CONSTRAINT uq_student_id UNIQUE (student_id)
);
CREATE INDEX idx_student_id ON students(student_id);

-- Instructors table
CREATE TABLE instructors (
    instructor_id VARCHAR PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    -- name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL REFERENCES departments(department_id) ON DELETE CASCADE,
    research_areas TEXT
);

-- Courses table
CREATE TABLE courses (
    course_id VARCHAR PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    credits INT NOT NULL CHECK (credits > 0),
    department_id INT NOT NULL REFERENCES departments(department_id) ON DELETE CASCADE
);
CREATE INDEX idx_course_id ON courses(course_id);

-- Semesters table
CREATE TABLE semesters (
    semester_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    add_deadline DATE NOT NULL,
    drop_deadline DATE NOT NULL
);

-- CourseOfferings table
CREATE TABLE course_offerings (
    offering_id SERIAL PRIMARY KEY,
    course_id VARCHAR NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    semester_id INT NOT NULL REFERENCES semesters(semester_id) ON DELETE CASCADE,
    instructor_id VARCHAR NOT NULL REFERENCES instructors(instructor_id) ON DELETE CASCADE,
    max_seats INT NOT NULL CHECK (max_seats > 0),
    current_seats INT NOT NULL DEFAULT 0 CHECK (current_seats <= max_seats)
);

-- Enrollments table
CREATE TABLE enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id VARCHAR NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    offering_id INT NOT NULL REFERENCES course_offerings(offering_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('enrolled', 'dropped')),
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tag VARCHAR(50)
);

-- Waitlists table
CREATE TABLE waitlists (
    waitlist_id SERIAL PRIMARY KEY,
    student_id VARCHAR NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    offering_id INT NOT NULL REFERENCES course_offerings(offering_id) ON DELETE CASCADE,
    position INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grades table
CREATE TABLE grades (
    grade_id SERIAL PRIMARY KEY,
    enrollment_id INT UNIQUE NOT NULL REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
    grade VARCHAR(2) NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prerequisites table
CREATE TABLE prerequisites (
    prerequisite_id SERIAL PRIMARY KEY,
    course_id VARCHAR NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    prereq_course_id VARCHAR NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE
);

-- CourseReviews table
CREATE TABLE course_reviews (
    review_id SERIAL PRIMARY KEY,
    student_id VARCHAR NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    course_id VARCHAR NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AuditLogs table
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

-- Table for Tags
CREATE TABLE Tag (
    tag_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- Table for Completed Courses
CREATE TABLE CompletedCourse (
    student_id INT REFERENCES Students(user_id),
    course_id TEXT REFERENCES Courses(course_id),
    status TEXT CHECK (status IN ('passed', 'failed')),
    PRIMARY KEY (student_id, course_id)
);


-- Table for Allowed Tags with mapping
CREATE TABLE AllowedTags (
    allowed_tag_id SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(department_id) ON DELETE CASCADE,
    course_id TEXT REFERENCES courses(course_id) ON DELETE CASCADE,
    tag_id INT REFERENCES Tag(tag_id) ON DELETE CASCADE,
    CONSTRAINT uq_allowed_tag UNIQUE (department_id, course_id, tag_id)  -- Ensure no duplicate mappings
);