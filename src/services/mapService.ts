import  Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import esriConfig from "@arcgis/core/config";
import { loadModules } from 'esri-loader';
import PortalItem from "@arcgis/core/portal/PortalItem";
import WebMap from "@arcgis/core/WebMap";
import LayerList from "@arcgis/core/widgets/LayerList";
import Legend from "@arcgis/core/widgets/Legend";

// Configure ArcGIS API
esriConfig.apiKey = ""; // You can set your API key here if needed

export interface WaterBody {
  id: string;
  name: string;
  type: string;
  area: string;
  geometry: any;
  attributes: Record<string, any>;
}

export interface MapInstance {
  map: Map;
  view: MapView;
  waterBodiesLayer?: FeatureLayer | GeoJSONLayer;
  waterLinesLayer?: FeatureLayer | GeoJSONLayer;
  governoratesLayer?: FeatureLayer | GeoJSONLayer;
  districtsLayer?: FeatureLayer | GeoJSONLayer;
  subdistrictsLayer?: FeatureLayer | GeoJSONLayer;
  villagesLayer?: FeatureLayer | GeoJSONLayer;
  satelliteLayer?: any;
  clickHandler?: any;
}

export interface FeatureClickInfo {
  id: string | number;
  name: string;
  type: string;
  layerName: string;
  attributes: Record<string, any>;
  geometry?: any;
}

let mapInstance: MapInstance | null = null;

// Export mapInstance for external access
export const getMapInstance = (): MapInstance | null => mapInstance;

// دالة للحصول على القيم الفريدة لحقل معين
export const getUniqueFieldValues = async (layerName: string, fieldName: string): Promise<string[]> => {
  if (!mapInstance) return [];

  let layer: any = null;
  switch (layerName) {
    case 'waterBodies':
      layer = mapInstance.waterBodiesLayer;
      break;
    case 'waterLines':
      layer = mapInstance.waterLinesLayer;
      break;
    case 'governorates':
      layer = mapInstance.governoratesLayer;
      break;
    case 'districts':
      layer = mapInstance.districtsLayer;
      break;
    case 'subdistricts':
      layer = mapInstance.subdistrictsLayer;
      break;
    case 'villages':
      layer = mapInstance.villagesLayer;
      break;
  }

  if (!layer) return [];

  try {
    const query = layer.createQuery();
    query.where = '1=1';
    query.outFields = [fieldName];
    query.returnDistinctValues = true;
    query.orderByFields = [fieldName];

    const results = await layer.queryFeatures(query);

    const uniqueValues = results.features
      .map((feature: any) => feature.attributes[fieldName])
      .filter((value: any) => value !== null && value !== undefined && value !== '')
      .map((value: any) => String(value))
      .sort();

    // إزالة القيم المكررة
    return [...new Set(uniqueValues)];
  } catch (error) {
    console.error(`Error getting unique values for ${fieldName} in ${layerName}:`, error);
    return [];
  }
};

// Helper function to get layer name from title
const getLayerNameFromTitle = (title: string): string => {
  const titleMap: Record<string, string> = {
    'المحافظات السورية': 'governorates',
    'المناطق السورية': 'districts',
    'النواحي السورية': 'subdistricts',
    'القرى السورية': 'villages',
    'المجاري المائية': 'waterLines',
    'المسطحات المائية': 'waterBodies'
  };
  return titleMap[title] || 'unknown';
};

// Function to transform UTM coordinates to WGS84
const transformUTMToWGS84 = (x: number, y: number, zone: number = 37): [number, number] => {
  // Simple approximation for UTM Zone 37N to WGS84 transformation
  // This is a basic conversion - for production use, consider using proj4js library

  // UTM Zone 37N parameters
  const centralMeridian = (zone - 1) * 6 - 180 + 3; // 39° for zone 37
  const falseEasting = 500000;
  const falseNorthing = 0; // Northern hemisphere

  // Remove false easting
  const adjustedX = x - falseEasting;

  // Basic conversion (simplified)
  const lon = centralMeridian + (adjustedX / 111320); // Approximate meters per degree at equator
  const lat = y / 110540; // Approximate meters per degree latitude

  // Clamp to reasonable bounds for Syria region
  const clampedLon = Math.max(35, Math.min(43, lon));
  const clampedLat = Math.max(32, Math.min(38, lat));

  return [clampedLon, clampedLat];
};

// Function to transform coordinates in a geometry
const transformGeometry = (geometry: any, needsTransform: boolean): any => {
  if (!needsTransform) return geometry;

  const transformCoordinate = (coord: number[]): number[] => {
    if (coord.length >= 2) {
      const [lon, lat] = transformUTMToWGS84(coord[0], coord[1]);
      return [lon, lat, ...(coord.slice(2))]; // Preserve any additional dimensions
    }
    return coord;
  };

  const transformCoordinates = (coords: any): any => {
    if (Array.isArray(coords[0])) {
      return coords.map(transformCoordinates);
    } else {
      return transformCoordinate(coords);
    }
  };

  return {
    ...geometry,
    coordinates: transformCoordinates(geometry.coordinates)
  };
};

