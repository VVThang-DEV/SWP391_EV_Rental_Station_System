import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import VehicleCard from "@/components/VehicleCard";
import { GoogleMaps } from "@/components/GoogleMaps";
import { getAvailableVehicles } from "@/data/vehicles";
import { stations } from "@/data/stations";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  PageTransition,
  FadeIn,
  SlideIn,
} from "@/components/LoadingComponents";
import {
  Search,
  MapPin,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  Star,
  Users,
  Battery,
  DollarSign,
  Calendar,
  Filter,
  SlidersHorizontal,
  Map,
  Grid3X3,
  List,
  Check,
} from "lucide-react";
import heroImage from "@/assets/home-bg.jpg";

interface IndexProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: "customer" | "staff" | "admin";
  } | null;
}

const Index = ({ user }: IndexProps) => {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [vehicleType, setVehicleType] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationHovered, setLocationHovered] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const availableVehicles = getAvailableVehicles();

  // Create location suggestions from stations
  const locationSuggestions = stations.map((station) => ({
    value: station.name,
    label: `${station.name}`,
    station: station,
  }));

  // Filter vehicles based on user selections
  const filteredVehicles = availableVehicles.filter((vehicle) => {
    if (priceRange !== "all") {
      const price = vehicle.pricePerHour;
      switch (priceRange) {
        case "under50":
          return price < 50;
        case "50-100":
          return price >= 50 && price <= 100;
        case "over100":
          return price > 100;
        default:
          break;
      }
    }
    if (vehicleType !== "all") {
      return vehicle.type.toLowerCase() === vehicleType.toLowerCase();
    }
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to vehicles page with search parameters
    const searchParams = new URLSearchParams();

    // Only set parameters if they have valid values
    if (searchLocation && searchLocation.trim() !== "") {
      searchParams.set("location", searchLocation.trim());
    }
    if (selectedDate && selectedDate.trim() !== "") {
      searchParams.set("date", selectedDate.trim());
    }
    if (selectedTime && selectedTime.trim() !== "") {
      searchParams.set("time", selectedTime.trim());
    }
    if (priceRange !== "all") {
      searchParams.set("priceRange", priceRange);
    }
    if (vehicleType !== "all") {
      searchParams.set("vehicleType", vehicleType);
    }

    // If no parameters were set, navigate to vehicles page without query string
    const queryString = searchParams.toString();
    const url = queryString ? `/vehicles?${queryString}` : "/vehicles";

    navigate(url);
  };

  // If user is logged in, show the main app interface (Mioto.vn style)
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Search Header - Mioto.vn Style */}
        <div className="bg-white shadow-sm border-b sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Location & Date Picker */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
                  <div className="relative">
                    <Popover
                      open={locationOpen || locationHovered}
                      onOpenChange={(open) => {
                        if (!open && !locationHovered) {
                          setLocationOpen(false);
                        } else if (open) {
                          setLocationOpen(true);
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <div
                          className="relative cursor-pointer"
                          onClick={() => setLocationOpen(!locationOpen)}
                        >
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                          <Input
                            placeholder={t("common.pickupLocation")}
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="pl-10 h-11 text-black"
                            onFocus={() => setLocationOpen(true)}
                            onClick={() => setLocationOpen(true)}
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[400px] p-0"
                        align="start"
                        onMouseEnter={() => setLocationHovered(true)}
                        onMouseLeave={() => setLocationHovered(false)}
                      >
                        <Command>
                          <CommandInput
                            placeholder={t("common.searchLocations")}
                            value={searchLocation}
                            onValueChange={setSearchLocation}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {t("common.noLocationsFound")}
                            </CommandEmpty>
                            <CommandGroup>
                              {locationSuggestions
                                .filter((location) =>
                                  location.label
                                    .toLowerCase()
                                    .includes(searchLocation.toLowerCase())
                                )
                                .map((location) => (
                                  <CommandItem
                                    key={location.value}
                                    value={location.value}
                                    onSelect={() => {
                                      setSearchLocation(location.label);
                                      setLocationOpen(false);
                                      setLocationHovered(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        searchLocation === location.label
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {location.station.name}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {location.station.address},{" "}
                                        {location.station.city}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="pl-10 h-11 text-black"
                    />
                  </div>

                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="pl-10 h-11 text-black"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-11 bg-green-600 hover:bg-green-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {t("common.searchButton")}
                  </Button>
                </div>
              </form>

              {/* View Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-11"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {t("common.filters")}
                </Button>

                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none h-11"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none h-11"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("map")}
                    className="rounded-l-none h-11"
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t("common.priceRangeLabel")}
                    </label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("common.allPrices")}
                        </SelectItem>
                        <SelectItem value="under50">
                          {t("common.under50Hour")}
                        </SelectItem>
                        <SelectItem value="50-100">
                          {t("common.price50100Hour")}
                        </SelectItem>
                        <SelectItem value="over100">
                          {t("common.over100Hour")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t("common.vehicleType")}
                    </label>
                    <Select value={vehicleType} onValueChange={setVehicleType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("common.allTypes")}
                        </SelectItem>
                        <SelectItem value="sedan">
                          {t("vehicleTypes.Sedan")}
                        </SelectItem>
                        <SelectItem value="suv">
                          {t("vehicleTypes.SUV")}
                        </SelectItem>
                        <SelectItem value="hatchback">
                          {t("vehicleTypes.Hatchback")}
                        </SelectItem>
                        <SelectItem value="crossover">
                          {t("vehicleTypes.Crossover")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Features
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-white"
                      >
                        Auto Pilot
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-white"
                      >
                        Fast Charging
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-white"
                      >
                        Premium Interior
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Station
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All Stations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="district1">
                          {t("common.district1Station")}
                        </SelectItem>
                        <SelectItem value="district3">
                          {t("common.district3Station")}
                        </SelectItem>
                        <SelectItem value="thuduc">
                          {t("common.district7Station")}
                        </SelectItem>
                        <SelectItem value="binhthanh">
                          Binh Thanh Station
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t("common.availableElectricVehicles")}
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredVehicles.length} {t("common.vehiclesFound")} • Ho Chi
                Minh City
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {t("common.sortBy")}
              </span>
              <Select defaultValue="recommended">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">
                    {t("common.recommended")}
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
                  <SelectItem value="distance">
                    {t("common.nearestFirst")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vehicle Grid/List/Map View */}
          {viewMode === "map" ? (
            <div className="mb-6">
              <GoogleMaps
                selectedStation={selectedStation}
                onStationSelect={setSelectedStation}
              />
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-4">
              {filteredVehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {vehicle.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {vehicle.seats} {t("common.seatsLabel")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Battery className="h-4 w-4" />
                                {vehicle.range}
                                {t("common.kmRangeLabel")}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {vehicle.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">
                                  {vehicle.rating}
                                </span>
                                <span className="text-gray-500">
                                  ({vehicle.trips} {t("common.tripsLabel")})
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              ${vehicle.pricePerHour}
                              <span className="text-sm font-normal text-gray-500">
                                {t("common.perHour")}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mb-3">
                              ${vehicle.pricePerDay}
                              {t("common.perDay")}
                            </div>
                            <Button
                              asChild
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Link to={`/book/${vehicle.id}`}>
                                {t("common.bookNow")}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default home page for non-logged-in users
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <FadeIn>
          <section className="relative bg-gradient-hero overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={heroImage}
                alt="Electric vehicles at charging station"
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-hero/80"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
              <div className="text-center text-white">
                <SlideIn direction="top" delay={100}>
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    {t("common.heroTitle")}
                  </h1>
                </SlideIn>
                <SlideIn direction="top" delay={200}>
                  <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
                    {t("common.heroSubtitle")}
                  </p>
                </SlideIn>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8">
                  <form
                    onSubmit={handleSearch}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        placeholder={t("common.enterPickupLocation")}
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="pl-12 h-14 text-lg bg-white/95 backdrop-blur-sm border-white/20 text-black placeholder:text-gray-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="btn-hero px-8 h-14"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      {t("common.findVehicles")}
                    </Button>
                  </form>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  <FadeIn delay={300}>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-2xl font-bold">50+</div>
                      <div className="text-sm text-white/80">
                        {t("common.electricVehicles")}
                      </div>
                    </div>
                  </FadeIn>
                  <FadeIn delay={400}>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-2xl font-bold">8</div>
                      <div className="text-sm text-white/80">
                        {t("common.chargingStations")}
                      </div>
                    </div>
                  </FadeIn>
                  <FadeIn delay={500}>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-2xl font-bold">24/7</div>
                      <div className="text-sm text-white/80">
                        {t("common.support")}
                      </div>
                    </div>
                  </FadeIn>
                  <FadeIn delay={600}>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-2xl font-bold">4.9</div>
                      <div className="text-sm text-white/80">
                        {t("common.userRating")}
                      </div>
                    </div>
                  </FadeIn>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Featured Vehicles */}
        <SlideIn direction="bottom" delay={200}>
          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {t("common.featuredElectricVehicles")}
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t("common.featuredVehiclesSubtitle")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {availableVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>

              <div className="text-center">
                <Button size="lg" variant="outline" asChild>
                  <Link to="/vehicles">
                    {t("dashboard.viewAllVehicles")}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </SlideIn>

        {/* How It Works */}
        <FadeIn delay={300}>
          <section className="py-16 bg-secondary/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {t("common.howItWorks")}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {t("common.howItWorksSubtitle")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="p-4 bg-primary-light rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t("common.step1Title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("common.step1Description")}
                  </p>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-success-light rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t("common.step2Title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("common.step2Description")}
                  </p>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-warning/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-warning" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t("common.step3Title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("common.step3Description")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    {t("common.whyChooseElectric")}
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-success-light rounded-lg">
                        <CheckCircle className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {t("common.ecoFriendly")}
                        </h3>
                        <p className="text-muted-foreground">
                          {t("common.ecoFriendlyDescription")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-primary-light rounded-lg">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {t("common.costEffective")}
                        </h3>
                        <p className="text-muted-foreground">
                          {t("common.costEffectiveDescription")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-warning/20 rounded-lg">
                        <Shield className="h-6 w-6 text-warning" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {t("common.premiumExperience")}
                        </h3>
                        <p className="text-muted-foreground">
                          {t("common.premiumExperienceDescription")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="card-hover">
                    <CardContent className="p-6 text-center">
                      <Battery className="h-12 w-12 mx-auto mb-4 text-success" />
                      <h3 className="text-2xl font-bold mb-2">500km+</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("common.averageRange")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-hover">
                    <CardContent className="p-6 text-center">
                      <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-2xl font-bold mb-2">30min</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("common.fastCharging")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-hover">
                    <CardContent className="p-6 text-center">
                      <Star className="h-12 w-12 mx-auto mb-4 text-warning" />
                      <h3 className="text-2xl font-bold mb-2">4.9/5</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("common.userRating")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-hover">
                    <CardContent className="p-6 text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-success" />
                      <h3 className="text-2xl font-bold mb-2">10k+</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("common.happyCustomers")}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* CTA Section */}
        <SlideIn direction="bottom" delay={400}>
          <section className="py-16 bg-gradient-primary text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("common.readyToGoElectric")}
              </h2>
              <p className="text-xl mb-8 text-white/90">
                {t("common.ctaSubtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <Link to="/vehicles">
                    {t("common.browseVehicles")}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white text-white bg-white/5 hover:bg-white hover:text-foreground transition-colors"
                >
                  <Link to="/register">{t("common.signUpNow")}</Link>
                </Button>
              </div>
            </div>
          </section>
        </SlideIn>

        {/* Footer */}
        <FadeIn delay={500}>
          <footer className="bg-foreground text-background py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-primary rounded-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold">EVRentals</span>
                  </div>
                  <p className="text-background/80">
                    {t("common.footerAbout")}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">{t("common.company")}</h3>
                  <ul className="space-y-2 text-background/80">
                    <li>
                      <Link
                        to="/about"
                        className="hover:text-background transition-colors"
                      >
                        About Us
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">{t("footer.support")}</h3>
                  <ul className="space-y-2 text-background/80">
                    <li>
                      <Link
                        to="/help"
                        className="hover:text-background transition-colors"
                      >
                        Help Center
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/contact"
                        className="hover:text-background transition-colors"
                      >
                        Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/safety"
                        className="hover:text-background transition-colors"
                      >
                        Safety
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/terms"
                        className="hover:text-background transition-colors"
                      >
                        {t("footer.terms")}
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">
                    {t("common.locations")}
                  </h3>
                  <ul className="space-y-2 text-background/80">
                    <li>{t("common.district1Station")}</li>
                    <li>{t("common.district7Station")}</li>
                    <li>{t("common.airportStation")}</li>
                    <li>{t("common.district3Station")}</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-background/20 mt-8 pt-8 text-center text-background/60">
                <p>&copy; 2024 EVRentals. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </FadeIn>
      </div>
    </PageTransition>
  );
};

export default Index;
