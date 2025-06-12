import React from 'react';
import { AlertTriangle, CheckCircle, Info, Target } from 'lucide-react';

interface Recommendation {
  type: 'urgent' | 'important' | 'suggestion' | 'achievement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface WaterRecommendationsProps {
  analysisData: any;
}

const WaterRecommendations: React.FC<WaterRecommendationsProps> = ({ analysisData }) => {
  if (!analysisData) return null;

  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    // Calculate water access percentage
    const accessPercentage = (analysisData.villagesWithWaterAccess / analysisData.totalVillages) * 100;
    
    if (accessPercentage < 80) {
      recommendations.push({
        type: 'urgent',
        title: 'تحسين الوصول للمياه',
        description: `${analysisData.villagesWithoutWaterAccess} قرية تفتقر للوصول الكافي للمياه. يُنصح بإنشاء مشاريع مياه جديدة في هذه المناطق.`,
        priority: 'high'
      });
    }
    
    if (accessPercentage > 75) {
      recommendations.push({
        type: 'achievement',
        title: 'إنجاز جيد في الوصول للمياه',
        description: `${accessPercentage.toFixed(1)}% من القرى لديها وصول للمياه، وهو معدل جيد يجب المحافظة عليه.`,
        priority: 'low'
      });
    }
    
    recommendations.push({
      type: 'important',
      title: 'تطوير البنية التحتية',
      description: 'تحسين شبكات توزيع المياه في القرى النائية لضمان وصول أفضل وأكثر استدامة.',
      priority: 'medium'
    });
    
    recommendations.push({
      type: 'suggestion',
      title: 'مراقبة جودة المياه',
      description: 'إجراء فحوصات دورية لجودة المياه في جميع المسطحات المائية لضمان سلامة الاستخدام.',
      priority: 'medium'
    });
    
    recommendations.push({
      type: 'important',
      title: 'حفظ الموارد المائية',
      description: 'تطبيق تقنيات حديثة لحفظ المياه وتقليل الهدر في الاستخدامات المختلفة.',
      priority: 'high'
    });
    
    return recommendations;
  };

  const recommendations = generateRecommendations();

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'achievement':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'important':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'suggestion':
        return <Info className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'achievement':
        return 'bg-green-50 border-green-200';
      case 'important':
        return 'bg-blue-50 border-blue-200';
      case 'suggestion':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Target className="w-5 h-5 text-blue-500 mr-2" />
        التوصيات والإجراءات المقترحة
      </h3>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${getBackgroundColor(rec.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 space-x-reverse">
                {getIcon(rec.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
              </div>
              {getPriorityBadge(rec.priority)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">ملاحظة مهمة</h4>
        <p className="text-sm text-blue-700">
          هذه التوصيات مبنية على تحليل البيانات المتاحة. يُنصح بإجراء دراسات ميدانية تفصيلية قبل تنفيذ أي مشروع.
        </p>
      </div>
    </div>
  );
};

export default WaterRecommendations;
