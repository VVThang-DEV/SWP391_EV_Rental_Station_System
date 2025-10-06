import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, AlertCircle } from "lucide-react";
import {
  getVehicleModels,
  findStationsWithModel,
  StationLocation,
} from "@/lib/vehicle-station-utils";

const ModelStationsPage = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const [modelName, setModelName] = useState<string>("");
  const [modelImage, setModelImage] = useState<string>("");
  const [stations, setStations] = useState<StationLocation[]>([]);

  useEffect(() => {
    if (!modelId) return;
    const models = getVehicleModels();
    const model = models.find((m) => m.modelId === modelId);
    if (model) {
      setModelName(model.name);
      setModelImage(model.image);
    }
    const found = findStationsWithModel(modelId);
    setStations(found);
  }, [modelId]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
          <h1 className="text-2xl font-semibold">{modelName || modelId} - Available Locations</h1>
        </div>

        <Card className="mb-6">
          <div className="flex items-center gap-4 p-4">
            {modelImage && <img src={modelImage} alt={modelName} className="w-36 h-24 object-cover rounded" />}
            <div>
              <h2 className="text-lg font-semibold">{modelName}</h2>
              <p className="text-sm text-muted-foreground">Stations that currently have this model available.</p>
            </div>
          </div>
        </Card>

        {stations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No stations available for this model right now.</p>
            </CardContent>
          </Card>
        ) : (
          stations.map((station) => {
            const vehicleList = station.availableVehiclesByModel.get(modelId!) || [];
            const count = vehicleList.length;
            return (
              <Card key={station.id} className="mb-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{station.name}</h3>
                      <p className="text-sm text-muted-foreground">{station.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {count} available
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {station.operatingHours}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {station.rating}
                    </span>
                    {typeof station.distance === "number" && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {station.distance!.toFixed(1)} km
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link to={`/stations/${station.id}`}>View Station Details</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/stations/${station.id}`}>View Vehicles ({count})</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ModelStationsPage;