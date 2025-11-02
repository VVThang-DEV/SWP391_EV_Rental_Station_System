-- ===================================================================================
-- Complete Script to Create and Populate the 'EV_Rental' Database
-- Version: 1.0 (Complete schema and data as of 31/10/2025)
-- Description: Creates database, schema, inserts data, sets up constraints/indexes
-- Usage: Execute this script in SQL Server Management Studio (SSMS)
-- ===================================================================================

-- ===================================================================================
-- STEP 1: Switch to master database and drop existing database if it exists
-- ===================================================================================
USE [master]
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'EV_Rental')
BEGIN
    ALTER DATABASE [EV_Rental] SET SINGLE_USER WITH ROLLBACK IMMEDIATE
    DROP DATABASE [EV_Rental]
    PRINT '>>> Existing EV_Rental database dropped.'
END
GO

-- ===================================================================================
-- STEP 2: Create the new database (portable - no specific file paths)
-- ===================================================================================
PRINT '>>> Creating database EV_Rental...'
CREATE DATABASE [EV_Rental]
GO

-- ===================================================================================
-- STEP 3: Configure database properties
-- ===================================================================================
PRINT '>>> Configuring database properties...'
ALTER DATABASE [EV_Rental] SET COMPATIBILITY_LEVEL = 160
GO

IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
BEGIN
    EXEC [EV_Rental].[dbo].[sp_fulltext_database] @action = 'enable'
END
GO

ALTER DATABASE [EV_Rental] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [EV_Rental] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [EV_Rental] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [EV_Rental] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [EV_Rental] SET ARITHABORT OFF 
GO
ALTER DATABASE [EV_Rental] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [EV_Rental] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [EV_Rental] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [EV_Rental] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [EV_Rental] SET CURSOR_DEFAULT GLOBAL 
GO
ALTER DATABASE [EV_Rental] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [EV_Rental] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [EV_Rental] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [EV_Rental] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [EV_Rental] SET ENABLE_BROKER 
GO
ALTER DATABASE [EV_Rental] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [EV_Rental] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [EV_Rental] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [EV_Rental] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [EV_Rental] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [EV_Rental] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [EV_Rental] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [EV_Rental] SET RECOVERY FULL 
GO
ALTER DATABASE [EV_Rental] SET MULTI_USER 
GO
ALTER DATABASE [EV_Rental] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [EV_Rental] SET DB_CHAINING OFF 
GO
ALTER DATABASE [EV_Rental] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [EV_Rental] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [EV_Rental] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [EV_Rental] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'EV_Rental', N'ON'
GO
ALTER DATABASE [EV_Rental] SET QUERY_STORE = ON
GO
ALTER DATABASE [EV_Rental] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO

-- ===================================================================================
-- STEP 4: Switch to the new database
-- ===================================================================================
USE [EV_Rental]
GO

PRINT '>>> Switched to EV_Rental database.'
GO

-- ===================================================================================
-- STEP 5: Create all tables
-- ===================================================================================
PRINT '>>> Creating tables...'
GO

