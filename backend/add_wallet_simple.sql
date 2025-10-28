-- Add wallet_balance to users table
ALTER TABLE dbo.users ADD wallet_balance DECIMAL(10,2) DEFAULT 0.00;

-- Add user_id to payments table for wallet transactions
ALTER TABLE dbo.payments ADD user_id INT NULL;
ALTER TABLE dbo.payments ADD CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES dbo.users(user_id);

-- Add transaction_type to payments table
ALTER TABLE dbo.payments ADD transaction_type VARCHAR(20) DEFAULT 'payment';
ALTER TABLE dbo.payments ADD CONSTRAINT ck_payments_transaction_type CHECK (transaction_type IN ('payment','deposit','refund','withdrawal'));

-- Update method_type constraint to include 'wallet'
ALTER TABLE dbo.payments DROP CONSTRAINT ck_payments_method;
ALTER TABLE dbo.payments ADD CONSTRAINT ck_payments_method CHECK (method_type IN ('cash','wallet','momo','vnpay','bank_transfer'));

-- Update constraint to allow wallet deposits (user_id only)
ALTER TABLE dbo.payments DROP CONSTRAINT ck_payments_one_fk;
ALTER TABLE dbo.payments ADD CONSTRAINT ck_payments_one_fk CHECK (
    (reservation_id IS NOT NULL AND rental_id IS NULL AND user_id IS NULL)
    OR (reservation_id IS NULL AND rental_id IS NOT NULL AND user_id IS NULL)
    OR (reservation_id IS NULL AND rental_id IS NULL AND user_id IS NOT NULL)
);

