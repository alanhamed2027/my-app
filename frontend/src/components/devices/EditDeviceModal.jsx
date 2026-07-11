import { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Edit2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import CustomSpecDropdown from './CustomSpecDropdown';
import CustomCategoryDropdown from './CustomCategoryDropdown';
import { useSystem } from '../../context/SystemContext';

const EditDeviceModal = ({ isOpen, onClose, onUpdated, device }) => {
  const { systemType } = useSystem();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    serialNumber: '',
    categoryId: '',
    brand: '',
    model: '',
    ram: '',
    hdd: '',
    cpu: '',
    generation: '',
    gpu: '',
    ups: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (device) {
        setFormData({
          serialNumber: device.serialNumber || '',
          categoryId: device.categoryId || '',
          brand: device.brand || '',
          model: device.model || '',
          ram: device.ram || '',
          hdd: device.hdd || device.ssd || '',
          cpu: device.cpu || '',
          generation: device.generation || '',
          gpu: device.gpu || '',
          ups: device.ups || '',
          status: device.status || 'ACTIVE'
        });
      }

      const fetchCategories = async () => {
        try {
          const res = await axios.get('/devices/categories');
          if (res.data.success) setCategories(res.data.data);
        } catch (err) {
          console.error('Failed to fetch categories', err);
        }
      };
      fetchCategories();
    }
  }, [isOpen, device]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isComputer = (categoryId) => {
    if (!categoryId) return false;
    const cat = categories.find(c => String(c.id) === String(categoryId));
    if (!cat) return false;
    const name = cat.name.toLowerCase();
    return name.includes('computer') || name.includes('laptop') || name.includes('کۆمپیوتەر') || name.includes('لاپتۆپ') || name.includes('کۆمپیتەر');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      setError('تکایە جۆری ئامێر هەڵبژێرە.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = { ...formData };
      
      // If it's not a computer, remove computer-specific specs
      if (!isComputer(formData.categoryId)) {
        payload.ram = null;
        payload.hdd = null;
        payload.cpu = null;
        payload.generation = null;
        payload.gpu = null;
        payload.ups = null;
      }


      await axios.put(`/devices/${device.id}`, payload);
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'هەڵەیەک ڕوویدا لە کاتی نوێکردنەوە.');
    } finally {
      setLoading(false);
    }
  };

  const showSpecs = isComputer(formData.categoryId);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Edit2 size={20} />
                </div>
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                  گۆڕانکاری لە ئامێر
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <form id="edit-device-form" onSubmit={handleSubmit} className="space-y-6">
                

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      جۆری ئامێر <span className="text-red-500">*</span>
                    </label>
                    <CustomCategoryDropdown
                      categories={categories}
                      value={formData.categoryId}
                      onChange={(val) => handleChange('categoryId', val)}
                      onCategoryAdded={(newCat) => setCategories([...categories, newCat])}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      کۆدی ئامێر (S/N)
                    </label>
                    <Input 
                      dir="ltr"
                      value={formData.serialNumber}
                      onChange={(e) => handleChange('serialNumber', e.target.value)}
                      placeholder="S/N..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      براند (ئارەزوومەندانە)
                    </label>
                    <CustomSpecDropdown 
                      type="brand"
                      value={formData.brand}
                      onChange={(val) => handleChange('brand', val)}
                      placeholder="نمونە: Dell"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {showSpecs && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ڕام</label>
                          <CustomSpecDropdown 
                            type="ram"
                            value={formData.ram}
                            onChange={(val) => handleChange('ram', val)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">هارد</label>
                          <CustomSpecDropdown 
                            type="hdd"
                            value={formData.hdd}
                            onChange={(val) => handleChange('hdd', val)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">پرۆسێسەر</label>
                          <CustomSpecDropdown 
                            type="cpu"
                            value={formData.cpu}
                            onChange={(val) => handleChange('cpu', val)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">نەوە (Gen)</label>
                          <CustomSpecDropdown 
                            type="generation"
                            value={formData.generation}
                            onChange={(val) => handleChange('generation', val)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">گرافیک</label>
                          <CustomSpecDropdown 
                            type="gpu"
                            value={formData.gpu}
                            onChange={(val) => handleChange('gpu', val)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">UPS (یو پی ئێس)</label>
                          <select 
                            className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                            value={formData.ups}
                            onChange={(e) => handleChange('ups', e.target.value)}
                          >
                            <option value="">هەڵبژێرە...</option>
                            <option value="هەیە">هەیە</option>
                            <option value="نیەتی">نیەتی</option>
                            <option value="سوتاوە">سوتاوە</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">باری ئامێر (Status)</label>
                          <select 
                            className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                          >
                            <option value="ACTIVE">کاردەکات (Active)</option>
                            <option value="BROKEN">لەکارکەوتووە (Broken)</option>
                            <option value="UNDER_MAINTENANCE">چاککردنەوە (Maintenance)</option>
                            <option value="INACTIVE">بەکارناهێنرێت (Inactive)</option>
                            <option value="DISPOSED">فڕێدراوە (Disposed)</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {!showSpecs && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">باری ئامێر (Status)</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                    >
                      <option value="ACTIVE">کاردەکات (Active)</option>
                      <option value="BROKEN">لەکارکەوتووە (Broken)</option>
                      <option value="UNDER_MAINTENANCE">چاککردنەوە (Maintenance)</option>
                      <option value="INACTIVE">بەکارناهێنرێت (Inactive)</option>
                      <option value="DISPOSED">فڕێدراوە (Disposed)</option>
                    </select>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} type="button">
                پاشگەزبوونەوە
              </Button>
              <Button 
                variant="primary" 
                form="edit-device-form" 
                type="submit"
                loading={loading}
                className="gap-2"
              >
                <Save size={20} />
                سەیڤکردن
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditDeviceModal;
