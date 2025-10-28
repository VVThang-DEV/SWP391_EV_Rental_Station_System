-- ============================================
-- Script to test payment data in database
-- Shows all payment information
-- ============================================

USE EV_Rental;
GO

-- View all payments with details
SELECT 
    payment_id,
    reservation_id,
    rental_id,
    method_type,
    amount,
    status,
    transaction_id,
    is_deposit,
    created_at,
    updated_at
FROM dbo.payments
ORDER BY created_at DESC;
GO

-- View payments with reservation details
SELECT 
    p.payment_id,
    p.reservation_id,
    r.user_id,
    r.vehicle_id,
    r.start_time,
    r.end_time,
    p.method_type,
    p.amount,
    p.status,
    p.transaction_id,
    p.created_at
FROM dbo.payments p
LEFT JOIN dbo.reservations r ON p.reservation_id = r.reservation_id
ORDER BY p.created_at DESC;
GO

-- Check payment statistics
SELECT 
    method_type,
    status,
    COUNT(*) as payment_count,
    SUM(amount) as total_amount
FROM dbo.payments
GROUP BY method_type, status
ORDER BY method_type, status;
GO

PRINT 'Test completed! Check the results above to verify payment data is being saved correctly.';
GO

