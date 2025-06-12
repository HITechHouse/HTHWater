import  { useState, useEffect } from 'react';
import { DropletIcon, TrendingUp, Droplet, BarChart2, List, Filter, MapPin, Users, Building } from 'lucide-react';
import { getWaterBodies, getWaterQualityData, getWaterStatisticsData, WaterBody, getVillageWaterAnalysis, getRegionalWaterDistribution, getWaterAccessibilityAnalysis } from '../services/mapService';
import WaterBodyDetails from '../components/WaterBodyDetails';
import ChartComponent from '../components/ChartComponent';
import BarChart from '../components/BarChart';
import VillageWaterMap from '../components/VillageWaterMap';
import WaterStatsCard from '../components/WaterStatsCard';
import WaterRecommendations from '../components/WaterRecommendations';

type ActiveTab = 'quality' | 'statistics' | 'villages' | 'regional' | 'accessibility';

const WaterAnalysis = () => {
  const [waterBodies, setWaterBodies] = useState<WaterBody[]>([]);
  const [selectedWaterBody, setSelectedWaterBody] = useState<WaterBody | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qualityData, setQualityData] = useState<any>(null);
  const [statisticsData, setStatisticsData] = useState<any>(null);
  const [villageAnalysisData, setVillageAnalysisData] = useState<any>(null);
  const [regionalData, setRegionalData] = useState<any>(null);
  const [accessibilityData, setAccessibilityData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('villages');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const fetchWaterBodies = async () => {
      try {
        const data = await getWaterBodies();
        setWaterBodies(data);

        if (data.length > 0) {
          setSelectedWaterBody(data[0]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching water bodies:", error);
        setIsLoading(false);
      }
    };

    fetchWaterBodies();
  }, []);

  // Load analysis data on component mount
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const [villageData, regionalDistribution, accessibilityAnalysis] = await Promise.all([
          getVillageWaterAnalysis(),
          getRegionalWaterDistribution(),
          getWaterAccessibilityAnalysis()
        ]);

        setVillageAnalysisData(villageData);
        setRegionalData(regionalDistribution);
        setAccessibilityData(accessibilityAnalysis);
      } catch (error) {
        console.error("Error fetching analysis data:", error);
      }
    };

    fetchAnalysisData();
  }, []);

  useEffect(() => {
    if (selectedWaterBody) {
      const fetchData = async () => {
        try {
          const [quality, statistics] = await Promise.all([
            getWaterQualityData(selectedWaterBody.id.toString()),
            getWaterStatisticsData(selectedWaterBody.id.toString())
          ]);
          
          setQualityData(quality);
          setStatisticsData(statistics);
        } catch (error) {
          console.error("Error fetching water body data:", error);
        }
      };
      
      fetchData();
    }
  }, [selectedWaterBody]);

  const filteredWaterBodies = waterBodies.filter(wb => {
    if (filterType === 'all') return true;
    return wb.type === filterType;
  });

  const renderVillagesTab = () => {
    if (!villageAnalysisData) return <div className="text-center py-8">جاري تحميل بيانات القرى...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <WaterStatsCard
            title="إجمالي القرى"
            value={villageAnalysisData.totalVillages}
            subtitle="في جميع أنحاء سوريا"
            icon={Users}
            color="blue"
            trend={{ value: 2.3, isPositive: true }}
          />
          <WaterStatsCard
            title="قرى لديها وصول للمياه"
            value={villageAnalysisData.villagesWithWaterAccess}
            subtitle={`${((villageAnalysisData.villagesWithWaterAccess / villageAnalysisData.totalVillages) * 100).toFixed(1)}% من إجمالي القرى`}
            icon={Droplet}
            color="green"
            trend={{ value: 5.7, isPositive: true }}
          />
          <WaterStatsCard
            title="قرى تفتقر للمياه"
            value={villageAnalysisData.villagesWithoutWaterAccess}
            subtitle={`${((villageAnalysisData.villagesWithoutWaterAccess / villageAnalysisData.totalVillages) * 100).toFixed(1)}% من إجمالي القرى`}
            icon={MapPin}
            color="red"
            trend={{ value: 1.2, isPositive: false }}
          />
        </div>

        <VillageWaterMap data={villageAnalysisData} />

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">توزيع القرى حسب المسافة من المسطحات المائية</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm h-64">
            <BarChart
              data={villageAnalysisData.distanceDistribution}
              title="المسافة من المياه"
              yAxisLabel="عدد القرى"
              color="#3b82f6"
              type="bar"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">القرى حسب نوع المسطح المائي القريب</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع المسطح المائي</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد القرى</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النسبة المئوية</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {villageAnalysisData.villagesByWaterType.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.waterType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <WaterRecommendations analysisData={villageAnalysisData} />
      </div>
    );
  };

  const renderRegionalTab = () => {
    if (!regionalData) return <div className="text-center py-8">جاري تحميل البيانات الإقليمية...</div>;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">توزيع المسطحات المائية حسب المحافظات</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm h-64">
            <BarChart
              data={regionalData.waterBodiesByGovernorate}
              title="المسطحات المائية"
              yAxisLabel="العدد"
              color="#10b981"
              type="bar"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">كثافة المسطحات المائية (لكل 1000 كم²)</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regionalData.waterDensityByRegion.map((region: any, index: number) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">{region.region}</div>
                  <div className="text-lg font-semibold">{region.density}</div>
                  <div className="text-xs text-gray-400">مسطح مائي لكل 1000 كم²</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">أكبر المسطحات المائية في كل محافظة</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المحافظة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">أكبر مسطح مائي</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المساحة</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {regionalData.largestWaterBodiesByGovernorate.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.governorate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.waterBodyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.area}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAccessibilityTab = () => {
    if (!accessibilityData) return <div className="text-center py-8">جاري تحميل بيانات إمكانية الوصول...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <WaterStatsCard
            title="وصول ممتاز"
            value={accessibilityData.accessibilityLevels.excellent}
            subtitle="أقل من 1 كم"
            icon={Droplet}
            color="green"
          />
          <WaterStatsCard
            title="وصول جيد"
            value={accessibilityData.accessibilityLevels.good}
            subtitle="1-3 كم"
            icon={MapPin}
            color="blue"
          />
          <WaterStatsCard
            title="وصول متوسط"
            value={accessibilityData.accessibilityLevels.moderate}
            subtitle="3-5 كم"
            icon={TrendingUp}
            color="yellow"
          />
          <WaterStatsCard
            title="وصول ضعيف"
            value={accessibilityData.accessibilityLevels.poor}
            subtitle="أكثر من 5 كم"
            icon={Filter}
            color="red"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">متوسط المسافة للمياه حسب المنطقة</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm h-64">
            <BarChart
              data={accessibilityData.averageDistanceByRegion}
              title="متوسط المسافة"
              yAxisLabel="المسافة (كم)"
              color="#f59e0b"
              type="bar"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">القرى الأكثر بُعداً عن المياه</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم القرية</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنطقة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المسافة للمياه</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">أقرب مسطح مائي</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accessibilityData.mostIsolatedVillages.map((village: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{village.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{village.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{village.distance} كم</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{village.nearestWaterBody}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQualityTab = () => {
    if (!qualityData) return <div className="text-center py-8">لا تتوفر بيانات عن جودة المياه</div>;
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">اتجاه التلوث عبر الزمن</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm h-64">
            <ChartComponent 
              data={qualityData.pollutionTrend} 
              title="اتجاه التلوث" 
              yAxisLabel="مستوى التلوث" 
              color="#ef4444"
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">المكونات الكيميائية</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-gray-500">الأكسجين المذاب</div>
                <div className="text-lg font-semibold">{qualityData.chemicalComponents.dissolved_oxygen} mg/L</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-gray-500">الرقم الهيدروجيني</div>
                <div className="text-lg font-semibold">{qualityData.chemicalComponents.ph} pH</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-gray-500">النترات</div>
                <div className="text-lg font-semibold">{qualityData.chemicalComponents.nitrates} mg/L</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-gray-500">الفوسفات</div>
                <div className="text-lg font-semibold">{qualityData.chemicalComponents.phosphates} mg/L</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-gray-500">العكورة</div>
                <div className="text-lg font-semibold">{qualityData.chemicalComponents.turbidity} NTU</div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">تصنيف صلاحية الاستخدام</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع الاستخدام</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التصنيف</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">مياه الشرب</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{qualityData.usageRatings.drinking}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">الري الزراعي</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{qualityData.usageRatings.irrigation}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">الاستخدام الصناعي</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{qualityData.usageRatings.industrial}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">الثروة السمكية</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{qualityData.usageRatings.fishing}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">الترفيه</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{qualityData.usageRatings.recreation}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStatisticsTab = () => {
    if (!statisticsData) return <div className="text-center py-8">لا تتوفر بيانات إحصائية</div>;
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">تغير المساحة السطحية (٪ من القيمة الأصلية)</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm h-64">
            <ChartComponent 
              data={statisticsData.surfaceAreaTrend} 
              title="المساحة السطحية" 
              yAxisLabel="النسبة المئوية (%)" 
              color="#3b82f6"
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">تغير الحجم (٪ من القيمة الأصلية)</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm h-64">
            <ChartComponent 
              data={statisticsData.volumeTrend} 
              title="الحجم" 
              yAxisLabel="النسبة المئوية (%)" 
              color="#0ea5e9"
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">تغيرات الحدود (٪)</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفترة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التغير (٪)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statisticsData.boundaryChanges.periods.map((period: string, index: number) => (
                    <tr key={period}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={statisticsData.boundaryChanges.changes[index] >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {statisticsData.boundaryChanges.changes[index] >= 0 ? '+' : ''}{statisticsData.boundaryChanges.changes[index]}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" dir="rtl">
      <h1 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
        <DropletIcon className="inline-block ml-2" size={28} />
        تحليل المياه والقرى السورية
      </h1>

      {/* Quick Summary */}
      {villageAnalysisData && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ملخص سريع</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{villageAnalysisData.totalVillages}</div>
              <div className="text-sm text-gray-600">إجمالي القرى</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {((villageAnalysisData.villagesWithWaterAccess / villageAnalysisData.totalVillages) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">نسبة الوصول للمياه</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">1,297</div>
              <div className="text-sm text-gray-600">مسطح مائي</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">14</div>
              <div className="text-sm text-gray-600">محافظة</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">
                <Filter size={16} className="inline-block ml-1" /> تصفية حسب النوع
              </label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">جميع الأنواع</option>
                <option value="نهر">أنهار</option>
                <option value="بحيرة">بحيرات</option>
              </select>
            </div>
            
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <List size={16} className="inline-block ml-1" /> المسطحات المائية
            </h3>
            
            {isLoading ? (
              <div className="text-center py-4">
                <span className="text-gray-500">جاري التحميل...</span>
              </div>
            ) : filteredWaterBodies.length === 0 ? (
              <div className="text-center py-4">
                <span className="text-gray-500">لا توجد مسطحات مائية</span>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-96 mt-2">
                <ul className="space-y-1">
                  {filteredWaterBodies.map((waterBody) => (
                    <li key={waterBody.id}>
                      <button
                        onClick={() => setSelectedWaterBody(waterBody)}
                        className={`w-full text-right px-3 py-2 rounded-md text-sm ${
                          selectedWaterBody?.id === waterBody.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{waterBody.name}</span>
                        <span className="block text-xs text-gray-500">{waterBody.type}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-3">
          {selectedWaterBody ? (
            <>
              <WaterBodyDetails waterBody={selectedWaterBody} />
              
              <div className="bg-white rounded-lg shadow-md mt-6">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex flex-wrap">
                    <button
                      onClick={() => setActiveTab('villages')}
                      className={`px-4 py-2 font-medium ${activeTab === 'villages' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Users size={16} className="inline-block ml-1" /> تحليل القرى
                    </button>
                    <button
                      onClick={() => setActiveTab('regional')}
                      className={`px-4 py-2 font-medium ${activeTab === 'regional' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <MapPin size={16} className="inline-block ml-1" /> التوزيع الإقليمي
                    </button>
                    <button
                      onClick={() => setActiveTab('accessibility')}
                      className={`px-4 py-2 font-medium ${activeTab === 'accessibility' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Building size={16} className="inline-block ml-1" /> إمكانية الوصول
                    </button>
                    <button
                      onClick={() => setActiveTab('quality')}
                      className={`px-4 py-2 font-medium ${activeTab === 'quality' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Droplet size={16} className="inline-block ml-1" /> جودة المياه
                    </button>
                    <button
                      onClick={() => setActiveTab('statistics')}
                      className={`px-4 py-2 font-medium ${activeTab === 'statistics' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <BarChart2 size={16} className="inline-block ml-1" /> إحصائيات
                    </button>
                  </div>
                </div>
                
                {/* Tab content */}
                <div className="p-4">
                  {activeTab === 'villages' && renderVillagesTab()}
                  {activeTab === 'regional' && renderRegionalTab()}
                  {activeTab === 'accessibility' && renderAccessibilityTab()}
                  {activeTab === 'quality' && renderQualityTab()}
                  {activeTab === 'statistics' && renderStatisticsTab()}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">يرجى اختيار مسطح مائي من القائمة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterAnalysis;
 