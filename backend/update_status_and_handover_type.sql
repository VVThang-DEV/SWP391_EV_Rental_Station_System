/*
Purpose:
- Allow vehicle lifecycle without new tables by extending allowed status values
- Allow recording post-return checks as handovers of type 'qc'

Target: Microsoft SQL Server (T-SQL)
This script is idempotent: it safely drops and recreates only relevant check constraints.
*/

SET NOCOUNT ON;
PRINT '--- Begin: Update vehicle status values and handover types ---';

/* 1) Ensure vehicles.status supports new values */
IF EXISTS (
    SELECT 1
    FROM sys.columns c
    JOIN sys.tables t ON t.object_id = c.object_id
    WHERE t.name = 'vehicles' AND c.name = 'status'
)
BEGIN
    -- Optional: widen column to be safe (no-op if already large enough)
    DECLARE @needsAlter BIT = 0;
    SELECT @needsAlter = CASE WHEN c.max_length < 50 THEN 1 ELSE 0 END
    FROM sys.columns c
    JOIN sys.tables t ON t.object_id = c.object_id
    WHERE t.name = 'vehicles' AND c.name = 'status';

    IF (@needsAlter = 1)
    BEGIN
        PRINT 'Altering vehicles.status to VARCHAR(50)';
        ALTER TABLE dbo.vehicles ALTER COLUMN status VARCHAR(50) NULL;
    END

    -- Drop existing check constraint(s) on vehicles.status if any
    DECLARE @chkName NVARCHAR(128);
    SELECT TOP 1 @chkName = cc.name
    FROM sys.check_constraints cc
    JOIN sys.objects o ON cc.parent_object_id = o.object_id
    CROSS APPLY (SELECT OBJECT_NAME(cc.parent_object_id) AS tbl) d
    WHERE d.tbl = 'vehicles'
      AND cc.definition LIKE '%[status]%' -- heuristic
    ORDER BY cc.name;

    IF (@chkName IS NOT NULL)
    BEGIN
        PRINT 'Dropping existing check constraint on vehicles.status: ' + @chkName;
        DECLARE @escaped1 NVARCHAR(300) = REPLACE(@chkName, ']', ']]');
        DECLARE @sql1 NVARCHAR(MAX) = N'ALTER TABLE dbo.vehicles DROP CONSTRAINT [' + @escaped1 + N'];';
        EXEC(@sql1);
    END

    -- Recreate check constraint with extended statuses
    PRINT 'Creating check constraint CK_vehicles_status on vehicles.status';
    ALTER TABLE dbo.vehicles WITH NOCHECK
    ADD CONSTRAINT CK_vehicles_status CHECK (
        status IN (
            'available',
            'rented',
            'pending',
            'awaiting_processing', -- newly used when return detects damages
            'maintenance',         -- optional: when under active repair
            'out_of_service'       -- existing/optional
        )
    );
END
ELSE
BEGIN
    PRINT 'Table dbo.vehicles or column status not found. Skipping vehicle status changes.';
END

/* 2) Allow handovers.[type] to include "qc" for post-return checks */
IF EXISTS (
    SELECT 1
    FROM sys.columns c
    JOIN sys.tables t ON t.object_id = c.object_id
    WHERE t.name = 'handovers' AND c.name = 'type'
)
BEGIN
    -- Widen column just in case
    DECLARE @needsAlter2 BIT = 0;
    SELECT @needsAlter2 = CASE WHEN c.max_length < 20 THEN 1 ELSE 0 END
    FROM sys.columns c
    JOIN sys.tables t ON t.object_id = c.object_id
    WHERE t.name = 'handovers' AND c.name = 'type';

    IF (@needsAlter2 = 1)
    BEGIN
        PRINT 'Altering handovers.type to VARCHAR(20)';
        ALTER TABLE dbo.handovers ALTER COLUMN [type] VARCHAR(20) NOT NULL;
    END

    -- Drop existing check constraint(s) on handovers.type if any
    DECLARE @chkName2 NVARCHAR(128);
    SELECT TOP 1 @chkName2 = cc.name
    FROM sys.check_constraints cc
    JOIN sys.objects o ON cc.parent_object_id = o.object_id
    CROSS APPLY (SELECT OBJECT_NAME(cc.parent_object_id) AS tbl) d
    WHERE d.tbl = 'handovers'
      AND cc.definition LIKE '%[type]%' -- heuristic
    ORDER BY cc.name;

    IF (@chkName2 IS NOT NULL)
    BEGIN
        PRINT 'Dropping existing check constraint on handovers.type: ' + @chkName2;
        DECLARE @escaped2 NVARCHAR(300) = REPLACE(@chkName2, ']', ']]');
        DECLARE @sql2 NVARCHAR(MAX) = N'ALTER TABLE dbo.handovers DROP CONSTRAINT [' + @escaped2 + N'];';
        EXEC(@sql2);
    END

    -- Recreate with allowed types including qc
    PRINT 'Creating check constraint CK_handovers_type on handovers.type';
    ALTER TABLE dbo.handovers WITH NOCHECK
    ADD CONSTRAINT CK_handovers_type CHECK (
        [type] IN ('pickup', 'return', 'qc')
    );
END
ELSE
BEGIN
    PRINT 'Table dbo.handovers or column type not found. Skipping handover type changes.';
END

/* 3) Optional: set NULL/empty statuses to 'available' to keep data consistent */
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'vehicles')
BEGIN
    UPDATE dbo.vehicles SET status = 'available' WHERE status IS NULL OR LTRIM(RTRIM(status)) = '';
END

PRINT '--- Done ---';
GO
