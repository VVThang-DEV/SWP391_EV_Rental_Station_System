# Create FINAL complete SQL script with proper structure
# Structure: DROP DB -> CREATE DB -> CREATE TABLES -> INSERT DATA -> ADD CONSTRAINTS -> ADD INDEXES

$OutputFile = "EV_Rental_FINAL_Complete.sql"

Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "Creating FINAL COMPLETE SQL script (proper order)..." -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Green

# Read the original schema file
$schemaContent = Get-Content "EV_Rental_Full_Script.sql" -Raw

# 1. Get header, DROP, CREATE DB, config (lines 1 to start of CREATE TABLES)
$createTablesStart = $schemaContent.IndexOf("-- ===================================================================================`r`n-- STEP 5: Create all tables")
$part1 = $schemaContent.Substring(0, $createTablesStart)

# 2. Get CREATE TABLES section (from STEP 5 to before old INSERT statements)
$insertStart = $schemaContent.IndexOf("-- ===================================================================================`r`n-- STEP 6: Add default constraints")
$part2_tables = $schemaContent.Substring($createTablesStart, $insertStart - $createTablesStart)

# 3. Get DEFAULT CONSTRAINTS section
$dataInsertOldStart = $schemaContent.IndexOf("-- ===================================================================================`r`n-- STEP 7: Insert data into tables")
$part3_defaults = $schemaContent.Substring($insertStart, $dataInsertOldStart - $insertStart)

# 4. Skip old INSERT section, get FOREIGN KEYS
$foreignKeysStart = $schemaContent.IndexOf("-- ===================================================================================`r`n-- STEP 8: Create foreign key constraints")
$checkConstraintsStart = $schemaContent.IndexOf("-- ===================================================================================`r`n-- STEP 9: Create check constraints")
$part4_foreignKeys = $schemaContent.Substring($foreignKeysStart, $checkConstraintsStart - $foreignKeysStart)

# 5. Get CHECK CONSTRAINTS
$indexesStart = $schemaContent.IndexOf("-- ===================================================================================`r`n-- STEP 10: Create indexes")
$part5_checkConstraints = $schemaContent.Substring($checkConstraintsStart, $indexesStart - $checkConstraintsStart)

# 6. Get INDEXES
$extendedPropsStart = $schemaContent.IndexOf("-- ===================================================================================`r`n-- STEP 11: Add extended properties")
$part6_indexes = $schemaContent.Substring($indexesStart, $extendedPropsStart - $indexesStart)

# 7. Get EXTENDED PROPERTIES
$finalStepStart = $schemaContent.IndexOf("-- ===================================================================================`r`n-- STEP 12: Set database to READ_WRITE mode")
$part7_extendedProps = $schemaContent.Substring($extendedPropsStart, $finalStepStart - $extendedPropsStart)

# Now build the final file
$part1 | Out-File -FilePath $OutputFile -Encoding UTF8

# Add CREATE TABLES
$part2_tables | Add-Content -Path $OutputFile -NoNewline

# Add DEFAULT CONSTRAINTS
$part3_defaults | Add-Content -Path $OutputFile -NoNewline

Write-Host "Schema structure added (DB, Tables, Defaults)" -ForegroundColor Yellow

# Now add INSERT DATA from our export file
$separator = @"

-- ===================================================================================
-- DATA INSERTION - ALL TABLES WITH COMPLETE DATA
-- ===================================================================================

"@
$separator | Add-Content -Path $OutputFile

$dataContent = Get-Content "EV_Rental_Full_Data_Complete.sql" -Raw

# Get only the INSERT statements (skip header)
$dataStart = $dataContent.IndexOf("-- Disable constraints")
$dataEnd = $dataContent.IndexOf("-- Re-enable all constraints")
$dataInserts = $dataContent.Substring($dataStart, $dataEnd - $dataStart)

$dataInserts | Add-Content -Path $OutputFile -NoNewline

Write-Host "Data inserted (all $tables with complete records)" -ForegroundColor Yellow

# Add FOREIGN KEYS
"`n" | Add-Content -Path $OutputFile
$part4_foreignKeys | Add-Content -Path $OutputFile -NoNewline

Write-Host "Foreign key constraints added" -ForegroundColor Yellow

# Add CHECK CONSTRAINTS
$part5_checkConstraints | Add-Content -Path $OutputFile -NoNewline

Write-Host "Check constraints added" -ForegroundColor Yellow

# Add INDEXES
$part6_indexes | Add-Content -Path $OutputFile -NoNewline

Write-Host "Indexes added" -ForegroundColor Yellow

# Add EXTENDED PROPERTIES
$part7_extendedProps | Add-Content -Path $OutputFile -NoNewline

Write-Host "Extended properties added" -ForegroundColor Yellow

# Re-enable constraints after insert
$reEnableConstraints = @"

-- ===================================================================================
-- Re-enable all constraints after data insertion
-- ===================================================================================
PRINT '>>> Re-enabling constraints...'
EXEC sp_msforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL'
GO

"@
$reEnableConstraints | Add-Content -Path $OutputFile

# Add final section
$footer = @"
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
PRINT 'Database EV_Rental created and configured successfully with ALL DATA!'
PRINT ''
PRINT 'Summary of imported data:'
PRINT '  - 3 Roles'
PRINT '  - 8 Stations'
PRINT '  - 13 Vehicle Models (VF3, VF5, VF6, VF7, VF8, VF9, EVO200, etc.)'
PRINT '  - 15 Users (including admins, staff, customers)'
PRINT '  - 79 Vehicles across all stations'
PRINT '  - 15 User Documents'
PRINT '  - 37 Reservations'
PRINT '  - 98 Payments'
PRINT ''
PRINT 'Default login accounts:'
PRINT '  Admin: admin@ev.local / admin123'
PRINT '  Staff: staff@ev.local / staff123'
PRINT ''
PRINT 'You can now use this database on any computer!'
PRINT '========================================================================='
GO
"@

$footer | Add-Content -Path $OutputFile

# Fix True/False to 1/0
Write-Host "Fixing bit fields..." -ForegroundColor Yellow
$finalContent = Get-Content $OutputFile -Raw
$finalContent = $finalContent.Replace(', True,', ', 1,').Replace(', False,', ', 0,').Replace(', True)', ', 1)').Replace(', False)', ', 0)')
$finalContent | Out-File -FilePath $OutputFile -Encoding UTF8

$finalSize = (Get-Item $OutputFile).Length

Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "✓ FINAL COMPLETE SCRIPT CREATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "File: $OutputFile" -ForegroundColor Yellow
Write-Host "Size: $([math]::Round($finalSize/1KB, 2)) KB" -ForegroundColor Yellow
Write-Host ""
Write-Host "Script includes (in correct order):" -ForegroundColor Cyan
Write-Host "  1. DROP and CREATE database" -ForegroundColor White
Write-Host "  2. CREATE all tables with proper schema" -ForegroundColor White
Write-Host "  3. ADD default constraints" -ForegroundColor White
Write-Host "  4. INSERT ALL data (roles, stations, models, users, vehicles, documents, reservations, payments)" -ForegroundColor White
Write-Host "  5. CREATE foreign key constraints" -ForegroundColor White
Write-Host "  6. CREATE check constraints" -ForegroundColor White
Write-Host "  7. CREATE indexes for performance" -ForegroundColor White
Write-Host "  8. ADD extended properties" -ForegroundColor White
Write-Host ""
Write-Host "✓ Ready to execute on any SQL Server!" -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Green

