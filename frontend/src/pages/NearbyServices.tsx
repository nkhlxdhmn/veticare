import { mockServices } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star } from "lucide-react";

export default function NearbyServices() {
  return (
    <div className="space-y-12 animate-fade-in max-w-6xl mx-auto h-full flex flex-col">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">Nearby Services</h1>
        <p className="text-lg text-textSecondary font-light">
          Find trusted veterinary clinics and hospitals in your area.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-[600px]">
        {/* List Side */}
        <div className="w-full lg:w-1/3 space-y-4 flex flex-col overflow-y-auto pr-2">
          {mockServices.map((service) => (
            <Card key={service.id} className="cursor-pointer group flex-shrink-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight group-hover:text-textSecondary transition-colors">
                  {service.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium uppercase tracking-widest text-textSecondary">
                    {service.type}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-textSecondary text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{service.address}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-borderLight/50">
                  <span className="text-sm font-medium">{service.distance}</span>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="h-4 w-4 fill-textPrimary text-textPrimary" />
                    <span>{service.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map Side (Placeholder) */}
        <div className="w-full lg:w-2/3 bg-gray-100 rounded-xl border border-borderLight flex items-center justify-center min-h-[400px] lg:min-h-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" 
               style={{ 
                 backgroundImage: 'radial-gradient(#111111 1px, transparent 1px)', 
                 backgroundSize: '20px 20px' 
               }} 
          />
          <div className="z-10 flex flex-col items-center space-y-4 bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-borderLight">
            <MapPin className="h-8 w-8 text-textSecondary" />
            <p className="text-textSecondary font-medium tracking-wide">Interactive Map Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}