// Function to fetch and clean GeoJSON data
const fetchAndCleanGeoJSON = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const geojsonData = await response.json();

    // Check if this data needs coordinate transformation
    let needsTransform = false;
    if (geojsonData.crs) {
      const crsName = geojsonData.crs.properties?.name;
      if (crsName && crsName.includes('EPSG::32637')) {
        needsTransform = true;
        console.warn(`Transforming coordinates from UTM Zone 37N to WGS84 for ${url}`);
      }
      console.warn(`Removing unsupported CRS property from ${url}:`, geojsonData.crs);
      delete geojsonData.crs;
    }

    // Remove bbox if present as it might be in wrong coordinate system
    if (geojsonData.bbox) {
      delete geojsonData.bbox;
    }

    // Transform coordinates if needed
    if (needsTransform && geojsonData.features) {
      console.log(`Transforming ${geojsonData.features.length} features from UTM to WGS84`);
      geojsonData.features = geojsonData.features.map((feature: any) => ({
        ...feature,
        geometry: transformGeometry(feature.geometry, true)
      }));
      console.log(`Transformation complete for ${url}`);
    }

    return geojsonData;
  } catch (error) {
    console.error(`Error fetching GeoJSON from ${url}:`, error);
    throw error;
  }
};

// Function to create a layer from local data
const createLayerFromLocal = async (title: string, url: string, visible: boolean = true) => {
  // For GeoJSON files
  if (url.endsWith('.geojson') || url.endsWith('.json')) {
    try {
      // Fetch and transform the data first
      const transformedData = await fetchAndCleanGeoJSON(url);

      // Create a blob URL for the transformed data
      const blob = new Blob([JSON.stringify(transformedData)], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);

      const layer = new GeoJSONLayer({
        title,
        url: blobUrl,
        visible,
        outFields: ["*"],
        popupEnabled: false,
        refreshInterval: 0,
        maxRecordCount: 1000
      });

      // Clean up the blob URL after the layer loads
      layer.when(() => {
        URL.revokeObjectURL(blobUrl);
      }).catch((error) => {
        URL.revokeObjectURL(blobUrl);
        console.error(`Error loading layer ${title}:`, error);
      });

      return layer;
    } catch (error) {
      console.error(`Error preparing layer ${title}:`, error);
      // Fallback to original URL if transformation fails
      return new GeoJSONLayer({
        title,
        url,
        visible,
        outFields: ["*"],
        popupEnabled: false,
        refreshInterval: 0,
        maxRecordCount: 1000
      });
    }
  }

  // For Shapefile or other formats - use FeatureLayer
  return new FeatureLayer({
    title,
    url,
    visible,
    outFields: ["*"],
    popupEnabled: false
  });
};

