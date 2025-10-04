import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import VehicleCard from "@/components/VehicleCard";
import { GoogleMaps } from "@/components/GoogleMaps";
import { stations } from "@/data/stations";
import { getVehicles } from "@/data/vehicles";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Clock,
  Star,
  Zap,
  Phone,
  Wifi,
  Coffee,
  Car,
  ArrowLeft,
  Navigation,
  CheckCircle,
  Users,
  Info,
} from "lucide-react";

const StationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const location = useLocation();
  const [selectedStation, setSelectedStation] = useState<string>("");

  const station = stations.find((s) => s.id === id);
  const vehicles = getVehicles(language);

  // Check if user came from stations list with personal info completed
  const fromStations = location.state?.fromStations || false;
  const userReady = location.state?.userReady || false;

  // Get ALL vehicles at this station (available, rented, maintenance)
  const allStationVehicles = vehicles.filter(
    (vehicle) => vehicle.stationId === station?.id
  );

  // Group vehicles by availability status
  const availableVehicles = allStationVehicles.filter(
    (v) => v.availability === "available"
  );
  const rentedVehicles = allStationVehicles.filter(
    (v) => v.availability === "rented"
  );
  const maintenanceVehicles = allStationVehicles.filter(
    (v) => v.availability === "maintenance"
  );

  // For backward compatibility
  const stationVehicles = availableVehicles;

  useEffect(() => {
    if (station) {
      setSelectedStation(station.id);
    }
  }, [station]);

  // Show a welcome message for users who completed personal info
  useEffect(() => {
    if (userReady) {
      toast({
        title: "You're all set!",
        description:
          "Your profile is complete. You can now rent any available vehicle.",
        duration: 5000,
      });
    }
  }, [userReady, toast]);

  if (!station) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t("common.vehicleNotFound")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("common.vehicleNotFound")}
          </p>
          <Button asChild>
            <Link to="/stations">{t("nav.stations")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "fast charging":
        return <Zap className="h-4 w-4" />;
      case "cafe":
      case "restaurant":
        return <Coffee className="h-4 w-4" />;
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      case "parking":
        return <Car className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white hover:bg-white/20"
            >
              <Link to="/stations">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("nav.stations")}
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {station.name}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            {station.address}, {station.city}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Station Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Station Image */}
            <Card>
              <img
                src={station.image}
                alt={station.name}
                className="w-full h-64 object-cover rounded-t-lg"
              />
            </Card>

            {/* Station Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t("common.location")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{t("common.hour")}</p>
                      <p className="text-sm text-muted-foreground">
                        {station.operatingHours}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">{t("common.rating")}</p>
                      <p className="text-sm text-muted-foreground">
                        {station.rating} {t("common.reviews")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {t("common.availableVehicles")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {station.availableVehicles}/{station.totalSlots}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">
                        {station.fastCharging
                          ? t("common.hour")
                          : t("common.day")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {station.fastCharging
                          ? "Fast Charging"
                          : "Standard Charging"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <h3 className="font-medium mb-3">
                    {t("common.whatsIncluded")}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {station.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Models Overview */}
            {stationVehicles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Vehicle Models</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from(
                      stationVehicles.reduce((modelMap, vehicle) => {
                        const key = `${vehicle.brand} ${vehicle.model}`;
                        if (!modelMap.has(key)) {
                          modelMap.set(key, {
                            brand: vehicle.brand,
                            model: vehicle.model,
                            type: vehicle.type,
                            count: 0,
                            priceRange: {
                              min: vehicle.pricePerHour,
                              max: vehicle.pricePerHour,
                            },
                            image: vehicle.image,
                          });
                        }
                        const existing = modelMap.get(key)!;
                        existing.count += 1;
                        existing.priceRange.min = Math.min(
                          existing.priceRange.min,
                          vehicle.pricePerHour
                        );
                        existing.priceRange.max = Math.max(
                          existing.priceRange.max,
                          vehicle.pricePerHour
                        );
                        return modelMap;
                      }, new Map())
                    ).map(([modelName, info]) => (
                      <div
                        key={modelName}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50"
                      >
                        <img
                          src={info.image}
                          alt={modelName}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {modelName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {info.type}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className="text-xs">
                              {info.count} available
                            </Badge>
                            <span className="text-xs font-medium">
                              $
                              {info.priceRange.min === info.priceRange.max
                                ? info.priceRange.min
                                : `${info.priceRange.min}-${info.priceRange.max}`}
                              /hr
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Vehicles at Station */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                  <span>Vehicles at this Station</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {availableVehicles.length > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        {availableVehicles.length} Available
                      </Badge>
                    )}
                    {rentedVehicles.length > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200"
                      >
                        {rentedVehicles.length} Rented
                      </Badge>
                    )}
                    {maintenanceVehicles.length > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        {maintenanceVehicles.length} Maintenance
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                {userReady && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Ready to book - Documents verified</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {allStationVehicles.length > 0 ? (
                  <div className="space-y-6">
                    {/* Available Vehicles Section */}
                    {availableVehicles.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold text-green-700">
                            Available Now ({availableVehicles.length})
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableVehicles.map((vehicle) => (
                            <VehicleCard key={vehicle.id} vehicle={vehicle} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rented Vehicles Section */}
                    {rentedVehicles.length > 0 && (
                      <div>
                        <Separator className="my-4" />
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-5 w-5 text-orange-600" />
                          <h3 className="font-semibold text-orange-700">
                            Currently Rented ({rentedVehicles.length})
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {rentedVehicles.map((vehicle) => (
                            <VehicleCard key={vehicle.id} vehicle={vehicle} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Maintenance Vehicles Section */}
                    {maintenanceVehicles.length > 0 && (
                      <div>
                        <Separator className="my-4" />
                        <div className="flex items-center gap-2 mb-3">
                          <Info className="h-5 w-5 text-red-600" />
                          <h3 className="font-semibold text-red-700">
                            Under Maintenance ({maintenanceVehicles.length})
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {maintenanceVehicles.map((vehicle) => (
                            <VehicleCard key={vehicle.id} vehicle={vehicle} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No vehicles at this station at the moment
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try checking other stations
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Station Tips */}
            {userReady && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <Info className="h-5 w-5 mr-2" />
                    Booking Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-2">
                  <p>✓ Your identity documents have been verified</p>
                  <p>✓ You can book any available vehicle instantly</p>
                  <p>✓ Payment is processed securely during booking</p>
                  <p>✓ Station operating hours: {station?.operatingHours}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  asChild
                  disabled={availableVehicles.length === 0}
                  variant={availableVehicles.length > 0 ? "default" : "outline"}
                >
                  <Link
                    to={
                      availableVehicles.length > 0
                        ? `/vehicles?station=${station.id}`
                        : "#"
                    }
                  >
                    <Car className="h-4 w-4 mr-2" />
                    {availableVehicles.length > 0
                      ? t("common.bookNow")
                      : allStationVehicles.length > 0
                      ? `All ${allStationVehicles.length} vehicles busy`
                      : "No vehicles at station"}
                  </Link>
                </Button>

                <Button variant="outline" className="w-full">
                  <Navigation className="h-4 w-4 mr-2" />
                  {t("common.directions")}
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/contact">
                    <Phone className="h-4 w-4 mr-2" />
                    {t("nav.contact")}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Station Status */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">Available</span>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {availableVehicles.length}
                    </Badge>
                  </div>

                  {rentedVehicles.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-700">Rented</span>
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200"
                      >
                        {rentedVehicles.length}
                      </Badge>
                    </div>
                  )}

                  {maintenanceVehicles.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-700">Maintenance</span>
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        {maintenanceVehicles.length}
                      </Badge>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-sm">Total Vehicles</span>
                    <Badge variant="secondary">
                      {allStationVehicles.length}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("common.hour")}</span>
                    <Badge
                      variant={
                        station.operatingHours === "24/7"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {station.operatingHours}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("common.status")}</span>
                    <Badge variant="default">{t("common.active")}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Preview */}
            <Card>
              <CardHeader>
                <CardTitle>{t("common.location")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full relative">
                    <GoogleMaps
                      selectedStation={selectedStation}
                      onStationSelect={setSelectedStation}
                      height="100%"
                      showControls={false}
                      showLegend={false}
                      showInfo={false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationDetails;
