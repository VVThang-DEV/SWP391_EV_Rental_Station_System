import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
          id: vehicle.uniqueVehicleId,
          name: vehicle.modelId || 'Unknown Vehicle',
          batteryLevel: vehicle.batteryLevel,
          uniqueVehicleId: vehicle.uniqueVehicleId,
          location: vehicle.location || 'Unknown Location',
          isCharging: chargingVehicles.has(vehicle.uniqueVehicleId)
        }));

      setLowBatteryVehicles(lowBatteryList);

      // Play sound if there are new low battery vehicles
      if (lowBatteryList.length > 0 && soundEnabled && audioRef.current) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [vehicles, chargingVehicles, soundEnabled]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const getBatteryStatusText = (level: number) => {
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
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative ${className}`}
          disabled={loading}
        >
          <Bell className="h-5 w-5" />
          {lowBatteryVehicles.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
            >
              {lowBatteryVehicles.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">
              🔔 Cảnh báo pin yếu
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSound}
                className="h-8 w-8 p-0"
              >
                {soundEnabled ? '🔊' : '🔇'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                {isRefreshing ? '⏳' : '🔄'}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {lowBatteryVehicles.length > 0 
              ? `Có ${lowBatteryVehicles.length} xe cần được sạc pin`
              : 'Tất cả xe đều có pin đầy đủ'
            }
          </p>
        </div>

        <ScrollArea className="max-h-96">
          {lowBatteryVehicles.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <div className="text-4xl mb-2">✅</div>
              <p>Không có xe nào cần sạc pin</p>
            </div>
          ) : (
            <div className="p-2">
              {lowBatteryVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    vehicle.isCharging
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30'
                      : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/30'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {vehicle.name}
                      </h4>
                      <Badge 
                        variant={vehicle.batteryLevel <= 10 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {vehicle.batteryLevel}%
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-1">
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
              ))}
            </div>
          )}
        </ScrollArea>
        
        {lowBatteryVehicles.length > 0 && (
          <>
            <Separator />
            <div className="p-3 bg-muted/50">
              <p className="text-xs text-muted-foreground text-center">
                💡 Nhấn "Bắt đầu sạc" khi đã cắm sạc cho xe
              </p>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default BatteryAlertBell;

