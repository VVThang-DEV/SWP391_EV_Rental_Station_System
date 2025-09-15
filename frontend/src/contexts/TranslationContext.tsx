import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Language = "en" | "vi";

export interface Translations {
  // Navigation
  nav: {
    home: string;
    vehicles: string;
    stations: string;
    about: string;
    contact: string;
    login: string;
    register: string;
    logout: string;
    dashboard: string;
    bookings: string;
    settings: string;
  };

  // Vehicle
  vehicle: {
    condition: {
      excellent: string;
      good: string;
      fair: string;
      poor: string;
    };
    conditionStatus: string;
    mileage: string;
    lastMaintenance: string;
    fuelEfficiency: string;
    inspectionDate: string;
    insuranceExpiry: string;
    maintenanceDue: string;
  };

  // Common
  common: {
    search: string;
    filter: string;
    sort: string;
    price: string;
    location: string;
    available: string;
    rented: string;
    maintenance: string;
    bookNow: string;
    viewDetails: string;
    save: string;
    cancel: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    currency: string;
    perHour: string;
    perDay: string;
    battery: string;
    range: string;
    seats: string;
    rating: string;
    reviews: string;
    kmRange: string;
    electricVehicle: string;
    year: string;
    brand: string;
    aboutThisVehicle: string;
    findVehicles: string;
    featuredElectricVehicles: string;
    welcomeBack: string;
    signInToAccount: string;
    loginAs: string;
    customer: string;
    staff: string;
    admin: string;
    email: string;
    password: string;
    signIn: string;
    signingIn: string;
    stationStaff: string;
    administrator: string;
    emailAddress: string;
    enterYourPassword: string;
    forgotYourPassword: string;
    continueWithGoogle: string;
    continueWithFacebook: string;
    dontHaveAnAccount: string;
    signUpNow: string;
    demoNote: string;
    welcomeUser: string;
    passwordAndSecurity: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    updatePassword: string;
    twoFactorAuthentication: string;
    accessDenied: string;
    adminAccessRequired: string;
    staffDashboard: string;
    adminDashboard: string;
    evRentalsManagementSystem: string;
    totalFleet: string;
    todaysRevenue: string;
    cashPayments: string;
    digitalPayments: string;
    returnsToday: string;
    revenueToday: string;
    newCustomers: string;
    totalRevenue: string;
    totalRentals: string;
    activeUsers: string;
    fleetSize: string;
    monthlyGrowth: string;
    stationManagement: string;
    customerManagement: string;
    staffManagement: string;
    reportsAndAnalytics: string;
    availableVehicles: string;
    noVehiclesFound: string;
    vehicleNotFound: string;
    pricing: string;
    rentalInformation: string;
    requirements: string;
    whatsIncluded: string;
    policies: string;
    active: string;
    directions: string;
    hour: string;
    day: string;
    trips: string;
    moreVehicles: string;
    close: string;
    howItWorks: string;
    browseVehicles: string;
    createAccount: string;
    creatingAccount: string;
    sendEmail: string;
    viewAll: string;
    highDemandExpected: string;
    optimalOperatingHours: string;
    availability: string;
    allStatus: string;
    vehicles: string;
    cashPayment: string;
    depositReturn: string;
    pleaseSignInToViewDashboard: string;
    searchVehicles: string;
    updateStatus: string;
    checkIn: string;
    checkOut: string;
    scheduleMaintenance: string;
    staffAccessRequired: string;
    fillAllFields: string;
    signInSuccess: string;
    chargers: string;
    searchPlaceholder: string;
    vehiclesHeaderTitle: string;
    vehiclesHeaderSubtitle: string;
    allLocations: string;
    priceRangeLabel: string;
    sortBy: string;
    nameAsc: string;
    priceLowToHigh: string;
    priceHighToLow: string;
    highestRated: string;
    longestRange: string;
    viewMode: string;
    grid: string;
    list: string;
    vehiclesFound: string;
    pickupLocation: string;
    searchButton: string;
    filters: string;
    searchLocations: string;
    noLocationsFound: string;
    allPrices: string;
    under50Hour: string;
    price50100Hour: string;
    over100Hour: string;
    vehicleType: string;
    allTypes: string;
    // Hero section
    heroTitle: string;
    heroSubtitle: string;
    enterPickupLocation: string;
    electricVehicles: string;
    chargingStations: string;
    support: string;
    userRating: string;
    // How It Works
    howItWorksSubtitle: string;
    step1Title: string;
    step1Description: string;
    step2Title: string;
    step2Description: string;
    step3Title: string;
    step3Description: string;
    // Benefits
    whyChooseElectric: string;
    ecoFriendly: string;
    ecoFriendlyDescription: string;
    costEffective: string;
    costEffectiveDescription: string;
    premiumExperience: string;
    premiumExperienceDescription: string;
    // Stats
    averageRange: string;
    fastCharging: string;
    happyCustomers: string;
    // CTA
    readyToGoElectric: string;
    ctaSubtitle: string;
    // Footer
    footerAbout: string;
    company: string;
    careers: string;
    press: string;
    blog: string;
    safety: string;
    locations: string;
    district1Station: string;
    district7Station: string;
    airportStation: string;
    district3Station: string;
    copyright: string;
    // Other
    availableElectricVehicles: string;
    vehiclesFoundLocation: string;
    nearestFirst: string;
    seatsLabel: string;
    kmRangeLabel: string;
    tripsLabel: string;
    featuredVehiclesSubtitle: string;
    status: string;
    recommended: string;
  };

