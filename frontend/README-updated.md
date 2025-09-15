# E-Route Rent 🚗⚡

A modern electric vehicle rental platform with station-based pickup and drop-off system. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

### 🏠 **Landing Page**

- Hero section with compelling messaging
- Feature highlights
- Call-to-action sections
- Responsive design

### 🔐 **Authentication System**

- Multi-role support (Customer, Staff, Admin)
- Secure login/register flows
- Role-based dashboard routing
- Mock authentication for demo

### 🚙 **Vehicle Management**

- Browse available electric vehicles
- Detailed vehicle information
- Real-time availability status
- Advanced search and filtering

### 🗺️ **Interactive Maps**

- Google Maps integration (mock implementation)
- Station locations with real coordinates
- Vehicle availability at each station
- Interactive station popups with details

### 📱 **Mioto.vn-Inspired UI**

- Modern, clean interface
- Grid, List, and Map view modes
- Advanced filtering system
- Mobile-responsive design

### 📋 **Booking System**

- Step-by-step booking process
- Document upload (Driver's License, ID, Passport)
- Multiple payment options (QR, Cash, Bank Transfer)
- Booking confirmation and management

### 👥 **Role-Based Dashboards**

- **Customer**: Booking history, profile management
- **Staff**: Vehicle management, customer support
- **Admin**: System analytics, user management, reports

### 💰 **Payment Integration**

- QR Code payments
- Cash on delivery
- Bank transfers
- Mock payment processing for demo

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Option 1: Automated Setup

```bash
# On Windows
.\start.bat

# On Mac/Linux
chmod +x start.sh && ./start.sh
```

### Option 2: Manual Setup

```bash
# Clone the repository
git clone [repository-url]
cd e-route-rent

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 📦 Build & Deployment

### Development Build

```bash
npm run build:dev
```

### Production Build

```bash
npm run build
```

### Deployment Options

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
npm run deploy:vercel
```

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
npm run deploy:netlify
```

#### Other Options

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including Firebase, self-hosting, and CI/CD setup.

## 🧪 Demo Credentials

### Customer Login

- Email: `customer@demo.com`
- Password: `demo123`

### Staff Login

- Email: `staff@demo.com`
- Password: `demo123`

### Admin Login

- Email: `admin@demo.com`
- Password: `demo123`

## 📊 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── GoogleMaps.tsx  # Map integration
│   ├── Navbar.tsx      # Navigation
│   └── VehicleCard.tsx # Vehicle display
├── data/               # Mock data
│   ├── vehicles.ts     # Vehicle data
│   └── stations.ts     # Station data
├── pages/              # Route components
│   ├── Index.tsx       # Landing/Main page
│   ├── Login.tsx       # Authentication
│   ├── Dashboard.tsx   # User dashboards
│   └── ...             # Other pages
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── assets/             # Static assets
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Maps**: Google Maps (mock implementation)
- **Build Tool**: Vite
- **Deployment**: Vercel/Netlify ready

## 🎨 Design System

The project follows a comprehensive design system with:

- Consistent color palette for EV/sustainability theme
- Professional typography (Inter font family)
- Smooth animations and transitions
- Mobile-first responsive design
- Accessibility considerations

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - TypeScript type checking

## 📈 Features in Development

This is a UI/UX presentation project with mock data. For production use, you would need to implement:

- Real backend API integration
- Actual payment processing
- Real-time vehicle tracking
- Push notifications
- Advanced analytics
- Multi-language support

## 📄 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment instructions
- [Project Documentation](./DOCUMENTATION.md) - Technical documentation
- [Environment Variables](./.env.example) - Configuration template

## 🤝 Contributing

This project was built as a demonstration/presentation project. Feel free to fork and adapt for your own use cases.

## 📞 Support

For questions or issues with deployment or setup, refer to:

1. Project documentation
2. Deployment guide
3. Repository issues

---

**Built with ❤️ for sustainable transportation**
