import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Cpu, Building2, Monitor, DoorOpen } from 'lucide-react';
import Button from '../ui/Button';

const PrintDeviceModal = ({ isOpen, onClose, device }) => {
  if (!isOpen || !device) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0 print:z-[9999]" dir="rtl">
        
        {/* Backdrop - Hidden in print */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm print:hidden"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col print:shadow-none print:rounded-none print:w-full print:h-full print:max-w-none print:bg-white print:text-black"
        >
          {/* Print Only Header (Optional Branding) */}
          <div className="hidden print:flex items-center justify-between p-4 border-b-2 border-slate-200 dark:border-slate-700 mb-6">
            <h1 className="text-2xl font-black">سیستەمی ئامێرەکان</h1>
            <p className="font-bold text-slate-500 dark:text-slate-400">بەڕێوەبەرایەتی ئایتی</p>
          </div>

          {/* Screen Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 print:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                <Printer size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                چاپکردنی زانیاری ئامێر
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Printable Content */}
          <div className="flex-1 overflow-y-auto p-8 print:p-4" id="printable-area">
            
            <div className="border-4 border-slate-900 dark:border-slate-700 print:border-black rounded-3xl p-6 relative overflow-hidden bg-white print:bg-transparent">
              
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-100 dark:bg-blue-900/20 print:bg-slate-100 rounded-full opacity-50"></div>
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-emerald-100 dark:bg-emerald-900/20 print:bg-slate-100 rounded-full opacity-50"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 print:bg-white print:border-2 print:border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center mb-4 shadow-sm text-slate-600 print:text-black">
                  <Monitor size={32} />
                </div>
                
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 print:text-black mb-1" dir="ltr">
                  {device.brand}
                </h3>
                
                <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 print:bg-white print:border print:border-slate-300 px-3 py-1 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 print:text-black mb-6" dir="ltr">
                  S/N: {device.serialNumber || 'بەتاڵ'}
                </div>

                <div className="w-full grid grid-cols-2 gap-4 text-right">
                  <div className="bg-slate-50 dark:bg-slate-900/50 print:bg-transparent print:border-b print:border-slate-200 dark:border-slate-700 p-3 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 print:text-slate-500 dark:text-slate-400 mb-1">جۆر</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 print:text-black">{device.category?.name || '-'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 print:bg-transparent print:border-b print:border-slate-200 dark:border-slate-700 p-3 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 print:text-slate-500 dark:text-slate-400 mb-1">بەش</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 print:text-black line-clamp-1">
                      {device.department?.name || '-'}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 print:bg-transparent print:border-b print:border-slate-200 dark:border-slate-700 p-3 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 print:text-slate-500 dark:text-slate-400 mb-1">ژوور</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 print:text-black line-clamp-1">
                      {device.room?.name || '-'}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 print:bg-transparent print:border-b print:border-slate-200 dark:border-slate-700 p-3 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 print:text-slate-500 dark:text-slate-400 mb-1">نهۆم</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 print:text-black line-clamp-1">
                      {device.room?.floor || '-'}
                    </p>
                  </div>
                  
                  {device.cpu && (
                    <>
                      <div className="bg-slate-50 dark:bg-slate-900/50 print:bg-transparent print:border-b print:border-slate-200 dark:border-slate-700 p-3 rounded-xl">
                        <p className="text-xs font-bold text-slate-400 print:text-slate-500 dark:text-slate-400 mb-1">پرۆسێسەر (CPU)</p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 print:text-black" dir="ltr">
                          {device.cpu}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 print:bg-transparent print:border-b print:border-slate-200 dark:border-slate-700 p-3 rounded-xl">
                        <p className="text-xs font-bold text-slate-400 print:text-slate-500 dark:text-slate-400 mb-1">نەوە (Gen)</p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 print:text-black" dir="ltr">
                          {device.generation || '-'}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 print:bg-transparent print:border-b print:border-slate-200 dark:border-slate-700 p-3 rounded-xl">
                        <p className="text-xs font-bold text-slate-400 print:text-slate-500 dark:text-slate-400 mb-1">ڕام (RAM)</p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 print:text-black" dir="ltr">
                          {device.ram || '-'}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 print:bg-transparent print:border-b print:border-slate-200 dark:border-slate-700 p-3 rounded-xl">
                        <p className="text-xs font-bold text-slate-400 print:text-slate-500 dark:text-slate-400 mb-1">هارد (Storage)</p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 print:text-black" dir="ltr">
                          {device.hdd || device.ssd || '-'}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 print:bg-transparent print:border-b print:border-slate-200 dark:border-slate-700 p-3 rounded-xl">
                        <p className="text-xs font-bold text-slate-400 print:text-slate-500 dark:text-slate-400 mb-1">گرافیک (GPU)</p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 print:text-black" dir="ltr">
                          {device.gpu || '-'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Fake Barcode for aesthetics */}
                <div className="mt-8 flex flex-col items-center">
                  <svg className="h-16 w-48 text-slate-800 dark:text-slate-200 print:text-black" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <rect x="0" y="0" width="3" height="20" fill="currentColor"/>
                    <rect x="5" y="0" width="1" height="20" fill="currentColor"/>
                    <rect x="8" y="0" width="4" height="20" fill="currentColor"/>
                    <rect x="14" y="0" width="2" height="20" fill="currentColor"/>
                    <rect x="18" y="0" width="1" height="20" fill="currentColor"/>
                    <rect x="22" y="0" width="5" height="20" fill="currentColor"/>
                    <rect x="29" y="0" width="2" height="20" fill="currentColor"/>
                    <rect x="34" y="0" width="4" height="20" fill="currentColor"/>
                    <rect x="40" y="0" width="1" height="20" fill="currentColor"/>
                    <rect x="43" y="0" width="3" height="20" fill="currentColor"/>
                    <rect x="49" y="0" width="5" height="20" fill="currentColor"/>
                    <rect x="56" y="0" width="2" height="20" fill="currentColor"/>
                    <rect x="60" y="0" width="1" height="20" fill="currentColor"/>
                    <rect x="63" y="0" width="4" height="20" fill="currentColor"/>
                    <rect x="69" y="0" width="2" height="20" fill="currentColor"/>
                    <rect x="73" y="0" width="5" height="20" fill="currentColor"/>
                    <rect x="80" y="0" width="1" height="20" fill="currentColor"/>
                    <rect x="83" y="0" width="3" height="20" fill="currentColor"/>
                    <rect x="88" y="0" width="4" height="20" fill="currentColor"/>
                    <rect x="94" y="0" width="2" height="20" fill="currentColor"/>
                    <rect x="98" y="0" width="2" height="20" fill="currentColor"/>
                  </svg>
                  <p className="mt-2 font-mono text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 print:text-black">
                    {device.assetNumber || '000-000-000'}
                  </p>
                </div>

              </div>
            </div>
            
          </div>

          {/* Screen Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 print:hidden">
            <Button variant="outline" onClick={onClose}>
              داخستن
            </Button>
            <Button variant="primary" onClick={handlePrint} className="gap-2 bg-primary-600 hover:bg-primary-700 shadow-primary-600/20">
              <Printer size={20} />
              چاپکردن
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PrintDeviceModal;
