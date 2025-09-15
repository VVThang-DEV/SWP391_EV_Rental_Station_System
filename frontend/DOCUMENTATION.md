# 🚗 EVRentals - EV Station-based Rental System

A comprehensive electric vehicle rental management system designed for station-based operations with multi-role user management.

## 🌟 Features

### For Customers (EV Renters)

- **Registration & Authentication**: Create account with document upload and verification
- **Vehicle Booking**:
  - Find stations on interactive map
  - Browse available vehicles with real-time battery levels
  - Book vehicles in advance or walk-in rentals
  - Flexible rental periods (hourly/daily)
- **Document Management**: Upload driver's license, national ID (CCCD/CMND), passport
- **Payment Options**:
  - QR Code payments with real-time processing
  - Cash payments at station
  - Bank transfer integration
  - Automatic receipt generation and email delivery
- **Rental History**: Track past rentals, expenses, and usage analytics
- **Personal Dashboard**: View current rentals, upcoming bookings, and statistics

### For Station Staff

- **Vehicle Management**:
  - Real-time fleet status monitoring
  - Vehicle check-in/check-out processing
  - Battery level tracking
  - Maintenance scheduling
- **Customer Verification**:
  - Document authentication (license, ID verification)
  - In-person identity confirmation
  - Digital contract signing
- **Payment Processing**:
  - Cash payment handling
  - Deposit management
  - Payment confirmation for digital transactions
- **Daily Operations**:
  - Staff dashboard with key metrics
  - Customer service tools
  - Shift reporting

### For Administrators

- **Fleet Management**:
  - Multi-station oversight
  - Vehicle utilization analytics
  - Maintenance tracking
  - Fleet optimization recommendations
- **Customer Management**:
  - Customer profiles and rental history
  - Risk assessment and flagging
  - Customer support tools
- **Staff Management**:
  - Staff performance metrics
  - Task assignment
  - Training tracking
- **Analytics & Reporting**:
  - Revenue analytics by station/period
  - Peak hour analysis
  - AI-powered demand forecasting
  - Operational efficiency metrics

## 🚀 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Tailwind CSS, shadcn/ui
- **Routing**: React Router DOM
- **State Management**: React Hooks, Context API
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm/bun

## 📋 Prerequisites

- Node.js 18+
- npm or bun package manager
- Modern web browser

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ThangVVSE180202/e-route-rent.git
   cd e-route-rent
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Start development server**

   ```bash
   npm run dev
   # or
   bun run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

## 🎭 User Roles & Access

### Demo Login Credentials

**Customer Role:**

- Select "Customer" in login dropdown
- Use any email/password combination

**Station Staff:**

- Select "Station Staff" in login dropdown
- Use any email/password combination
- Access to District 1 Station by default

**Administrator:**

- Select "Administrator" in login dropdown
- Use any email/password combination
- Full system access

## 📱 Core User Flows

### Customer Journey

1. **Registration**: Create account → Upload documents → Verify identity
2. **Booking**: Browse vehicles → Select station → Choose rental period → Upload documents
3. **Payment**: Select payment method → Complete transaction → Receive confirmation
4. **Pickup**: Arrive at station → Staff verification → Vehicle handover
5. **Return**: Return to station → Vehicle inspection → Final payment → Rating

### Staff Workflow

1. **Daily Setup**: Check vehicle status → Review pending bookings
2. **Customer Service**: Verify documents → Process payments → Handle vehicle handovers
3. **Operations**: Monitor fleet → Update vehicle status → Handle maintenance
4. **Reporting**: End-of-day reconciliation → Submit reports

### Admin Operations

1. **Monitoring**: Review system metrics → Check station performance
2. **Management**: Handle customer issues → Manage staff → Fleet optimization
3. **Analytics**: Generate reports → Review trends → Plan improvements
4. **Decision Making**: AI insights → Demand forecasting → Resource allocation

## 🗂️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── Navbar.tsx       # Navigation component
│   ├── VehicleCard.tsx  # Vehicle display component
│   ├── DocumentUpload.tsx # Document upload system
│   └── PaymentSystem.tsx # Payment processing
├── pages/               # Page components
│   ├── Index.tsx        # Home page
│   ├── Login.tsx        # Authentication
│   ├── Register.tsx     # User registration
│   ├── Dashboard.tsx    # Customer dashboard
│   ├── StaffDashboard.tsx # Staff interface
│   ├── AdminDashboard.tsx # Admin interface
│   ├── BookingPage.tsx  # Vehicle booking flow
│   ├── Vehicles.tsx     # Vehicle catalog
│   └── VehicleDetails.tsx # Individual vehicle
├── data/                # Mock data and types
│   └── vehicles.ts      # Vehicle data
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── assets/              # Static assets
```

## 🎨 UI/UX Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme detection and manual toggle
- **Accessibility**: WCAG 2.1 AA compliant components
- **Progressive Web App**: Installable with offline capabilities
- **Real-time Updates**: Live status updates for vehicles and bookings
- **Interactive Maps**: Station locations and vehicle availability
- **Document Scanner**: Mobile-optimized document capture
- **QR Code Generator**: Dynamic payment QR codes

## 💳 Payment Integration

### Supported Methods

- **QR Code Payments**: Real-time bank transfer via QR scanning
- **Cash Payments**: Staff-processed at station with receipt generation
- **Card Payments**: Integration ready for Stripe/PayPal
- **Bank Transfer**: Direct transfer with confirmation tracking

### Security Features

- PCI DSS compliance ready
- Encrypted document storage
- Secure payment processing
- Transaction logging and audit trails

## 📊 Analytics Dashboard

### Customer Analytics

- Rental frequency and patterns
- Preferred vehicle types and times
- Geographic usage patterns
- Customer lifetime value

### Operational Analytics

- Vehicle utilization rates
- Peak hours and demand patterns
- Station performance metrics
- Revenue optimization insights

### AI-Powered Insights

- Demand forecasting
- Fleet optimization recommendations
- Pricing strategy suggestions
- Maintenance scheduling optimization

## 🔒 Security & Privacy

- **Data Encryption**: AES-256 encryption for sensitive data
- **Document Security**: Secure storage with access logging
- **User Privacy**: GDPR compliant data handling
- **Authentication**: JWT-based authentication with role permissions
- **API Security**: Rate limiting and request validation

## 🌐 Deployment

### Build for Production

```bash
npm run build
# or
bun run build
```

### Preview Production Build

```bash
npm run preview
# or
bun run preview
```

### Deployment Options

- **Vercel**: Automatic deployment from Git
- **Netlify**: Static site hosting with serverless functions
- **AWS S3 + CloudFront**: Scalable static hosting
- **Docker**: Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful UI components
- **Lucide** for comprehensive icon library
- **Tailwind CSS** for utility-first styling
- **React Team** for the robust framework

## 📞 Support

For support, email support@evrentals.com or join our Discord channel.

## 🗓️ Roadmap

- [ ] Mobile app development (React Native)
- [ ] IoT integration for vehicle monitoring
- [ ] AI-powered dynamic pricing
- [ ] Multi-language support
- [ ] Blockchain-based smart contracts
- [ ] Carbon footprint tracking
- [ ] Integration with smart city infrastructure

---

**Built with ❤️ for a sustainable future** 🌱