-- Table: roles
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[roles](
	[role_id] [int] IDENTITY(1,1) NOT NULL,
	[role_name] [varchar](50) NOT NULL,
	[description] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([role_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- Table: stations
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[stations](
	[station_id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[latitude] [decimal](9, 6) NOT NULL,
	[longitude] [decimal](9, 6) NOT NULL,
	[address] [nvarchar](255) NOT NULL,
	[status] [varchar](50) NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[city] [nvarchar](100) NULL,
	[available_vehicles] [int] NULL,
	[total_slots] [int] NULL,
	[amenities] [nvarchar](max) NULL,
	[rating] [decimal](3, 2) NULL,
	[operating_hours] [nvarchar](100) NULL,
	[fast_charging] [bit] NULL,
	[image] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED ([station_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- Table: users
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[users](
	[user_id] [int] IDENTITY(1,1) NOT NULL,
	[email] [varchar](100) NOT NULL,
	[password_hash] [varchar](255) NOT NULL,
	[role_id] [int] NULL,
	[full_name] [nvarchar](100) NOT NULL,
	[phone] [varchar](20) NOT NULL,
	[cccd] [varchar](20) NULL,
	[license_number] [varchar](50) NULL,
	[address] [nvarchar](255) NULL,
	[position] [varchar](50) NULL,
	[is_active] [bit] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[gender] [nvarchar](10) NULL,
	[date_of_birth] [date] NULL,
	[station_id] [int] NULL,
	[wallet_balance] [decimal](10, 2) NULL,
CONSTRAINT [PK__users__B9BE370F670811E3] PRIMARY KEY CLUSTERED ([user_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Table: user_documents
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[user_documents](
	[document_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NULL,
	[document_type] [varchar](50) NOT NULL,
	[file_url] [varchar](255) NOT NULL,
	[status] [varchar](20) NULL,
	[verified_at] [datetime] NULL,
	[verified_by] [int] NULL,
	[uploaded_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([document_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Table: vehicle_models
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[vehicle_models](
	[model_id] [varchar](50) NOT NULL,
	[brand] [varchar](50) NOT NULL,
	[model_name] [nvarchar](100) NOT NULL,
	[type] [varchar](50) NULL,
	[year] [int] NULL,
	[seats] [int] NULL,
	[features] [nvarchar](max) NULL,
	[description] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[image] [nvarchar](500) NULL,
	[price_per_hour] [decimal](10, 2) NULL,
	[price_per_day] [decimal](10, 2) NULL,
	[max_range_km] [int] NULL,
PRIMARY KEY CLUSTERED ([model_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- Table: vehicles
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[vehicles](
	[vehicle_id] [int] IDENTITY(1,1) NOT NULL,
	[station_id] [int] NULL,
	[model_id] [varchar](50) NOT NULL,
	[unique_vehicle_id] [varchar](100) NULL,
	[battery_level] [int] NOT NULL,
	[max_range_km] [int] NULL,
	[status] [varchar](50) NOT NULL,
	[price_per_hour] [decimal](10, 2) NOT NULL,
	[price_per_day] [decimal](10, 2) NULL,
	[rating] [decimal](2, 1) NULL,
	[review_count] [int] NULL,
	[trips] [int] NULL,
	[mileage] [int] NULL,
	[inspection_date] [date] NULL,
	[insurance_expiry] [date] NULL,
	[condition] [varchar](50) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[image] [nvarchar](500) NULL,
	[license_plate] [nvarchar](20) NULL,
	[fuel_efficiency] [nvarchar](50) NULL,
	[location] [nvarchar](200) NULL,
	[color] [nvarchar](50) NULL,
	[year] [int] NULL,
	[battery_capacity] [decimal](5, 2) NULL,
	[purchase_date] [date] NULL,
	[warranty_expiry] [date] NULL,
	[next_maintenance_date] [date] NULL,
	[notes] [nvarchar](max) NULL,
	[last_maintenance] [date] NULL,
PRIMARY KEY CLUSTERED ([vehicle_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- Table: reservations
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[reservations](
	[reservation_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[vehicle_id] [int] NOT NULL,
	[station_id] [int] NOT NULL,
	[start_time] [datetime] NOT NULL,
	[end_time] [datetime] NOT NULL,
	[status] [varchar](20) NULL,
	[created_at] [datetime] NULL,
	[cancellation_reason] [nvarchar](500) NULL,
	[cancelled_by] [varchar](20) NULL,
	[cancelled_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([reservation_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Table: rentals
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[rentals](
	[rental_id] [int] IDENTITY(1,1) NOT NULL,
	[reservation_id] [int] NULL,
	[user_id] [int] NULL,
	[vehicle_id] [int] NULL,
	[pickup_station_id] [int] NULL,
	[return_station_id] [int] NULL,
	[start_time] [datetime] NOT NULL,
	[end_time] [datetime] NULL,
	[status] [varchar](20) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([rental_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Table: payments
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[payments](
	[payment_id] [int] IDENTITY(1,1) NOT NULL,
	[reservation_id] [int] NULL,
	[rental_id] [int] NULL,
	[method_type] [varchar](50) NOT NULL,
	[amount] [decimal](10, 2) NOT NULL,
	[status] [varchar](20) NOT NULL,
	[transaction_id] [varchar](100) NULL,
	[is_deposit] [bit] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[user_id] [int] NULL,
	[transaction_type] [varchar](20) NULL,
PRIMARY KEY CLUSTERED ([payment_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Table: battery_logs
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[battery_logs](
	[log_id] [int] IDENTITY(1,1) NOT NULL,
	[vehicle_id] [int] NULL,
	[staff_id] [int] NULL,
	[battery_level] [int] NOT NULL,
	[logged_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([log_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Table: contracts
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[contracts](
	[contract_id] [int] IDENTITY(1,1) NOT NULL,
	[rental_id] [int] NULL,
	[contract_url] [varchar](255) NOT NULL,
	[signed_at] [datetime] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([contract_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Table: handovers
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[handovers](
	[handover_id] [int] IDENTITY(1,1) NOT NULL,
	[rental_id] [int] NULL,
	[staff_id] [int] NULL,
	[type] [varchar](20) NOT NULL,
	[condition_notes] [nvarchar](max) NULL,
	[image_urls] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([handover_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- Table: maintenance_records
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[maintenance_records](
	[maintenance_id] [int] IDENTITY(1,1) NOT NULL,
	[vehicle_id] [int] NULL,
	[staff_id] [int] NULL,
	[maintenance_type] [varchar](50) NOT NULL,
	[description] [nvarchar](max) NULL,
	[cost] [decimal](10, 2) NULL,
	[completed_at] [datetime] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([maintenance_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- Table: notifications
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[notifications](
	[notification_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NULL,
	[title] [varchar](200) NOT NULL,
	[message] [nvarchar](max) NOT NULL,
	[type] [varchar](50) NOT NULL,
	[is_read] [bit] NULL,
	[sent_at] [datetime] NULL,
	[read_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([notification_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- Table: otp_codes
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[otp_codes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[email] [varchar](100) NOT NULL,
	[otp_code] [varchar](10) NOT NULL,
	[expires_at] [datetime] NOT NULL,
	[is_used] [bit] NULL,
	[used_at] [datetime] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Table: pickup_qr_codes
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pickup_qr_codes](
	[qr_id] [int] IDENTITY(1,1) NOT NULL,
	[rental_id] [int] NULL,
	[code] [varchar](128) NOT NULL,
	[status] [varchar](20) NULL,
	[expires_at] [datetime] NOT NULL,
	[used_at] [datetime] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([qr_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Table: reports
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[reports](
	[report_id] [int] IDENTITY(1,1) NOT NULL,
	[station_id] [int] NULL,
	[report_type] [varchar](20) NULL,
	[report_date] [date] NOT NULL,
	[revenue] [decimal](15, 2) NULL,
	[utilization_rate] [float] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED ([report_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

PRINT '>>> Tables created successfully.'
GO

-- ===================================================================================
-- STEP 6: Add default constraints
-- ===================================================================================
PRINT '>>> Adding default constraints...'
GO

ALTER TABLE [dbo].[battery_logs] ADD DEFAULT (getdate()) FOR [logged_at]
GO
ALTER TABLE [dbo].[contracts] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[handovers] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[maintenance_records] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[notifications] ADD DEFAULT ((0)) FOR [is_read]
GO
ALTER TABLE [dbo].[notifications] ADD DEFAULT (getdate()) FOR [sent_at]
GO
ALTER TABLE [dbo].[otp_codes] ADD DEFAULT ((0)) FOR [is_used]
GO
ALTER TABLE [dbo].[otp_codes] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[payments] ADD DEFAULT ((0)) FOR [is_deposit]
GO
ALTER TABLE [dbo].[payments] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[payments] ADD DEFAULT ('payment') FOR [transaction_type]
GO
ALTER TABLE [dbo].[pickup_qr_codes] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[rentals] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[reports] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[reservations] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[roles] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[stations] ADD DEFAULT ('active') FOR [status]
GO
ALTER TABLE [dbo].[stations] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[stations] ADD DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[stations] ADD DEFAULT ((0)) FOR [available_vehicles]
GO
ALTER TABLE [dbo].[stations] ADD DEFAULT ((0)) FOR [total_slots]
GO
ALTER TABLE [dbo].[stations] ADD DEFAULT ((0)) FOR [rating]
GO
ALTER TABLE [dbo].[stations] ADD DEFAULT ((0)) FOR [fast_charging]
GO
ALTER TABLE [dbo].[user_documents] ADD DEFAULT (getdate()) FOR [uploaded_at]
GO
ALTER TABLE [dbo].[users] ADD CONSTRAINT [DF__users__is_active__3E52440B] DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[users] ADD CONSTRAINT [DF__users__created_a__3F466844] DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[users] ADD DEFAULT ((0.00)) FOR [wallet_balance]
GO
ALTER TABLE [dbo].[vehicle_models] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[vehicle_models] ADD DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[vehicles] ADD DEFAULT ('available') FOR [status]
GO
ALTER TABLE [dbo].[vehicles] ADD DEFAULT ((0)) FOR [review_count]
GO
ALTER TABLE [dbo].[vehicles] ADD DEFAULT ((0)) FOR [trips]
GO
ALTER TABLE [dbo].[vehicles] ADD DEFAULT ((0)) FOR [mileage]
GO
ALTER TABLE [dbo].[vehicles] ADD DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[vehicles] ADD DEFAULT (getdate()) FOR [updated_at]
GO

PRINT '>>> Default constraints added successfully.'
GO

-- ===================================================================================
-- STEP 7: Insert data into tables
-- ===================================================================================
PRINT '>>> Inserting data into tables...'

-- ===================================================================================
-- STEP 7: Insert data into ALL tables (COMPLETE DATA FROM EXPORT)
-- ===================================================================================
PRINT '>>> Inserting data into tables...'
GO

SET IDENTITY_INSERT [dbo].[roles] ON;
GO

INSERT [dbo].[roles] ([role_id], [role_name], [description], [created_at]) VALUES (1, N'admin', N'System administrator', CAST(N'2025-10-06 15:27:22.100' AS DateTime))
GO
INSERT [dbo].[roles] ([role_id], [role_name], [description], [created_at]) VALUES (2, N'staff', N'Station staff', CAST(N'2025-10-06 15:27:22.100' AS DateTime))
GO
INSERT [dbo].[roles] ([role_id], [role_name], [description], [created_at]) VALUES (3, N'customer', N'End user', CAST(N'2025-10-06 15:27:22.100' AS DateTime))
GO

SET IDENTITY_INSERT [dbo].[roles] OFF;
GO

SET IDENTITY_INSERT [dbo].[stations] ON;
GO

INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (1, N'District 1 Station', CAST(10.776900 AS Decimal(9, 6)), CAST(106.700900 AS Decimal(9, 6)), N'123 Nguyen Hue Street', N'active', CAST(N'2025-10-14 15:48:36.357' AS DateTime), CAST(N'2025-10-23 20:05:48.593' AS DateTime), N'Ho Chi Minh City', 8, 15, N'["Fast Charging", "Cafe", "Restroom", "Parking"]', CAST(4.80 AS Decimal(3, 2)), N'24/7', 1, N'https://iwater.vn/Image/Picture/New/Quan-1.jpg')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (2, N'District 7 Station', CAST(10.728500 AS Decimal(9, 6)), CAST(106.731700 AS Decimal(9, 6)), N'456 Phu My Hung Boulevard', N'active', CAST(N'2025-10-14 15:48:36.357' AS DateTime), CAST(N'2025-10-22 14:28:42.153' AS DateTime), N'Ho Chi Minh City', 6, 10, N'["Fast Charging", "Shopping Mall", "Restaurant", "ATM"]', CAST(4.60 AS Decimal(3, 2)), N'6:00 AM - 10:00 PM', 1, N'https://cdn.vntrip.vn/cam-nang/wp-content/uploads/2017/09/1-12-e1505536237895.jpg')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (3, N'Airport Station', CAST(10.823100 AS Decimal(9, 6)), CAST(106.629700 AS Decimal(9, 6)), N'Tan Son Nhat International Airport', N'active', CAST(N'2025-10-14 15:48:36.357' AS DateTime), CAST(N'2025-10-22 14:28:42.153' AS DateTime), N'Ho Chi Minh City', 6, 20, N'["Fast Charging", "Airport Shuttle", "24/7 Service", "Lounge"]', CAST(4.90 AS Decimal(3, 2)), N'24/7', 1, N'https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/shutterstock4163434601640951746845-1710837275629.png')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (4, N'District 3 Station', CAST(10.789100 AS Decimal(9, 6)), CAST(106.689700 AS Decimal(9, 6)), N'789 Vo Van Tan Street', N'active', CAST(N'2025-10-14 15:48:36.357' AS DateTime), CAST(N'2025-10-22 14:32:14.333' AS DateTime), N'Ho Chi Minh City', 11, 13, N'["Standard Charging", "Convenience Store", "WiFi"]', CAST(4.40 AS Decimal(3, 2)), N'7:00 AM - 9:00 PM', 0, N'https://nasaland.vn/wp-content/uploads/2022/09/Quan-3-1.jpg')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (5, N'District 5 Station', CAST(10.754600 AS Decimal(9, 6)), CAST(106.667700 AS Decimal(9, 6)), N'321 An Duong Vuong Street', N'active', CAST(N'2025-10-14 15:48:36.357' AS DateTime), CAST(N'2025-10-22 14:28:42.153' AS DateTime), N'Ho Chi Minh City', 7, 15, N'["Fast Charging", "Food Court", "Pharmacy", "Gas Station"]', CAST(4.50 AS Decimal(3, 2)), N'24/7', 1, N'https://cdn.vietnammoi.vn/171464242508312576/2021/6/30/mttq-quan-5-16250453134831325127756.jpg')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (6, N'Binh Thanh Station', CAST(10.797200 AS Decimal(9, 6)), CAST(106.731700 AS Decimal(9, 6)), N'654 Xa Lo Ha Noi Street', N'active', CAST(N'2025-10-14 15:48:36.357' AS DateTime), CAST(N'2025-10-22 14:28:42.153' AS DateTime), N'Ho Chi Minh City', 7, 18, N'["Fast Charging", "Supermarket", "Bank", "Car Wash"]', CAST(4.70 AS Decimal(3, 2)), N'6:00 AM - 11:00 PM', 1, N'https://bizweb.dktcdn.net/thumb/1024x1024/100/414/214/products/toan-thap.jpg?v=1676254526307')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (7, N'Thu Duc Station', CAST(10.740600 AS Decimal(9, 6)), CAST(106.679200 AS Decimal(9, 6)), N'987 Pham The Hien Street', N'active', CAST(N'2025-10-14 15:48:36.357' AS DateTime), CAST(N'2025-10-22 14:32:14.333' AS DateTime), N'Ho Chi Minh City', 15, 17, N'["Standard Charging", "Restaurant", "Restroom"]', CAST(4.20 AS Decimal(3, 2)), N'8:00 AM - 8:00 PM', 0, N'https://quanlykhachsan.edu.vn/wp-content/uploads/2021/12/dia-diem-chup-anh-dep-o-quan-8.jpg')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (8, N'Phu Nhuan Station', CAST(10.774300 AS Decimal(9, 6)), CAST(106.704600 AS Decimal(9, 6)), N'38 Khanh Hoi Street', N'active', CAST(N'2025-10-14 15:48:36.357' AS DateTime), CAST(N'2025-10-22 14:28:42.153' AS DateTime), N'Ho Chi Minh City', 7, 14, N'["Fast Charging", "Hotel", "Spa", "Shopping", "Fine Dining"]', CAST(4.90 AS Decimal(3, 2)), N'24/7', 1, N'https://static.vinwonders.com/production/quan-4-co-gi-choi-top-banner.jpg')
GO

SET IDENTITY_INSERT [dbo].[stations] OFF;
GO

INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'EVO200', N'VinFast', N'Evo200', N'Scooter', 2024, 2, N'Smart Key, USB Charging, LED Display, Mobile App', N'VinFast Evo200 - Modern electric scooter with smart connectivity and efficient performance for urban mobility.', CAST(N'2025-10-14 15:49:32.007' AS DateTime), CAST(N'2025-10-14 15:49:32.007' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), 90)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'EVO200LITE', N'VinFast', N'Evo200 Lite', N'Scooter', 2024, 2, N'Lightweight, Energy Efficient, LED Lights, Anti-theft', N'VinFast Evo200 Lite - Lightweight and efficient electric scooter perfect for daily commuting.', CAST(N'2025-10-14 15:49:32.007' AS DateTime), CAST(N'2025-10-14 15:49:32.007' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5be43aa7/images/PDP-XMD/evo200-lite/img-evo-black.png', CAST(5.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(10, 2)), 75)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'EVOGRAND', N'VinFast', N'Evo Grand', N'Scooter', 2024, 2, N'Premium Design, Large Storage, Advanced Display, Keyless Start', N'VinFast Evo Grand - Premium electric scooter with grand design and superior performance.', CAST(N'2025-10-14 15:49:32.007' AS DateTime), CAST(N'2025-10-14 15:49:32.007' AS DateTime), N'https://cmu-cdn.vinfast.vn/2025/07/d01a1048-evogrand2.jpg', CAST(7.00 AS Decimal(10, 2)), CAST(40.00 AS Decimal(10, 2)), 110)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'EVOGRANDLITE', N'VinFast', N'Evo Grand Lite', N'Scooter', 2024, 2, N'Balanced Performance, Good Storage, Digital Display, Eco Mode', N'VinFast Evo Grand Lite - Balanced electric scooter offering good performance with efficient design.', CAST(N'2025-10-14 15:49:32.007' AS DateTime), CAST(N'2025-10-14 15:49:32.007' AS DateTime), N'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-4.png', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), 95)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'EVONEO', N'VinFast', N'Evo Neo', N'Scooter', 2024, 2, N'Neo Design, Smart Features, Energy Efficient, LED Lighting', N'VinFast Evo Neo - Modern neo-style electric scooter with smart features and efficient performance.', CAST(N'2025-10-14 15:49:32.007' AS DateTime), CAST(N'2025-10-14 15:49:32.007' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0e183635/images/PDP-XMD/evoliteneo/img-top-evoliteneo-red-sp.webp', CAST(5.00 AS Decimal(10, 2)), CAST(28.00 AS Decimal(10, 2)), 78)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'FELIZLITE', N'VinFast', N'Feliz Lite', N'Scooter', 2024, 2, N'Budget Friendly, Simple Design, Basic Features, Reliable', N'VinFast Feliz Lite - Affordable and reliable electric scooter for budget-conscious riders.', CAST(N'2025-10-14 15:49:32.010' AS DateTime), CAST(N'2025-10-14 15:49:32.010' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp', CAST(3.00 AS Decimal(10, 2)), CAST(20.00 AS Decimal(10, 2)), 55)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'FELIZS', N'VinFast', N'Feliz S', N'Scooter', 2024, 2, N'Compact Design, Easy Riding, LED Headlights, Phone Holder', N'VinFast Feliz S - Compact and stylish electric scooter for convenient city transportation.', CAST(N'2025-10-14 15:49:32.010' AS DateTime), CAST(N'2025-10-14 15:49:32.010' AS DateTime), N'https://xedientruonghien.com/thumbs/575x575x2/upload/product/baq-8655.png', CAST(4.00 AS Decimal(10, 2)), CAST(25.00 AS Decimal(10, 2)), 65)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'VF3', N'VinFast', N'VF3', N'Hatchback', 2024, 5, N'Smart Connectivity, Air Conditioning, USB Charging, LED Lights', N'VinFast VF3 - Compact city car perfect for urban mobility with modern features and efficient electric drivetrain.', CAST(N'2025-10-14 15:49:32.007' AS DateTime), CAST(N'2025-10-14 15:49:32.007' AS DateTime), N'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), 210)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'VF5', N'VinFast', N'VF5', N'SUV', 2024, 5, N'Premium Sound, Panoramic Roof, Fast Charging, Smart Features', N'VinFast VF5 - Compact SUV with modern design and advanced technology for comfortable family trips.', CAST(N'2025-10-14 15:49:32.007' AS DateTime), CAST(N'2025-10-14 15:49:32.007' AS DateTime), N'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png', CAST(12.00 AS Decimal(10, 2)), CAST(95.00 AS Decimal(10, 2)), 285)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'VF6', N'VinFast', N'VF6', N'SUV', 2024, 5, N'Leather Interior, Wireless Charging, 360° Camera, Premium Audio', N'VinFast VF6 - Mid-size SUV offering perfect balance of comfort, performance and technology.', CAST(N'2025-10-14 15:49:32.007' AS DateTime), CAST(N'2025-10-14 15:49:32.007' AS DateTime), N'https://vinfast3sthanhhoa.com/wp-content/uploads/2023/09/vf6-mau-trang-1-1110x1032-600x600-1.jpg', CAST(15.00 AS Decimal(10, 2)), CAST(120.00 AS Decimal(10, 2)), 365)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'VF7', N'VinFast', N'VF7', N'SUV', 2024, 7, N'Premium Seats, Autopilot, Panoramic Sunroof, Bang & Olufsen Audio', N'VinFast VF7 - Premium 7-seater SUV with advanced features and spacious interior for large families.', CAST(N'2025-10-14 15:49:32.007' AS DateTime), CAST(N'2025-10-14 15:49:32.007' AS DateTime), N'https://vinfastdongthap.vn/wp-content/uploads/2023/09/mau-xe-vinfast-vf7-6.png', CAST(18.00 AS Decimal(10, 2)), CAST(145.00 AS Decimal(10, 2)), 390)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'VF8', N'VinFast', N'VF8', N'SUV', 2024, 5, N'Luxury Interior, Advanced Autopilot, Premium Sound System, Air Suspension', N'VinFast VF8 - Flagship SUV with luxury features, advanced technology and exceptional performance.', CAST(N'2025-10-14 15:49:32.007' AS DateTime), CAST(N'2025-10-14 15:49:32.007' AS DateTime), N'https://vinfastvietnam.net.vn/uploads/data/3097/files/files/VINFAST%20VFE35/5F1DF5B0-B8ED-45F8-993B-755D9D014FBC.jpeg', CAST(22.00 AS Decimal(10, 2)), CAST(175.00 AS Decimal(10, 2)), 425)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'VF9', N'VinFast', N'VF9', N'SUV', 2024, 7, N'Ultra Luxury, Full Autopilot, Premium Entertainment, Massage Seats', N'VinFast VF9 - Ultimate luxury SUV with cutting-edge technology and unmatched comfort for premium experiences.', CAST(N'2025-10-14 15:49:32.007' AS DateTime), CAST(N'2025-10-14 15:49:32.007' AS DateTime), N'https://vnvinfast.com/data/upload/media/img-ce1h-1699328361.webp', CAST(28.00 AS Decimal(10, 2)), CAST(220.00 AS Decimal(10, 2)), 485)
GO
GO

SET IDENTITY_INSERT [dbo].[users] ON;
GO

INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (1, N'admin@ev.local', N'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7', 1, N'System Admin', N'0900000001', N'', N'', N'', N'Administrator', 1, CAST(N'2025-10-06 15:27:22.100' AS DateTime), CAST(N'2025-10-06 15:27:22.100' AS DateTime), N'', CAST(N'' AS Date), , CAST( AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (2, N'staff@ev.local', N'dfd48f36338aa36228ebb9e204bba6b4e18db0b623e25c458901edc831fb18e9', 2, N'Default Staff', N'0900000002', N'', N'', N'', N'Staff', 1, CAST(N'2025-10-06 15:27:22.100' AS DateTime), CAST(N'2025-10-06 15:27:22.100' AS DateTime), N'', CAST(N'' AS Date), 1, CAST( AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (43, N'testuser@example.com', N'ffc121a2210958bf74e5a874668f3d978d24b6a8241496ccff3c0ea245e4f126', 3, N'Test User', N'0987654321', N'', N'', N'456 Updated Street', N'', 1, CAST(N'2025-10-14 10:04:23.727' AS DateTime), CAST(N'2025-10-14 12:39:23.467' AS DateTime), N'Female', CAST(N'1990-01-01' AS Date), , CAST( AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (46, N'tulu2004098@gmail.com', N'8206433324528e13a8de39efd6576091c1501043bbc8625b85813cb508cf7796', 3, N'Nh?t Tú', N'0399106850', N'012345678912', N'123AA21', N'tèdcasxa', N'', 1, CAST(N'2025-10-14 12:54:12.937' AS DateTime), CAST(N'2025-10-21 06:30:31.717' AS DateTime), N'male', CAST(N'2025-10-22' AS Date), , CAST(1100000.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (47, N'tulpn2004@gmail.com', N'8206433324528e13a8de39efd6576091c1501043bbc8625b85813cb508cf7796', 3, N'L? Tú', N'0399106859', N'012345678912', N'123AA21', N'tèdcasxa', N'', 1, CAST(N'2025-10-21 06:27:47.983' AS DateTime), CAST(N'2025-10-21 06:28:50.497' AS DateTime), N'male', CAST(N'2025-10-22' AS Date), , CAST(16644040.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (48, N'staff.district7@ev.local', N'dfd48f36338aa36228ebb9e204bba6b4e18db0b623e25c458901edc831fb18e9', 2, N'Nguyá»…n VÄƒn A', N'0900000003', N'', N'', N'', N'Staff', 1, CAST(N'2025-10-21 13:45:38.100' AS DateTime), CAST(N'2025-10-21 13:45:38.100' AS DateTime), N'', CAST(N'' AS Date), 2, CAST( AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (49, N'staff.airport@ev.local', N'dfd48f36338aa36228ebb9e204bba6b4e18db0b623e25c458901edc831fb18e9', 2, N'Tráº§n Thá»‹ B', N'0900000004', N'', N'', N'', N'Staff', 1, CAST(N'2025-10-21 13:45:38.103' AS DateTime), CAST(N'2025-10-21 13:45:38.103' AS DateTime), N'', CAST(N'' AS Date), 3, CAST( AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (50, N'staff.district3@ev.local', N'dfd48f36338aa36228ebb9e204bba6b4e18db0b623e25c458901edc831fb18e9', 2, N'LĂª VÄƒn C', N'0900000005', N'', N'', N'', N'Staff', 1, CAST(N'2025-10-21 13:45:38.103' AS DateTime), CAST(N'2025-10-21 13:45:38.103' AS DateTime), N'', CAST(N'' AS Date), 4, CAST( AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (51, N'staff.district5@ev.local', N'dfd48f36338aa36228ebb9e204bba6b4e18db0b623e25c458901edc831fb18e9', 2, N'Pháº¡m Thá»‹ D', N'0900000006', N'', N'', N'', N'Staff', 1, CAST(N'2025-10-21 13:45:38.103' AS DateTime), CAST(N'2025-10-21 13:45:38.103' AS DateTime), N'', CAST(N'' AS Date), 5, CAST( AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (52, N'staff.binhthanh@ev.local', N'dfd48f36338aa36228ebb9e204bba6b4e18db0b623e25c458901edc831fb18e9', 2, N'HoĂ ng VÄƒn E', N'0900000007', N'', N'', N'', N'Staff', 1, CAST(N'2025-10-21 13:45:38.103' AS DateTime), CAST(N'2025-10-21 13:45:38.103' AS DateTime), N'', CAST(N'' AS Date), 6, CAST( AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (53, N'staff.thuduc@ev.local', N'dfd48f36338aa36228ebb9e204bba6b4e18db0b623e25c458901edc831fb18e9', 2, N'VÅ© Thá»‹ F', N'0900000008', N'', N'', N'', N'Staff', 1, CAST(N'2025-10-21 13:45:38.107' AS DateTime), CAST(N'2025-10-21 13:45:38.107' AS DateTime), N'', CAST(N'' AS Date), 7, CAST(182000.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (54, N'staff.phunhuan@ev.local', N'dfd48f36338aa36228ebb9e204bba6b4e18db0b623e25c458901edc831fb18e9', 2, N'Äáº·ng VÄƒn G', N'0900000009', N'', N'', N'', N'Staff', 1, CAST(N'2025-10-21 13:45:38.107' AS DateTime), CAST(N'2025-10-21 13:45:38.107' AS DateTime), N'', CAST(N'' AS Date), 8, CAST(182000.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (62, N'tunhat2004@gmail.com', N'8206433324528e13a8de39efd6576091c1501043bbc8625b85813cb508cf7796', 3, N'Nhật Tú', N'0399106861', N'012345678912', N'123AA21', N'466 Nguyễn Thị Minh Khai Phường 02, Quận 3, Tp Hồ Chí Minh', N'', 1, CAST(N'2025-10-30 19:48:18.903' AS DateTime), CAST(N'2025-10-30 19:49:21.133' AS DateTime), N'male', CAST(N'2007-10-20' AS Date), , CAST(870000.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (65, N'tulu17976@gmail.com', N'8206433324528e13a8de39efd6576091c1501043bbc8625b85813cb508cf7796', 3, N'Tú', N'0399106831', N'012345678912', N'123AA21', N'466 Nguyễn Thị Minh Khai Phường 02, Quận 3, Tp Hồ Chí Minh', N'', 1, CAST(N'2025-10-30 23:37:27.313' AS DateTime), CAST(N'2025-10-30 23:38:13.417' AS DateTime), N'male', CAST(N'2007-10-20' AS Date), , CAST(220000.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (67, N'luphuocnhattu@gmail.com', N'8206433324528e13a8de39efd6576091c1501043bbc8625b85813cb508cf7796', 3, N'Tú Lữ', N'0399106821', N'012345678912', N'123AA21', N'466 Nguyễn Thị Minh Khai Phường 02, Quận 3, Tp Hồ Chí Minh', N'', 1, CAST(N'2025-10-31 06:26:43.857' AS DateTime), CAST(N'2025-10-31 06:27:32.623' AS DateTime), N'male', CAST(N'2007-10-20' AS Date), , CAST(1000000.00 AS Decimal(10, 2)))
GO

SET IDENTITY_INSERT [dbo].[users] OFF;
GO

SET IDENTITY_INSERT [dbo].[vehicles] ON;
GO

INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (1, 1, N'VF3', N'VN1VF3001A0001001', 4, 210, N'available', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 145, 78, 5200, CAST(N'1900-01-01' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.340' AS DateTime), CAST(N'2025-10-26 17:10:54.180' AS DateTime), N'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png', N'50A-001', N'110 kWh/100km', N'District 1 Station', N'Black', 2024, CAST(49.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (2, 3, N'VF3', N'VN1VF3001A0001002', 92, 210, N'rented', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), CAST(4.5 AS Decimal(2, 1)), 98, 56, 3400, CAST(N'2024-01-18' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.340' AS DateTime), CAST(N'2025-10-14 15:49:47.340' AS DateTime), N'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf3-do.png', N'50A-002', N'110 kWh/100km', N'Airport Station', N'Blue', 2023, CAST(49.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (3, 5, N'VF3', N'VN1VF3001A0001003', 98, 210, N'available', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 134, 89, 6800, CAST(N'2024-01-16' AS Date), CAST(N'2024-12-31' AS Date), N'good', CAST(N'2025-10-14 15:49:47.340' AS DateTime), CAST(N'2025-10-26 19:41:51.403' AS DateTime), N'https://vinfast-tphochiminh.com/OTO3602300549/files/mau_xe/VF3/vang.webp', N'50A-003', N'110 kWh/100km', N'District 5 Station', N'Red', 2024, CAST(49.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (4, 7, N'VF3', N'VN1VF3001A0001004', 80, 210, N'available', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), CAST(4.4 AS Decimal(2, 1)), 76, 45, 8900, CAST(N'1900-01-01' AS Date), CAST(N'2024-12-31' AS Date), N'good', CAST(N'2025-10-14 15:49:47.340' AS DateTime), CAST(N'2025-10-25 16:49:39.460' AS DateTime), N'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xanh-Noc-trang-min.png', N'50A-004', N'110 kWh/100km', N'Thu Duc Station', N'White', 2023, CAST(49.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (5, 2, N'VF5', N'VN1VF5001A0002001', 90, 285, N'available', CAST(12.00 AS Decimal(10, 2)), CAST(95.00 AS Decimal(10, 2)), CAST(4.8 AS Decimal(2, 1)), 189, 123, 4200, CAST(N'2024-01-19' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.343' AS DateTime), CAST(N'2025-10-26 17:10:54.180' AS DateTime), N'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png', N'51B-001', N'125 kWh/100km', N'District 7 Station', N'Black', 2024, CAST(65.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (6, 4, N'VF5', N'VN1VF5001A0002002', 41, 285, N'available', CAST(12.00 AS Decimal(10, 2)), CAST(95.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 167, 98, 6100, CAST(N'1900-01-01' AS Date), CAST(N'2024-12-31' AS Date), N'poor', CAST(N'2025-10-14 15:49:47.343' AS DateTime), CAST(N'2025-10-22 14:01:11.570' AS DateTime), N'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf5-trang.png', N'51B-002', N'125 kWh/100km', N'District 3 Station', N'Blue', 2023, CAST(65.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (7, 6, N'VF5', N'VN1VF5001A0002003', 93, 285, N'available', CAST(12.00 AS Decimal(10, 2)), CAST(95.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 142, 87, 5400, CAST(N'2024-01-18' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.343' AS DateTime), CAST(N'2025-10-14 15:49:47.343' AS DateTime), N'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey-white.png', N'51B-003', N'125 kWh/100km', N'Binh Thanh Station', N'Red', 2024, CAST(65.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (8, 8, N'VF5', N'VN1VF5001A0002004', 81, 285, N'available', CAST(12.00 AS Decimal(10, 2)), CAST(95.00 AS Decimal(10, 2)), CAST(4.5 AS Decimal(2, 1)), 98, 67, 7800, CAST(N'2024-01-15' AS Date), CAST(N'2024-12-31' AS Date), N'good', CAST(N'2025-10-14 15:49:47.343' AS DateTime), CAST(N'2025-10-31 07:21:17.460' AS DateTime), N'https://vinfastdienchau.com/wp-content/uploads/2014/08/vinfast-vf5-orange.png', N'51B-004', N'125 kWh/100km', N'Phu Nhuan Station', N'White', 2023, CAST(65.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (9, 1, N'VF6', N'VN1VF6001A0003001', 89, 365, N'rented', CAST(15.00 AS Decimal(10, 2)), CAST(120.00 AS Decimal(10, 2)), CAST(4.8 AS Decimal(2, 1)), 234, 156, 3800, CAST(N'2024-01-21' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.343' AS DateTime), CAST(N'2025-10-14 15:49:47.343' AS DateTime), N'https://vinfast3sthanhhoa.com/wp-content/uploads/2023/09/vf6-mau-trang-1-1110x1032-600x600-1.jpg', N'51C-001', N'140 kWh/100km', N'District 1 Station', N'Black', 2024, CAST(75.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (10, 3, N'VF6', N'VN1VF6001A0003002', 94, 365, N'available', CAST(15.00 AS Decimal(10, 2)), CAST(120.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 178, 112, 4900, CAST(N'2024-01-19' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.343' AS DateTime), CAST(N'2025-10-14 15:49:47.343' AS DateTime), N'https://vfxanh.vn/wp-content/uploads/2024/08/9.png', N'51C-002', N'140 kWh/100km', N'Airport Station', N'Blue', 2023, CAST(75.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (11, 5, N'VF6', N'VN1VF6001A0003003', 87, 365, N'available', CAST(15.00 AS Decimal(10, 2)), CAST(120.00 AS Decimal(10, 2)), CAST(4.9 AS Decimal(2, 1)), 201, 134, 5600, CAST(N'2024-01-20' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.343' AS DateTime), CAST(N'2025-10-14 15:49:47.343' AS DateTime), N'https://vinfastthanhhoa.net/wp-content/uploads/2024/03/vinfast-vf6-2.jpg', N'51C-003', N'140 kWh/100km', N'District 5 Station', N'Red', 2024, CAST(75.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (12, 7, N'VF6', N'VN1VF6001A0003004', 82, 365, N'available', CAST(15.00 AS Decimal(10, 2)), CAST(120.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 145, 89, 7200, CAST(N'2024-01-16' AS Date), CAST(N'2024-12-31' AS Date), N'good', CAST(N'2025-10-14 15:49:47.343' AS DateTime), CAST(N'2025-10-14 15:49:47.343' AS DateTime), N'https://vinfast3sthanhhoa.com/wp-content/uploads/2023/09/vf6-mau-xam-1-1110x1032-600x600-1.jpg', N'51C-004', N'140 kWh/100km', N'Thu Duc Station', N'White', 2023, CAST(75.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (13, 2, N'VF7', N'VN1VF7001A0004001', 91, 390, N'available', CAST(18.00 AS Decimal(10, 2)), CAST(145.00 AS Decimal(10, 2)), CAST(4.8 AS Decimal(2, 1)), 267, 178, 4100, CAST(N'2024-01-22' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://vinfastdongthap.vn/wp-content/uploads/2023/09/mau-xe-vinfast-vf7-6.png', N'51D-001', N'155 kWh/100km', N'District 7 Station', N'Black', 2024, CAST(85.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (14, 4, N'VF7', N'VN1VF7001A0004002', 88, 390, N'available', CAST(18.00 AS Decimal(10, 2)), CAST(145.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 198, 134, 5300, CAST(N'2024-01-19' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf7-do.png', N'51D-002', N'155 kWh/100km', N'District 3 Station', N'Blue', 2023, CAST(85.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (15, 6, N'VF7', N'VN1VF7001A0004003', 85, 390, N'available', CAST(18.00 AS Decimal(10, 2)), CAST(145.00 AS Decimal(10, 2)), CAST(4.9 AS Decimal(2, 1)), 223, 167, 4700, CAST(N'2024-01-21' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://vinfastvietnam.com.vn/wp-content/uploads/2022/11/Xam-Xi-Mang-min.png', N'51D-003', N'155 kWh/100km', N'Binh Thanh Station', N'Red', 2024, CAST(85.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (16, 8, N'VF7', N'VN1VF7001A0004004', 79, 390, N'available', CAST(18.00 AS Decimal(10, 2)), CAST(145.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 156, 98, 6900, CAST(N'2024-01-17' AS Date), CAST(N'2024-12-31' AS Date), N'good', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-31 07:35:57.923' AS DateTime), N'https://vinfast-chevrolet.net/upload/sanpham/tai-xuong-0293.png', N'51D-004', N'155 kWh/100km', N'Phu Nhuan Station', N'White', 2023, CAST(85.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (17, 1, N'VF8', N'VN1VF8001A0005001', 93, 425, N'rented', CAST(22.00 AS Decimal(10, 2)), CAST(175.00 AS Decimal(10, 2)), CAST(4.9 AS Decimal(2, 1)), 312, 234, 3200, CAST(N'2024-01-23' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://vinfastvietnam.net.vn/uploads/data/3097/files/files/VINFAST%20VFE35/5F1DF5B0-B8ED-45F8-993B-755D9D014FBC.jpeg', N'51E-001', N'165 kWh/100km', N'District 1 Station', N'Black', 2024, CAST(95.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (18, 3, N'VF8', N'VN1VF8001A0005002', 96, 425, N'available', CAST(22.00 AS Decimal(10, 2)), CAST(175.00 AS Decimal(10, 2)), CAST(4.8 AS Decimal(2, 1)), 278, 189, 4100, CAST(N'2024-01-20' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://vinfast-auto-vn.net/wp-content/uploads/2022/08/VinFast-VF-8-mau-Xanh-Luc.png', N'51E-002', N'165 kWh/100km', N'Airport Station', N'Blue', 2023, CAST(95.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (19, 5, N'VF8', N'VN1VF8001A0005003', 90, 425, N'available', CAST(22.00 AS Decimal(10, 2)), CAST(175.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 245, 167, 4800, CAST(N'2024-01-22' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://vinfastphantrongtue.com/wp-content/uploads/2023/09/11.png', N'51E-003', N'165 kWh/100km', N'District 5 Station', N'Red', 2024, CAST(95.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (20, 7, N'VF8', N'VN1VF8001A0005004', 84, 425, N'available', CAST(22.00 AS Decimal(10, 2)), CAST(175.00 AS Decimal(10, 2)), CAST(4.8 AS Decimal(2, 1)), 201, 134, 5700, CAST(N'2024-01-18' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://vinfastvietnam.com.vn/wp-content/uploads/2022/08/Bac-PLUS-min.png', N'51E-004', N'165 kWh/100km', N'Thu Duc Station', N'White', 2023, CAST(95.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (21, 2, N'VF9', N'VN1VF9001A0006001', 89, 485, N'available', CAST(28.00 AS Decimal(10, 2)), CAST(220.00 AS Decimal(10, 2)), CAST(4.9 AS Decimal(2, 1)), 198, 145, 2800, CAST(N'2024-01-24' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://vnvinfast.com/data/upload/media/img-ce1h-1699328361.webp', N'51F-001', N'180 kWh/100km', N'District 7 Station', N'Black', 2024, CAST(105.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (22, 4, N'VF9', N'VN1VF9001A0006002', 92, 485, N'available', CAST(28.00 AS Decimal(10, 2)), CAST(220.00 AS Decimal(10, 2)), CAST(4.8 AS Decimal(2, 1)), 167, 112, 3500, CAST(N'2024-01-21' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://vinfastductronglamdong.vn/images/thumbs/2025/03/vinfast-vf-9.png', N'51F-002', N'180 kWh/100km', N'District 3 Station', N'Blue', 2023, CAST(105.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (23, 6, N'VF9', N'VN1VF9001A0006003', 95, 485, N'available', CAST(28.00 AS Decimal(10, 2)), CAST(220.00 AS Decimal(10, 2)), CAST(4.9 AS Decimal(2, 1)), 234, 178, 3100, CAST(N'2024-01-23' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf9-xam.png', N'51F-003', N'180 kWh/100km', N'Binh Thanh Station', N'Red', 2024, CAST(105.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (24, 8, N'VF9', N'VN1VF9001A0006004', 87, 485, N'available', CAST(28.00 AS Decimal(10, 2)), CAST(220.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 145, 89, 4200, CAST(N'2024-01-19' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-31 07:28:16.477' AS DateTime), N'https://vinfasthadong.com.vn/wp-content/uploads/2023/10/vinfast-vf9-blue.jpg', N'51F-004', N'180 kWh/100km', N'Phu Nhuan Station', N'White', 2023, CAST(105.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (25, 5, N'EVO200', N'VN2EVO200A0007005', 90, 90, N'available', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 201, 312, 3800, CAST(N'2024-01-19' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-31 07:12:25.250' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png', N'59A-001', N'35 kWh/100km', N'District 5 Station', N'Black', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (26, 6, N'EVO200', N'VN2EVO200A0007006', 86, 90, N'available', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 178, 289, 4300, CAST(N'2024-01-18' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://xedienvietthanh.com/wp-content/uploads/2022/11/xe-may-dien-vinfast-evo-200-trang.jpg', N'59A-002', N'35 kWh/100km', N'Binh Thanh Station', N'Blue', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (27, 7, N'EVO200', N'VN2EVO200A0007007', 91, 90, N'available', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), CAST(4.8 AS Decimal(2, 1)), 223, 356, 3400, CAST(N'2024-01-21' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw548c6028/images/PDP-XMD/evo200/img-evo-blue.png', N'59A-003', N'35 kWh/100km', N'Thu Duc Station', N'Red', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (28, 8, N'EVO200', N'VN2EVO200A0007008', 84, 90, N'available', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), CAST(4.5 AS Decimal(2, 1)), 145, 223, 4800, CAST(N'2024-01-17' AS Date), CAST(N'2024-12-31' AS Date), N'good', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0b27b768/images/PDP-XMD/evo200/img-evo-red.png', N'59A-004', N'35 kWh/100km', N'Phu Nhuan Station', N'White', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (29, 1, N'EVO200LITE', N'VN2EVO200LA0008001', 89, 75, N'available', CAST(5.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 198, 289, 3600, CAST(N'2024-01-19' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5be43aa7/images/PDP-XMD/evo200-lite/img-evo-black.png', N'59B-001', N'30 kWh/100km', N'District 1 Station', N'Black', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (30, 2, N'EVO200LITE', N'VN2EVO200LA0008002', 93, 75, N'rented', CAST(5.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 245, 367, 2900, CAST(N'2024-01-21' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-31 04:42:55.927' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw469d980d/images/PDP-XMD/evo200-lite/img-evo-yellow.png', N'59B-002', N'30 kWh/100km', N'District 7 Station', N'Blue', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (31, 3, N'EVO200LITE', N'VN2EVO200LA0008003', 86, 75, N'pending', CAST(5.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(10, 2)), CAST(4.5 AS Decimal(2, 1)), 167, 234, 4200, CAST(N'2024-01-17' AS Date), CAST(N'2024-12-31' AS Date), N'good', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-31 08:10:30.110' AS DateTime), N'https://vinfastbinhthanh.com/wp-content/uploads/2024/01/vinfast_eveo200_lite_mau_trang.webp', N'59B-003', N'30 kWh/100km', N'Airport Station', N'Red', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (32, 4, N'EVO200LITE', N'VN2EVO200LA0008004', 91, 75, N'available', CAST(5.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(10, 2)), CAST(4.8 AS Decimal(2, 1)), 289, 412, 3100, CAST(N'2024-01-22' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-14 15:49:47.347' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwba20f6df/images/PDP-XMD/evo200-lite/img-evo-red.png', N'59B-004', N'30 kWh/100km', N'District 3 Station', N'White', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (33, 5, N'EVOGRAND', N'VN2EVOGRA0010005', 93, 110, N'pending', CAST(7.00 AS Decimal(10, 2)), CAST(40.00 AS Decimal(10, 2)), CAST(4.9 AS Decimal(2, 1)), 312, 456, 2700, CAST(N'2024-01-23' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-28 14:21:42.207' AS DateTime), N'https://cmu-cdn.vinfast.vn/2025/07/d01a1048-evogrand2.jpg', N'59C-001', N'38 kWh/100km', N'District 5 Station', N'Black', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (34, 6, N'EVOGRAND', N'VN2EVOGRA0010006', 86, 110, N'rented', CAST(7.00 AS Decimal(10, 2)), CAST(40.00 AS Decimal(10, 2)), CAST(4.5 AS Decimal(2, 1)), 167, 234, 3900, CAST(N'2024-01-17' AS Date), CAST(N'2024-12-31' AS Date), N'good', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-31 04:52:44.997' AS DateTime), N'https://vinfastecoxe.vn/wp-content/uploads/2025/07/anh-khach-1207.png', N'59C-002', N'38 kWh/100km', N'Binh Thanh Station', N'Blue', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (35, 7, N'EVOGRAND', N'VN2EVOGRA0010007', 91, 110, N'rented', CAST(7.00 AS Decimal(10, 2)), CAST(40.00 AS Decimal(10, 2)), CAST(4.8 AS Decimal(2, 1)), 278, 389, 3100, CAST(N'2024-01-19' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-31 06:06:51.943' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw059cd4e7/landingpage/lp-xmd/evo-grand/color/3.webp', N'59C-003', N'38 kWh/100km', N'Thu Duc Station', N'Red', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (36, 8, N'EVOGRAND', N'VN2EVOGRA0010008', 87, 110, N'available', CAST(7.00 AS Decimal(10, 2)), CAST(40.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 201, 298, 3600, CAST(N'2024-01-18' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.347' AS DateTime), CAST(N'2025-10-31 13:50:25.920' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw9a93ae28/landingpage/lp-xmd/evo-grand/color/2.webp', N'59C-004', N'38 kWh/100km', N'Phu Nhuan Station', N'White', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (37, 1, N'EVOGRANDLITE', N'VN2EVOGRL0011001', 89, 95, N'available', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 189, 278, 3500, CAST(N'2024-01-19' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-28 14:12:42.770' AS DateTime), N'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-4.png', N'59D-001', N'36 kWh/100km', N'District 1 Station', N'Black', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (38, 2, N'EVOGRANDLITE', N'VN2EVOGRL0011002', 91, 95, N'available', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 234, 345, 3100, CAST(N'2024-01-21' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-14 15:49:47.350' AS DateTime), N'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-3-1.png', N'59D-002', N'36 kWh/100km', N'District 7 Station', N'Blue', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (39, 3, N'EVOGRANDLITE', N'VN2EVOGRL0011003', 84, 95, N'available', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), CAST(4.5 AS Decimal(2, 1)), 156, 223, 4200, CAST(N'2024-01-16' AS Date), CAST(N'2024-12-31' AS Date), N'good', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-28 14:06:57.897' AS DateTime), N'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-2.png', N'59D-003', N'36 kWh/100km', N'Airport Station', N'Red', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (40, 4, N'EVOGRANDLITE', N'VN2EVOGRL0011004', 92, 95, N'available', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), CAST(4.8 AS Decimal(2, 1)), 267, 389, 2900, CAST(N'2024-01-22' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-31 06:48:38.880' AS DateTime), N'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite.png', N'59D-004', N'36 kWh/100km', N'District 3 Station', N'White', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (41, 5, N'EVONEO', N'VN2EVONEO0012005', 89, 78, N'available', CAST(5.00 AS Decimal(10, 2)), CAST(28.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 178, 234, 3400, CAST(N'2024-01-19' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-14 15:49:47.350' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0e183635/images/PDP-XMD/evoliteneo/img-top-evoliteneo-red-sp.webp', N'59E-001', N'32 kWh/100km', N'District 5 Station', N'Black', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (42, 6, N'EVONEO', N'VN2EVONEO0012006', 92, 78, N'available', CAST(5.00 AS Decimal(10, 2)), CAST(28.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 201, 289, 3100, CAST(N'2024-01-21' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-14 15:49:47.350' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0537c8ee/images/PDP-XMD/evoneo/img-top-evoneo-white-sp.webp', N'59E-002', N'32 kWh/100km', N'Binh Thanh Station', N'Blue', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (43, 7, N'EVONEO', N'VN2EVONEO0012007', 86, 78, N'available', CAST(5.00 AS Decimal(10, 2)), CAST(28.00 AS Decimal(10, 2)), CAST(4.4 AS Decimal(2, 1)), 134, 198, 4300, CAST(N'2024-01-16' AS Date), CAST(N'2024-12-31' AS Date), N'good', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-14 15:49:47.350' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw46480ad9/images/PDP-XMD/evoneo/img-top-evoneo-green-sp.webp', N'59E-003', N'32 kWh/100km', N'Thu Duc Station', N'Red', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (44, 8, N'EVONEO', N'VN2EVONEO0012008', 88, 78, N'available', CAST(5.00 AS Decimal(10, 2)), CAST(28.00 AS Decimal(10, 2)), CAST(4.9 AS Decimal(2, 1)), 289, 423, 2600, CAST(N'2024-01-23' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-14 15:49:47.350' AS DateTime), N'https://xedienthanhtung.com/wp-content/uploads/2025/06/xe-may-dien-vinfast-evo-lite-neo-den.webp', N'59E-004', N'32 kWh/100km', N'Phu Nhuan Station', N'White', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (45, 1, N'FELIZS', N'VN2FELIZSA0013001', 88, 65, N'available', CAST(4.00 AS Decimal(10, 2)), CAST(25.00 AS Decimal(10, 2)), CAST(4.5 AS Decimal(2, 1)), 167, 245, 3900, CAST(N'2024-01-18' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-14 15:49:47.350' AS DateTime), N'https://xedientruonghien.com/thumbs/575x575x2/upload/product/baq-8655.png', N'59F-001', N'28 kWh/100km', N'District 1 Station', N'Black', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (46, 2, N'FELIZS', N'VN2FELIZSA0013002', 92, 65, N'available', CAST(4.00 AS Decimal(10, 2)), CAST(25.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 198, 289, 3400, CAST(N'2024-01-19' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-14 15:49:47.350' AS DateTime), N'https://xedientruonghien.com/thumbs/575x575x2/upload/product/vinfast-feliz-s-zo5p3knt-9737.png', N'59F-002', N'28 kWh/100km', N'District 7 Station', N'Blue', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (47, 3, N'FELIZS', N'VN2FELIZSA0013003', 85, 65, N'available', CAST(4.00 AS Decimal(10, 2)), CAST(25.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 223, 334, 4200, CAST(N'2024-01-16' AS Date), CAST(N'2024-12-31' AS Date), N'good', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-14 15:49:47.350' AS DateTime), N'https://vinfast.net.vn/datafiles/42776/upload/images/san%20pham/fiz/fiz-7_result.jpg', N'59F-003', N'28 kWh/100km', N'Airport Station', N'Red', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (48, 4, N'FELIZLITE', N'VN2FELIZL0014004', 92, 55, N'available', CAST(3.00 AS Decimal(10, 2)), CAST(20.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 201, 298, 3200, CAST(N'2024-01-21' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-14 15:49:47.350' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp', N'59G-001', N'25 kWh/100km', N'District 3 Station', N'White', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (49, 5, N'FELIZLITE', N'VN2FELIZL0014005', 86, 55, N'available', CAST(3.00 AS Decimal(10, 2)), CAST(20.00 AS Decimal(10, 2)), CAST(4.2 AS Decimal(2, 1)), 123, 189, 4400, CAST(N'2024-01-15' AS Date), CAST(N'2024-12-31' AS Date), N'good', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-14 15:49:47.350' AS DateTime), N'https://vinfastecoxe.vn/wp-content/uploads/2025/09/Feliz-2-pin-anh-web-3.png', N'59G-002', N'25 kWh/100km', N'District 5 Station', N'Black', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (50, 6, N'FELIZLITE', N'VN2FELIZL0014006', 91, 55, N'available', CAST(3.00 AS Decimal(10, 2)), CAST(20.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 245, 367, 2900, CAST(N'2024-01-22' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-14 15:49:47.350' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5f142101/images/PDP-XMD/felizlite/img-top-feliz-lite-black.webp', N'59G-003', N'25 kWh/100km', N'Binh Thanh Station', N'Blue', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (51, 7, N'FELIZLITE', N'VN2FELIZL0014007', 83, 55, N'rented', CAST(3.00 AS Decimal(10, 2)), CAST(20.00 AS Decimal(10, 2)), CAST(4.1 AS Decimal(2, 1)), 98, 145, 4800, CAST(N'2024-01-14' AS Date), CAST(N'2024-12-31' AS Date), N'fair', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-31 08:22:15.097' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwf7bf9ced/images/PDP-XMD/felizlite/img-top-feliz-lite-light-green.webp', N'59G-004', N'25 kWh/100km', N'Thu Duc Station', N'Red', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (52, 8, N'FELIZLITE', N'VN2FELIZL0014008', 89, 55, N'available', CAST(3.00 AS Decimal(10, 2)), CAST(20.00 AS Decimal(10, 2)), CAST(4.5 AS Decimal(2, 1)), 189, 278, 3400, CAST(N'2024-01-20' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14 15:49:47.350' AS DateTime), CAST(N'2025-10-14 15:49:47.350' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwcc3b80f3/images/PDP-XMD/felizlite/img-top-feliz-lite-sand.webp', N'59G-005', N'25 kWh/100km', N'Phu Nhuan Station', N'White', 2023, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (54, 4, N'VF8', N'VN1VF8001', 95, 300, N'available', CAST(150000.00 AS Decimal(10, 2)), CAST(1200000.00 AS Decimal(10, 2)), CAST(4.8 AS Decimal(2, 1)), 12, 45, 15000, CAST(N'2024-01-20' AS Date), CAST(N'2025-01-20' AS Date), N'excellent', CAST(N'2025-10-17 14:10:42.003' AS DateTime), CAST(N'2025-10-21 21:18:42.273' AS DateTime), N'https://vinfastvietnam.com.vn/storage/app/media/vinfast-vf8-2024-1.jpg', N'51A-001', N'110 kWh/100km', N'Station 4', N'Blue', 2023, CAST(95.00 AS Decimal(5, 2)), CAST(N'2025-04-17' AS Date), CAST(N'2028-04-17' AS Date), CAST(N'2026-01-17' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-17' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (55, 7, N'VF8', N'VN1VF8002', 88, 300, N'available', CAST(150000.00 AS Decimal(10, 2)), CAST(1200000.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 8, 32, 12000, CAST(N'2024-01-15' AS Date), CAST(N'2025-01-15' AS Date), N'good', CAST(N'2025-10-17 14:10:42.003' AS DateTime), CAST(N'2025-10-21 22:22:57.750' AS DateTime), N'https://vinfastvietnam.com.vn/storage/app/media/vinfast-vf8-2024-2.jpg', N'51A-002', N'110 kWh/100km', N'Thu Duc Station', N'Red', 2024, CAST(95.00 AS Decimal(5, 2)), CAST(N'2025-04-17' AS Date), CAST(N'2028-04-17' AS Date), CAST(N'2026-01-17' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-17' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (56, 7, N'VF8', N'VN1VF8003', 92, 300, N'available', CAST(150000.00 AS Decimal(10, 2)), CAST(1200000.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 15, 38, 18000, CAST(N'2024-01-25' AS Date), CAST(N'2025-01-25' AS Date), N'excellent', CAST(N'2025-10-17 14:10:42.003' AS DateTime), CAST(N'2025-10-22 01:29:59.837' AS DateTime), N'https://vinfastvietnam.com.vn/storage/app/media/vinfast-vf8-2024-3.jpg', N'51A-003', N'110 kWh/100km', N'Thu Duc Station', N'White', 2023, CAST(95.00 AS Decimal(5, 2)), CAST(N'2025-04-17' AS Date), CAST(N'2028-04-17' AS Date), CAST(N'2026-01-17' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-17' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (57, 4, N'VF9', N'VN1VF9001', 90, 400, N'available', CAST(180000.00 AS Decimal(10, 2)), CAST(1500000.00 AS Decimal(10, 2)), CAST(4.9 AS Decimal(2, 1)), 20, 55, 22000, CAST(N'2024-01-22' AS Date), CAST(N'2025-01-22' AS Date), N'excellent', CAST(N'2025-10-17 14:10:42.003' AS DateTime), CAST(N'2025-10-21 21:22:41.383' AS DateTime), N'https://vinfastvietnam.com.vn/storage/app/media/vinfast-vf9-2024-1.jpg', N'52A-001', N'120 kWh/100km', N'District 3 Station', N'Black', 2024, CAST(105.00 AS Decimal(5, 2)), CAST(N'2025-04-17' AS Date), CAST(N'2028-04-17' AS Date), CAST(N'2026-01-17' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-17' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (58, , N'VF9', N'VN1VF9002', 85, 400, N'available', CAST(180000.00 AS Decimal(10, 2)), CAST(1500000.00 AS Decimal(10, 2)), CAST(4.5 AS Decimal(2, 1)), 6, 28, 8500, CAST(N'2024-01-18' AS Date), CAST(N'2025-01-18' AS Date), N'good', CAST(N'2025-10-17 14:10:42.003' AS DateTime), CAST(N'2025-10-17 14:10:42.003' AS DateTime), N'https://vinfastvietnam.com.vn/storage/app/media/vinfast-vf9-2024-2.jpg', N'52A-002', N'120 kWh/100km', N'Unassigned', N'Blue', 2023, CAST(105.00 AS Decimal(5, 2)), CAST(N'2025-04-17' AS Date), CAST(N'2028-04-17' AS Date), CAST(N'2026-01-17' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-17' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (59, 1, N'VF5', N'VN1VF5001', 83, 250, N'available', CAST(120000.00 AS Decimal(10, 2)), CAST(900000.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 18, 42, 16000, CAST(N'1900-01-01' AS Date), CAST(N'2025-01-21' AS Date), N'poor', CAST(N'2025-10-17 14:10:42.003' AS DateTime), CAST(N'2025-10-22 01:18:44.650' AS DateTime), N'https://vinfastvietnam.com.vn/storage/app/media/vinfast-vf5-2024-1.jpg', N'53A-001', N'100 kWh/100km', N'District 1 Station', N'Red', 2024, CAST(65.00 AS Decimal(5, 2)), CAST(N'2025-04-17' AS Date), CAST(N'2028-04-17' AS Date), CAST(N'2026-01-17' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-17' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (60, 7, N'VF5', N'VN1VF5002', 82, 250, N'available', CAST(120000.00 AS Decimal(10, 2)), CAST(900000.00 AS Decimal(10, 2)), CAST(4.4 AS Decimal(2, 1)), 10, 25, 11000, CAST(N'2024-01-14' AS Date), CAST(N'2025-01-14' AS Date), N'good', CAST(N'2025-10-17 14:10:42.003' AS DateTime), CAST(N'2025-10-21 22:23:53.580' AS DateTime), N'https://vinfastvietnam.com.vn/storage/app/media/vinfast-vf5-2024-2.jpg', N'53A-002', N'100 kWh/100km', N'Thu Duc Station', N'White', 2023, CAST(65.00 AS Decimal(5, 2)), CAST(N'2025-04-17' AS Date), CAST(N'2028-04-17' AS Date), CAST(N'2026-01-17' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-17' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (61, , N'VF6', N'VN1VF6001', 94, 280, N'available', CAST(130000.00 AS Decimal(10, 2)), CAST(1000000.00 AS Decimal(10, 2)), CAST(4.8 AS Decimal(2, 1)), 14, 35, 14000, CAST(N'2024-01-24' AS Date), CAST(N'2025-01-24' AS Date), N'excellent', CAST(N'2025-10-17 14:10:42.003' AS DateTime), CAST(N'2025-10-17 14:10:42.003' AS DateTime), N'https://vinfastvietnam.com.vn/storage/app/media/vinfast-vf6-2024-1.jpg', N'54A-001', N'105 kWh/100km', N'Unassigned', N'Black', 2024, CAST(75.00 AS Decimal(5, 2)), CAST(N'2025-04-17' AS Date), CAST(N'2028-04-17' AS Date), CAST(N'2026-01-17' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-17' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (62, 7, N'VF6', N'VN1VF6002', 98, 280, N'available', CAST(130000.00 AS Decimal(10, 2)), CAST(1000000.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 9, 30, 13000, CAST(N'1900-01-01' AS Date), CAST(N'2025-01-17' AS Date), N'good', CAST(N'2025-10-17 14:10:42.003' AS DateTime), CAST(N'2025-10-21 22:28:39.423' AS DateTime), N'https://vinfastvietnam.com.vn/storage/app/media/vinfast-vf6-2024-2.jpg', N'54A-002', N'105 kWh/100km', N'Thu Duc Station', N'Blue', 2023, CAST(75.00 AS Decimal(5, 2)), CAST(N'2025-04-17' AS Date), CAST(N'2028-04-17' AS Date), CAST(N'2026-01-17' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-17' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (63, 7, N'VF7', N'VN1VF7001', 91, 320, N'available', CAST(140000.00 AS Decimal(10, 2)), CAST(1100000.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 16, 40, 17000, CAST(N'2024-01-23' AS Date), CAST(N'2025-01-23' AS Date), N'excellent', CAST(N'2025-10-17 14:10:42.003' AS DateTime), CAST(N'2025-10-21 22:23:27.310' AS DateTime), N'https://vinfastvietnam.com.vn/storage/app/media/vinfast-vf7-2024-1.jpg', N'55A-001', N'115 kWh/100km', N'Thu Duc Station', N'Red', 2024, CAST(85.00 AS Decimal(5, 2)), CAST(N'2025-04-17' AS Date), CAST(N'2028-04-17' AS Date), CAST(N'2026-01-17' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-17' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (64, , N'VF7', N'VN1VF7002', 87, 320, N'available', CAST(140000.00 AS Decimal(10, 2)), CAST(1100000.00 AS Decimal(10, 2)), CAST(4.5 AS Decimal(2, 1)), 7, 22, 9500, CAST(N'2024-01-16' AS Date), CAST(N'2025-01-16' AS Date), N'good', CAST(N'2025-10-17 14:10:42.003' AS DateTime), CAST(N'2025-10-17 14:10:42.003' AS DateTime), N'https://vinfastvietnam.com.vn/storage/app/media/vinfast-vf7-2024-2.jpg', N'55A-002', N'115 kWh/100km', N'Unassigned', N'White', 2023, CAST(85.00 AS Decimal(5, 2)), CAST(N'2025-04-17' AS Date), CAST(N'2028-04-17' AS Date), CAST(N'2026-01-17' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-17' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (81, , N'VF3', N'VN1VF320251020170828', 100, 210, N'available', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), NULL, 0, 0, 0, CAST(N'2025-08-20' AS Date), CAST(N'' AS Date), N'excellent', CAST(N'2025-10-20 17:08:28.660' AS DateTime), CAST(N'2025-10-20 17:08:28.660' AS DateTime), NULL, N'51A-TEST01', NULL, NULL, N'Black', 2024, CAST(49.00 AS Decimal(5, 2)), CAST(N'2025-04-20' AS Date), CAST(N'2028-04-20' AS Date), CAST(N'2026-01-20' AS Date), N'Vehicle restored with default maintenance data', CAST(N'2025-07-20' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (83, , N'VF3', N'TEST-VIN-123456789', 100, 210, N'available', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), CAST( AS Decimal(2, 1)), 0, 0, 0, CAST(N'2024-01-25' AS Date), CAST(N'2025-01-15' AS Date), N'excellent', CAST(N'2025-10-21 17:39:37.277' AS DateTime), CAST(N'2025-10-21 17:39:37.277' AS DateTime), N'', N'TEST-123', N'5.2', N'Warehouse', N'White', 2024, CAST(42.50 AS Decimal(5, 2)), CAST(N'2024-01-15' AS Date), CAST(N'2027-01-15' AS Date), CAST(N'2024-07-20' AS Date), N'Test vehicle created by admin', CAST(N'2024-01-20' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (84, , N'VF3', N'TEST-VIN-123456789', 100, 210, N'available', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), NULL, 0, 0, 0, CAST(N'2024-01-25' AS Date), CAST(N'2025-01-15' AS Date), N'excellent', CAST(N'2025-10-21 17:41:14.700' AS DateTime), CAST(N'2025-10-21 17:41:14.700' AS DateTime), N'', N'TEST-123', N'5.2', N'Warehouse', N'White', 2024, CAST(42.50 AS Decimal(5, 2)), CAST(N'2024-01-15' AS Date), CAST(N'2027-01-15' AS Date), CAST(N'2024-07-20' AS Date), N'Test vehicle created by admin', CAST(N'2024-01-20' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (85, , N'VF3', N'TEST-VIN-123456789', 100, 210, N'available', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), NULL, 0, 0, 0, CAST(N'2024-01-25' AS Date), CAST(N'2025-01-15' AS Date), N'excellent', CAST(N'2025-10-21 17:42:26.397' AS DateTime), CAST(N'2025-10-21 17:42:26.397' AS DateTime), N'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png', N'TEST-123', N'5.2', N'Warehouse', N'White', 2024, CAST(42.50 AS Decimal(5, 2)), CAST(N'2024-01-15' AS Date), CAST(N'2027-01-15' AS Date), CAST(N'2024-07-20' AS Date), N'Test vehicle created by admin', CAST(N'2024-01-20' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (86, , N'VF3', N'TEST-VIN-123456789', 100, 210, N'available', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), NULL, 0, 0, 0, CAST(N'2024-01-25' AS Date), CAST(N'2025-01-15' AS Date), N'excellent', CAST(N'2025-10-21 17:43:48.863' AS DateTime), CAST(N'2025-10-21 17:43:48.863' AS DateTime), N'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png', N'TEST-123', N'5.2', N'Warehouse', N'White', 2024, CAST(42.50 AS Decimal(5, 2)), CAST(N'2024-01-15' AS Date), CAST(N'2027-01-15' AS Date), CAST(N'2024-07-20' AS Date), N'Test vehicle created by admin', CAST(N'2024-01-20' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (87, , N'VF3', N'12345678910121314', 100, 210, N'available', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), NULL, 0, 0, 321, CAST(N'2025-05-30' AS Date), CAST(N'2025-10-23' AS Date), N'excellent', CAST(N'2025-10-21 17:46:03.107' AS DateTime), CAST(N'2025-10-21 17:46:03.107' AS DateTime), N'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png', N'51A-12456', N'5.2', N'', N'Blue', 2025, CAST(49.00 AS Decimal(5, 2)), CAST(N'2025-10-01' AS Date), CAST(N'2025-10-21' AS Date), CAST(N'2025-10-30' AS Date), N'abcdef', CAST(N'2025-04-30' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (88, 4, N'VF3', N'12345678910121314', 100, 210, N'available', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), NULL, 0, 0, 321, CAST(N'2025-05-30' AS Date), CAST(N'2025-10-23' AS Date), N'excellent', CAST(N'2025-10-21 17:46:16.167' AS DateTime), CAST(N'2025-10-22 01:31:36.867' AS DateTime), N'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png', N'51A-12456', N'5.2', N'District 3 Station', N'Blue', 2025, CAST(49.00 AS Decimal(5, 2)), CAST(N'2025-10-01' AS Date), CAST(N'2025-10-21' AS Date), CAST(N'2025-10-30' AS Date), N'abcdef', CAST(N'2025-04-30' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (89, 3, N'VF3', N'12345678910121314', 10, 210, N'available', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), NULL, 0, 0, 3000, CAST(N'1900-01-01' AS Date), CAST(N'2025-10-23' AS Date), N'excellent', CAST(N'2025-10-21 17:50:29.823' AS DateTime), CAST(N'2025-10-22 16:05:33.637' AS DateTime), N'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png', N'51A-12456', N'5.2', N'Airport Station', N'Blue', 2025, CAST(49.00 AS Decimal(5, 2)), CAST(N'2025-10-01' AS Date), CAST(N'2025-10-21' AS Date), CAST(N'2025-10-30' AS Date), N'assssss', CAST(N'2025-04-30' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (90, , N'EVO200LITE', N'12345678910121314', 100, 75, N'available', CAST(5.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(10, 2)), NULL, 0, 0, 3000, CAST(N'2025-10-22' AS Date), CAST(N'2025-10-15' AS Date), N'fair', CAST(N'2025-10-21 18:14:11.983' AS DateTime), CAST(N'2025-10-21 18:14:11.983' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5be43aa7/images/PDP-XMD/evo200-lite/img-evo-black.png', N'51A-12456', N'5.2', N'', N'Blue', 2025, CAST(42.00 AS Decimal(5, 2)), CAST(N'2025-10-08' AS Date), CAST(N'2025-10-15' AS Date), CAST(N'2025-10-30' AS Date), N'wwwwww', CAST(N'2025-04-30' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (91, 4, N'EVO200LITE', N'12345678910121314', 100, 75, N'available', CAST(5.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(10, 2)), NULL, 0, 0, 3000, CAST(N'2025-10-22' AS Date), CAST(N'2025-10-15' AS Date), N'excellent', CAST(N'2025-10-21 18:19:30.717' AS DateTime), CAST(N'2025-10-22 01:32:10.277' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5be43aa7/images/PDP-XMD/evo200-lite/img-evo-black.png', N'51A-12456', N'5.2', N'District 3 Station', N'Blue', 2025, CAST(42.00 AS Decimal(5, 2)), CAST(N'2025-10-08' AS Date), CAST(N'2025-10-15' AS Date), CAST(N'2025-10-30' AS Date), N'wwwwww', CAST(N'2025-04-30' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (92, 1, N'EVO200', N'12345678910121314', 100, 90, N'available', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), NULL, 0, 0, 321, CAST(N'2025-10-22' AS Date), CAST(N'2025-10-15' AS Date), N'good', CAST(N'2025-10-21 18:35:08.553' AS DateTime), CAST(N'2025-10-21 21:40:59.573' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png', N'51A-12456', N'5.2', N'District 1 Station', N'Blue', 2025, CAST(42.00 AS Decimal(5, 2)), CAST(N'2025-10-08' AS Date), CAST(N'2025-10-15' AS Date), CAST(N'2025-10-30' AS Date), N'eeeeee', CAST(N'2025-10-23' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (93, 4, N'EVO200', N'12345678910121314', 100, 90, N'available', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), NULL, 0, 0, 321, CAST(N'2025-10-29' AS Date), CAST(N'2025-10-22' AS Date), N'good', CAST(N'2025-10-21 19:53:07.450' AS DateTime), CAST(N'2025-10-21 21:12:38.120' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png', N'51A-12456', N'5.2', N'Station 4', N'Blue', 2025, CAST(42.00 AS Decimal(5, 2)), CAST(N'2025-10-08' AS Date), CAST(N'2025-10-15' AS Date), CAST(N'2025-10-31' AS Date), N'aaaa', CAST(N'2025-10-26' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (94, 7, N'VF9', N'12345678910121314', 98, 485, N'available', CAST(28.00 AS Decimal(10, 2)), CAST(220.00 AS Decimal(10, 2)), NULL, 0, 0, 3000, CAST(N'1900-01-01' AS Date), CAST(N'2025-10-15' AS Date), N'good', CAST(N'2025-10-21 20:43:56.310' AS DateTime), CAST(N'2025-10-21 22:20:54.700' AS DateTime), N'https://vnvinfast.com/data/upload/media/img-ce1h-1699328361.webp', N'51A-12456', N'6', N'Thu Duc Station', N'Black', 2025, CAST(42.00 AS Decimal(5, 2)), CAST(N'2025-10-01' AS Date), CAST(N'2025-10-16' AS Date), CAST(N'2025-10-31' AS Date), N'', CAST(N'2025-10-22' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (95, 7, N'FELIZLITE', N'12345678910121314', 100, 55, N'available', CAST(3.00 AS Decimal(10, 2)), CAST(20.00 AS Decimal(10, 2)), NULL, 0, 0, 3000, CAST(N'2025-10-26' AS Date), CAST(N'2025-10-20' AS Date), N'good', CAST(N'2025-10-21 22:10:25.460' AS DateTime), CAST(N'2025-10-21 22:11:38.727' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp', N'51A-12456', N'6', N'Thu Duc Station', N'Black', 2025, CAST(42.00 AS Decimal(5, 2)), CAST(N'2025-10-15' AS Date), CAST(N'2025-10-18' AS Date), CAST(N'2025-10-31' AS Date), N'aaaaaa', CAST(N'2025-10-22' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (96, 7, N'FELIZLITE', N'12345678910121313', 99, 55, N'available', CAST(3.00 AS Decimal(10, 2)), CAST(20.00 AS Decimal(10, 2)), NULL, 0, 0, 123, CAST(N'2025-10-27' AS Date), CAST(N'2025-10-16' AS Date), N'good', CAST(N'2025-10-22 01:20:53.997' AS DateTime), CAST(N'2025-10-22 01:21:43.363' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp', N'51A-12457', N'6', N'Thu Duc Station', N'White', 2025, CAST(45.00 AS Decimal(5, 2)), CAST(N'2025-10-15' AS Date), CAST(N'2025-10-17' AS Date), CAST(N'2025-10-31' AS Date), N'qqqqq', CAST(N'2025-10-19' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (97, 3, N'VF7', N'12345678910121355', 1, 390, N'available', CAST(18.00 AS Decimal(10, 2)), CAST(145.00 AS Decimal(10, 2)), NULL, 0, 0, 0, CAST(N'1900-01-01' AS Date), CAST(N'2025-10-15' AS Date), N'excellent', CAST(N'2025-10-23 19:36:39.977' AS DateTime), CAST(N'2025-10-23 19:42:52.190' AS DateTime), N'https://vinfastdongthap.vn/wp-content/uploads/2023/09/mau-xe-vinfast-vf7-6.png', N'51A-12456', N'5', N'Airport Station', N'Blue', 2025, CAST(52.00 AS Decimal(5, 2)), CAST(N'2025-10-01' AS Date), CAST(N'2025-10-17' AS Date), CAST(N'2025-10-31' AS Date), N'bbbbbb', CAST(N'2025-10-24' AS Date))
GO

SET IDENTITY_INSERT [dbo].[vehicles] OFF;
GO

SET IDENTITY_INSERT [dbo].[user_documents] ON;
GO

INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (37, 46, N'nationalId_front', N'/uploads/documents/4931aa55-1f41-4696-8d59-2211d2228c64_Screenshot 2025-09-12 010420.png', N'pending', CAST(N'' AS DateTime), , CAST(N'2025-10-14 19:55:16.127' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (38, 46, N'nationalId_back', N'/uploads/documents/e8033f42-31f1-4696-b729-091573d6d94c_Screenshot 2025-09-11 155343.png', N'pending', CAST(N'' AS DateTime), , CAST(N'2025-10-14 19:55:16.180' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (39, 46, N'driverLicense', N'/uploads/documents/7470b998-9a00-4d70-8e24-a8308636e045_Screenshot 2025-09-10 215152.png', N'pending', CAST(N'' AS DateTime), , CAST(N'2025-10-14 19:55:16.210' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (40, 47, N'nationalId_front', N'/uploads/documents/e72cf25a-d77d-429e-9dbb-4b55048dedb7_9dca2e6a-726f-4c37-af4f-75de65325542.jpg', N'pending', CAST(N'' AS DateTime), , CAST(N'2025-10-21 13:28:50.613' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (41, 47, N'nationalId_back', N'/uploads/documents/e431d629-8866-4b7c-b03b-b27f9b580bf8_7b3c7cea-d8bc-49d4-8b40-7a2c286a635a.jpg', N'pending', CAST(N'' AS DateTime), , CAST(N'2025-10-21 13:28:50.657' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (42, 47, N'driverLicense', N'/uploads/documents/1b5928ff-9975-4e87-abfd-53068708fa9a_134022352724517332.jpg', N'pending', CAST(N'' AS DateTime), , CAST(N'2025-10-21 13:28:50.703' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (46, 62, N'nationalId_front', N'/uploads/documents/e6301082-6177-483e-acf4-92c77a7e80dd_134042541742982815.jpg', N'pending', CAST(N'' AS DateTime), , CAST(N'2025-10-31 04:37:48.520' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (47, 62, N'nationalId_back', N'/uploads/documents/82ef5ab6-01d7-4df8-828d-cc46e093552d_9dca2e6a-726f-4c37-af4f-75de65325542.jpg', N'pending', CAST(N'' AS DateTime), , CAST(N'2025-10-31 04:37:30.857' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (48, 62, N'driverLicense', N'/uploads/documents/a6bff0de-ce99-468c-9b42-49aa08945cbb_134010368329397627.jpg', N'pending', CAST(N'' AS DateTime), , CAST(N'2025-10-31 04:37:34.653' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (55, 65, N'nationalId_front', N'/uploads/documents/1736b37b-710f-4aa9-b077-131ee895b2d5_7b3c7cea-d8bc-49d4-8b40-7a2c286a635a.jpg', N'approved', CAST(N'2025-10-31 06:41:13.467' AS DateTime), 54, CAST(N'2025-10-31 06:38:13.493' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (56, 65, N'nationalId_back', N'/uploads/documents/213e35b0-c209-41a2-b852-2392166c7650_134042541742982815.jpg', N'approved', CAST(N'2025-10-31 06:41:13.467' AS DateTime), 54, CAST(N'2025-10-31 06:38:13.527' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (57, 65, N'driverLicense', N'/uploads/documents/64ab1c09-2db4-4a90-9227-726e92dcb4b3_unnamed.png', N'approved', CAST(N'2025-10-31 06:41:13.467' AS DateTime), 54, CAST(N'2025-10-31 06:38:13.540' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (61, 67, N'nationalId_front', N'/uploads/documents/20aff034-7f9a-45f2-bf3a-e6072f467925_134010368329397627.jpg', N'approved', CAST(N'2025-10-31 13:49:35.653' AS DateTime), 54, CAST(N'2025-10-31 13:27:32.813' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (62, 67, N'nationalId_back', N'/uploads/documents/8b21f503-f931-4464-aa06-4680c87b387a_134022352724517332.jpg', N'approved', CAST(N'2025-10-31 13:49:35.653' AS DateTime), 54, CAST(N'2025-10-31 13:27:32.873' AS DateTime))
GO
INSERT [dbo].[user_documents] ([document_id], [user_id], [document_type], [file_url], [status], [verified_at], [verified_by], [uploaded_at]) VALUES (63, 67, N'driverLicense', N'/uploads/documents/aeb8fee5-da21-4fe9-a6a1-22b5837f82d8_banner.png', N'approved', CAST(N'2025-10-31 13:49:35.653' AS DateTime), 54, CAST(N'2025-10-31 13:27:32.900' AS DateTime))
GO

SET IDENTITY_INSERT [dbo].[user_documents] OFF;
GO

SET IDENTITY_INSERT [dbo].[reservations] ON;
GO

INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (8, 47, 3, 5, CAST(N'2025-10-26 10:30:00.000' AS DateTime), CAST(N'2025-10-27 10:19:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-26 17:19:15.700' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (9, 47, 33, 5, CAST(N'2025-10-26 11:00:00.000' AS DateTime), CAST(N'2025-10-27 10:30:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-26 17:30:59.933' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (10, 47, 36, 8, CAST(N'2025-10-26 11:30:00.000' AS DateTime), CAST(N'2025-10-27 11:05:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-26 18:05:40.030' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (11, 47, 33, 5, CAST(N'2025-10-26 12:00:00.000' AS DateTime), CAST(N'2025-10-27 11:33:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-26 18:33:25.153' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (12, 47, 3, 5, CAST(N'2025-10-26 12:00:00.000' AS DateTime), CAST(N'2025-10-27 11:33:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-26 18:33:55.053' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (13, 47, 33, 5, CAST(N'2025-10-26 12:30:00.000' AS DateTime), CAST(N'2025-10-27 12:03:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-26 19:03:53.947' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (14, 47, 33, 5, CAST(N'2025-10-26 12:00:00.000' AS DateTime), CAST(N'2025-10-26 13:30:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-26 19:14:26.063' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (15, 47, 34, 6, CAST(N'2025-10-26 12:30:00.000' AS DateTime), CAST(N'2025-10-27 12:18:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-26 19:18:47.910' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (16, 47, 33, 5, CAST(N'2025-10-26 14:27:24.387' AS DateTime), CAST(N'2025-10-26 15:57:24.387' AS DateTime), N'cancelled', CAST(N'2025-10-26 19:27:24.407' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (17, 47, 34, 6, CAST(N'2025-10-26 12:30:00.000' AS DateTime), CAST(N'2025-10-26 14:00:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-26 19:32:39.707' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (18, 47, 33, 5, CAST(N'2025-10-26 12:30:00.000' AS DateTime), CAST(N'2025-10-26 14:00:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-26 19:36:37.177' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (19, 47, 3, 5, CAST(N'2025-10-26 12:30:00.000' AS DateTime), CAST(N'2025-10-26 14:00:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-26 19:41:35.950' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (20, 47, 33, 5, CAST(N'2025-10-26 14:46:00.773' AS DateTime), CAST(N'2025-10-26 16:16:00.773' AS DateTime), N'cancelled', CAST(N'2025-10-26 19:46:00.810' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (21, 47, 33, 5, CAST(N'2025-10-26 13:00:00.000' AS DateTime), CAST(N'2025-10-27 12:48:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-26 19:49:09.480' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (22, 47, 35, 7, CAST(N'2025-10-26 13:00:00.000' AS DateTime), CAST(N'2025-10-27 12:49:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-26 19:49:48.817' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (23, 47, 33, 5, CAST(N'2025-10-28 07:00:00.000' AS DateTime), CAST(N'2025-10-29 06:56:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-28 13:57:02.920' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (24, 47, 34, 6, CAST(N'2025-10-28 07:30:00.000' AS DateTime), CAST(N'2025-10-29 07:04:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-28 14:04:47.223' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (25, 47, 39, 3, CAST(N'2025-10-28 07:30:00.000' AS DateTime), CAST(N'2025-10-29 07:06:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-28 14:06:23.260' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (26, 47, 37, 1, CAST(N'2025-10-28 07:30:00.000' AS DateTime), CAST(N'2025-10-29 07:07:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-28 14:07:05.600' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (27, 47, 33, 5, CAST(N'2025-10-28 07:30:00.000' AS DateTime), CAST(N'2025-10-29 07:21:00.000' AS DateTime), N'pending', CAST(N'2025-10-28 14:21:42.197' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (28, 62, 35, 7, CAST(N'2025-10-30 21:53:32.217' AS DateTime), CAST(N'2025-10-30 23:23:32.217' AS DateTime), N'cancelled', CAST(N'2025-10-31 02:53:32.240' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (29, 62, 30, 2, CAST(N'2025-10-30 21:56:59.330' AS DateTime), CAST(N'2025-10-30 23:26:59.330' AS DateTime), N'confirmed', CAST(N'2025-10-31 02:56:59.340' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (37, 65, 36, 8, CAST(N'2025-10-30 23:30:00.000' AS DateTime), CAST(N'2025-10-31 01:00:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-31 06:40:14.147' AS DateTime), N'aaaaa', N'staff', CAST(N'2025-10-31 06:46:49.177' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (38, 65, 40, 4, CAST(N'2025-10-31 00:00:00.000' AS DateTime), CAST(N'2025-10-31 23:47:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-31 06:48:17.563' AS DateTime), N'Cancelled by customer', N'customer', CAST(N'2025-10-31 06:48:38.873' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (39, 65, 25, 5, CAST(N'2025-10-31 01:50:05.723' AS DateTime), CAST(N'2025-10-31 03:20:05.723' AS DateTime), N'cancelled', CAST(N'2025-10-31 06:50:05.733' AS DateTime), N'bbbb', N'staff', CAST(N'2025-10-31 07:12:25.247' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (40, 65, 8, 8, CAST(N'2025-10-31 00:00:00.000' AS DateTime), CAST(N'2025-10-31 01:30:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-31 07:14:28.157' AS DateTime), N'vvvvv', N'staff', CAST(N'2025-10-31 07:21:17.457' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (41, 65, 24, 8, CAST(N'2025-10-31 09:21:53.000' AS DateTime), CAST(N'2025-10-31 10:51:53.000' AS DateTime), N'cancelled', CAST(N'2025-10-31 07:21:53.337' AS DateTime), N'nnnn', N'staff', CAST(N'2025-10-31 07:28:16.470' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (42, 65, 16, 8, CAST(N'2025-10-31 08:00:00.000' AS DateTime), CAST(N'2025-10-31 10:30:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-31 07:29:20.407' AS DateTime), N'Cancelled by customer', N'customer', CAST(N'2025-10-31 07:35:57.917' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (43, 65, 36, 8, CAST(N'2025-10-31 07:30:00.000' AS DateTime), CAST(N'2025-10-31 09:00:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-31 07:37:16.220' AS DateTime), N'Cancelled by customer', N'customer', CAST(N'2025-10-31 07:45:38.223' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (44, 65, 36, 8, CAST(N'2025-10-31 09:45:51.000' AS DateTime), CAST(N'2025-10-31 11:15:51.000' AS DateTime), N'cancelled', CAST(N'2025-10-31 07:45:51.337' AS DateTime), N'Cancelled by customer', N'customer', CAST(N'2025-10-31 07:48:57.637' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (45, 65, 36, 8, CAST(N'2025-10-31 09:49:22.000' AS DateTime), CAST(N'2025-10-31 11:19:22.000' AS DateTime), N'cancelled', CAST(N'2025-10-31 07:49:23.007' AS DateTime), N'Cancelled by customer', N'customer', CAST(N'2025-10-31 07:54:44.517' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (46, 65, 36, 8, CAST(N'2025-10-31 09:54:58.000' AS DateTime), CAST(N'2025-10-31 11:24:58.000' AS DateTime), N'cancelled', CAST(N'2025-10-31 07:54:58.770' AS DateTime), N'Cancelled by customer', N'customer', CAST(N'2025-10-31 08:00:57.040' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (47, 65, 36, 8, CAST(N'2025-10-31 08:00:00.000' AS DateTime), CAST(N'2025-10-31 09:30:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-31 08:01:19.247' AS DateTime), N'Cancelled by customer', N'customer', CAST(N'2025-10-31 08:03:07.670' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (48, 65, 36, 8, CAST(N'2025-10-31 08:00:00.000' AS DateTime), CAST(N'2025-10-31 09:30:00.000' AS DateTime), N'cancelled', CAST(N'2025-10-31 08:03:36.517' AS DateTime), N'Cancelled by customer', N'customer', CAST(N'2025-10-31 08:10:10.507' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (49, 65, 31, 3, CAST(N'2025-10-31 08:30:00.000' AS DateTime), CAST(N'2025-11-01 08:10:00.000' AS DateTime), N'pending', CAST(N'2025-10-31 08:10:30.110' AS DateTime), N'', N'', CAST(N'' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (51, 67, 36, 8, CAST(N'2025-10-31 15:28:39.000' AS DateTime), CAST(N'2025-10-31 16:58:39.000' AS DateTime), N'cancelled', CAST(N'2025-10-31 13:28:39.620' AS DateTime), N'Cancelled by customer', N'customer', CAST(N'2025-10-31 13:45:28.153' AS DateTime))
GO
INSERT [dbo].[reservations] ([reservation_id], [user_id], [vehicle_id], [station_id], [start_time], [end_time], [status], [created_at], [cancellation_reason], [cancelled_by], [cancelled_at]) VALUES (52, 67, 36, 8, CAST(N'2025-10-31 15:47:54.000' AS DateTime), CAST(N'2025-10-31 17:17:54.000' AS DateTime), N'cancelled', CAST(N'2025-10-31 13:47:54.057' AS DateTime), N'abcd', N'staff', CAST(N'2025-10-31 13:50:25.917' AS DateTime))
GO

SET IDENTITY_INSERT [dbo].[reservations] OFF;
GO

SET IDENTITY_INSERT [dbo].[payments] ON;
GO

INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (8, , , N'vnpay', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN1761399626157', 0, CAST(N'2025-10-25 20:40:26.293' AS DateTime), CAST(N'2025-10-25 20:40:26.293' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (9, , , N'vnpay', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN1761399652599', 0, CAST(N'2025-10-25 20:40:52.610' AS DateTime), CAST(N'2025-10-25 20:40:52.610' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (10, , , N'momo', CAST(1000000.00 AS Decimal(10, 2)), N'success', N'TXN1761400285156', 0, CAST(N'2025-10-25 20:51:25.183' AS DateTime), CAST(N'2025-10-25 20:51:25.183' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (11, , , N'bank_transfer', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN1761400525640', 0, CAST(N'2025-10-25 20:55:25.647' AS DateTime), CAST(N'2025-10-25 20:55:25.647' AS DateTime), 46, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (12, , , N'bank_transfer', CAST(200000.00 AS Decimal(10, 2)), N'success', N'TXN1761468275833', 0, CAST(N'2025-10-26 15:44:35.850' AS DateTime), CAST(N'2025-10-26 15:44:35.850' AS DateTime), 46, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (13, , , N'momo', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN1761468543617', 0, CAST(N'2025-10-26 15:49:03.623' AS DateTime), CAST(N'2025-10-26 15:49:03.623' AS DateTime), 46, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (14, , , N'bank_transfer', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN1761469629976', 0, CAST(N'2025-10-26 16:07:09.980' AS DateTime), CAST(N'2025-10-26 16:07:09.980' AS DateTime), 46, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (15, , , N'bank_transfer', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN1761469893867', 0, CAST(N'2025-10-26 16:11:33.870' AS DateTime), CAST(N'2025-10-26 16:11:33.870' AS DateTime), 46, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (16, , , N'momo', CAST(100000.00 AS Decimal(10, 2)), N'success', N'MOMO1761469943011', 0, CAST(N'2025-10-26 16:12:23.017' AS DateTime), CAST(N'2025-10-26 16:12:23.017' AS DateTime), 46, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (17, , , N'momo', CAST(100000.00 AS Decimal(10, 2)), N'success', N'MOMO1761470076826', 0, CAST(N'2025-10-26 16:14:36.827' AS DateTime), CAST(N'2025-10-26 16:14:36.827' AS DateTime), 46, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (18, , , N'momo', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN1761470595043', 0, CAST(N'2025-10-26 16:23:15.050' AS DateTime), CAST(N'2025-10-26 16:23:15.050' AS DateTime), 46, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (19, , , N'bank_transfer', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN_638970696117428463_46', 0, CAST(N'2025-10-26 17:00:11.753' AS DateTime), CAST(N'2025-10-26 17:00:11.753' AS DateTime), 46, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (20, , , N'momo', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN_638970696485910895_46', 0, CAST(N'2025-10-26 17:00:48.590' AS DateTime), CAST(N'2025-10-26 17:00:48.590' AS DateTime), 46, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (21, , , N'bank_transfer', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN_638970704191625681_47', 0, CAST(N'2025-10-26 17:13:39.167' AS DateTime), CAST(N'2025-10-26 17:13:39.167' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (22, 8, , N'bank_transfer', CAST(60.00 AS Decimal(10, 2)), N'success', N'PAY_1761473954646', 0, CAST(N'2025-10-26 17:19:15.757' AS DateTime), CAST(N'2025-10-26 17:19:15.757' AS DateTime), , N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (23, 9, , N'bank_transfer', CAST(40.00 AS Decimal(10, 2)), N'success', N'PAY_1761474658923', 0, CAST(N'2025-10-26 17:30:59.950' AS DateTime), CAST(N'2025-10-26 17:30:59.950' AS DateTime), , N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (24, 10, , N'bank_transfer', CAST(40.00 AS Decimal(10, 2)), N'success', N'PAY_1761476739003', 0, CAST(N'2025-10-26 18:05:40.057' AS DateTime), CAST(N'2025-10-26 18:05:40.057' AS DateTime), , N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (25, 11, , N'bank_transfer', CAST(40.00 AS Decimal(10, 2)), N'success', N'PAY_1761478404134', 0, CAST(N'2025-10-26 18:33:25.170' AS DateTime), CAST(N'2025-10-26 18:33:25.170' AS DateTime), , N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (26, 12, , N'bank_transfer', CAST(60.00 AS Decimal(10, 2)), N'success', N'PAY_1761478434020', 0, CAST(N'2025-10-26 18:33:55.070' AS DateTime), CAST(N'2025-10-26 18:33:55.070' AS DateTime), , N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (27, , , N'wallet', CAST(1040000.00 AS Decimal(10, 2)), N'success', N'TXN_1761480232853', 0, CAST(N'2025-10-26 19:03:52.883' AS DateTime), CAST(N'2025-10-26 19:03:52.883' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (28, 13, , N'bank_transfer', CAST(40.00 AS Decimal(10, 2)), N'success', N'PAY_1761480232910', 0, CAST(N'2025-10-26 19:03:53.977' AS DateTime), CAST(N'2025-10-26 19:03:53.977' AS DateTime), , N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (29, 13, , N'wallet', CAST(40.00 AS Decimal(10, 2)), N'success', N'REFUND_13_638971023924649742', 0, CAST(N'2025-10-26 19:06:32.470' AS DateTime), CAST(N'2025-10-26 19:06:32.470' AS DateTime), 47, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (30, , , N'bank_transfer', CAST(1000000.00 AS Decimal(10, 2)), N'success', N'TXN_638970776399422911_47', 0, CAST(N'2025-10-26 19:13:59.950' AS DateTime), CAST(N'2025-10-26 19:13:59.950' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (31, , , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'TXN_1761480865005', 0, CAST(N'2025-10-26 19:14:25.017' AS DateTime), CAST(N'2025-10-26 19:14:25.017' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (32, 14, , N'bank_transfer', CAST(7.00 AS Decimal(10, 2)), N'success', N'PAY_1761480865031', 0, CAST(N'2025-10-26 19:14:26.083' AS DateTime), CAST(N'2025-10-26 19:14:26.083' AS DateTime), , N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (33, , , N'momo', CAST(1000000.00 AS Decimal(10, 2)), N'success', N'TXN_638970779134391141_47', 0, CAST(N'2025-10-26 19:18:33.440' AS DateTime), CAST(N'2025-10-26 19:18:33.440' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (34, , , N'wallet', CAST(1040000.00 AS Decimal(10, 2)), N'success', N'TXN_1761481126884', 0, CAST(N'2025-10-26 19:18:46.890' AS DateTime), CAST(N'2025-10-26 19:18:46.890' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (35, 15, , N'bank_transfer', CAST(40.00 AS Decimal(10, 2)), N'success', N'PAY_1761481126901', 0, CAST(N'2025-10-26 19:18:47.920' AS DateTime), CAST(N'2025-10-26 19:18:47.920' AS DateTime), , N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (36, , , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'TXN_1761481643341', 0, CAST(N'2025-10-26 19:27:23.367' AS DateTime), CAST(N'2025-10-26 19:27:23.367' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (37, 16, , N'bank_transfer', CAST(7.00 AS Decimal(10, 2)), N'success', N'PAY_1761481643380', 0, CAST(N'2025-10-26 19:27:24.430' AS DateTime), CAST(N'2025-10-26 19:27:24.430' AS DateTime), , N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (38, , , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'TXN_1761481958651', 0, CAST(N'2025-10-26 19:32:38.673' AS DateTime), CAST(N'2025-10-26 19:32:38.673' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (39, 17, , N'bank_transfer', CAST(7.00 AS Decimal(10, 2)), N'success', N'PAY_1761481958690', 0, CAST(N'2025-10-26 19:32:39.730' AS DateTime), CAST(N'2025-10-26 19:32:39.730' AS DateTime), , N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (40, , , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'TXN_1761482196143', 0, CAST(N'2025-10-26 19:36:36.157' AS DateTime), CAST(N'2025-10-26 19:36:36.157' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (41, 18, , N'bank_transfer', CAST(7.00 AS Decimal(10, 2)), N'success', N'PAY_1761482196165', 0, CAST(N'2025-10-26 19:36:37.190' AS DateTime), CAST(N'2025-10-26 19:36:37.190' AS DateTime), , N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (42, , , N'wallet', CAST(208000.00 AS Decimal(10, 2)), N'success', N'TXN_1761482494875', 0, CAST(N'2025-10-26 19:41:34.910' AS DateTime), CAST(N'2025-10-26 19:41:34.910' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (43, 19, , N'bank_transfer', CAST(8.00 AS Decimal(10, 2)), N'success', N'PAY_1761482494928', 0, CAST(N'2025-10-26 19:41:35.973' AS DateTime), CAST(N'2025-10-26 19:41:35.973' AS DateTime), , N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (44, 20, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761482759719', 0, CAST(N'2025-10-26 19:45:59.750' AS DateTime), CAST(N'2025-10-26 19:45:59.750' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (45, 20, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'RFND_638970795793125917_47', 0, CAST(N'2025-10-26 19:46:19.317' AS DateTime), CAST(N'2025-10-26 19:46:19.317' AS DateTime), 47, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (46, , , N'vnpay', CAST(1000000.00 AS Decimal(10, 2)), N'success', N'TXN_638970797282762425_47', 0, CAST(N'2025-10-26 19:48:48.283' AS DateTime), CAST(N'2025-10-26 19:48:48.283' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (47, 21, , N'wallet', CAST(1040000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761482948425', 0, CAST(N'2025-10-26 19:49:08.443' AS DateTime), CAST(N'2025-10-26 19:49:08.443' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (48, 21, , N'wallet', CAST(1040000.00 AS Decimal(10, 2)), N'success', N'RFND_638970797639188377_47', 0, CAST(N'2025-10-26 19:49:23.920' AS DateTime), CAST(N'2025-10-26 19:49:23.920' AS DateTime), 47, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (49, 22, , N'wallet', CAST(1040000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761482987786', 0, CAST(N'2025-10-26 19:49:47.793' AS DateTime), CAST(N'2025-10-26 19:49:47.793' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (50, 22, , N'wallet', CAST(1040000.00 AS Decimal(10, 2)), N'success', N'RFND_638970798186823305_47', 0, CAST(N'2025-10-26 19:50:18.683' AS DateTime), CAST(N'2025-10-26 19:50:18.683' AS DateTime), 47, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (51, , , N'momo', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN_638971405999189251_47', 0, CAST(N'2025-10-27 12:43:19.933' AS DateTime), CAST(N'2025-10-27 12:43:19.933' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (52, , , N'momo', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN_638971444420099653_47', 0, CAST(N'2025-10-27 13:47:22.013' AS DateTime), CAST(N'2025-10-27 13:47:22.013' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (53, , , N'momo', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN_638971466573712135_47', 0, CAST(N'2025-10-27 14:24:17.377' AS DateTime), CAST(N'2025-10-27 14:24:17.377' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (54, , , N'momo', CAST(100000.00 AS Decimal(10, 2)), N'success', N'TXN_638972277320035552_47', 0, CAST(N'2025-10-28 12:55:32.017' AS DateTime), CAST(N'2025-10-28 12:55:32.017' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (55, , , N'momo', CAST(10000000.00 AS Decimal(10, 2)), N'success', N'TXN_1761633686515', 0, CAST(N'2025-10-28 13:41:26.530' AS DateTime), CAST(N'2025-10-28 13:41:26.530' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (56, , , N'momo', CAST(1000000.00 AS Decimal(10, 2)), N'success', N'TXN_1761633731895', 0, CAST(N'2025-10-28 13:42:11.903' AS DateTime), CAST(N'2025-10-28 13:42:11.903' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (57, , , N'momo', CAST(1000000.00 AS Decimal(10, 2)), N'success', N'TXN_1761633754981', 0, CAST(N'2025-10-28 13:42:34.983' AS DateTime), CAST(N'2025-10-28 13:42:34.983' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (58, , , N'vnpay', CAST(1000000.00 AS Decimal(10, 2)), N'success', N'TXN_638972305727668121_47', 0, CAST(N'2025-10-28 13:42:52.767' AS DateTime), CAST(N'2025-10-28 13:42:52.767' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (59, , , N'bank_transfer', CAST(1000000.00 AS Decimal(10, 2)), N'success', N'TXN_638972305917552213_47', 0, CAST(N'2025-10-28 13:43:11.760' AS DateTime), CAST(N'2025-10-28 13:43:11.760' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (60, , , N'momo', CAST(1000000.00 AS Decimal(10, 2)), N'success', N'TXN_1761633848910', 0, CAST(N'2025-10-28 13:44:08.920' AS DateTime), CAST(N'2025-10-28 13:44:08.920' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (61, , , N'bank_transfer', CAST(1000000.00 AS Decimal(10, 2)), N'success', N'TXN_638972313990055245_47', 0, CAST(N'2025-10-28 13:56:39.013' AS DateTime), CAST(N'2025-10-28 13:56:39.013' AS DateTime), 47, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (62, 23, , N'wallet', CAST(1040000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761634621869', 0, CAST(N'2025-10-28 13:57:01.883' AS DateTime), CAST(N'2025-10-28 13:57:01.883' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (63, 23, , N'wallet', CAST(1040000.00 AS Decimal(10, 2)), N'success', N'RFND_638972318526533276_47', 0, CAST(N'2025-10-28 14:04:12.653' AS DateTime), CAST(N'2025-10-28 14:04:12.653' AS DateTime), 47, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (64, 24, , N'wallet', CAST(1040000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761635086200', 0, CAST(N'2025-10-28 14:04:46.207' AS DateTime), CAST(N'2025-10-28 14:04:46.207' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (65, 24, , N'wallet', CAST(1040000.00 AS Decimal(10, 2)), N'success', N'RFND_638972319433757568_47', 0, CAST(N'2025-10-28 14:05:43.377' AS DateTime), CAST(N'2025-10-28 14:05:43.377' AS DateTime), 47, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (66, 25, , N'wallet', CAST(910000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761635182222', 0, CAST(N'2025-10-28 14:06:22.227' AS DateTime), CAST(N'2025-10-28 14:06:22.227' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (67, 25, , N'wallet', CAST(910000.00 AS Decimal(10, 2)), N'success', N'RFND_638972320179054086_47', 0, CAST(N'2025-10-28 14:06:57.907' AS DateTime), CAST(N'2025-10-28 14:06:57.907' AS DateTime), 47, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (68, 26, , N'wallet', CAST(910000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761635224585', 0, CAST(N'2025-10-28 14:07:04.587' AS DateTime), CAST(N'2025-10-28 14:07:04.587' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (69, 26, , N'wallet', CAST(910000.00 AS Decimal(10, 2)), N'success', N'RFND_638972323627817169_47', 0, CAST(N'2025-10-28 14:12:42.783' AS DateTime), CAST(N'2025-10-28 14:12:42.783' AS DateTime), 47, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (70, 27, , N'wallet', CAST(1040000.00 AS Decimal(10, 2)), N'success', N'TXN_1761636101164', 0, CAST(N'2025-10-28 14:21:41.170' AS DateTime), CAST(N'2025-10-28 14:21:41.170' AS DateTime), 47, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (71, , , N'momo', CAST(1000000.00 AS Decimal(10, 2)), N'success', N'TXN_1761853983211', 0, CAST(N'2025-10-31 02:53:03.237' AS DateTime), CAST(N'2025-10-31 02:53:03.237' AS DateTime), 62, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (72, 28, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761854011182', 0, CAST(N'2025-10-31 02:53:31.197' AS DateTime), CAST(N'2025-10-31 02:53:31.197' AS DateTime), 62, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (73, 28, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'RFND_638974510064826239_62', 0, CAST(N'2025-10-31 02:56:46.483' AS DateTime), CAST(N'2025-10-31 02:56:46.483' AS DateTime), 62, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (74, 29, , N'wallet', CAST(130000.00 AS Decimal(10, 2)), N'success', N'TXN_1761854218310', 0, CAST(N'2025-10-31 02:56:58.320' AS DateTime), CAST(N'2025-10-31 02:56:58.320' AS DateTime), 62, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (89, , , N'vnpay', CAST(1000000.00 AS Decimal(10, 2)), N'success', N'TXN_638974643300795572_65', 0, CAST(N'2025-10-31 06:38:50.090' AS DateTime), CAST(N'2025-10-31 06:38:50.090' AS DateTime), 65, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (90, 37, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761867613098', 0, CAST(N'2025-10-31 06:40:13.110' AS DateTime), CAST(N'2025-10-31 06:40:13.110' AS DateTime), 65, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (91, 37, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'RFND_638974648091976618_65', 0, CAST(N'2025-10-31 06:46:49.207' AS DateTime), CAST(N'2025-10-31 06:46:49.207' AS DateTime), 65, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (92, 38, , N'wallet', CAST(910000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761868096522', 0, CAST(N'2025-10-31 06:48:16.533' AS DateTime), CAST(N'2025-10-31 06:48:16.533' AS DateTime), 65, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (93, 38, , N'wallet', CAST(910000.00 AS Decimal(10, 2)), N'success', N'RFND_638974649188965170_65', 0, CAST(N'2025-10-31 06:48:38.900' AS DateTime), CAST(N'2025-10-31 06:48:38.900' AS DateTime), 65, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (94, 39, , N'wallet', CAST(156000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761868204690', 0, CAST(N'2025-10-31 06:50:04.700' AS DateTime), CAST(N'2025-10-31 06:50:04.700' AS DateTime), 65, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (95, 39, , N'wallet', CAST(156000.00 AS Decimal(10, 2)), N'success', N'RFND_638974663452707105_65', 0, CAST(N'2025-10-31 07:12:25.273' AS DateTime), CAST(N'2025-10-31 07:12:25.273' AS DateTime), 65, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (96, 40, , N'wallet', CAST(312000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761869667107', 0, CAST(N'2025-10-31 07:14:27.117' AS DateTime), CAST(N'2025-10-31 07:14:27.117' AS DateTime), 65, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (97, 40, , N'wallet', CAST(312000.00 AS Decimal(10, 2)), N'success', N'RFND_638974668774729862_65', 0, CAST(N'2025-10-31 07:21:17.473' AS DateTime), CAST(N'2025-10-31 07:21:17.473' AS DateTime), 65, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (98, 41, , N'wallet', CAST(728000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761870112305', 0, CAST(N'2025-10-31 07:21:52.310' AS DateTime), CAST(N'2025-10-31 07:21:52.310' AS DateTime), 65, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (99, 41, , N'wallet', CAST(728000.00 AS Decimal(10, 2)), N'success', N'RFND_638974672964882781_65', 0, CAST(N'2025-10-31 07:28:16.490' AS DateTime), CAST(N'2025-10-31 07:28:16.490' AS DateTime), 65, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (100, 42, , N'wallet', CAST(936000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761870559377', 0, CAST(N'2025-10-31 07:29:19.383' AS DateTime), CAST(N'2025-10-31 07:29:19.383' AS DateTime), 65, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (101, 42, , N'wallet', CAST(936000.00 AS Decimal(10, 2)), N'success', N'RFND_638974677579365487_65', 0, CAST(N'2025-10-31 07:35:57.940' AS DateTime), CAST(N'2025-10-31 07:35:57.940' AS DateTime), 65, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (102, 43, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761871035185', 0, CAST(N'2025-10-31 07:37:15.197' AS DateTime), CAST(N'2025-10-31 07:37:15.197' AS DateTime), 65, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (103, 43, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'RFND_638974683382463344_65', 0, CAST(N'2025-10-31 07:45:38.250' AS DateTime), CAST(N'2025-10-31 07:45:38.250' AS DateTime), 65, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (104, 44, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761871550305', 0, CAST(N'2025-10-31 07:45:50.313' AS DateTime), CAST(N'2025-10-31 07:45:50.313' AS DateTime), 65, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (105, 44, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'RFND_638974685376610833_65', 0, CAST(N'2025-10-31 07:48:57.663' AS DateTime), CAST(N'2025-10-31 07:48:57.663' AS DateTime), 65, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (106, 45, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761871761961', 0, CAST(N'2025-10-31 07:49:21.973' AS DateTime), CAST(N'2025-10-31 07:49:21.973' AS DateTime), 65, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (107, 45, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'RFND_638974688845542922_65', 0, CAST(N'2025-10-31 07:54:44.560' AS DateTime), CAST(N'2025-10-31 07:54:44.560' AS DateTime), 65, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (108, 46, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761872097731', 0, CAST(N'2025-10-31 07:54:57.743' AS DateTime), CAST(N'2025-10-31 07:54:57.743' AS DateTime), 65, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (109, 46, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'RFND_638974692570722173_65', 0, CAST(N'2025-10-31 08:00:57.070' AS DateTime), CAST(N'2025-10-31 08:00:57.070' AS DateTime), 65, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (110, 47, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761872478194', 0, CAST(N'2025-10-31 08:01:18.203' AS DateTime), CAST(N'2025-10-31 08:01:18.203' AS DateTime), 65, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (111, 47, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'RFND_638974693876889504_65', 0, CAST(N'2025-10-31 08:03:07.690' AS DateTime), CAST(N'2025-10-31 08:03:07.690' AS DateTime), 65, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (112, 48, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761872615473', 0, CAST(N'2025-10-31 08:03:35.480' AS DateTime), CAST(N'2025-10-31 08:03:35.480' AS DateTime), 65, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (113, 48, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'RFND_638974698105336667_65', 0, CAST(N'2025-10-31 08:10:10.533' AS DateTime), CAST(N'2025-10-31 08:10:10.533' AS DateTime), 65, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (114, 49, , N'wallet', CAST(780000.00 AS Decimal(10, 2)), N'success', N'TXN_1761873029048', 0, CAST(N'2025-10-31 08:10:29.063' AS DateTime), CAST(N'2025-10-31 08:10:29.063' AS DateTime), 65, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (117, , , N'bank_transfer', CAST(1000000.00 AS Decimal(10, 2)), N'success', N'TXN_638974888663770920_67', 0, CAST(N'2025-10-31 13:27:46.397' AS DateTime), CAST(N'2025-10-31 13:27:46.397' AS DateTime), 67, N'deposit')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (118, 51, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761892118520', 0, CAST(N'2025-10-31 13:28:38.547' AS DateTime), CAST(N'2025-10-31 13:28:38.547' AS DateTime), 67, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (119, 51, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'RFND_638974899281908296_67', 0, CAST(N'2025-10-31 13:45:28.193' AS DateTime), CAST(N'2025-10-31 13:45:28.193' AS DateTime), 67, N'refund')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (120, 52, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'refunded', N'TXN_1761893272960', 0, CAST(N'2025-10-31 13:47:52.990' AS DateTime), CAST(N'2025-10-31 13:47:52.990' AS DateTime), 67, N'payment')
GO
INSERT [dbo].[payments] ([payment_id], [reservation_id], [rental_id], [method_type], [amount], [status], [transaction_id], [is_deposit], [created_at], [updated_at], [user_id], [transaction_type]) VALUES (121, 52, , N'wallet', CAST(182000.00 AS Decimal(10, 2)), N'success', N'RFND_638974902259294785_67', 0, CAST(N'2025-10-31 13:50:25.927' AS DateTime), CAST(N'2025-10-31 13:50:25.927' AS DateTime), 67, N'refund')
GO

SET IDENTITY_INSERT [dbo].[payments] OFF;
GO



PRINT '>>> Data inserted successfully. (3 roles, 8 stations, 13 models, 15 users, 79 vehicles, 15 documents, 37 reservations, 98 payments)'
GO

-- STEP 8: Create foreign key constraints
-- ===================================================================================
PRINT '>>> Creating foreign key constraints...'
GO

ALTER TABLE [dbo].[battery_logs] WITH CHECK ADD CONSTRAINT [FK__battery_l__staff__787EE5A0] FOREIGN KEY([staff_id]) REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[battery_logs] CHECK CONSTRAINT [FK__battery_l__staff__787EE5A0]
GO

ALTER TABLE [dbo].[contracts] WITH CHECK ADD FOREIGN KEY([rental_id]) REFERENCES [dbo].[rentals] ([rental_id])
GO

ALTER TABLE [dbo].[handovers] WITH CHECK ADD FOREIGN KEY([rental_id]) REFERENCES [dbo].[rentals] ([rental_id])
GO
ALTER TABLE [dbo].[handovers] WITH CHECK ADD CONSTRAINT [FK__handovers__staff__6EF57B66] FOREIGN KEY([staff_id]) REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[handovers] CHECK CONSTRAINT [FK__handovers__staff__6EF57B66]
GO

ALTER TABLE [dbo].[maintenance_records] WITH CHECK ADD CONSTRAINT [FK__maintenan__staff__7D439ABD] FOREIGN KEY([staff_id]) REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[maintenance_records] CHECK CONSTRAINT [FK__maintenan__staff__7D439ABD]
GO

ALTER TABLE [dbo].[notifications] WITH CHECK ADD CONSTRAINT [FK__notificat__user___04E4BC85] FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[notifications] CHECK CONSTRAINT [FK__notificat__user___04E4BC85]
GO

ALTER TABLE [dbo].[payments] WITH CHECK ADD FOREIGN KEY([rental_id]) REFERENCES [dbo].[rentals] ([rental_id])
GO
ALTER TABLE [dbo].[payments] WITH CHECK ADD FOREIGN KEY([reservation_id]) REFERENCES [dbo].[reservations] ([reservation_id])
GO
ALTER TABLE [dbo].[payments] WITH CHECK ADD CONSTRAINT [fk_payments_user] FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[payments] CHECK CONSTRAINT [fk_payments_user]
GO

ALTER TABLE [dbo].[pickup_qr_codes] WITH CHECK ADD FOREIGN KEY([rental_id]) REFERENCES [dbo].[rentals] ([rental_id])
GO

ALTER TABLE [dbo].[rentals] WITH CHECK ADD FOREIGN KEY([reservation_id]) REFERENCES [dbo].[reservations] ([reservation_id])
GO
ALTER TABLE [dbo].[rentals] WITH CHECK ADD CONSTRAINT [FK__rentals__user_id__59063A47] FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[rentals] CHECK CONSTRAINT [FK__rentals__user_id__59063A47]
GO

ALTER TABLE [dbo].[reservations] WITH CHECK ADD CONSTRAINT [FK__reservati__user___52593CB8] FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[reservations] CHECK CONSTRAINT [FK__reservati__user___52593CB8]
GO

ALTER TABLE [dbo].[user_documents] WITH CHECK ADD CONSTRAINT [FK__user_docu__user___72C60C4A] FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[user_documents] CHECK CONSTRAINT [FK__user_docu__user___72C60C4A]
GO
ALTER TABLE [dbo].[user_documents] WITH CHECK ADD CONSTRAINT [FK__user_docu__verif__73BA3083] FOREIGN KEY([verified_by]) REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[user_documents] CHECK CONSTRAINT [FK__user_docu__verif__73BA3083]
GO

ALTER TABLE [dbo].[users] WITH CHECK ADD CONSTRAINT [FK__users__role_id__3D5E1FD2] FOREIGN KEY([role_id]) REFERENCES [dbo].[roles] ([role_id])
GO
ALTER TABLE [dbo].[users] CHECK CONSTRAINT [FK__users__role_id__3D5E1FD2]
GO
ALTER TABLE [dbo].[users] WITH CHECK ADD CONSTRAINT [FK_users_stations] FOREIGN KEY([station_id]) REFERENCES [dbo].[stations] ([station_id])
GO
ALTER TABLE [dbo].[users] CHECK CONSTRAINT [FK_users_stations]
GO

ALTER TABLE [dbo].[vehicles] WITH CHECK ADD CONSTRAINT [FK_vehicles_model] FOREIGN KEY([model_id]) REFERENCES [dbo].[vehicle_models] ([model_id])
GO
ALTER TABLE [dbo].[vehicles] CHECK CONSTRAINT [FK_vehicles_model]
GO
ALTER TABLE [dbo].[vehicles] WITH CHECK ADD CONSTRAINT [FK_vehicles_station] FOREIGN KEY([station_id]) REFERENCES [dbo].[stations] ([station_id])
GO
ALTER TABLE [dbo].[vehicles] CHECK CONSTRAINT [FK_vehicles_station]
GO

PRINT '>>> Foreign key constraints created successfully.'
GO

-- ===================================================================================
-- STEP 9: Create check constraints
-- ===================================================================================
PRINT '>>> Creating check constraints...'
GO

ALTER TABLE [dbo].[payments] WITH CHECK ADD CONSTRAINT [ck_payments_method] CHECK (([method_type]='bank_transfer' OR [method_type]='vnpay' OR [method_type]='momo' OR [method_type]='wallet' OR [method_type]='cash'))
GO
ALTER TABLE [dbo].[payments] CHECK CONSTRAINT [ck_payments_method]
GO

ALTER TABLE [dbo].[payments] WITH CHECK ADD CONSTRAINT [ck_payments_one_fk] CHECK (([reservation_id] IS NOT NULL AND [rental_id] IS NULL OR [reservation_id] IS NULL AND [rental_id] IS NOT NULL OR [reservation_id] IS NULL AND [rental_id] IS NULL AND [user_id] IS NOT NULL))
GO
ALTER TABLE [dbo].[payments] CHECK CONSTRAINT [ck_payments_one_fk]
GO

ALTER TABLE [dbo].[payments] WITH CHECK ADD CONSTRAINT [ck_payments_transaction_type] CHECK (([transaction_type]='withdrawal' OR [transaction_type]='refund' OR [transaction_type]='deposit' OR [transaction_type]='payment'))
GO
ALTER TABLE [dbo].[payments] CHECK CONSTRAINT [ck_payments_transaction_type]
GO

ALTER TABLE [dbo].[vehicles] WITH CHECK ADD CHECK (([battery_level]>=(0) AND [battery_level]<=(100)))
GO

ALTER TABLE [dbo].[vehicles] WITH CHECK ADD CHECK (([rating]>=(0.0) AND [rating]<=(5.0)))
GO

PRINT '>>> Check constraints created successfully.'
GO

-- ===================================================================================
-- STEP 10: Create indexes
-- ===================================================================================
PRINT '>>> Creating indexes...'
GO

SET ANSI_PADDING ON
GO
CREATE NONCLUSTERED INDEX [IX_otp_codes_email_otp] ON [dbo].[otp_codes]([email] ASC, [otp_code] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX [IX_otp_codes_expires_at] ON [dbo].[otp_codes]([expires_at] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX [idx_payments_user_date] ON [dbo].[payments]([user_id] ASC, [created_at] DESC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO
ALTER TABLE [dbo].[pickup_qr_codes] ADD UNIQUE NONCLUSTERED ([code] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO
ALTER TABLE [dbo].[roles] ADD UNIQUE NONCLUSTERED ([role_name] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO
CREATE NONCLUSTERED INDEX [IX_stations_city] ON [dbo].[stations]([city] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO
ALTER TABLE [dbo].[users] ADD CONSTRAINT [UQ__users__AB6E616486320FD9] UNIQUE NONCLUSTERED ([email] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO
ALTER TABLE [dbo].[users] ADD CONSTRAINT [UQ__users__B43B145FE6A2246F] UNIQUE NONCLUSTERED ([phone] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO
CREATE NONCLUSTERED INDEX [IX_vehicles_model_id] ON [dbo].[vehicles]([model_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX [IX_vehicles_station_id] ON [dbo].[vehicles]([station_id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO
CREATE NONCLUSTERED INDEX [IX_vehicles_status] ON [dbo].[vehicles]([status] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

PRINT '>>> Indexes created successfully.'
GO

-- ===================================================================================
-- STEP 11: Add extended properties (column descriptions)
-- ===================================================================================
PRINT '>>> Adding extended properties...'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Màu sắc của xe' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'vehicles', @level2type=N'COLUMN',@level2name=N'color'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Năm sản xuất của xe' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'vehicles', @level2type=N'COLUMN',@level2name=N'year'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Dung lượng pin của xe (kWh)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'vehicles', @level2type=N'COLUMN',@level2name=N'battery_capacity'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Ngày mua xe' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'vehicles', @level2type=N'COLUMN',@level2name=N'purchase_date'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Ngày hết bảo hành' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'vehicles', @level2type=N'COLUMN',@level2name=N'warranty_expiry'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Ngày bảo dưỡng tiếp theo' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'vehicles', @level2type=N'COLUMN',@level2name=N'next_maintenance_date'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Ghi chú về xe' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'vehicles', @level2type=N'COLUMN',@level2name=N'notes'
GO

PRINT '>>> Extended properties added successfully.'
GO

-- ===================================================================================
-- STEP 12: Set database to READ_WRITE mode
-- ===================================================================================
USE [master]
GO
ALTER DATABASE [EV_Rental] SET READ_WRITE 
GO

PRINT '>>> Database set to READ_WRITE mode.'
GO

-- ===================================================================================
-- SCRIPT COMPLETED SUCCESSFULLY
-- ===================================================================================
PRINT '========================================================================='
PRINT 'Database EV_Rental created and configured successfully!'
PRINT 'You can now use the database with the default admin and staff accounts.'
PRINT 'Admin: admin@ev.local / Password: admin123'
PRINT 'Staff: staff@ev.local / Password: staff123'
PRINT '========================================================================='
GO
