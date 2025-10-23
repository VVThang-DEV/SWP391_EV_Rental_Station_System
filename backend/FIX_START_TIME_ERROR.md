# Fix "Start time cannot be in the past" Error

## Vấn đề

Backend trả về lỗi: **"Start time cannot be in the past"**

**Nguyên nhân:**
- Frontend gửi Start Time: `2025-10-23T14:00:00.000Z` (2 PM UTC)
- Current time: ~8:48 PM 10/23/2025
- Backend validation: `request.StartTime < DateTime.Now` → **FAIL**

## Đã sửa

✅ **Backend:** Cho phép booking trong 15 phút quá khứ (timezone issues)

## Cách test

### Option 1: Test với thời gian trong tương lai

1. **Vào booking page**
2. **Chọn Start Date:** Ngày mai (2025-10-24)
3. **Chọn Start Time:** Bất kỳ
4. **Complete booking**

### Option 2: Test với thời gian hiện tại

1. **Vào booking page**  
2. **Chọn Start Date:** Hôm nay (2025-10-23)
3. **Chọn Start Time:** Time hiện tại hoặc sau đó
4. **Complete booking**

## Expected Success Flow

**Frontend Console:**
```
[Booking] Using API vehicleId: 1
[Booking] Start Time: 2025-10-24T14:00:00.000Z
[Booking] End Time: 2025-10-25T14:00:00.000Z
```

**Backend Console:**
```
[API] Received reservation request: VehicleId=1, StationId=1
[Reservation] Vehicle 1 status: available
[Reservation] Successfully saved reservation 1
[API] Reservation created successfully: 1
```

**Database:**
```sql
SELECT * FROM reservations ORDER BY created_at DESC;
SELECT * FROM payments ORDER BY created_at DESC;
```

## Troubleshooting

### Nếu vẫn lỗi "Start time cannot be in the past"

**Check timezone:**
- Frontend sử dụng UTC time
- Backend sử dụng local time
- Có thể có timezone mismatch

**Fix:** 
```sql
-- Check server time
SELECT GETDATE() AS ServerTime, GETUTCDATE() AS UTCTime;

-- Check reservation time
SELECT start_time, end_time FROM reservations ORDER BY created_at DESC;
```

### Nếu vẫn lỗi 400

**Check backend logs:**
- Look for specific error messages
- Check if vehicle status is 'available'

**Expected logs:**
```
[API] Received reservation request: VehicleId=1, StationId=1
[API] User ID claim value: 5
[Reservation] Vehicle 1 status: available
```

## Quick Fix

**Reset vehicle status:**
```sql
UPDATE vehicles SET status = 'available' WHERE vehicle_id = 1;
```

**Test booking với thời gian trong tương lai:**
- Start Date: Tomorrow
- Start Time: 10:00 AM
- End Date: Tomorrow  
- End Time: 6:00 PM

Refresh browser và test lại!
