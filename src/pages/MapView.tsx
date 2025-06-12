import  { useEffect, useRef, useState } from 'react';
import { Search, Filter, Target } from 'lucide-react';
import '../styles/MapView.css';
import {
  initializeMap,
  searchFeatures,
  toggleLayerVisibility,
  zoomToFeature,
  toggleSatelliteLayer,
  changeBasemap,
  setLayerOpacity,
  applyLayerQuery,
  getLayerFields,
  getLayerFeatureCount,
  FeatureClickInfo,
  getMapInstance
} from '../services/mapService';
import QueryBuilder from '../components/QueryBuilder';
import FeatureInfoPanel from '../components/FeatureInfoPanel';
import LayerControlPanel from '../components/LayerControlPanel';
import SpatialQueryBuilder from '../components/SpatialQueryBuilder';

interface SearchResult {
  id: string | number;
  name: string;
  type: string;
  coordinates: number[];
  attributes: Record<string, any>;
}

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);

  const [selectedLayers, setSelectedLayers] = useState({
    waterBodies: true,
    waterLines: true,
    governorates: true,
    districts: false,
    subdistricts: false,
    villages: false
  });

  // New state for enhanced features
  const [satelliteEnabled, setSatelliteEnabled] = useState(false);
  const [currentBasemap, setCurrentBasemap] = useState('streets');
  const [isQueryBuilderOpen, setIsQueryBuilderOpen] = useState(false);
  const [selectedQueryLayer, setSelectedQueryLayer] = useState('waterBodies');
  const [availableFields, setAvailableFields] = useState<{ [key: string]: string[] }>({});
  const [selectedFeature, setSelectedFeature] = useState<FeatureClickInfo | null>(null);
  const [isFeatureInfoOpen, setIsFeatureInfoOpen] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('جاري تحميل الخريطة...');
  const [isSpatialQueryOpen, setIsSpatialQueryOpen] = useState(false);
  const [spatialQueryResults, setSpatialQueryResults] = useState<any>(null);

  // Layer information for enhanced control panel
  const [layerInfo, setLayerInfo] = useState({
    waterBodies: {
      id: 'waterBodies',
      name: 'المسطحات المائية',
      visible: true,
      opacity: 1,
      type: 'vector' as const,
      icon: <Search className="w-4 h-4" />,
      color: '#0070f3',
      featureCount: 0
    },
    waterLines: {
      id: 'waterLines',
      name: 'المجاري المائية',
      visible: true,
      opacity: 1,
      type: 'vector' as const,
      icon: <Search className="w-4 h-4" />,
      color: '#0070f3',
      featureCount: 0
    },
    governorates: {
      id: 'governorates',
      name: 'المحافظات',
      visible: true,
      opacity: 1,
      type: 'vector' as const,
      icon: <Search className="w-4 h-4" />,
      color: '#8B5CF6', // بنفسجي جميل للمحافظات
      featureCount: 0
    },
    districts: {
      id: 'districts',
      name: 'المناطق',
      visible: false,
      opacity: 1,
      type: 'vector' as const,
      icon: <Search className="w-4 h-4" />,
      color: '#06B6D4', // أزرق فيروزي للمناطق
      featureCount: 0
    },
    subdistricts: {
      id: 'subdistricts',
      name: 'النواحي',
      visible: false,
      opacity: 1,
      type: 'vector' as const,
      icon: <Search className="w-4 h-4" />,
      color: '#10B981', // أخضر زمردي للنواحي
      featureCount: 0
    },
    villages: {
      id: 'villages',
      name: 'القرى',
      visible: false,
      opacity: 1,
      type: 'vector' as const,
      icon: <Search className="w-4 h-4" />,
      color: '#F59E0B', // برتقالي ذهبي للقرى
      featureCount: 0
    }
  });

  // Initialize map
  useEffect(() => {
    if (mapRef.current) {
      const initMap = async () => {
        try {
          setLoadingMessage('جاري تهيئة الخريطة...');
          await initializeMap(mapRef.current!, handleFeatureClick);

          setLoadingMessage('جاري تحميل معلومات الطبقات...');
          // Load field information for all layers
          const fieldPromises = Object.keys(layerInfo).map(async (layerName) => {
            const fields = await getLayerFields(layerName);
            const count = await getLayerFeatureCount(layerName);
            return { layerName, fields, count };
          });

          const fieldResults = await Promise.all(fieldPromises);
          const newAvailableFields: { [key: string]: string[] } = {};
          const newLayerInfo = { ...layerInfo };

          fieldResults.forEach(({ layerName, fields, count }) => {
            newAvailableFields[layerName] = fields;
            if (newLayerInfo[layerName as keyof typeof newLayerInfo]) {
              newLayerInfo[layerName as keyof typeof newLayerInfo].featureCount = count;
            }
          });

          setAvailableFields(newAvailableFields);
          setLayerInfo(newLayerInfo);
          setLoadingMessage('تم تحميل الخريطة بنجاح!');

          // Hide loading after a short delay
          setTimeout(() => {
            setIsMapLoading(false);
          }, 1000);
        } catch (error) {
          console.error("Error initializing map:", error);
          setLoadingMessage('حدث خطأ في تحميل الخريطة');
          setTimeout(() => {
            setIsMapLoading(false);
          }, 2000);
        }
      };

      initMap();
    }
  }, []);

  // Handle feature click
  const handleFeatureClick = (feature: FeatureClickInfo) => {
    setSelectedFeature(feature);
    setIsFeatureInfoOpen(true);
  };

  // Handle layer visibility changes
  const handleLayerToggle = (layerName: keyof typeof selectedLayers) => {
    setSelectedLayers(prev => {
      const newState = { ...prev, [layerName]: !prev[layerName] };
      toggleLayerVisibility(layerName, newState[layerName]);

      // Update layer info
      setLayerInfo(prevInfo => ({
        ...prevInfo,
        [layerName]: {
          ...prevInfo[layerName as keyof typeof prevInfo],
          visible: newState[layerName]
        }
      }));

      return newState;
    });
  };

  // Handle satellite toggle
  const handleSatelliteToggle = () => {
    const newState = !satelliteEnabled;
    setSatelliteEnabled(newState);
    toggleSatelliteLayer(newState);
    if (newState) {
      setCurrentBasemap('satellite');
    } else {
      setCurrentBasemap('streets');
    }
  };

  // Handle basemap change
  const handleBasemapChange = (basemapId: string) => {
    setCurrentBasemap(basemapId);
    changeBasemap(basemapId);
    setSatelliteEnabled(basemapId === 'satellite');
  };

  // Handle opacity change
  const handleOpacityChange = (layerId: string, opacity: number) => {
    setLayerOpacity(layerId, opacity);
    setLayerInfo(prevInfo => ({
      ...prevInfo,
      [layerId]: {
        ...prevInfo[layerId as keyof typeof prevInfo],
        opacity
      }
    }));
  };

  // Handle query builder
  const handleQueryBuilder = (layerId: string) => {
    setSelectedQueryLayer(layerId);
    setIsQueryBuilderOpen(true);
  };

  // Handle apply query
  const handleApplyQuery = async (query: string) => {
    try {
      await applyLayerQuery(selectedQueryLayer, query);
    } catch (error) {
      console.error("Error applying query:", error);
    }
  };

  // Handle spatial query results
  const handleSpatialQueryResults = (results: any) => {
    setSpatialQueryResults(results);
    console.log('نتائج التحليل المكاني:', results);
  };

  // Handle zoom to area from spatial query
  const handleZoomToArea = (coordinates: number[], zoom: number = 8) => {
    const mapInstance = getMapInstance();
    if (mapInstance?.view) {
      mapInstance.view.goTo({
        center: coordinates,
        zoom: zoom
      });
    }
  };



  return (
    <div className="map-container">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full"></div>

      {/* Loading Screen */}
      {isMapLoading && (
        <div className="loading-screen absolute inset-0 flex items-center justify-center z-50">
          <div className="loading-content text-center" dir="rtl">
            <div className="loading-spinner mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">نظام المعلومات الجغرافية للمياه السورية</h2>
            <p className="text-gray-600 mb-6">{loadingMessage}</p>
            <div className="w-80 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="progress-bar h-3 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">يرجى الانتظار...</p>
          </div>
        </div>
      )}

      {/* Control Buttons - Query Tools Only */}
      <div className="absolute top-4 right-4 flex flex-col space-y-3 z-10">
        {/* Query Builder Button */}
        <button
          onClick={() => setIsQueryBuilderOpen(true)}
          className={`control-button p-3 rounded-full ${isQueryBuilderOpen ? 'active' : ''}`}
          data-tooltip="منشئ الاستعلامات المركبة"
        >
          <Filter size={24} />
        </button>

        {/* Spatial Query Button */}
        <button
          onClick={() => setIsSpatialQueryOpen(true)}
          className={`control-button p-3 rounded-full ${isSpatialQueryOpen ? 'active' : ''}`}
          data-tooltip="التحليل المكاني للمياه"
        >
          <Target size={24} />
        </button>
      </div>

      {/* Enhanced Layer Control Panel */}
      <LayerControlPanel
        isOpen={isLayerPanelOpen}
        onClose={() => setIsLayerPanelOpen(false)}
        layers={layerInfo}
        onLayerToggle={handleLayerToggle}
        onOpacityChange={handleOpacityChange}
        onQueryBuilder={handleQueryBuilder}
        satelliteEnabled={satelliteEnabled}
        onSatelliteToggle={handleSatelliteToggle}
        basemap={currentBasemap}
        onBasemapChange={handleBasemapChange}
      />

      {/* Query Builder */}
      <QueryBuilder
        isOpen={isQueryBuilderOpen}
        onClose={() => setIsQueryBuilderOpen(false)}
        onApplyQuery={handleApplyQuery}
        availableFields={availableFields}
        selectedLayer={selectedQueryLayer}
        onLayerChange={setSelectedQueryLayer}
      />

      {/* Feature Information Panel */}
      <FeatureInfoPanel
        feature={selectedFeature}
        isOpen={isFeatureInfoOpen}
        onClose={() => setIsFeatureInfoOpen(false)}
        onZoomTo={zoomToFeature}
      />

      {/* Spatial Query Builder */}
      <SpatialQueryBuilder
        isOpen={isSpatialQueryOpen}
        onClose={() => setIsSpatialQueryOpen(false)}
        onResultsReady={handleSpatialQueryResults}
        onZoomToArea={handleZoomToArea}
      />
    </div>
  );
};

export default MapView;
 