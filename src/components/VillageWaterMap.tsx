import React from 'react';
import { MapPin, Droplet, Users } from 'lucide-react';

interface VillageWaterMapProps {
  data: any;
}

const VillageWaterMap: React.FC<VillageWaterMapProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h4 className="text-md font-medium text-gray-900 mb-4">خريطة توزيع القرى والمياه</h4>
      
      {/* Simplified map representation */}
      <div className="relative bg-blue-50 rounded-lg h-64 overflow-hidden">
        {/* Background pattern to simulate map */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Legend */}
        <div className="absolute top-2 right-2 bg-white p-2 rounded shadow-sm text-xs">
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
            <span>مسطحات مائية</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>قرى لديها وصول</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span>قرى تفتقر للوصول</span>
          </div>
        </div>
        
        {/* Simulated water bodies */}
        <div className="absolute top-8 left-12">
          <div className="w-16 h-8 bg-blue-500 rounded-full opacity-70"></div>
          <div className="text-xs text-blue-700 mt-1 text-center">نهر الفرات</div>
        </div>
        
        <div className="absolute top-20 right-16">
          <div className="w-12 h-12 bg-blue-500 rounded-full opacity-70"></div>
          <div className="text-xs text-blue-700 mt-1 text-center">بحيرة الأسد</div>
        </div>
        
        <div className="absolute bottom-16 left-20">
          <div className="w-10 h-6 bg-blue-500 rounded-full opacity-70"></div>
          <div className="text-xs text-blue-700 mt-1 text-center">بحيرة قطينة</div>
        </div>
        
        {/* Simulated villages with water access */}
        {[...Array(8)].map((_, i) => (
          <div 
            key={`green-${i}`}
            className="absolute w-2 h-2 bg-green-500 rounded-full"
            style={{
              top: `${20 + (i * 15) % 60}%`,
              left: `${15 + (i * 20) % 70}%`
            }}
          ></div>
        ))}
        
        {/* Simulated villages without water access */}
        {[...Array(3)].map((_, i) => (
          <div 
            key={`red-${i}`}
            className="absolute w-2 h-2 bg-red-500 rounded-full"
            style={{
              top: `${40 + (i * 25) % 40}%`,
              right: `${10 + (i * 15) % 30}%`
            }}
          ></div>
        ))}
      </div>
      
      {/* Statistics below map */}
      <div className="grid grid-cols-3 gap-4 mt-4 text-center">
        <div className="bg-blue-50 p-2 rounded">
          <Droplet className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <div className="text-sm font-medium text-blue-700">مسطحات مائية</div>
          <div className="text-lg font-bold text-blue-600">1,297</div>
        </div>
        <div className="bg-green-50 p-2 rounded">
          <Users className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <div className="text-sm font-medium text-green-700">قرى متصلة</div>
          <div className="text-lg font-bold text-green-600">{data.villagesWithWaterAccess}</div>
        </div>
        <div className="bg-red-50 p-2 rounded">
          <MapPin className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <div className="text-sm font-medium text-red-700">قرى معزولة</div>
          <div className="text-lg font-bold text-red-600">{data.villagesWithoutWaterAccess}</div>
        </div>
      </div>
    </div>
  );
};

export default VillageWaterMap;
