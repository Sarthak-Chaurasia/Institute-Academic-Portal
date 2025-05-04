-- Clear existing data and reset sequences
TRUNCATE audit_logs, course_reviews, prerequisites, grades, waitlists, enrollments, course_offerings, tasks, task_marks, semesters, instructors, students, users, courses, departments, Tag, AllowedTags RESTART IDENTITY CASCADE;

-- Departments
INSERT INTO departments(department_id, name) VALUES
  (1, 'Computer Science and Engineering'),
  (2, 'Electrical Engineering'),
  (3, 'Mechanical Engineering'),
  (4, 'Civil Engineering'),
  (5, 'Chemical Engineering'),
  (6, 'Biotechnology'),
  (7, 'Mathematics'),
  (8, 'Physics'),
  (9, 'Chemistry'),
  (10, 'Humanities and Social Sciences');

-- Users
-- password is same as username 
INSERT INTO users (user_id, username, password, role, email) VALUES
(0, 'admin',   'scrypt:32768:8:1$9z3TlR6M8UwJMSGD$37e90c1f0639d92f4cdb2a8c889a66f8e79a47bf3e22cc83ab97238680bee844f6bbfd375dfbfc80b88fcf1e70a2f50a51a277c6c815463bd20d6be0b0f1130e', 'admin', 'admin@iitb.ac.in'),
(1, 'sarthak', 'scrypt:32768:8:1$ZUyoiB7cvY94khFw$a23d1733a468cafa16110511aa103145bbbff224acdf4a1c11f6ca22169150191891fee760f087472bc8d573cb2b4079b3fb896d685dedfc60514054469a394d', 'student', '22B0101@iitb.ac.in'),
(2, 'sarthak', 'scrypt:32768:8:1$egPjgjtyAV2IBu1E$1063560ab7da943bded8d2cd00fd0e8827bd593b68f4c5c0dd3330374be10be06d36d0c3ecf8bf448c3513fa5f633030eebd7db1dc42b29784b091d9ee0d8b2b', 'instructor', 'sarthak@iitb.ac.in'),
(3, 'vishnu',  'scrypt:32768:8:1$opVu100xk32siXaQ$99ce17aab0ae058d6731d0e5e901d4cf5cb59d717260606d7637e7b24e3e424b71ac768beacabcbf957b9ea31079975c5233ca5bb3f06da646fc55f343d2dc1b', 'instructor', 'vishnu@iitb.ac.in'),
(4, 'alice',   'scrypt:32768:8:1$addQMgljhCYZmrgP$84631ea3a33e8119cc0192b69702f345f0628d302cbed50b7f984c7bd4b7ca688e1a5f299031608222a8e4cd08669efcad39f192c4104fa6d90e1bb18eb70459', 'student', '23M0301@iitb.ac.in');



-- Students
INSERT INTO students (student_id, user_id, department_id, program, year_of_admission, contact_number, hostel_room, dob, nationality, additional_personal_info) VALUES
('22B0101', 1, 1, 'Bachelor', 2022, '1234567890', 'H6-271', NULL, NULL, NULL),
('23M0301', 4, 3, 'Master', 2023, NULL, 'H3-291', '2004-05-26', NULL, NULL);

-- Instructors
INSERT INTO instructors (instructor_id, user_id, department_id, research_areas) VALUES
('sarthak', 2, 1, NULL),
('vishnu', 3, 2, NULL);

-- Admins
INSERT INTO admins (admin_id, user_id) VALUES
('admin', 0);

