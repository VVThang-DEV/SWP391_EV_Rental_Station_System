-- =======================
-- Tạo mới database
-- =======================
IF DB_ID('ev_rental_system') IS NOT NULL
BEGIN
  ALTER DATABASE ev_rental_system SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
  DROP DATABASE ev_rental_system;
END;
GO
CREATE DATABASE ev_rental_system;
GO
USE ev_rental_system;
GO

-- =======================
-- Tạo bảng
-- =======================

-- roles
CREATE TABLE dbo.roles (
  role_id INT IDENTITY(1,1) PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE, -- admin, staff, customer
  description NVARCHAR(MAX),
  created_at DATETIME DEFAULT GETDATE()
);

-- users
CREATE TABLE dbo.users (
  user_id INT IDENTITY(1,1) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  cccd VARCHAR(20) NULL,
  license_number VARCHAR(50) NULL,
  address NVARCHAR(MAX) NULL,
  position VARCHAR(50) NULL, -- chỉ dành cho staff
  is_active BIT DEFAULT 1,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES dbo.roles(role_id)
);

-- OTP codes table (for email verification)
CREATE TABLE dbo.otp_codes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BIT DEFAULT 0,
    used_at DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- stations
CREATE TABLE dbo.stations (
  station_id INT IDENTITY(1,1) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE()
);

-- vehicles
CREATE TABLE dbo.vehicles (
  vehicle_id INT IDENTITY(1,1) PRIMARY KEY,
  station_id INT NOT NULL,
  model VARCHAR(100) NOT NULL,
  brand VARCHAR(50) NULL,
  year INT NULL,
  battery_level INT NOT NULL, -- 0-100
  max_range_km INT NULL,
  status VARCHAR(20) DEFAULT 'available', -- available, rented, maintenance
  price_per_hour DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_vehicles_station FOREIGN KEY (station_id) REFERENCES dbo.stations(station_id),
  CONSTRAINT ck_vehicles_battery CHECK (battery_level BETWEEN 0 AND 100)
);

-- reservations
CREATE TABLE dbo.reservations (
  reservation_id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  station_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  booking_channel VARCHAR(20) DEFAULT 'app', -- app, staff, kiosk
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, expired
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES dbo.users(user_id),
  CONSTRAINT fk_reservations_vehicle FOREIGN KEY (vehicle_id) REFERENCES dbo.vehicles(vehicle_id),
  CONSTRAINT fk_reservations_station FOREIGN KEY (station_id) REFERENCES dbo.stations(station_id),
  CONSTRAINT ck_reservations_status CHECK (status IN ('pending','confirmed','cancelled','expired'))
);

-- rentals
CREATE TABLE dbo.rentals (
  rental_id INT IDENTITY(1,1) PRIMARY KEY,
  reservation_id INT NULL, -- có thể thuê trực tiếp
  user_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  pickup_station_id INT NOT NULL,
  return_station_id INT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, ongoing, completed, cancelled
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_rentals_reservation FOREIGN KEY (reservation_id) REFERENCES dbo.reservations(reservation_id),
  CONSTRAINT fk_rentals_user FOREIGN KEY (user_id) REFERENCES dbo.users(user_id),
  CONSTRAINT fk_rentals_vehicle FOREIGN KEY (vehicle_id) REFERENCES dbo.vehicles(vehicle_id),
  CONSTRAINT fk_rentals_pickup FOREIGN KEY (pickup_station_id) REFERENCES dbo.stations(station_id),
  CONSTRAINT fk_rentals_return FOREIGN KEY (return_station_id) REFERENCES dbo.stations(station_id),
  CONSTRAINT ck_rentals_status CHECK (status IN ('pending','ongoing','completed','cancelled'))
);

