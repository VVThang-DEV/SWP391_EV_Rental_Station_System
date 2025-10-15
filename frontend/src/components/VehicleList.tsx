import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Car, Battery, MapPin, Edit, Wrench, CheckCircle, AlertCircle } from "lucide-react";
import { Vehicle } from "@/services/api";

interface VehicleListProps {
  vehicles: Vehicle[];
  loading: boolean;
  onEditVehicle: (vehicleId: number) => void;
  onUpdateStatus: (vehicleId: number, status: string) => void;
  onRecordMaintenance: (vehicleId: number) => void;
}

export default function VehicleList({ 
  vehicles, 
  loading, 
  onEditVehicle, 
  onUpdateStatus, 
  onRecordMaintenance 
}: VehicleListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVehicles = vehicles.filter(vehicle =>
    searchQuery
      ? vehicle.uniqueVehicleId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.modelId.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "rented":
        return <Badge className="bg-yellow-100 text-yellow-800">Rented</Badge>;
      case "maintenance":
        return <Badge className="bg-red-100 text-red-800">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
      case "good":
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
      case "fair":
        return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>;
      case "poor":
        return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
      default:
        return <Badge variant="secondary">{condition}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading vehicles...</p>
      </div>
    );
  }

  if (filteredVehicles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">No vehicles found</p>
        <p className="text-sm">Add a vehicle to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Vehicle List */}
      <div className="space-y-3">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.vehicleId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-muted rounded-full">
                    <Car className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {vehicle.modelId} - {vehicle.uniqueVehicleId}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      ID: {vehicle.vehicleId}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(vehicle.status)}
                      {getConditionBadge(vehicle.condition || "unknown")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Vehicle Info */}
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Battery className="h-4 w-4" />
                      <span>{vehicle.batteryLevel}%</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{vehicle.location || "Unknown"}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {vehicle.mileage} km
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditVehicle(vehicle.vehicleId)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRecordMaintenance(vehicle.vehicleId)}
                    >
                      <Wrench className="h-3 w-3 mr-1" />
                      Maintenance
                    </Button>

                    {vehicle.status === "available" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(vehicle.vehicleId, "maintenance")}
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Mark Maintenance
                      </Button>
                    )}

                    {vehicle.status === "maintenance" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(vehicle.vehicleId, "available")}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark Available
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