-- Courses (CS)
INSERT INTO courses(course_id, name, description, credits, department_id) VALUES
  ('CS101', 'Computer Programming and Utilization', 'Interdisciplinary STEM Course.', 6, 1),
  ('CS104', 'Software Systems Lab', 'Advanced Course.', 5, 1),
  ('CS108', 'Software Systems Lab', 'Advanced Course.', 1, 1),
  ('CS207', 'Discrete Structures', 'Advanced Course.', 5, 1),
  ('CS213', 'Data Structures and Algorithms', 'Advanced Course.', 5, 1),
  ('CS217', 'Artificial Intelligence and Machine Learning', 'Advanced Course.', 1, 1),
  ('CS218', 'Design and Analysis of Algorithms', 'Advanced Course.', 2, 1),
  ('CS219', 'Operating Systems', 'Advanced Course.', 3, 1),
  ('CS224', 'Computer Networks', 'Advanced Course.', 5, 1),
  ('CS228', 'Logic for Computer Science', 'Advanced Course.', 5, 1),
  ('CS236', 'Operating Systems Lab', 'Advanced Course.', 1, 1),
  ('CS240', 'Artificial Intelligence and Machine Learning (Lab)', 'Advanced Course.', 1, 1),
  ('CS302', 'Implementation of Programming Languages', 'Advanced Course.', 4, 1),
  ('CS306', 'Implementation of Programming Languages Laboratory', 'Advanced Course.', 1, 1),
  ('CS310', 'Automata Theory', 'Advanced Course.', 5, 1),
  ('CS316', 'Implementation of Programming Languages Lab', 'Advanced Course.', 1, 1),
  ('CS317', 'Database and Information Systems', 'Advanced Course.', 2, 1),
  ('CS320', 'Implementation of Programming Languages', 'Advanced Course.', 4, 1),
  ('CS349', 'Database and Information Systems Lab', 'Advanced Course.', 1, 1),
  ('CS387', 'Database and Information Systems Lab', 'Advanced Course.', 1, 1),
  ('CS396', 'Seminar', 'Interdisciplinary STEM Course.', 1, 1),
  ('CS433', 'Automated Reasoning', 'Interdisciplinary STEM Course.', 15, 1),
  ('CS485', 'R & D Project II', 'Interdisciplinary STEM Course.', 1, 1),
  ('CS490', 'R & D Project', 'Interdisciplinary STEM Course.', 1, 1),
  ('CS492', 'BTP I', 'Interdisciplinary STEM Course.', 1, 1),
  ('CS496', 'BTP II', 'Interdisciplinary STEM Course.', 1, 1),
  ('CS6002', 'Selected Areas of Mechanism Design', 'Interdisciplinary STEM Course.', 5, 1),
  ('CS603', 'Geometric Algorithms', 'Interdisciplinary STEM Course.', 11, 1),
  ('CS6102', 'Implementation Security in Cryptography', 'Interdisciplinary STEM Course.', 6, 1),
  ('CS786','Learning with Graphs','',6,1);

-- Courses (EE)
INSERT INTO courses(course_id, name, description, credits, department_id) VALUES
  ('EE114', 'Power Engineering - I', 'Fundamentals of power systems, machines, and transmission.', 6, 2),
  ('EE204', 'Analog Circuits', 'Theory and application of analog electronic circuits.', 6, 2),
  ('EE207', 'Electronic Devices & Circuits', 'Introduction to electronic components and their circuit applications.', 6, 2),
  ('EE209', 'Electrical/Electronics Lab.', 'Lab experiments on electrical and electronic circuits.', 4, 2),
  ('EE225', 'Network Theory', 'Analysis and synthesis of electrical networks.', 6, 2),
  ('EE229', 'Signal Processing – I', 'Intro to digital signal processing: sampling, filtering, transforms.', 6, 2),
  ('EE230', 'Analog Lab', 'Hands-on lab on analog circuits and devices.', 4, 2),
  ('EE238', 'Power Engineering - II', 'Advanced topics in power systems, transmission, and protection.', 6, 2),
  ('EE302', 'Control Systems', 'Feedback control systems, stability, and response analysis.', 6, 2),
  ('EE309', 'Microprocessors', 'Architecture and programming of microprocessors.', 6, 2),
  ('EE325', 'Probability and Random Processes', 'Probability models and stochastic processes in engineering.', 6, 2),
  ('EE337', 'Microprocessors Laboratory', 'Lab work with microprocessor-based systems and interfaces.', 4, 2),
  ('EE338', 'Digital Signal Processing', 'Advanced DSP concepts and real-world applications.', 6, 2),
  ('EE344', 'Electronic Design Lab', 'Design and testing of electronic systems in lab.', 4, 2),
  ('EE350', 'Technical Communication', 'Developing technical writing and presentation skills.', 3, 2),
  ('EE451', 'Supervised Research Exposition', 'Guided research with report and presentation.', 6, 2),
  ('EE462', 'DSP Software and Hardware Lab', 'DSP implementation in software and hardware environments.', 4, 2),
  ('EE491', 'BTP I', 'First phase of B.Tech project with research focus.', 6, 2),
  ('EE492', 'BTP II', 'Final phase of B.Tech project with implementation.', 6, 2);




