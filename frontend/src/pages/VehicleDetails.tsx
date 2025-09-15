import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getVehicleById } from "@/data/vehicles";
import { useTranslation } from "@/contexts/TranslationContext";
import { useCurrency } from "@/lib/currency";
import {
  Battery,
  MapPin,
  Star,
  Clock,
  Zap,
  Users,
  ArrowLeft,
  Calendar,
  Shield,
  Wifi,
  Snowflake,
  Music,
} from "lucide-react";

const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const vehicle = id ? getVehicleById(id) : null;

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {t("common.vehicleNotFound")}
          </h1>
          <p className="text-muted-foreground mb-6">
            The vehicle you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/vehicles">{t("nav.vehicles")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
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

  const getBatteryColor = () => {
    if (vehicle.batteryLevel >= 80) return "text-success";
    if (vehicle.batteryLevel >= 50) return "text-warning";
    return "text-destructive";
  };

  const featureIcons = {
    "Premium Sound": Music,
    Autopilot: Shield,
    "Fast Charging": Zap,
    "Leather Seats": Users,
    Supercharging: Zap,
    "Premium Interior": Users,
    "Over-the-Air Updates": Wifi,
    "Eco Mode": Battery,
    "Wireless Charging": Zap,
    "Safety Suite": Shield,
    "All-Weather": Snowflake,
    "Sport Mode": Zap,
    "Premium Audio": Music,
    "Adaptive Cruise": Shield,
    "Luxury Interior": Users,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/vehicles" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("nav.vehicles")}
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={vehicle.image}
                alt={`${vehicle.name} - ${t("common.electricVehicle")}`}
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute top-4 left-4">{getStatusBadge()}</div>
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm flex items-center">
                <Star className="h-4 w-4 mr-1 fill-current text-yellow-400" />
                {vehicle.rating} ({vehicle.reviewCount} reviews)
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {vehicle.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {vehicle.year} {vehicle.brand} {vehicle.model}
              </p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Battery
                    className={`h-8 w-8 mx-auto mb-2 ${getBatteryColor()}`}
                  />
                  <div className={`text-2xl font-bold ${getBatteryColor()}`}>
                    {vehicle.batteryLevel}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("common.battery")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">
                    {vehicle.range} km
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("common.range")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">
                    {vehicle.seats}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("common.seats")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-bold text-foreground">
                    {vehicle.location}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("common.location")}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pricing */}
            <Card className="card-premium">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t("common.pricing")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      ${vehicle.pricePerHour}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("common.perHour")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      ${vehicle.pricePerDay}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("common.perDay")}
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {vehicle.availability === "available" ? (
                    <>
                      <Button size="lg" className="w-full btn-hero" asChild>
                        <Link to={`/book/${vehicle.id}`}>
                          <Calendar className="h-5 w-5 mr-2" />
                          {t("common.bookNow")}
                        </Link>
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Instant booking • No deposit required • Cancel anytime
                      </p>
                    </>
                  ) : (
                    <Button size="lg" className="w-full" disabled>
                      <Clock className="h-5 w-5 mr-2" />
                      {t("common.rented")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description and Features */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {t("common.aboutThisVehicle")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {vehicle.description}
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                Features & Amenities
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {vehicle.features.map((feature, index) => {
                  const IconComponent =
                    featureIcons[feature as keyof typeof featureIcons] || Zap;
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="p-2 bg-primary-light rounded-lg">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              {t("common.rentalInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">{t("common.requirements")}</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Valid driver's license</li>
                  <li>• Minimum age: 21 years</li>
                  <li>• Government ID required</li>
                  <li>• Clean driving record</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">
                  {t("common.whatsIncluded")}
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Full insurance coverage</li>
                  <li>• 24/7 roadside assistance</li>
                  <li>• Free charging at partner stations</li>
                  <li>• GPS navigation system</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t("common.policies")}</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Minimum rental: 2 hours</li>
                  <li>• Late return: $10/hour</li>
                  <li>• Damage deposit: $200</li>
                  <li>• Free cancellation: 24hrs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleDetails;
