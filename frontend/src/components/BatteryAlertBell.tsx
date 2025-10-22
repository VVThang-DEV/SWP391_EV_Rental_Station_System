import React, { useState, useEffect, useRef } from 'react';
import { Bell, Battery, AlertTriangle, X, RefreshCw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useStationVehicles } from '@/hooks/useStaffApi';
import { useToast } from '@/hooks/use-toast';
import { useChargingContext } from '@/contexts/ChargingContext';

interface LowBatteryVehicle {
  id: string;
  name: string;
  batteryLevel: number;
  uniqueVehicleId: string;
  location?: string;
  isCharging?: boolean;
}

interface BatteryAlertBellProps {
  className?: string;
}

const BatteryAlertBell: React.FC<BatteryAlertBellProps> = ({ 
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lowBatteryVehicles, setLowBatteryVehicles] = useState<LowBatteryVehicle[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { data: vehicles, loading, refetch } = useStationVehicles();
  const { toast } = useToast();
  const { chargingVehicles, addChargingVehicle, removeChargingVehicle } = useChargingContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Threshold for low battery (20%)
  const LOW_BATTERY_THRESHOLD = 20;

  // Initialize audio for notification sound
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU5k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audioRef.current.volume = 0.3;
  }, []);

  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const lowBatteryList = vehicles
        .filter(vehicle => 
          vehicle.batteryLevel <= LOW_BATTERY_THRESHOLD && 
          vehicle.status === 'available'
        )
        .map(vehicle => ({
          id: vehicle.vehicleId.toString(),
          name: `${vehicle.modelId} - ${vehicle.uniqueVehicleId || vehicle.vehicleId}`,
          batteryLevel: vehicle.batteryLevel,
          uniqueVehicleId: vehicle.uniqueVehicleId || vehicle.vehicleId.toString(),
          location: vehicle.location || 'Unknown',
          isCharging: chargingVehicles.has(vehicle.vehicleId.toString())
        }));
      
      // Play sound if new low battery vehicles are detected
      if (lowBatteryList.length > 0 && soundEnabled && audioRef.current) {
        const previousCount = lowBatteryVehicles.length;
        if (lowBatteryList.length > previousCount) {
          audioRef.current.play().catch(() => {
            // Ignore audio play errors
          });
        }
      }
      
      setLowBatteryVehicles(lowBatteryList);
    }
  }, [vehicles, soundEnabled, lowBatteryVehicles.length, chargingVehicles]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing) {
        refetch();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch, isRefreshing]);

  const getBatteryColor = (level: number) => {
    if (level <= 10) return 'text-red-500';
    if (level <= 20) return 'text-orange-500';
    return 'text-yellow-500';
  };

  const getBatteryIcon = (level: number) => {
    if (level <= 10) return '🔴';
    if (level <= 20) return '🟠';
    return '🟡';
  };

  const getBatteryStatus = (level: number) => {
    if (level <= 10) return 'Pin cực yếu';
    if (level <= 20) return 'Pin yếu';
    return 'Pin thấp';
  };

  const handleStartCharging = async (vehicleId: string) => {
    try {
      // Add to charging set using context
      addChargingVehicle(vehicleId);
      
      // Update vehicle status in the list
      setLowBatteryVehicles(prev => 
        prev.map(v => v.id === vehicleId ? { ...v, isCharging: true } : v)
      );
      
      toast({
        title: "Đã bắt đầu sạc",
        description: "Xe đã được đánh dấu là đang sạc pin",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái xe",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsCharged = async (vehicleId: string) => {
    try {
      // TODO: Implement API call to mark vehicle as charged
      console.log(`Marking vehicle ${vehicleId} as charged`);
      
      // Remove from charging set using context
      removeChargingVehicle(vehicleId);
      
      // Remove from low battery list
      setLowBatteryVehicles(prev => prev.filter(v => v.id !== vehicleId));
      
      toast({
        title: "Hoàn thành sạc",
        description: "Xe đã được sạc pin đầy đủ",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái xe",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Đã làm mới",
        description: "Danh sách xe đã được cập nhật",
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể làm mới dữ liệu",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast({
      title: soundEnabled ? "Tắt âm thanh" : "Bật âm thanh",
      description: soundEnabled ? "Thông báo âm thanh đã tắt" : "Thông báo âm thanh đã bật",
      duration: 1500,
    });
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
          disabled
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`relative p-2 transition-colors ${
              lowBatteryVehicles.length > 0 
                ? 'hover:bg-orange-50 dark:hover:bg-orange-950/20 animate-pulse' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-950/20'
            }`}
          >
            <Bell className={`h-5 w-5 ${
              lowBatteryVehicles.length > 0 
                ? 'text-orange-600 dark:text-orange-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`} />
            {lowBatteryVehicles.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-bounce"
              >
                {lowBatteryVehicles.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-96 p-0" 
          align="end"
          sideOffset={8}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Cảnh báo pin yếu
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSound}
                    className="h-6 w-6 p-0"
                    title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
                  >
                    <Volume2 className={`h-4 w-4 ${soundEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="h-6 w-6 p-0"
                    title="Làm mới"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {lowBatteryVehicles.length > 0 
                  ? `${lowBatteryVehicles.length} xe cần được sạc pin ngay`
                  : 'Không có xe nào cần sạc pin'
                }
              </p>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="p-0">
              {lowBatteryVehicles.length === 0 ? (
                <div className="p-6 text-center">
                  <Battery className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Tất cả xe đều có pin đầy đủ
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tự động làm mới mỗi 30 giây
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-80">
                  <div className="p-4 space-y-3">
                    {lowBatteryVehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          vehicle.isCharging 
                            ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30'
                            : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="text-2xl">
                            {vehicle.isCharging ? '🔌' : getBatteryIcon(vehicle.batteryLevel)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {vehicle.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              ID: {vehicle.uniqueVehicleId}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              📍 {vehicle.location}
                            </p>
                            {vehicle.isCharging && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                🔋 Đang được sạc pin...
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className={`text-sm font-bold ${getBatteryColor(vehicle.batteryLevel)}`}>
                              {vehicle.batteryLevel}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {vehicle.isCharging ? 'Đang sạc' : getBatteryStatus(vehicle.batteryLevel)}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            {!vehicle.isCharging ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartCharging(vehicle.id)}
                                className="h-8 px-2 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                              >
                                🔌 Bắt đầu sạc
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsCharged(vehicle.id)}
                                className="h-8 px-2 text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                              >
                                ✅ Hoàn thành
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BatteryAlertBell;