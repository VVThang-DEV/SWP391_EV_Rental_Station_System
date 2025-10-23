# Hướng dẫn Lưu Payment vào Database

## Tổng quan

Khi user nhấn "Đã thanh toán" (payment complete), hệ thống sẽ tự động lưu TẤT CẢ thông tin sau vào database:

### 1. **Reservation** (Đã có sẵn)
- reservation_id (auto-generated)
- user_id
- vehicle_id
- station_id
- start_time
- end_time
- status = 'pending'
- created_at

### 2. **Vehicle Status** (Đã có sẵn)
- Vehicle status tự động update: `available` → `pending`

### 3. **Payment** (MỚI THÊM)
- payment_id (auto-generated)
- reservation_id
- method_type (cash, momo, vnpay, bank_transfer)
- amount
- status (success)
- transaction_id
- is_deposit
- created_at
- updated_at

## Cách hoạt động

### Flow khi nhấn "Đã thanh toán":

```
1. User completes payment
   ↓
2. Create Reservation
   - Insert reservation vào database
   - Auto-generate reservation_id
   - Update vehicle status: available → pending
   ↓
3. Create Payment
   - Insert payment vào database
   - Link với reservation_id
   - Auto-generate payment_id
   ↓
4. Save to Local Storage (for frontend display)
   ↓
5. Show confirmation page
```

## Code Implementation

### Backend Files Created:

1. **PaymentRepository.cs** - Repository để lưu payment
2. **PaymentService.cs** - Service layer với validation
3. **PaymentDto.cs** - DTOs cho payment data
4. **Program.cs** - Đăng ký payment endpoints

### Backend Endpoints:

```csharp
POST /api/payments
- Create new payment
- Parameters: reservationId, methodType, amount, status, transactionId

GET /api/payments/reservation/{reservationId}
- Get all payments for a reservation

GET /api/payments/user
- Get all payments for current user

GET /api/payments/{id}
- Get payment by ID
```

### Frontend Integration:

**File:** `frontend/src/pages/vehicles/BookingPage.tsx`

```typescript
// Sau khi tạo reservation thành công
if (reservationId) {
  const paymentDataToSave = {
    reservationId: reservationId,
    methodType: dbMethod, // 'bank_transfer' or 'cash'
    amount: totalCost,
    status: 'success',
    transactionId: paymentData.paymentId,
    isDeposit: false
  };

  // Lưu payment vào database
  await apiService.createPayment(paymentDataToSave);
}
```

## Payment Methods

| Frontend | Database | Mô tả |
|----------|----------|-------|
| `qr_code` | `bank_transfer` | Chuyển khoản qua QR code |
| `cash` | `cash` | Thanh toán tiền mặt |

## Database Schema

### Table: `payments`

```sql
CREATE TABLE dbo.payments (
  payment_id INT IDENTITY(1,1) PRIMARY KEY,
  reservation_id INT NULL,
  rental_id INT NULL,
  method_type VARCHAR(50) NOT NULL, -- cash, momo, vnpay, bank_transfer
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending, success, failed, refunded
  transaction_id VARCHAR(100) NULL,
  is_deposit BIT DEFAULT 0,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_payments_reservation FOREIGN KEY (reservation_id) REFERENCES dbo.reservations(reservation_id)
);
```

## Cách Kiểm tra

### Option 1: SQL Script (Khuyên dùng)

```bash
# Chạy file: backend/test_payment_data.sql
```

### Option 2: Test Thực tế

1. **Booking một xe và complete payment**
2. **Check Console Logs:**
   ```
   [Payment] Creating payment in database: {...}
   [Payment] Payment saved successfully: {...}
   ```
3. **Check Database:**
   ```sql
   SELECT * FROM payments ORDER BY created_at DESC;
   ```

### Option 3: Check Payment Data

```sql
-- View all payments with reservation details
SELECT 
    p.payment_id,
    p.reservation_id,
    r.user_id,
    r.vehicle_id,
    p.method_type,
    p.amount,
    p.status,
    p.transaction_id,
    p.created_at
FROM payments p
LEFT JOIN reservations r ON p.reservation_id = r.reservation_id
ORDER BY p.created_at DESC;
```

## Example Data Flow

### Input (Frontend):
```javascript
{
  vehicleId: 1,
  stationId: 1,
  startTime: "2024-01-15T10:00:00.000Z",
  endTime: "2024-01-15T18:00:00.000Z"
}
```

### Database Records Created:

**1. Reservation:**
```
reservation_id: 1
user_id: 5
vehicle_id: 1
station_id: 1
start_time: 2024-01-15 10:00:00
end_time: 2024-01-15 18:00:00
status: pending
created_at: 2024-01-15 09:30:00
```

**2. Vehicle Status Update:**
```
vehicle_id: 1
status: pending (updated from available)
updated_at: 2024-01-15 09:30:00
```

**3. Payment:**
```
payment_id: 1
reservation_id: 1
rental_id: NULL
method_type: bank_transfer
amount: 500000.00
status: success
transaction_id: PAY_1234567890
is_deposit: 0
created_at: 2024-01-15 09:30:01
updated_at: 2024-01-15 09:30:01
```

## Logging

### Backend Logs:
```
[Payment] Creating payment for reservation_id: 1, amount: 500000.00, method: bank_transfer
[Payment] Successfully created payment with ID: 1
```

### Frontend Logs:
```
[Payment] Creating payment in database: {...}
[Payment] Payment saved successfully: {...}
```

## Troubleshooting

### Nếu payment không được lưu:

1. **Check Console Logs:**
   - Frontend: Check có log "[Payment] Creating payment" không
   - Backend: Check có log "[Payment] Successfully created" không

2. **Check Database:**
   ```sql
   SELECT * FROM payments WHERE reservation_id = 1;
   ```

3. **Check API Response:**
   - Open browser DevTools → Network tab
   - Tìm POST request to `/api/payments`
   - Check request body và response

### Nếu transaction_id missing:

- Frontend tự động generate: `PAY_{Date.now()}`
- Backend lưu vào database
- Check trong `payments.transaction_id` column

## Kết luận

✅ **Payment được lưu vào database tự động**
✅ **Link với reservation_id**
✅ **Payment method được map đúng**
✅ **Transaction ID được track**
✅ **Logging đã được thêm**
✅ **Test script đã được tạo**

Tất cả thông tin booking và payment đã được lưu vào database!

