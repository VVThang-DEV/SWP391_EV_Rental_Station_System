# Hướng dẫn Debug và Fix vấn đề Booking không lưu vào Database

## Các bước kiểm tra

### Bước 1: Chạy Debug Script

```bash
# Mở SQL Server Management Studio
# Chạy file: backend/debug_check_data.sql
```

Script này sẽ check:
- ✅ Tables có tồn tại không
- ✅ Có data nào trong database không
- ✅ Last record được tạo khi nào

### Bước 2: Kiểm tra Console Logs

Khi booking xe, check browser console:

**Frontend Console Logs:**
```
[Booking] Raw Vehicle ID: ...
[Booking] Parsed Vehicle ID: ...
[Booking] Station ID: ...
[Booking] Creating reservation with data: {...}
```

**Backend Console Logs:**
```
[Reservation] Inserting reservation with StartTime: ..., EndTime: ...
[Reservation] Successfully saved reservation X with StartTime: ..., EndTime: ...
[Reservation] Updated vehicle X status to 'pending'
```

### Bước 3: Kiểm tra API Response

1. **Open Browser DevTools** → Network tab
2. **Book một xe**
3. **Find POST request to `/api/reservations`**
4. **Check:**
   - Request payload
   - Response status
   - Response body

### Bước 4: Kiểm tra Database trực tiếp

```sql
-- Check tất cả reservations
SELECT * FROM reservations ORDER BY created_at DESC;

-- Check payments
SELECT * FROM payments ORDER BY created_at DESC;

-- Check vehicle status
SELECT vehicle_id, status, updated_at FROM vehicles;

-- Check specific vehicle
SELECT * FROM vehicles WHERE vehicle_id = [your_vehicle_id];
```

## Các vấn đề thường gặp và cách fix

### Vấn đề 1: Vehicle ID không đúng

**Symptom:** Console log shows "Invalid vehicle ID"

**Fix:** Đã được fix trong code - vehicle ID sẽ được parse đúng cách

### Vấn đề 2: Vehicle không available

**Symptom:** API returns "Vehicle is not available for booking"

**Fix:** Check vehicle status trong database:
```sql
UPDATE vehicles SET status = 'available' WHERE vehicle_id = [your_vehicle_id];
```

### Vấn đề 3: Database connection error

**Symptom:** Backend console shows connection error

**Fix:** Check connection string trong `appsettings.json`

### Vấn đề 4: User chưa login

**Symptom:** API returns 401 Unauthorized

**Fix:** 
- Ensure user đã login
- Check token trong localStorage
- Check token còn valid không

### Vấn đề 5: API không được gọi

**Symptom:** No network request in DevTools

**Fix:** Check:
- Frontend có call API không
- Browser console có error không
- Network tab có request không

## Step-by-step Debug

### 1. Start Backend

```bash
cd backend/EVRentalApi
dotnet run
```

Check console output:
```
Now listening on: http://localhost:5000
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Login vào hệ thống

- Open browser
- Login với valid credentials
- Check token được save trong localStorage

### 4. Book một xe

- Chọn một xe
- Complete booking form
- Complete payment

### 5. Check Database

```sql
-- Should see new reservation
SELECT TOP 1 * FROM reservations ORDER BY created_at DESC;

-- Should see new payment
SELECT TOP 1 * FROM payments ORDER BY created_at DESC;

-- Vehicle status should be 'pending'
SELECT vehicle_id, status FROM vehicles WHERE vehicle_id = [your_vehicle_id];
```

## Expected Results

### Sau khi booking thành công:

**1. Database:**
```
reservations table:
- reservation_id: 1 (auto-generated)
- user_id: [your_user_id]
- vehicle_id: [your_vehicle_id]
- start_time: [your_start_time]
- end_time: [your_end_time]
- status: 'pending'

payments table:
- payment_id: 1 (auto-generated)
- reservation_id: 1
- method_type: 'bank_transfer'
- amount: [total_cost]
- status: 'success'
- transaction_id: [payment_id]

vehicles table:
- vehicle_id: [your_vehicle_id]
- status: 'pending' (updated from 'available')
```

**2. Console Logs:**
```
[Booking] Creating reservation with data: {...}
[Reservation] Successfully saved reservation 1
[Payment] Payment saved successfully: {...}
```

**3. Toast Message:**
```
Payment Successful!
Your booking has been confirmed. Reservation ID: 1
```

## Nếu vẫn không thấy data

### Check lại:

1. **Backend đang chạy không?**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Database đúng không?**
   ```sql
   SELECT DB_NAME();
   ```

3. **Connection string đúng không?**
   - Check `backend/EVRentalApi/appsettings.json`
   - Connection string phải trỏ đến đúng database

4. **Tables có tồn tại không?**
   ```sql
   SELECT * FROM INFORMATION_SCHEMA.TABLES 
   WHERE TABLE_NAME IN ('reservations', 'payments', 'vehicles');
   ```

5. **User ID có tồn tại không?**
   ```sql
   SELECT user_id, email FROM users;
   ```

## Quick Fix Commands

```sql
-- Reset vehicle status
UPDATE vehicles SET status = 'available' WHERE status = 'pending';

-- Check reservations
SELECT * FROM reservations;

-- Check payments
SELECT * FROM payments;

-- Delete test data (if needed)
DELETE FROM payments WHERE reservation_id IS NOT NULL;
DELETE FROM reservations;
```

## Kết luận

Chạy script `backend/debug_check_data.sql` để kiểm tra:
- ✅ Tables có tồn tại không
- ✅ Có data nào trong database không
- ✅ Last record được tạo khi nào

Sau đó check console logs để xem API có được gọi không và có error gì không.

