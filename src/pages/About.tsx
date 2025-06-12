import  { Globe, Database, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6">حول نظام المعلومات الجغرافية السوري</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-blue-700 mb-3 flex items-center">
              <Globe className="inline-block ml-2" size={24} />
              نبذة عن النظام
            </h2>
            <p className="text-gray-700 leading-relaxed">
              يهدف نظام المعلومات الجغرافية السوري إلى توفير منصة متكاملة لعرض وتحليل البيانات الجغرافية للجمهورية العربية السورية، 
              مع التركيز بشكل خاص على المسطحات المائية والتقسيمات الإدارية. يتيح النظام للمستخدمين استكشاف الخرائط التفاعلية، 
              وإجراء عمليات البحث المتقدمة، وتحليل البيانات المتعلقة بالمسطحات المائية لدعم عمليات التخطيط واتخاذ القرار.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-blue-700 mb-3 flex items-center">
              <Database className="inline-block ml-2" size={24} />
              مصادر البيانات
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              يعتمد النظام على مجموعة من الطبقات الجغرافية المتنوعة:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>طبقة المحافظات السورية (Polygon)</li>
              <li>طبقة المناطق السورية (Polygon)</li>
              <li>طبقة النواحي السورية (Polygon)</li>
              <li>طبقة القرى السورية (Polygon)</li>
              <li>طبقة المجاري المائية (Line)</li>
              <li>طبقة المسطحات المائية (Polygon)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              تم استخلاص هذه البيانات من مصادر موثوقة وتم معالجتها وتنظيمها لضمان دقتها وسهولة استخدامها.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-blue-700 mb-3 flex items-center">
              <MapPin className="inline-block ml-2" size={24} />
              ميزات النظام
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">استعراض الخرائط التفاعلية</h3>
                <p className="text-gray-700">
                  استكشاف الخرائط التفاعلية للمناطق السورية والمسطحات المائية مع إمكانية التكبير والتصغير والتحرك بحرية.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">البحث المتقدم</h3>
                <p className="text-gray-700">
                  إمكانية البحث عن المواقع الجغرافية والمسطحات المائية باستخدام أسمائها أو خصائصها.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">تحليل المسطحات المائية</h3>
                <p className="text-gray-700">
                  إجراء تحليلات متقدمة على المسطحات المائية لدراسة خصائصها وتغيراتها عبر الزمن.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">التحكم بالطبقات</h3>
                <p className="text-gray-700">
                  إمكانية إظهار وإخفاء الطبقات المختلفة حسب احتياجات المستخدم لتسهيل عملية التحليل والاستكشاف.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
 