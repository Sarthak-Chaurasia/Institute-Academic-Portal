-- Drop tables in reverse dependency order, so we can run this script repeatedly
DROP TABLE IF EXISTS advisor CASCADE;
DROP TABLE IF EXISTS prereq CASCADE;
DROP TABLE IF EXISTS takes CASCADE;
DROP TABLE IF EXISTS teaches CASCADE;
DROP TABLE IF EXISTS section CASCADE;
DROP TABLE IF EXISTS instructor CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS course CASCADE;
DROP TABLE IF EXISTS time_slot CASCADE;
DROP TABLE IF EXISTS classroom CASCADE;
DROP TABLE IF EXISTS department CASCADE;

-- 1) department
CREATE TABLE department (
    dept_name   VARCHAR(50) PRIMARY KEY,
    building    VARCHAR(50),
    budget      NUMERIC(12,2)
);

-- 2) classroom
-- Composite primary key: (building, room_no)
CREATE TABLE classroom (
    building    VARCHAR(50),
    room_no     VARCHAR(10),
    capacity    INT,
    PRIMARY KEY (building, room_no)
);

-- 3) time_slot
CREATE TABLE time_slot (
    time_slot_id SERIAL PRIMARY KEY,
    day         VARCHAR(10),
    start_time  TIME,
    end_time    TIME
);

-- 4) course
CREATE TABLE course (
    course_id   VARCHAR(10) PRIMARY KEY,
    title       VARCHAR(100) NOT NULL,
    dept_name   VARCHAR(50)  NOT NULL,
    credits     INT,
    FOREIGN KEY (dept_name)
        REFERENCES department(dept_name)
        ON DELETE SET NULL  -- or CASCADE/RESTRICT as you prefer
        ON UPDATE CASCADE
);

-- 5) student
CREATE TABLE student (
    ID          INT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    dept_name   VARCHAR(50),
    tot_cred    INT DEFAULT 0,
    FOREIGN KEY (dept_name)
        REFERENCES department(dept_name)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- 6) instructor
CREATE TABLE instructor (
    ID          INT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    dept_name   VARCHAR(50),
    salary      NUMERIC(10,2),
    FOREIGN KEY (dept_name)
        REFERENCES department(dept_name)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- 7) section
-- Composite primary key: (course_id, sec_id, semester, year)
CREATE TABLE section (
    course_id       VARCHAR(10),
    sec_id          INT,
    semester        VARCHAR(10),
    year            INT,
    building        VARCHAR(50),
    room_no         VARCHAR(10),
    time_slot_id    INT,
    PRIMARY KEY (course_id, sec_id, semester, year),
    FOREIGN KEY (course_id)
        REFERENCES course(course_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (building, room_no)
        REFERENCES classroom(building, room_no)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (time_slot_id)
        REFERENCES time_slot(time_slot_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- 8) teaches
-- Composite primary key can be (ID, course_id, sec_id, semester, year)
CREATE TABLE teaches (
    ID              INT,
    course_id       VARCHAR(10),
    sec_id          INT,
    semester        VARCHAR(10),
    year            INT,
    PRIMARY KEY (ID, course_id, sec_id, semester, year),
    FOREIGN KEY (ID)
        REFERENCES instructor(ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (course_id, sec_id, semester, year)
        REFERENCES section(course_id, sec_id, semester, year)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 9) takes
-- A student takes a particular section
-- Composite primary key can be (ID, course_id, sec_id, semester, year)
CREATE TABLE takes (
    ID              INT,
    course_id       VARCHAR(10),
    sec_id          INT,
    semester        VARCHAR(10),
    year            INT,
    grade           VARCHAR(2),
    PRIMARY KEY (ID, course_id, sec_id, semester, year),
    FOREIGN KEY (ID)
        REFERENCES student(ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (course_id, sec_id, semester, year)
        REFERENCES section(course_id, sec_id, semester, year)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 10) prereq
-- A course can have other courses as prerequisites
-- Composite primary key: (course_id, prereq_id)
CREATE TABLE prereq (
    course_id   VARCHAR(10),
    prereq_id   VARCHAR(10),
    PRIMARY KEY (course_id, prereq_id),
    FOREIGN KEY (course_id)
        REFERENCES course(course_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (prereq_id)
        REFERENCES course(course_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 11) advisor
-- A student has an advisor (instructor)
-- Composite primary key: (s_id, i_id)
CREATE TABLE advisor (
    s_id    INT,
    i_id    INT,
    PRIMARY KEY (s_id, i_id),
    FOREIGN KEY (s_id)
        REFERENCES student(ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (i_id)
        REFERENCES instructor(ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
