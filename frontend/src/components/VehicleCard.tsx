import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Battery,
  MapPin,
  Star,
  Clock,
  Zap,
  Users,
  Fuel,
  Car,
  Bike,
  Bus,
  Truck,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useCurrency } from "@/lib/currency";
import { useChargingContext } from "@/contexts/ChargingContext";
import { isLowBattery, isAvailableForBooking } from "@/lib/vehicle-constants";

export interface Vehicle {
  id: string; // Unique vehicle instance ID (e.g., "VF8-D1-001")
  modelId?: string; // Model identifier (e.g., "VF8", "MODEL3", "LEAF") - optional for now
  uniqueVehicleId?: string; // VIN Number - Vehicle Identification Number (also used as system tracking ID)
  licensePlate?: string; // License plate number - optional for now
  name: string;
  year: number;
  brand: string;
  model: string;
  type:
    | "SUV"
    | "Sedan"
    | "Hatchback"
    | "Crossover"
    | "Coupe"
    | "Motorcycle"
    | "Scooter"
    | "Bike"
    | "Bus"
    | "Van"
    | "Truck";
  image: string;
  batteryLevel: number;
  location: string;
  stationId?: string; // Station where this vehicle is currently located - optional for now
  availability: "available" | "rented" | "maintenance";
  status?: "available" | "rented" | "maintenance"; // Alias for availability - for backward compatibility
  pricePerHour: number;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  trips: number;
  range: number;
  seats: number;
  features: string[];
  condition: "excellent" | "good" | "fair" | "poor";
  lastMaintenance: string;
  mileage: number;
  fuelEfficiency: string;
  inspectionDate: string;
  insuranceExpiry: string;
  description: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  className?: string;
}

const VehicleCard = ({ vehicle, className = "" }: VehicleCardProps) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { chargingVehicles } = useChargingContext();
  
  // Check if vehicle is currently charging
  const isCharging = chargingVehicles.has(vehicle.id) || chargingVehicles.has(vehicle.uniqueVehicleId || '');
  
  // Check if vehicle has low battery
  const hasLowBattery = isLowBattery(vehicle.batteryLevel);
  
  // Determine if vehicle is available for booking
  const canBookVehicle = isAvailableForBooking(
    vehicle.availability,
    vehicle.batteryLevel,
    isCharging
  );
  const getStatusBadge = () => {
    if (isCharging) {
      return (
        <Badge className="badge-charging bg-blue-100 text-blue-800 border-blue-200">
          🔌 {t("common.charging")}
        </Badge>
      );
    }
    
    if (hasLowBattery) {
      return (
        <Badge className="badge-low-battery bg-orange-100 text-orange-800 border-orange-200">
          ⚠️ {t("common.lowBattery")}
        </Badge>
      );
    }
    
    switch (vehicle.availability) {
      case "available":
        return (
          <Badge className="badge-available">{t("common.available")}</Badge>
        );
      case "rented":
        return <Badge className="badge-rented">{t("common.rented")}</Badge>;
      case "maintenance":
        return (
          <Badge className="badge-maintenance">{t("common.maintenance")}</Badge>
        );
      default:
        return null;
    }
  };

  const getConditionBadge = () => {
    const conditions = {
      excellent: {
        class: "bg-green-100 text-green-800 border-green-200",
        icon: "✓",
      },
      good: { class: "bg-blue-100 text-blue-800 border-blue-200", icon: "✓" },
      fair: {
        class: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: "⚠",
      },
      poor: { class: "bg-red-100 text-red-800 border-red-200", icon: "!" },
    };

    const condition = conditions[vehicle.condition];
    return (
      <Badge className={`text-xs border ${condition.class}`}>
        {condition.icon} {t(`vehicle.condition.${vehicle.condition}`)}
      </Badge>
    );
  };

  const getMaintenanceStatus = () => {
    if (!vehicle.lastMaintenance) return null;

    const lastMaintenance = new Date(vehicle.lastMaintenance);
    const daysSinceMaintenance = Math.floor(
      (Date.now() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceMaintenance > 90) {
      return (
        <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-200">
          ⏰ Maintenance Due
        </Badge>
      );
    }
    return null;
  };

  const getBatteryColor = () => {
    if (vehicle.batteryLevel >= 80) return "text-success";
    if (vehicle.batteryLevel >= 50) return "text-warning";
    return "text-destructive";
  };

  const getVehicleTypeIcon = (type: Vehicle["type"]) => {
    const iconClass = "h-5 w-5 text-gray-600 dark:text-gray-400";

    switch (type) {
      case "SUV":
      case "Sedan":
      case "Hatchback":
      case "Crossover":
      case "Coupe":
        return <Car className={iconClass} />;
      case "Motorcycle":
      case "Scooter":
        return <Bike className={iconClass} />;
      case "Bike":
        return <Bike className={iconClass} />;
      case "Van":
      case "Truck":
        return <Truck className={iconClass} />;
      case "Bus":
        return <Bus className={iconClass} />;
      default:
        return <Car className={iconClass} />;
    }
  };

  return (
    <div className={`card-hover group ${className}`}>
      {/* Image Container */}
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <img
          src={vehicle.image}
          alt={`${vehicle.name} - ${t("common.electricVehicle")}`}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">{getStatusBadge()}</div>
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs flex items-center">
          <Star className="h-3 w-3 mr-1 fill-current text-yellow-400" />
          {vehicle.rating} ({vehicle.reviewCount})
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {getVehicleTypeIcon(vehicle.type)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
              {vehicle.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {vehicle.year} • {vehicle.brand} •{" "}
              {t(`vehicleTypes.${vehicle.type}`)}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center text-muted-foreground">
            <Battery className={`h-3 w-3 mr-1 ${getBatteryColor()}`} />
            <span className={getBatteryColor()}>{vehicle.batteryLevel}%</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Zap className="h-3 w-3 mr-1" />
            {vehicle.range} {t("common.kmRange")}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="h-3 w-3 mr-1" />
            {vehicle.seats} {t("common.seats")}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            {vehicle.location}
          </div>
        </div>

        {/* Condition and Maintenance Badges */}
        <div className="flex flex-wrap gap-2">
          {getConditionBadge()}
          {getMaintenanceStatus()}
        </div>

        {/* Pricing and Actions */}
        <div className="pt-2 border-t border-border space-y-2">
          {/* Pricing */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(vehicle.pricePerHour)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("common.perHour")}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPrice(vehicle.pricePerDay)}
                {t("common.perDay")}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to={`/vehicles/${vehicle.id}`}>
                {t("common.viewDetails")}
              </Link>
            </Button>
            {canBookVehicle && (
              <Button size="sm" className="btn-success w-full" asChild>
                <Link to={`/book/${vehicle.id}`}>
                  <Clock className="h-3 w-3 mr-1" />
                  {t("common.bookNow")}
                </Link>
              </Button>
            )}
            
            {isCharging && (
              <Button size="sm" className="w-full" disabled>
                🔌 {t("common.charging")} - {t("common.notAvailable")}
              </Button>
            )}
            
            {hasLowBattery && !isCharging && (
              <Button size="sm" className="w-full" disabled>
                ⚠️ {t("common.lowBattery")} - {t("common.notAvailable")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
