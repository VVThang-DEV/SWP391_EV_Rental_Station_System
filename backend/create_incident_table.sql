-- ===================================================================================
-- Create incidents table for customer incident reports
-- ===================================================================================

USE [EV_Rental]
GO

-- Table: incidents
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[incidents]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[incidents](
        [incident_id] [int] IDENTITY(1,1) NOT NULL,
        [reservation_id] [int] NULL,
        [vehicle_id] [int] NOT NULL,
        [station_id] [int] NOT NULL,
        [user_id] [int] NOT NULL,
        [type] [varchar](50) NOT NULL, -- 'accident', 'breakdown', 'damage', 'theft', 'other'
        [description] [nvarchar](max) NOT NULL,
        [status] [varchar](20) NOT NULL DEFAULT 'reported', -- 'reported', 'in_progress', 'resolved'
        [priority] [varchar](20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
        [reported_at] [datetime] NOT NULL DEFAULT GETDATE(),
        [resolved_at] [datetime] NULL,
        [staff_notes] [nvarchar](max) NULL,
        [handled_by] [int] NULL, -- staff user_id who is handling
        [created_at] [datetime] NULL DEFAULT GETDATE(),
        [updated_at] [datetime] NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_incidents] PRIMARY KEY CLUSTERED ([incident_id] ASC)
        WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    
    PRINT '>>> Table incidents created successfully.'
END
ELSE
BEGIN
    PRINT '>>> Table incidents already exists.'
END
GO

-- Add foreign key constraints
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_incidents_users')
BEGIN
    ALTER TABLE [dbo].[incidents]
    ADD CONSTRAINT [FK_incidents_users] FOREIGN KEY([user_id])
    REFERENCES [dbo].[users] ([user_id])
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
    PRINT '>>> Foreign key FK_incidents_users added.'
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_incidents_vehicles')
BEGIN
    ALTER TABLE [dbo].[incidents]
    ADD CONSTRAINT [FK_incidents_vehicles] FOREIGN KEY([vehicle_id])
    REFERENCES [dbo].[vehicles] ([vehicle_id])
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
    PRINT '>>> Foreign key FK_incidents_vehicles added.'
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_incidents_stations')
BEGIN
    ALTER TABLE [dbo].[incidents]
    ADD CONSTRAINT [FK_incidents_stations] FOREIGN KEY([station_id])
    REFERENCES [dbo].[stations] ([station_id])
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
    PRINT '>>> Foreign key FK_incidents_stations added.'
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_incidents_reservations')
BEGIN
    ALTER TABLE [dbo].[incidents]
    ADD CONSTRAINT [FK_incidents_reservations] FOREIGN KEY([reservation_id])
    REFERENCES [dbo].[reservations] ([reservation_id])
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
    PRINT '>>> Foreign key FK_incidents_reservations added.'
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_incidents_handled_by')
BEGIN
    ALTER TABLE [dbo].[incidents]
    ADD CONSTRAINT [FK_incidents_handled_by] FOREIGN KEY([handled_by])
    REFERENCES [dbo].[users] ([user_id])
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
    PRINT '>>> Foreign key FK_incidents_handled_by added.'
END
GO

-- Create indexes for better query performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_incidents_status' AND object_id = OBJECT_ID('dbo.incidents'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_incidents_status] ON [dbo].[incidents]
    ([status] ASC)
    INCLUDE([incident_id], [type], [priority], [reported_at])
    PRINT '>>> Index IX_incidents_status created.'
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_incidents_station_id' AND object_id = OBJECT_ID('dbo.incidents'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_incidents_station_id] ON [dbo].[incidents]
    ([station_id] ASC, [status] ASC)
    INCLUDE([incident_id], [type], [priority], [reported_at])
    PRINT '>>> Index IX_incidents_station_id created.'
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_incidents_user_id' AND object_id = OBJECT_ID('dbo.incidents'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_incidents_user_id] ON [dbo].[incidents]
    ([user_id] ASC)
    PRINT '>>> Index IX_incidents_user_id created.'
END
GO

PRINT '>>> Incident table setup completed successfully.'
GO

