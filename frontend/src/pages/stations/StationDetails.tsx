import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import VehicleCard from "@/components/VehicleCard";
import { GoogleMaps } from "@/components/GoogleMaps";
import { stations } from "@/data/stations";
import { getVehicles } from "@/data/vehicles";
import { useTranslation } from "@/contexts/TranslationContext";
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
} from "lucide-react";

const StationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useTranslation();
  const [selectedStation, setSelectedStation] = useState<string>("");

  const station = stations.find((s) => s.id === id);
  const vehicles = getVehicles(language);

  // Get vehicles available at this station
  const stationVehicles = vehicles.filter(
    (vehicle) => vehicle.location === station?.name
  );

  useEffect(() => {
    if (station) {
      setSelectedStation(station.id);
    }
  }, [station]);

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

            {/* Available Vehicles */}
            <Card>
              <CardHeader>
                <CardTitle>{t("common.availableVehicles")}</CardTitle>
              </CardHeader>
              <CardContent>
                {stationVehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stationVehicles.map((vehicle) => (
                      <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {t("common.noVehiclesFound")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to={`/book?station=${station.id}`}>
                    <Car className="h-4 w-4 mr-2" />
                    {t("common.bookNow")}
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
                <CardTitle>{t("common.availability")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {t("common.availableVehicles")}
                    </span>
                    <Badge variant="default">{station.availableVehicles}</Badge>
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