-- Semesters
INSERT INTO semesters(semester_id, name, start_date, end_date, add_deadline, drop_deadline) VALUES
  (1, 'Spring 2025', '2025-01-05', '2025-05-10', '2025-01-12', '2025-01-19'),
  (2, 'Autumn 2025', '2025-07-20', '2025-11-25', '2025-07-27', '2025-08-03');

-- Course Offerings
INSERT INTO course_offerings(offering_id, course_id, semester_id, instructor_id, max_seats, current_seats) VALUES
  (1, 'EE114', 1, 'vishnu', 50, 47),
  (2, 'CS101', 1, 'sarthak', 60, 60),
  (3, 'CS213', 1, 'sarthak', 50, 49),
  (4, 'EE204', 2, 'vishnu', 45, 44),
  (5, 'CS219', 2, 'sarthak', 40, 35);

-- -- Enrollments
-- INSERT INTO enrollments(enrollment_id, student_id, offering_id, status, enrollment_date, tag) VALUES
--   (1, '21CS1001', 1, 'enrolled', CURRENT_TIMESTAMP, 'core'),
--   (2, '21CS1002', 2, 'enrolled', CURRENT_TIMESTAMP, 'core'),
--   (3, '21CS1001', 3, 'enrolled', CURRENT_TIMESTAMP, 'elective'),
--   (4, '21EE1003', 1, 'enrolled', CURRENT_TIMESTAMP, 'core'),
--   (5, '21CS1002', 4, 'dropped', CURRENT_TIMESTAMP, 'core');
INSERT INTO enrollments (enrollment_id, student_id, offering_id, status, enrollment_date, tag, attendance) 
VALUES (1, '22B0101', 5, 'enrolled', '2025-05-04 09:55:40.981700', 'Core', NULL);


-- -- Waitlists
-- INSERT INTO waitlists(waitlist_id, student_id, offering_id, position, timestamp) VALUES
--   (1, '21CS1002', 5, 1, CURRENT_TIMESTAMP),
--   (2, '21EE1003', 5, 2, CURRENT_TIMESTAMP);

INSERT INTO tasks (task_id, offering_id, name, max_marks, release_date, due_date)
VALUES (14, 5, 'sdaf', 50.0, '2025-05-04 11:50:24.398283', '2025-05-18 11:50:00'),
VALUES (1, 5, 'as1', 50.0, '2025-05-04 09:08:41.551718', '2025-05-18 11:50:00');


INSERT INTO task_marks (taskmark_id, enrollment_id, task_id, marks_obtained) 
VALUES (2, 1, 14, 80.0),
VALUES (1, 1, 1, 60.0);


-- -- Grades
-- INSERT INTO grades(grade_id, enrollment_id, grade, submission_date) VALUES
--   (1, 1, 'A', CURRENT_TIMESTAMP),
--   (2, 2, 'B', CURRENT_TIMESTAMP),
--   (3, 3, 'A', CURRENT_TIMESTAMP),
--   (4, 4, 'C', CURRENT_TIMESTAMP);
INSERT INTO grades (grade_id, enrollment_id, grade, submission_date) 
VALUES (1, 1, 'BB', '2025-05-04 12:23:51.425441');


