-- Check user staff@ev.local và phone duplicate issue

-- 1. Check user với email staff@ev.local
PRINT '=== User Info ===';
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
    role_id,
    created_at,
    updated_at
FROM users
WHERE email = 'staff@ev.local';

-- 2. Check phone number 0399106867 có bị trùng không
PRINT '';
PRINT '=== Phone Number Check ===';
SELECT 
    user_id,
    full_name,
    email,
    phone,
    is_active
FROM users
WHERE phone = '0399106867';

-- 3. Check tất cả users với phone tương tự
PRINT '';
PRINT '=== Similar Phone Numbers ===';
SELECT 
    user_id,
    full_name,
    email,
    phone,
    is_active
FROM users
WHERE phone LIKE '03991068%'
ORDER BY user_id;

-- 4. Simulate the UPDATE that backend would execute
PRINT '';
PRINT '=== Testing UPDATE (DRY RUN) ===';
PRINT 'The UPDATE statement would be:';
PRINT 'UPDATE users SET';
PRINT '  cccd = COALESCE(''012345678912'', cccd),';
PRINT '  license_number = COALESCE(''123AA21'', license_number),';
PRINT '  address = COALESCE(''tedcasxa'', address),';
PRINT '  gender = COALESCE(''male'', gender),';
PRINT '  date_of_birth = COALESCE(''2008-02-22'', date_of_birth),';
PRINT '  phone = CASE WHEN ''0399106867'' IS NOT NULL THEN ''0399106867'' ELSE phone END';
PRINT 'WHERE email = ''staff@ev.local''';
PRINT '';

-- 5. Check if email exists and is active
PRINT '=== Email Existence Check ===';
IF EXISTS (SELECT 1 FROM users WHERE email = 'staff@ev.local' AND is_active = 1)
    PRINT '✓ User exists and is active'
ELSE IF EXISTS (SELECT 1 FROM users WHERE email = 'staff@ev.local' AND is_active = 0)
    PRINT '✗ User exists but is NOT active (is_active = 0)'
ELSE
    PRINT '✗ User does NOT exist';

-- 6. Check phone duplicate for OTHER users
PRINT '';
PRINT '=== Phone Duplicate Check ===';
DECLARE @PhoneCount INT;
SELECT @PhoneCount = COUNT(*)
FROM users
WHERE phone = '0399106867' AND email != 'staff@ev.local';

IF @PhoneCount > 0
    PRINT '✗ Phone number 0399106867 is already used by ' + CAST(@PhoneCount AS VARCHAR) + ' other user(s)'
ELSE
    PRINT '✓ Phone number is available (not used by other users)';

