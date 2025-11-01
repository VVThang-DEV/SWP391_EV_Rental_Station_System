-- Check if phone number 0399106850 is used by multiple users
SELECT 
    user_id,
    full_name,
    email,
    phone,
    role_id,
    is_active,
    created_at
FROM users
WHERE phone = '0399106850';

-- Check the user with email tunhat2004@gmail.com
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
    is_active
FROM users
WHERE email = 'tunhat2004@gmail.com';

