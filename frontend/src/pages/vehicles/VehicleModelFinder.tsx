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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
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

  // Demo data - in production, this would come from the API
  const mockVehicleModels: VehicleModel[] = useMemo(
    () => [
      // Original models
      {
        modelId: "VF8",
        name: "VinFast VF8",
        brand: "VinFast",
        model: "VF8",
        type: "SUV",
        image:
          "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400",
        basePrice: { perHour: 15, perDay: 120 },
        specs: {
          range: 420,
          seats: 5,
          features: ["Premium Sound", "Autopilot", "Fast Charging"],
        },
        description: "Premium electric SUV with cutting-edge technology",
      },
      {
        modelId: "MODEL3",
        name: "Tesla Model 3",
        brand: "Tesla",
        model: "Model 3",
        type: "Sedan",
        image:
          "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
        basePrice: { perHour: 18, perDay: 150 },
        specs: {
          range: 358,
          seats: 5,
          features: ["Autopilot", "Supercharging", "Premium Interior"],
        },
        description: "Iconic electric sedan with unmatched performance",
      },
      {
        modelId: "KONA",
        name: "Hyundai Kona Electric",
        brand: "Hyundai",
        model: "Kona Electric",
        type: "Crossover",
        image:
          "https://images.unsplash.com/photo-1549399735-cef2e2c3f638?w=400",
        basePrice: { perHour: 12, perDay: 90 },
        specs: {
          range: 305,
          seats: 5,
          features: ["Fast Charging", "Safety Tech", "Eco Mode"],
        },
        description: "Affordable electric crossover for city driving",
      },
      // Luxury models
      {
        modelId: "MERCEDES_EQS",
        name: "Mercedes-Benz EQS",
        brand: "Mercedes-Benz",
        model: "EQS",
        type: "Sedan",
        image:
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400",
        basePrice: { perHour: 35, perDay: 280 },
        specs: {
          range: 516,
          seats: 5,
          features: ["MBUX Hyperscreen", "Massage Seats", "Air Suspension"],
        },
        description:
          "Ultimate luxury electric sedan with cutting-edge technology",
      },
      {
        modelId: "PORSCHE_TAYCAN",
        name: "Porsche Taycan",
        brand: "Porsche",
        model: "Taycan",
        type: "Sedan",
        image:
          "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400",
        basePrice: { perHour: 42, perDay: 350 },
        specs: {
          range: 484,
          seats: 4,
          features: ["Launch Control", "Sport Chrono", "Carbon Interior"],
        },
        description: "Pure performance meets electric efficiency",
      },
      // Budget models
      {
        modelId: "CHEVROLET_BOLT",
        name: "Chevrolet Bolt EV",
        brand: "Chevrolet",
        model: "Bolt EV",
        type: "Hatchback",
        image:
          "https://images.unsplash.com/photo-1549399735-cef2e2c3f638?w=400",
        basePrice: { perHour: 9, perDay: 65 },
        specs: {
          range: 327,
          seats: 5,
          features: [
            "Regenerative Braking",
            "OnStar",
            "Smartphone Integration",
          ],
        },
        description: "Affordable electric vehicle perfect for daily commuting",
      },
      {
        modelId: "VOLKSWAGEN_ID3",
        name: "Volkswagen ID.3",
        brand: "Volkswagen",
        model: "ID.3",
        type: "Hatchback",
        image:
          "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400",
        basePrice: { perHour: 11, perDay: 75 },
        specs: {
          range: 340,
          seats: 5,
          features: ["ID.Light", "App Connect", "Wireless Charging"],
        },
        description: "Compact and efficient electric car for urban mobility",
      },
      // Performance models
      {
        modelId: "TESLA_MODEL_S",
        name: "Tesla Model S",
        brand: "Tesla",
        model: "Model S",
        type: "Sedan",
        image:
          "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
        basePrice: { perHour: 28, perDay: 220 },
        specs: {
          range: 652,
          seats: 5,
          features: ["Ludicrous Mode", "17'' Touchscreen", "Autopilot"],
        },
        description: "High-performance luxury sedan with incredible range",
      },
      {
        modelId: "BMW_I4",
        name: "BMW i4 M50",
        brand: "BMW",
        model: "i4 M50",
        type: "Sedan",
        image:
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
        basePrice: { perHour: 25, perDay: 200 },
        specs: {
          range: 435,
          seats: 5,
          features: [
            "M Sport Package",
            "Harman Kardon Audio",
            "Head-Up Display",
          ],
        },
        description: "Sports performance meets electric efficiency",
      },
      // Alternative vehicles
      {
        modelId: "YAMAHA_EC05",
        name: "Yamaha EC-05",
        brand: "Yamaha",
        model: "EC-05",
        type: "Scooter",
        image:
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
        basePrice: { perHour: 4, perDay: 25 },
        specs: {
          range: 110,
          seats: 2,
          features: ["Smart Key", "USB Charging", "LED Lighting"],
        },
        description: "Convenient electric scooter for city commuting",
      },
      {
        modelId: "SPECIALIZED_TURBO",
        name: "Specialized Turbo Vado",
        brand: "Specialized",
        model: "Turbo Vado",
        type: "Bike",
        image:
          "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400",
        basePrice: { perHour: 3, perDay: 20 },
        specs: {
          range: 80,
          seats: 1,
          features: [
            "Pedal Assist",
            "Integrated Lights",
            "Mission Control App",
          ],
        },
        description: "High-performance electric bike for sustainable transport",
      },
    ],
    []
  );

  const mockStationAvailability = useMemo(
    () => ({
      VF8: [
        {
          stationId: "st1",
          stationName: "District 1 Station",
          count: 1,
          distance: 1.2,
        },
        {
          stationId: "st2",
          stationName: "District 7 Station",
          count: 1,
          distance: 8.5,
        },
      ],
      MODEL3: [
        {
          stationId: "st1",
          stationName: "District 1 Station",
          count: 1,
          distance: 1.2,
        },
        {
          stationId: "st2",
          stationName: "District 7 Station",
          count: 1,
          distance: 8.5,
        },
      ],
      KONA: [
        {
          stationId: "st3",
          stationName: "Airport Station",
          count: 2,
          distance: 15.3,
        },
      ],
    }),
    []
  );

  useEffect(() => {
    // Load availability data
    const data = mockVehicleModels.map((model) => ({
      model,
      stations:
        mockStationAvailability[
          model.modelId as keyof typeof mockStationAvailability
        ] || [],
      totalAvailable: (
        mockStationAvailability[
          model.modelId as keyof typeof mockStationAvailability
        ] || []
      ).reduce((sum, station) => sum + station.count, 0),
    }));
    setAvailabilityData(data);
  }, [mockVehicleModels, mockStationAvailability]); // Include dependencies

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

  const filteredModels = mockVehicleModels.filter(
    (model) =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const suggestions =
    searchTerm.trim() === ""
      ? []
      : filteredModels.slice(0, 5).map((model) => ({
          id: model.modelId,
          label: `${model.brand} ${model.name} (${model.type})`,
          value: model.name,
        }));

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
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowSuggestions(true);
                          setSelectedSuggestionIndex(-1);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() =>
                          setTimeout(() => setShowSuggestions(false), 200)
                        }
                        onKeyDown={(e) => {
                          if (!showSuggestions || suggestions.length === 0)
                            return;

                          switch (e.key) {
                            case "ArrowDown":
                              e.preventDefault();
                              setSelectedSuggestionIndex((prev) =>
                                prev < suggestions.length - 1 ? prev + 1 : 0
                              );
                              break;
                            case "ArrowUp":
                              e.preventDefault();
                              setSelectedSuggestionIndex((prev) =>
                                prev > 0 ? prev - 1 : suggestions.length - 1
                              );
                              break;
                            case "Enter":
                              e.preventDefault();
                              if (selectedSuggestionIndex >= 0) {
                                setSearchTerm(
                                  suggestions[selectedSuggestionIndex].value
                                );
                                setShowSuggestions(false);
                                setSelectedSuggestionIndex(-1);
                              }
                              break;
                            case "Escape":
                              setShowSuggestions(false);
                              setSelectedSuggestionIndex(-1);
                              break;
                          }
                        }}
                        className="pl-10"
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={suggestion.id}
                              className={`px-4 py-2 cursor-pointer text-sm ${
                                index === selectedSuggestionIndex
                                  ? "bg-blue-100 text-blue-900"
                                  : "hover:bg-gray-100"
                              }`}
                              onClick={() => {
                                setSearchTerm(suggestion.value);
                                setShowSuggestions(false);
                                setSelectedSuggestionIndex(-1);
                              }}
                            >
                              {suggestion.label}
                            </div>
                          ))}
                        </div>
                      )}
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
                            className={`absolute top-3 right-3 ${
                              totalAvailable > 0 ? "bg-green-500" : "bg-red-500"
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
                              {station.distance && (
                                <Badge variant="outline">
                                  {station.distance.toFixed(1)} km
                                </Badge>
                              )}
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
                      <span className="text-sm text-muted-foreground">
                        Total Models:
                      </span>
                      <span className="font-medium">
                        {mockVehicleModels.length}
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
