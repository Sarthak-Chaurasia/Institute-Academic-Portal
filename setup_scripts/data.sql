-- Insert into department
INSERT INTO department (dept_name, building, budget)
VALUES
    ('CompSci', 'CS_Building', 200000.00),
    ('Math', 'Math_Building', 150000.00),
    ('Physics', 'Phy_Building', 100000.00);

-- Insert into classroom
INSERT INTO classroom (building, room_no, capacity)
VALUES
    ('CS_Building', '101', 50),
    ('CS_Building', '102', 40),
    ('Math_Building', '201', 30);

-- Insert into time_slot
INSERT INTO time_slot (day, start_time, end_time)
VALUES
    ('Mon', '09:00', '10:00'),
    ('Mon', '10:00', '11:00'),
    ('Wed', '14:00', '15:30');

-- Insert into course
INSERT INTO course (course_id, title, dept_name, credits)
VALUES
    ('CS101', 'Intro to Programming', 'CompSci', 4),
    ('CS201', 'Data Structures', 'CompSci', 4),
    ('MATH101', 'Calculus I', 'Math', 4),
    ('PHYS101', 'Mechanics', 'Physics', 3);

-- Insert into student
INSERT INTO student (ID, name, dept_name, tot_cred)
VALUES
    (1001, 'Alice', 'CompSci', 16),
    (1002, 'Bob', 'Math', 12),
    (1003, 'Charlie', NULL, 0);  -- no dept assigned yet

-- Insert into instructor
INSERT INTO instructor (ID, name, dept_name, salary)
VALUES
    (9001, 'Dr. Smith', 'CompSci', 120000.00),
    (9002, 'Dr. Johnson', 'Math', 100000.00),
    (9003, 'Dr. Carter', 'Physics', 110000.00);

-- Insert into section
-- We'll assume 'CS101' has a section 1 in Fall 2025, meets in CS_Building, room 101, time_slot_id=1
INSERT INTO section (course_id, sec_id, semester, year, building, room_no, time_slot_id)
VALUES
    ('CS101', 1, 'Fall', 2025, 'CS_Building', '101', 1),
    ('CS201', 1, 'Fall', 2025, 'CS_Building', '102', 2),
    ('MATH101', 1, 'Fall', 2025, 'Math_Building', '201', 2);

-- Insert into teaches
INSERT INTO teaches (ID, course_id, sec_id, semester, year)
VALUES
    (9001, 'CS101', 1, 'Fall', 2025),
    (9001, 'CS201', 1, 'Fall', 2025),
    (9002, 'MATH101', 1, 'Fall', 2025);

-- Insert into takes
-- Let Alice take CS101, Bob take MATH101, etc.
INSERT INTO takes (ID, course_id, sec_id, semester, year, grade)
VALUES
    (1001, 'CS101', 1, 'Fall', 2025, 'A'),
    (1002, 'MATH101', 1, 'Fall', 2025, 'B'),
    (1001, 'CS201', 1, 'Fall', 2025, NULL);  -- no grade yet

-- Insert into prereq
-- Suppose CS201 requires CS101
INSERT INTO prereq (course_id, prereq_id)
VALUES
    ('CS201', 'CS101');

-- Insert into advisor
-- Let Dr. Smith advise Alice, Dr. Johnson advise Bob
INSERT INTO advisor (s_id, i_id)
VALUES
    (1001, 9001),
    (1002, 9002);
