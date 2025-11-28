-- SQL Script to Create Admin User
-- Run this in your PostgreSQL database

-- Fix the constraint and create admin user
DO $$
BEGIN
    -- Drop the existing constraint if it exists
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    
    -- Recreate the constraint with all possible role values
    ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('CLIENT', 'FOURNISSEUR', 'ADMIN'));
    
    -- Now create the admin user
    INSERT INTO users (first_name, last_name, email, password, role, gender, age, created_at) 
    VALUES (
        'Admin',
        'Administrator',
        'admin@stage2025.com',
        '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO',
        'ADMIN',
        NULL,
        NULL,
        NOW()
    );
    
    RAISE NOTICE 'Admin user created successfully with ADMIN role';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating admin user: %', SQLERRM;
    RAISE EXCEPTION '%', SQLERRM;
END $$;

-- Note: The password hash above is a placeholder
-- To generate a proper BCrypt hash, use one of these methods:

-- METHOD 1: Using online BCrypt generator
-- Visit: https://bcrypt-generator.com/
-- Input your password (e.g., "admin123")
-- Copy the hash and replace the password value above

-- METHOD 2: Using Spring Boot application
-- Add this code temporarily to your application:
/*
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordEncoder {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode("admin123"));
    }
}
*/

-- METHOD 3: Using Java code directly
-- Run this snippet:
/*
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String encodedPassword = encoder.encode("admin123");
System.out.println(encodedPassword);
*/

-- After creating the admin user, you can login with:
-- Email: admin@stage2025.com
-- Password: admin123 (or whatever you set)