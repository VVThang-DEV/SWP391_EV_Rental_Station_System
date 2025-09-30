import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, MapPin, Clock, Car, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchSuggestion {
  id: string;
  type: "location" | "vehicle" | "brand" | "recent";
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface EnhancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  className?: string;
}

// Mock suggestions data - moved outside component to avoid dependency issues
const mockSuggestions: SearchSuggestion[] = [
  // Location suggestions
  {
    id: "1",
    type: "location",
    value: "District 1 Station",
    label: "District 1 Station",
    icon: <MapPin className="h-4 w-4" />,
  },
  {
    id: "2",
    type: "location",
    value: "District 7 Station",
    label: "District 7 Station",
    icon: <MapPin className="h-4 w-4" />,
  },
  {
    id: "3",
    type: "location",
    value: "Airport Station",
    label: "Airport Station",
    icon: <MapPin className="h-4 w-4" />,
  },
  // Vehicle model suggestions with station availability info
  {
    id: "4",
    type: "vehicle",
    value: "Tesla Model 3",
    label: "Tesla Model 3 (Find at stations)",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "5",
    type: "vehicle",
    value: "VinFast VF8",
    label: "VinFast VF8 (Find at stations)",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "6",
    type: "vehicle",
    value: "Hyundai Kona",
    label: "Hyundai Kona (Find at stations)",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "7",
    type: "vehicle",
    value: "BMW i3",
    label: "BMW i3 (Find at stations)",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "8",
    type: "vehicle",
    value: "Nissan Leaf",
    label: "Nissan Leaf (Find at stations)",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "9",
    type: "vehicle",
    value: "Audi e-tron",
    label: "Audi e-tron (Find at stations)",
    icon: <Car className="h-4 w-4" />,
  },
  // Luxury models
  {
    id: "10",
    type: "vehicle",
    value: "Mercedes-Benz EQS",
    label: "Mercedes-Benz EQS (Luxury)",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "11",
    type: "vehicle",
    value: "Porsche Taycan",
    label: "Porsche Taycan (Performance)",
    icon: <Car className="h-4 w-4" />,
  },
  // Budget models
  {
    id: "12",
    type: "vehicle",
    value: "Chevrolet Bolt",
    label: "Chevrolet Bolt EV (Budget)",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "13",
    type: "vehicle",
    value: "Volkswagen ID.3",
    label: "Volkswagen ID.3 (Compact)",
    icon: <Car className="h-4 w-4" />,
  },
  // Performance models
  {
    id: "14",
    type: "vehicle",
    value: "Tesla Model S",
    label: "Tesla Model S (Performance)",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "15",
    type: "vehicle",
    value: "BMW i4",
    label: "BMW i4 M50 (Sports)",
    icon: <Car className="h-4 w-4" />,
  },
  // Alternative vehicles
  {
    id: "16",
    type: "vehicle",
    value: "Yamaha EC-05",
    label: "Yamaha EC-05 (Scooter)",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "17",
    type: "vehicle",
    value: "Specialized Turbo",
    label: "Specialized Turbo Vado (E-Bike)",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "18",
    type: "vehicle",
    value: "Renault Master",
    label: "Renault Master E-TECH (Van)",
    icon: <Car className="h-4 w-4" />,
  },
  // Brand suggestions
  {
    id: "19",
    type: "brand",
    value: "Tesla",
    label: "Tesla vehicles",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "20",
    type: "brand",
    value: "VinFast",
    label: "VinFast vehicles",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "21",
    type: "brand",
    value: "BMW",
    label: "BMW vehicles",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "22",
    type: "brand",
    value: "Mercedes-Benz",
    label: "Mercedes-Benz vehicles",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "23",
    type: "brand",
    value: "Porsche",
    label: "Porsche vehicles",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "24",
    type: "brand",
    value: "Hyundai",
    label: "Hyundai vehicles",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "25",
    type: "brand",
    value: "Nissan",
    label: "Nissan vehicles",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "26",
    type: "brand",
    value: "Audi",
    label: "Audi vehicles",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "27",
    type: "brand",
    value: "Chevrolet",
    label: "Chevrolet vehicles",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "28",
    type: "brand",
    value: "Volkswagen",
    label: "Volkswagen vehicles",
    icon: <Car className="h-4 w-4" />,
  },
];

export const EnhancedSearch = ({
  value,
  onChange,
  onSuggestionSelect,
  placeholder = "Search vehicles, locations, or brands...",
  className,
}: EnhancedSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save search to recent searches
  const saveToRecent = (query: string) => {
    if (query.trim() && !recentSearches.includes(query)) {
      const updated = [query, ...recentSearches.slice(0, 4)];
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }
  };

  // Filter suggestions based on input
  useEffect(() => {
    if (value.trim()) {
      const filtered = mockSuggestions.filter((suggestion) =>
        suggestion.label.toLowerCase().includes(value.toLowerCase())
      );

      // Add recent searches that match
      const matchingRecent = recentSearches
        .filter((recent) => recent.toLowerCase().includes(value.toLowerCase()))
        .map((recent, index) => ({
          id: `recent-${index}`,
          type: "recent" as const,
          value: recent,
          label: recent,
          icon: <Clock className="h-4 w-4" />,
        }));

      setSuggestions([...matchingRecent, ...filtered].slice(0, 6));
    } else {
      // Show recent searches when no input
      const recentSuggestions = recentSearches.map((recent, index) => ({
        id: `recent-${index}`,
        type: "recent" as const,
        value: recent,
        label: recent,
        icon: <Clock className="h-4 w-4" />,
      }));
      setSuggestions(recentSuggestions);
    }
  }, [value, recentSearches]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.value);
    saveToRecent(suggestion.value);
    onSuggestionSelect(suggestion);
    setIsOpen(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 h-12 text-black placeholder:text-muted-foreground"
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {!value && recentSearches.length > 0 && (
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Recent Searches
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="h-auto p-1 text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          <div className="p-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted rounded-md transition-colors"
              >
                <div className="text-muted-foreground">{suggestion.icon}</div>
                <div className="flex-1">
                  <span className="text-sm">{suggestion.label}</span>
                  {suggestion.type === "recent" && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Recent
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Filter Badge Component for active filters
export const FilterBadge = ({
  label,
  onRemove,
  variant = "secondary",
}: {
  label: string;
  onRemove: () => void;
  variant?: "default" | "secondary" | "destructive" | "outline";
}) => (
  <Badge variant={variant} className="flex items-center space-x-1 px-2 py-1">
    <span className="text-xs">{label}</span>
    <button
      onClick={onRemove}
      className="ml-1 hover:bg-black/10 rounded-full p-0.5"
    >
      <X className="h-3 w-3" />
    </button>
  </Badge>
);

// Active Filters Display
export const ActiveFilters = ({
  filters,
  onClearAll,
}: {
  filters: { key: string; label: string; onRemove: () => void }[];
  onClearAll: () => void;
}) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Active filters:
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <FilterBadge
            key={filter.key}
            label={filter.label}
            onRemove={filter.onRemove}
          />
        ))}
      </div>

      {filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-auto px-2 py-1 text-xs"
        >
          Clear All
        </Button>
      )}
    </div>
  );
};
