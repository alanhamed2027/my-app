import { useState, useEffect, useRef, useMemo } from 'react';
import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { X, Wrench, Camera, UploadCloud, FileText } from 'lucide-react';

const AddMaintenanceModal = ({ isOpen, onClose, onAdded, editData, onUpdated }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    departmentId: '',
    roomId: '',
    maintenanceTask: '',
    requesterName: '',
    deviceBrandModel: '',
    deviceSerialNumber: '',
    notes: '',
    visitDate: new Date().toISOString().split('T')[0],
  });
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [deptRes, roomRes] = await Promise.all([
            axios.get('/departments'),
            axios.get('/departments/rooms')
          ]);
          if (deptRes.data.success) setDepartments(deptRes.data.data);
          if (roomRes.data.success) setRooms(roomRes.data.data);
        } catch (err) {
          console.error('Failed to fetch data', err);
        }
      };
      fetchData();
      
      if (editData) {
        setFormData({
          departmentId: editData.departmentId || '',
          roomId: editData.roomId || '',
          maintenanceTask: editData.maintenanceTask || '',
          requesterName: editData.requesterName || '',
          deviceType: editData.deviceType || '',
          deviceBrandModel: editData.deviceBrandModel || '',
          deviceSerialNumber: editData.deviceSerialNumber || '',
          notes: editData.notes || '',
          visitDate: editData.visitDate ? new Date(editData.visitDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        });
        setPreview(editData.documentUrl || null);
      } else {
        setFormData({
          departmentId: '',
          roomId: '',
          maintenanceTask: '',
          requesterName: '',
          deviceType: '',
          deviceBrandModel: '',
          deviceSerialNumber: '',
          notes: '',
          visitDate: new Date().toISOString().split('T')[0],
        });
        setPreview(null);
      }
      setFile(null);
      setError(null);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Cascading logic
      if (name === 'departmentId') {
        newData.roomId = '';
      }
      
      return newData;
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.visitDate) {
      setError('تکایە بەروار دیاری بکە');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      if (formData.departmentId) data.append('departmentId', formData.departmentId);
      if (formData.roomId) data.append('roomId', formData.roomId);
      if (formData.maintenanceTask) data.append('maintenanceTask', formData.maintenanceTask);
      if (formData.requesterName) data.append('requesterName', formData.requesterName);
      if (formData.deviceType) data.append('deviceType', formData.deviceType);
      if (formData.deviceBrandModel) data.append('deviceBrandModel', formData.deviceBrandModel);
      if (formData.deviceSerialNumber) data.append('deviceSerialNumber', formData.deviceSerialNumber);
      if (formData.notes) data.append('notes', formData.notes);
      data.append('visitDate', formData.visitDate);
      
      if (file) {
        data.append('document', file);
      }

      let response;
      if (editData) {
        response = await axios.put(`/maintenance/${editData.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          onUpdated(response.data.data);
          onClose();
        }
      } else {
        response = await axios.post('/maintenance', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          onAdded(response.data.data);
          onClose();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'هەڵەیەک ڕوویدا لە کاتی سەیڤکردن');
    } finally {
      setLoading(false);
    }
  };

  // Filtered dropdown lists based on selections
  const filteredRooms = formData.departmentId 
    ? rooms.filter(r => r.departmentId == formData.departmentId)
    : rooms;

  const availableDevices = useMemo(() => {
    if (!formData.departmentId || !formData.roomId) return [];
    const dept = departments.find(d => d.id == formData.departmentId);
    if (!dept) return [];
    const room = dept.rooms?.find(r => r.id == formData.roomId);
    if (!room) return [];
    return room.devices || [];
  }, [formData.departmentId, formData.roomId, departments]);

  const handleDeviceSelect = (e) => {
    const deviceId = e.target.value;
    if (!deviceId) {
      setFormData(prev => ({ ...prev, deviceBrandModel: '', deviceSerialNumber: '', deviceType: '' }));
      return;
    }
    const device = availableDevices.find(d => d.id == deviceId);
    if (device) {
      setFormData(prev => ({
        ...prev,
        deviceType: device.category?.name || '',
        deviceBrandModel: `${device.brand || ''} ${device.model || ''}`.trim(),
        deviceSerialNumber: device.serialNumber || device.assetNumber || ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 transition-all flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
              <Wrench size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                {editData ? 'دەستکاریکردنی چاککردنەوە' : 'فۆرمی چاککردنەوە'}
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {editData ? 'نوێکردنەوەی زانیارییەکان' : 'تۆمارێکی خێرا و سادە'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400">
              {error}
            </div>
          )}

          <form id="maintenance-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">١. بەش</label>
                <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 px-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
                  <option value="">هەڵبژێرە...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">٢. ژوور</label>
                <select name="roomId" value={formData.roomId} onChange={handleChange} className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 px-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
                  <option value="">هەڵبژێرە...</option>
                  {filteredRooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">هەڵبژاردنی ئامێر لەم ژوورە (ئۆتۆماتیکی زانیارییەکان پڕدەکاتەوە)</label>
                <select onChange={handleDeviceSelect} className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 px-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800">
                  <option value="">لەناو ئامێرەکانی ژوور هەڵبژێرە...</option>
                  {availableDevices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.category?.name} - {d.brand} {d.model} {d.serialNumber ? `(S/N: ${d.serialNumber})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">٣. جۆری ئامێر</label>
                <Input type="text" name="deviceType" value={formData.deviceType} onChange={handleChange} placeholder="وەکو: کۆمپیوتەر، پرینتەر، سکانەر..." className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">٤. براند / مۆدێل</label>
                <Input type="text" name="deviceBrandModel" value={formData.deviceBrandModel} onChange={handleChange} placeholder="براند یان مۆدێلی ئامێرەکە" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">٥. کۆدی ئامێر (S/N)</label>
                <Input type="text" name="deviceSerialNumber" value={formData.deviceSerialNumber} onChange={handleChange} placeholder="S/N یان Asset Number" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800" dir="ltr" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">٦. چاککردن</label>
                <Input type="text" name="maintenanceTask" value={formData.maintenanceTask} onChange={handleChange} placeholder="جۆری چاککردنەوەکە بنووسە" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">٧. داواکار</label>
                <Input type="text" name="requesterName" value={formData.requesterName} onChange={handleChange} placeholder="ناوی داواکار بنووسە" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">٨. تەکنیکار (ئایتی)</label>
                <Input type="text" value={user?.name || ''} disabled className="h-12 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold opacity-70" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">٨. بەروار <span className="text-red-500">*</span></label>
                <Input type="date" name="visitDate" value={formData.visitDate} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">٧. سکان یان وێنەی فۆرم</label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:bg-slate-800 cursor-pointer transition-colors group overflow-hidden"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*,application/pdf"
                  capture="environment"
                />
                
                {preview ? (
                  <div className="relative w-full flex justify-center">
                    <img src={preview} alt="Preview" className="max-h-[150px] rounded-xl shadow-md object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <p className="text-white font-bold flex items-center gap-2"><UploadCloud size={20} /> گۆڕین</p>
                    </div>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-2 text-primary-600 dark:text-primary-400">
                    <FileText size={32} />
                    <span className="font-bold text-sm">{file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                        <Camera size={24} />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">پەنجە بنێ بۆ کردنەوەی کامێرا یان هەڵبژاردنی فایل</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex gap-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12 font-bold text-slate-600">
            پاشگەزبوونەوە
          </Button>
          <Button type="submit" form="maintenance-form" disabled={loading} className="flex-1 rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/30 text-lg">
            {loading ? 'چاوەڕێ بکە...' : 'سەیڤکردن'}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default AddMaintenanceModal;
