import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Settings, 
  Filter, 
  Satellite,
  Map as MapIcon,
  ChevronDown,
  ChevronRight,
  Droplet,
  Building,
  Users,
  Globe
} from 'lucide-react';

interface LayerInfo {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  type: 'vector' | 'raster';
  icon: React.ReactNode;
  color: string;
  featureCount?: number;
}

interface LayerControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  layers: { [key: string]: LayerInfo };
  onLayerToggle: (layerId: string) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
  onQueryBuilder: (layerId: string) => void;
  satelliteEnabled: boolean;
  onSatelliteToggle: () => void;
  basemap: string;
  onBasemapChange: (basemap: string) => void;
}

const LayerControlPanel: React.FC<LayerControlPanelProps> = ({
  isOpen,
  onClose,
  layers,
  onLayerToggle,
  onOpacityChange,
  onQueryBuilder,
  satelliteEnabled,
  onSatelliteToggle,
  basemap,
  onBasemapChange
}) => {
  const [expandedSections, setExpandedSections] = useState({
    basemap: true,
    water: true,
    administrative: true
  });

  const [showOpacityControls, setShowOpacityControls] = useState<string | null>(null);

  const basemaps = [
    { id: 'streets', name: 'الشوارع', icon: <MapIcon className="w-4 h-4" /> },
    { id: 'satellite', name: 'الصورة الجوية', icon: <Satellite className="w-4 h-4" /> },
    { id: 'hybrid', name: 'مختلط', icon: <Globe className="w-4 h-4" /> },
    { id: 'topo', name: 'طبوغرافي', icon: <Building className="w-4 h-4" /> },
    { id: 'gray', name: 'رمادي', icon: <MapIcon className="w-4 h-4" /> }
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const waterLayers = Object.entries(layers).filter(([key]) => 
    key.includes('water') || key.includes('Water')
  );

  const administrativeLayers = Object.entries(layers).filter(([key]) => 
    !key.includes('water') && !key.includes('Water')
  );

  const LayerItem: React.FC<{ 
    layerId: string; 
    layer: LayerInfo; 
    showDivider?: boolean;
  }> = ({ layerId, layer, showDivider = true }) => (
    <div className={`layer-item ${showDivider ? 'border-b border-gray-100 pb-3 mb-3' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse flex-1">
          <button
            onClick={() => onLayerToggle(layerId)}
            className={`p-1 rounded ${layer.visible ? 'text-blue-600' : 'text-gray-400'}`}
          >
            {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: layer.color }}></div>
            {layer.icon}
            <span className={`text-sm font-medium ${layer.visible ? 'text-gray-900' : 'text-gray-500'}`}>
              {layer.name}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1 space-x-reverse">
          {layer.featureCount && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {layer.featureCount}
            </span>
          )}
          
          <button
            onClick={() => setShowOpacityControls(
              showOpacityControls === layerId ? null : layerId
            )}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="إعدادات الشفافية"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onQueryBuilder(layerId)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="منشئ الاستعلامات"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Opacity Control */}
      {showOpacityControls === layerId && (
        <div className="mt-3 bg-gray-50 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">الشفافية</span>
            <span className="text-xs text-gray-500">{Math.round(layer.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={layer.opacity}
            onChange={(e) => onOpacityChange(layerId, parseFloat(e.target.value))}
            className="opacity-slider w-full cursor-pointer"
          />
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="layer-control-panel absolute top-16 right-4 w-80 z-40 fade-in" dir="rtl">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Layers className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">التحكم في الطبقات</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Basemap Section */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => toggleSection('basemap')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <Globe className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-900">الخريطة الأساسية</span>
            </div>
            {expandedSections.basemap ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </button>

          {expandedSections.basemap && (
            <div className="mt-3 space-y-2">
              {basemaps.map(bm => (
                <button
                  key={bm.id}
                  onClick={() => onBasemapChange(bm.id)}
                  className={`w-full flex items-center space-x-3 space-x-reverse p-2 rounded text-sm ${
                    basemap === bm.id 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {bm.icon}
                  <span>{bm.name}</span>
                  {bm.id === 'satellite' && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      satelliteEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {satelliteEnabled ? 'مفعل' : 'غير مفعل'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Water Layers Section */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => toggleSection('water')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <Droplet className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900">الطبقات المائية</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {waterLayers.length}
              </span>
            </div>
            {expandedSections.water ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </button>

          {expandedSections.water && (
            <div className="mt-3">
              {waterLayers.map(([layerId, layer], index) => (
                <LayerItem
                  key={layerId}
                  layerId={layerId}
                  layer={layer}
                  showDivider={index < waterLayers.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Administrative Layers Section */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('administrative')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <Building className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-900">الطبقات الإدارية</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                {administrativeLayers.length}
              </span>
            </div>
            {expandedSections.administrative ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </button>

          {expandedSections.administrative && (
            <div className="mt-3">
              {administrativeLayers.map(([layerId, layer], index) => (
                <LayerItem
                  key={layerId}
                  layerId={layerId}
                  layer={layer}
                  showDivider={index < administrativeLayers.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>إجمالي الطبقات: {Object.keys(layers).length}</span>
          <span>
            المفعلة: {Object.values(layers).filter(l => l.visible).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LayerControlPanel;
