-- Check user 59 status and data
SELECT 
    user_id,
    email,
    full_name,
    phone,
    cccd,
    license_number,
    address,
    gender,
    date_of_birth,
    is_active,
    created_at,
    updated_at
FROM users 
WHERE user_id = 59;

-- Check user documents
SELECT 
    document_id,
    user_id,
    document_type,
    file_url,
    status,
    uploaded_at
FROM user_documents 
WHERE user_id = 59;

