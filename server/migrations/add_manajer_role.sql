-- SQL Script to add 'manajer' role to User table
-- Run this if you get ENUM error

-- Step 1: Modify the User table to add 'manajer' to role ENUM
ALTER TABLE `User` 
MODIFY COLUMN `role` ENUM('owner', 'admin', 'manajer', 'staff') NOT NULL;

-- Step 2: (Optional) Create a sample manajer user
-- Password: 'manajer123' (hashed with bcrypt)
-- You can create this from the UI instead
/*
INSERT INTO `User` (username, password, role, nama_lengkap, created_at) 
VALUES ('manajer', '$2b$10$YourHashedPasswordHere', 'manajer', 'Manajer User', NOW());
*/

-- Verify the change
DESCRIBE `User`;
