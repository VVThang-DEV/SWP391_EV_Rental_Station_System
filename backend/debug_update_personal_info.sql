-- Debug script for personal info update issue
-- Check user with email staff@ev.local

-- 1. Check if user exists
SELECT 
    user_id,
    full_name,
    email,
    phone,
    cccd,
    license_number,
    address,
    gender,
    date_of_birth,
    is_active,
    role_id
FROM users
WHERE email = 'staff@ev.local';

-- 2. Check if phone 0399106867 is used by other users
SELECT 
    user_id,
    full_name,
    email,
    phone,
    is_active
FROM users
WHERE phone = '0399106867';

-- 3. Check all users with similar phone numbers
SELECT 
    user_id,
    full_name,
    email,
    phone,
    is_active
FROM users
WHERE phone LIKE '0399106%';

-- 4. Test UPDATE statement that would be executed
-- This is a DRY RUN - comment out to actually run it
/*
UPDATE users 
SET cccd = COALESCE('012345678912', cccd),
    license_number = COALESCE('123AA21', license_number),
    address = COALESCE('tedcasxa', address),
    gender = COALESCE('Male', gender),
    date_of_birth = COALESCE('2011-02-22', date_of_birth),
    phone = CASE WHEN '0399106867' IS NOT NULL THEN '0399106867' ELSE phone END,
    updated_at = GETDATE()
WHERE email = 'staff@ev.local';

SELECT @@ROWCOUNT AS RowsAffected;
*/

-- 5. Check if there are any triggers on users table that might interfere
SELECT 
    name AS TriggerName,
    OBJECT_NAME(parent_id) AS TableName,
    type_desc,
    is_disabled
FROM sys.triggers
WHERE parent_id = OBJECT_ID('users');

