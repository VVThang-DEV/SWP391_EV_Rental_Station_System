import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MapPin,
  Clock,
  Zap,
  Phone,
  Search,
  Filter,
  Star,
  Wifi,
  Coffee,
  Car,
  ShoppingBag,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { stations, Station } from "@/data/stations";
import { getVehicles } from "@/data/vehicles";
import { useStations, useVehicles } from "@/hooks/useApi";
import {
  PageTransition,
  FadeIn,
  SlideIn,
} from "@/components/LoadingComponents";
import { useToast } from "@/hooks/use-toast";

const Stations = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const location = useLocation();

  // API hooks
  const { data: apiStations, loading: stationsLoading, error: stationsError } = useStations();
  const { data: apiVehicles, loading: vehiclesLoading } = useVehicles();

  // Get vehicles data - use API with fallback
  const staticVehicles = getVehicles("en");
  const allVehicles = apiVehicles ? apiVehicles.map(vehicle => ({
    // Map API vehicle to expected format
    id: vehicle.uniqueVehicleId,
    modelId: vehicle.modelId,
    uniqueVehicleId: vehicle.uniqueVehicleId,
    name: `${vehicle.modelId} Vehicle`,
    brand: "VinFast",
    model: vehicle.modelId,
    type: "Scooter",
    year: 2024,
    seats: 2,
    range: vehicle.maxRangeKm,
    batteryLevel: vehicle.batteryLevel,
    pricePerHour: vehicle.pricePerHour,
    pricePerDay: vehicle.pricePerDay,
    rating: vehicle.rating,
    reviewCount: vehicle.reviewCount,
    trips: vehicle.trips,
    mileage: vehicle.mileage,
    availability: vehicle.status,
    condition: vehicle.condition,
    image: vehicle.image || "",
    location: vehicle.location,
    stationId: vehicle.stationId.toString(),
    stationName: "Unknown Station",
    stationAddress: "",
    features: [],
    description: "",
    fuelEfficiency: vehicle.fuelEfficiency,
    lastMaintenance: vehicle.lastMaintenance,
    inspectionDate: vehicle.inspectionDate,
    insuranceExpiry: vehicle.insuranceExpiry,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt
  })) : staticVehicles;


  // Function to get available vehicle models at a station
  const getStationModels = (stationId: string) => {
    const stationVehicles = allVehicles.filter(
      (vehicle) =>
        vehicle.stationId === stationId && vehicle.availability === "available"
    );

    const modelGroups = stationVehicles.reduce((groups, vehicle) => {
      const modelKey = `${vehicle.brand} ${vehicle.model}`;
      if (!groups[modelKey]) {
        groups[modelKey] = {
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type,
          count: 0,
        };
      }
      groups[modelKey].count += 1;
      return groups;
    }, {} as Record<string, { brand: string; model: string; type: string; count: number }>);

    return Object.values(modelGroups);
  };

  // Check if user came from personal info update
  const fromPersonalInfo = location.state?.fromPersonalInfo || false;
  const welcomeMessage = location.state?.message || "";

  // Use API stations with fallback to static data
  const staticStations = stations;
  const apiStationsMapped = apiStations ? apiStations.map(station => ({
    // Map API station to expected format
    id: station.stationId.toString(),
    name: station.name,
    address: station.address,
    city: station.city,
    coordinates: {
      lat: station.latitude,
      lng: station.longitude
    },
    status: station.status,
    availableVehicles: station.availableVehicles,
    totalSlots: station.totalSlots,
    amenities: typeof station.amenities === 'string' ? JSON.parse(station.amenities) : station.amenities,
    rating: station.rating,
    operatingHours: station.operatingHours,
    fastCharging: station.fastCharging,
    image: station.image,
    createdAt: station.createdAt,
    updatedAt: station.updatedAt
  })) : staticStations;

  const [filteredStations, setFilteredStations] = useState<Station[]>(apiStationsMapped);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "rating" | "availability" | "distance"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter states
  const [filters, setFilters] = useState({
    fastCharging: false,
    available24h: false,
    minAvailableVehicles: 0,
    minRating: 0,
    selectedAmenities: [] as string[],
    maxDistance: 50, // km
  });

  const [showFilters, setShowFilters] = useState(false);


  // All available amenities
  const allAmenities = [
    "Fast Charging",
    "Cafe",
    "Restaurant",
    "Restroom",
    "Parking",
    "Shopping Mall",
    "ATM",
    "WiFi",
    "Airport Shuttle",
    "24/7 Service",
    "Lounge",
    "Convenience Store",
    "Food Court",
    "Pharmacy",
    "Gas Station",
    "Supermarket",
    "Bank",
    "Car Wash",
    "Hotel",
    "Spa",
    "Shopping",
    "Fine Dining",
  ];

  // Show welcome message if coming from personal info
  useEffect(() => {
    if (fromPersonalInfo && welcomeMessage) {
      toast({
        title: "Welcome!",
        description: welcomeMessage,
        duration: 5000,
      });
    }
  }, [fromPersonalInfo, welcomeMessage, toast]);

  // Apply filters and sorting
  useEffect(() => {
    const filtered = apiStationsMapped.filter((station) => {
      // Search term filter
      if (
        searchTerm &&
        !station.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !station.address.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !station.city.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Fast charging filter
      if (filters.fastCharging && !station.fastCharging) {
        return false;
      }

      // 24/7 availability filter
      if (filters.available24h && station.operatingHours !== "24/7") {
        return false;
      }

      // Minimum available vehicles filter
      if (station.availableVehicles < filters.minAvailableVehicles) {
        return false;
      }

      // Minimum rating filter
      if (station.rating < filters.minRating) {
        return false;
      }

      // Amenities filter
      if (filters.selectedAmenities.length > 0) {
        const hasAllAmenities = filters.selectedAmenities.every((amenity) =>
          station.amenities.includes(amenity)
        );
        if (!hasAllAmenities) {
          return false;
        }
      }

      return true;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "availability":
          comparison = a.availableVehicles - b.availableVehicles;
          break;
        case "distance":
          // For demo purposes, using a simple calculation
          comparison =
            a.coordinates.lat +
            a.coordinates.lng -
            (b.coordinates.lat + b.coordinates.lng);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredStations(filtered);
  }, [searchTerm, filters, sortBy, sortOrder, apiStationsMapped]);

  const handleAmenityToggle = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenity)
        ? prev.selectedAmenities.filter((a) => a !== amenity)
        : [...prev.selectedAmenities, amenity],
    }));
  };

  const clearFilters = () => {
    setFilters({
      fastCharging: false,
      available24h: false,
      minAvailableVehicles: 0,
      minRating: 0,
      selectedAmenities: [],
      maxDistance: 50,
    });
    setSearchTerm("");
    setSortBy("name");
    setSortOrder("asc");
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "fast charging":
        return <Zap className="h-4 w-4" />;
      case "cafe":
      case "restaurant":
      case "food court":
      case "fine dining":
        return <Coffee className="h-4 w-4" />;
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      case "parking":
      case "car wash":
        return <Car className="h-4 w-4" />;
      case "shopping mall":
      case "shopping":
      case "supermarket":
      case "convenience store":
        return <ShoppingBag className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const activeFiltersCount =
    (filters.fastCharging ? 1 : 0) +
    (filters.available24h ? 1 : 0) +
    (filters.minAvailableVehicles > 0 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    filters.selectedAmenities.length;

  // Show loading while fetching API data
  const isLoading = stationsLoading || vehiclesLoading;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Loading Overlay - Disabled to fix navigation */}
        {/* {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading stations...</p>
            </div>
          </div>
        )} */}
        {/* Header */}
        <FadeIn>
          <div className="bg-gradient-hero py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <SlideIn direction="top" delay={100}>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {fromPersonalInfo
                    ? "Choose Your Station"
                    : "Our Station Locations"}
                </h1>
              </SlideIn>
              <SlideIn direction="top" delay={200}>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  {fromPersonalInfo
                    ? "Select a station to browse available vehicles for rent"
                    : "Find convenient pickup and drop-off locations throughout the city"}
                </p>
              </SlideIn>

              {/* Search and Filter Bar */}
              <SlideIn direction="top" delay={300}>
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Search */}
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        placeholder="Search stations by name, address, or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                      />
                    </div>

                    {/* Filter Button */}
                    <Popover open={showFilters} onOpenChange={setShowFilters}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Filters
                          {activeFiltersCount > 0 && (
                            <Badge className="ml-2 bg-primary text-primary-foreground">
                              {activeFiltersCount}
                            </Badge>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-6" align="end">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Filters</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearFilters}
                              className="h-auto p-1 text-muted-foreground hover:text-foreground"
                            >
                              Clear All
                            </Button>
                          </div>

                          {/* Quick Filters */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="fastCharging"
                                checked={filters.fastCharging}
                                onCheckedChange={(checked) =>
                                  setFilters((prev) => ({
                                    ...prev,
                                    fastCharging: checked as boolean,
                                  }))
                                }
                              />
                              <Label htmlFor="fastCharging">
                                Fast Charging Available
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="available24h"
                                checked={filters.available24h}
                                onCheckedChange={(checked) =>
                                  setFilters((prev) => ({
                                    ...prev,
                                    available24h: checked as boolean,
                                  }))
                                }
                              />
                              <Label htmlFor="available24h">
                                24/7 Operation
                              </Label>
                            </div>
                          </div>

                          {/* Min Available Vehicles */}
                          <div className="space-y-2">
                            <Label>Minimum Available Vehicles</Label>
                            <Select
                              value={filters.minAvailableVehicles.toString()}
                              onValueChange={(value) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  minAvailableVehicles: parseInt(value),
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Any</SelectItem>
                                <SelectItem value="1">1+</SelectItem>
                                <SelectItem value="3">3+</SelectItem>
                                <SelectItem value="5">5+</SelectItem>
                                <SelectItem value="10">10+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Min Rating */}
                          <div className="space-y-2">
                            <Label>Minimum Rating</Label>
                            <Select
                              value={filters.minRating.toString()}
                              onValueChange={(value) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  minRating: parseFloat(value),
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Any</SelectItem>
                                <SelectItem value="3">3+ ⭐</SelectItem>
                                <SelectItem value="4">4+ ⭐</SelectItem>
                                <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Amenities */}
                          <div className="space-y-2">
                            <Label>Required Amenities</Label>
                            <div className="max-h-32 overflow-y-auto space-y-2">
                              {allAmenities.map((amenity) => (
                                <div
                                  key={amenity}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={amenity}
                                    checked={filters.selectedAmenities.includes(
                                      amenity
                                    )}
                                    onCheckedChange={() =>
                                      handleAmenityToggle(amenity)
                                    }
                                  />
                                  <Label
                                    htmlFor={amenity}
                                    className="text-sm flex items-center gap-1"
                                  >
                                    {getAmenityIcon(amenity)}
                                    {amenity}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Sort */}
                    <Select
                      value={`${sortBy}-${sortOrder}`}
                      onValueChange={(value) => {
                        const [newSortBy, newSortOrder] = value.split("-");
                        setSortBy(newSortBy as typeof sortBy);
                        setSortOrder(newSortOrder as typeof sortOrder);
                      }}
                    >
                      <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                        <SelectItem value="rating-desc">
                          Rating (High-Low)
                        </SelectItem>
                        <SelectItem value="rating-asc">
                          Rating (Low-High)
                        </SelectItem>
                        <SelectItem value="availability-desc">
                          Vehicles (High-Low)
                        </SelectItem>
                        <SelectItem value="availability-asc">
                          Vehicles (Low-High)
                        </SelectItem>
                        <SelectItem value="distance-asc">
                          Distance (Near-Far)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Active Filters Display */}
                  {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {filters.fastCharging && (
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white"
                        >
                          Fast Charging
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                fastCharging: false,
                              }))
                            }
                          />
                        </Badge>
                      )}
                      {filters.available24h && (
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white"
                        >
                          24/7
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                available24h: false,
                              }))
                            }
                          />
                        </Badge>
                      )}
                      {filters.minAvailableVehicles > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white"
                        >
                          {filters.minAvailableVehicles}+ Vehicles
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                minAvailableVehicles: 0,
                              }))
                            }
                          />
                        </Badge>
                      )}
                      {filters.minRating > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white"
                        >
                          {filters.minRating}+ ⭐
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, minRating: 0 }))
                            }
                          />
                        </Badge>
                      )}
                      {filters.selectedAmenities.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant="secondary"
                          className="bg-white/20 text-white"
                        >
                          {amenity}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => handleAmenityToggle(amenity)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </SlideIn>
            </div>
          </div>
        </FadeIn>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              {filteredStations.length === stations.length
                ? `Showing all ${stations.length} stations`
                : `Showing ${filteredStations.length} of ${stations.length} stations`}
            </p>
          </div>

          <SlideIn direction="bottom" delay={200}>
            {filteredStations.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No stations found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {filteredStations.map((station, index) => (
                  <FadeIn key={station.id} delay={300 + index * 100}>
                    <Card className="card-premium h-full flex flex-col">
                      <div className="relative">
                        <img
                          src={station.image}
                          alt={station.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        {station.availableVehicles === 0 && (
                          <div className="absolute inset-0 bg-black/50 rounded-t-lg flex items-center justify-center">
                            <Badge
                              variant="destructive"
                              className="text-lg px-4 py-2"
                            >
                              No Vehicles Available
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-semibold">
                            {station.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                station.availableVehicles > 0
                                  ? "badge-available"
                                  : "badge-unavailable"
                              }
                            >
                              {station.availableVehicles > 0
                                ? t("common.active")
                                : "Full"}
                            </Badge>
                            {station.fastCharging && (
                              <Badge variant="secondary">
                                <Zap className="h-3 w-3 mr-1" />
                                Fast
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 mb-6 flex-1">
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">
                              {station.address}, {station.city}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <p className="text-sm">{station.operatingHours}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Phone className="h-5 w-5 text-primary" />
                            <p className="text-sm">+84 901 234 567</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <p className="text-sm">
                              <span className="font-medium">
                                {station.rating}
                              </span>
                              <span className="text-muted-foreground">
                                {" "}
                                ({Math.floor(station.rating * 20 + 30)} reviews)
                              </span>
                            </p>
                          </div>

                          {/* Available Vehicle Models */}
                          {getStationModels(station.id).length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Available Models:
                              </Label>
                              <div className="flex flex-wrap gap-1">
                                {getStationModels(station.id)
                                  .slice(0, 3)
                                  .map((model) => (
                                    <Badge
                                      key={`${model.brand}-${model.model}`}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {model.brand} {model.model} ({model.count}
                                      )
                                    </Badge>
                                  ))}
                                {getStationModels(station.id).length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    +{getStationModels(station.id).length - 3}{" "}
                                    more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Amenities */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Amenities:
                            </Label>
                            <div className="flex flex-wrap gap-1">
                              {station.amenities.slice(0, 4).map((amenity) => (
                                <Badge
                                  key={amenity}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {getAmenityIcon(amenity)}
                                  <span className="ml-1">{amenity}</span>
                                </Badge>
                              ))}
                              {station.amenities.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{station.amenities.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t mb-6">
                          <div className="text-center">
                            <div
                              className={`text-2xl font-bold ${
                                station.availableVehicles > 0
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {station.availableVehicles}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Available
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {station.totalSlots}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total Slots
                            </div>
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button
                            asChild
                            className="w-full"
                            disabled={station.availableVehicles === 0}
                          >
                            <Link to={`/stations/${station.id}`}>
                              {station.availableVehicles > 0
                                ? "View Vehicles"
                                : "View Details"}
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                ))}
              </div>
            )}
          </SlideIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default Stations;