-- -- Prerequisites
INSERT INTO prerequisites(prerequisite_id, course_id, prereq_course_id) VALUES
  (1, 'CS213', 'CS101'),
  (2, 'CS218', 'CS213'),
  (3, 'CS219', 'CS101'),
  (4, 'CS786', 'CS101'),
  (5, 'CS786', 'CS213');

-- -- Course Reviews
-- INSERT INTO course_reviews(review_id, student_id, course_id, rating, comment, timestamp) VALUES
--   (1, '21CS1001', 'CS101', 5, 'Great introduction to programming.', CURRENT_TIMESTAMP),
--   (2, '21CS1002', 'CS213', 4, 'Tough but rewarding.', CURRENT_TIMESTAMP),
--   (3, '21EE1003', 'EE114', 3, 'Interesting topics but lots of theory.', CURRENT_TIMESTAMP);

-- -- Audit Logs
-- INSERT INTO audit_logs(log_id, user_id, action, details, timestamp) VALUES
--   (1, 1, 'enrolled_course', 'Student 21CS1001 enrolled in EE114', CURRENT_TIMESTAMP),
--   (2, 2, 'enrolled_course', 'Student 21CS1002 enrolled in CS101', CURRENT_TIMESTAMP),
--   (3, 4, 'offered_course', 'Instructor EE001 offered EE114', CURRENT_TIMESTAMP),
--   (4, 6, 'login', 'Admin logged in', CURRENT_TIMESTAMP);


-- -- Simulate a course a student has already passed
-- INSERT INTO CompletedCourse (student_id, course_id, status) VALUES
-- (1, 'CS101', 'passed');


-- -- Insert specified tags
INSERT INTO Tag (name) VALUES
('Core'),
('STEM Electives'),
('HASMED Electives'),
('Department Electives'),
('Audit'),
('Additional Learning Course'),
('Minor Course');

-- -- Insert sample allowed tag mappings (department_id, course_id, tag_id)
-- -- Example department_id, course_id mappings must already exist in your departments and courses tables

-- -- Insert sample allowed tag mappings (department_id, course_id, tag_id)
-- -- Mapping department_id, course_id, and tag_id

-- -- For Computer Science courses
INSERT INTO AllowedTags (department_id, course_id, tag_id) VALUES
  (1, 'CS101', 1), -- Core
--   (1, 'CS104', 1), -- Core
--   (1, 'CS108', 1), -- Core
--   (1, 'CS207', 1), -- Core
--   (1, 'CS213', 1), -- Core
--   (1, 'CS217', 1), -- Core
--   (1, 'CS218', 1), -- Core
  (1, 'CS219', 1), -- Core
--   (1, 'CS224', 1), -- Core
--   (1, 'CS228', 1), -- Core
--   (1, 'CS236', 1), -- Core
--   (1, 'CS240', 1), -- Core
--   (1, 'CS302', 1), -- Core
--   (1, 'CS306', 1), -- Core
--   (1, 'CS310', 1), -- Core
--   (1, 'CS316', 1), -- Core
--   (1, 'CS317', 1), -- Core
--   (1, 'CS320', 1), -- Core
--   (1, 'CS349', 1), -- Core
--   (1, 'CS387', 1), -- Core
--   (1, 'CS396', 1), -- Core
--   (1, 'CS433', 1), -- Core
--   (1, 'CS485', 1), -- Core
--   (1, 'CS490', 1), -- Core
--   (1, 'CS492', 1), -- Core
--   (1, 'CS496', 1), -- Core
--   (1, 'CS6002', 1), -- Core
--   (1, 'CS603', 1), -- Core
--   (1, 'CS6102', 1); -- Core
(1, 'CS786', 1),
(1, 'CS786', 5),
(2, 'CS786', 5),
(4, 'CS786', 5);

