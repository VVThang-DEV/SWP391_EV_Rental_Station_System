import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import VehicleCard from "@/components/VehicleCard";
import { VehicleCardSkeleton } from "@/components/ui/skeleton";
import {
  LoadingWrapper,
  PageTransition,
  FadeIn,
  SlideIn,
  SearchLoader,
  FilterLoader,
} from "@/components/LoadingComponents";
import {
  EnhancedSearch,
  ActiveFilters,
  type SearchSuggestion,
} from "@/components/EnhancedSearch";
import { getVehicles } from "@/data/vehicles";
import { stations } from "@/data/stations";
import { useVehicles, useStations, useVehicleModels } from "@/hooks/useApi";
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  MapPin,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

const Vehicles = () => {
  const { t, language } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // API hooks
  const { data: apiVehicles, loading: vehiclesLoading, error: vehiclesError, refetch: refetchVehicles } = useVehicles();
  const { data: apiStations, loading: stationsLoading, error: stationsError, refetch: refetchStations } = useStations();
  const { data: apiVehicleModels, loading: modelsLoading, error: modelsError, refetch: refetchModels } = useVehicleModels();

  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [locationFilter, setLocationFilter] = useState("all");
  const [stationFilter, setStationFilter] = useState(
    searchParams.get("station") || "all"
  );
  const [availabilityFilter, setAvailabilityFilter] = useState(
    searchParams.get("availability") || "all"
  );
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");
  const [pendingIssueVehicles, setPendingIssueVehicles] = useState<Record<number, string>>({});

  // Refresh vehicles when component mounts or URL changes
  useEffect(() => {
    refetchVehicles();
  }, [searchParams, refetchVehicles]);

  // Listen for vehicle updates from staff dashboard
  useEffect(() => {
    const loadPendingIssues = () => {
      try {
        const raw = localStorage.getItem("pendingIssueVehicles");
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, string>;
          const map: Record<number, string> = {};
          Object.entries(parsed).forEach(([key, value]) => {
            const id = Number(key);
            if (!Number.isNaN(id) && value) {
              map[id] = value;
            }
          });
          setPendingIssueVehicles(map);
        } else {
          setPendingIssueVehicles({});
        }
      } catch {
        setPendingIssueVehicles({});
      }
    };

    const handleStorageChange = (event?: StorageEvent) => {
      if (!event || event.key === "pendingIssueVehicles") {
        loadPendingIssues();
      }
      if (!event || event.key === "vehiclesUpdated") {
        const vehiclesUpdated = localStorage.getItem("vehiclesUpdated");
        if (vehiclesUpdated === "true") {
          refetchVehicles();
          loadPendingIssues();
          localStorage.setItem("vehiclesUpdated", "false");
        }
      }
    };

    // Initial load
    handleStorageChange();

    // Listen for storage events (when staff assigns vehicles)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refetchVehicles]);

  // Handle URL parameters on component mount
  useEffect(() => {
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const vehicleType = searchParams.get("vehicleType");
    const availability = searchParams.get("availability");
    const priceRangeParam = searchParams.get("priceRange");
    const date = searchParams.get("date");
    const time = searchParams.get("time");

    // Handle search term - could come from "search" or "location" parameter
    if (search && search.trim() !== "") {
      setSearchTerm(search.trim());
    } else if (location && location.trim() !== "" && location !== "all") {
      // If no search param but location is set and not "all", use location as search term
      setSearchTerm(location.trim());
    }

    // Handle location filter from URL parameter
    if (location && location.trim() !== "" && location !== "all") {
      setLocationFilter(location.trim());
    }

    if (vehicleType && vehicleType.trim() !== "") {
      setVehicleTypeFilter(vehicleType.trim());
    }

    if (availability && availability.trim() !== "") {
      setAvailabilityFilter(availability.trim());
    } else {
      setAvailabilityFilter("all");
    }

    const sortByParam = searchParams.get("sortBy");
    if (sortByParam) {
      setSortBy(sortByParam);
    }

    if (priceRangeParam) {
      // Handle price range from URL
      switch (priceRangeParam) {
        case "under50":
          setPriceRange([0, 200]);
          break;
        case "50-100":
          setPriceRange([50, 100]);
          break;
        case "over100":
          setPriceRange([100, 200]);
          break;
      }
    }

    // Store date and time for potential future use (booking, etc.)
    if (date && date.trim() !== "") {
      console.log("Selected date:", date.trim());
    }
    if (time && time.trim() !== "") {
      console.log("Selected time:", time.trim());
    }
  }, [searchParams]);

  // Data Mapper: Convert API data to UI format
  const mapApiToUI = (apiVehicle: any) => {
    const model = apiVehicleModels?.find(m => m.modelId === apiVehicle.modelId);
    const station = apiStations?.find(
      (s) => s.stationId === apiVehicle.stationId
    );
    
    const rawStatus = String(apiVehicle.status || '').toLowerCase();
    // Treat awaiting_processing as maintenance for customer-facing view
    const normalizedAvailability = rawStatus === 'awaiting_processing' ? 'maintenance' : rawStatus;

    return {
      id: apiVehicle.vehicleId?.toString(),
      vehicleId: apiVehicle.vehicleId, // Numeric id retained separately
      modelId: apiVehicle.modelId,
      uniqueVehicleId: apiVehicle.uniqueVehicleId,
      licensePlate: apiVehicle.licensePlate || '',
      name: model ? `${model.brand} ${model.modelName}` : `${apiVehicle.modelId} Vehicle`,
      year: model ? model.year : 2024,
      brand: model ? model.brand : 'VinFast',
      model: model ? model.modelName : apiVehicle.modelId,
      type: model ? model.type as any : 'Scooter',
      seats: model ? model.seats : 2,
      range: apiVehicle.maxRangeKm,
      batteryLevel: apiVehicle.batteryLevel,
      pricePerHour: apiVehicle.pricePerHour,
      pricePerDay: apiVehicle.pricePerDay,
      rating: apiVehicle.rating,
      reviewCount: apiVehicle.reviewCount,
      trips: apiVehicle.trips,
      mileage: apiVehicle.mileage,
      availability: normalizedAvailability as any,
      condition: apiVehicle.condition as any,
      // Use model image if vehicle doesn't have specific image
      image: apiVehicle.image || (model ? model.image : ''),
      // Always prefer station name to avoid stale free-text location from DB
      location: (station ? station.name : undefined) || apiVehicle.location || station?.city || 'Unknown Location',
      stationId: apiVehicle.stationId?.toString() || '1',
      stationName: station ? station.name : 'Unknown Station',
      stationAddress: station ? station.address : '',
      features: model ? model.featuresList : [],
      description: model ? model.description : '',
      fuelEfficiency: apiVehicle.fuelEfficiency,
      lastMaintenance: apiVehicle.lastMaintenance,
      inspectionDate: apiVehicle.inspectionDate,
      insuranceExpiry: apiVehicle.insuranceExpiry,
      createdAt: apiVehicle.createdAt,
      updatedAt: apiVehicle.updatedAt
    };
  };

  // Handle loading states
  useEffect(() => {
    if (!vehiclesLoading && !stationsLoading && !modelsLoading) {
      setIsInitialLoading(false);
    }
  }, [vehiclesLoading, stationsLoading, modelsLoading]);

  // Show loading if API is being called
  const isActuallyLoading = vehiclesLoading || stationsLoading || modelsLoading;

  // Use API data with fallback to static data
  const staticVehicles = getVehicles(language);
  const vehicles = (apiVehicles ? apiVehicles.map(mapApiToUI) : staticVehicles).map(
    (vehicle: any, index: number) => {
      const numericId =
        typeof vehicle.vehicleId === "number"
          ? vehicle.vehicleId
          : Number(vehicle.vehicleId || vehicle.id || index);
      return {
        ...vehicle,
        vehicleId: Number.isNaN(numericId) ? index : numericId,
        stationName:
          vehicle.stationName ||
          vehicle.station ||
          vehicle.location ||
          "",
      };
    }
  );
  
  // Debug logging - Enhanced to show actual vehicle data
  console.log('=== VEHICLES DEBUG ===');
  console.log('API Vehicles:', apiVehicles?.length);
  console.log('Mapped Vehicles:', vehicles.length);
  console.log('Search Term:', searchTerm);
  console.log('Location Filter:', locationFilter);
  console.log('Price Range:', priceRange);
  
  // Show all vehicles with their details
  if (vehicles.length > 0) {
    console.log('All Vehicles Details:', vehicles.map(v => ({
      id: v.id,
      modelId: v.modelId,
      name: v.name,
      location: v.location,
      stationId: v.stationId,
      stationName: v.stationName,
      availability: v.availability,
      pricePerHour: v.pricePerHour
    })));
  }
  
  // Check for VF5 vehicles (case-insensitive)
  const vf5Vehicles = vehicles.filter(v => v.modelId && v.modelId.toUpperCase() === 'VF5');
  console.log('VF5 Vehicles found:', vf5Vehicles.length);
  if (vf5Vehicles.length > 0) {
    console.log('VF5 Vehicles details:', vf5Vehicles.map(v => ({
      id: v.id,
      modelId: v.modelId,
      location: v.location,
      stationId: v.stationId,
      stationName: v.stationName
    })));
  }
  
  // Check District 1 vehicles (case-insensitive, partial match)
  const district1Vehicles = vehicles.filter(v => 
    v.location && (v.location.toLowerCase().includes('district 1') || v.location.toLowerCase().includes('district1'))
  );
  console.log('District 1 Vehicles found:', district1Vehicles.length);
  if (district1Vehicles.length > 0) {
    console.log('District 1 Vehicles details:', district1Vehicles.map(v => ({
      id: v.id,
      modelId: v.modelId,
      location: v.location,
      stationName: v.stationName
    })));
  }
  
  // Check specific VF5 at District 1
  const vf5District1 = vehicles.filter(v => 
    v.modelId && v.modelId.toUpperCase() === 'VF5' && 
    v.location && (v.location.toLowerCase().includes('district 1') || v.location.toLowerCase().includes('district1'))
  );
  console.log('VF5 at District 1:', vf5District1.length);
  if (vf5District1.length > 0) {
    console.log('VF5 District 1 details:', vf5District1[0]);
  }
  
  console.log('=== END DEBUG ===');

  // Update URL parameters when filters change
  const updateSearchParams = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }
    setSearchParams(newSearchParams);
  };

  // Handle search input with loading simulation
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsSearching(true);

    // Simulate search delay
    setTimeout(() => {
      updateSearchParams("search", value);
      setIsSearching(false);
    }, 300);
  };

  // Handle filter changes with loading simulation
  const handleFilterChange = (key: string, value: string) => {
    setIsFiltering(true);

    // Update local state immediately
    switch (key) {
      case "location":
        setLocationFilter(value);
        break;
      case "station":
        setStationFilter(value);
        break;
      case "availability":
        setAvailabilityFilter(value);
        break;
      case "vehicleType":
        setVehicleTypeFilter(value);
        break;
      case "sortBy":
        setSortBy(value);
        break;
    }

    // Simulate filter delay
    setTimeout(() => {
      updateSearchParams(key, value);
      setIsFiltering(false);
    }, 200);
  };

  // Get unique locations for filter
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(vehicles.map((v) => v.location))];
    // Filter out empty strings and null/undefined values
    return uniqueLocations.filter(location => location && location.trim() !== '');
  }, [vehicles]);

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    const filtered = vehicles.filter((vehicle) => {
      const vehicleIdNumber =
        typeof vehicle.vehicleId === "number"
          ? vehicle.vehicleId
          : Number(vehicle.vehicleId);
      if (
        !Number.isNaN(vehicleIdNumber) &&
        pendingIssueVehicles[vehicleIdNumber]
      ) {
        return false;
      }

      // ✅ Filter out vehicles that should never be shown to customers
      const avail = String(vehicle.availability || '').toLowerCase();
      if (avail === 'pending' || avail === 'awaiting_processing') {
        return false;
      }

      // Comprehensive search across multiple fields
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (vehicle.name && vehicle.name.toLowerCase().includes(searchLower)) ||
        (vehicle.brand && vehicle.brand.toLowerCase().includes(searchLower)) ||
        (vehicle.model && vehicle.model.toLowerCase().includes(searchLower)) ||
        (vehicle.modelId && vehicle.modelId.toLowerCase().includes(searchLower)) ||
        (vehicle.uniqueVehicleId && vehicle.uniqueVehicleId.toLowerCase().includes(searchLower)) ||
        (vehicle.location && vehicle.location.toLowerCase().includes(searchLower)) ||
        (vehicle.type && vehicle.type.toLowerCase().includes(searchLower));

      const matchesLocation =
        locationFilter === "all" || 
        (vehicle.location && vehicle.location.toLowerCase().includes(locationFilter.toLowerCase())) ||
        (vehicle.stationName && vehicle.stationName.toLowerCase().includes(locationFilter.toLowerCase()));

      const matchesStation =
        stationFilter === "all" || vehicle.stationId === stationFilter;

      const matchesAvailability =
        availabilityFilter === "all" ||
        vehicle.availability === availabilityFilter;

      // Handle price filtering for both USD and VND
      const vehiclePrice =
        language === "vi" ? vehicle.pricePerHour : vehicle.pricePerHour / 23000; // Convert VND to USD when language is EN
      const matchesPrice =
        vehiclePrice >= priceRange[0] && vehiclePrice <= priceRange[1];

      const matchesVehicleType =
        vehicleTypeFilter === "all" || vehicle.type === vehicleTypeFilter;

      // Debug specific vehicle
      if (vehicle.modelId === 'VF5' && vehicle.location && vehicle.location.includes('District 1')) {
        console.log('🔍 VF5 District 1 Filter Debug:', {
          vehicle: vehicle.modelId,
          location: vehicle.location,
          searchTerm,
          locationFilter,
          priceRange,
          vehiclePrice,
          vehiclePricePerHour: vehicle.pricePerHour,
          language,
          '✅ matchesSearch': matchesSearch,
          '✅ matchesLocation': matchesLocation,
          '✅ matchesStation': matchesStation,
          '✅ matchesAvailability': matchesAvailability,
          '✅ matchesPrice': matchesPrice,
          '✅ matchesVehicleType': matchesVehicleType,
          '❌ finalResult': matchesSearch && matchesLocation && matchesStation && matchesAvailability && matchesPrice && matchesVehicleType
        });
      }

      return (
        matchesSearch &&
        matchesLocation &&
        matchesStation &&
        matchesAvailability &&
        matchesPrice &&
        matchesVehicleType
      );
    });

    // Sort vehicles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.pricePerHour - b.pricePerHour;
        case "price-high":
          return b.pricePerHour - a.pricePerHour;
        case "rating":
          return b.rating - a.rating;
        case "range":
          return b.range - a.range;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [
    searchTerm,
    locationFilter,
    stationFilter,
    availabilityFilter,
    priceRange,
    sortBy,
    vehicleTypeFilter,
    vehicles,
    pendingIssueVehicles,
    language,
  ]);

  // Remove simulated loading - now using real API loading

  // Add polling for real-time updates (disabled for now to prevent UI jumping)
  // useEffect(() => {
  //   if (!apiVehicles) return; // Only poll if we're using API data
  //   
  //   const interval = setInterval(() => {
  //     // Refetch data every 30 seconds to get latest vehicle status
  //     console.log('Polling for vehicle updates...');
  //     refetchVehicles();
  //     refetchStations();
  //     refetchModels();
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  // }, [apiVehicles, refetchVehicles, refetchStations, refetchModels]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <FadeIn>
          <div className="bg-gradient-hero py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <SlideIn direction="top" delay={100}>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {t("common.vehiclesHeaderTitle")}
                </h1>
              </SlideIn>
              <SlideIn direction="top" delay={200}>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  {t("common.vehiclesHeaderSubtitle")}
                </p>
              </SlideIn>
            </div>
          </div>
        </FadeIn>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Enhanced Search */}
              <div className="flex-1">
                <EnhancedSearch
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onSuggestionSelect={(suggestion: SearchSuggestion) => {
                    // Handle different suggestion types
                    if (suggestion.type === "location") {
                      setLocationFilter(suggestion.value);
                    }
                  }}
                  placeholder={t("common.searchPlaceholder")}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  💡 <strong>Tip:</strong> Search for specific models (e.g.,
                  "Tesla Model 3", "VinFast VF8") to see all available vehicles
                  across stations, or use the{" "}
                  <strong>"Find Model at Stations"</strong> button for detailed
                  availability mapping.
                </p>
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2">
                <Select
                  value={locationFilter}
                  onValueChange={(value) => {
                    setLocationFilter(value);
                    updateSearchParams("location", value);
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t("common.allLocations")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("common.allLocations")}
                    </SelectItem>
                    {locations.map((location) => {
                      const locationValue = String(location).trim();
                      return locationValue ? (
                        <SelectItem
                          key={locationValue}
                          value={locationValue}
                        >
                          {locationValue}
                        </SelectItem>
                      ) : null;
                    })}
                  </SelectContent>
                </Select>

                <Select
                  value={availabilityFilter}
                  onValueChange={(value) => {
                    setAvailabilityFilter(value);
                    updateSearchParams("availability", value);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t("common.availability")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.allStatus")}</SelectItem>
                    <SelectItem value="available">
                      {t("common.available")}
                    </SelectItem>
                    <SelectItem value="rented">{t("common.rented")}</SelectItem>
                    <SelectItem value="maintenance">
                      {t("common.maintenance")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {t("common.filter")}
                </Button>

                <Button
                  asChild
                  variant="default"
                  className="px-4 bg-primary hover:bg-primary/90"
                >
                  <Link to="/vehicle-model-finder">
                    <MapPin className="h-4 w-4 mr-2" />
                    Find Model at Stations
                  </Link>
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            <ActiveFilters
              filters={[
                ...(searchTerm
                  ? [
                      {
                        key: "search",
                        label: `Search: ${searchTerm}`,
                        onRemove: () => handleSearchChange(""),
                      },
                    ]
                  : []),
                ...(locationFilter !== "all"
                  ? [
                      {
                        key: "location",
                        label: `Location: ${locationFilter}`,
                        onRemove: () => handleFilterChange("location", "all"),
                      },
                    ]
                  : []),
                ...(stationFilter !== "all"
                  ? [
                      {
                        key: "station",
                        label: `Station: ${
                          stations.find((s) => s.id === stationFilter)?.name ||
                          stationFilter
                        }`,
                        onRemove: () => handleFilterChange("station", "all"),
                      },
                    ]
                  : []),
                ...(availabilityFilter !== "all"
                  ? [
                      {
                        key: "availability",
                        label: `Status: ${availabilityFilter}`,
                        onRemove: () =>
                          handleFilterChange("availability", "all"),
                      },
                    ]
                  : []),
                ...(vehicleTypeFilter !== "all"
                  ? [
                      {
                        key: "vehicleType",
                        label: `Type: ${vehicleTypeFilter}`,
                        onRemove: () =>
                          handleFilterChange("vehicleType", "all"),
                      },
                    ]
                  : []),
                ...(sortBy !== "name"
                  ? [
                      {
                        key: "sortBy",
                        label: `Sort: ${sortBy}`,
                        onRemove: () => handleFilterChange("sortBy", "name"),
                      },
                    ]
                  : []),
              ]}
              onClearAll={() => {
                handleSearchChange("");
                handleFilterChange("location", "all");
                handleFilterChange("station", "all");
                handleFilterChange("availability", "all");
                handleFilterChange("vehicleType", "all");
                handleFilterChange("sortBy", "name");
              }}
            />

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      {t("common.priceRangeLabel")}:{" "}
                      {language === "vi" ? "₫" : "$"}
                      {priceRange[0]}
                      {language === "vi" ? "k" : ""} -{" "}
                      {language === "vi" ? "₫" : "$"}
                      {priceRange[1]}
                      {language === "vi" ? "k" : ""}/hour
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={language === "vi" ? 1000 : 200}
                      min={0}
                      step={language === "vi" ? 10 : 5}
                      className="w-full"
                    />
                  </div>

                  {/* Vehicle Type Filter */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      {t("common.vehicleType")}
                    </label>
                    <Select
                      value={vehicleTypeFilter}
                      onValueChange={(value) => {
                        setVehicleTypeFilter(value);
                        updateSearchParams("vehicleType", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("common.allTypes")}
                        </SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="Sedan">Sedan</SelectItem>
                        <SelectItem value="Hatchback">Hatchback</SelectItem>
                        <SelectItem value="Crossover">Crossover</SelectItem>
                        <SelectItem value="Scooter">Scooter</SelectItem>
                        <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="Bike">Bike</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Bus">Bus</SelectItem>
                        <SelectItem value="Truck">Truck</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Station Filter */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Station
                    </label>
                    <Select
                      value={stationFilter}
                      onValueChange={(value) => {
                        setStationFilter(value);
                        updateSearchParams("station", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select station" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stations</SelectItem>
                        {stations.map((station) => (
                          <SelectItem key={station.id} value={station.id}>
                            {station.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      {t("common.sortBy")}
                    </label>
                    <Select
                      value={sortBy}
                      onValueChange={(value) => {
                        setSortBy(value);
                        updateSearchParams("sortBy", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">
                          {t("common.nameAsc")}
                        </SelectItem>
                        <SelectItem value="price-low">
                          {t("common.priceLowToHigh")}
                        </SelectItem>
                        <SelectItem value="price-high">
                          {t("common.priceHighToLow")}
                        </SelectItem>
                        <SelectItem value="rating">
                          {t("common.highestRated")}
                        </SelectItem>
                        <SelectItem value="range">
                          {t("common.longestRange")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* View Mode */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      {t("common.viewMode")}
                    </label>
                    <div className="flex rounded-lg border border-border overflow-hidden">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        onClick={() => setViewMode("grid")}
                        className="rounded-none flex-1"
                        size="sm"
                      >
                        <Grid className="h-4 w-4 mr-2" />
                        {t("common.grid")}
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        onClick={() => setViewMode("list")}
                        className="rounded-none flex-1"
                        size="sm"
                      >
                        <List className="h-4 w-4 mr-2" />
                        {t("common.list")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold">
                {t("common.availableVehicles")}
              </h2>
              <p className="text-muted-foreground">
                {filteredVehicles.length} {t("common.vehiclesFound")}
              </p>
            </div>
          </div>

          {/* Vehicle Grid/List */}
          <LoadingWrapper
            isLoading={isActuallyLoading}
            fallback={
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <VehicleCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            {/* Search Loading Indicator */}
            {isSearching && <SearchLoader />}

            {/* Filter Loading Indicator */}
            {isFiltering && <FilterLoader />}

            {filteredVehicles.length > 0 ? (
              <SlideIn direction="bottom" delay={300}>
                <div
                  className={`grid gap-8 ${
                    viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredVehicles.map((vehicle, index) => (
                    <FadeIn key={`${vehicle.vehicleId || vehicle.id}-${index}`} delay={index * 100}>
                      <VehicleCard
                        vehicle={vehicle}
                        className={viewMode === "list" ? "flex-row" : ""}
                      />
                    </FadeIn>
                  ))}
                </div>
              </SlideIn>
            ) : (
              <FadeIn delay={400}>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚗</div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t("common.noVehiclesFound")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setLocationFilter("all");
                      setStationFilter("all");
                      setAvailabilityFilter("all");
                      setPriceRange([0, 200]);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </FadeIn>
            )}
          </LoadingWrapper>
        </div>
      </div>
    </PageTransition>
  );
};

export default Vehicles;
