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
import { useChargingContext } from "@/contexts/ChargingContext";
import { isLowBattery } from "@/lib/vehicle-constants";
import { QRCodeSVG } from "qrcode.react";

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { chargingVehicles } = useChargingContext();
  
  // Use API data with fallback to static data
  const { data: apiVehicles, loading: vehiclesLoading } = useVehicles();
  const staticVehicle = id ? getVehicleById(id) : null;
  
  // Find vehicle from API data or fallback to static
  const apiVehicle = apiVehicles?.find(v => v.uniqueVehicleId === id);
  const vehicle = apiVehicle ? {
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
    updatedAt: apiVehicle.updatedAt
  } : staticVehicle;

  // Check if vehicle is currently charging
  const isCharging = vehicle && (chargingVehicles.has(vehicle.id) || chargingVehicles.has(vehicle.uniqueVehicleId || ''));
  
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
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    // Thêm 1 giờ
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');

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
  const calculateTimeToPickup = (selectedDate: string, selectedTime: string) => {
    if (!selectedDate || !selectedTime) return null;

    const now = new Date();
    const [hours, minutes] = selectedTime.split(':').map(Number);

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
        return `You have ${diffHours} hour${diffHours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} to pick up the vehicle`;
      } else {
        return `You have ${diffHours} hour${diffHours !== 1 ? 's' : ''} to pick up the vehicle`;
      }
    } else {
      return `You have ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} to pick up the vehicle`;
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
        const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
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

  const currentUserData = {
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+84 901 234 567",
    driverLicense: "B123456789",

  };

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
        return `${(currentHour + 1).toString().padStart(2, '0')}:00`;
      } else {
        return `${currentHour.toString().padStart(2, '0')}:30`;
      }
    }
    return "09:00"; // Default cho ngày tương lai
  };

  // ✅ FIX: Tomorrow date calculation
  const getTomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
  };

  const [bookingData, setBookingData] = useState({
    startDate: getTodayStr(),
    endDate: getTomorrowStr(), // Auto-select tomorrow
    startTime: createBestSlot(), // Auto-select best slot
    endTime: getTimeStr(),
    rentalDuration: "daily",
    customerInfo: {
      fullName: currentUserData.fullName, //  Auto-filled từ profile
      email: currentUserData.email, // Auto-filled từ profile  
      phone: currentUserData.phone, // Auto-filled từ profile
      driverLicense: currentUserData.driverLicense, // Auto-filled từ profile
    },
    paymentMethod: "qr_code",

  });

  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation

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
      const [startHour, startMinute] = bookingData.startTime.split(':').map(Number);
      const [endHour, endMinute] = bookingData.endTime.split(':').map(Number);

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
      const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
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
        const timeStart = `${hour.toString().padStart(2, '0')}:00`;
        const timeEnd = `${hour.toString().padStart(2, '0')}:30`;
        slots.push({
          value: timeStart,
          label: `${timeStart} - ${timeEnd}`,
          pickupStart: timeStart,
          pickupEnd: timeEnd
        });
      }

      // Slot 2: XX:30 - (XX+1):00
      if (hour <= 22) {
        const timeStart = `${hour.toString().padStart(2, '0')}:30`;
        const timeEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;
        slots.push({
          value: timeStart,
          label: `${timeStart} - ${timeEnd}`,
          pickupStart: timeStart,
          pickupEnd: timeEnd
        });
      }
    }

    return slots;
  };

  const getReturnTimeOptions = (pickupSlotStart: string) => {
    if (!pickupSlotStart) return [];

    const [startHour, startMinute] = pickupSlotStart.split(':').map(Number);

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
        timeStr = `${returnHour.toString().padStart(2, '0')}:${returnMinute.toString().padStart(2, '0')}`;
        timeValue = timeStr;
      }

      options.push({
        value: timeValue,
        label: timeStr,
        duration: `${i} hour${i !== 1 ? 's' : ''}`
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

    setBookingData(prev => ({
      ...prev,
      startTime: value,
      endTime: defaultReturnTime
    }));
  };

  const handleDailyPickupSlotChange = (value: string) => {
    setBookingData(prev => ({
      ...prev,
      startTime: value,
      endTime: value
    }));
  };

  const handleStartDateChange = (newStartDate: string) => {
    setBookingData(prev => {
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
          newEndDate = `${nextDay.getFullYear()}-${pad(nextDay.getMonth() + 1)}-${pad(nextDay.getDate())}`;
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
    setBookingData(prev => ({
      ...prev,
      endDate: newEndDate
    }));
  };


  const baseCost = calculateCost();

  const totalCost = baseCost;


  const handleInputChange = (field: string, value: string | boolean) => {
    setBookingData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        // Simple field update
        return {
          ...prev,
          [field]: value
        };
      } else if (keys.length === 2) {
        // Nested field update (e.g., customerInfo.fullName)
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value
          }
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
                  <span>Selected: Hourly Rental - ${vehicle.pricePerHour} per hour for {vehicle.name}</span>
                ) : (
                  <span>Selected: Daily Rental - ${vehicle.pricePerDay} per day for {vehicle.name}</span>
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
                        const nextDay = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
                        return `${nextDay.getFullYear()}-${pad(nextDay.getMonth() + 1)}-${pad(nextDay.getDate())}`;
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
                  {bookingData.rentalDuration === "hourly" ? "Pickup Time Slot *" : "Pickup Time Slot *"}
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
                {bookingData.rentalDuration === "hourly" && bookingData.startTime && (
                  <div className="mt-2">
                    {(() => {
                      const timeToPickup = calculateTimeToPickup(bookingData.startDate, bookingData.startTime);
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
                    Select a pick up time - the car must be picked up within this time
                  </p>
                )}

                {/* ✨ THÊM MỚI: Countdown timer cho daily rental */}
                {bookingData.rentalDuration === "daily" && bookingData.startTime && (
                  <div className="mt-2">
                    {(() => {
                      const timeToPickup = calculateTimeToPickup(bookingData.startDate, bookingData.startTime);
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
                    Select a pick up time - the car must be picked up within this time
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="endTime">
                  {bookingData.rentalDuration === "hourly" ? "Return Time *" : "Return Time Slot *"}
                </Label>
                {bookingData.rentalDuration === "hourly" ? (
                  <Select
                    value={bookingData.endTime}
                    onValueChange={(value) => handleInputChange("endTime", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select return time" />
                    </SelectTrigger>
                    <SelectContent>
                      {getReturnTimeOptions(bookingData.startTime).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} ({option.duration})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-2 border rounded-md bg-secondary/50">
                    <span className="text-sm text-muted-foreground">
                      {bookingData.startTime ? (
                        (() => {
                          const [hour, minute] = bookingData.startTime.split(':').map(Number);
                          const endHour = minute === 0 ? hour : hour + 1;
                          const endMinute = minute === 0 ? 30 : 0;
                          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
                          return `${bookingData.startTime} - ${endTime}`;
                        })()
                      ) : 'Select pickup slot first'}
                    </span>
                  </div>
                )}
                {bookingData.rentalDuration === "hourly" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose your rental duration - minimum 1 hour after pickup slot ends
                  </p>
                )}
                {bookingData.rentalDuration === "daily" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Vehicle must be returned during the same time slot on the end date
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
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span>Information automatically filled from your profile. You can edit if needed.</span>
          </div>
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

    </div>

  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <PaymentSystem
        amount={totalCost}
        bookingId={`BOOK_${Date.now()}`}
        vehicleId={vehicle.id}
        vehicleName={vehicle.name}
        customerInfo={bookingData.customerInfo}
        onPaymentComplete={(paymentData) => {

          // ✅ LƯU BOOKING KHI PAYMENT THÀNH CÔNG
          try {
            // Logic xác định status dựa trên thời gian
            const now = new Date();
            const startDateTime = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
            const endDateTime = new Date(`${bookingData.endDate}T${bookingData.endTime}`);

            let status: "active" | "upcoming" | "completed";

            if (now >= startDateTime && now <= endDateTime) {
              status = "active"; // Đang trong thời gian thuê
            } else if (now < startDateTime) {
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
              duration: bookingData.rentalDuration === "hourly"
                ? (() => {
                  const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
                  const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
                  const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
                  return `${hours} hour${hours !== 1 ? 's' : ''}`;
                })()
                : (() => {
                  const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
                  const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                  return `${days} day${days !== 1 ? 's' : ''}`;
                })(),
              customerInfo: bookingData.customerInfo,
              paymentMethod: bookingData.paymentMethod,
            });

            console.log("Booking saved successfully:", newBooking);
          } catch (error) {
            console.error("Error saving booking:", error);
            toast({
              title: "Error",
              description: "Failed to save booking. Please try again.",
              variant: "destructive",
            });
            return;
          }


          toast({
            title: "Payment Successful!",
            description: "Your booking has been confirmed.",
          });
          setStep(3);
        }}
        paymentMethod={bookingData.paymentMethod as "qr_code" | "cash"}
        onBack={() => setStep(1)}
      />
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
                      {bookingData.rentalDuration === "hourly" ? bookingData.startTime : "All day"}
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
                      {bookingData.rentalDuration === "hourly" ? bookingData.endTime : "All day"}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <SlideIn direction="left" delay={300}>
                {step === 1 && renderBookingDetails()}
                {step === 2 && renderPaymentStep()}
                {step === 3 && renderConfirmation()}
              </SlideIn>
            </div>

            {/* Sidebar - Vehicle Summary */}
            {step < 3 && (
              <div className="lg:col-span-1">
                <SlideIn direction="right" delay={400}>
                  <div className="sticky top-8">
                    <Card>
                      <CardContent className="p-6">
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                        <h3 className="font-bold text-lg mb-1">
                          {vehicle.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {vehicle.location}
                        </p>

                        {baseCost > 0 && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between font-bold">
                              <span>Total Cost:</span>
                              <span>${totalCost.toFixed(2)}</span>
                            </div>
                          </div>
                        )}

                        {/* Chỉ hiển thị button cho step 1, step 2 không có button nào */}
                        {step === 1 && (
                          <Button
                            className="w-full mt-4 btn-hero"
                            onClick={() => {
                              // Validate và chuyển sang payment
                              if (
                                !bookingData.startDate ||
                                !bookingData.endDate ||
                                !bookingData.startTime ||
                                !bookingData.endTime ||
                                !bookingData.customerInfo.fullName ||
                                !bookingData.customerInfo.email ||
                                !bookingData.customerInfo.phone ||
                                !bookingData.customerInfo.driverLicense
                              ) {
                                toast({
                                  title: "Missing Information",
                                  description: "Please fill in all required fields.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              // VALIDATION CHO HOURLY RENTAL
                              if (bookingData.rentalDuration === "hourly") {
                                if (bookingData.startDate !== bookingData.endDate) {
                                  toast({
                                    title: "Invalid Date Range",
                                    description: "For hourly rental, start and end date must be the same.",
                                    variant: "destructive",
                                  });
                                  return;
                                }

                                const isValidTime = validateHourlyRental(bookingData.startTime, bookingData.endTime);
                                if (!isValidTime) {
                                  toast({
                                    title: "Invalid Time Range",
                                    description: "Minimum rental duration is 1 hour.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                              }

                              // VALIDATION CHO DAILY RENTAL
                              if (bookingData.rentalDuration === "daily") {
                                const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
                                const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
                                // ✅ FIX: Tính số ngày chính xác
                                const startDateOnly = new Date(bookingData.startDate);
                                const endDateOnly = new Date(bookingData.endDate);
                                const diffMs = endDateOnly.getTime() - startDateOnly.getTime();
                                const days = diffMs / (1000 * 60 * 60 * 24);

                                // ✅     Cho phép từ 1 ngày trở lên (không tính giờ)
                                if (days < 1) {
                                  toast({
                                    title: "Invalid Date Range",
                                    description: `Selected duration: ${days} day(s). Minimum rental duration is 1 day.`,
                                    variant: "destructive",
                                  });
                                  return;
                                }
                              }

                              // Chuyển sang payment step
                              setStep(2);
                            }}
                          >
                            Continue to Payment
                          </Button>
                        )}

                      </CardContent>
                    </Card>
                  </div>
                </SlideIn>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default BookingPage;
