import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
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
  X,
  GitCompare,
  Map,
  Calendar,
  DollarSign,
  Maximize2,
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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
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

  // New filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [seatsFilter, setSeatsFilter] = useState<number[]>([]);
  const [rangeFilter, setRangeFilter] = useState<[number, number]>([0, 500]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Comparison mode
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(
    []
  );
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      interface StationData {
        stationId: string;
        stationName: string;
        availableCount: number;
        rentedCount: number;
        maintenanceCount: number;
      }

      const stationMap: Record<string, StationData> = {};

      modelVehicles.forEach((vehicle) => {
        const station = stations.find((s) => s.id === vehicle.stationId);
        if (station) {
          if (!stationMap[station.id]) {
            stationMap[station.id] = {
              stationId: station.id,
              stationName: station.name,
              availableCount: 0,
              rentedCount: 0,
              maintenanceCount: 0,
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

      const stationAvailability = Object.values(stationMap)
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

  // Enhanced filtering with all filters
  const filteredModels = availabilityData
    .map((data) => data.model)
    .filter((model) => {
      // Search filter
      const matchesSearch =
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.type.toLowerCase().includes(searchTerm.toLowerCase());

      // Price filter (check per-hour rate)
      const matchesPrice =
        model.basePrice.perHour >= priceRange[0] &&
        model.basePrice.perHour <= priceRange[1];

      // Seats filter
      const matchesSeats =
        seatsFilter.length === 0 || seatsFilter.includes(model.specs.seats);

      // Range filter
      const matchesRange =
        model.specs.range >= rangeFilter[0] &&
        model.specs.range <= rangeFilter[1];

      // Type filter
      const matchesType =
        typeFilter.length === 0 || typeFilter.includes(model.type);

      return (
        matchesSearch &&
        matchesPrice &&
        matchesSeats &&
        matchesRange &&
        matchesType
      );
    });

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
    // Navigate to dedicated model station finder page
    navigate(`/model/${modelId}/stations`);
  };

  // Comparison handlers
  const toggleComparison = (modelId: string) => {
    if (selectedForComparison.includes(modelId)) {
      setSelectedForComparison(
        selectedForComparison.filter((id) => id !== modelId)
      );
    } else if (selectedForComparison.length < 3) {
      setSelectedForComparison([...selectedForComparison, modelId]);
    } else {
      toast({
        title: "Maximum Comparison Reached",
        description: "You can compare up to 3 models at a time",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setPriceRange([0, 200]);
    setSeatsFilter([]);
    setRangeFilter([0, 500]);
    setTypeFilter([]);
  };

  const activeFiltersCount =
    (priceRange[0] !== 0 || priceRange[1] !== 200 ? 1 : 0) +
    seatsFilter.length +
    (rangeFilter[0] !== 0 || rangeFilter[1] !== 500 ? 1 : 0) +
    typeFilter.length;

  // Get unique types and seat options
  const vehicleTypes = Array.from(
    new Set(availabilityData.map((d) => d.model.type))
  );
  const seatOptions = Array.from(
    new Set(availabilityData.map((d) => d.model.specs.seats))
  ).sort((a, b) => a - b);

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
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant={comparisonMode ? "default" : "outline"}
                onClick={() => {
                  setComparisonMode(!comparisonMode);
                  if (comparisonMode) setSelectedForComparison([]);
                }}
                className="gap-2"
              >
                <GitCompare className="h-4 w-4" />
                {comparisonMode ? "Exit Compare" : "Compare Models"}
                {comparisonMode && selectedForComparison.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedForComparison.length}
                  </Badge>
                )}
              </Button>

              {comparisonMode && selectedForComparison.length >= 2 && (
                <Button
                  onClick={() => setShowComparisonDialog(true)}
                  className="gap-2"
                >
                  View Comparison
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold">{filteredModels.length}</span> of{" "}
              <span className="font-semibold">{availabilityData.length}</span>{" "}
              models
            </div>
          </div>

          <div className="space-y-6">
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

            {/* Advanced Filters */}
            {showFilters && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Advanced Filters
                    </span>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Reset All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Accordion type="multiple" className="w-full">
                    {/* Price Range */}
                    <AccordionItem value="price">
                      <AccordionTrigger>
                        <span className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Hourly Rate: ${priceRange[0]} - ${priceRange[1]}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <Slider
                          min={0}
                          max={200}
                          step={10}
                          value={priceRange}
                          onValueChange={(value) =>
                            setPriceRange(value as [number, number])
                          }
                          className="mb-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>$0/hour</span>
                          <span>$200/hour</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Vehicle Type */}
                    <AccordionItem value="type">
                      <AccordionTrigger>
                        <span className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Vehicle Type{" "}
                          {typeFilter.length > 0 && `(${typeFilter.length})`}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-3">
                          {vehicleTypes.map((type) => (
                            <div
                              key={type}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`type-${type}`}
                                checked={typeFilter.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setTypeFilter([...typeFilter, type]);
                                  } else {
                                    setTypeFilter(
                                      typeFilter.filter((t) => t !== type)
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`type-${type}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {type}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Seats */}
                    <AccordionItem value="seats">
                      <AccordionTrigger>
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Seats{" "}
                          {seatsFilter.length > 0 && `(${seatsFilter.length})`}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-3">
                          {seatOptions.map((seats) => (
                            <div
                              key={seats}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`seats-${seats}`}
                                checked={seatsFilter.includes(seats)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSeatsFilter([...seatsFilter, seats]);
                                  } else {
                                    setSeatsFilter(
                                      seatsFilter.filter((s) => s !== seats)
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`seats-${seats}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {seats} Seats
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Range */}
                    <AccordionItem value="range">
                      <AccordionTrigger>
                        <span className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Battery Range: {rangeFilter[0]} - {rangeFilter[1]} km
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <Slider
                          min={0}
                          max={500}
                          step={50}
                          value={rangeFilter}
                          onValueChange={(value) =>
                            setRangeFilter(value as [number, number])
                          }
                          className="mb-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0 km</span>
                          <span>500 km</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
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
                    <Card
                      className={`card-premium h-full flex flex-col transition-all ${
                        comparisonMode &&
                        selectedForComparison.includes(model.modelId)
                          ? "ring-2 ring-primary shadow-xl"
                          : ""
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={model.image}
                          alt={model.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />

                        {/* Comparison Checkbox */}
                        {comparisonMode && (
                          <div className="absolute top-3 left-3">
                            <Checkbox
                              checked={selectedForComparison.includes(
                                model.modelId
                              )}
                              onCheckedChange={() =>
                                toggleComparison(model.modelId)
                              }
                              className="h-6 w-6 bg-white border-2"
                            />
                          </div>
                        )}

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
                              !availability || availability.totalVehicles === 0
                            }
                            variant={totalAvailable > 0 ? "default" : "outline"}
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

            {/* Quick Stats and Tips Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
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
                  <p>💡 Click "Find Stations" to see detailed locations</p>
                  <p>🔍 Use filters to narrow down your search</p>
                  <p>⚡ Compare up to 3 models side-by-side</p>
                  <p>📍 Set your location on the model page for distances</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Comparison Dialog */}
        <Dialog
          open={showComparisonDialog}
          onOpenChange={setShowComparisonDialog}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <GitCompare className="h-6 w-6" />
                Compare Vehicle Models
              </DialogTitle>
              <DialogDescription>
                Side-by-side comparison of {selectedForComparison.length}{" "}
                selected models
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {selectedForComparison.map((modelId) => {
                const modelData = availabilityData.find(
                  (d) => d.model.modelId === modelId
                );
                if (!modelData) return null;
                const model = modelData.model;

                return (
                  <Card key={modelId} className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={() => toggleComparison(modelId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <CardContent className="p-4 space-y-4">
                      {/* Image */}
                      <div className="relative">
                        <img
                          src={model.image}
                          alt={model.name}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <Badge className="absolute top-2 left-2 bg-primary">
                          {modelData.totalAvailable} Available
                        </Badge>
                      </div>

                      {/* Name and Brand */}
                      <div>
                        <h3 className="font-semibold text-lg">{model.name}</h3>
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
                          <span className="font-medium">
                            {model.specs.seats}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Maximize2 className="h-4 w-4" />
                            Type:
                          </span>
                          <span className="font-medium">{model.type}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Stations:
                          </span>
                          <span className="font-medium">
                            {modelData.stations.length}
                          </span>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              Hourly:
                            </span>
                            <span className="font-semibold text-lg">
                              ${model.basePrice.perHour}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              Daily:
                            </span>
                            <span className="font-semibold text-lg">
                              ${model.basePrice.perDay}
                            </span>
                          </div>
                        </div>

                        <Separator />

                        {/* Fleet Status */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Fleet Status
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              {modelData.totalAvailable} Available
                            </Badge>
                            {modelData.totalRented > 0 && (
                              <Badge
                                variant="outline"
                                className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
                              >
                                {modelData.totalRented} Rented
                              </Badge>
                            )}
                            {modelData.totalMaintenance > 0 && (
                              <Badge
                                variant="outline"
                                className="bg-red-50 text-red-700 border-red-200 text-xs"
                              >
                                {modelData.totalMaintenance} Maintenance
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-4"
                        onClick={() => {
                          handleModelSelect(modelId);
                          setShowComparisonDialog(false);
                        }}
                      >
                        View Stations
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default VehicleModelFinder;
