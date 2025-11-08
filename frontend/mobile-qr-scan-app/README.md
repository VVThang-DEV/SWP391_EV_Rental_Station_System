# EV Rental QR Scanner Mobile App

A mobile app for scanning and verifying reservation QR codes for the EV Rental System.

## Features

- 📱 QR Code scanning using device camera
- ✅ Real-time verification with backend API
- 🔒 Automatic reservation confirmation
- 📊 Display reservation details after scan
- 🎨 Clean, modern UI

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend/mobile-qr-scan-app
npm install
```

### 2. Configure Backend URL

Edit `App.js` and update the `BACKEND_URL` constant:

```javascript
const BACKEND_URL = "http://YOUR_BACKEND_IP:5000";
```

**Important:**

- For Android emulator: Use `http://10.0.2.2:5000`
- For iOS simulator: Use `http://localhost:5000`
- For physical device: Use your computer's local IP (e.g., `http://192.168.1.100:5000`)

### 3. Run the App

```bash
npx expo start
```

Then:

- Press `a` for Android
- Press `i` for iOS
- Scan the QR code with Expo Go app on your device

## How It Works

### QR Code Format

The QR code contains JSON data with the following structure:

```json
{
  "reservationId": 64,
  "vehicleId": 37,
  "stationId": 1,
  "userId": 74,
  "startTime": "2025-11-04T14:30:00",
  "endTime": "2025-11-05T14:00:00",
  "status": "pending",
  "accessCode": "ACCESS_64_1762239910321",
  "timestamp": "2025-11-04T07:05:10.321Z"
}
```

### Verification Process

1. **Scan QR Code**: Customer presents QR code at pickup
2. **Parse Data**: App parses the JSON from QR code
3. **Verify with Backend**: Sends data to `/api/qr/verify` endpoint
4. **Check Status**: Backend verifies:
   - QR code exists in database
   - QR code hasn't expired
   - QR code hasn't been used
   - Reservation is still valid
5. **Confirm**: If valid, backend:
   - Updates reservation status to `confirmed`
   - Updates QR code status to `used`
   - Updates rental status to `ongoing`
   - Updates vehicle status to `rented`
6. **Display Result**: App shows success/failure message

## Backend Integration

### Database Schema

The app works with the `pickup_qr_codes` table:

```sql
CREATE TABLE pickup_qr_codes (
  qr_id INT IDENTITY(1,1) PRIMARY KEY,
  rental_id INT NOT NULL,
  code VARCHAR(MAX) NOT NULL, -- JSON data
  status VARCHAR(20) DEFAULT 'active',
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME DEFAULT GETDATE()
);
```

### API Endpoints

#### Generate QR Code

```
POST /api/qr/generate/{reservationId}
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "qrCode": "{...JSON data...}"
}
```

#### Verify QR Code

```
POST /api/qr/verify
Content-Type: application/json

{
  "qrCodeData": "{...JSON data...}"
}
```

Response (Success):

```json
{
  "success": true,
  "message": "Reservation confirmed successfully!",
  "reservation": {
    "reservationId": 64,
    "userId": 74,
    "vehicleId": 37,
    "status": "confirmed",
    ...
  }
}
```

Response (Failure):

```json
{
  "success": false,
  "message": "QR code has expired"
}
```

## Testing

### Generate a Test QR Code

1. Create a reservation through your frontend
2. Call the generate endpoint:
   ```bash
   curl -X POST http://localhost:5000/api/qr/generate/64 \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
3. Use the returned JSON to create a QR code using any QR generator
4. Scan with the mobile app

### Test Data

Sample QR code data for testing:

```json
{
  "reservationId": 64,
  "vehicleId": 37,
  "stationId": 1,
  "userId": 74,
  "startTime": "2025-11-04T14:30:00",
  "endTime": "2025-11-05T14:00:00",
  "status": "pending",
  "accessCode": "ACCESS_64_1762239910321",
  "timestamp": "2025-11-04T07:05:10.321Z"
}
```

## Troubleshooting

### Camera Permission Issues

If camera doesn't work:

- Make sure you granted camera permissions
- Restart the Expo Go app
- Check device settings for camera permissions

### Backend Connection Issues

If verification fails:

- Check backend is running
- Verify BACKEND_URL is correct
- Check firewall settings
- Ensure backend CORS allows mobile app origin

### QR Code Not Scanning

- Ensure good lighting
- Hold phone steady
- Make sure QR code is clear and not too small
- Try different distances from QR code

## Development

### Project Structure

```
mobile-qr-scan-app/
├── App.js              # Main app component with scanner
├── app.json            # Expo configuration
├── package.json        # Dependencies
└── README.md          # This file
```

### Key Components

- **CameraView**: Expo camera component for scanning
- **handleBarCodeScanned**: QR code scan handler
- **Verification Logic**: API call to backend
- **Result Display**: Success/failure UI

## Production Deployment

1. Update `BACKEND_URL` to production URL
2. Build standalone app:
   ```bash
   eas build --platform android
   eas build --platform ios
   ```
3. Submit to app stores or distribute via Expo

## License

Part of the SWP391 EV Rental Station System project.
