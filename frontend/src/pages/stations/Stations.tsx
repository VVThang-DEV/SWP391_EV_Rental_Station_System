import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Zap, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { stations } from "@/data/stations";
import {
  PageTransition,
  FadeIn,
  SlideIn,
} from "@/components/LoadingComponents";

const Stations = () => {
  const { t } = useTranslation();
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <FadeIn delay={100}>
          <div className="bg-gradient-hero py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Our Station Locations
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Find convenient pickup and drop-off locations throughout the
                city
              </p>
            </div>
          </div>
        </FadeIn>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SlideIn direction="bottom" delay={200}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {stations.map((station, index) => (
                <FadeIn key={station.id} delay={300 + index * 100}>
                  <Card className="card-premium">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold">
                          {station.name}
                        </h3>
                        <Badge className="badge-available">
                          {t("common.active")}
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            {station.address}
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
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {station.availableVehicles}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t("common.vehicles")}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {station.fastCharging ? "Yes" : "No"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Fast Charging
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button asChild className="w-full">
                          <Link to={`/stations/${station.id}`}>
                            {t("common.viewDetails")}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </SlideIn>

          <FadeIn delay={500}>
            <div className="mt-12 text-center">
              <Card className="inline-block">
                <CardContent className="p-6">
                  <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {t("common.moreVehicles")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("common.moreVehicles")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default Stations;
