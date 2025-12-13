-- إصلاح Foreign Keys - إزالة القيود القديمة وإضافة قيود جديدة صحيحة

-- إضافة foreign keys للجداول إذا لم تكن موجودة
DO $$ 
BEGIN
    -- student_attendance -> teachers
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'student_attendance_teacher_id_fkey' 
        AND table_name = 'student_attendance'
    ) THEN
        ALTER TABLE student_attendance 
        ADD CONSTRAINT student_attendance_teacher_id_fkey 
        FOREIGN KEY (teacher_id) 
        REFERENCES teachers(id) 
        ON DELETE CASCADE;
    END IF;

    -- student_attendance -> students
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'student_attendance_student_id_fkey' 
        AND table_name = 'student_attendance'
    ) THEN
        ALTER TABLE student_attendance 
        ADD CONSTRAINT student_attendance_student_id_fkey 
        FOREIGN KEY (student_id) 
        REFERENCES students(id) 
        ON DELETE CASCADE;
    END IF;

    -- student_points -> teachers
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'student_points_teacher_id_fkey' 
        AND table_name = 'student_points'
    ) THEN
        ALTER TABLE student_points 
        ADD CONSTRAINT student_points_teacher_id_fkey 
        FOREIGN KEY (teacher_id) 
        REFERENCES teachers(id) 
        ON DELETE CASCADE;
    END IF;

    -- student_points -> students
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'student_points_student_id_fkey' 
        AND table_name = 'student_points'
    ) THEN
        ALTER TABLE student_points 
        ADD CONSTRAINT student_points_student_id_fkey 
        FOREIGN KEY (student_id) 
        REFERENCES students(id) 
        ON DELETE CASCADE;
    END IF;

    -- circle_daily_activities -> circles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'circle_daily_activities_circle_id_fkey' 
        AND table_name = 'circle_daily_activities'
    ) THEN
        ALTER TABLE circle_daily_activities 
        ADD CONSTRAINT circle_daily_activities_circle_id_fkey 
        FOREIGN KEY (circle_id) 
        REFERENCES circles(id) 
        ON DELETE CASCADE;
    END IF;

    -- circles -> teachers
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'circles_teacher_id_fkey' 
        AND table_name = 'circles'
    ) THEN
        ALTER TABLE circles 
        ADD CONSTRAINT circles_teacher_id_fkey 
        FOREIGN KEY (teacher_id) 
        REFERENCES teachers(id) 
        ON DELETE CASCADE;
    END IF;

    -- students -> circles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'students_circle_id_fkey' 
        AND table_name = 'students'
    ) THEN
        ALTER TABLE students 
        ADD CONSTRAINT students_circle_id_fkey 
        FOREIGN KEY (circle_id) 
        REFERENCES circles(id) 
        ON DELETE CASCADE;
    END IF;

    -- student_daily_work -> students
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'student_daily_work_student_id_fkey' 
        AND table_name = 'student_daily_work'
    ) THEN
        ALTER TABLE student_daily_work 
        ADD CONSTRAINT student_daily_work_student_id_fkey 
        FOREIGN KEY (student_id) 
        REFERENCES students(id) 
        ON DELETE CASCADE;
    END IF;
END $$;