# Hướng dẫn Cập nhật Trạng thái Xe (Vehicle Status)

## Tổng quan

Hệ thống đã được cấu hình để tự động cập nhật trạng thái (status) của xe trong database khi booking hoặc hủy booking.

## Cách hoạt động

### 1. Khi Booking Xe (Create Reservation)

**Flow:**
1. User booking một xe
2. Tạo reservation trong database
3. **Tự động update vehicle status từ "available" → "pending"**

**Code Location:** `backend/EVRentalApi/Infrastructure/Repositories/ReservationRepository.cs`

```csharp
// After successful reservation creation
var updateVehicleStatusSql = @"
    UPDATE vehicles 
    SET status = 'pending', updated_at = GETDATE()
    WHERE vehicle_id = @VehicleId";
```

### 2. Khi Hủy Booking (Cancel Reservation)

**Flow:**
1. User hủy reservation
2. Update reservation status → "cancelled"
3. **Tự động update vehicle status từ "pending" → "available"**

**Code Location:** `backend/EVRentalApi/Infrastructure/Repositories/ReservationRepository.cs`

```csharp
// After cancelling reservation
var updateVehicleStatusSql = @"
    UPDATE vehicles 
    SET status = 'available', updated_at = GETDATE()
    WHERE vehicle_id = @VehicleId";
```

## Vehicle Status Values

| Status | Mô tả | Khi nào |
|--------|-------|---------|
| `available` | Xe sẵn sàng để thuê | Mặc định khi tạo xe, sau khi hủy booking |
| `pending` | Xe đã được đặt (chưa pickup) | Khi user booking thành công |
| `rented` | Xe đang được thuê | Khi user đã pickup xe |
| `maintenance` | Xe đang bảo trì | Khi staff set maintenance |

## Cách Kiểm tra

### Option 1: Sử dụng SQL Script (Khuyên dùng)

1. Mở SQL Server Management Studio
2. Chạy script: `backend/test_vehicle_status_update.sql`
3. Xem kết quả:
   - Status hiện tại của tất cả xe
   - Join với reservations để xem lịch sử
   - Kiểm tra `updated_at` để biết khi nào status được update

### Option 2: Test Thực tế

1. **Check vehicle status trước khi booking:**
   ```sql
   SELECT vehicle_id, status, updated_at
   FROM vehicles
   WHERE vehicle_id = 1;
   ```
   Expected: `status = 'available'`

2. **Booking xe:**
   - Login vào hệ thống
   - Chọn một xe để booking
   - Complete payment

3. **Check vehicle status sau khi booking:**
   ```sql
   SELECT vehicle_id, status, updated_at
   FROM vehicles
   WHERE vehicle_id = 1;
   ```
   Expected: `status = 'pending'`

4. **Cancel reservation:**
   - Hủy booking
   - Check lại status
   Expected: `status = 'available'`

## Logging

### Backend Logs (Console):

#### Khi Booking thành công:
```
[Reservation] Inserting reservation with StartTime: ..., EndTime: ...
[Reservation] Successfully saved reservation 1 with StartTime: ..., EndTime: ...
[Reservation] Updated vehicle 1 status to 'pending'
```

#### Khi Cancel reservation:
```
[Reservation] Cancelled reservation 1
[Reservation] Updated vehicle 1 status back to 'available'
```

## Database Schema

### Table: `vehicles`
```sql
CREATE TABLE vehicles (
    vehicle_id INT IDENTITY(1,1) PRIMARY KEY,
    station_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'available', -- available, pending, rented, maintenance
    ...
    updated_at DATETIME DEFAULT GETDATE()
);
```

### Table: `reservations`
```sql
CREATE TABLE reservations (
    reservation_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    station_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, expired
    created_at DATETIME DEFAULT GETDATE()
);
```

## Business Logic

### Workflow:

1. **Xe Available** → User booking → **Xe Pending**
2. **Xe Pending** → User pickup → **Xe Rented** (future feature)
3. **Xe Rented** → User return → **Xe Available** (future feature)
4. **Xe Pending** → User cancel → **Xe Available**

### Validation:

- Chỉ cho phép booking xe có status = "available"
- Nếu xe status != "available" → Return error: "Vehicle is not available for booking"
- Automatically update vehicle status khi có transaction

## Example Scenario

### Scenario: User books and cancels

**Step 1: Initial state**
```
Vehicle ID: 1
Status: available
Updated At: 2024-01-15 08:00:00
```

**Step 2: User books vehicle**
```
→ Create reservation
→ Update vehicle status to 'pending'

Vehicle ID: 1
Status: pending
Updated At: 2024-01-15 09:30:00

Reservation ID: 1
Vehicle ID: 1
Status: pending
```

**Step 3: User cancels**
```
→ Update reservation status to 'cancelled'
→ Update vehicle status back to 'available'

Vehicle ID: 1
Status: available
Updated At: 2024-01-15 10:00:00

Reservation ID: 1
Status: cancelled
```

## Troubleshooting

### Nếu vehicle status không được update:

1. **Check Console Logs:**
   - Xem backend console có log message không
   - Check có error message không

2. **Check Database:**
   ```sql
   SELECT * FROM vehicles WHERE vehicle_id = [your_vehicle_id];
   ```
   - Check `updated_at` có thay đổi không
   - Check `status` có đúng không

3. **Check SQL Query:**
   - Ensure vehicle_id exists in vehicles table
   - Ensure reservation_id exists in reservations table

### Nếu vehicle status update sai:

- Check vehicle status values: chỉ accept 'available', 'pending', 'rented', 'maintenance'
- Check reservation status logic: ensure consistency

## Kết luận

✅ **Vehicle status tự động update khi booking**
✅ **Vehicle status tự động update khi cancel**
✅ **Logging đã được thêm để debug**
✅ **Test script đã được tạo để verify**
✅ **Updated_at timestamp được track**

Hệ thống hoàn toàn tự động! Chỉ cần booking và check database để xác nhận!

