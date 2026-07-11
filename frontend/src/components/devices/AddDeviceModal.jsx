import { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, DoorOpen, Plus, Trash2, Cpu, ChevronRight, Save } from 'lucide-react';
import Button from '../ui/Button';
import CustomSpecDropdown from './CustomSpecDropdown';
import CustomCategoryDropdown from './CustomCategoryDropdown';
import { useSystem } from '../../context/SystemContext';

const AddDeviceModal = ({ isOpen, onClose, onAdded, initialDepartment, initialRoom }) => {
  const { systemType } = useSystem();
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selections
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Batch Form Rows
  const [deviceRows, setDeviceRows] = useState([
    { id: Date.now(), assetNumber: '', serialNumber: '', categoryId: '', brand: '', model: '', ram: '', hdd: '', cpu: '', generation: '', gpu: '' }
  ]);

  useEffect(() => {
    if (isOpen) {
      // Set initial state based on props if provided, otherwise reset
      if (initialDepartment && initialRoom) {
        setSelectedDepartment(initialDepartment);
        setSelectedRoom(initialRoom);
        setStep(3);
      } else {
        setStep(1);
        setSelectedDepartment(null);
        setSelectedRoom(null);
      }
      
      let defaultRow = { id: Date.now(), assetNumber: '', serialNumber: '', categoryId: '', brand: '', model: '', ram: '', hdd: '', cpu: '', generation: '', gpu: '', ups: '' };
      setDeviceRows([defaultRow]);
      setError(null);

      // Fetch categories and departments
      const fetchData = async () => {
        try {
          const [catsRes, deptsRes] = await Promise.all([
            axios.get('/devices/categories'),
            axios.get('/departments')
          ]);
          if (catsRes.data.success) setCategories(catsRes.data.data);
          if (deptsRes.data.success) setDepartments(deptsRes.data.data);
        } catch (err) {
          console.error('Failed to fetch dropdown data', err);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // Removed if (!isOpen) return null; to allow AnimatePresence to work

  const handleSelectDepartment = (dept) => {
    setSelectedDepartment(dept);
    setStep(2);
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const addRow = () => {
    const lastRow = deviceRows[deviceRows.length - 1];
    setDeviceRows([...deviceRows, { 
      id: Date.now(), 
      assetNumber: '', 
      serialNumber: '',
      categoryId: lastRow?.categoryId || '', 
      brand: lastRow?.brand || '', 
      model: lastRow?.model || '', 
      ram: lastRow?.ram || '', 
      hdd: lastRow?.hdd || '', 
      cpu: lastRow?.cpu || '', 
      generation: lastRow?.generation || '',
      gpu: lastRow?.gpu || '',
      ups: lastRow?.ups || ''
    }]);
  };

  const removeRow = (id) => {
    if (deviceRows.length > 1) {
      setDeviceRows(deviceRows.filter(row => row.id !== id));
    }
  };

  const handleRowChange = (id, field, value) => {
    setDeviceRows(deviceRows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  // Helper to check if category is a computer/laptop
  const isComputer = (categoryId) => {
    if (!categoryId) return false;
    const cat = categories.find(c => c.id === parseInt(categoryId));
    if (!cat) return false;
    const name = cat.name.toLowerCase();
    return name.includes('computer') || name.includes('laptop') || name.includes('کۆمپیوتەر') || name.includes('لاپتۆپ') || name.includes('کۆمپیتەر');
  };

  const handleBatchSubmit = async () => {
    // Validate rows (only category is strictly required now)
    const invalidRows = deviceRows.filter(r => !r.categoryId);
    
    if (invalidRows.length > 0) {
      setError('تکایە هەموو زانیارییە سەرەکییەکانی خشتەکە (ئەوانەی ئەستێرەیان هەیە) بە تەواوی پڕبکەرەوە.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create an array of promises for each device
      const promises = deviceRows.map(row => {
        const payload = {
          assetNumber: row.assetNumber,
          serialNumber: row.serialNumber,
          categoryId: row.categoryId,
          brand: row.brand,
          model: row.model,
          departmentId: selectedDepartment?.id,
          roomId: selectedRoom?.id,
          status: 'ACTIVE' // Default as requested
        };
        
        // Add computer specs if applicable
        if (isComputer(row.categoryId)) {
          payload.ram = row.ram;
          payload.hdd = row.hdd;
          payload.cpu = row.cpu;
          payload.generation = row.generation;
          payload.gpu = row.gpu;
          payload.ups = row.ups;
        }

        return axios.post('/devices', payload);
      });

      await Promise.all(promises);
      
      // Notify parent to refresh list
      onAdded(); 
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'هەڵەیەک ڕوویدا لە کاتی زیادکردنی ئامێرەکان. ڕەنگە کۆدی ئامێرێک دووبارە بێت.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-start">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-10 w-full max-w-5xl h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 rounded-l-[2rem]"
          >
        
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-8 py-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            {step > 1 && (
              <button 
                onClick={handleBack}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <Cpu className="text-primary-600 dark:text-primary-400" />
                زیادکردنی کۆمەڵەی ئامێرەکان
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                {step === 1 && 'هەنگاوی یەکەم: بەشێک هەڵبژێرە'}
                {step === 2 && 'هەنگاوی دووەم: ژوورێک هەڵبژێرە'}
                {step === 3 && `هەنگاوی سێیەم: زیادکردنی ئامێرەکان بۆ ${selectedRoom?.name}`}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors relative z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-slate-900/50">
          
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 rounded-xl bg-red-50 px-6 py-3 text-sm font-bold text-red-600 border border-red-100 shadow-lg">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: DEPARTMENTS */}
            {step === 1 && (
              <motion.div 
                key="step1"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 overflow-y-auto p-8"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {departments.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">هیچ بەشێک نەدۆزرایەوە</div>
                  ) : (
                    departments.map(dept => (
                      <motion.button
                        key={dept.id}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectDepartment(dept)}
                        className="group flex flex-col items-center justify-center gap-4 rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-primary-100 dark:hover:shadow-primary-900/20 transition-all"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                          <Building2 size={32} />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-center line-clamp-2">{dept.name}</span>
                      </motion.button>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: ROOMS */}
            {step === 2 && (
              <motion.div 
                key="step2"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 overflow-y-auto p-8 flex flex-col gap-6"
              >
                {/* Prominent Section Title */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                      ژوورەکانی بەشی {selectedDepartment?.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">تکایە ئەو ژوورە دیاری بکە کە ئامێرەکانی بۆ زیاد دەکەیت</p>
                  </div>
                </div>

                {(!selectedDepartment?.rooms || selectedDepartment.rooms.length === 0) ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-slate-500 dark:text-slate-400 py-12">
                    <DoorOpen size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-bold">هیچ ژوورێک لەم بەشەدا نییە.</p>
                    <p className="text-sm">سەرەتا دەبێت ژوور بۆ ئەم بەشە زیاد بکەیت لە بەشی "بەشەکان".</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {selectedDepartment.rooms.map(room => (
                      <motion.button
                        key={room.id}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectRoom(room)}
                        className="group flex flex-col items-center justify-center gap-4 rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20 transition-all"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                          <DoorOpen size={32} />
                        </div>
                        <div className="text-center">
                          <span className="block font-bold text-slate-800 dark:text-slate-100">{room.name}</span>
                          <span className="inline-block mt-2 text-xs font-bold text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            {room.devices?.length || 0} ئامێر
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: BATCH TABLE */}
            {step === 3 && (
              <motion.div 
                key="step3"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 flex flex-col p-8"
              >
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                  
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full min-w-[1200px] text-center text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                        <tr>
                          <th className="py-3 px-3 w-10 text-center">#</th>
                          <th className="py-3 px-3 w-40 text-center">جۆری ئامێر <span className="text-red-500">*</span></th>
                          <th className="py-3 px-3 w-32 text-center">کۆدی ئامێر (S/N)</th>
                          <th className="py-3 px-3 w-32 text-center">براند (ئارەزوومەندانە)</th>
                          <th className="py-3 px-3 w-32 text-center">ڕام</th>
                          <th className="py-3 px-3 w-32 text-center">هارد</th>
                          <th className="py-3 px-3 w-32 text-center">پرۆسێسەر</th>
                          <th className="py-3 px-3 w-24 text-center">نەوە (Gen)</th>
                          <th className="py-3 px-3 w-32 text-center">گرافیک</th>
                          <th className="py-3 px-3 w-32 text-center">UPS</th>
                          <th className="py-3 px-3 w-12 text-center">سڕینەوە</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        <AnimatePresence>
                          {deviceRows.map((row, index) => {
                            const showSpecs = isComputer(row.categoryId);
                            const baseInputClass = "w-full bg-slate-50 dark:bg-slate-900 px-3 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none py-2 transition-colors text-xs text-center shadow-sm hover:border-primary-300 dark:hover:border-primary-600";
                            
                            let upsColorClass = '';
                            if (row.ups === 'هەیە') upsColorClass = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
                            else if (row.ups === 'نیەتی') upsColorClass = 'bg-slate-50 text-slate-700 border-slate-300 font-bold dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
                            else if (row.ups === 'سوتاوە') upsColorClass = 'bg-red-50 text-red-700 border-red-300 font-bold dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
                            
                            return (
                              <motion.tr 
                                key={row.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                              >
                                <td className="py-2 px-3 text-center text-slate-400 font-bold">{index + 1}</td>
                                <td className="py-2 px-3">
                                  <CustomCategoryDropdown
                                    categories={categories}
                                    value={row.categoryId}
                                    onChange={(val) => handleRowChange(row.id, 'categoryId', val)}
                                    onCategoryAdded={(newCat) => setCategories([...categories, newCat])}
                                    onCategoryDeleted={(deletedId) => setCategories(categories.filter(c => c.id !== deletedId))}
                                    placeholder="هەڵبژێرە..."
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={row.serialNumber}
                                    onChange={(e) => handleRowChange(row.id, 'serialNumber', e.target.value)}
                                    placeholder="S/N..."
                                    dir="ltr"
                                    className={baseInputClass}
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <CustomSpecDropdown 
                                    type="brand"
                                    value={row.brand}
                                    onChange={(val) => handleRowChange(row.id, 'brand', val)}
                                    placeholder="هەڵبژێرە..."
                                  />
                                </td>
                                {/* Conditionally Rendered Computer Specs */}
                                <td className="py-2 px-3">
                                  {showSpecs ? (
                                    <CustomSpecDropdown 
                                      type="ram"
                                      value={row.ram}
                                      onChange={(val) => handleRowChange(row.id, 'ram', val)}
                                      placeholder="هەڵبژێرە..."
                                    />
                                  ) : (
                                    <div className="text-center text-slate-300 dark:text-slate-600">-</div>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {showSpecs ? (
                                    <CustomSpecDropdown 
                                      type="hdd"
                                      value={row.hdd}
                                      onChange={(val) => handleRowChange(row.id, 'hdd', val)}
                                      placeholder="هەڵبژێرە..."
                                    />
                                  ) : (
                                    <div className="text-center text-slate-300 dark:text-slate-600">-</div>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {showSpecs ? (
                                    <CustomSpecDropdown 
                                      type="cpu"
                                      value={row.cpu}
                                      onChange={(val) => handleRowChange(row.id, 'cpu', val)}
                                      placeholder="هەڵبژێرە..."
                                    />
                                  ) : (
                                    <div className="text-center text-slate-300 dark:text-slate-600">-</div>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {showSpecs ? (
                                    <input 
                                      type="text"
                                      value={row.generation || ''}
                                      onChange={(e) => handleRowChange(row.id, 'generation', e.target.value)}
                                      className={baseInputClass}
                                      placeholder="نموونە: 12th"
                                    />
                                  ) : (
                                    <div className="text-center text-slate-300 dark:text-slate-600">-</div>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {showSpecs ? (
                                    <CustomSpecDropdown 
                                      type="gpu"
                                      value={row.gpu}
                                      onChange={(val) => handleRowChange(row.id, 'gpu', val)}
                                      placeholder="هەڵبژێرە..."
                                    />
                                  ) : (
                                    <div className="text-center text-slate-300 dark:text-slate-600">-</div>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {showSpecs ? (
                                    <select
                                      value={row.ups || ''}
                                      onChange={(e) => handleRowChange(row.id, 'ups', e.target.value)}
                                      className={`${baseInputClass} cursor-pointer text-center appearance-none ${upsColorClass}`}
                                    >
                                      <option value="">دیاری نەکراوە</option>
                                      <option value="هەیە" className="text-emerald-600 font-bold bg-slate-50 dark:bg-slate-900">هەیە</option>
                                      <option value="نیەتی" className="text-slate-600 font-bold bg-slate-50 dark:bg-slate-900">نیەتی</option>
                                      <option value="سوتاوە" className="text-red-600 font-bold bg-slate-50 dark:bg-slate-900">سوتاوە</option>
                                    </select>
                                  ) : (
                                    <div className="text-center text-slate-300 dark:text-slate-600">-</div>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <button
                                    onClick={() => removeRow(row.id)}
                                    disabled={deviceRows.length === 1}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  {/* Add Row Button Row */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <button
                      onClick={addRow}
                      className="flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 px-4 py-2 rounded-xl transition-colors"
                    >
                      <Plus size={16} />
                      زیادکردنی ڕیزێکی تر
                    </button>
                  </div>

                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex justify-end gap-4">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="rounded-xl px-8 font-bold"
                  >
                    پاشگەزبوونەوە
                  </Button>
                  <Button 
                    onClick={handleBatchSubmit}
                    disabled={loading}
                    className="rounded-xl px-8 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-600/30 flex items-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        چاوەڕێ بکە...
                      </span>
                    ) : (
                      <>
                        <Save size={18} />
                        سەیڤکردنی هەمووی ({deviceRows.length})
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddDeviceModal;
