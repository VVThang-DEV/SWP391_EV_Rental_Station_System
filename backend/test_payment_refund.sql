-- Test Payment Refund Check
-- This script helps debug why refund is not working

USE EV_Rental;
GO

-- 1. Check all recent payments
SELECT TOP 10
    payment_id,
    user_id,
    reservation_id,
    method_type,
    amount,
    status,
    transaction_type,
    transaction_id,
    created_at
FROM dbo.payments
ORDER BY created_at DESC;
GO

-- 2. Check wallet balance for user
SELECT 
    user_id,
    email,
    wallet_balance
FROM dbo.users
WHERE wallet_balance > 0
ORDER BY wallet_balance DESC;
GO

-- 3. Check recent reservations
SELECT TOP 10
    reservation_id,
    user_id,
    vehicle_id,
    status,
    start_time,
    end_time
FROM dbo.reservations
ORDER BY created_at DESC;
GO

-- 4. Check payments for a specific reservation (replace X with reservation ID)
-- SELECT payment_id, user_id, reservation_id, method_type, amount, status, transaction_type
-- FROM dbo.payments
-- WHERE reservation_id = X;

PRINT 'Test completed! Review the results above.';
GO
