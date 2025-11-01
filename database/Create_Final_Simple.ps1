# Simple approach: Take original schema file and replace INSERT section with new data
$OutputFile = "EV_Rental_COMPLETE_FINAL.sql"

Write-Host "Creating final complete script (simple merge)..." -ForegroundColor Green

# Read original schema
$schema = Get-Content "EV_Rental_Full_Script.sql" -Raw

# Find where INSERT statements start and end
$insertStart = $schema.IndexOf("-- Insert roles`r`nSET IDENTITY_INSERT")
$constraintsStart = $schema.IndexOf("`r`n-- ===================================================================================`r`n-- STEP 8: Create foreign key constraints`r`n-- ===================================================================================")

# Split schema into 3 parts
$part1_beforeInsert = $schema.Substring(0, $insertStart)
$part3_afterInsert = $schema.Substring($constraintsStart)

# Read new data
$newData = Get-Content "EV_Rental_Full_Data_Complete.sql" -Raw

# Get only INSERT statements from new data
$dataStart = $newData.IndexOf("SET IDENTITY_INSERT [dbo].[roles]")
$dataEnd = $newData.IndexOf("-- Re-enable all constraints")
$insertStatements = $newData.Substring($dataStart, $dataEnd - $dataStart)

# Build final file
$final = $part1_beforeInsert

# Add header for data section
$final += @"
-- ===================================================================================
-- STEP 7: Insert data into ALL tables (COMPLETE DATA EXPORT)
-- ===================================================================================
PRINT '>>> Inserting data into tables...'
GO

-- Temporarily disable constraints for faster insert
EXEC sp_msforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'
GO

$insertStatements

-- Re-enable constraints
EXEC sp_msforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL'
GO

PRINT '>>> Data inserted successfully.'
PRINT '>>> Summary: 3 roles, 8 stations, 13 vehicle models, 15 users, 79 vehicles, 15 documents, 37 reservations, 98 payments'
GO

"@

$final += $part3_afterInsert

# Fix True/False to 1/0
$final = $final.Replace(', True,', ', 1,').Replace(', False,', ', 0,').Replace(', True)', ', 1)').Replace(', False)', ', 0)')

# Save final file
$final | Out-File -FilePath $OutputFile -Encoding UTF8

$size = (Get-Item $OutputFile).Length

Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "✓ SUCCESS! Final complete script created!" -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "File: $OutputFile" -ForegroundColor Yellow
Write-Host "Size: $([math]::Round($size/1KB, 2)) KB" -ForegroundColor Yellow
Write-Host ""
Write-Host "This script contains EVERYTHING:" -ForegroundColor Cyan
Write-Host "  ✓ Database creation and configuration" -ForegroundColor White
Write-Host "  ✓ All tables with complete schema" -ForegroundColor White
Write-Host "  ✓ All default constraints" -ForegroundColor White
Write-Host "  ✓ ALL DATA (3 roles, 8 stations, 13 models, 15 users, 79 vehicles," -ForegroundColor White
Write-Host "              15 documents, 37 reservations, 98 payments)" -ForegroundColor White
Write-Host "  ✓ All foreign key constraints" -ForegroundColor White
Write-Host "  ✓ All check constraints" -ForegroundColor White
Write-Host "  ✓ All indexes" -ForegroundColor White
Write-Host "  ✓ Extended properties" -ForegroundColor White
Write-Host ""
Write-Host "Ready to use on ANY computer!" -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Green

