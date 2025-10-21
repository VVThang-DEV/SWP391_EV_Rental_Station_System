# Test Frontend Admin Dashboard
Write-Host "=== Frontend Test Instructions ===" -ForegroundColor Green
Write-Host "1. Mở trình duyệt và vào: http://localhost:5173" -ForegroundColor Yellow
Write-Host "2. Đăng nhập với tài khoản admin:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   📍 Admin Account:" -ForegroundColor Cyan
Write-Host "      Email: admin@ev.local" -ForegroundColor White
Write-Host "      Password: Admin@123" -ForegroundColor White
Write-Host ""
Write-Host "3. Vào Admin Dashboard và test Register New Vehicle:" -ForegroundColor Yellow
Write-Host "   ✅ Chọn model xe (VD: VF3)" -ForegroundColor Green
Write-Host "   ✅ Nhập License Plate (VD: TEST-456)" -ForegroundColor Green
Write-Host "   ✅ Nhập VIN Number (VD: TEST-VIN-456789)" -ForegroundColor Green
Write-Host "   ✅ Điền các thông tin khác (màu, năm, pin, v.v.)" -ForegroundColor Green
Write-Host "   ✅ Click 'Register Vehicle'" -ForegroundColor Green
Write-Host ""
Write-Host "4. Kiểm tra kết quả:" -ForegroundColor Yellow
Write-Host "   ✅ Thông báo thành công (không có lỗi)" -ForegroundColor Green
Write-Host "   ✅ Form được reset" -ForegroundColor Green
Write-Host "   ✅ Xe được lưu vào database" -ForegroundColor Green
Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Green
