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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  calculateDistance,
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
    availableCount: number;
    rentedCount: number;
    maintenanceCount: number;
    distance: number;
  }>;
  totalAvailable: number;
  totalRented: number;
  totalMaintenance: number;
  totalVehicles: number;
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
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
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
  const [manualLocation, setManualLocation] = useState("");
  const [isManualLocationOpen, setIsManualLocationOpen] = useState(false);

  useEffect(() => {
    // Load ALL vehicles (available, rented, maintenance)
    const allVehicles = getVehicles("en");
    const models = getVehicleModels();

    const data = models.map((model) => {
      // Get all vehicles of this model across all stations
      const modelVehicles = allVehicles.filter(
        (v) => v.modelId === model.modelId
      );

      // Group by station
      const stationMap = new Map<
        string,
        {
          stationId: string;
          stationName: string;
          availableCount: number;
          rentedCount: number;
          maintenanceCount: number;
        }
      >();

      modelVehicles.forEach((vehicle) => {
        const station = stations.find((s) => s.id === vehicle.stationId);
        if (station) {
          if (!stationMap.has(station.id)) {
            stationMap.set(station.id, {
              stationId: station.id,
              stationName: station.name,
              availableCount: 0,
              rentedCount: 0,
              maintenanceCount: 0,
            });
          }

          const stationData = stationMap.get(station.id)!;
          if (vehicle.availability === "available") {
            stationData.availableCount++;
          } else if (vehicle.availability === "rented") {
            stationData.rentedCount++;
          } else if (vehicle.availability === "maintenance") {
            stationData.maintenanceCount++;
          }
        }
      });

      const stationAvailability = Array.from(stationMap.values())
        .map((s) => {
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

          return {
            stationId: s.stationId,
            stationName: s.stationName,
            count: s.availableCount + s.rentedCount + s.maintenanceCount,
            availableCount: s.availableCount,
            rentedCount: s.rentedCount,
            maintenanceCount: s.maintenanceCount,
            distance,
          };
        })
        .sort((a, b) => {
          if (userLocation) {
            return a.distance - b.distance;
          }
          return 0; // Keep original order if no location
        });

      const totalAvailable = stationAvailability.reduce(
        (sum, s) => sum + s.availableCount,
        0
      );
      const totalRented = stationAvailability.reduce(
        (sum, s) => sum + s.rentedCount,
        0
      );
      const totalMaintenance = stationAvailability.reduce(
        (sum, s) => sum + s.maintenanceCount,
        0
      );

      return {
        model,
        stations: stationAvailability,
        totalAvailable,
        totalRented,
        totalMaintenance,
        totalVehicles: totalAvailable + totalRented + totalMaintenance,
      };
    });

    setAvailabilityData(data);
  }, [userLocation]);

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
      // Use a geocoding service to convert address to coordinates
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
        setIsManualLocationOpen(false);
        setManualLocation("");
        toast({
          title: "Location Set",
          description: "Location updated successfully.",
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

  const filteredModels = availabilityData
    .map((data) => data.model)
    .filter(
      (model) =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const searchSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const allModels = availabilityData.map((data) => data.model);
    const suggestions = allModels
      .filter(
        (model) =>
          model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 8); // Limit to 8 suggestions

    return suggestions;
  }, [searchTerm, availabilityData]);

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
                      <Popover
                        open={isSuggestionsOpen}
                        onOpenChange={setIsSuggestionsOpen}
                      >
                        <PopoverTrigger asChild>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
                            <Input
                              placeholder="Search by model, brand, or vehicle type..."
                              value={searchTerm}
                              onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setIsSuggestionsOpen(e.target.value.length > 0);
                              }}
                              onFocus={() =>
                                setIsSuggestionsOpen(searchTerm.length > 0)
                              }
                              className="pl-10"
                            />
                          </div>
                        </PopoverTrigger>
                        {searchSuggestions.length > 0 && (
                          <PopoverContent
                            className="w-[--radix-popover-trigger-width] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandList>
                                <CommandEmpty>No models found.</CommandEmpty>
                                <CommandGroup>
                                  {searchSuggestions.map((model) => (
                                    <CommandItem
                                      key={model.modelId}
                                      value={`${model.brand} ${model.name}`}
                                      onSelect={() => {
                                        setSearchTerm(
                                          `${model.brand} ${model.name}`
                                        );
                                        setIsSuggestionsOpen(false);
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Car className="h-4 w-4" />
                                        <div>
                                          <div className="font-medium">
                                            {model.name}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            {model.brand} • {model.type}
                                          </div>
                                        </div>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        )}
                      </Popover>
                    </div>
                    <div className="flex gap-2">
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
                      <Button
                        variant="outline"
                        onClick={() =>
                          setIsManualLocationOpen(!isManualLocationOpen)
                        }
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Enter Location
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Manual Location Input */}
              {isManualLocationOpen && (
                <Card>
                  <CardContent className="pt-6">
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
                          Set Location
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsManualLocationOpen(false);
                            setManualLocation("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                          <div className="absolute top-3 right-3 flex gap-2">
                            {totalAvailable > 0 ? (
                              <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-lg animate-pulse">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {totalAvailable} ready
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-600 border border-gray-300"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                Unavailable
                              </Badge>
                            )}
                            {stationCount > 0 && (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200"
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                {stationCount} stations
                              </Badge>
                            )}
                          </div>
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

                            {/* Vehicle Status Breakdown */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <div className="text-xs font-medium text-gray-600 mb-2">
                                Fleet Status
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {availability && (
                                  <>
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50 text-green-700 border-green-200"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      {availability.totalAvailable} Available
                                    </Badge>
                                    {availability.totalRented > 0 && (
                                      <Badge
                                        variant="outline"
                                        className="bg-orange-50 text-orange-700 border-orange-200"
                                      >
                                        <Clock className="h-3 w-3 mr-1" />
                                        {availability.totalRented} Rented
                                      </Badge>
                                    )}
                                    {availability.totalMaintenance > 0 && (
                                      <Badge
                                        variant="outline"
                                        className="bg-red-50 text-red-700 border-red-200"
                                      >
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {availability.totalMaintenance}{" "}
                                        Maintenance
                                      </Badge>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-3">
                              {model.description}
                            </p>

                            {/* Station Availability Info */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                Available at {stationCount} station
                                {stationCount !== 1 ? "s" : ""}
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {model.specs.range} km range
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
                              disabled={
                                !availability ||
                                availability.totalVehicles === 0
                              }
                              variant={
                                totalAvailable > 0 ? "default" : "outline"
                              }
                            >
                              {availability && availability.totalVehicles > 0
                                ? totalAvailable > 0
                                  ? "Find Stations"
                                  : `View ${availability.totalVehicles} Stations (All Busy)`
                                : "No Vehicles"}
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
                        stationsWithModel.map((station, index) => (
                          <div
                            key={station.id}
                            className={`p-4 border rounded-lg transition-all duration-200 ${
                              index === 0 && userLocation
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "hover:shadow-sm"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-lg">
                                    {station.name}
                                  </h4>
                                  {userLocation && (
                                    <Badge
                                      variant="secondary"
                                      className={`text-xs font-bold ${
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
                                  )}
                                  {index === 0 && userLocation && (
                                    <Badge className="bg-primary text-primary-foreground shadow-sm">
                                      <Navigation className="h-3 w-3 mr-1" />
                                      Nearest
                                    </Badge>
                                  )}
                                </div>

                                {/* Distance Display - Only show when location is set */}
                                {station.distance && userLocation && (
                                  <div className="flex items-center gap-2">
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
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {station.distance < 5
                                        ? "🚗 Very close"
                                        : station.distance < 15
                                        ? "🚙 Nearby"
                                        : "🚛 Far"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {station.address}
                            </p>

                            {/* Vehicle Status Breakdown at this Station */}
                            {(() => {
                              const modelData = availabilityData.find(
                                (d) => d.model.modelId === selectedModel
                              );
                              const stationData = modelData?.stations.find(
                                (s) => s.stationId === station.id
                              );

                              if (!stationData) return null;

                              return (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {stationData.availableCount > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50 text-green-700 border-green-200"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      {stationData.availableCount} Available
                                    </Badge>
                                  )}
                                  {stationData.rentedCount > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="bg-orange-50 text-orange-700 border-orange-200"
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      {stationData.rentedCount} Rented
                                    </Badge>
                                  )}
                                  {stationData.maintenanceCount > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="bg-red-50 text-red-700 border-red-200"
                                    >
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      {stationData.maintenanceCount} Maintenance
                                    </Badge>
                                  )}
                                </div>
                              );
                            })()}
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
                      <span className="text-sm text-muted-foreground">
                        Total Models:
                      </span>
                      <span className="font-medium">
                        {availabilityData.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Available Vehicles:
                      </span>
                      <span className="font-medium text-green-600">
                        {availabilityData.reduce(
                          (sum, data) => sum + data.totalAvailable,
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Stations:
                      </span>
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
