import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookingStorage, BookingData } from "@/lib/booking-storage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vehicles } from "@/data/vehicles";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "@/contexts/TranslationContext";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { getVehicleById } from "@/data/vehicles";
import PaymentSystem from "@/components/PaymentSystem";
import { useVehicles } from "@/hooks/useApi";
import {
  PageTransition,
  FadeIn,
  SlideIn,
} from "@/components/LoadingComponents";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Upload,
  CreditCard,
  QrCode,
  Building,
  Banknote,
  Shield,
  CheckCircle,
  User,
  Check,
  FileText,
  MapPin,
  Smartphone,
  Download,
  Mail,
  Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { convertToVND } from "@/lib/currency";
import { useChargingContext } from "@/contexts/ChargingContext";
import { isLowBattery } from "@/lib/vehicle-constants";
import { QRCodeSVG } from "qrcode.react";
import { apiService } from "@/services/api";

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { chargingVehicles } = useChargingContext();
  const [isCheckingActiveBooking, setIsCheckingActiveBooking] = useState(true);

  // Use API data with fallback to static data
  const { data: apiVehicles, loading: vehiclesLoading } = useVehicles();
  const staticVehicle = id ? getVehicleById(id) : null;

  // ⚠️ VALIDATION: Check if user has active booking before allowing new booking
  useEffect(() => {
    const checkActiveBooking = async () => {
      try {
        const reservations = await apiService.getReservations();
        const activeReservations =
          reservations.reservations?.filter(
            (r) =>
              !["completed", "cancelled", "finished"].includes(
                r.status?.toLowerCase() || ""
              )
          ) || [];

        if (activeReservations.length > 0) {
          console.log(
            "[BookingPage] ❌ User has active booking:",
            activeReservations
          );
          toast({
            title: "Cannot Book",
            description:
              "You already have an active booking. Please complete or cancel your existing booking before making a new one.",
            variant: "destructive",
          });

          // Navigate back to vehicles page immediately
          navigate("/vehicles");
        } else {
          console.log("[BookingPage] ✅ No active bookings - allowing booking");
        }
      } catch (error) {
        console.error("[BookingPage] Error checking active bookings:", error);
        // If error, still allow booking (graceful degradation)
      } finally {
        setIsCheckingActiveBooking(false);
      }
    };

    checkActiveBooking();
  }, [toast, navigate]);

  // Find vehicle from API data or fallback to static
  console.log("[BookingPage] Looking for vehicle with id:", id);
  console.log(
    "[BookingPage] Available apiVehicles:",
    apiVehicles?.map((v) => ({
      vehicleId: v.vehicleId,
      uniqueVehicleId: v.uniqueVehicleId,
    }))
  );

  // First try to find by uniqueVehicleId matching the id
  let apiVehicle = apiVehicles?.find((v) => v.uniqueVehicleId === id);

  // If not found, try to find by matching with static data
  if (!apiVehicle && staticVehicle) {
    console.log(
      "[BookingPage] Not found by uniqueVehicleId, trying to match with static data"
    );
    console.log(
      "[BookingPage] Static vehicle uniqueVehicleId:",
      staticVehicle.uniqueVehicleId
    );
    apiVehicle = apiVehicles?.find(
      (v) => v.uniqueVehicleId === staticVehicle.uniqueVehicleId
    );
  }

  console.log("[BookingPage] Found apiVehicle:", apiVehicle);
  const vehicle = apiVehicle
    ? {
      // Map API data to expected format
      id: apiVehicle.uniqueVehicleId,
      name: `${apiVehicle.modelId} Vehicle`,
      brand: "VinFast",
      model: apiVehicle.modelId,
      type: "Scooter",
      year: 2024,
      seats: 2,
      range: apiVehicle.maxRangeKm,
      batteryLevel: apiVehicle.batteryLevel,
      pricePerHour: apiVehicle.pricePerHour,
      pricePerDay: apiVehicle.pricePerDay,
      rating: apiVehicle.rating,
      reviewCount: apiVehicle.reviewCount,
      trips: apiVehicle.trips,
      mileage: apiVehicle.mileage,
      availability: apiVehicle.status,
      condition: apiVehicle.condition,
      image: apiVehicle.image || "",
      location: apiVehicle.location,
      stationId: apiVehicle.stationId.toString(),
      stationName: "Unknown Station",
      stationAddress: "",
      features: [],
      description: "",
      fuelEfficiency: apiVehicle.fuelEfficiency,
      lastMaintenance: apiVehicle.lastMaintenance,
      inspectionDate: apiVehicle.inspectionDate,
      insuranceExpiry: apiVehicle.insuranceExpiry,
      createdAt: apiVehicle.createdAt,
      updatedAt: apiVehicle.updatedAt,
    }
    : staticVehicle;

  // Check if vehicle is currently charging
  const isCharging =
    vehicle &&
    (chargingVehicles.has(vehicle.id) ||
      chargingVehicles.has('uniqueVehicleId' in vehicle ? (vehicle as any).uniqueVehicleId : ""));

  // Check if vehicle has low battery
  const hasLowBattery = vehicle && isLowBattery(vehicle.batteryLevel);

  // Redirect if vehicle is charging or has low battery
  useEffect(() => {
    if (isCharging) {
      toast({
        title: "Xe không khả dụng",
        description: "Xe này đang được sạc pin và không thể đặt ngay bây giờ.",
        variant: "destructive",
      });
      navigate("/vehicles");
    } else if (hasLowBattery) {
      toast({
        title: "Xe không khả dụng",
        description: "Xe này có pin yếu và cần được sạc trước khi có thể đặt.",
        variant: "destructive",
      });
      navigate("/vehicles");
    }
  }, [isCharging, hasLowBattery, navigate, toast]);

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const getTimeStr = () => {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // THÊM MỚI: Helper function để tính End Time tối thiểu (Start Time + 1 giờ)
  const calculateMinimumEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    // Thêm 1 giờ
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const endHours = endDate.getHours().toString().padStart(2, "0");
    const endMinutes = endDate.getMinutes().toString().padStart(2, "0");

    return `${endHours}:${endMinutes}`;
  };
  // THÊM MỚI: Validate thời gian thuê tối thiểu cho hourly
  const validateHourlyRental = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours >= 1; // Tối thiểu 1 giờ
  };

  // THÊM MỚI: Function tính thời gian còn lại để pickup
  const calculateTimeToPickup = (
    selectedDate: string,
    selectedTime: string
  ) => {
    if (!selectedDate || !selectedTime) return null;

    const now = new Date();
    const [hours, minutes] = selectedTime.split(":").map(Number);

    // Tính thời gian kết thúc của pickup slot
    let pickupEndHour = hours;
    let pickupEndMinute = 0;

    if (minutes === 0) {
      // Slot XX:00 - XX:30 → có thể pickup đến XX:30
      pickupEndHour = hours;
      pickupEndMinute = 30;
    } else {
      // Slot XX:30 - (XX+1):00 → có thể pickup đến (XX+1):00
      pickupEndHour = hours + 1;
      pickupEndMinute = 0;
    }

    const pickupEndDateTime = new Date(selectedDate);
    pickupEndDateTime.setHours(pickupEndHour, pickupEndMinute, 0, 0);

    const diffMsToEnd = pickupEndDateTime.getTime() - now.getTime();

    // Nếu đã qua thời gian kết thúc pickup slot
    if (diffMsToEnd <= 0) return null;

    // ✅ FIX: Làm tròn lên để có số phút chính xác
    const diffMinutes = Math.ceil(diffMsToEnd / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;

    if (diffHours > 0) {
      if (remainingMinutes > 0) {
        return `You have ${diffHours} hour${diffHours !== 1 ? "s" : ""
          } and ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""
          } to pick up the vehicle`;
      } else {
        return `You have ${diffHours} hour${diffHours !== 1 ? "s" : ""
          } to pick up the vehicle`;
      }
    } else {
      return `You have ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""
        } to pick up the vehicle`;
    }
  };

  const handleRentalDurationChange = (value: string) => {
    setBookingData((prev) => {
      if (value === "hourly") {
        const bestSlot = getBestAvailableSlot();
        if (bestSlot) {
          const returnOptions = getReturnTimeOptions(bestSlot.value);
          const defaultReturnTime = returnOptions[0]?.value || "";

          return {
            ...prev,
            rentalDuration: value,
            endDate: prev.startDate,
            startTime: bestSlot.value,
            endTime: defaultReturnTime,
          };
        }
        return {
          ...prev,
          rentalDuration: value,
          endDate: prev.startDate,
        };
      } else {
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const tomorrowStr = `${tomorrow.getFullYear()}-${pad(
          tomorrow.getMonth() + 1
        )}-${pad(tomorrow.getDate())}`;
        const bestSlot = getBestAvailableSlot();
        const pickupSlot = bestSlot ? bestSlot.value : "09:00";
        return {
          ...prev,
          rentalDuration: value,
          startDate: getTodayStr(),
          endDate: tomorrowStr,
          startTime: pickupSlot,
          endTime: pickupSlot,
        };
      }
    });
  };

  // State for user data
  const [userData, setUserData] = useState({ 
    fullName: "",
    email: "",
    phone: "",
    licenseNumber: "",
  });
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  // Fetch user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoadingUserData(true);
        const token = localStorage.getItem("token");
        if (!token) {
          // If not logged in, use default values
          setUserData({
            fullName: "",
            email: "",
            phone: "",
            licenseNumber: "",
          });
          setIsLoadingUserData(false);
          return;
        }

        const response = await apiService.getCurrentUser();
        if (response.success && response.user) {
          const user = response.user;
          setUserData({
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            licenseNumber: user.licenseNumber || "",
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        // If error, use empty values
        setUserData({
          fullName: "",
          email: "",
          phone: "",
          licenseNumber: "",
        });
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserData();
  }, []);

  // ✅ FIX: Auto-select slot cho daily rental
  // Helper function để tạo best slot
  const createBestSlot = () => {
    const selectedDate = new Date(getTodayStr());
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    if (isToday) {
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();

      if (currentMinute >= 30) {
        return `${(currentHour + 1).toString().padStart(2, "0")}:00`;
      } else {
        return `${currentHour.toString().padStart(2, "0")}:30`;
      }
    }
    return "09:00"; // Default cho ngày tương lai
  };

  // ✅ FIX: Tomorrow date calculation
  const getTomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(
      tomorrow.getDate()
    )}`;
  };

  const [bookingData, setBookingData] = useState({
    startDate: getTodayStr(),
    endDate: getTomorrowStr(), // Auto-select tomorrow
    startTime: createBestSlot(), // Auto-select best slot
    endTime: getTimeStr(),
    rentalDuration: "daily",
    customerInfo: {
      fullName: "", // Will be auto-filled from API
      email: "", // Will be auto-filled from API
      phone: "", // Will be auto-filled from API
      driverLicense: "", // Will be auto-filled from API
    },
    paymentMethod: "wallet",
    reservationId: null as number | null, // Add reservationId field
  });

  // Update bookingData when userData is loaded
  useEffect(() => {
    if (!isLoadingUserData && userData.fullName) {
      setBookingData((prev) => ({
        ...prev,
        customerInfo: {
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          driverLicense: userData.licenseNumber,
        },
      }));
    }
  }, [isLoadingUserData, userData]);

  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Show loading while fetching API data
  if (vehiclesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Vehicle Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The vehicle you're trying to book doesn't exist.
          </p>
          <Button asChild>
            <Link to="/vehicles">Browse All Vehicles</Link>
          </Button>
        </div>
      </div>
    );
  }

  const calculateCost = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;

    if (bookingData.rentalDuration === "hourly") {
      // FIX: Tính toán đúng cho hourly rental dựa trên slot system
      const [startHour, startMinute] = bookingData.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = bookingData.endTime.split(":").map(Number);

      // Tính thời gian kết thúc của pickup slot
      let pickupEndHour = startHour;
      let pickupEndMinute = 0;

      if (startMinute === 0) {
        pickupEndHour = startHour;
        pickupEndMinute = 30;
      } else {
        pickupEndHour = startHour + 1;
        pickupEndMinute = 0;
      }
      const pickupEndTime = pickupEndHour * 60 + pickupEndMinute;
      let returnTime = endHour * 60 + endMinute;
      if (endHour === 0 && endMinute === 0) {
        returnTime = 24 * 60;
      }

      const diffMinutes = returnTime - pickupEndTime;
      const hours = Math.ceil(diffMinutes / 60);

      return Math.max(hours, 1) * vehicle.pricePerHour;
    } else {
      // DAILY: tính theo ngày, từ startTime ngày đầu đến endTime ngày cuối
      const start = new Date(
        `${bookingData.startDate}T${bookingData.startTime}`
      );
      const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // Tính số ngày
      // Đảm bảo ít nhất 1 ngày
      const minDays = Math.max(days, 1);
      return minDays * vehicle.pricePerDay;
    }
  };

  // 🚀 DI CHUYỂN CÁC HELPER FUNCTIONS LÊN ĐÂY (TRƯỚC handleRentalDurationChange)
  const getAvailablePickupSlots = () => {
    // Dựa vào ngày được chọn, không chỉ ngày hiện tại
    const selectedDate = new Date(bookingData.startDate);
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    let currentHour, currentMinute;

    if (isToday) {
      // Nếu chọn ngày hôm nay, dùng giờ hiện tại
      currentHour = today.getHours();
      currentMinute = today.getMinutes();
    } else {
      // Nếu chọn ngày tương lai, bắt đầu từ 00:00
      currentHour = 0;
      currentMinute = 0;
    }

    const slots = [];

    // Tính slot bắt đầu dựa trên thời gian hiện tại
    let startHour = currentHour;
    let startSlot = currentMinute >= 30 ? 30 : 0;

    // Nếu không phải hôm nay, bắt đầu từ slot đầu tiên (00:00)
    if (!isToday) {
      startHour = 0;
      startSlot = 0;
    }

    // Tạo các slots từ thời điểm hiện tại đến 23h
    for (let hour = startHour; hour < 23; hour++) {
      const minuteStart = hour === startHour ? startSlot : 0;

      // Slot 1: XX:00 - XX:30
      if (minuteStart === 0) {
        const timeStart = `${hour.toString().padStart(2, "0")}:00`;
        const timeEnd = `${hour.toString().padStart(2, "0")}:30`;
        slots.push({
          value: timeStart,
          label: `${timeStart} - ${timeEnd}`,
          pickupStart: timeStart,
          pickupEnd: timeEnd,
        });
      }

      // Slot 2: XX:30 - (XX+1):00
      if (hour <= 22) {
        const timeStart = `${hour.toString().padStart(2, "0")}:30`;
        const timeEnd = `${(hour + 1).toString().padStart(2, "0")}:00`;
        slots.push({
          value: timeStart,
          label: `${timeStart} - ${timeEnd}`,
          pickupStart: timeStart,
          pickupEnd: timeEnd,
        });
      }
    }

    return slots;
  };

  const getReturnTimeOptions = (pickupSlotStart: string) => {
    if (!pickupSlotStart) return [];

    const [startHour, startMinute] = pickupSlotStart.split(":").map(Number);

    // Tính thời gian kết thúc của pickup slot
    let pickupEndHour = startHour;
    let pickupEndMinute = 0;

    if (startMinute === 0) {
      // Slot XX:00 - XX:30 → kết thúc lúc XX:30
      pickupEndHour = startHour;
      pickupEndMinute = 30;
    } else {
      // Slot XX:30 - (XX+1):00 → kết thúc lúc (XX+1):00
      pickupEndHour = startHour + 1;
      pickupEndMinute = 0;
    }

    const options = [];
    // Cho phép thuê đến cuối ngày (24:00)
    const maxHours = 24 - pickupEndHour; // Tính số giờ tối đa có thể thuê
    for (let i = 1; i <= maxHours; i++) {
      const returnHour = pickupEndHour + i;
      const returnMinute = pickupEndMinute;

      if (returnHour > 24) break;
      let timeStr, timeValue;
      if (returnHour === 24 && returnMinute === 0) {
        timeStr = "24:00";
        timeValue = "00:00";
      } else if (returnHour === 24) {
        break;
      } else {
        timeStr = `${returnHour.toString().padStart(2, "0")}:${returnMinute
          .toString()
          .padStart(2, "0")}`;
        timeValue = timeStr;
      }

      options.push({
        value: timeValue,
        label: timeStr,
        duration: `${i} hour${i !== 1 ? "s" : ""}`,
      });
    }

    return options;
  };

  const getBestAvailableSlot = () => {
    const availableSlots = getAvailablePickupSlots();
    return availableSlots[0] || null;
  };

  const handlePickupSlotChange = (value: string) => {
    const returnOptions = getReturnTimeOptions(value);
    const defaultReturnTime = returnOptions[0]?.value || "";

    setBookingData((prev) => ({
      ...prev,
      startTime: value,
      endTime: defaultReturnTime,
    }));
  };

  const handleDailyPickupSlotChange = (value: string) => {
    setBookingData((prev) => ({
      ...prev,
      startTime: value,
      endTime: value,
    }));
  };

  const handleStartDateChange = (newStartDate: string) => {
    setBookingData((prev) => {
      if (prev.rentalDuration === "hourly") {
        const bestSlot = getBestAvailableSlot();
        if (bestSlot) {
          const returnOptions = getReturnTimeOptions(bestSlot.value);
          const defaultReturnTime = returnOptions[0]?.value || "";

          return {
            ...prev,
            startDate: newStartDate,
            endDate: newStartDate,
            startTime: bestSlot.value,
            endTime: defaultReturnTime,
          };
        }
        return {
          ...prev,
          startDate: newStartDate,
          endDate: newStartDate,
        };
      } else {
        const startDate = new Date(newStartDate);
        const currentEndDate = new Date(prev.endDate || newStartDate);

        let newEndDate = prev.endDate;
        if (currentEndDate <= startDate) {
          const nextDay = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          newEndDate = `${nextDay.getFullYear()}-${pad(
            nextDay.getMonth() + 1
          )}-${pad(nextDay.getDate())}`;
        }

        return {
          ...prev,
          startDate: newStartDate,
          endDate: newEndDate,
        };
      }
    });
  };

  const handleEndDateChange = (newEndDate: string) => {
    setBookingData((prev) => ({
      ...prev,
      endDate: newEndDate,
    }));
  };

  const baseCost = calculateCost();

  // Tính tiền cọc = giá cơ bản cho 1 đơn vị thời gian
  const calculateDeposit = () => {
    if (bookingData.rentalDuration === "hourly") {
      return vehicle.pricePerHour; // Cọc = giá 1 giờ
    } else {
      return vehicle.pricePerDay; // Cọc = giá 1 ngày  
    }
  };
  const deposit = calculateDeposit();
  const totalCost = baseCost + deposit;
  // Tính duration và format hiển thị
  const getRentalDetails = () => {
    if (bookingData.rentalDuration === "hourly") {
      const [startHour, startMinute] = bookingData.startTime.split(":").map(Number);
      const [endHour, endMinute] = bookingData.endTime.split(":").map(Number);

      let pickupEndHour = startHour;
      let pickupEndMinute = 0;

      if (startMinute === 0) {
        pickupEndHour = startHour;
        pickupEndMinute = 30;
      } else {
        pickupEndHour = startHour + 1;
        pickupEndMinute = 0;
      }

      const pickupEndTime = pickupEndHour * 60 + pickupEndMinute;
      let returnTime = endHour * 60 + endMinute;
      if (endHour === 0 && endMinute === 0) {
        returnTime = 24 * 60;
      }

      const diffMinutes = returnTime - pickupEndTime;
      const hours = Math.ceil(diffMinutes / 60);
      const actualHours = Math.max(hours, 1);

      return {
        unit: "hour",
        unitPrice: vehicle.pricePerHour,
        quantity: actualHours,
        displayText: `$${vehicle.pricePerHour.toFixed(2)} × ${actualHours} hour${actualHours !== 1 ? 's' : ''}`
      };
    } else {
      const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
      const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const actualDays = Math.max(days, 1);

      return {
        unit: "day",
        unitPrice: vehicle.pricePerDay,
        quantity: actualDays,
        displayText: `$${vehicle.pricePerDay.toFixed(2)} × ${actualDays} day${actualDays !== 1 ? 's' : ''}`
      };
    }
  };

  const rentalDetails = getRentalDetails();


  const handleInputChange = (field: string, value: string | boolean) => {
    setBookingData((prev) => {
      const keys = field.split(".");
      if (keys.length === 1) {
        // Simple field update
        return {
          ...prev,
          [field]: value,
        };
      } else if (keys.length === 2) {
        // Nested field update (e.g., customerInfo.fullName)
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        };
      }
      return prev;
    });
  };

  const renderBookingDetails = () => (
    <div className="space-y-6">
      {/* Rental Period */}
      <div id="rental-period">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Rental Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Rental Type</Label>
              <Select
                value={bookingData.rentalDuration}
                onValueChange={(value) => handleRentalDurationChange(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">
                    Hourly Rental - ${vehicle.pricePerHour}/hour
                  </SelectItem>
                  <SelectItem value="daily">
                    Daily Rental - ${vehicle.pricePerDay}/day
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2 text-sm text-muted-foreground">
                {bookingData.rentalDuration === "hourly" ? (
                  <span>
                    Selected: Hourly Rental - ${vehicle.pricePerHour} per hour
                    for {vehicle.name}
                  </span>
                ) : (
                  <span>
                    Selected: Daily Rental - ${vehicle.pricePerDay} per day for{" "}
                    {vehicle.name}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={bookingData.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="text-black"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={bookingData.endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  min={
                    bookingData.rentalDuration === "daily"
                      ? (() => {
                        const startDate = new Date(bookingData.startDate);
                        const nextDay = new Date(
                          startDate.getTime() + 24 * 60 * 60 * 1000
                        );
                        return `${nextDay.getFullYear()}-${pad(
                          nextDay.getMonth() + 1
                        )}-${pad(nextDay.getDate())}`;
                      })()
                      : bookingData.startDate
                  }
                  className="text-black"
                  required
                  disabled={bookingData.rentalDuration === "hourly"} // DISABLE KHI HOURLY
                />

                {/* THÊM THÔNG BÁO CHO HOURLY */}
                {bookingData.rentalDuration === "hourly" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    For hourly rental, end date is same as start date
                  </p>
                )}
                {bookingData.rentalDuration === "daily" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum rental is 1 day - select at least tomorrow
                  </p>
                )}
              </div>
            </div>

            {/* THÊM: Start Time và End Time hiển thị cho cả Hourly và Daily */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">
                  {bookingData.rentalDuration === "hourly"
                    ? "Pickup Time Slot *"
                    : "Pickup Time Slot *"}
                </Label>
                {bookingData.rentalDuration === "hourly" ? (
                  <Select
                    value={bookingData.startTime}
                    onValueChange={handlePickupSlotChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pickup time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePickupSlots().map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={bookingData.startTime}
                    onValueChange={handleDailyPickupSlotChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pickup time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePickupSlots().map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* ✨ THÊM MỚI: Countdown timer cho hourly rental */}
                {bookingData.rentalDuration === "hourly" &&
                  bookingData.startTime && (
                    <div className="mt-2">
                      {(() => {
                        const timeToPickup = calculateTimeToPickup(
                          bookingData.startDate,
                          bookingData.startTime
                        );
                        if (timeToPickup) {
                          return (
                            <div className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-700 font-medium">
                                {timeToPickup}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}

                {bookingData.rentalDuration === "hourly" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Select a pick up time - the car must be picked up within
                    this time
                  </p>
                )}

                {/* ✨ THÊM MỚI: Countdown timer cho daily rental */}
                {bookingData.rentalDuration === "daily" &&
                  bookingData.startTime && (
                    <div className="mt-2">
                      {(() => {
                        const timeToPickup = calculateTimeToPickup(
                          bookingData.startDate,
                          bookingData.startTime
                        );
                        if (timeToPickup) {
                          return (
                            <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
                              <Clock className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">
                                {timeToPickup}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}

                {bookingData.rentalDuration === "daily" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Select a pick up time - the car must be picked up within
                    this time
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="endTime">
                  {bookingData.rentalDuration === "hourly"
                    ? "Return Time *"
                    : "Return Time Slot *"}
                </Label>
                {bookingData.rentalDuration === "hourly" ? (
                  <Select
                    value={bookingData.endTime}
                    onValueChange={(value) =>
                      handleInputChange("endTime", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select return time" />
                    </SelectTrigger>
                    <SelectContent>
                      {getReturnTimeOptions(bookingData.startTime).map(
                        (option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label} ({option.duration})
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-2 border rounded-md bg-secondary/50">
                    <span className="text-sm text-muted-foreground">
                      {bookingData.startTime
                        ? (() => {
                          const [hour, minute] = bookingData.startTime
                            .split(":")
                            .map(Number);
                          const endHour = minute === 0 ? hour : hour + 1;
                          const endMinute = minute === 0 ? 30 : 0;
                          const endTime = `${endHour
                            .toString()
                            .padStart(2, "0")}:${endMinute
                              .toString()
                              .padStart(2, "0")}`;
                          return `${bookingData.startTime} - ${endTime}`;
                        })()
                        : "Select pickup slot first"}
                    </span>
                  </div>
                )}
                {bookingData.rentalDuration === "hourly" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose your rental duration - minimum 1 hour after pickup
                    slot ends
                  </p>
                )}
                {bookingData.rentalDuration === "daily" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Vehicle must be returned during the same time slot on the
                    end date
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Customer Information
          </CardTitle>
          {/* THÊM: Thông báo thông tin auto-fill */}
          {isLoadingUserData ? (
            <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Loading your profile information...</span>
            </div>
          ) : userData.fullName ? (
            <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span>
                Information automatically filled from your profile. You can edit
                if needed.
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
              <Clock className="h-4 w-4" />
              <span>
                Please fill in your information to complete the booking.
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={bookingData.customerInfo.fullName}
                onChange={(e) =>
                  handleInputChange("customerInfo.fullName", e.target.value)
                }
                className="text-black"
                required
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={bookingData.customerInfo.email}
                onChange={(e) =>
                  handleInputChange("customerInfo.email", e.target.value)
                }
                placeholder="Enter email address"
                className="text-black"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={bookingData.customerInfo.phone}
                onChange={(e) =>
                  handleInputChange("customerInfo.phone", e.target.value)
                }
                placeholder="Enter phone number"
                className="text-black"
                required
              />
            </div>
            <div>
              <Label htmlFor="driverLicense">Driver's License Number *</Label>
              <Input
                id="driverLicense"
                value={bookingData.customerInfo.driverLicense}
                onChange={(e) =>
                  handleInputChange(
                    "customerInfo.driverLicense",
                    e.target.value
                  )
                }
                placeholder="Enter license number"
                className="text-black"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Verification Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">Documents Verified</h4>
              <p className="text-sm text-blue-700">
                Your identity documents (CCCD and driver's license) have been
                verified during registration. No additional document upload is
                required for this booking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions Agreement */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-900">
            <Shield className="h-5 w-5 mr-2" />
            Rental Agreement & Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-amber-900 max-h-64 overflow-y-auto border border-amber-200 rounded-lg p-4 bg-white">
            <div>
              <h4 className="font-semibold mb-2">1. Customer Responsibility</h4>
              <p className="text-gray-700">
                By accepting this agreement, you acknowledge and agree that you
                are fully responsible for the vehicle during the entire rental
                period. Any damage, theft, loss, or incident involving the
                vehicle is your sole responsibility.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Damage & Repair Costs</h4>
              <p className="text-gray-700">
                You agree to pay the full cost of any repairs required due to
                damages incurred during your rental period. This includes but is
                not limited to: scratches, dents, broken parts, interior damage,
                tire damage, windshield cracks, and any mechanical issues
                arising from misuse or negligence.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Theft & Total Loss</h4>
              <p className="text-gray-700">
                In the event of vehicle theft or total loss during your rental
                period, you are liable for the full replacement value of the
                vehicle unless you have purchased additional insurance coverage.
                You must report any theft to local authorities within 24 hours.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                4. Traffic Violations & Fines
              </h4>
              <p className="text-gray-700">
                All traffic violations, parking tickets, tolls, and fines
                incurred during the rental period are your responsibility. We
                will charge your account for any fines received plus an
                administrative processing fee.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                5. Vehicle Condition Inspection
              </h4>
              <p className="text-gray-700">
                You agree to conduct a thorough inspection of the vehicle at
                pickup and report any existing damage immediately. Vehicle
                condition will be inspected again at return. Any new damage will
                be charged to your account.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">6. Prohibited Activities</h4>
              <p className="text-gray-700">
                The following activities are strictly prohibited: driving under
                the influence of alcohol or drugs, allowing unauthorized drivers
                to operate the vehicle, using the vehicle for illegal purposes,
                racing, off-road driving, and smoking inside the vehicle.
                Violation results in immediate termination of rental and
                forfeiture of deposit.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">7. Battery & Charging</h4>
              <p className="text-gray-700">
                You must return the vehicle with at least 20% battery charge.
                Failure to do so will result in a recharging fee. Any damage to
                the charging port or battery system due to misuse will be
                charged at full replacement cost.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                8. Late Return & Overage Fees
              </h4>
              <p className="text-gray-700">
                Late returns will be charged at 150% of the regular hourly/daily
                rate. Vehicles not returned within 24 hours of the scheduled
                return time without notification may be reported as stolen.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">9. Payment & Deposits</h4>
              <p className="text-gray-700">
                A security deposit will be held on your payment method for the
                duration of the rental. This deposit will be released after
                vehicle inspection, minus any charges for damages, violations,
                or additional fees. Full payment is due at the time of booking.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">10. Cancellation & Refunds</h4>
              <p className="text-gray-700">
                Cancellations made more than 48 hours before pickup receive a
                full refund. Cancellations within 48 hours are subject to a 50%
                cancellation fee. No-shows forfeit the entire payment.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-amber-200">
            <Checkbox
              id="terms-checkbox"
              checked={termsAccepted}
              onCheckedChange={(checked) =>
                setTermsAccepted(checked as boolean)
              }
              className="mt-1"
            />
            <Label
              htmlFor="terms-checkbox"
              className="text-sm font-medium leading-relaxed cursor-pointer text-gray-900"
            >
              I have read and agree to all terms and conditions stated above. I
              understand that I am fully responsible for the vehicle and any
              damages, losses, or incidents that occur during my rental period,
              and I agree to pay all associated costs.
            </Label>
          </div>
        </CardContent>
      </Card>
      {/* Layout ngang: Terms bên trái, Vehicle Summary bên phải */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Terms & Conditions ở bên trái (đã có sẵn ở trên) */}

        {/* Vehicle Summary Card - Di chuyển từ sidebar */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={vehicle.image || "/placeholder-vehicle.jpg"}
                  className="w-16 h-16 object-cover rounded-lg"
                  alt={vehicle.name}
                />
                <div>
                  {vehicle.name}
                  <p className="text-sm text-muted-foreground">
                    {vehicle.location}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Car rental price:</span>
                  <span className="font-medium text-right">
                    {rentalDetails.displayText} = ${baseCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-2 font-semibold text-blue-600">
                  <span>Total:</span>
                  <span>${baseCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span className="text-sm">VND:</span>
                  <span className="text-sm">{convertToVND(baseCost).toLocaleString()} ₫</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  if (!termsAccepted) {
                    toast({
                      title: "Terms Required",
                      description: "Please read and accept the rental agreement terms and conditions to proceed.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setStep(2);
                }}
                disabled={!termsAccepted}
              >
                {termsAccepted ? "Continue to Payment" : "Accept Terms First"}
              </Button>

              {step === 1 && !termsAccepted && (
                <p className="text-sm text-amber-600 text-center">
                  Please read and accept the rental agreement terms and conditions to proceed.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Helper function để render Vehicle Summary Card
  const renderVehicleSummaryCard = () => (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img
              src={vehicle.image || "/placeholder-vehicle.jpg"}
              className="w-16 h-16 object-cover rounded-lg"
              alt={vehicle.name}
            />
            <div>
              {vehicle.name}
              <p className="text-sm text-muted-foreground">
                {vehicle.location}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Car rental price:</span>
              <span className="font-medium text-right">
                {rentalDetails.displayText} = ${baseCost.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2 font-semibold text-blue-600">
              <span>Total:</span>
              <span>${baseCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span className="text-sm">VND:</span>
              <span className="text-sm">{convertToVND(baseCost).toLocaleString()} ₫</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <PaymentSystem
        amount={baseCost}
        bookingId={`BOOK_${Date.now()}`}
        vehicleId={vehicle.id}
        vehicleName={vehicle.name}
        customerInfo={bookingData.customerInfo}
        onPaymentComplete={async (paymentData) => {
          // ✅ TẠO RESERVATION ID VÀ LƯU VÀO SQL DATABASE
          try {
            // Gọi API để tạo reservation trong database
            const startDateTime = new Date(
              `${bookingData.startDate}T${bookingData.startTime}`
            );
            const endDateTime = new Date(
              `${bookingData.endDate}T${bookingData.endTime}`
            );

            // ✅ FIX: Ensure start time is in the future (with 15 min buffer)
            const now = new Date();
            const minAllowedTime = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes in the past

            console.log("[Booking] Current time:", now.toISOString());
            console.log("[Booking] Start time:", startDateTime.toISOString());
            console.log(
              "[Booking] Min allowed time:",
              minAllowedTime.toISOString()
            );

            if (startDateTime < minAllowedTime) {
              console.warn(
                "[Booking] Start time is too far in the past, adjusting to future time"
              );
              // Add 2 hours to current time to ensure it's in the future
              const adjustedStart = new Date(
                now.getTime() + 2 * 60 * 60 * 1000
              );
              const duration = endDateTime.getTime() - startDateTime.getTime();
              startDateTime.setTime(adjustedStart.getTime());
              endDateTime.setTime(adjustedStart.getTime() + duration);
              console.log(
                "[Booking] Adjusted start time:",
                startDateTime.toISOString()
              );
              console.log(
                "[Booking] Adjusted end time:",
                endDateTime.toISOString()
              );
            }

            // Use the actual vehicleId from API data
            let vehicleId: number;

            if (apiVehicle && apiVehicle.vehicleId) {
              // Use the actual vehicleId from API
              vehicleId = apiVehicle.vehicleId;
              console.log("[Booking] Using API vehicleId:", vehicleId);
            } else {
              // No API data available - this should not happen
              console.error(
                "[Booking] No API vehicle data available for vehicle.id:",
                vehicle.id
              );
              toast({
                title: "Error",
                description:
                  "Vehicle data not found. Please refresh the page and try again.",
                variant: "destructive",
              });
              return;
            }

            // Validate vehicle ID
            if (isNaN(vehicleId) || vehicleId <= 0) {
              console.error(
                "[Booking] Invalid vehicle ID:",
                vehicle.id,
                "->",
                vehicleId
              );
              toast({
                title: "Error",
                description: "Invalid vehicle ID. Please try again.",
                variant: "destructive",
              });
              return;
            }

            // Format datetime as local time (not UTC) for SQL Server
            // Format: YYYY-MM-DDTHH:mm:ss (without timezone info to preserve local time)
            const formatLocalDateTime = (date: Date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              const hours = String(date.getHours()).padStart(2, "0");
              const minutes = String(date.getMinutes()).padStart(2, "0");
              const seconds = String(date.getSeconds()).padStart(2, "0");
              return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            };

            const reservationData = {
              vehicleId: vehicleId,
              stationId: parseInt(vehicle.stationId || "1"),
              startTime: formatLocalDateTime(startDateTime),
              endTime: formatLocalDateTime(endDateTime),
            };

            console.log("[Booking] Raw Vehicle ID:", vehicle.id);
            console.log("[Booking] Parsed Vehicle ID:", vehicleId);
            console.log("[Booking] Station ID:", vehicle.stationId);
            console.log(
              "[Booking] Creating reservation with data:",
              reservationData
            );
            console.log(
              "[Booking] Start Time (Local):",
              formatLocalDateTime(startDateTime)
            );
            console.log(
              "[Booking] End Time (Local):",
              formatLocalDateTime(endDateTime)
            );

            let reservationId: number | null = null;
            try {
              console.log("[Booking] Calling API to create reservation...");
              console.log(
                "[Booking] Reservation data:",
                JSON.stringify(reservationData, null, 2)
              );

              const reservationResponse = await apiService.createReservation(
                reservationData
              );

              console.log("[Booking] API Response:", reservationResponse);

              if (
                reservationResponse.success &&
                reservationResponse.reservation
              ) {
                reservationId = reservationResponse.reservation.reservationId;
                console.log(
                  "✅ Reservation created in database:",
                  reservationResponse.reservation
                );
                console.log(
                  "[Booking] Saved Start Time:",
                  reservationResponse.reservation.startTime
                );
                console.log(
                  "[Booking] Saved End Time:",
                  reservationResponse.reservation.endTime
                );

                // Store reservationId in bookingData
                setBookingData((prev) => ({
                  ...prev,
                  reservationId: reservationId,
                }));

                // ✅ UPDATE PAYMENT VỚI RESERVATION_ID
                if (reservationId && bookingData.paymentMethod === "wallet") {
                  try {
                    console.log(
                      "[Payment] Updating payment with reservation_id:",
                      reservationId
                    );

                    // Update payment record that doesn't have reservation_id yet
                    const token = localStorage.getItem("token");
                    const updateResponse = await fetch(
                      "http://localhost:5000/api/wallet/update-payment",
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          reservationId: reservationId,
                          amount: baseCost,
                        }),
                      }
                    );

                    if (updateResponse.ok) {
                      console.log(
                        "[Payment] Payment updated successfully with reservation_id"
                      );
                    } else {
                      console.log("[Payment] Update failed, but continuing...");
                    }
                  } catch (paymentError) {
                    console.error(
                      "Error updating payment in database:",
                      paymentError
                    );
                    // Continue even if payment update fails
                  }
                }
              } else {
                // API returned success=false
                throw new Error(
                  reservationResponse.message || "Failed to create reservation"
                );
              }
            } catch (apiError: any) {
              console.error(
                "❌ Error creating reservation in database:",
                apiError
              );

              // Show error message to user and stop booking process
              toast({
                title: "Booking Failed",
                description:
                  apiError.message ||
                  "You already have an active booking. Please complete or cancel your existing booking before making a new one.",
                variant: "destructive",
              });

              // Stop here - don't continue with local storage
              return;
            }

            // Logic xác định status dựa trên thời gian
            const currentTime = new Date();
            let status: "active" | "upcoming" | "completed";

            if (currentTime >= startDateTime && currentTime <= endDateTime) {
              status = "active"; // Đang trong thời gian thuê
            } else if (currentTime < startDateTime) {
              status = "upcoming"; // Chưa đến thời gian thuê
            } else {
              status = "completed"; // Đã kết thúc (trường hợp ít xảy ra)
            }

            const newBooking = bookingStorage.addBooking({
              vehicleId: vehicle.id,
              vehicle: vehicle.name,
              vehicleBrand: vehicle.brand,
              vehicleYear: vehicle.year,
              vehicleImage: vehicle.image,
              startDate: bookingData.startDate,
              endDate: bookingData.endDate,
              startTime: bookingData.startTime,
              endTime: bookingData.endTime,
              rentalDuration: bookingData.rentalDuration as "hourly" | "daily",
              pickupLocation: vehicle.location,
              status: status,
              totalCost: totalCost,
              baseCost: baseCost,
              deposit: 0,
              duration:
                bookingData.rentalDuration === "hourly"
                  ? (() => {
                    const start = new Date(
                      `${bookingData.startDate}T${bookingData.startTime}`
                    );
                    const end = new Date(
                      `${bookingData.endDate}T${bookingData.endTime}`
                    );
                    const hours = Math.ceil(
                      (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                    );
                    return `${hours} hour${hours !== 1 ? "s" : ""}`;
                  })()
                  : (() => {
                    const start = new Date(
                      `${bookingData.startDate}T${bookingData.startTime}`
                    );
                    const end = new Date(
                      `${bookingData.endDate}T${bookingData.endTime}`
                    );
                    const days = Math.ceil(
                      (end.getTime() - start.getTime()) /
                      (1000 * 60 * 60 * 24)
                    );
                    return `${days} day${days !== 1 ? "s" : ""}`;
                  })(),
              customerInfo: bookingData.customerInfo,
              paymentMethod: bookingData.paymentMethod,
            });

            console.log("Booking saved successfully:", newBooking);

            // Show success message with reservation ID if available
            if (reservationId) {
              toast({
                title: "Payment Successful!",
                description: `Your booking has been confirmed. Reservation ID: ${reservationId}`,
              });
            } else {
              toast({
                title: "Payment Successful!",
                description: "Your booking has been confirmed.",
              });
            }

            // Move to confirmation step
            setStep(3);
          } catch (error) {
            console.error("Error saving booking:", error);
            toast({
              title: "Error",
              description: "Failed to save booking. Please try again.",
              variant: "destructive",
            });
            return;
          }
        }}
        paymentMethod={bookingData.paymentMethod as "wallet" | "cash"}
        onBack={() => setStep(1)}
      />
      
      {/* Vehicle Summary Card */}
      {renderVehicleSummaryCard()}
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-green-600 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-lg text-muted-foreground mb-2">
          Your {vehicle.name} has been successfully booked.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
          <span className="text-sm font-medium text-green-800">
            Booking ID: <strong>#EV-{Date.now().toString().slice(-6)}</strong>
          </span>
        </div>
        {bookingData.reservationId && (
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mt-2">
            <span className="text-sm font-medium text-blue-800">
              Reservation ID: <strong>{bookingData.reservationId}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Enhanced Booking Summary */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center text-xl">
            <FileText className="h-5 w-5 mr-2" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Details */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-20 h-16 object-cover rounded-lg border"
                />
                <div>
                  <h3 className="font-bold text-lg">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.brand} • {vehicle.year}
                  </p>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1 text-primary" />
                    <span className="text-sm">{vehicle.location}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Condition */}
              <div className="p-3 bg-secondary/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Vehicle Condition</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="capitalize font-medium text-green-600">
                      {vehicle.condition}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mileage:</span>
                    <span>{vehicle.mileage?.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Maintenance:</span>
                    <span>{vehicle.lastMaintenance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground">Start Date:</span>
                    <div className="font-medium">{bookingData.startDate}</div>
                    <div className="text-xs text-muted-foreground">
                      {bookingData.rentalDuration === "hourly"
                        ? bookingData.startTime
                        : "All day"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Customer:</span>
                    <div className="font-medium">
                      {bookingData.customerInfo.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bookingData.customerInfo.email}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground">End Date:</span>
                    <div className="font-medium">{bookingData.endDate}</div>
                    <div className="text-xs text-muted-foreground">
                      {bookingData.rentalDuration === "hourly"
                        ? bookingData.endTime
                        : "All day"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <div className="font-medium">
                      {bookingData.customerInfo.phone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-medium text-sm mb-3">Cost Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Paid:</span>
                    <span className="text-primary">
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced QR Code Section */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="text-center pb-3">
          <CardTitle className="flex items-center justify-center text-amber-800">
            <Smartphone className="h-5 w-5 mr-2" />
            Vehicle Access QR Code
          </CardTitle>
          <p className="text-sm text-amber-700 mt-1">
            Scan this code when you arrive at the vehicle
          </p>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <div className="inline-block p-4 bg-white rounded-xl shadow-md border-2 border-amber-200">
            <QRCodeSVG
              value={JSON.stringify({
                bookingId: `EV-${Date.now().toString().slice(-6)}`,
                vehicleId: vehicle.id,
                vehicleName: vehicle.name,
                customerName: bookingData.customerInfo.fullName,
                pickupLocation: vehicle.location,
                startDate: bookingData.startDate,
                startTime: bookingData.startTime,
                endDate: bookingData.endDate,
                endTime: bookingData.endTime,
                rentalDuration: bookingData.rentalDuration,
                totalCost: totalCost,
                accessCode: `ACCESS_${Date.now().toString().slice(-8)}`,
                timestamp: new Date().toISOString(),
              })}
              size={180}
              level="M"
              includeMargin={true}
              fgColor="#1f2937"
              bgColor="#ffffff"
            />
          </div>
          <p className="text-xs text-amber-700 mt-3 max-w-md mx-auto">
            Keep this QR code handy - you'll need it to unlock your vehicle at
            the pickup location.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
          <p className="text-sm text-blue-800 mb-1">
            📧 A confirmation email has been sent to{" "}
            {bookingData.customerInfo.email}
          </p>
          <p className="text-xs text-blue-600">
            Please check your spam folder if you don't see it within 5 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            className="btn-hero h-12"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            className="h-12 border-2"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  );

  // Show loading while checking for active bookings
  if (isCheckingActiveBooking) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">
              Checking availability...
            </p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <FadeIn delay={100}>
            <Button variant="ghost" asChild className="mb-6">
              <Link
                to={`/vehicles/${vehicle.id}`}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vehicle Details
              </Link>
            </Button>
          </FadeIn>

          {/* Progress Steps */}
          <FadeIn delay={200}>
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4 mb-4">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNumber
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                        }`}
                    >
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div
                        className={`w-12 h-0.5 mx-2 ${step > stepNumber ? "bg-primary" : "bg-secondary"
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold">
                  {step === 1 && "Booking Details"}
                  {step === 2 && "Payment"}
                  {step === 3 && "Confirmation"}
                </h1>
              </div>
            </div>
          </FadeIn>

          <div className="space-y-8">
            {/* Main Content */}
            <div className="w-full">
              <SlideIn direction="left" delay={300}>
                {step === 1 && renderBookingDetails()}
                {step === 2 && renderPaymentStep()}
                {step === 3 && renderConfirmation()}
              </SlideIn>
            </div>
          </div> 
        </div>
      </div>
    </PageTransition>
  );
};

export default BookingPage;