export const initializeMap = async (container: HTMLDivElement, onFeatureClick?: (feature: FeatureClickInfo) => void): Promise<MapInstance> => {
  try {
    // Load ArcGIS modules
    await loadModules(['esri/config'], { css: true });

    // Configure ArcGIS API
    esriConfig.request.useIdentity = false;

    const map = new Map({
      basemap: "streets" // Start with streets, satellite will be disabled by default
    });
    
    const view = new MapView({
      container,
      map,
      center: [38.996815, 34.802075], // Syria approximate center
      zoom: 7
    });
    
    // Path to the layers directory
    const layersPath = "/data/";
    
    // Create layers from local files with error handling
    const createLayer = async (title: string, url: string, visible: boolean = true) => {
      try {
        const layer = await createLayerFromLocal(title, url, visible);
        await layer.load();
        console.log(`Successfully loaded layer: ${title}`);
        return layer;
      } catch (error) {
        console.error(`Error loading layer ${title}:`, error);

        // Provide specific guidance for common errors
        if (error.name === 'geojson:unsupported-crs') {
          console.error(`CRS Error: ${title} contains coordinate data in an unsupported coordinate system.`);
          console.error('Solution: Convert the GeoJSON data to WGS84 (EPSG:4326) coordinates.');
        } else if (error.message?.includes('fetch')) {
          console.error(`Network Error: Could not fetch ${url}. Check if the file exists and is accessible.`);
        }

        return null;
      }
    };
    
    // Create layers
    const [
      governoratesLayer,
      districtsLayer,
      subdistrictsLayer,
      villagesLayer,
      waterLinesLayer,
      waterBodiesLayer
    ] = await Promise.all([
      createLayer("المحافظات السورية", `${layersPath}governorates.geojson`, true),
      createLayer("المناطق السورية", `${layersPath}districts.geojson`, false),
      createLayer("النواحي السورية", `${layersPath}subdistricts.geojson`, false),
      createLayer("القرى السورية", `${layersPath}villages.geojson`, false),
      createLayer("المجاري المائية", `${layersPath}water_lines.geojson`, true),
      createLayer("المسطحات المائية", `${layersPath}water_bodies.geojson`, true)
    ]);
    
    // Configure water lines layer renderer - أزرق مائي جذاب
    if (waterLinesLayer instanceof GeoJSONLayer) {
      waterLinesLayer.renderer = {
        type: "simple",
        symbol: {
          type: "simple-line",
          color: [59, 130, 246, 0.9],  // أزرق مائي جذاب
          width: 3,
          style: "solid",
          cap: "round",
          join: "round"
        }
      };
    }

    // Configure water bodies layer renderer
    if (waterBodiesLayer instanceof GeoJSONLayer) {
      waterBodiesLayer.renderer = {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color: [0, 112, 255, 0.4],  // Semi-transparent blue
          outline: {
            color: [0, 112, 255, 0.8],  // Solid blue outline
            width: 1
          }
        }
      };
    }

    // Configure governorates layer renderer - بنفسجي جميل
    if (governoratesLayer instanceof GeoJSONLayer) {
      governoratesLayer.renderer = {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color: [139, 92, 246, 0.35],  // بنفسجي شفاف للمحافظات
          outline: {
            color: [109, 40, 217, 1],  // بنفسجي غامق أكثر للحدود
            width: 2.5
          }
        }
      };
    }

    // Configure districts layer renderer - أزرق فيروزي
    if (districtsLayer instanceof GeoJSONLayer) {
      districtsLayer.renderer = {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color: [6, 182, 212, 0.3],  // أزرق فيروزي شفاف للمناطق
          outline: {
            color: [8, 145, 178, 1],  // أزرق فيروزي غامق أكثر للحدود
            width: 2
          }
        }
      };
    }

    // Configure subdistricts layer renderer - أخضر زمردي
    if (subdistrictsLayer instanceof GeoJSONLayer) {
      subdistrictsLayer.renderer = {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color: [16, 185, 129, 0.25],  // أخضر زمردي شفاف للنواحي
          outline: {
            color: [5, 150, 105, 1],  // أخضر زمردي غامق أكثر للحدود
            width: 1.5
          }
        }
      };
    }

    // Configure villages layer renderer - مضلعات برتقالية ذهبية
    if (villagesLayer instanceof GeoJSONLayer) {
      villagesLayer.renderer = {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color: [245, 158, 11, 0.4],  // برتقالي ذهبي شفاف للقرى
          outline: {
            color: [245, 158, 11, 0.9],  // حدود برتقالية
            width: 2
          }
        }
      };

      // إضافة تسميات للقرى من العمود KURA
      villagesLayer.labelingInfo = [{
        symbol: {
          type: "text",
          color: [139, 69, 19, 1],  // لون بني للنص
          font: {
            family: "Arial",
            size: 14,  // تكبير الخط من 10 إلى 14
            weight: "bold"
          },
          haloColor: [255, 255, 255, 0.9],
          haloSize: 2  // زيادة حجم الهالة للوضوح
        },
        labelPlacement: "center-center",
        labelExpression: "[KURA]",  // استخدام العمود KURA للتسمية
        minScale: 500000,  // إظهار التسميات عند التكبير
        maxScale: 0
      }];
    }
    
    // Add the layers to the map in proper order
    if (governoratesLayer) map.add(governoratesLayer);
    if (districtsLayer) map.add(districtsLayer);
    if (subdistrictsLayer) map.add(subdistrictsLayer);
    if (villagesLayer) map.add(villagesLayer);
    if (waterLinesLayer) map.add(waterLinesLayer);
    if (waterBodiesLayer) map.add(waterBodiesLayer);

    // Add click handler for feature information
    let clickHandler: any = null;
    if (onFeatureClick) {
      clickHandler = view.on("click", async (event) => {
        try {
          const response = await view.hitTest(event);
          if (response.results.length > 0) {
            const graphic = response.results[0].graphic;
            if (graphic && graphic.layer) {
              const layerName = getLayerNameFromTitle(graphic.layer.title);

              // الحصول على الاسم الصحيح حسب نوع الطبقة
              let featureName = 'بدون اسم';
              if (layerName === 'villages') {
                featureName = graphic.attributes.KURA || graphic.attributes.NAME || 'قرية غير معروفة';
              } else {
                featureName = graphic.attributes.Name || graphic.attributes.NAME_1 || graphic.attributes.NAME || graphic.attributes.name || 'بدون اسم';
              }

              const featureInfo: FeatureClickInfo = {
                id: graphic.attributes.OBJECTID || graphic.attributes.FID || graphic.attributes.ID || 'unknown',
                name: featureName,
                type: graphic.attributes.Type || graphic.attributes.TYPE || graphic.attributes.type || 'غير محدد',
                layerName: layerName,
                attributes: graphic.attributes,
                geometry: graphic.geometry
              };
              onFeatureClick(featureInfo);
            }
          }
        } catch (error) {
          console.error("Error handling feature click:", error);
        }
      });
    }
    
    // Add LayerList widget
    const layerList = new LayerList({
      view,
      listItemCreatedFunction: (event) => {
        const item = event.item;
        if (item.layer.type === "feature") {
          item.panel = {
            content: "legend",
            open: true
          };
        }
      }
    });
    
    view.ui.add(layerList, "top-right");
    
    // Add Legend widget
    const legend = new Legend({
      view
    });
    
    view.ui.add(legend, "bottom-right");
    
    mapInstance = {
      map,
      view,
      waterBodiesLayer,
      waterLinesLayer,
      governoratesLayer,
      districtsLayer,
      subdistrictsLayer,
      villagesLayer,
      clickHandler
    };

    return mapInstance;
  } catch (error) {
    console.error("Error initializing map:", error);
    throw error;
  }
};

