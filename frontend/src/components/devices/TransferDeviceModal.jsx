import { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MapPin } from 'lucide-react';
import Button from '../ui/Button';

const TransferDeviceModal = ({ isOpen, onClose, onTransfer, device }) => {
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    departmentId: '',
    roomId: '',
    reason: ''
  });

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFormData({
        departmentId: '',
        roomId: '',
        reason: ''
      });

      const fetchDepartments = async () => {
        try {
          const res = await axios.get('/departments');
          if (res.data.success) {
            setDepartments(res.data.data);
          }
        } catch (err) {
          console.error('Failed to fetch departments', err);
        }
      };
      fetchDepartments();
    }
  }, [isOpen]);

  // Handle department change to fetch/filter rooms
  useEffect(() => {
    if (formData.departmentId) {
      const selectedDept = departments.find(d => d.id === parseInt(formData.departmentId));
      if (selectedDept && selectedDept.rooms) {
        setRooms(selectedDept.rooms);
      } else {
        setRooms([]);
      }
      // Reset room when department changes
      setFormData(prev => ({ ...prev, roomId: '' }));
    } else {
      setRooms([]);
    }
  }, [formData.departmentId, departments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.departmentId || !formData.roomId || !formData.reason) {
      setError('تکایە هەموو زانیارییەکان پڕبکەرەوە.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.put(`/devices/${device.id}/transfer`, formData);
      onTransfer();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'هەڵەیەک ڕوویدا لە کاتی گواستنەوە.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !device) return null;

  const currentDept = device.department?.name || departments.find(d => d.id === device.departmentId)?.name || 'نەزانراو';
  const currentRoom = device.room?.name || departments.find(d => d.id === device.departmentId)?.rooms?.find(r => r.id === device.roomId)?.name || 'نەزانراو';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="text-primary-500" />
              گواستنەوەی ئامێر
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-3 text-sm font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                {error}
              </div>
            )}

            {/* Current Location Info */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">زانیاری ئامێر و شوێنی ئێستا:</p>
              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {device.category?.name} - {device.brand}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                لە: {currentDept} / {currentRoom}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  بەشی نوێ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">-- هەڵبژێرە --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ژووری نوێ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value }))}
                  disabled={!formData.departmentId || rooms.length === 0}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                >
                  <option value="">-- هەڵبژێرە --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  هۆکاری گواستنەوە <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="بۆ نموونە: لەسەر داوای بەڕێوەبەر..."
                  rows="3"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="submit" disabled={loading} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2">
                {loading ? 'چاوەڕێ بە...' : (
                  <>
                    <Send size={18} />
                    گواستنەوە
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="px-6 rounded-xl font-bold border-slate-300 dark:border-slate-700">
                پاشگەزبوونەوە
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TransferDeviceModal;
