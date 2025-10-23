# Hướng dẫn Kiểm tra Lưu Start Time và End Time vào Database

## Tổng quan

Hệ thống đã được cấu hình để tự động lưu `start_time` và `end_time` vào database khi booking xe.

## Cách hoạt động

### 1. Frontend (BookingPage.tsx)
- Khi user chọn ngày và giờ booking
- Frontend tạo `startDateTime` và `endDateTime` từ data form
- Chuyển đổi sang ISO format: `startDateTime.toISOString()` và `endDateTime.toISOString()`
- Gửi request đến API với data:
  ```javascript
  {
    vehicleId: number,
    stationId: number,
    startTime: "2024-01-15T10:00:00.000Z",
    endTime: "2024-01-15T18:00:00.000Z"
  }
  ```

### 2. Backend (ReservationRepository.cs)
- Nhận request từ frontend
- Chuyển đổi ISO string thành DateTime object
- Lưu vào database với SQL:
  ```sql
  INSERT INTO reservations (
    user_id, vehicle_id, station_id, 
    start_time, end_time, status, created_at
  )
  VALUES (@UserId, @VehicleId, @StationId, @StartTime, @EndTime, 'pending', GETDATE())
  ```

### 3. Database (EV_Rental.reservations)
- SQL Server tự động lưu DATETIME values
- Columns: `start_time` và `end_time` kiểu DATETIME
- AUTO-GENERATE `reservation_id` với IDENTITY(1,1)

## Cách Kiểm tra

### Option 1: Sử dụng SQL Script (Khuyên dùng)

1. Mở SQL Server Management Studio
2. Chạy script: `backend/test_reservation_data.sql`
3. Xem kết quả:
   - Tất cả reservations với start_time và end_time
   - Duration được tính tự động
   - Format date đẹp và dễ đọc

### Option 2: Kiểm tra trong Visual Studio Code

1. Mở terminal trong backend folder
2. Chạy lệnh:
   ```bash
   sqlcmd -S NTSONG\NTSONG -d EV_Rental -U sa -P 12345 -i backend/test_reservation_data.sql
   ```

### Option 3: Test Thực tế

1. **Chạy Backend:**
   ```bash
   cd backend/EVRentalApi
   dotnet run
   ```

2. **Chạy Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Booking một xe:**
   - Login vào hệ thống
   - Chọn một xe để booking
   - Chọn ngày và giờ
   - Complete payment

4. **Check Console Logs:**
   - Frontend console: Sẽ hiển thị data được gửi
   - Backend console: Sẽ hiển thị data được lưu

5. **Kiểm tra Database:**
   ```sql
   SELECT TOP 5 
       reservation_id,
       start_time,
       end_time,
       status,
       created_at
   FROM reservations
   ORDER BY created_at DESC;
   ```

## Logging đã được thêm

### Frontend Logs:
- `[Booking] Creating reservation with data:` - Data được gửi
- `[Booking] Start Time:` - ISO string của start time
- `[Booking] End Time:` - ISO string của end time
- `[Booking] Saved Start Time:` - Value được lưu trong DB
- `[Booking] Saved End Time:` - Value được lưu trong DB

### Backend Logs:
- `[Reservation] Inserting reservation with StartTime: ... EndTime: ...` - Data trước khi insert
- `[Reservation] Successfully saved reservation X with StartTime: ... EndTime: ...` - Data sau khi insert

## Troubleshooting

### Nếu start_time hoặc end_time không được lưu:

1. **Check Console Logs:**
   - Xem frontend có gửi đúng data không
   - Xem backend có nhận được data không

2. **Check Database:**
   ```sql
   SELECT COLUMN_NAME, DATA_TYPE 
   FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_NAME = 'reservations';
   ```
   - Đảm bảo `start_time` và `end_time` có kiểu DATETIME

3. **Check API Response:**
   - Open browser DevTools → Network tab
   - Tìm POST request to `/api/reservations`
   - Check request body và response

### Nếu DateTime format không đúng:

- Frontend gửi ISO format: `2024-01-15T10:00:00.000Z`
- Backend nhận và convert tự động sang DateTime
- SQL Server lưu dưới dạng DATETIME

## Example Data

### Input (Frontend):
```json
{
  "vehicleId": 1,
  "stationId": 1,
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T18:00:00.000Z"
}
```

### Database Record:
```
reservation_id: 1
user_id: 5
vehicle_id: 1
station_id: 1
start_time: 2024-01-15 10:00:00.000
end_time: 2024-01-15 18:00:00.000
status: pending
created_at: 2024-01-15 09:30:00.000
```

## Kết luận

✅ **start_time và end_time đã được lưu vào database**
✅ **Logging đã được thêm để debug**
✅ **Test script đã được tạo để verify**
✅ **System tự động generate reservation_id**

Chỉ cần booking một xe và check database để xác nhận!

