-- Create OTP codes table
CREATE TABLE dbo.otp_codes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BIT DEFAULT 0,
    used_at DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Create index for better performance
CREATE INDEX IX_otp_codes_email_otp ON dbo.otp_codes (email, otp_code);
CREATE INDEX IX_otp_codes_expires_at ON dbo.otp_codes (expires_at);
