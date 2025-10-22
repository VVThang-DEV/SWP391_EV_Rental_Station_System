import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Battery,
  MapPin,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { WalkInVehicle } from "./types";

interface WalkInVehicleSelectorProps {
  vehicles: WalkInVehicle[];
  selectedVehicleId: string | null;
  onVehicleSelect: (vehicleId: string) => void;
}

const WalkInVehicleSelector: React.FC<WalkInVehicleSelectorProps> = ({
  vehicles,
  selectedVehicleId,
  onVehicleSelect,
}) => {
  const availableVehicles = vehicles.filter(v => v.status === "available");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Available Vehicles</h3>
        <Badge variant="outline" className="text-green-600 border-green-600">
          {availableVehicles.length} Available
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableVehicles.map(vehicle => (
          <Card 
            key={vehicle.id} 
            className={`hover:shadow-md transition-all cursor-pointer ${
              selectedVehicleId === vehicle.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:shadow-md'
            }`}
            onClick={() => onVehicleSelect(vehicle.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">{vehicle.name}</h4>
                <div className="flex items-center gap-2">
                  {selectedVehicleId === vehicle.id && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                  <Badge 
                    variant="outline" 
                    className="text-green-600 border-green-600"
                  >
                    Available
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {vehicle.batteryLevel}% battery
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{vehicle.location}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {vehicle.pricePerHour.toLocaleString()}k/hour
                  </span>
                </div>
              </div>

              {selectedVehicleId === vehicle.id && (
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    Selected
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {availableVehicles.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">
              No vehicles available
            </p>
            <p className="text-sm text-muted-foreground">
              All vehicles are currently in use or under maintenance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalkInVehicleSelector;