  // Register
  register: {
    createAccount: string;
    joinElectric: string;
    fullName: string;
    fullNamePlaceholder: string;
    emailAddress: string;
    emailPlaceholder: string;
    phoneNumber: string;
    phonePlaceholder: string;
    dateOfBirth: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    agreeToTermsText: string;
    termsOfService: string;
    and: string;
    privacyPolicy: string;
    agreementRequired: string;
    agreeToTerms: string;
    passwordMismatch: string;
    passwordsDoNotMatch: string;
    welcome: string;
    accountCreated: string;
    error: string;
    fillAllFields: string;
    alreadyHaveAccount: string;
    signInHere: string;
    demoNote: string;
  };

  // Help
  help: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchHelp: string;
    faqTitle: string;
    contactTitle: string;
    contactSubtitle: string;
    phone: string;
    email: string;
    liveChat: string;
    documentation: string;
    faq1Question: string;
    faq1Answer: string;
    faq2Question: string;
    faq2Answer: string;
    faq3Question: string;
    faq3Answer: string;
    faq4Question: string;
    faq4Answer: string;
    faq5Question: string;
    faq5Answer: string;
    faq6Question: string;
    faq6Answer: string;
  };

  // Vehicle types
  vehicleTypes: {
    SUV: string;
    Sedan: string;
    Hatchback: string;
    Crossover: string;
    Coupe: string;
    Motorcycle: string;
    Scooter: string;
    Bike: string;
    Bus: string;
    Van: string;
    Truck: string;
  };

  // Settings
  settings: {
    title: string;
    subtitle: string;
    profile: string;
    security: string;
    notifications: string;
    billing: string;
    language: string;
    selectLanguage: string;
    english: string;
    vietnamese: string;
    personalInfo: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    driversLicense: string;
    licenseNumber: string;
    expiryDate: string;
    saveChanges: string;
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    twoFactorAuth: string;
    enable2FA: string;
    emailNotifications: string;
    smsNotifications: string;
    pushNotifications: string;
    bookingConfirmations: string;
    promotionalEmails: string;
    paymentMethods: string;
    addPaymentMethod: string;
    billingHistory: string;
  };

  // Dashboard
  dashboard: {
    welcome: string;
    totalRentals: string;
    totalSpent: string;
    hoursRented: string;
    co2Saved: string;
    currentRental: string;
    rentalHistory: string;
    upcomingBookings: string;
    quickActions: string;
    viewAllVehicles: string;
    manageBookings: string;
    updateProfile: string;
    overview: string;
  };

  // Booking
  booking: {
    selectVehicle: string;
    selectDates: string;
    pickupLocation: string;
    returnLocation: string;
    totalCost: string;
    confirmBooking: string;
    bookingConfirmed: string;
    bookingDetails: string;
    startDate: string;
    endDate: string;
    duration: string;
    insurance: string;
    subtotal: string;
    tax: string;
    total: string;
  };

  // Footer
  footer: {
    aboutUs: string;
    contact: string;
    support: string;
    terms: string;
    privacy: string;
    followUs: string;
    copyright: string;
  };
}

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Translations;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("en");

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "vi")) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const translations: Record<Language, Translations> = {
    en: {
      nav: {
        home: "Home",
        vehicles: "Vehicles",
        stations: "Stations",
        about: "About",
        contact: "Contact",
        login: "Login",
        register: "Register",
        logout: "Logout",
        dashboard: "Dashboard",
        bookings: "Bookings",
        settings: "Settings",
      },
      vehicle: {
        condition: {
          excellent: "Excellent",
          good: "Good",
          fair: "Fair",
          poor: "Poor",
        },
        conditionStatus: "Condition",
        mileage: "Mileage",
        lastMaintenance: "Last Maintenance",
        fuelEfficiency: "Efficiency",
        inspectionDate: "Inspection",
        insuranceExpiry: "Insurance",
        maintenanceDue: "Maintenance Due",
      },
      common: {
        search: "Search",
        filter: "Filter",
        sort: "Sort",
        price: "Price",
        location: "Location",
        available: "Available",
        rented: "Rented",
        maintenance: "Maintenance",
        bookNow: "Book Now",
        viewDetails: "View Details",
        save: "Save",
        cancel: "Cancel",
        confirm: "Confirm",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        currency: "₫",
        perHour: "/hour",
        perDay: "/day",
        battery: "Battery",
        range: "Range",
        seats: "Seats",
        rating: "Rating",
        reviews: "reviews",
        kmRange: "km range",
        electricVehicle: "Electric Vehicle",
        year: "year",
        brand: "brand",
        aboutThisVehicle: "About This Vehicle",
        findVehicles: "Find Vehicles",
        featuredElectricVehicles: "Featured Electric Vehicles",
        signUpNow: "Sign Up Now",
        welcomeBack: "Welcome back",
        signInToAccount: "Sign in to your account to continue",
        loginAs: "Login as",
        customer: "Customer",
        staff: "Staff",
        admin: "Admin",
        email: "Email",
        password: "Password",
        signIn: "Sign In",
        signingIn: "Signing in...",
        stationStaff: "Station Staff",
        administrator: "Administrator",
        emailAddress: "Email address",
        enterYourPassword: "Enter your password",
        forgotYourPassword: "Forgot your password?",
        continueWithGoogle: "Continue with Google",
        continueWithFacebook: "Continue with Facebook",
        dontHaveAnAccount: "Don't have an account?",
        demoNote: "Demo: Use any email and password to sign in",
        welcomeUser: "Welcome",
        passwordAndSecurity: "Password & Security",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmNewPassword: "Confirm New Password",
        updatePassword: "Update Password",
        twoFactorAuthentication: "Two-Factor Authentication",
        accessDenied: "Access Denied",
        adminAccessRequired: "Admin access required.",
        staffDashboard: "Staff Dashboard",
        adminDashboard: "Admin Dashboard",
        evRentalsManagementSystem: "EVRentals Management System",
        totalFleet: "Total Fleet",
        todaysRevenue: "Today's Revenue",
        cashPayments: "Cash Payments",
        digitalPayments: "Digital Payments",
        returnsToday: "Returns Today",
        revenueToday: "Revenue Today",
        newCustomers: "New Customers",
        totalRevenue: "Total Revenue",
        totalRentals: "Total Rentals",
        activeUsers: "Active Users",
        fleetSize: "Fleet Size",
        monthlyGrowth: "Monthly Growth",
        stationManagement: "Station Management",
        customerManagement: "Customer Management",
        staffManagement: "Staff Management",
        reportsAndAnalytics: "Reports & Analytics",
        availableVehicles: "Available Vehicles",
        noVehiclesFound: "No vehicles found",
        vehicleNotFound: "Vehicle Not Found",
        pricing: "Pricing",
        rentalInformation: "Rental Information",
        requirements: "Requirements",
        whatsIncluded: "What's Included",
        policies: "Policies",
        active: "Active",
        directions: "Directions",
        hour: "hour",
        day: "day",
        trips: "trips",
        moreVehicles: "more vehicles",
        close: "Close",
        howItWorks: "How It Works",
        browseVehicles: "Browse Vehicles",
        createAccount: "Create Account",
        creatingAccount: "Creating Account...",
        sendEmail: "Send Email",
        viewAll: "View All",
        highDemandExpected: "High Demand Expected",
        optimalOperatingHours: "Optimal Operating Hours",
        availability: "Availability",
        allStatus: "All Status",
        vehicles: "Vehicles",
        cashPayment: "Cash Payment",
        depositReturn: "Deposit Return",
        pleaseSignInToViewDashboard: "Please sign in to view your dashboard.",
        searchVehicles: "Search vehicles...",
        updateStatus: "Update Status",
        checkIn: "Check In",
        checkOut: "Check Out",
        scheduleMaintenance: "Schedule Maintenance",
        staffAccessRequired: "Staff access required.",
        fillAllFields: "Please fill in all fields.",
        signInSuccess: "You have successfully signed in.",
        chargers: "Chargers",
        searchPlaceholder: "Search by vehicle name or brand...",
        vehiclesHeaderTitle: "Find Your Perfect EV",
        vehiclesHeaderSubtitle:
          "Choose from our premium fleet of electric vehicles and experience the future of transportation",
        allLocations: "All Locations",
        priceRangeLabel: "Price Range",
        sortBy: "Sort By",
        nameAsc: "Name (A-Z)",
        priceLowToHigh: "Price (Low to High)",
        priceHighToLow: "Price (High to Low)",
        highestRated: "Highest Rated",
        longestRange: "Longest Range",
        viewMode: "View Mode",
        grid: "Grid",
        list: "List",
        vehiclesFound: "vehicles found",
        pickupLocation: "Pickup location",
        searchButton: "Search",
        filters: "Filters",
        searchLocations: "Search locations...",
        noLocationsFound: "No locations found",
        allPrices: "All Prices",
        under50Hour: "Under $50/hour",
        price50100Hour: "$50-100/hour",
        over100Hour: "Over $100/hour",
        vehicleType: "Vehicle Type",
        allTypes: "All Types",
        // Hero section
        heroTitle: "Drive the Future with Electric Vehicles",
        heroSubtitle:
          "Rent premium electric vehicles by the hour or day. Clean, efficient, and ready for your next adventure.",
        enterPickupLocation: "Enter pickup location...",
        electricVehicles: "Electric Vehicles",
        chargingStations: "Charging Stations",
        support: "Support",
        userRating: "User Rating",
        // How It Works
        howItWorksSubtitle:
          "Get on the road with electric vehicles in just 3 simple steps",
        step1Title: "1. Find Your Vehicle",
        step1Description:
          "Browse our fleet of electric vehicles and choose the perfect one for your needs",
        step2Title: "2. Book Instantly",
        step2Description:
          "Reserve your vehicle with flexible hourly or daily rates, available 24/7",
        step3Title: "3. Drive Electric",
        step3Description:
          "Pick up your fully charged vehicle and enjoy a clean, quiet, and efficient ride",
        // Benefits
        whyChooseElectric: "Why Choose Electric?",
        ecoFriendly: "Eco-Friendly",
        ecoFriendlyDescription:
          "Zero emissions driving helps reduce your carbon footprint and protect the environment",
        costEffective: "Cost Effective",
        costEffectiveDescription:
          "Lower operating costs with no fuel expenses and reduced maintenance needs",
        premiumExperience: "Premium Experience",
        premiumExperienceDescription:
          "Enjoy quiet operation, instant torque, and cutting-edge technology features",
        // Stats
        averageRange: "Average Range",
        fastCharging: "Fast Charging",
        happyCustomers: "Happy Customers",
        // CTA
        readyToGoElectric: "Ready to Go Electric?",
        ctaSubtitle:
          "Join thousands of drivers who have made the switch to sustainable transportation",
        // Footer
        footerAbout:
          "Leading the future of sustainable transportation with premium electric vehicle rentals.",
        company: "Company",
        careers: "Careers",
        press: "Press",
        blog: "Blog",
        safety: "Safety",
        locations: "Locations",
        district1Station: "District 1 Station",
        district7Station: "District 7 Station",
        airportStation: "Airport Station",
        district3Station: "District 3 Station",
        copyright: "© 2024 EVRentals. All rights reserved.",
        // Other
        availableElectricVehicles: "Available Electric Vehicles",
        vehiclesFoundLocation: "vehicles found • Ho Chi Minh City",
        nearestFirst: "Nearest First",
        seatsLabel: "seats",
        kmRangeLabel: "km range",
        tripsLabel: "trips",
        featuredVehiclesSubtitle:
          "Choose from our premium fleet of electric vehicles, all fully charged and ready to go",
        status: "Status",
        recommended: "Recommended",
      },
      register: {
        createAccount: "Create your account",
        joinElectric: "Join thousands of drivers going electric",
        fullName: "Full Name",
        fullNamePlaceholder: "John Doe",
        emailAddress: "Email Address",
        emailPlaceholder: "john@example.com",
        phoneNumber: "Phone Number",
        phonePlaceholder: "+1 (555) 123-4567",
        dateOfBirth: "Date of Birth",
        password: "Password",
        passwordPlaceholder: "Create a strong password",
        confirmPassword: "Confirm Password",
        confirmPasswordPlaceholder: "Confirm your password",
        agreeToTermsText: "I agree to the",
        termsOfService: "Terms of Service",
        and: "and",
        privacyPolicy: "Privacy Policy",
        agreementRequired: "Agreement Required",
        agreeToTerms: "Please agree to the terms and conditions.",
        passwordMismatch: "Password Mismatch",
        passwordsDoNotMatch: "Passwords do not match.",
        welcome: "Welcome to EVRentals!",
        accountCreated: "Your account has been created successfully.",
        error: "Error",
        fillAllFields: "Please fill in all required fields.",
        alreadyHaveAccount: "Already have an account?",
        signInHere: "Sign in here",
        demoNote: "Demo: Fill out the form to create an account instantly",
      },
      help: {
        title: "Help Center",
        subtitle:
          "Find answers to common questions or get in touch with our support team",
        searchPlaceholder: "Search for help...",
        searchHelp: "Search Help",
        faqTitle: "Frequently Asked Questions",
        contactTitle: "Contact Support",
        contactSubtitle:
          "Can't find what you're looking for? Our support team is here to help.",
        phone: "Phone Support",
        email: "Email Support",
        liveChat: "Live Chat",
        documentation: "Documentation",
        faq1Question: "How do I book a vehicle?",
        faq1Answer:
          "Simply browse our vehicle fleet, select your preferred car, choose your rental period, and complete the booking process online. You'll receive instant confirmation.",
        faq2Question: "What documents do I need?",
        faq2Answer:
          "You'll need a valid driver's license (minimum 1 year), government-issued ID, and a payment method. Upload these documents during the booking process.",
        faq3Question: "How do I extend my rental?",
        faq3Answer:
          "You can extend your rental through our mobile app or by calling customer support. Extensions are subject to vehicle availability.",
        faq4Question: "What if the vehicle breaks down?",
        faq4Answer:
          "Call our 24/7 emergency line immediately. We'll arrange roadside assistance or a replacement vehicle at no additional cost.",
        faq5Question: "How do I charge the vehicle?",
        faq5Answer:
          "All our vehicles come with charging instructions and access to our partner charging network. Free charging is available at our station locations.",
        faq6Question: "What's the cancellation policy?",
        faq6Answer:
          "Free cancellation up to 24 hours before your rental. Cancellations within 24 hours incur a 50% charge. No refund for no-shows.",
      },
      vehicleTypes: {
        SUV: "SUV",
        Sedan: "Sedan",
        Hatchback: "Hatchback",
        Crossover: "Crossover",
        Coupe: "Coupe",
        Motorcycle: "Motorcycle",
        Scooter: "Scooter",
        Bike: "E-bike",
        Bus: "Bus",
        Van: "Van",
        Truck: "Truck",
      },
      settings: {
        title: "Account Settings",
        subtitle: "Manage your profile, security, and preferences",
        profile: "Profile",
        security: "Security",
        notifications: "Notifications",
        billing: "Billing",
        language: "Language",
        selectLanguage: "Select Language",
        english: "English",
        vietnamese: "Tiếng Việt",
        personalInfo: "Personal Information",
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email Address",
        phone: "Phone Number",
        dateOfBirth: "Date of Birth",
        driversLicense: "Driver's License",
        licenseNumber: "License Number",
        expiryDate: "Expiry Date",
        saveChanges: "Save Changes",
        changePassword: "Change Password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmPassword: "Confirm Password",
        twoFactorAuth: "Two-Factor Authentication",
        enable2FA: "Enable 2FA",
        emailNotifications: "Email Notifications",
        smsNotifications: "SMS Notifications",
        pushNotifications: "Push Notifications",
        bookingConfirmations: "Booking Confirmations",
        promotionalEmails: "Promotional Emails",
        paymentMethods: "Payment Methods",
        addPaymentMethod: "Add Payment Method",
        billingHistory: "Billing History",
      },
      dashboard: {
        welcome: "Welcome back",
        totalRentals: "Total Rentals",
        totalSpent: "Total Spent",
        hoursRented: "Hours Rented",
        co2Saved: "CO₂ Saved",
        currentRental: "Current Rental",
        rentalHistory: "Rental History",
        upcomingBookings: "Upcoming Bookings",
        quickActions: "Quick Actions",
        viewAllVehicles: "View All Vehicles",
        manageBookings: "Manage Bookings",
        updateProfile: "Update Profile",
        overview: "Here's an overview of your electric vehicle rental activity",
      },
      booking: {
        selectVehicle: "Select Vehicle",
        selectDates: "Select Dates",
        pickupLocation: "Pickup Location",
        returnLocation: "Return Location",
        totalCost: "Total Cost",
        confirmBooking: "Confirm Booking",
        bookingConfirmed: "Booking Confirmed",
        bookingDetails: "Booking Details",
        startDate: "Start Date",
        endDate: "End Date",
        duration: "Duration",
        insurance: "Insurance",
        subtotal: "Subtotal",
        tax: "Tax",
        total: "Total",
      },
      footer: {
        aboutUs: "About Us",
        contact: "Contact",
        support: "Support",
        terms: "Terms of Service",
        privacy: "Privacy Policy",
        followUs: "Follow Us",
        copyright: "© 2025 E-Route Rent. All rights reserved.",
      },
    },
    vi: {
      nav: {
        home: "Trang chủ",
        vehicles: "Phương tiện",
        stations: "Trạm",
        about: "Giới thiệu",
        contact: "Liên hệ",
        login: "Đăng nhập",
        register: "Đăng ký",
        logout: "Đăng xuất",
        dashboard: "Bảng điều khiển",
        bookings: "Đặt chỗ",
        settings: "Cài đặt",
      },
      vehicle: {
        condition: {
          excellent: "Xuất sắc",
          good: "Tốt",
          fair: "Khá",
          poor: "Kém",
        },
        conditionStatus: "Tình trạng",
        mileage: "Số km",
        lastMaintenance: "Bảo dưỡng cuối",
        fuelEfficiency: "Hiệu suất",
        inspectionDate: "Kiểm tra",
        insuranceExpiry: "Bảo hiểm",
        maintenanceDue: "Cần bảo dưỡng",
      },
      common: {
        search: "Tìm kiếm",
        filter: "Lọc",
        sort: "Sắp xếp",
        price: "Giá",
        location: "Vị trí",
        available: "Có sẵn",
        rented: "Đã thuê",
        maintenance: "Bảo trì",
        bookNow: "Đặt ngay",
        viewDetails: "Xem chi tiết",
        save: "Lưu",
        cancel: "Hủy",
        confirm: "Xác nhận",
        loading: "Đang tải...",
        error: "Lỗi",
        success: "Thành công",
        currency: "₫",
        perHour: "/giờ",
        perDay: "/ngày",
        battery: "Pin",
        range: "Quãng đường",
        seats: "Chỗ ngồi",
        rating: "Đánh giá",
        reviews: "đánh giá",
        kmRange: "km quãng đường",
        electricVehicle: "Xe điện",
        year: "năm",
        brand: "thương hiệu",
        aboutThisVehicle: "Giới thiệu xe này",
        findVehicles: "Tìm xe",
        featuredElectricVehicles: "Xe điện nổi bật",
        signUpNow: "Đăng ký ngay",
        welcomeBack: "Chào mừng trở lại",
        signInToAccount: "Đăng nhập vào tài khoản của bạn để tiếp tục",
        loginAs: "Đăng nhập với vai trò",
        customer: "Khách hàng",
        staff: "Nhân viên",
        admin: "Quản trị viên",
        email: "Email",
        password: "Mật khẩu",
        signIn: "Đăng nhập",
        signingIn: "Đang đăng nhập...",
        stationStaff: "Nhân viên trạm",
        administrator: "Quản trị viên",
        emailAddress: "Địa chỉ email",
        enterYourPassword: "Nhập mật khẩu của bạn",
        forgotYourPassword: "Quên mật khẩu?",
        continueWithGoogle: "Tiếp tục với Google",
        continueWithFacebook: "Tiếp tục với Facebook",
        dontHaveAnAccount: "Chưa có tài khoản?",
        demoNote: "Demo: Sử dụng bất kỳ email và mật khẩu nào để đăng nhập",
        welcomeUser: "Chào mừng",
        passwordAndSecurity: "Mật khẩu & Bảo mật",
        currentPassword: "Mật khẩu hiện tại",
        newPassword: "Mật khẩu mới",
        confirmNewPassword: "Xác nhận mật khẩu mới",
        updatePassword: "Cập nhật mật khẩu",
        twoFactorAuthentication: "Xác thực hai yếu tố",
        accessDenied: "Truy cập bị từ chối",
        adminAccessRequired: "Cần quyền truy cập quản trị viên.",
        staffDashboard: "Bảng điều khiển nhân viên",
        adminDashboard: "Bảng điều khiển quản trị",
        evRentalsManagementSystem: "Hệ thống quản lý EVRentals",
        totalFleet: "Tổng số phương tiện",
        todaysRevenue: "Doanh thu hôm nay",
        cashPayments: "Thanh toán tiền mặt",
        digitalPayments: "Thanh toán số",
        returnsToday: "Trả xe hôm nay",
        revenueToday: "Doanh thu hôm nay",
        newCustomers: "Khách hàng mới",
        totalRevenue: "Tổng doanh thu",
        totalRentals: "Tổng số lần thuê",
        activeUsers: "Người dùng hoạt động",
        fleetSize: "Kích thước đội xe",
        monthlyGrowth: "Tăng trưởng hàng tháng",
        stationManagement: "Quản lý trạm",
        customerManagement: "Quản lý khách hàng",
        staffManagement: "Quản lý nhân viên",
        reportsAndAnalytics: "Báo cáo & Phân tích",
        availableVehicles: "Phương tiện có sẵn",
        noVehiclesFound: "Không tìm thấy phương tiện",
        vehicleNotFound: "Không tìm thấy phương tiện",
        pricing: "Giá cả",
        rentalInformation: "Thông tin thuê xe",
        requirements: "Yêu cầu",
        whatsIncluded: "Bao gồm",
        policies: "Chính sách",
        active: "Hoạt động",
        directions: "Chỉ đường",
        hour: "giờ",
        day: "ngày",
        trips: "chuyến",
        moreVehicles: "xe khác",
        close: "Đóng",
        howItWorks: "Cách hoạt động",
        browseVehicles: "Duyệt xe",
        createAccount: "Tạo tài khoản",
        creatingAccount: "Đang tạo tài khoản...",
        sendEmail: "Gửi email",
        viewAll: "Xem tất cả",
        highDemandExpected: "Dự kiến nhu cầu cao",
        optimalOperatingHours: "Giờ hoạt động tối ưu",
        availability: "Tình trạng",
        allStatus: "Tất cả trạng thái",
        vehicles: "Phương tiện",
        cashPayment: "Thanh toán tiền mặt",
        depositReturn: "Trả cọc",
        pleaseSignInToViewDashboard:
          "Vui lòng đăng nhập để xem bảng điều khiển của bạn.",
        searchVehicles: "Tìm kiếm phương tiện...",
        updateStatus: "Cập nhật trạng thái",
        checkIn: "Nhận xe",
        checkOut: "Xuất xe",
        scheduleMaintenance: "Lên lịch bảo trì",
        staffAccessRequired: "Cần quyền truy cập nhân viên.",
        fillAllFields: "Vui lòng điền đầy đủ thông tin.",
        signInSuccess: "Bạn đã đăng nhập thành công.",
        chargers: "Trạm sạc",
        searchPlaceholder: "Tìm kiếm theo tên xe hoặc thương hiệu...",
        vehiclesHeaderTitle: "Tìm Xe Điện Hoàn Hảo Của Bạn",
        vehiclesHeaderSubtitle:
          "Chọn từ đội xe điện cao cấp của chúng tôi và trải nghiệm tương lai của giao thông vận tải",
        allLocations: "Tất cả địa điểm",
        priceRangeLabel: "Khoảng giá",
        sortBy: "Sắp xếp theo",
        nameAsc: "Tên (A-Z)",
        priceLowToHigh: "Giá (Thấp đến Cao)",
        priceHighToLow: "Giá (Cao đến Thấp)",
        highestRated: "Đánh giá cao nhất",
        longestRange: "Quãng đường xa nhất",
        viewMode: "Chế độ xem",
        grid: "Lưới",
        list: "Danh sách",
        vehiclesFound: "xe được tìm thấy",
        pickupLocation: "Địa điểm nhận xe",
        searchButton: "Tìm kiếm",
        filters: "Bộ lọc",
        searchLocations: "Tìm kiếm địa điểm...",
        noLocationsFound: "Không tìm thấy địa điểm nào",
        allPrices: "Tất cả giá",
        under50Hour: "Dưới 50$/giờ",
        price50100Hour: "50-100$/giờ",
        over100Hour: "Trên 100$/giờ",
        vehicleType: "Loại xe",
        allTypes: "Tất cả loại",
        // Hero section
        heroTitle: "Lái Xe Tương Lai Với Xe Điện",
        heroSubtitle:
          "Thuê xe điện cao cấp theo giờ hoặc ngày. Sạch sẽ, hiệu quả và sẵn sàng cho cuộc phiêu lưu tiếp theo của bạn.",
        enterPickupLocation: "Nhập địa điểm nhận xe...",
        electricVehicles: "Xe Điện",
        chargingStations: "Trạm Sạc",
        support: "Hỗ Trợ",
        userRating: "Đánh Giá Người Dùng",
        // How It Works
        howItWorksSubtitle: "Lên đường với xe điện chỉ trong 3 bước đơn giản",
        step1Title: "1. Tìm Xe Của Bạn",
        step1Description:
          "Duyệt đội xe điện của chúng tôi và chọn chiếc xe hoàn hảo cho nhu cầu của bạn",
        step2Title: "2. Đặt Ngay Lập Tức",
        step2Description:
          "Đặt xe với mức giá linh hoạt theo giờ hoặc ngày, có sẵn 24/7",
        step3Title: "3. Lái Xe Điện",
        step3Description:
          "Nhận xe đã sạc đầy và tận hưởng chuyến đi sạch sẽ, yên tĩnh và hiệu quả",
        // Benefits
        whyChooseElectric: "Tại Sao Chọn Xe Điện?",
        ecoFriendly: "Thân Thiện Với Môi Trường",
        ecoFriendlyDescription:
          "Lái xe không phát thải giúp giảm dấu chân carbon và bảo vệ môi trường",
        costEffective: "Tiết Kiệm Chi Phí",
        costEffectiveDescription:
          "Chi phí vận hành thấp hơn với không có chi phí nhiên liệu và bảo trì giảm",
        premiumExperience: "Trải Nghiệm Cao Cấp",
        premiumExperienceDescription:
          "Tận hưởng hoạt động yên tĩnh, mô-men xoắn tức thời và các tính năng công nghệ tiên tiến",
        // Stats
        averageRange: "Quãng Đường Trung Bình",
        fastCharging: "Sạc Nhanh",
        happyCustomers: "Khách Hàng Hài Lòng",
        // CTA
        readyToGoElectric: "Sẵn Sàng Chuyển Sang Xe Điện?",
        ctaSubtitle:
          "Tham gia cùng hàng nghìn người lái xe đã chuyển sang giao thông bền vững",
        // Footer
        footerAbout:
          "Dẫn dắt tương lai của giao thông bền vững với dịch vụ cho thuê xe điện cao cấp.",
        company: "Công Ty",
        careers: "Tuyển Dụng",
        press: "Báo Chí",
        blog: "Blog",
        safety: "An Toàn",
        locations: "Địa Điểm",
        district1Station: "Trạm Quận 1",
        district7Station: "Trạm Quận 7",
        airportStation: "Trạm Sân Bay",
        district3Station: "Trạm Quận 3",
        copyright: "© 2024 EVRentals. Tất cả quyền được bảo lưu.",
        // Other
        availableElectricVehicles: "Xe Điện Có Sẵn",
        vehiclesFoundLocation: "xe được tìm thấy • Thành phố Hồ Chí Minh",
        nearestFirst: "Gần Nhất Trước",
        seatsLabel: "chỗ ngồi",
        kmRangeLabel: "km quãng đường",
        tripsLabel: "chuyến",
        featuredVehiclesSubtitle:
          "Chọn từ đội xe điện cao cấp của chúng tôi, tất cả đều đã sạc đầy và sẵn sàng khởi hành",
        status: "Trạng thái",
        recommended: "Khuyến nghị",
      },
      register: {
        createAccount: "Tạo tài khoản của bạn",
        joinElectric: "Tham gia cùng hàng nghìn người lái xe điện",
        fullName: "Họ và tên",
        fullNamePlaceholder: "Nguyễn Văn A",
        emailAddress: "Địa chỉ email",
        emailPlaceholder: "nguyen@example.com",
        phoneNumber: "Số điện thoại",
        phonePlaceholder: "+84 123 456 789",
        dateOfBirth: "Ngày sinh",
        password: "Mật khẩu",
        passwordPlaceholder: "Tạo mật khẩu mạnh",
        confirmPassword: "Xác nhận mật khẩu",
        confirmPasswordPlaceholder: "Xác nhận mật khẩu của bạn",
        agreeToTermsText: "Tôi đồng ý với",
        termsOfService: "Điều khoản dịch vụ",
        and: "và",
        privacyPolicy: "Chính sách bảo mật",
        agreementRequired: "Yêu cầu đồng ý",
        agreeToTerms: "Vui lòng đồng ý với các điều khoản và điều kiện.",
        passwordMismatch: "Mật khẩu không khớp",
        passwordsDoNotMatch: "Mật khẩu không khớp.",
        welcome: "Chào mừng đến với EVRentals!",
        accountCreated: "Tài khoản của bạn đã được tạo thành công.",
        error: "Lỗi",
        fillAllFields: "Vui lòng điền đầy đủ thông tin bắt buộc.",
        alreadyHaveAccount: "Đã có tài khoản?",
        signInHere: "Đăng nhập tại đây",
        demoNote: "Demo: Điền vào biểu mẫu để tạo tài khoản ngay lập tức",
      },
      help: {
        title: "Trung tâm trợ giúp",
        subtitle:
          "Tìm câu trả lời cho các câu hỏi thường gặp hoặc liên hệ với đội ngũ hỗ trợ của chúng tôi",
        searchPlaceholder: "Tìm kiếm trợ giúp...",
        searchHelp: "Tìm kiếm trợ giúp",
        faqTitle: "Câu hỏi thường gặp",
        contactTitle: "Liên hệ hỗ trợ",
        contactSubtitle:
          "Không tìm thấy những gì bạn đang tìm kiếm? Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ.",
        phone: "Hỗ trợ qua điện thoại",
        email: "Hỗ trợ qua email",
        liveChat: "Trò chuyện trực tiếp",
        documentation: "Tài liệu",
        faq1Question: "Làm thế nào để đặt xe?",
        faq1Answer:
          "Chỉ cần duyệt đội xe của chúng tôi, chọn xe bạn thích, chọn thời gian thuê và hoàn tất quy trình đặt xe trực tuyến. Bạn sẽ nhận được xác nhận ngay lập tức.",
        faq2Question: "Tôi cần những giấy tờ gì?",
        faq2Answer:
          "Bạn cần bằng lái xe hợp lệ (tối thiểu 1 năm), giấy tờ tùy thân do chính phủ cấp và phương thức thanh toán. Tải lên các tài liệu này trong quá trình đặt xe.",
        faq3Question: "Làm thế nào để gia hạn thuê xe?",
        faq3Answer:
          "Bạn có thể gia hạn thuê xe thông qua ứng dụng di động của chúng tôi hoặc gọi điện cho bộ phận chăm sóc khách hàng. Việc gia hạn phụ thuộc vào tình trạng xe có sẵn.",
        faq4Question: "Điều gì xảy ra nếu xe bị hỏng?",
        faq4Answer:
          "Gọi ngay đường dây khẩn cấp 24/7 của chúng tôi. Chúng tôi sẽ sắp xếp hỗ trợ bên đường hoặc xe thay thế mà không mất thêm chi phí.",
        faq5Question: "Làm thế nào để sạc xe?",
        faq5Answer:
          "Tất cả xe của chúng tôi đều đi kèm với hướng dẫn sạc và quyền truy cập vào mạng lưới trạm sạc đối tác. Sạc miễn phí có sẵn tại các địa điểm trạm của chúng tôi.",
        faq6Question: "Chính sách hủy bỏ như thế nào?",
        faq6Answer:
          "Hủy miễn phí lên đến 24 giờ trước khi thuê. Hủy trong vòng 24 giờ sẽ bị tính phí 50%. Không hoàn tiền cho trường hợp không đến.",
      },
      vehicleTypes: {
        SUV: "SUV",
        Sedan: "Sedan",
        Hatchback: "Hatchback",
        Crossover: "Crossover",
        Coupe: "Coupe",
        Motorcycle: "Xe máy",
        Scooter: "Xe tay ga",
        Bike: "Xe đạp điện",
        Bus: "Xe buýt",
        Van: "Xe van",
        Truck: "Xe tải",
      },
      settings: {
        title: "Cài đặt tài khoản",
        subtitle: "Quản lý hồ sơ, bảo mật và tùy chọn của bạn",
        profile: "Hồ sơ",
        security: "Bảo mật",
        notifications: "Thông báo",
        billing: "Thanh toán",
        language: "Ngôn ngữ",
        selectLanguage: "Chọn ngôn ngữ",
        english: "English",
        vietnamese: "Tiếng Việt",
        personalInfo: "Thông tin cá nhân",
        firstName: "Tên",
        lastName: "Họ",
        email: "Địa chỉ email",
        phone: "Số điện thoại",
        dateOfBirth: "Ngày sinh",
        driversLicense: "Giấy phép lái xe",
        licenseNumber: "Số giấy phép",
        expiryDate: "Ngày hết hạn",
        saveChanges: "Lưu thay đổi",
        changePassword: "Đổi mật khẩu",
        currentPassword: "Mật khẩu hiện tại",
        newPassword: "Mật khẩu mới",
        confirmPassword: "Xác nhận mật khẩu",
        twoFactorAuth: "Xác thực hai yếu tố",
        enable2FA: "Bật 2FA",
        emailNotifications: "Thông báo email",
        smsNotifications: "Thông báo SMS",
        pushNotifications: "Thông báo đẩy",
        bookingConfirmations: "Xác nhận đặt chỗ",
        promotionalEmails: "Email khuyến mãi",
        paymentMethods: "Phương thức thanh toán",
        addPaymentMethod: "Thêm phương thức thanh toán",
        billingHistory: "Lịch sử thanh toán",
      },
      dashboard: {
        welcome: "Chào mừng trở lại",
        totalRentals: "Tổng số lần thuê",
        totalSpent: "Tổng chi phí",
        hoursRented: "Giờ đã thuê",
        co2Saved: "CO₂ tiết kiệm",
        currentRental: "Đang thuê",
        rentalHistory: "Lịch sử thuê",
        upcomingBookings: "Đặt chỗ sắp tới",
        quickActions: "Hành động nhanh",
        viewAllVehicles: "Xem tất cả phương tiện",
        manageBookings: "Quản lý đặt chỗ",
        updateProfile: "Cập nhật hồ sơ",
        overview: "Đây là tổng quan về hoạt động thuê xe điện của bạn",
      },
      booking: {
        selectVehicle: "Chọn phương tiện",
        selectDates: "Chọn ngày",
        pickupLocation: "Địa điểm nhận",
        returnLocation: "Địa điểm trả",
        totalCost: "Tổng chi phí",
        confirmBooking: "Xác nhận đặt chỗ",
        bookingConfirmed: "Đặt chỗ đã xác nhận",
        bookingDetails: "Chi tiết đặt chỗ",
        startDate: "Ngày bắt đầu",
        endDate: "Ngày kết thúc",
        duration: "Thời gian",
        insurance: "Bảo hiểm",
        subtotal: "Tạm tính",
        tax: "Thuế",
        total: "Tổng cộng",
      },
      footer: {
        aboutUs: "Về chúng tôi",
        contact: "Liên hệ",
        support: "Hỗ trợ",
        terms: "Điều khoản dịch vụ",
        privacy: "Chính sách bảo mật",
        followUs: "Theo dõi chúng tôi",
        copyright: "© 2025 E-Route Rent. Tất cả quyền được bảo lưu.",
      },
    },
  };

  const t = (key: string): string => {
    try {
      const keys = key.split(".");
      let current: unknown = translations[language];

      for (const k of keys) {
        if (current && typeof current === "object") {
          current = (current as Record<string, unknown>)[k];
        } else {
          return key;
        }
      }

      return typeof current === "string" ? current : key;
    } catch {
      return key;
    }
  };

  const value: TranslationContextType = {
    language,
    setLanguage,
    t,
    translations: translations[language],
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};
