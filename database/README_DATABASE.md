# 🗄️ EV Rental Database - Complete Script

## 📋 Thông Tin Database

File SQL hoàn chỉnh để tạo database EV_Rental với **TẤT CẢ DỮ LIỆU** từ hệ thống hiện tại.

### 📁 File Chính

**`EV_Rental_COMPLETE_DATABASE.sql`** - **205.67 KB**

## 📊 Dữ Liệu Bao Gồm

✅ **3 Roles** (admin, staff, customer)  
✅ **8 Stations** (các trạm ở TP.HCM)  
✅ **13 Vehicle Models** (VF3, VF5, VF6, VF7, VF8, VF9, EVO200, v.v.)  
✅ **15 Users** (admin, staff, customers)  
✅ **79 Vehicles** (phân bổ qua các trạm)  
✅ **15 User Documents** (tài liệu người dùng)  
✅ **37 Reservations** (đặt chỗ)  
✅ **98 Payments** (thanh toán)

## 🎯 Cấu Trúc Database

### 17 Bảng
1. `roles` - Vai trò người dùng
2. `stations` - Trạm sạc/cho thuê
3. `users` - Người dùng hệ thống
4. `user_documents` - Giấy tờ người dùng
5. `vehicle_models` - Mẫu xe
6. `vehicles` - Xe điện
7. `reservations` - Đặt chỗ
8. `rentals` - Thuê xe
9. `payments` - Thanh toán
10. `battery_logs` - Nhật ký pin
11. `contracts` - Hợp đồng
12. `handovers` - Bàn giao xe
13. `maintenance_records` - Bảo trì
14. `notifications` - Thông báo
15. `otp_codes` - Mã OTP
16. `pickup_qr_codes` - Mã QR nhận xe
17. `reports` - Báo cáo

### Các Thành Phần Đầy Đủ
- ✅ Database creation và configuration
- ✅ Tables với đầy đủ schema
- ✅ Default constraints
- ✅ **TẤT CẢ DỮ LIỆU** (INSERT statements)
- ✅ Foreign key constraints
- ✅ Check constraints
- ✅ Indexes để tối ưu hiệu suất
- ✅ Extended properties

## 🚀 Cách Sử Dụng

### Trên Máy Tính Hiện Tại

1. Mở **SQL Server Management Studio (SSMS)**
2. Connect đến SQL Server instance
3. Menu: **File** → **Open** → **File**
4. Chọn file `EV_Rental_COMPLETE_DATABASE.sql`
5. Click **Execute (F5)** hoặc nút ▶️
6. Chờ script chạy xong (~30 giây - 1 phút)
7. ✅ Xong! Database đã được tạo với đầy đủ dữ liệu

### Trên Máy Tính Khác

1. **Copy file** `EV_Rental_COMPLETE_DATABASE.sql` sang máy mới
2. Đảm bảo máy đã cài **SQL Server** (bất kỳ phiên bản nào)
3. Mở **SSMS** và connect
4. Thực hiện các bước như trên
5. ✅ Database sẵn sàng sử dụng!

### Sử Dụng Command Line (sqlcmd)

```bash
sqlcmd -S localhost -i EV_Rental_COMPLETE_DATABASE.sql
```

## 🔐 Tài Khoản Mặc Định

### Admin
- **Email:** `admin@ev.local`
- **Password:** `admin123`
- **Role:** Administrator (toàn quyền)

### Staff
- **Email:** `staff@ev.local`
- **Password:** `staff123`
- **Role:** Station Staff

## ⚙️ Yêu Cầu Hệ Thống

- **SQL Server:** 2016 hoặc mới hơn (khuyến nghị 2019+)
- **Compatibility Level:** 160 (SQL Server 2022)
- **Disk Space:** ~10 MB cho database
- **Memory:** Tối thiểu 512 MB RAM available

## 📝 Lưu Ý Quan Trọng

1. **Xóa Database Cũ:** Script sẽ **TỰ ĐỘNG XÓA** database `EV_Rental` nếu đã tồn tại
2. **Backup:** Nếu bạn có database cũ quan trọng, hãy backup trước!
3. **Quyền Truy Cập:** Cần quyền CREATE DATABASE trên SQL Server
4. **Portable:** Script không dùng đường dẫn cố định, có thể chạy mọi nơi

## 🎨 Tính Năng Đặc Biệt

### Auto-Configuration
- Tự động cấu hình database properties tối ưu
- Enable Query Store để theo dõi performance
- Thiết lập Recovery Mode và Collation
- Tối ưu hóa indexes và statistics

### Data Integrity
- Foreign key constraints đảm bảo tính toàn vẹn
- Check constraints kiểm tra giá trị hợp lệ
- Unique constraints cho email, phone, etc.
- Default values cho các trường thường dùng

### Performance
- Indexes được tạo cho các cột hay query
- Statistics tự động cập nhật
- Query optimization hints
- Proper data types và constraints

## 🛠️ Troubleshooting

### Lỗi: "Database already exists"
**Giải pháp:** Script sẽ tự động xóa. Nếu vẫn lỗi, chạy:
```sql
USE master;
GO
ALTER DATABASE EV_Rental SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE EV_Rental;
GO
```

### Lỗi: "Permission denied"
**Giải pháp:** Đảm bảo account có quyền `dbcreator` hoặc là `sysadmin`.

### Lỗi: "Insufficient disk space"
**Giải pháp:** Cần ít nhất 50 MB trống trên ổ đĩa.

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. SQL Server đang chạy
2. Có quyền CREATE DATABASE
3. Đủ dung lượng ổ đĩa
4. File SQL không bị corrupt

## 📅 Phiên Bản

- **Version:** 1.0
- **Generated:** 31/10/2025
- **Database:** EV_Rental
- **Total Size:** ~205 KB script, ~10 MB database

## ✅ Checklist Sau Khi Chạy Script

- [ ] Database `EV_Rental` đã được tạo
- [ ] Tất cả 17 tables tồn tại
- [ ] Có 3 roles, 8 stations, 79 vehicles
- [ ] Login được bằng admin@ev.local / admin123
- [ ] Cấu hình connection string trong application
- [ ] Test kết nối từ ứng dụng

---

**🎉 Chúc bạn triển khai thành công!**


