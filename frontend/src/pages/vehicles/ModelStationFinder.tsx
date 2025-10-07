import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Car,
  Clock,
  Star,
  Navigation,
  Zap,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Map,
  Calendar,
  DollarSign,
  Maximize2,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useCurrency } from "@/lib/currency";
import { stations } from "@/data/stations";
import { getVehicles } from "@/data/vehicles";
import {
  getVehicleModels,
  calculateDistance,
} from "@/lib/vehicle-station-utils";
import {
  PageTransition,
  FadeIn,
  SlideIn,
} from "@/components/LoadingComponents";
import { useToast } from "@/hooks/use-toast";

interface StationData {
  stationId: string;
  stationName: string;
  stationAddress: string;
  stationRating: number;
  stationOperatingHours: string;
  availableCount: number;
  rentedCount: number;
  maintenanceCount: number;
  distance: number;
}

const ModelStationFinder = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [stationsData, setStationsData] = useState<StationData[]>([]);

  // Get model data
  const models = getVehicleModels();
  const model = models.find((m) => m.modelId === modelId);

  useEffect(() => {
    if (!modelId || !model) return;

    // Load all vehicles for this model
    const allVehicles = getVehicles("en");
    const modelVehicles = allVehicles.filter((v) => v.modelId === modelId);

    // Group by station
    const stationMap: Record<string, StationData> = {};

    modelVehicles.forEach((vehicle) => {
      const station = stations.find((s) => s.id === vehicle.stationId);
      if (station) {
        if (!stationMap[station.id]) {
          stationMap[station.id] = {
            stationId: station.id,
            stationName: station.name,
            stationAddress: station.address,
            stationRating: station.rating,
            stationOperatingHours: station.operatingHours,
            availableCount: 0,
            rentedCount: 0,
            maintenanceCount: 0,
            distance: 0,
          };
        }

        const stationData = stationMap[station.id];
        if (vehicle.availability === "available") {
          stationData.availableCount++;
        } else if (vehicle.availability === "rented") {
          stationData.rentedCount++;
        } else if (vehicle.availability === "maintenance") {
          stationData.maintenanceCount++;
        }
      }
    });

    // Calculate distances if user location is available
    const stationsArray = Object.values(stationMap).map((s) => {
      const station = stations.find((st) => st.id === s.stationId);
      const distance =
        userLocation && station
          ? calculateDistance(
              userLocation.lat,
              userLocation.lng,
              station.coordinates.lat,
              station.coordinates.lng
            )
          : 0;

      return { ...s, distance };
    });

    // Sort by distance if location is set, otherwise by availability
    stationsArray.sort((a, b) => {
      if (userLocation) {
        return a.distance - b.distance;
      }
      return b.availableCount - a.availableCount;
    });

    setStationsData(stationsArray);
  }, [modelId, model, userLocation]);

  const handleGetLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoadingLocation(false);
          toast({
            title: "Location Found",
            description: "Stations are now sorted by distance from you",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Showing all stations.",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsLoadingLocation(false);
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  };

  const handleManualLocationSubmit = async () => {
    if (!manualLocation.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a location to search.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          manualLocation
        )}&key=demo&limit=1`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = {
          lat: data.results[0].geometry.lat,
          lng: data.results[0].geometry.lng,
        };
        setUserLocation(location);
        setManualLocation("");
        toast({
          title: "Location Set",
          description:
            "Stations are now sorted by distance from your location.",
        });
      } else {
        toast({
          title: "Location Not Found",
          description: "Please enter a valid address or city.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
      toast({
        title: "Geocoding Error",
        description: "Unable to find coordinates for this location.",
        variant: "destructive",
      });
    }
  };

  if (!model) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Model Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The vehicle model you're looking for doesn't exist.
              </p>
              <Button onClick={() => navigate("/vehicle-model-finder")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Model Finder
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  const totalAvailable = stationsData.reduce(
    (sum, s) => sum + s.availableCount,
    0
  );
  const totalRented = stationsData.reduce((sum, s) => sum + s.rentedCount, 0);
  const totalMaintenance = stationsData.reduce(
    (sum, s) => sum + s.maintenanceCount,
    0
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <FadeIn>
          <div className="bg-gradient-hero py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Button
                variant="ghost"
                onClick={() => navigate("/vehicle-model-finder")}
                className="text-white mb-6 hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Model Finder
              </Button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Model Info */}
                <SlideIn direction="left" delay={100}>
                  <div className="text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                      {model.name}
                    </h1>
                    <p className="text-xl text-white/90 mb-6">
                      {model.brand} • {model.type}
                    </p>
                    <p className="text-white/80 mb-6">{model.description}</p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <Zap className="h-6 w-6 mb-2" />
                        <p className="text-sm text-white/80">Range</p>
                        <p className="text-xl font-bold">
                          {model.specs.range} km
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <Users className="h-6 w-6 mb-2" />
                        <p className="text-sm text-white/80">Seats</p>
                        <p className="text-xl font-bold">{model.specs.seats}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <DollarSign className="h-6 w-6 mb-2" />
                        <p className="text-sm text-white/80">Per Hour</p>
                        <p className="text-xl font-bold">
                          ${model.basePrice.perHour}
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <MapPin className="h-6 w-6 mb-2" />
                        <p className="text-sm text-white/80">Stations</p>
                        <p className="text-xl font-bold">
                          {stationsData.length}
                        </p>
                      </div>
                    </div>

                    {/* Fleet Status */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-500 hover:bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {totalAvailable} Available
                      </Badge>
                      {totalRented > 0 && (
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                          <Clock className="h-3 w-3 mr-1" />
                          {totalRented} Rented
                        </Badge>
                      )}
                      {totalMaintenance > 0 && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {totalMaintenance} Maintenance
                        </Badge>
                      )}
                    </div>
                  </div>
                </SlideIn>

                {/* Model Image */}
                <SlideIn direction="right" delay={200}>
                  <div className="relative">
                    <img
                      src={model.image}
                      alt={model.name}
                      className="w-full h-96 object-cover rounded-lg shadow-2xl"
                    />
                  </div>
                </SlideIn>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Location Input Section */}
            <div className="lg:col-span-3">
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Find Nearest Stations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Enter your location to see stations sorted by distance, or
                    use your current location for best results.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
                      <Input
                        placeholder="Enter your city, address, or location..."
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleManualLocationSubmit();
                          }
                        }}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleManualLocationSubmit}
                        disabled={!manualLocation.trim()}
                      >
                        Search Location
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleGetLocation}
                        disabled={isLoadingLocation}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        {isLoadingLocation
                          ? "Getting Location..."
                          : "Use My Location"}
                      </Button>
                    </div>
                  </div>

                  {userLocation && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">
                          Location Set
                        </p>
                        <p className="text-sm text-green-700">
                          Stations are now sorted by distance from your location
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUserLocation(null)}
                        className="ml-auto"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stations List */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold">
                Available Stations ({stationsData.length})
              </h2>

              {stationsData.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No Stations Available
                    </h3>
                    <p className="text-muted-foreground">
                      This model is not currently available at any stations.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                stationsData.map((station, index) => (
                  <FadeIn key={station.stationId} delay={index * 50}>
                    <Card
                      className={`transition-all hover:shadow-lg ${
                        index === 0 && userLocation
                          ? "border-primary ring-2 ring-primary/20"
                          : ""
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold">
                                  {station.stationName}
                                </h3>
                                {userLocation && (
                                  <>
                                    <Badge
                                      variant="secondary"
                                      className={`font-bold ${
                                        index === 0
                                          ? "bg-primary text-primary-foreground"
                                          : index === 1
                                          ? "bg-orange-500 text-white"
                                          : index === 2
                                          ? "bg-amber-500 text-white"
                                          : "bg-gray-500 text-white"
                                      }`}
                                    >
                                      #{index + 1}
                                    </Badge>
                                    {index === 0 && (
                                      <Badge className="bg-primary">
                                        <Navigation className="h-3 w-3 mr-1" />
                                        Nearest
                                      </Badge>
                                    )}
                                  </>
                                )}
                              </div>

                              <p className="text-muted-foreground flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4" />
                                {station.stationAddress}
                              </p>

                              {/* Distance Badge */}
                              {station.distance > 0 && userLocation && (
                                <Badge
                                  variant="secondary"
                                  className={`font-semibold ${
                                    station.distance < 5
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : station.distance < 15
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                      : "bg-red-100 text-red-800 border-red-200"
                                  }`}
                                >
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {station.distance.toFixed(1)} km away
                                  <span className="ml-2">
                                    {station.distance < 5
                                      ? "🚗 Very close"
                                      : station.distance < 15
                                      ? "🚙 Nearby"
                                      : "🚛 Far"}
                                  </span>
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Fleet Status */}
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-3">
                              {model.name} Availability at This Station
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {station.availableCount > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {station.availableCount} Available
                                </Badge>
                              )}
                              {station.rentedCount > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-orange-50 text-orange-700 border-orange-200"
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  {station.rentedCount} Rented
                                </Badge>
                              )}
                              {station.maintenanceCount > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-red-50 text-red-700 border-red-200"
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {station.maintenanceCount} Maintenance
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Station Details */}
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {station.stationOperatingHours}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              {station.stationRating}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-3">
                            <Button asChild variant="outline">
                              <Link to={`/stations/${station.stationId}`}>
                                <Map className="h-4 w-4 mr-2" />
                                View Station
                              </Link>
                            </Button>
                            <Button
                              asChild
                              disabled={station.availableCount === 0}
                            >
                              <Link
                                to={`/stations/${station.stationId}?model=${modelId}`}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                {station.availableCount > 0
                                  ? "Book Now"
                                  : "No Vehicles Available"}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                ))
              )}
            </div>

            {/* Sidebar - Model Summary */}
            <div className="space-y-6">
              {/* Model Summary Card */}
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Model Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <img
                    src={model.image}
                    alt={model.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />

                  <div>
                    <h3 className="font-semibold text-lg mb-2">{model.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {model.brand} • {model.type}
                    </p>
                  </div>

                  <Separator />

                  {/* Specifications */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Range:
                      </span>
                      <span className="font-medium">
                        {model.specs.range} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Seats:
                      </span>
                      <span className="font-medium">{model.specs.seats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Maximize2 className="h-4 w-4" />
                        Type:
                      </span>
                      <span className="font-medium">{model.type}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Hourly Rate:
                      </span>
                      <span className="font-semibold text-lg">
                        ${model.basePrice.perHour}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Daily Rate:</span>
                      <span className="font-semibold text-lg">
                        ${model.basePrice.perDay}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Total Fleet Status */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      Total Fleet Status
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Available:
                        </span>
                        <Badge className="bg-green-500">{totalAvailable}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rented:</span>
                        <Badge className="bg-orange-500">{totalRented}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Maintenance:
                        </span>
                        <Badge className="bg-red-500">{totalMaintenance}</Badge>
                      </div>
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                        <span>Total Vehicles:</span>
                        <span>
                          {totalAvailable + totalRented + totalMaintenance}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pro Tips Card */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-2">
                  <p>📍 Use your location to find the nearest station</p>
                  <p>🚗 Green badges = very close stations</p>
                  <p>⚡ Book early for guaranteed availability</p>
                  <p>⭐ Check station ratings before booking</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ModelStationFinder;
