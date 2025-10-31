-- Check if phone 0399106850 exists and which users have it
SELECT 
    user_id,
    email,
    phone,
    full_name,
    is_active,
    created_at
FROM users 
WHERE phone = '0399106850';

-- Check user with email tulpn2004@gmail.com
SELECT 
    user_id,
    email,
    phone,
    full_name,
    is_active,
    created_at
FROM users 
WHERE email = 'tulpn2004@gmail.com';

