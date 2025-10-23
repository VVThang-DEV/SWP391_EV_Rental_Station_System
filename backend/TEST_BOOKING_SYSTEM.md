# Hướng dẫn Test Booking System

## Các lỗi đã được sửa

### 1. Connection String Issue ✅
- **Problem:** ReservationRepository và PaymentRepository sử dụng `DefaultConnection` nhưng Program.cs sử dụng `EVRentalDB`
- **Fix:** Đã sửa để sử dụng `EVRentalDB` cho tất cả repositories

### 2. Missing Authorization Header ✅
- **Problem:** Frontend API service không gửi Authorization header với JWT token
- **Fix:** Đã thêm logic để tự động gửi `Bearer ${token}` trong mọi request

### 3. Enhanced Logging ✅
- **Added:** Chi tiết logging trong backend để debug
- **Added:** Logging vehicle status và user ID

## Cách Test

### Bước 1: Restart Backend
```bash
cd backend/EVRentalApi
dotnet run
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

### Bước 2: Check Database
Chạy script SQL:
```sql
-- File: backend/comprehensive_db_check.sql
```

**Expected:** Có users, vehicles, stations với status = 'available'

### Bước 3: Reset Vehicle Status (nếu cần)
```sql
-- File: backend/reset_vehicle_status.sql
```

### Bước 4: Test Frontend
1. **Login vào hệ thống**
2. **Check localStorage có token:**
   ```javascript
   localStorage.getItem('token')
   ```
3. **Book một xe**
4. **Check backend console logs**

## Expected Success Flow

### Backend Console Logs:
```
[API] Received reservation request: VehicleId=1, StationId=1
[API] User ID claim value: 5
[API] Parsed user ID: 5
[Reservation] Vehicle 1 status: available
[Reservation] Inserting reservation with StartTime: ..., EndTime: ...
[Reservation] Successfully saved reservation 1
[Reservation] Updated vehicle 1 status to 'pending'
[API] Reservation created successfully: 1
```

### Database Check:
```sql
SELECT * FROM reservations ORDER BY created_at DESC;
SELECT * FROM payments ORDER BY created_at DESC;
SELECT vehicle_id, status FROM vehicles WHERE vehicle_id = 1;
```

## Troubleshooting

### Nếu vẫn lỗi 400:

1. **Check Token:**
   ```javascript
   // In browser console
   localStorage.getItem('token')
   ```

2. **Check User Login:**
   - Đảm bảo đã login thành công
   - Token phải tồn tại và valid

3. **Check Vehicle Status:**
   ```sql
   SELECT vehicle_id, status FROM vehicles WHERE vehicle_id = [your_vehicle_id];
   ```

4. **Check Backend Logs:**
   - Look for specific error messages
   - Check if user ID is parsed correctly

### Common Issues:

#### "No user ID claim found in token"
- **Cause:** User chưa login hoặc token expired
- **Fix:** Login lại

#### "Vehicle with ID X not found"
- **Cause:** Vehicle ID không tồn tại trong database
- **Fix:** Check vehicle data

#### "Vehicle is not available for booking"
- **Cause:** Vehicle status không phải 'available'
- **Fix:** Run reset script

#### "Invalid user ID"
- **Cause:** Token không chứa user ID hoặc format sai
- **Fix:** Check JWT token generation

## Test Scripts

### Quick Test:
```bash
# 1. Start backend
cd backend/EVRentalApi && dotnet run

# 2. In another terminal, test API
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"vehicleId":1,"stationId":1,"startTime":"2024-01-01T10:00:00Z","endTime":"2024-01-01T18:00:00Z"}'
```

### Database Verification:
```sql
-- Check recent reservations
SELECT TOP 5 * FROM reservations ORDER BY created_at DESC;

-- Check recent payments  
SELECT TOP 5 * FROM payments ORDER BY created_at DESC;

-- Check vehicle status
SELECT vehicle_id, status, updated_at FROM vehicles ORDER BY vehicle_id;
```

## Next Steps

1. **Restart backend**
2. **Login vào frontend**
3. **Book một xe**
4. **Check backend console logs**
5. **Check database**

Nếu vẫn có lỗi, gửi backend console logs để debug tiếp!
