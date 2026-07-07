import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, DoorOpen, Monitor } from 'lucide-react';
import Button from '../ui/Button';
import { useSettings } from '../../context/SettingsContext';

const PrintRoomModal = ({ isOpen, onClose, room, department, devices }) => {
  const { settings } = useSettings();

  if (!isOpen || !room) return null;

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
          className="relative w-full max-w-5xl h-[90vh] bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col print:shadow-none print:rounded-none print:w-full print:h-auto print:max-h-none print:max-w-none print:bg-white print:text-black"
        >
          {/* Screen Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 print:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                <Printer size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                چاپکردنی ئامێرەکانی ژوور
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
          <div className="flex-1 overflow-y-auto p-8 print:p-8 print:overflow-visible" id="printable-area">
            
            {/* Document Header (Print Only) */}
            <div className="flex items-start justify-between border-b-4 border-slate-900 dark:border-slate-700 print:border-black pb-6 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 print:text-black mb-2">{settings?.orgName || 'ناوی فەرمانگە'}</h1>
                <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300 print:text-slate-800 mb-2">لیستی ئامێرەکان</h2>
                <div className="flex items-center gap-2 text-slate-600 print:text-slate-800">
                  <span className="font-bold">{department?.name || 'بەشی نەزانراو'}</span>
                  <span>/</span>
                  <span className="font-bold">{room?.name || 'ژووری نەزانراو'}</span>
                  {room?.floor && (
                    <>
                      <span>/</span>
                      <span className="font-bold text-sm bg-slate-100 print:bg-slate-200 px-2 py-1 rounded-md">نهۆمی {room.floor}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-left">
                {settings?.orgLogo ? (
                  <img src={settings.orgLogo} alt="Logo" className="w-24 h-24 object-contain mb-2 ml-auto" />
                ) : (
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 print:bg-slate-100 rounded-xl mb-2 flex items-center justify-center border-2 border-dashed border-slate-300 print:border-slate-300">
                    <span className="text-slate-400 font-medium text-xs">لۆگۆ</span>
                  </div>
                )}
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 print:text-slate-600">
                  کۆی گشتی: {devices?.length || 0} ئامێر
                </p>
                <p className="text-xs font-bold text-slate-400 print:text-slate-500 dark:text-slate-400 mt-1">
                  ڕێکەوت: {new Date().toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 print:border-black overflow-hidden">
              <table className="w-full text-sm text-center">
                <thead className="bg-slate-100 dark:bg-slate-800 print:bg-slate-200 border-b-2 border-slate-200 dark:border-slate-700 print:border-black">
                  <tr>
                    <th className="px-3 py-4 font-black text-slate-800 dark:text-slate-100 print:text-black border-l border-slate-200 dark:border-slate-700 print:border-black/20 w-12">#</th>
                    <th className="px-3 py-4 font-black text-slate-800 dark:text-slate-100 print:text-black border-l border-slate-200 dark:border-slate-700 print:border-black/20">جۆر</th>
                    <th className="px-3 py-4 font-black text-slate-800 dark:text-slate-100 print:text-black border-l border-slate-200 dark:border-slate-700 print:border-black/20">براند / مۆدێل</th>
                    <th className="px-3 py-4 font-black text-slate-800 dark:text-slate-100 print:text-black border-l border-slate-200 dark:border-slate-700 print:border-black/20">کۆدی ئامێر (S/N)</th>
                    <th className="px-3 py-4 font-black text-slate-800 dark:text-slate-100 print:text-black border-l border-slate-200 dark:border-slate-700 print:border-black/20">تایبەتمەندی (Specs)</th>
                    <th className="px-3 py-4 font-black text-slate-800 dark:text-slate-100 print:text-black border-l border-slate-200 dark:border-slate-700 print:border-black/20">باری ئامێر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 print:divide-black/20">
                  {!devices || devices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10">
                        <span className="font-bold text-slate-400">هیچ ئامێرێک نەدۆزرایەوە لەم ژوورەدا</span>
                      </td>
                    </tr>
                  ) : (
                    devices.map((device, index) => (
                      <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 print:hover:bg-transparent">
                        <td className="px-3 py-3 font-bold text-slate-500 dark:text-slate-400 print:text-slate-600 border-l border-slate-100 print:border-black/10 text-center">
                          {index + 1}
                        </td>
                        <td className="px-3 py-3 border-l border-slate-100 print:border-black/10">
                          <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 print:bg-transparent print:border print:border-slate-300 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 print:text-black">
                            {device.category?.name || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-3 border-l border-slate-100 print:border-black/10 text-center" dir="ltr">
                          <div className="font-black text-slate-800 dark:text-slate-200 print:text-black">{device.brand}</div>
                          {/* Model removed */}
                        </td>
                        <td className="px-3 py-3 border-l border-slate-100 print:border-black/10 text-center" dir="ltr">
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 print:text-black">
                            {device.serialNumber || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-3 border-l border-slate-100 print:border-black/10" dir="ltr">
                          {device.cpu || device.ram || device.hdd || device.gpu ? (
                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 print:text-black space-y-1 text-center">
                              {device.cpu && <div>{device.cpu}</div>}
                              {(device.ram || device.hdd || device.ssd) && (
                                <div className="text-[10px] text-slate-400 print:text-slate-500 dark:text-slate-400">
                                  {device.ram && `${device.ram} RAM`} 
                                  {device.ram && (device.hdd || device.ssd) && ' | '}
                                  {(device.hdd || device.ssd) && `${device.hdd || device.ssd} Storage`}
                                </div>
                              )}
                              {device.gpu && <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-slate-500 dark:text-slate-400">{device.gpu}</div>}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-bold">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 border-l border-slate-100 print:border-black/10">
                          <span className="text-xs font-bold text-slate-600 print:text-black">
                            {device.status === 'ACTIVE' ? 'کاردەکات' : 
                             device.status === 'BROKEN' ? 'لەکارکەوتووە' : 
                             device.status === 'UNDER_MAINTENANCE' ? 'چاککردنەوە' : 
                             device.status === 'INACTIVE' ? 'بەکارناهێنرێت' : 
                             device.status === 'DISPOSED' ? 'فڕێدراوە' : device.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Print Footer */}
            <div className="hidden print:flex mt-12 pt-4 border-t-2 border-black justify-between text-sm font-bold">
              <div>واژووی بەڕێوەبەری ئایتی:</div>
              <div>واژووی وەرگر:</div>
            </div>

          </div>

          {/* Screen Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 print:hidden">
            <Button variant="outline" onClick={onClose}>
              داخستن
            </Button>
            <Button variant="primary" onClick={handlePrint} className="gap-2 bg-primary-600 hover:bg-primary-700 shadow-primary-600/20">
              <Printer size={20} />
              چاپکردنی لیستی ژوور
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PrintRoomModal;
