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
GO

-- Insert roles
SET IDENTITY_INSERT [dbo].[roles] ON 
GO
INSERT [dbo].[roles] ([role_id], [role_name], [description], [created_at]) VALUES (1, N'admin', N'System administrator', CAST(N'2025-10-06T15:27:22.100' AS DateTime))
GO
INSERT [dbo].[roles] ([role_id], [role_name], [description], [created_at]) VALUES (2, N'staff', N'Station staff', CAST(N'2025-10-06T15:27:22.100' AS DateTime))
GO
INSERT [dbo].[roles] ([role_id], [role_name], [description], [created_at]) VALUES (3, N'customer', N'End user', CAST(N'2025-10-06T15:27:22.100' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[roles] OFF
GO

PRINT '>>> Roles inserted.'
GO

-- Insert stations
SET IDENTITY_INSERT [dbo].[stations] ON 
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (1, N'District 1 Station', CAST(10.776900 AS Decimal(9, 6)), CAST(106.700900 AS Decimal(9, 6)), N'123 Nguyen Hue Street', N'active', CAST(N'2025-10-14T15:48:36.357' AS DateTime), CAST(N'2025-10-23T20:05:48.593' AS DateTime), N'Ho Chi Minh City', 8, 15, N'["Fast Charging", "Cafe", "Restroom", "Parking"]', CAST(4.80 AS Decimal(3, 2)), N'24/7', 1, N'https://iwater.vn/Image/Picture/New/Quan-1.jpg')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (2, N'District 7 Station', CAST(10.728500 AS Decimal(9, 6)), CAST(106.731700 AS Decimal(9, 6)), N'456 Phu My Hung Boulevard', N'active', CAST(N'2025-10-14T15:48:36.357' AS DateTime), CAST(N'2025-10-22T14:28:42.153' AS DateTime), N'Ho Chi Minh City', 6, 10, N'["Fast Charging", "Shopping Mall", "Restaurant", "ATM"]', CAST(4.60 AS Decimal(3, 2)), N'6:00 AM - 10:00 PM', 1, N'https://cdn.vntrip.vn/cam-nang/wp-content/uploads/2017/09/1-12-e1505536237895.jpg')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (3, N'Airport Station', CAST(10.823100 AS Decimal(9, 6)), CAST(106.629700 AS Decimal(9, 6)), N'Tan Son Nhat International Airport', N'active', CAST(N'2025-10-14T15:48:36.357' AS DateTime), CAST(N'2025-10-22T14:28:42.153' AS DateTime), N'Ho Chi Minh City', 6, 20, N'["Fast Charging", "Airport Shuttle", "24/7 Service", "Lounge"]', CAST(4.90 AS Decimal(3, 2)), N'24/7', 1, N'https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/shutterstock4163434601640951746845-1710837275629.png')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (4, N'District 3 Station', CAST(10.789100 AS Decimal(9, 6)), CAST(106.689700 AS Decimal(9, 6)), N'789 Vo Van Tan Street', N'active', CAST(N'2025-10-14T15:48:36.357' AS DateTime), CAST(N'2025-10-22T14:32:14.333' AS DateTime), N'Ho Chi Minh City', 11, 13, N'["Standard Charging", "Convenience Store", "WiFi"]', CAST(4.40 AS Decimal(3, 2)), N'7:00 AM - 9:00 PM', 0, N'https://nasaland.vn/wp-content/uploads/2022/09/Quan-3-1.jpg')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (5, N'District 5 Station', CAST(10.754600 AS Decimal(9, 6)), CAST(106.667700 AS Decimal(9, 6)), N'321 An Duong Vuong Street', N'active', CAST(N'2025-10-14T15:48:36.357' AS DateTime), CAST(N'2025-10-22T14:28:42.153' AS DateTime), N'Ho Chi Minh City', 7, 15, N'["Fast Charging", "Food Court", "Pharmacy", "Gas Station"]', CAST(4.50 AS Decimal(3, 2)), N'24/7', 1, N'https://cdn.vietnammoi.vn/171464242508312576/2021/6/30/mttq-quan-5-16250453134831325127756.jpg')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (6, N'Binh Thanh Station', CAST(10.797200 AS Decimal(9, 6)), CAST(106.731700 AS Decimal(9, 6)), N'654 Xa Lo Ha Noi Street', N'active', CAST(N'2025-10-14T15:48:36.357' AS DateTime), CAST(N'2025-10-22T14:28:42.153' AS DateTime), N'Ho Chi Minh City', 7, 18, N'["Fast Charging", "Supermarket", "Bank", "Car Wash"]', CAST(4.70 AS Decimal(3, 2)), N'6:00 AM - 11:00 PM', 1, N'https://bizweb.dktcdn.net/thumb/1024x1024/100/414/214/products/toan-thap.jpg?v=1676254526307')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (7, N'Thu Duc Station', CAST(10.740600 AS Decimal(9, 6)), CAST(106.679200 AS Decimal(9, 6)), N'987 Pham The Hien Street', N'active', CAST(N'2025-10-14T15:48:36.357' AS DateTime), CAST(N'2025-10-22T14:32:14.333' AS DateTime), N'Ho Chi Minh City', 15, 17, N'["Standard Charging", "Restaurant", "Restroom"]', CAST(4.20 AS Decimal(3, 2)), N'8:00 AM - 8:00 PM', 0, N'https://quanlykhachsan.edu.vn/wp-content/uploads/2021/12/dia-diem-chup-anh-dep-o-quan-8.jpg')
GO
INSERT [dbo].[stations] ([station_id], [name], [latitude], [longitude], [address], [status], [created_at], [updated_at], [city], [available_vehicles], [total_slots], [amenities], [rating], [operating_hours], [fast_charging], [image]) VALUES (8, N'Phu Nhuan Station', CAST(10.774300 AS Decimal(9, 6)), CAST(106.704600 AS Decimal(9, 6)), N'38 Khanh Hoi Street', N'active', CAST(N'2025-10-14T15:48:36.357' AS DateTime), CAST(N'2025-10-22T14:28:42.153' AS DateTime), N'Ho Chi Minh City', 7, 14, N'["Fast Charging", "Hotel", "Spa", "Shopping", "Fine Dining"]', CAST(4.90 AS Decimal(3, 2)), N'24/7', 1, N'https://static.vinwonders.com/production/quan-4-co-gi-choi-top-banner.jpg')
GO
SET IDENTITY_INSERT [dbo].[stations] OFF
GO

PRINT '>>> Stations inserted.'
GO

-- Insert users (sample data - passwords are hashed)
SET IDENTITY_INSERT [dbo].[users] ON 
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (1, N'admin@ev.local', N'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7', 1, N'System Admin', N'0900000001', NULL, NULL, NULL, N'Administrator', 1, CAST(N'2025-10-06T15:27:22.100' AS DateTime), CAST(N'2025-10-06T15:27:22.100' AS DateTime), NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[users] ([user_id], [email], [password_hash], [role_id], [full_name], [phone], [cccd], [license_number], [address], [position], [is_active], [created_at], [updated_at], [gender], [date_of_birth], [station_id], [wallet_balance]) VALUES (2, N'staff@ev.local', N'dfd48f36338aa36228ebb9e204bba6b4e18db0b623e25c458901edc831fb18e9', 2, N'Default Staff', N'0900000002', NULL, NULL, NULL, N'Staff', 1, CAST(N'2025-10-06T15:27:22.100' AS DateTime), CAST(N'2025-10-06T15:27:22.100' AS DateTime), NULL, NULL, 1, NULL)
GO
SET IDENTITY_INSERT [dbo].[users] OFF
GO

PRINT '>>> Users inserted.'
GO

-- Insert vehicle_models
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'VF3', N'VinFast', N'VF3', N'Hatchback', 2024, 5, N'Smart Connectivity, Air Conditioning, USB Charging, LED Lights', N'VinFast VF3 - Compact city car perfect for urban mobility with modern features and efficient electric drivetrain.', CAST(N'2025-10-14T15:49:32.007' AS DateTime), CAST(N'2025-10-14T15:49:32.007' AS DateTime), N'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), 210)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'VF5', N'VinFast', N'VF5', N'SUV', 2024, 5, N'Premium Sound, Panoramic Roof, Fast Charging, Smart Features', N'VinFast VF5 - Compact SUV with modern design and advanced technology for comfortable family trips.', CAST(N'2025-10-14T15:49:32.007' AS DateTime), CAST(N'2025-10-14T15:49:32.007' AS DateTime), N'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png', CAST(12.00 AS Decimal(10, 2)), CAST(95.00 AS Decimal(10, 2)), 285)
GO
INSERT [dbo].[vehicle_models] ([model_id], [brand], [model_name], [type], [year], [seats], [features], [description], [created_at], [updated_at], [image], [price_per_hour], [price_per_day], [max_range_km]) VALUES (N'EVO200', N'VinFast', N'Evo200', N'Scooter', 2024, 2, N'Smart Key, USB Charging, LED Display, Mobile App', N'VinFast Evo200 - Modern electric scooter with smart connectivity and efficient performance for urban mobility.', CAST(N'2025-10-14T15:49:32.007' AS DateTime), CAST(N'2025-10-14T15:49:32.007' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), 90)
GO

PRINT '>>> Vehicle models inserted.'
GO

-- Insert sample vehicles
SET IDENTITY_INSERT [dbo].[vehicles] ON 
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (1, 1, N'VF3', N'VN1VF3001A0001001', 85, 210, N'available', CAST(8.00 AS Decimal(10, 2)), CAST(60.00 AS Decimal(10, 2)), CAST(4.6 AS Decimal(2, 1)), 145, 78, 5200, CAST(N'2024-01-15' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14T15:49:47.340' AS DateTime), CAST(N'2025-10-14T15:49:47.340' AS DateTime), N'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png', N'50A-001', N'110 kWh/100km', N'District 1 Station', N'Black', 2024, CAST(49.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle in excellent condition', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (2, 2, N'VF5', N'VN1VF5001A0002001', 90, 285, N'available', CAST(12.00 AS Decimal(10, 2)), CAST(95.00 AS Decimal(10, 2)), CAST(4.8 AS Decimal(2, 1)), 189, 123, 4200, CAST(N'2024-01-19' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14T15:49:47.343' AS DateTime), CAST(N'2025-10-14T15:49:47.343' AS DateTime), N'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png', N'51B-001', N'125 kWh/100km', N'District 7 Station', N'Black', 2024, CAST(65.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle in excellent condition', CAST(N'2025-07-14' AS Date))
GO
INSERT [dbo].[vehicles] ([vehicle_id], [station_id], [model_id], [unique_vehicle_id], [battery_level], [max_range_km], [status], [price_per_hour], [price_per_day], [rating], [review_count], [trips], [mileage], [inspection_date], [insurance_expiry], [condition], [created_at], [updated_at], [image], [license_plate], [fuel_efficiency], [location], [color], [year], [battery_capacity], [purchase_date], [warranty_expiry], [next_maintenance_date], [notes], [last_maintenance]) VALUES (3, 5, N'EVO200', N'VN2EVO200A0007005', 90, 90, N'available', CAST(6.00 AS Decimal(10, 2)), CAST(35.00 AS Decimal(10, 2)), CAST(4.7 AS Decimal(2, 1)), 201, 312, 3800, CAST(N'2024-01-19' AS Date), CAST(N'2024-12-31' AS Date), N'excellent', CAST(N'2025-10-14T15:49:47.347' AS DateTime), CAST(N'2025-10-14T15:49:47.347' AS DateTime), N'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png', N'59A-001', N'35 kWh/100km', N'District 5 Station', N'Black', 2024, CAST(50.00 AS Decimal(5, 2)), CAST(N'2025-04-14' AS Date), CAST(N'2028-04-14' AS Date), CAST(N'2026-01-14' AS Date), N'Vehicle in excellent condition', CAST(N'2025-07-14' AS Date))
GO
SET IDENTITY_INSERT [dbo].[vehicles] OFF
GO

PRINT '>>> Vehicles inserted.'
GO

-- ===================================================================================
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
