import { useState } from 'react';
import axios from '../../services/axios';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { X, Building2, Plus, Trash2, DoorOpen } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

const AddDepartmentModal = ({ isOpen, onClose, onAdded }) => {
  const { systemType } = useSystem();
  const [name, setName] = useState('');
  const [rooms, setRooms] = useState([]); // Array of { name: '', floor: '', building: '' }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleAddRoom = () => {
    setRooms([...rooms, { name: '', floor: '', building: '' }]);
  };

  const handleRemoveRoom = (index) => {
    const newRooms = [...rooms];
    newRooms.splice(index, 1);
    setRooms(newRooms);
  };

  const handleRoomChange = (index, field, value) => {
    const newRooms = [...rooms];
    newRooms[index][field] = value;
    setRooms(newRooms);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(systemType === 'EXTERNAL' ? 'تکایە ناوی شارەوانی بنووسە' : 'تکایە ناوی بەش بنووسە');
      return;
    }

    // Filter out empty rooms
    const validRooms = rooms.filter(r => r.name.trim() !== '');

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/departments', { 
        name,
        rooms: validRooms
      });
      
      if (response.data.success) {
        onAdded(response.data.data);
        setName('');
        setRooms([]);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || (systemType === 'EXTERNAL' ? 'هەڵەیەک ڕوویدا لە کاتی زیادکردنی شارەوانی' : 'هەڵەیەک ڕوویدا لە کاتی زیادکردنی بەش'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 p-8 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose}
          className="absolute left-6 top-6 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="mb-6 flex items-center gap-4 flex-shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400">
            <Building2 size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {systemType === 'EXTERNAL' ? 'زیادکردنی شارەوانی' : 'زیادکردنی بەش و ژوورەکان'}
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              {systemType === 'EXTERNAL' ? 'شارەوانییەکی نوێ و ژوورەکانی تۆمار بکە' : 'بەشێکی نوێ و ژوورەکانی تۆمار بکە'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto pr-2 pb-4 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {systemType === 'EXTERNAL' ? 'ناوی شارەوانی' : 'ناوی بەش'} <span className="text-red-500">*</span>
              </label>
              <Input 
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder={systemType === 'EXTERNAL' ? 'نموونە: شارەوانی ڕانیە' : 'نموونە: بەشی تەکنەلۆجیای زانیاری'}
                className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4"
                autoFocus
              />
              {error && <p className="text-sm font-semibold text-red-500 mt-2">{error}</p>}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <DoorOpen size={18} className="text-primary-500" />
                  {systemType === 'EXTERNAL' ? 'لیستی ژوورەکانی ئەم شارەوانییە' : 'لیستی ژوورەکانی ئەم بەشە'}
                </label>
                <Button 
                  type="button"
                  onClick={handleAddRoom}
                  className="h-9 px-3 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 text-xs font-bold gap-1"
                >
                  <Plus size={14} />
                  ژووری نوێ
                </Button>
              </div>

              <div className="space-y-3">
                {rooms.map((room, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex-1 w-full">
                      <Input 
                        placeholder="ناوی ژوور *"
                        value={room.name}
                        onChange={(e) => handleRoomChange(index, 'name', e.target.value)}
                        className="h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    {systemType !== 'EXTERNAL' && (
                      <div className="w-full sm:w-24">
                        <Input 
                          placeholder="نهۆم"
                          value={room.floor}
                          onChange={(e) => handleRoomChange(index, 'floor', e.target.value)}
                          className="h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-center"
                        />
                      </div>
                    )}
                    <button 
                      type="button"
                      onClick={() => handleRemoveRoom(index)}
                      className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                {rooms.length === 0 && (
                  <div className="text-center py-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-400">
                      {systemType === 'EXTERNAL' ? 'هیچ ژوورێک زیاد نەکراوە بۆ ئەم شارەوانییە' : 'هیچ ژوورێک زیاد نەکراوە بۆ ئەم بەشە'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-auto border-t border-slate-200 dark:border-slate-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 rounded-xl h-12 font-bold text-slate-600"
            >
              پاشگەزبوونەوە
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 rounded-xl h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-600/30"
            >
              {loading ? 'چاوەڕێ بکە...' : 'پاشەکەوتکردن'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentModal;