export const toggleLayerVisibility = (layerName: string, visible: boolean): void => {
  if (!mapInstance) return;
  
  switch (layerName) {
    case 'waterBodies':
      if (mapInstance.waterBodiesLayer) mapInstance.waterBodiesLayer.visible = visible;
      break;
    case 'waterLines':
      if (mapInstance.waterLinesLayer) mapInstance.waterLinesLayer.visible = visible;
      break;
    case 'governorates':
      if (mapInstance.governoratesLayer) mapInstance.governoratesLayer.visible = visible;
      break;
    case 'districts':
      if (mapInstance.districtsLayer) mapInstance.districtsLayer.visible = visible;
      break;
    case 'subdistricts':
      if (mapInstance.subdistrictsLayer) mapInstance.subdistrictsLayer.visible = visible;
      break;
    case 'villages':
      if (mapInstance.villagesLayer) mapInstance.villagesLayer.visible = visible;
      break;
    default:
      break;
  }
};

export const searchFeatures = async (query: string, layerNames: string[]): Promise<any[]> => {
  if (!mapInstance) return [];
  
  try {
    const results: any[] = [];
    
    // Create a query for each layer
    for (const layerName of layerNames) {
      let layer: FeatureLayer | GeoJSONLayer | undefined;
      
      switch (layerName) {
        case 'waterBodies':
          layer = mapInstance.waterBodiesLayer;
          break;
        case 'governorates':
          layer = mapInstance.governoratesLayer;
          break;
        case 'districts':
          layer = mapInstance.districtsLayer;
          break;
        case 'subdistricts':
          layer = mapInstance.subdistrictsLayer;
          break;
        case 'villages':
          layer = mapInstance.villagesLayer;
          break;
        default:
          continue;
      }
      
      if (!layer) continue;
      
      // If layer has a valid query method
      if (layer.queryFeatures) {
        // Create a query that searches for the input string
        const queryParams = {
          where: `Name LIKE '%${query}%'`,
          outFields: ["*"],
          returnGeometry: true
        };
        
        try {
          const featureSet = await layer.queryFeatures(queryParams);
          
          // Convert the features to a simpler format
          featureSet.features.forEach(feature => {
            results.push({
              id: feature.attributes.OBJECTID || feature.attributes.FID || results.length + 1,
              name: feature.attributes.Name || feature.attributes.NAME || feature.attributes.name || "بدون اسم",
              type: layerName,
              coordinates: [feature.geometry.centroid.longitude, feature.geometry.centroid.latitude],
              attributes: feature.attributes
            });
          });
        } catch (error) {
          console.error(`Error querying ${layerName}:`, error);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error searching features:", error);
    return [];
  }
};

export const zoomToFeature = (coordinates: number[]): void => {
  if (!mapInstance) return;
  
  mapInstance.view.goTo({
    center: coordinates,
    zoom: 10
  });
};

export const getWaterBodies = async (): Promise<WaterBody[]> => {
  if (!mapInstance || !mapInstance.waterBodiesLayer) {
    return getMockWaterBodies();
  }
  
  try {
    // Query all features from the water bodies layer
    const queryParams = {
      where: "1=1",  // Get all features
      outFields: ["*"],
      returnGeometry: true
    };
    
    // @ts-ignore - TypeScript may not recognize queryFeatures method
    const featureSet = await mapInstance.waterBodiesLayer.queryFeatures(queryParams);
    
    // Convert the features to WaterBody objects
    return featureSet.features.map((feature: any) => {
      return {
        id: feature.attributes.OBJECTID || feature.attributes.FID || feature.attributes.ID || feature.uid,
        name: feature.attributes.Name || feature.attributes.NAME || feature.attributes.name || "بدون اسم",
        type: feature.attributes.Type || feature.attributes.TYPE || feature.attributes.type || "مسطح مائي",
        area: feature.attributes.Area || feature.attributes.AREA || "غير محدد",
        geometry: feature.geometry,
        attributes: feature.attributes
      };
    });
  } catch (error) {
    console.error("Error getting water bodies:", error);
    return getMockWaterBodies();
  }
};

export const getWaterBodyById = async (id: string): Promise<WaterBody | null> => {
  const waterBodies = await getWaterBodies();
  return waterBodies.find(wb => wb.id.toString() === id) || null;
};

export const getWaterQualityData = async (waterBodyId: string): Promise<any> => {
  // Mock data for water quality
  const mockQualityData: Record<string, any> = {
    euphrates: {
      pollutionTrend: [
        { year: 2000, value: 25 },
        { year: 2005, value: 30 },
        { year: 2010, value: 40 },
        { year: 2015, value: 45 },
        { year: 2020, value: 42 },
        { year: 2023, value: 38 }
      ],
      chemicalComponents: {
        dissolved_oxygen: 7.2,
        ph: 7.8,
        nitrates: 15,
        phosphates: 0.8,
        turbidity: 25
      },
      usageRatings: {
        drinking: "غير صالح",
        irrigation: "صالح",
        industrial: "صالح",
        fishing: "صالح بشروط",
        recreation: "صالح"
      }
    },
    asad: {
      pollutionTrend: [
        { year: 2000, value: 15 },
        { year: 2005, value: 18 },
        { year: 2010, value: 22 },
        { year: 2015, value: 28 },
        { year: 2020, value: 30 },
        { year: 2023, value: 25 }
      ],
      chemicalComponents: {
        dissolved_oxygen: 8.5,
        ph: 7.6,
        nitrates: 8,
        phosphates: 0.4,
        turbidity: 15
      },
      usageRatings: {
        drinking: "صالح بعد المعالجة",
        irrigation: "صالح",
        industrial: "صالح",
        fishing: "صالح",
        recreation: "صالح"
      }
    }
  };
  
  // Return data for the requested water body, or default data if not found
  return mockQualityData[waterBodyId] || mockQualityData.euphrates;
};

export const getWaterStatisticsData = async (waterBodyId: string): Promise<any> => {
  // Mock data for water statistics
  const mockStatisticsData: Record<string, any> = {
    euphrates: {
      surfaceAreaTrend: [
        { year: 2000, value: 100 },
        { year: 2005, value: 98 },
        { year: 2010, value: 95 },
        { year: 2015, value: 92 },
        { year: 2020, value: 90 },
        { year: 2023, value: 88 }
      ],
      volumeTrend: [
        { year: 2000, value: 100 },
        { year: 2005, value: 95 },
        { year: 2010, value: 90 },
        { year: 2015, value: 85 },
        { year: 2020, value: 80 },
        { year: 2023, value: 75 }
      ],
      boundaryChanges: {
        periods: ["2000-2005", "2005-2010", "2010-2015", "2015-2020", "2020-2023"],
        changes: [-2, -3, -3, -2, -2]
      }
    },
    asad: {
      surfaceAreaTrend: [
        { year: 2000, value: 100 },
        { year: 2005, value: 95 },
        { year: 2010, value: 90 },
        { year: 2015, value: 85 },
        { year: 2020, value: 80 },
        { year: 2023, value: 78 }
      ],
      volumeTrend: [
        { year: 2000, value: 100 },
        { year: 2005, value: 90 },
        { year: 2010, value: 85 },
        { year: 2015, value: 80 },
        { year: 2020, value: 75 },
        { year: 2023, value: 70 }
      ],
      boundaryChanges: {
        periods: ["2000-2005", "2005-2010", "2010-2015", "2015-2020", "2020-2023"],
        changes: [-5, -5, -5, -5, -2]
      }
    }
  };
  
  // Return data for the requested water body, or default data if not found
  return mockStatisticsData[waterBodyId] || mockStatisticsData.euphrates;
};

// New analysis functions for villages and water bodies
export const getVillageWaterAnalysis = async (): Promise<any> => {
  // Mock data for village water analysis
  return {
    totalVillages: 2847,
    villagesWithWaterAccess: 2156,
    villagesWithoutWaterAccess: 691,
    distanceDistribution: [
      { category: "أقل من 1 كم", value: 1245 },
      { category: "1-3 كم", value: 911 },
      { category: "3-5 كم", value: 456 },
      { category: "5-10 كم", value: 178 },
      { category: "أكثر من 10 كم", value: 57 }
    ],
    villagesByWaterType: [
      { waterType: "نهر", count: 1456, percentage: 51.2 },
      { waterType: "بحيرة", count: 567, percentage: 19.9 },
      { waterType: "خزان", count: 423, percentage: 14.9 },
      { waterType: "بئر", count: 289, percentage: 10.1 },
      { waterType: "عين", count: 112, percentage: 3.9 }
    ]
  };
};

export const getRegionalWaterDistribution = async (): Promise<any> => {
  // Mock data for regional water distribution
  return {
    waterBodiesByGovernorate: [
      { category: "حلب", value: 145 },
      { category: "دمشق", value: 89 },
      { category: "حمص", value: 134 },
      { category: "حماة", value: 112 },
      { category: "اللاذقية", value: 78 },
      { category: "طرطوس", value: 67 },
      { category: "إدلب", value: 95 },
      { category: "الحسكة", value: 156 },
      { category: "دير الزور", value: 123 },
      { category: "الرقة", value: 87 },
      { category: "درعا", value: 56 },
      { category: "السويداء", value: 34 },
      { category: "القنيطرة", value: 23 },
      { category: "ريف دمشق", value: 98 }
    ],
    waterDensityByRegion: [
      { region: "الشمال", density: 12.4 },
      { region: "الشمال الشرقي", density: 15.8 },
      { region: "الوسط", density: 9.7 },
      { region: "الساحل", density: 18.2 },
      { region: "الجنوب", density: 6.3 },
      { region: "الشرق", density: 8.9 }
    ],
    largestWaterBodiesByGovernorate: [
      { governorate: "حلب", waterBodyName: "بحيرة الأسد", type: "بحيرة", area: "610 كم²" },
      { governorate: "حمص", waterBodyName: "بحيرة قطينة", type: "بحيرة", area: "60 كم²" },
      { governorate: "الحسكة", waterBodyName: "نهر الخابور", type: "نهر", area: "320 كم طولي" },
      { governorate: "دير الزور", waterBodyName: "نهر الفرات", type: "نهر", area: "675 كم طولي" },
      { governorate: "اللاذقية", waterBodyName: "نهر الكبير الشمالي", type: "نهر", area: "89 كم طولي" },
      { governorate: "طرطوس", waterBodyName: "نهر الأبرش", type: "نهر", area: "45 كم طولي" }
    ]
  };
};

export const getWaterAccessibilityAnalysis = async (): Promise<any> => {
  // Mock data for water accessibility analysis
  return {
    accessibilityLevels: {
      excellent: 1245, // < 1km
      good: 911,      // 1-3km
      moderate: 456,  // 3-5km
      poor: 235       // > 5km
    },
    averageDistanceByRegion: [
      { category: "الساحل", value: 1.8 },
      { category: "الشمال", value: 2.4 },
      { category: "الوسط", value: 3.1 },
      { category: "الشمال الشرقي", value: 2.9 },
      { category: "الجنوب", value: 4.2 },
      { category: "الشرق", value: 5.1 }
    ],
    mostIsolatedVillages: [
      { name: "قرية الصحراء الشرقية", region: "دير الزور", distance: 15.2, nearestWaterBody: "نهر الفرات" },
      { name: "قرية الجبل الأعلى", region: "السويداء", distance: 12.8, nearestWaterBody: "عين الماء" },
      { name: "قرية البادية الوسطى", region: "حمص", distance: 11.5, nearestWaterBody: "بحيرة قطينة" },
      { name: "قرية الهضبة الجنوبية", region: "درعا", distance: 10.9, nearestWaterBody: "نهر اليرموك" },
      { name: "قرية الصحراء الغربية", region: "ريف دمشق", distance: 9.7, nearestWaterBody: "عين الفيجة" }
    ]
  };
};

// Fallback function to get mock water bodies when real data can't be loaded
const getMockWaterBodies = (): WaterBody[] => {
  return [
    { 
      id: 'euphrates', 
      name: 'نهر الفرات', 
      type: 'نهر', 
      area: 'شمال شرق',
      geometry: null,
      attributes: {
        LENGTH_KM: 2800,
        FLOW_RATE: "510 م³/ث",
        AVERAGE_WIDTH: "350 م",
        DEPTH_RANGE: "8-20 م",
        WATER_QUALITY: "متوسطة",
        POLLUTION_LEVEL: "متوسط",
        ANNUAL_DISCHARGE: "31.8 مليار م³"
      }
    },
    { 
      id: 'tigris', 
      name: 'نهر دجلة', 
      type: 'نهر', 
      area: 'شمال شرق',
      geometry: null,
      attributes: {
        LENGTH_KM: 1850,
        FLOW_RATE: "520 م³/ث",
        AVERAGE_WIDTH: "300 م",
        DEPTH_RANGE: "8-15 م",
        WATER_QUALITY: "جيدة",
        POLLUTION_LEVEL: "منخفض",
        ANNUAL_DISCHARGE: "30 مليار م³"
      }
    },
    { 
      id: 'asad', 
      name: 'بحيرة الأسد', 
      type: 'بحيرة', 
      area: 'شمال',
      geometry: null,
      attributes: {
        AREA_KM2: 610,
        VOLUME: "11.7 مليار م³",
        MAX_DEPTH: "60 م",
        SHORELINE_LENGTH: "512 كم",
        WATER_QUALITY: "جيدة",
        POLLUTION_LEVEL: "منخفض",
        ANNUAL_EVAPORATION: "1.6 مليار م³"
      }
    },
    { 
      id: 'qattinah', 
      name: 'بحيرة قطينة', 
      type: 'بحيرة', 
      area: 'وسط',
      geometry: null,
      attributes: {
        AREA_KM2: 60,
        VOLUME: "200 مليون م³",
        MAX_DEPTH: "15 م",
        SHORELINE_LENGTH: "35 كم",
        WATER_QUALITY: "متوسطة",
        POLLUTION_LEVEL: "متوسط",
        ANNUAL_EVAPORATION: "48 مليون م³"
      }
    }
  ];
};

// New functions for enhanced map functionality

export const toggleSatelliteLayer = (enabled: boolean): void => {
  if (!mapInstance) return;

  if (enabled) {
    mapInstance.map.basemap = "satellite";
  } else {
    mapInstance.map.basemap = "streets";
  }
};

export const changeBasemap = (basemapId: string): void => {
  if (!mapInstance) return;

  const basemapMap: Record<string, string> = {
    'streets': 'streets',
    'satellite': 'satellite',
    'hybrid': 'hybrid',
    'topo': 'topo-vector',
    'gray': 'gray-vector'
  };

  const arcgisBasemap = basemapMap[basemapId] || 'streets';
  mapInstance.map.basemap = arcgisBasemap;
};

export const setLayerOpacity = (layerName: string, opacity: number): void => {
  if (!mapInstance) return;

  let layer: any = null;
  switch (layerName) {
    case 'waterBodies':
      layer = mapInstance.waterBodiesLayer;
      break;
    case 'waterLines':
      layer = mapInstance.waterLinesLayer;
      break;
    case 'governorates':
      layer = mapInstance.governoratesLayer;
      break;
    case 'districts':
      layer = mapInstance.districtsLayer;
      break;
    case 'subdistricts':
      layer = mapInstance.subdistrictsLayer;
      break;
    case 'villages':
      layer = mapInstance.villagesLayer;
      break;
  }

  if (layer) {
    layer.opacity = opacity;
  }
};

export const applyLayerQuery = async (layerName: string, whereClause: string): Promise<void> => {
  if (!mapInstance) return;

  let layer: any = null;
  switch (layerName) {
    case 'waterBodies':
      layer = mapInstance.waterBodiesLayer;
      break;
    case 'waterLines':
      layer = mapInstance.waterLinesLayer;
      break;
    case 'governorates':
      layer = mapInstance.governoratesLayer;
      break;
    case 'districts':
      layer = mapInstance.districtsLayer;
      break;
    case 'subdistricts':
      layer = mapInstance.subdistrictsLayer;
      break;
    case 'villages':
      layer = mapInstance.villagesLayer;
      break;
  }

  if (layer && layer.definitionExpression !== undefined) {
    layer.definitionExpression = whereClause;
  }
};

export const getLayerFields = async (layerName: string): Promise<string[]> => {
  if (!mapInstance) return [];

  let layer: any = null;
  switch (layerName) {
    case 'waterBodies':
      layer = mapInstance.waterBodiesLayer;
      break;
    case 'waterLines':
      layer = mapInstance.waterLinesLayer;
      break;
    case 'governorates':
      layer = mapInstance.governoratesLayer;
      break;
    case 'districts':
      layer = mapInstance.districtsLayer;
      break;
    case 'subdistricts':
      layer = mapInstance.subdistrictsLayer;
      break;
    case 'villages':
      layer = mapInstance.villagesLayer;
      break;
  }

  if (layer && layer.fields) {
    return layer.fields.map((field: any) => field.name);
  }

  // Return common field names as fallback
  return ['Name', 'TYPE', 'AREA', 'POPULATION', 'GOVERNORATE', 'DISTRICT'];
};

export const getLayerFeatureCount = async (layerName: string): Promise<number> => {
  if (!mapInstance) return 0;

  let layer: any = null;
  switch (layerName) {
    case 'waterBodies':
      layer = mapInstance.waterBodiesLayer;
      break;
    case 'waterLines':
      layer = mapInstance.waterLinesLayer;
      break;
    case 'governorates':
      layer = mapInstance.governoratesLayer;
      break;
    case 'districts':
      layer = mapInstance.districtsLayer;
      break;
    case 'subdistricts':
      layer = mapInstance.subdistrictsLayer;
      break;
    case 'villages':
      layer = mapInstance.villagesLayer;
      break;
  }

  if (layer && layer.queryFeatureCount) {
    try {
      const count = await layer.queryFeatureCount({ where: '1=1' });
      return count;
    } catch (error) {
      console.error(`Error getting feature count for ${layerName}:`, error);
    }
  }

  return 0;
};

export const zoomToLayer = (layerName: string): void => {
  if (!mapInstance) return;

  let layer: any = null;
  switch (layerName) {
    case 'waterBodies':
      layer = mapInstance.waterBodiesLayer;
      break;
    case 'waterLines':
      layer = mapInstance.waterLinesLayer;
      break;
    case 'governorates':
      layer = mapInstance.governoratesLayer;
      break;
    case 'districts':
      layer = mapInstance.districtsLayer;
      break;
    case 'subdistricts':
      layer = mapInstance.subdistrictsLayer;
      break;
    case 'villages':
      layer = mapInstance.villagesLayer;
      break;
  }

  if (layer && layer.fullExtent) {
    mapInstance.view.goTo(layer.fullExtent);
  }
};

// دالة مساعدة للحصول على الحقل الصحيح للمعرف
const getCorrectIdField = (layerName: string): string => {
  const fieldMap: { [key: string]: string } = {
    'governorates': 'NAME_1',
    'districts': 'NAME',
    'subdistricts': 'NAME',
    'villages': 'KURA',
    'waterBodies': 'NAME',
    'waterLines': 'NAME'
  };
  return fieldMap[layerName] || 'NAME_1';
};

// دالة مساعدة للحصول على الحقل الصحيح للاسم
const getCorrectNameField = (layerName: string): string => {
  const fieldMap: { [key: string]: string } = {
    'governorates': 'NAME_1',
    'districts': 'NAME',
    'subdistricts': 'NAME',
    'villages': 'KURA',
    'waterBodies': 'NAME',
    'waterLines': 'NAME'
  };
  return fieldMap[layerName] || 'NAME_1';
};

// دالة للحصول على اسم العنصر بناءً على نوع الطبقة
const getFeatureName = (attributes: any, layerName: string): string => {
  switch (layerName) {
    case 'governorates':
      return attributes.NAME_1 || attributes.NAME || 'محافظة غير معروفة';
    case 'districts':
      return attributes.NAME || attributes.NAME_1 || 'منطقة غير معروفة';
    case 'subdistricts':
      return attributes.NAME || attributes.NAME_1 || 'ناحية غير معروفة';
    case 'villages':
      return attributes.KURA || attributes.NAME || 'قرية غير معروفة';
    case 'waterBodies':
      return attributes.NAME || attributes.NAME_1 || 'مسطح مائي';
    case 'waterLines':
      return attributes.NAME || attributes.NAME_1 || 'مجرى مائي';
    default:
      return attributes.NAME_1 || attributes.NAME || attributes.KURA || 'بدون اسم';
  }
};

// دوال جديدة للتحليل المكاني
export const performSpatialQuery = async (
  administrativeLayerName: string,
  administrativeFeatureId: string,
  waterLayerNames: string[] = ['waterBodies', 'waterLines']
): Promise<any> => {
  if (!mapInstance) return null;

  try {
    // الحصول على الطبقة الإدارية
    let adminLayer: any = null;
    switch (administrativeLayerName) {
      case 'governorates':
        adminLayer = mapInstance.governoratesLayer;
        break;
      case 'districts':
        adminLayer = mapInstance.districtsLayer;
        break;
      case 'subdistricts':
        adminLayer = mapInstance.subdistrictsLayer;
        break;
      case 'villages':
        adminLayer = mapInstance.villagesLayer;
        break;
    }

    if (!adminLayer) return null;

    // البحث عن العنصر الإداري المحدد
    const adminQuery = adminLayer.createQuery();
    // استخدام الحقول الصحيحة بناءً على نوع الطبقة
    const idField = getCorrectIdField(administrativeLayerName);
    adminQuery.where = `${idField} = '${administrativeFeatureId}'`;
    const adminResults = await adminLayer.queryFeatures(adminQuery);

    if (adminResults.features.length === 0) return null;

    const adminFeature = adminResults.features[0];
    const adminGeometry = adminFeature.geometry;

    // البحث في الطبقات المائية
    const waterResults: any = {
      waterBodies: [],
      waterLines: []
    };

    for (const waterLayerName of waterLayerNames) {
      let waterLayer: any = null;
      switch (waterLayerName) {
        case 'waterBodies':
          waterLayer = mapInstance.waterBodiesLayer;
          break;
        case 'waterLines':
          waterLayer = mapInstance.waterLinesLayer;
          break;
      }

      if (waterLayer) {
        // إنشاء استعلام مكاني
        const spatialQuery = waterLayer.createQuery();
        spatialQuery.geometry = adminGeometry;
        spatialQuery.spatialRelationship = 'intersects'; // يمكن تغييرها إلى 'within' أو 'contains'

        try {
          const results = await waterLayer.queryFeatures(spatialQuery);
          waterResults[waterLayerName] = results.features.map((feature: any) => ({
            id: feature.attributes.ID_1 || feature.attributes.FID || feature.attributes.OBJECTID || Math.random().toString(),
            name: getFeatureName(feature.attributes, waterLayerName),
            attributes: feature.attributes,
            geometry: feature.geometry
          }));
        } catch (error) {
          console.error(`Error querying ${waterLayerName}:`, error);
          waterResults[waterLayerName] = [];
        }
      }
    }

    return {
      administrativeFeature: {
        id: adminFeature.attributes.ID_1 || adminFeature.attributes.FID || adminFeature.attributes.OBJECTID || Math.random().toString(),
        name: getFeatureName(adminFeature.attributes, administrativeLayerName),
        attributes: adminFeature.attributes,
        geometry: adminFeature.geometry
      },
      waterFeatures: waterResults
    };

  } catch (error) {
    console.error('Error in spatial query:', error);
    return null;
  }
};

// دالة للحصول على جميع العناصر من طبقة معينة
export const getAllFeaturesFromLayer = async (layerName: string): Promise<any[]> => {
  if (!mapInstance) return [];

  let layer: any = null;
  switch (layerName) {
    case 'waterBodies':
      layer = mapInstance.waterBodiesLayer;
      break;
    case 'waterLines':
      layer = mapInstance.waterLinesLayer;
      break;
    case 'governorates':
      layer = mapInstance.governoratesLayer;
      break;
    case 'districts':
      layer = mapInstance.districtsLayer;
      break;
    case 'subdistricts':
      layer = mapInstance.subdistrictsLayer;
      break;
    case 'villages':
      layer = mapInstance.villagesLayer;
      break;
  }

  if (!layer) return [];

  try {
    const query = layer.createQuery();
    query.where = '1=1'; // جلب جميع العناصر
    query.outFields = ['*']; // جلب جميع الحقول

    const results = await layer.queryFeatures(query);

    return results.features.map((feature: any) => ({
      id: feature.attributes.ID_1 || feature.attributes.FID || feature.attributes.OBJECTID || Math.random().toString(),
      name: getFeatureName(feature.attributes, layerName),
      type: layerName,
      attributes: feature.attributes,
      geometry: feature.geometry,
      coordinates: feature.geometry?.centroid ?
        [feature.geometry.centroid.longitude, feature.geometry.centroid.latitude] :
        null
    }));
  } catch (error) {
    console.error(`Error getting features from ${layerName}:`, error);
    return [];
  }
};
 