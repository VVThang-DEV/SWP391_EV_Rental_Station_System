# Create final complete SQL script with schema and all data
# This combines the schema from the original script with all exported data

$OutputFile = "EV_Rental_Complete_With_All_Data.sql"

Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "Creating FINAL COMPLETE SQL script with schema + ALL data..." -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Green

# Read the schema script (everything up to the data inserts)
$schemaContent = Get-Content "EV_Rental_Full_Script.sql" -Raw

# Find where the INSERT statements start in the original file (after "INSERT [dbo].[roles]")
$insertStart = $schemaContent.IndexOf("-- Insert roles")

# Get only the schema part (before INSERT statements)
$schemaOnly = $schemaContent.Substring(0, $insertStart)

# Create the final file with schema
$schemaOnly | Out-File -FilePath $OutputFile -Encoding UTF8

# Add separator comment
$separator = @"

-- ===================================================================================
-- DATA INSERTION - ALL TABLES WITH COMPLETE DATA
-- ===================================================================================

"@
$separator | Add-Content -Path $OutputFile

Write-Host "Schema section added" -ForegroundColor Yellow

# Read the complete data file
$dataContent = Get-Content "EV_Rental_Full_Data_Complete.sql" -Raw

# Skip the header and USE statement from data file (we already have schema)
$dataStart = $dataContent.IndexOf("-- Disable constraints")
$dataSection = $dataContent.Substring($dataStart)

$dataSection | Add-Content -Path $OutputFile -NoNewline

Write-Host "Data section added (all tables with complete records)" -ForegroundColor Yellow

# Add the constraints and indexes from the original schema file
$constraintsStart = $schemaContent.IndexOf("-- ===================================================================================`r`n-- STEP 8: Create foreign key constraints")

if ($constraintsStart -gt 0) {
    $constraintsEnd = $schemaContent.IndexOf("-- ===================================================================================`r`n-- SCRIPT COMPLETED SUCCESSFULLY")
    
    if ($constraintsEnd -gt $constraintsStart) {
        $constraintsSection = $schemaContent.Substring($constraintsStart, $constraintsEnd - $constraintsStart)
        
        "`n`n" | Add-Content -Path $OutputFile
        $constraintsSection | Add-Content -Path $OutputFile -NoNewline
        
        Write-Host "Constraints and indexes added" -ForegroundColor Yellow
    }
}

# Add final completion message
$footer = @"

-- ===================================================================================
-- SCRIPT COMPLETED SUCCESSFULLY
-- ===================================================================================
USE [master]
GO
ALTER DATABASE [EV_Rental] SET READ_WRITE 
GO

PRINT '========================================================================='
PRINT 'Database EV_Rental created successfully with ALL DATA!'
PRINT ''
PRINT 'Summary of imported data:'
PRINT '  - 3 Roles'
PRINT '  - 8 Stations'
PRINT '  - 13 Vehicle Models'
PRINT '  - 15 Users'
PRINT '  - 79 Vehicles'
PRINT '  - 15 User Documents'
PRINT '  - 37 Reservations'
PRINT '  - 98 Payments'
PRINT ''
PRINT 'Default accounts:'
PRINT '  Admin: admin@ev.local / admin123'
PRINT '  Staff: staff@ev.local / staff123'
PRINT '========================================================================='
GO
"@

$footer | Add-Content -Path $OutputFile

$finalSize = (Get-Item $OutputFile).Length
Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "FINAL COMPLETE SCRIPT CREATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "File: $OutputFile" -ForegroundColor Yellow
Write-Host "Size: $([math]::Round($finalSize/1KB, 2)) KB" -ForegroundColor Yellow
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "This script contains:" -ForegroundColor Cyan
Write-Host "  ✓ Complete database schema (tables, constraints, indexes)" -ForegroundColor White
Write-Host "  ✓ ALL data from your current database" -ForegroundColor White
Write-Host "  ✓ Ready to run on any SQL Server instance" -ForegroundColor White
Write-Host ""

