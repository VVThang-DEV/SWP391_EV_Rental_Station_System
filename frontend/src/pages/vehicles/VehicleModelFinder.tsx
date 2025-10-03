import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  MapPin,
  Car,
  Clock,
  Star,
  Navigation,
  Zap,
  Users,
  CheckCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { stations } from "@/data/stations";
import { getVehicles } from "@/data/vehicles";
import {
  getVehicleModels,
  findStationsWithModel,
  getVehicleAvailabilitySummary,
  getStationsWithVehicleInfo, // Thêm dòng này
  StationLocation,
  VehicleModel,
} from "@/lib/vehicle-station-utils";
import {
  PageTransition,
  FadeIn,
  SlideIn,
} from "@/components/LoadingComponents";
import { useToast } from "@/hooks/use-toast";

interface AvailabilityData {
  model: VehicleModel;
  stations: Array<{
    stationId: string;
    stationName: string;
    count: number;
    distance: number;
  }>;
  totalAvailable: number;
}

interface StationWithModel {
  id: string;
  name: string;
  address: string;
  distance: number;
  operatingHours: string;
  rating: number;
}

const VehicleModelFinder = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [stationsWithModel, setStationsWithModel] = useState<
    StationWithModel[]
  >([]);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]>(
    []
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    // Load availability data từ dữ liệu thực tế
    const models = getVehicleModels(); // Lấy danh sách mẫu xe thực tế
    const stationsWithInfo = getStationsWithVehicleInfo(); // Lấy thông tin trạm và xe

    const data = models.map((model) => {
      const stationAvailability = stationsWithInfo
        .filter((station) =>
          station.availableModels.some((m) => m.modelId === model.modelId)
        )
        .map((station) => {
          const modelData = station.availableModels.find(
            (m) => m.modelId === model.modelId
          );
          return {
            stationId: station.id,
            stationName: station.name,
            count: modelData?.count || 0,
            distance: 0, // Nếu cần, tính khoảng cách từ vị trí người dùng
          };
        });

      return {
        model,
        stations: stationAvailability,
        totalAvailable: stationAvailability.reduce(
          (sum, station) => sum + station.count,
          0
        ),
      };
    });

    setAvailabilityData(data);
  }, []); // Include dependencies

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
            description: "Now showing distances to stations",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
          toast({
            title: "Location Error",
            description:
              "Unable to get your location. Distances won't be shown.",
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

  const filteredModels = availabilityData
    .map((data) => data.model)
    .filter(
      (model) =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    const modelData = availabilityData.find((d) => d.model.modelId === modelId);
    if (modelData) {
      // In real implementation, this would call the utility functions
      setStationsWithModel(
        modelData.stations
          .map((s) => {
            const station = stations.find(
              (station) => station.id === s.stationId
            );
            return station
              ? {
                id: station.id,
                name: station.name,
                address: station.address,
                distance: s.distance,
                operatingHours: station.operatingHours,
                rating: station.rating,
              }
              : null;
          })
          .filter((station): station is StationWithModel => station !== null)
      );
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <FadeIn>
          <div className="bg-gradient-hero py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <SlideIn direction="top" delay={100}>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Find Your Vehicle Model
                </h1>
              </SlideIn>
              <SlideIn direction="top" delay={200}>
                <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                  Discover which stations have your preferred vehicle model
                  available and find the nearest location to you.
                </p>
              </SlideIn>
            </div>
          </div>
        </FadeIn>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Search and Models */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search Bar */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        placeholder="Search by model, brand, or vehicle type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
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
                </CardContent>
              </Card>

              {/* Vehicle Models Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredModels.map((model, index) => {
                  const availability = availabilityData.find(
                    (d) => d.model.modelId === model.modelId
                  );
                  const totalAvailable = availability?.totalAvailable || 0;
                  const stationCount = availability?.stations.length || 0;

                  return (
                    <FadeIn key={model.modelId} delay={300 + index * 100}>
                      <Card className="card-premium h-full flex flex-col">
                        <div className="relative">
                          <img
                            src={model.image}
                            alt={model.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <Badge
                            className={`absolute top-3 right-3 ${totalAvailable > 0 ? "bg-green-500" : "bg-red-500"
                              }`}
                          >
                            {totalAvailable} available
                          </Badge>
                        </div>

                        <CardContent className="p-6 flex-1 flex flex-col">
                          <div className="mb-4">
                            <h3 className="text-xl font-semibold mb-2">
                              {model.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Car className="h-4 w-4" />
                                {model.type}
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="h-4 w-4" />
                                {model.specs.range} km
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {model.specs.seats} seats
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {model.description}
                            </p>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium">Available at:</span>
                              <span className="text-primary">
                                {stationCount}{" "}
                                {stationCount === 1 ? "station" : "stations"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-auto space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>From ${model.basePrice.perHour}/hour</span>
                              <span>From ${model.basePrice.perDay}/day</span>
                            </div>

                            <Button
                              className="w-full"
                              onClick={() => handleModelSelect(model.modelId)}
                              disabled={totalAvailable === 0}
                            >
                              {totalAvailable > 0
                                ? "Find Stations"
                                : "Not Available"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  );
                })}
              </div>
            </div>

            {/* Right Column - Selected Model Info */}
            <div className="space-y-6">
              {selectedModel ? (
                <FadeIn delay={400}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Available Locations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {stationsWithModel.length > 0 ? (
                        stationsWithModel.map((station) => (
                          <div
                            key={station.id}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{station.name}</h4>
                              <div className="flex items-center gap-2">
                                {/* ✅ THÊM MỚI: Hiển thị số lượng xe */}
                                {(() => {
                                  const modelData = availabilityData.find((d) => d.model.modelId === selectedModel);
                                  const stationData = modelData?.stations.find((s) => s.stationId === station.id);
                                  const vehicleCount = stationData?.count || 0;
                                  return (
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      {vehicleCount} available
                                    </Badge>
                                  );
                                })()}
                                {station.distance && (
                                  <Badge variant="outline">
                                    {station.distance.toFixed(1)} km
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {station.address}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {station.operatingHours}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {station.rating}
                              </span>
                            </div>
                            <Button asChild size="sm" className="w-full">
                              <Link to={`/stations/${station.id}`}>
                                View Station Details
                              </Link>
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No stations available for this model
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </FadeIn>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Select a Vehicle Model</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a vehicle model to see which stations have it
                      available
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Models:</span>
                      <span className="font-medium">{availabilityData.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Available Vehicles:</span>
                      <span className="font-medium text-green-600">
                        {availabilityData.reduce(
                          (sum, data) => sum + data.totalAvailable,
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Stations:</span>
                      <span className="font-medium">{stations.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-2">
                  <p>💡 Use your location to see distances to stations</p>
                  <p>🔍 Search by brand, model, or vehicle type</p>
                  <p>⚡ Check station amenities for fast charging</p>
                  <p>📱 Book directly from station details page</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default VehicleModelFinder;
