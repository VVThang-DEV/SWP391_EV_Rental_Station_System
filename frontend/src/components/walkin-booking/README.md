# Walk-in Booking Components

This folder contains all components related to walk-in booking functionality for staff members.

## 📁 Structure

```
walkin-booking/
├── index.ts                    # Export all components and types
├── types.ts                    # TypeScript type definitions
├── WalkInBookingManager.tsx    # Main component (orchestrator)
├── WalkInCustomerManager.tsx   # Customer management
├── WalkInBookingCreation.tsx   # Booking creation form
├── WalkInBookingList.tsx       # Booking list and management
├── WalkInVehicleSelector.tsx   # Vehicle selection
└── README.md                   # This file
```

## 🎯 Components

### **WalkInBookingManager** (Main Component)
- **Purpose**: Main orchestrator component
- **Features**: Tab navigation, state management, coordination
- **Usage**: Import and use in Staff Dashboard

### **WalkInCustomerManager**
- **Purpose**: Manage walk-in customers
- **Features**: 
  - Customer list with search
  - Add new customers
  - Document verification
  - Customer information management

### **WalkInBookingCreation**
- **Purpose**: Create new walk-in bookings
- **Features**:
  - Customer and vehicle selection
  - Duration and pricing calculation
  - Payment method selection
  - Booking summary

### **WalkInBookingList**
- **Purpose**: Manage existing bookings
- **Features**:
  - Booking list with search
  - Status management
  - Booking confirmation
  - Payment status tracking

### **WalkInVehicleSelector**
- **Purpose**: Display and select available vehicles
- **Features**:
  - Vehicle grid display
  - Vehicle information (battery, location, price)
  - Selection state management

## 🔧 Usage

### Import Main Component
```typescript
import { WalkInBookingManager } from "@/components/walkin-booking";
```

### Import Individual Components
```typescript
import { 
  WalkInCustomerManager,
  WalkInBookingCreation,
  WalkInBookingList,
  WalkInVehicleSelector 
} from "@/components/walkin-booking";
```

### Import Types
```typescript
import type { 
  WalkInCustomer,
  WalkInBooking,
  WalkInVehicle 
} from "@/components/walkin-booking";
```

## 🎨 Features

- **Modular Design**: Each component has a single responsibility
- **Reusable**: Components can be used independently
- **Type Safe**: Full TypeScript support
- **Responsive**: Mobile-friendly design
- **Accessible**: Proper ARIA labels and keyboard navigation

## 🔄 Data Flow

1. **WalkInBookingManager** manages overall state
2. **WalkInCustomerManager** handles customer data
3. **WalkInBookingCreation** creates new bookings
4. **WalkInBookingList** displays and manages bookings
5. **WalkInVehicleSelector** shows available vehicles

## 🚀 Integration

This component is integrated into the Staff Dashboard at:
- **Path**: `/dashboard/staff`
- **Tab**: "Walk-in Booking"
- **Route**: `TabsContent value="walkin"`

## 📝 Notes

- All components use React hooks for state management
- Toast notifications for user feedback
- Form validation and error handling
- Mock data for development (replace with real API calls)
