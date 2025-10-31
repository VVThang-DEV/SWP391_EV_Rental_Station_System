-- Quick check for staff@ev.local user and phone 0399106861

PRINT '=== Checking user staff@ev.local ===';
SELECT 
    user_id,
    full_name,
    email,
    phone,
    cccd,
    is_active,
    CASE WHEN is_active = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END AS status
FROM users
WHERE email = 'staff@ev.local';

PRINT '';
PRINT '=== Checking phone 0399106861 ===';
SELECT 
    user_id,
    full_name,
    email,
    phone,
    is_active
FROM users
WHERE phone = '0399106861';

PRINT '';
PRINT '=== Test UPDATE statement ===';
-- Simulate the UPDATE that backend would run
DECLARE @RowsAffected INT;

UPDATE users 
SET cccd = CASE WHEN '012345678912' IS NOT NULL THEN '012345678912' ELSE cccd END,
    license_number = CASE WHEN '123AA21' IS NOT NULL THEN '123AA21' ELSE license_number END,
    address = CASE WHEN 'tèdcasxa' IS NOT NULL THEN 'tèdcasxa' ELSE address END,
    gender = CASE WHEN 'male' IS NOT NULL THEN 'male' ELSE gender END,
    date_of_birth = CASE WHEN '2025-10-22' IS NOT NULL THEN '2025-10-22' ELSE date_of_birth END,
    phone = CASE WHEN '0399106861' IS NOT NULL THEN '0399106861' ELSE phone END,
    updated_at = GETDATE()
WHERE email = 'staff@ev.local' AND is_active = 1;

SET @RowsAffected = @@ROWCOUNT;
PRINT 'Rows affected: ' + CAST(@RowsAffected AS VARCHAR);

IF @RowsAffected = 0
BEGIN
    PRINT '❌ UPDATE FAILED - No rows affected';
    
    -- Check why
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'staff@ev.local')
        PRINT '  Reason: User does not exist';
    ELSE IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'staff@ev.local' AND is_active = 1)
        PRINT '  Reason: User exists but is_active = 0';
    ELSE
        PRINT '  Reason: Unknown (possibly phone duplicate check failed)';
END
ELSE
BEGIN
    PRINT '✅ UPDATE SUCCESS - ' + CAST(@RowsAffected AS VARCHAR) + ' row(s) updated';
END

-- Check result
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
    updated_at
FROM users
WHERE email = 'staff@ev.local';