-- -- For Electrical Engineering courses
-- INSERT INTO AllowedTags (department_id, course_id, tag_id) VALUES
--   (2, 'EE114', 1), -- Core
--   (2, 'EE204', 1), -- Core
--   (2, 'EE207', 1), -- Core
--   (2, 'EE209', 1), -- Core
--   (2, 'EE225', 1), -- Core
--   (2, 'EE229', 1), -- Core
--   (2, 'EE230', 1), -- Core
--   (2, 'EE238', 1), -- Core
--   (2, 'EE302', 1), -- Core
--   (2, 'EE309', 1), -- Core
--   (2, 'EE325', 1), -- Core
--   (2, 'EE337', 1), -- Core
--   (2, 'EE338', 1), -- Core
--   (2, 'EE344', 1), -- Core
--   (2, 'EE350', 1), -- Core
--   (2, 'EE451', 1), -- Core
--   (2, 'EE462', 1), -- Core
--   (2, 'EE491', 1), -- Core
--   (2, 'EE492', 1); -- Core


-- after all INSERTs:
SELECT setval(pg_get_serial_sequence('users','user_id'), COALESCE(MAX(user_id),0)+1, false) FROM users;
SELECT setval(pg_get_serial_sequence('departments','department_id'), COALESCE(MAX(department_id),0)+1, false) FROM departments;
-- SELECT setval(pg_get_serial_sequence('students','student_id'), COALESCE(MAX(student_id),0)+1, false) FROM students;
-- SELECT setval(pg_get_serial_sequence('instructors','instructor_id'), COALESCE(MAX(instructor_id),0)+1, false) FROM instructors;
-- SELECT setval(pg_get_serial_sequence('admins','admin_id'), COALESCE(MAX(admin_id),0)+1, false) FROM admins;
-- SELECT setval(pg_get_serial_sequence('courses','course_id'), COALESCE(MAX(course_id),0)+1, false) FROM courses;
SELECT setval(pg_get_serial_sequence('semesters','semester_id'), COALESCE(MAX(semester_id),0)+1, false) FROM semesters;
SELECT setval(pg_get_serial_sequence('course_offerings','offering_id'), COALESCE(MAX(offering_id),0)+1, false) FROM course_offerings;
SELECT setval(pg_get_serial_sequence('tasks', 'task_id'), COALESCE(MAX(task_id), 0)+1, false) FROM tasks;
SELECT setval(pg_get_serial_sequence('task_marks', 'taskmark_id'), COALESCE(MAX(taskmark_id), 0)+1, false) FROM task_marks;
SELECT setval(pg_get_serial_sequence('enrollments','enrollment_id'), COALESCE(MAX(enrollment_id),0)+1, false) FROM enrollments;
SELECT setval(pg_get_serial_sequence('waitlists','waitlist_id'), COALESCE(MAX(waitlist_id),0)+1, false) FROM waitlists;
SELECT setval(pg_get_serial_sequence('grades','grade_id'), COALESCE(MAX(grade_id),0)+1, false) FROM grades;
SELECT setval(pg_get_serial_sequence('prerequisites','prerequisite_id'), COALESCE(MAX(prerequisite_id),0)+1, false) FROM prerequisites;
SELECT setval(pg_get_serial_sequence('course_reviews','review_id'), COALESCE(MAX(review_id),0)+1, false) FROM course_reviews;
SELECT setval(pg_get_serial_sequence('audit_logs','log_id'), COALESCE(MAX(log_id),0)+1, false) FROM audit_logs;
SELECT setval(pg_get_serial_sequence('Tag','tag_id'), COALESCE(MAX(tag_id),0)+1, false) FROM Tag;
SELECT setval(pg_get_serial_sequence('AllowedTags','allowed_tag_id'), COALESCE(MAX(allowed_tag_id),0)+1, false) FROM AllowedTags;
-- SELECT setval(pg_get_serial_sequence('CompletedCourse','completed_course_id'), COALESCE(MAX(completed_course_id),0)+1, false) FROM CompletedCourse;


-- ...and so on for other tables...
