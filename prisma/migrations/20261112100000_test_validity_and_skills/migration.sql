-- A4 profile 2026: result validity per test, and a Skills & competency category for NSCT. Additive only.
ALTER TABLE `Test` ADD COLUMN `validity` VARCHAR(100) NULL,
    MODIFY `category` ENUM('ADMISSIONS', 'POSTGRADUATE', 'LICENSING', 'RECRUITMENT', 'SKILLS') NOT NULL;