-- payments (chỉ 1 trong 2 FK: reservation XOR rental)
CREATE TABLE dbo.payments (
  payment_id INT IDENTITY(1,1) PRIMARY KEY,
  reservation_id INT NULL,
  rental_id INT NULL,
  method_type VARCHAR(50) NOT NULL, -- cash, momo, vnpay, bank_transfer
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending, success, failed, refunded
  transaction_id VARCHAR(100) NULL,
  is_deposit BIT DEFAULT 0,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_payments_reservation FOREIGN KEY (reservation_id) REFERENCES dbo.reservations(reservation_id),
  CONSTRAINT fk_payments_rental FOREIGN KEY (rental_id) REFERENCES dbo.rentals(rental_id),
  CONSTRAINT ck_payments_one_fk CHECK (
    (reservation_id IS NOT NULL AND rental_id IS NULL)
    OR (reservation_id IS NULL AND rental_id IS NOT NULL)
  ),
  CONSTRAINT ck_payments_status CHECK (status IN ('pending','success','failed','refunded')),
  CONSTRAINT ck_payments_method CHECK (method_type IN ('cash','momo','vnpay','bank_transfer'))
);

-- pickup_qr_codes (gắn với rental)
CREATE TABLE dbo.pickup_qr_codes (
  qr_id INT IDENTITY(1,1) PRIMARY KEY,
  rental_id INT NOT NULL,
  code VARCHAR(128) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'active', -- active, used, expired
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_qr_rental FOREIGN KEY (rental_id) REFERENCES dbo.rentals(rental_id),
  CONSTRAINT ck_qr_status CHECK (status IN ('active','used','expired'))
);

-- contracts
CREATE TABLE dbo.contracts (
  contract_id INT IDENTITY(1,1) PRIMARY KEY,
  rental_id INT NOT NULL,
  contract_url VARCHAR(255) NOT NULL,
  signed_at DATETIME NULL,
  created_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_contract_rental FOREIGN KEY (rental_id) REFERENCES dbo.rentals(rental_id)
);

-- handovers (gộp ảnh bằng JSON URLs)
CREATE TABLE dbo.handovers (
  handover_id INT IDENTITY(1,1) PRIMARY KEY,
  rental_id INT NOT NULL,
  staff_id INT NULL, -- null nếu khách tự check-in bằng QR
  type VARCHAR(20) NOT NULL, -- pickup, return
  condition_notes NVARCHAR(MAX) NULL,
  image_urls NVARCHAR(MAX) NULL, -- JSON danh sách ảnh
  created_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_handover_rental FOREIGN KEY (rental_id) REFERENCES dbo.rentals(rental_id),
  CONSTRAINT fk_handover_staff FOREIGN KEY (staff_id) REFERENCES dbo.users(user_id),
  CONSTRAINT ck_handover_type CHECK (type IN ('pickup','return'))
);

-- user_documents
CREATE TABLE dbo.user_documents (
  document_id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  document_type VARCHAR(50) NOT NULL, -- license, cccd, passport
  file_url VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  verified_at DATETIME NULL,
  verified_by INT NULL,
  uploaded_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_document_user FOREIGN KEY (user_id) REFERENCES dbo.users(user_id),
  CONSTRAINT fk_document_verifier FOREIGN KEY (verified_by) REFERENCES dbo.users(user_id),
  CONSTRAINT ck_document_status CHECK (status IN ('pending','approved','rejected'))
);

-- battery_logs
CREATE TABLE dbo.battery_logs (
  log_id INT IDENTITY(1,1) PRIMARY KEY,
  vehicle_id INT NOT NULL,
  staff_id INT NULL,
  battery_level INT NOT NULL,
  logged_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_battery_vehicle FOREIGN KEY (vehicle_id) REFERENCES dbo.vehicles(vehicle_id),
  CONSTRAINT fk_battery_staff FOREIGN KEY (staff_id) REFERENCES dbo.users(user_id),
  CONSTRAINT ck_battery_level CHECK (battery_level BETWEEN 0 AND 100)
);

-- maintenance_records
CREATE TABLE dbo.maintenance_records (
  maintenance_id INT IDENTITY(1,1) PRIMARY KEY,
  vehicle_id INT NOT NULL,
  staff_id INT NULL,
  maintenance_type VARCHAR(50) NOT NULL,
  description NVARCHAR(MAX) NULL,
  cost DECIMAL(10,2) NULL,
  completed_at DATETIME NULL,
  created_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_maintenance_vehicle FOREIGN KEY (vehicle_id) REFERENCES dbo.vehicles(vehicle_id),
  CONSTRAINT fk_maintenance_staff FOREIGN KEY (staff_id) REFERENCES dbo.users(user_id)
);

