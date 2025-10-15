import React from 'react';
import { useVehicles, useVehicleModels, useStations } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const ApiTest: React.FC = () => {
  const { data: vehicles, loading: vehiclesLoading, error: vehiclesError, refetch: refetchVehicles } = useVehicles();
  const { data: models, loading: modelsLoading, error: modelsError, refetch: refetchModels } = useVehicleModels();
  const { data: stations, loading: stationsLoading, error: stationsError, refetch: refetchStations } = useStations();

  const handleRefreshAll = () => {
    refetchVehicles();
    refetchModels();
    refetchStations();
  };

  const renderStatus = (loading: boolean, error: string | null, data: any) => {
    if (loading) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="h-4 w-4" />
          <span>Error: {error}</span>
        </div>
      );
    }
    
    if (data) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>Success ({Array.isArray(data) ? data.length : 1} items)</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <XCircle className="h-4 w-4" />
        <span>No data</span>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">API Connection Test</h1>
        <Button onClick={handleRefreshAll} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vehicles Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Vehicles API
              {renderStatus(vehiclesLoading, vehiclesError, vehicles)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehiclesError ? (
              <p className="text-red-600 text-sm">{vehiclesError}</p>
            ) : vehicles ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Total vehicles: {vehicles.length}
                </p>
                <div className="space-y-1">
                  {vehicles.slice(0, 3).map((vehicle) => (
                    <div key={vehicle.vehicle_id} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="font-medium">{vehicle.unique_vehicle_id}</div>
                      <div className="text-gray-500">
                        {vehicle.status} - {vehicle.battery_level}% battery
                      </div>
                    </div>
                  ))}
                  {vehicles.length > 3 && (
                    <div className="text-xs text-gray-500">
                      ... and {vehicles.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Models Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Vehicle Models API
              {renderStatus(modelsLoading, modelsError, models)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modelsError ? (
              <p className="text-red-600 text-sm">{modelsError}</p>
            ) : models ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Total models: {models.length}
                </p>
                <div className="space-y-1">
                  {models.slice(0, 3).map((model) => (
                    <div key={model.model_id} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="font-medium">{model.brand} {model.model_name}</div>
                      <div className="text-gray-500">
                        {model.type} - {model.max_range_km}km range
                      </div>
                    </div>
                  ))}
                  {models.length > 3 && (
                    <div className="text-xs text-gray-500">
                      ... and {models.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Stations Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Stations API
              {renderStatus(stationsLoading, stationsError, stations)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stationsError ? (
              <p className="text-red-600 text-sm">{stationsError}</p>
            ) : stations ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Total stations: {stations.length}
                </p>
                <div className="space-y-1">
                  {stations.slice(0, 3).map((station) => (
                    <div key={station.station_id} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="font-medium">{station.name}</div>
                      <div className="text-gray-500">
                        {station.city} - {station.available_vehicles} available
                      </div>
                    </div>
                  ))}
                  {stations.length > 3 && (
                    <div className="text-xs text-gray-500">
                      ... and {stations.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {vehicles && !vehiclesError ? vehicles.length : 0}
              </div>
              <div className="text-sm text-gray-600">Vehicles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {models && !modelsError ? models.length : 0}
              </div>
              <div className="text-sm text-gray-600">Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stations && !stationsError ? stations.length : 0}
              </div>
              <div className="text-sm text-gray-600">Stations</div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            {vehiclesError || modelsError || stationsError ? (
              <Badge variant="destructive">API Connection Issues</Badge>
            ) : (
              <Badge variant="default" className="bg-green-600">
                All APIs Connected Successfully
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTest;
