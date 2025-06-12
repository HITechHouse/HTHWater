import  { DropletIcon, MapPin, Ruler, ArrowRight } from 'lucide-react';
import { WaterBody } from '../services/mapService';

interface WaterBodyDetailsProps {
  waterBody: WaterBody;
}

const WaterBodyDetails = ({ waterBody }: WaterBodyDetailsProps) => {
  // Determine which icon to show based on water body type
  const getTypeIcon = () => {
    if (waterBody.type.includes('نهر')) {
      return <ArrowRight size={18} className="ml-1" />;
    } else {
      return <DropletIcon size={18} className="ml-1" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-700 p-4 text-white">
        <h2 className="text-xl font-bold flex items-center">
          {getTypeIcon()}
          {waterBody.name}
        </h2>
        <div className="flex items-center mt-1 text-blue-100 text-sm">
          <MapPin size={14} className="ml-1" />
          <span>{waterBody.area}</span>
          <span className="mx-2">•</span>
          <span>{waterBody.type}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <Ruler size={16} className="ml-1" />
          الخصائص الرئيسية
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(waterBody.attributes).map(([key, value]) => {
            // Skip internal attributes like object IDs
            if (key.startsWith('OBJECTID') || key.startsWith('FID') || key === 'ID') {
              return null;
            }
            
            // Format the attribute name
            let formattedKey = key;
            if (key === 'LENGTH_KM') formattedKey = 'الطول';
            if (key === 'FLOW_RATE') formattedKey = 'معدل التدفق';
            if (key === 'AVERAGE_WIDTH') formattedKey = 'العرض المتوسط';
            if (key === 'DEPTH_RANGE') formattedKey = 'نطاق العمق';
            if (key === 'WATER_QUALITY') formattedKey = 'جودة المياه';
            if (key === 'POLLUTION_LEVEL') formattedKey = 'مستوى التلوث';
            if (key === 'ANNUAL_DISCHARGE') formattedKey = 'التصريف السنوي';
            if (key === 'AREA_KM2') formattedKey = 'المساحة';
            if (key === 'VOLUME') formattedKey = 'الحجم';
            if (key === 'MAX_DEPTH') formattedKey = 'أقصى عمق';
            if (key === 'SHORELINE_LENGTH') formattedKey = 'طول الشاطئ';
            if (key === 'ANNUAL_EVAPORATION') formattedKey = 'التبخر السنوي';
            
            return (
              <div key={key} className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-500">{formattedKey}</div>
                <div className="font-medium">{value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WaterBodyDetails;
 