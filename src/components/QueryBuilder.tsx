import React, { useState, useEffect } from 'react';
import { Filter, Plus, Trash2, Play, X } from 'lucide-react';

interface QueryCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

interface QueryBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQuery: (query: string) => void;
  availableFields: { [layerName: string]: string[] };
  selectedLayer: string;
  onLayerChange: (layer: string) => void;
}

const QueryBuilder: React.FC<QueryBuilderProps> = ({
  isOpen,
  onClose,
  onApplyQuery,
  availableFields,
  selectedLayer,
  onLayerChange
}) => {
  const [conditions, setConditions] = useState<QueryCondition[]>([
    { id: '1', field: '', operator: '=', value: '' }
  ]);
  const [fieldValues, setFieldValues] = useState<{ [key: string]: string[] }>({});
  const [loadingValues, setLoadingValues] = useState<{ [key: string]: boolean }>({});

  const operators = [
    { value: '=', label: 'يساوي' },
    { value: '!=', label: 'لا يساوي' },
    { value: '>', label: 'أكبر من' },
    { value: '<', label: 'أصغر من' },
    { value: '>=', label: 'أكبر من أو يساوي' },
    { value: '<=', label: 'أصغر من أو يساوي' },
    { value: 'LIKE', label: 'يحتوي على' },
    { value: 'NOT LIKE', label: 'لا يحتوي على' },
    { value: 'IS NULL', label: 'فارغ' },
    { value: 'IS NOT NULL', label: 'غير فارغ' }
  ];

  const layerNames = {
    waterBodies: 'المسطحات المائية',
    waterLines: 'المجاري المائية',
    governorates: 'المحافظات',
    districts: 'المناطق',
    subdistricts: 'النواحي',
    villages: 'القرى'
  };

  const addCondition = () => {
    const newCondition: QueryCondition = {
      id: Date.now().toString(),
      field: '',
      operator: '=',
      value: '',
      logicalOperator: 'AND'
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(c => c.id !== id));
    }
  };

  const updateCondition = (id: string, field: keyof QueryCondition, value: string) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const buildQuery = (): string => {
    const validConditions = conditions.filter(c => c.field && c.value);
    
    if (validConditions.length === 0) return '1=1';

    return validConditions.map((condition, index) => {
      let clause = '';
      
      if (index > 0 && condition.logicalOperator) {
        clause += ` ${condition.logicalOperator} `;
      }

      if (condition.operator === 'LIKE' || condition.operator === 'NOT LIKE') {
        clause += `${condition.field} ${condition.operator} '%${condition.value}%'`;
      } else if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
        clause += `${condition.field} ${condition.operator}`;
      } else {
        // Handle numeric vs string values
        const isNumeric = !isNaN(Number(condition.value));
        const value = isNumeric ? condition.value : `'${condition.value}'`;
        clause += `${condition.field} ${condition.operator} ${value}`;
      }

      return clause;
    }).join('');
  };

  const handleApplyQuery = () => {
    const query = buildQuery();
    onApplyQuery(query);
    onClose();
  };

  const clearConditions = () => {
    setConditions([{ id: '1', field: '', operator: '=', value: '' }]);
  };

  // دالة لجلب القيم المتاحة للحقل المحدد
  const fetchFieldValues = async (fieldName: string) => {
    if (!fieldName || fieldValues[fieldName]) return;

    setLoadingValues(prev => ({ ...prev, [fieldName]: true }));

    try {
      // استيراد دالة من mapService للحصول على القيم المتاحة
      const { getUniqueFieldValues } = await import('../services/mapService');
      const values = await getUniqueFieldValues(selectedLayer, fieldName);
      setFieldValues(prev => ({ ...prev, [fieldName]: values }));
    } catch (error) {
      console.error('Error fetching field values:', error);
      setFieldValues(prev => ({ ...prev, [fieldName]: [] }));
    } finally {
      setLoadingValues(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  // تحديث دالة updateCondition لجلب القيم عند تغيير الحقل
  const updateConditionWithValues = (id: string, field: keyof QueryCondition, value: string) => {
    setConditions(conditions.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));

    // إذا تم تغيير الحقل، اجلب القيم المتاحة
    if (field === 'field' && value) {
      fetchFieldValues(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="query-builder-modal fixed inset-0 flex items-center justify-center z-50">
      <div className="query-builder-content rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden fade-in" dir="rtl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            منشئ الاستعلامات
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Layer Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختر الطبقة
            </label>
            <select
              value={selectedLayer}
              onChange={(e) => onLayerChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(layerNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          {/* Query Conditions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">شروط الاستعلام</h3>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={clearConditions}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  مسح الكل
                </button>
                <button
                  onClick={addCondition}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  إضافة شرط
                </button>
              </div>
            </div>

            {conditions.map((condition, index) => (
              <div key={condition.id} className="query-condition p-4">
                {index > 0 && (
                  <div className="mb-3">
                    <select
                      value={condition.logicalOperator || 'AND'}
                      onChange={(e) => updateConditionWithValues(condition.id, 'logicalOperator', e.target.value as 'AND' | 'OR')}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="AND">و (AND)</option>
                      <option value="OR">أو (OR)</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Field Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      الحقل
                    </label>
                    <select
                      value={condition.field}
                      onChange={(e) => updateConditionWithValues(condition.id, 'field', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">اختر حقل</option>
                      {availableFields[selectedLayer]?.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>

                  {/* Operator Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      المشغل
                    </label>
                    <select
                      value={condition.operator}
                      onChange={(e) => updateConditionWithValues(condition.id, 'operator', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {operators.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Value Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      القيمة
                    </label>
                    {condition.field && fieldValues[condition.field] && fieldValues[condition.field].length > 0 ? (
                      // عرض dropdown مع القيم المتاحة
                      <select
                        value={condition.value}
                        onChange={(e) => updateConditionWithValues(condition.id, 'value', e.target.value)}
                        disabled={condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL'}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                      >
                        <option value="">اختر قيمة</option>
                        {fieldValues[condition.field].map((value, index) => (
                          <option key={index} value={value}>
                            {value || '(فارغ)'}
                          </option>
                        ))}
                      </select>
                    ) : loadingValues[condition.field] ? (
                      // عرض مؤشر التحميل
                      <div className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">جاري التحميل...</span>
                      </div>
                    ) : (
                      // عرض input عادي إذا لم تكن هناك قيم متاحة
                      <input
                        type="text"
                        value={condition.value}
                        onChange={(e) => updateConditionWithValues(condition.id, 'value', e.target.value)}
                        disabled={condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL'}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                        placeholder={condition.field ? "أدخل القيمة" : "اختر حقل أولاً"}
                      />
                    )}
                  </div>

                  {/* Remove Button */}
                  <div className="flex items-end">
                    <button
                      onClick={() => removeCondition(condition.id)}
                      disabled={conditions.length === 1}
                      className="w-full px-2 py-1 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Query Preview */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">معاينة الاستعلام</h3>
            <div className="query-preview p-3 rounded text-sm text-left" dir="ltr">
              {buildQuery()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 space-x-reverse p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary px-6 py-3 rounded-lg"
          >
            إلغاء
          </button>
          <button
            onClick={handleApplyQuery}
            className="btn-primary px-6 py-3 rounded-lg flex items-center"
          >
            <Play className="w-4 h-4 mr-2" />
            تطبيق الاستعلام
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueryBuilder;
