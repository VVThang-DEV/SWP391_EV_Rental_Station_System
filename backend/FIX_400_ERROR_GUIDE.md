# Hướng dẫn Debug Lỗi 400 Bad Request

## Vấn đề hiện tại

Từ console logs, bạn có lỗi:
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
API Error [/api/reservations]: Error: HTTP error! status: 400
```

## Các bước Debug

### Bước 1: Check Backend Console

Restart backend và book lại một xe. Check backend console output:

```bash
cd backend/EVRentalApi
dotnet run
```

Bạn sẽ thấy logs như:
```
[API] Received reservation request: VehicleId=X, StationId=Y
[API] User ID claim value: ...
[API] Parsed user ID: ...
[Reservation] Vehicle X status: ...
```

### Bước 2: Check User Login

Đảm bảo bạn đã login và có token:

1. Open browser DevTools → Application tab
2. Check localStorage → token
3. Token phải tồn tại và còn valid

### Bước 3: Check Vehicle Data

Chạy SQL script:
```bash
# File: backend/check_user_vehicle.sql
```

Expected output:
- User ID phải tồn tại
- Vehicle ID phải tồn tại
- Vehicle status phải là 'available'

### Bước 4: Check Network Request

1. Open DevTools → Network tab
2. Book một xe
3. Find POST request to `/api/reservations`
4. Check:
   - **Request Headers:** Authorization header có token không
   - **Request Payload:** Data có đúng không
   - **Response:** Error message là gì

## Các nguyên nhân có thể

### 1. User chưa login
**Symptom:** Backend log: "No user ID claim found in token"
**Fix:** Login lại vào hệ thống

### 2. Vehicle ID không tồn tại
**Symptom:** Backend log: "Vehicle with ID X not found"
**Fix:** Check vehicle ID trong database

### 3. Vehicle không available
**Symptom:** Backend log: "Vehicle is not available for booking"
**Fix:** 
```sql
UPDATE vehicles SET status = 'available' WHERE vehicle_id = [your_vehicle_id];
```

### 4. Invalid vehicle ID format
**Symptom:** Frontend log: "Invalid vehicle ID"
**Fix:** Code đã được fix để parse đúng vehicle ID

### 5. Database connection error
**Symptom:** Backend log: "Error creating reservation: ..."
**Fix:** Check connection string trong `appsettings.json`

## Quick Fix

### Nếu vehicle status không đúng:

```sql
-- Set all vehicles to available
UPDATE vehicles SET status = 'available' WHERE status = 'pending';
```

### Nếu cần reset data:

```sql
-- Delete all reservations
DELETE FROM reservations;

-- Reset vehicle status
UPDATE vehicles SET status = 'available';
```

## Test lại

1. **Restart Backend:**
   ```bash
   cd backend/EVRentalApi
   dotnet run
   ```

2. **Check Backend Console:**
   - Should show: "Now listening on: http://localhost:5000"
   - Should show: "[API] Received reservation request..."

3. **Login vào Frontend:**
   - Ensure you're logged in
   - Check token in localStorage

4. **Book một xe:**
   - Use a vehicle with status = 'available'
   - Complete booking

5. **Check Backend Console:**
   - Should show detailed logs
   - Should show success or error message

6. **Check Database:**
   ```sql
   SELECT * FROM reservations ORDER BY created_at DESC;
   ```

## Expected Success Logs

**Backend Console:**
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

**Database:**
```
reservation_id: 1
user_id: 5
vehicle_id: 1
status: pending
```

## Nếu vẫn lỗi

Gửi backend console logs để tôi debug tiếp!

