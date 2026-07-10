import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Cpu, Printer } from 'lucide-react';
import Button from '../ui/Button';

const DeviceSummaryModal = ({ isOpen, onClose, title, devices, department, room, systemType }) => {
  if (!isOpen) return null;

  let headerText = '';
  if (room) {
    headerText = systemType === 'EXTERNAL'
      ? `ناوی ژوور: ${room.name} / شارەوانی: ${department?.name || 'نەزانراو'}`
      : `ناوی ژوور: ${room.name} / بەش: ${department?.name || 'نەزانراو'}`;
  } else {
    headerText = systemType === 'EXTERNAL' 
      ? `ناوی شارەوانی: ${department?.name || 'نەزانراو'}`
      : `ناوی بەش: ${department?.name || 'نەزانراو'}`;
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print-isolate print:p-0"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 print:shadow-none print:border-none print:max-h-none print:overflow-visible print:transform-none print:rounded-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 print:bg-transparent print:border-b-2 print:border-slate-200 print:p-4 print:pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 print:hidden">
                <Monitor size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 print:text-black">{title}</h2>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1 mb-1 print:text-black">
                  {headerText}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 print:text-black">
                  کۆی گشتی: {devices.length} ئامێر
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <Button
                variant="outline"
                className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => window.print()}
              >
                <Printer size={18} />
                چاپکردن
              </Button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900/50 print:bg-transparent print:overflow-visible print:p-4">
            <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden print:shadow-none print:ring-0 print:border print:border-slate-200">
              <div className="overflow-x-auto print:overflow-visible">
                <table className="print-beautiful w-full text-sm text-right min-w-[800px] print:min-w-full">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300">#</th>
                      <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300">کۆدی ئامێر (S/N)</th>
                      <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300">جۆر</th>
                      <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300">براند</th>
                      <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300">پرۆسێسەر</th>
                      <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300">هارد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {devices.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-10">
                          <div className="flex flex-col items-center justify-center opacity-50">
                            <Cpu size={40} className="mb-3 text-slate-400" />
                            <p className="font-bold text-slate-500 dark:text-slate-400">هیچ ئامێرێک نەدۆزرایەوە</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      devices.map((device, index) => (
                        <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{index + 1}</td>
                          <td className="px-4 py-3 font-mono font-bold" dir="ltr">{device.serialNumber || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                              {device.category?.name || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-900 dark:text-slate-200 font-medium" dir="ltr">{device.brand || '-'}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400" dir="ltr">{device.cpu || '-'}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400" dir="ltr">{device.hdd || device.ssd || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end print:hidden">
            <Button variant="outline" onClick={onClose}>
              داخستن
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default DeviceSummaryModal;