-- reports
CREATE TABLE dbo.reports (
  report_id INT IDENTITY(1,1) PRIMARY KEY,
  station_id INT NOT NULL,
  report_type VARCHAR(20) DEFAULT 'daily', -- daily, monthly, yearly
  report_date DATE NOT NULL,
  revenue DECIMAL(15,2) DEFAULT 0,
  utilization_rate FLOAT DEFAULT 0,
  created_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_report_station FOREIGN KEY (station_id) REFERENCES dbo.stations(station_id)
);

-- feedbacks
CREATE TABLE dbo.feedbacks (
  feedback_id INT IDENTITY(1,1) PRIMARY KEY,
  rental_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL, -- 1-5
  comment NVARCHAR(MAX) NULL,
  created_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_feedback_rental FOREIGN KEY (rental_id) REFERENCES dbo.rentals(rental_id),
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES dbo.users(user_id),
  CONSTRAINT ck_feedback_rating CHECK (rating BETWEEN 1 AND 5)
);

-- incidents
CREATE TABLE dbo.incidents (
  incident_id INT IDENTITY(1,1) PRIMARY KEY,
  rental_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  staff_id INT NULL,
  description NVARCHAR(MAX) NULL,
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved
  created_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_incident_rental FOREIGN KEY (rental_id) REFERENCES dbo.rentals(rental_id),
  CONSTRAINT fk_incident_vehicle FOREIGN KEY (vehicle_id) REFERENCES dbo.vehicles(vehicle_id),
  CONSTRAINT fk_incident_staff FOREIGN KEY (staff_id) REFERENCES dbo.users(user_id),
  CONSTRAINT ck_incident_status CHECK (status IN ('open','in_progress','resolved'))
);

-- notifications
CREATE TABLE dbo.notifications (
  notification_id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message NVARCHAR(MAX) NOT NULL,
  type VARCHAR(50) NOT NULL, -- battery_low, rental_end, payment_success
  is_read BIT DEFAULT 0,
  sent_at DATETIME DEFAULT GETDATE(),
  read_at DATETIME NULL,
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES dbo.users(user_id)
);

-- =======================
-- Indexes
-- =======================
CREATE INDEX ix_reservations_vehicle_time ON dbo.reservations(vehicle_id, start_time, end_time);
CREATE INDEX ix_rentals_vehicle_time ON dbo.rentals(vehicle_id, start_time);
CREATE INDEX ix_payments_rental ON dbo.payments(rental_id);
CREATE INDEX ix_payments_reservation ON dbo.payments(reservation_id);

-- OTP indexes
CREATE INDEX IX_otp_codes_email_otp ON dbo.otp_codes (email, otp_code);
CREATE INDEX IX_otp_codes_expires_at ON dbo.otp_codes (expires_at);

-- =======================
-- Seed roles & tài khoản mặc định
-- =======================
INSERT INTO dbo.roles(role_name, description) VALUES
('admin','System administrator'),
('staff','Station staff'),
('customer','End user');

DECLARE @admin_role_id INT = (SELECT role_id FROM dbo.roles WHERE role_name='admin');
DECLARE @staff_role_id INT = (SELECT role_id FROM dbo.roles WHERE role_name='staff');

DECLARE @admin_email VARCHAR(100) = 'admin@ev.local';
DECLARE @staff_email VARCHAR(100) = 'staff@ev.local';
DECLARE @admin_hash  VARCHAR(64)  = LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256','Admin@123'),2));
DECLARE @staff_hash  VARCHAR(64)  = LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256','Staff@123'),2));

INSERT INTO dbo.users(email, password_hash, role_id, full_name, phone, is_active, position, created_at, updated_at)
VALUES
(@admin_email, @admin_hash, @admin_role_id, 'System Admin', '0900000001', 1, 'Administrator', GETDATE(), GETDATE()),
(@staff_email, @staff_hash, @staff_role_id, 'Default Staff', '0900000002', 1, 'Staff', GETDATE(), GETDATE());

-- Verify
SELECT user_id, email, role_id, full_name, phone, is_active
FROM dbo.users
WHERE email IN ('admin@ev.local','staff@ev.local');
