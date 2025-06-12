import React from 'react';
import { X, MapPin, Info, Droplet, Building, Users } from 'lucide-react';

interface FeatureInfo {
  id: string | number;
  name: string;
  type: string;
  layerName: string;
  attributes: Record<string, any>;
  geometry?: any;
}

interface FeatureInfoPanelProps {
  feature: FeatureInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onZoomTo?: (coordinates: number[]) => void;
}

const FeatureInfoPanel: React.FC<FeatureInfoPanelProps> = ({
  feature,
  isOpen,
  onClose,
  onZoomTo
}) => {
  if (!isOpen || !feature) return null;

  const getLayerIcon = (layerName: string) => {
    switch (layerName) {
      case 'waterBodies':
      case 'waterLines':
        return <Droplet className="w-5 h-5 text-blue-500" />;
      case 'governorates':
      case 'districts':
      case 'subdistricts':
        return <Building className="w-5 h-5 text-green-500" />;
      case 'villages':
        return <Users className="w-5 h-5 text-orange-500" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLayerDisplayName = (layerName: string) => {
    const names = {
      waterBodies: 'المسطحات المائية',
      waterLines: 'المجاري المائية',
      governorates: 'المحافظات',
      districts: 'المناطق',
      subdistricts: 'النواحي',
      villages: 'القرى'
    };
    return names[layerName as keyof typeof names] || layerName;
  };

  const formatAttributeValue = (key: string, value: any) => {
    if (value === null || value === undefined) return 'غير محدد';
    
    // Handle different data types
    if (typeof value === 'number') {
      // Check if it's a coordinate or area
      if (key.toLowerCase().includes('area') || key.toLowerCase().includes('مساحة')) {
        return `${value.toLocaleString()} م²`;
      }
      if (key.toLowerCase().includes('length') || key.toLowerCase().includes('طول')) {
        return `${value.toLocaleString()} م`;
      }
      if (key.toLowerCase().includes('population') || key.toLowerCase().includes('سكان')) {
        return value.toLocaleString();
      }
      return value.toLocaleString();
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    return String(value);
  };

  const getDisplayName = (key: string) => {
    const arabicNames: Record<string, string> = {
      'name': 'الاسم',
      'NAME': 'الاسم',
      'Name': 'الاسم',
      'type': 'النوع',
      'TYPE': 'النوع',
      'Type': 'النوع',
      'area': 'المساحة',
      'AREA': 'المساحة',
      'Area': 'المساحة',
      'length': 'الطول',
      'LENGTH': 'الطول',
      'Length': 'الطول',
      'population': 'عدد السكان',
      'POPULATION': 'عدد السكان',
      'Population': 'عدد السكان',
      'governorate': 'المحافظة',
      'GOVERNORATE': 'المحافظة',
      'Governorate': 'المحافظة',
      'district': 'المنطقة',
      'DISTRICT': 'المنطقة',
      'District': 'المنطقة',
      'subdistrict': 'الناحية',
      'SUBDISTRICT': 'الناحية',
      'Subdistrict': 'الناحية',
      'village': 'القرية',
      'VILLAGE': 'القرية',
      'Village': 'القرية',
      'elevation': 'الارتفاع',
      'ELEVATION': 'الارتفاع',
      'Elevation': 'الارتفاع',
      'depth': 'العمق',
      'DEPTH': 'العمق',
      'Depth': 'العمق',
      'capacity': 'السعة',
      'CAPACITY': 'السعة',
      'Capacity': 'السعة',
      'status': 'الحالة',
      'STATUS': 'الحالة',
      'Status': 'الحالة',
      'OBJECTID': 'معرف الكائن',
      'FID': 'معرف الميزة',
      'ID': 'المعرف'
    };
    
    return arabicNames[key] || key;
  };

  const handleZoomTo = () => {
    if (onZoomTo && feature.geometry) {
      // Extract coordinates from geometry
      let coordinates: number[] = [];
      
      if (feature.geometry.type === 'Point') {
        coordinates = feature.geometry.coordinates;
      } else if (feature.geometry.centroid) {
        coordinates = [feature.geometry.centroid.longitude, feature.geometry.centroid.latitude];
      } else if (feature.geometry.extent) {
        coordinates = [feature.geometry.extent.center.longitude, feature.geometry.extent.center.latitude];
      }
      
      if (coordinates.length >= 2) {
        onZoomTo(coordinates);
      }
    }
  };

  // Filter out system attributes and empty values
  const displayAttributes = Object.entries(feature.attributes)
    .filter(([key, value]) => {
      // Skip system fields and empty values
      const systemFields = ['OBJECTID', 'FID', 'Shape_Length', 'Shape_Area', 'GlobalID'];
      return !systemFields.includes(key) && value !== null && value !== undefined && value !== '';
    })
    .slice(0, 15); // Limit to first 15 attributes

  return (
    <div className={`feature-info-panel fixed inset-y-0 left-0 w-96 z-50 ${isOpen ? 'open' : ''}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="feature-info-header flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            {getLayerIcon(feature.layerName)}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{feature.name}</h2>
              <p className="text-sm text-gray-600">{getLayerDisplayName(feature.layerName)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" dir="rtl">
          {/* Basic Info */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Info className="w-4 h-4 text-blue-500 mr-2" />
              <h3 className="text-md font-medium text-gray-900">المعلومات الأساسية</h3>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="text-sm">
                <div className="flex justify-between py-1">
                  <span className="font-medium">المعرف:</span>
                  <span>{feature.id}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium">النوع:</span>
                  <span>{feature.type}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium">الطبقة:</span>
                  <span>{getLayerDisplayName(feature.layerName)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attributes */}
          {displayAttributes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">الخصائص التفصيلية</h3>
              <div className="space-y-3">
                {displayAttributes.map(([key, value]) => (
                  <div key={key} className="feature-attribute p-3">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-700 text-sm">
                        {getDisplayName(key)}:
                      </span>
                      <span className="text-gray-900 text-sm text-left font-semibold" dir="ltr">
                        {formatAttributeValue(key, value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-900 mb-3">الإجراءات</h3>
            <div className="space-y-2">
              {onZoomTo && (
                <button
                  onClick={handleZoomTo}
                  className="btn-primary w-full flex items-center justify-center px-4 py-3 rounded-lg"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  التكبير إلى الموقع
                </button>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(feature.attributes, null, 2));
                }}
                className="btn-secondary w-full flex items-center justify-center px-4 py-3 rounded-lg"
              >
                <Info className="w-4 h-4 mr-2" />
                نسخ المعلومات
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureInfoPanel;
