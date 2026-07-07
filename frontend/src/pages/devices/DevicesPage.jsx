import { useState, useEffect, Fragment } from 'react';
import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Search, Trash2, Edit, Printer, Cpu, Building2, DoorOpen, ChevronRight, ArrowUpDown, ChevronUp, ChevronDown, Monitor, Zap, AlertTriangle, Info, Scan, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import EditDeviceModal from '../../components/devices/EditDeviceModal';
import TransferDeviceModal from '../../components/devices/TransferDeviceModal';
import PrintDeviceModal from '../../components/devices/PrintDeviceModal';
import PrintRoomModal from '../../components/devices/PrintRoomModal';
import CustomCategoryDropdown from '../../components/devices/CustomCategoryDropdown';
import CustomSpecDropdown from '../../components/devices/CustomSpecDropdown';

const CopierIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left Tray */}
    <path d="M1 8h4v4l-4-1.5z" fill="currentColor" opacity="0.9" />
    {/* Right Tray */}
    <path d="M19 10h4v2.5l-4 1z" fill="currentColor" opacity="0.9" />
    
    {/* Top left bump */}
    <path d="M3 2h3v3H2z" fill="currentColor" opacity="0.9" />
    {/* Top ADF */}
    <path d="M5 2h9a1 1 0 0 1 1 1v3H5V2z" fill="currentColor" opacity="0.5" />
    
    {/* Main Body */}
    <rect x="5" y="6" width="14" height="16" rx="1" fill="currentColor" opacity="0.3" />
    
    {/* Screen */}
    <rect x="13" y="7" width="5" height="4.5" fill="currentColor" opacity="0.1" />
    
    {/* Lines */}
    <path d="M7 8h4M7 9.5h4M7 11h4" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" opacity="0.6" />
    
    {/* Drawer 1 */}
    <rect x="6" y="13.5" width="12" height="3.5" fill="currentColor" opacity="0.15" />
    {/* Handle 1 */}
    <path d="M10 13.5h4v1.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z" fill="currentColor" opacity="0.8" />
    
    {/* Drawer 2 */}
    <rect x="6" y="18" width="12" height="3.5" fill="currentColor" opacity="0.15" />
    {/* Handle 2 */}
    <path d="M10 18h4v1.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z" fill="currentColor" opacity="0.8" />
  </svg>
);

const DevicesPage = () => {
  const { user } = useAuth();
  const { systemType } = useSystem();
  
  // States
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Maintenance Expand State
  const [expandedDeviceId, setExpandedDeviceId] = useState(null);
  const [deviceMaintenances, setDeviceMaintenances] = useState({});
  const [loadingMaintenances, setLoadingMaintenances] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState(null);
  const [deviceToTransfer, setDeviceToTransfer] = useState(null);
  const [deviceToPrint, setDeviceToPrint] = useState(null);
  const [isPrintRoomModalOpen, setIsPrintRoomModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Inline Add State
  const [categories, setCategories] = useState([]);
  const [inlineLoading, setInlineLoading] = useState(false);
  const [inlineForm, setInlineForm] = useState({ categoryId: '', brand: '', model: '', serialNumber: '', ram: '', hdd: '', cpu: '', gpu: '', ups: '', status: 'ACTIVE' });
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Fetch Departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/departments');
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch departments', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    const fetchCats = async () => {
      try {
        const res = await axios.get('/devices/categories');
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {}
    };
    fetchCats();
  }, []);

  // Sync selectedDepartment and selectedRoom when departments are updated (e.g. after add, edit, delete)
  useEffect(() => {
    if (departments.length > 0 && selectedDepartment) {
      const updatedDept = departments.find(d => d.id === selectedDepartment.id);
      if (updatedDept) {
        setSelectedDepartment(updatedDept);
        if (selectedRoom) {
          const updatedRoom = updatedDept.rooms?.find(r => r.id === selectedRoom.id);
          if (updatedRoom) {
            setSelectedRoom(updatedRoom);
            // This ensures if a device was deleted, it disappears from the list based on DB source of truth
            setDevices(updatedRoom.devices || []);
          }
        }
      }
    }
  }, [departments]);

  // Fetch Devices based on current state (search or room)
  const fetchDevices = async () => {
    setLoading(true);
    try {
      let url = '/devices?limit=100'; // Fetch up to 100 for now to avoid pagination logic
      
      if (searchTerm) {
        // Global search overrides everything
        url += `&search=${searchTerm}`;
      } else if (selectedRoom) {
        // Fetch devices for specific room
        url += `&roomId=${selectedRoom.id}`;
      } else {
        // If no search and no room selected, don't fetch devices
        setDevices([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setDevices(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch devices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) return;
    
    const delayDebounceFn = setTimeout(() => {
      fetchDevices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    if (!window.confirm('دڵنیایت لە سڕینەوەی ئەم ئامێرە؟ ئەم کارە هەڵناوەشێتەوە!')) return;
    
    try {
      const response = await axios.delete(`/devices/${id}`);
      if (response.data.success) {
        setDevices(devices.filter(d => d.id !== id));
        fetchDepartments();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'هەڵەیەک ڕوویدا');
    }
  };

  const handleExpandDevice = async (device) => {
    if (expandedDeviceId === device.id) {
      setExpandedDeviceId(null);
      return;
    }
    setExpandedDeviceId(device.id);
    if (!deviceMaintenances[device.id]) {
      setLoadingMaintenances(true);
      try {
        const res = await axios.get(`/reports/maintenance?serialNumber=${device.serialNumber}`);
        setDeviceMaintenances(prev => ({
          ...prev,
          [device.id]: res.data.data?.logs || []
        }));
      } catch (err) {
        console.error("Error fetching maintenance", err);
      } finally {
        setLoadingMaintenances(false);
      }
    }
  };

  // View Handlers
  const handleSelectDepartment = (dept) => {
    setSelectedDepartment(dept);
    setSearchTerm(''); // Clear search when navigating hierarchy
    setStep(2);
  };

  const handleEdit = (device) => {
    setDeviceToEdit({
      ...device,
      department: device.department || selectedDepartment,
      room: device.room || selectedRoom
    });
  };

  const handlePrint = (device) => {
    setDeviceToPrint({
      ...device,
      department: device.department || selectedDepartment,
      room: device.room || selectedRoom
    });
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setDevices(room.devices || []); // Instantly load pre-fetched devices
    setLoading(false); // No need to load
    setSearchTerm(''); // Clear search when navigating hierarchy
    setStep(3);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setSelectedRoom(null);
    } else if (step === 2) {
      setStep(1);
      setSelectedDepartment(null);
    }
  };

  // Determine what to show
  const showGlobalSearch = false; // Search removed per request
  const isTableView = step === 3;

  // Sorting Logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const parseStorage = (val) => {
    if (!val) return 0;
    const num = parseFloat(val);
    if (isNaN(num)) return 0;
    if (val.toUpperCase().includes('TB')) return num * 1024;
    return num;
  };

  const sortedDevices = [...devices].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aVal = a[sortConfig.key] || '';
    let bVal = b[sortConfig.key] || '';
    
    if (sortConfig.key === 'hdd') {
        aVal = a.hdd || a.ssd || '';
        bVal = b.hdd || b.ssd || '';
    }

    // Smart numeric sort for RAM and HDD
    if (sortConfig.key === 'ram' || sortConfig.key === 'hdd') {
      const aNum = parseStorage(aVal);
      const bNum = parseStorage(bVal);
      if (aNum < bNum) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aNum > bNum) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    }

    // Default string sort
    const aStr = aVal.toString().toLowerCase();
    const bStr = bVal.toString().toLowerCase();
    if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-emerald-500" /> : <ChevronDown size={14} className="text-emerald-500" />;
  };

  const isComputer = (categoryId) => {
    if (!categoryId) return false;
    const cat = categories.find(c => c.id === parseInt(categoryId));
    if (!cat) return false;
    const name = cat.name.toLowerCase();
    return name.includes('computer') || name.includes('laptop') || name.includes('کۆمپیوتەر') || name.includes('لاپتۆپ') || name.includes('کۆمپیتەر');
  };

  const handleInlineSubmit = async () => {
    if (!inlineForm.categoryId) {
      alert('تکایە جۆری ئامێر هەڵبژێرە');
      return;
    }
    setInlineLoading(true);
    try {
      const payload = {
        ...inlineForm,
        categoryId: parseInt(inlineForm.categoryId),
        departmentId: selectedDepartment?.id,
        roomId: selectedRoom?.id
      };
      if (!isComputer(inlineForm.categoryId)) {
        delete payload.ram; delete payload.hdd; delete payload.cpu; delete payload.gpu; delete payload.ups;
      }
      const res = await axios.post('/devices', payload);
      if (res.data.success) {
        setInlineForm(prev => ({ ...prev, serialNumber: '' }));
        fetchDevices();
        fetchDepartments();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'هەڵەیەک ڕوویدا');
    } finally {
      setInlineLoading(false);
    }
  };

  // --- Animation Variants ---
  const slideVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  // Helper to render Intelligent Room Analytics (Step 3)
  const renderRoomAnalytics = () => {
    let computerCount = 0;
    let printerCount = 0;
    let copierCount = 0;
    let scannerCount = 0;

    sortedDevices.forEach(device => {
      const cat = (device.category?.name || '').toLowerCase();
      const isComputer = ['computer', 'desktop', 'laptop', 'کۆمپیوتەر', 'لاپتۆپ'].some(kw => cat.includes(kw));
      const isPrinter = ['printer', 'پرینتەر', 'چاپکەر'].some(kw => cat.includes(kw));
      const isCopier = ['copier', 'ئیستنساخ', 'لەبەرگرتنەوە'].some(kw => cat.includes(kw));
      const isScanner = ['scanner', 'سکانەر'].some(kw => cat.includes(kw));
      
      if (isComputer) {
        computerCount++;
      } else if (isPrinter) {
        printerCount++;
      } else if (isCopier) {
        copierCount++;
      } else if (isScanner) {
        scannerCount++;
      }
    });

    if (computerCount === 0 && printerCount === 0 && copierCount === 0 && scannerCount === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-2">
        {/* Total Computers */}
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-r-4 border-r-blue-500">
          <div className="relative z-10 flex flex-row items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide">کۆمپیوتەر / لاپتۆپ</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Cpu size={20} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {Number(computerCount || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Printers */}
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-r-4 border-r-primary-500">
          <div className="relative z-10 flex flex-row items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide">پرینتەر (چاپکەر)</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
              <Printer size={20} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {Number(printerCount || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Copiers */}
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-r-4 border-r-emerald-500">
          <div className="relative z-10 flex flex-row items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide">ئیستنساخ</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <CopierIcon size={20} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {Number(copierCount || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Scanners */}
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-r-4 border-r-rose-500">
          <div className="relative z-10 flex flex-row items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide">سکانەر</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
              <Scan size={20} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {Number(scannerCount || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper to render Global Summary Banner (Step 1)
  const renderGlobalSummary = (deviceList) => {
    let computerCount = 0;
    let printerCount = 0;
    let copierCount = 0;
    let otherCount = 0;

    deviceList.forEach(device => {
      const catName = (device.category?.name || '').toLowerCase();
      
      const isComputer = ['computer', 'desktop', 'laptop', 'کۆمپیوتەر', 'لاپتۆپ'].some(kw => catName.includes(kw));
      const isPrinter = ['printer', 'پرینتەر', 'چاپکەر'].some(kw => catName.includes(kw));
      const isCopier = ['copier', 'scanner', 'ئیستنساخ', 'سکانەر', 'لەبەرگرتنەوە'].some(kw => catName.includes(kw));

      if (isComputer) {
        computerCount++;
      } else if (isPrinter) {
        printerCount++;
      } else if (isCopier) {
        copierCount++;
      } else {
        otherCount++;
      }
    });

    return (
      <div className="bg-gradient-to-l from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex items-center justify-center w-full">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
            {/* Computer Stat */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex-1 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-1 h-full bg-blue-500 rounded-l-full transform origin-right scale-y-0 group-hover:scale-y-100 transition-transform"></div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 text-xs font-bold">کۆمپیوتەر</span>
                <Cpu size={14} className="text-blue-400" />
              </div>
              <div className="text-2xl font-black">{computerCount}</div>
            </div>

            {/* Printer Stat */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex-1 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-1 h-full bg-primary-500 rounded-l-full transform origin-right scale-y-0 group-hover:scale-y-100 transition-transform"></div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 text-xs font-bold">پرینتەر</span>
                <Printer size={14} className="text-primary-400" />
              </div>
              <div className="text-2xl font-black">{printerCount}</div>
            </div>

            {/* Copier Stat */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex-1 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-1 h-full bg-emerald-500 rounded-l-full transform origin-right scale-y-0 group-hover:scale-y-100 transition-transform"></div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 text-xs font-bold">ئیستنساخ</span>
                <CopierIcon size={18} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-black">{copierCount}</div>
            </div>

            {/* Other Stat */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex-1 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-1 h-full bg-slate-400 rounded-l-full transform origin-right scale-y-0 group-hover:scale-y-100 transition-transform"></div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 text-xs font-bold">ئامێری تر</span>
                <div className="w-3.5 h-3.5 flex gap-[1px] justify-center items-center text-slate-400">
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                </div>
              </div>
              <div className="text-2xl font-black">{otherCount}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper to render Summary Dashboard
  const renderSummaryCards = (deviceList) => {
    let computerCount = 0;
    let printerCount = 0;
    let copierCount = 0;
    let scannerCount = 0;

    deviceList.forEach(device => {
      const catName = (device.category?.name || '').toLowerCase();
      
      const isComputer = ['computer', 'desktop', 'laptop', 'کۆمپیوتەر', 'لاپتۆپ'].some(kw => catName.includes(kw));
      const isPrinter = ['printer', 'پرینتەر', 'چاپکەر'].some(kw => catName.includes(kw));
      const isCopier = ['copier', 'ئیستنساخ', 'لەبەرگرتنەوە'].some(kw => catName.includes(kw));
      const isScanner = ['scanner', 'سکانەر'].some(kw => catName.includes(kw));

      if (isComputer) {
        computerCount++;
      } else if (isPrinter) {
        printerCount++;
      } else if (isCopier) {
        copierCount++;
      } else if (isScanner) {
        scannerCount++;
      }
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Computers Summary */}
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-r-4 border-r-blue-500">
          <div className="relative z-10 flex flex-row items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide">کۆمپیوتەر / لاپتۆپ</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Cpu size={20} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {Number(computerCount || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Printers Summary */}
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-r-4 border-r-primary-500">
          <div className="relative z-10 flex flex-row items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide">پرینتەر (چاپکەر)</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
              <Printer size={20} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {Number(printerCount || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Copiers Summary */}
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-r-4 border-r-emerald-500">
          <div className="relative z-10 flex flex-row items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide">ئیستنساخ</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <CopierIcon size={20} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {Number(copierCount || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Scanners Summary */}
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-r-4 border-r-rose-500">
          <div className="relative z-10 flex flex-row items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide">سکانەر</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
              <Scan size={20} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {Number(scannerCount || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-10 min-h-screen">
      
      {/* Header - Only show in step 1 */}
      {step === 1 && !showGlobalSearch && (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50 dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          {!showGlobalSearch && step > 1 ? (
            <button 
              onClick={handleBack}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/30">
              <Cpu size={28} />
            </div>
          )}
          
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 dark:text-slate-100">
              {systemType === 'EXTERNAL' ? 'تۆمارى سەرجەم ئامێرى ئەلکترۆنى شارەوانییەکان' : 'تۆمارى سەرجەم ئامێرى ئەلکترۆنى بەشەکان'}
            </h2>
            <p className="text-sm font-bold text-rose-500 dark:text-rose-400 mt-1">تکایە بەشێک هەڵبژێرە بۆ بینینی ئامێرەکان</p>
          </div>
        </div>
      </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* STEP 1: DEPARTMENTS */}
        {!showGlobalSearch && step === 1 && (
          <motion.div 
            key="departments"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-8"
          >
            {/* Global Summary removed as per user request */}

            {/* Instruction Banner removed to save space */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {departments.map(dept => (
                <motion.button
                  key={dept.id}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectDepartment(dept)}
                  className="group flex flex-col items-center justify-center gap-4 rounded-3xl bg-slate-50 dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-blue-300 dark:hover:ring-blue-500 hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform relative">
                    <Building2 size={32} />
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-slate-800 dark:text-slate-100">{dept.name}</span>
                    <span className="inline-block mt-2 text-xs font-bold text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      {dept.rooms?.length || 0} ژوور
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: DEPARTMENT OVERVIEW & ROOMS */}
        {!showGlobalSearch && step === 2 && (
          <motion.div 
            key="rooms"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-6"
          >
            {/* Prominent Section Title */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleBack}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-colors"
                    title="گەڕانەوە"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                      {systemType === 'EXTERNAL' 
                        ? `ژوورەکانى ناو فەرمانگەى ${selectedDepartment?.name}`
                        : `ژوورەکانی بەشی ${selectedDepartment?.name}`}
                    </h3>
                    <p className="text-sm font-bold text-rose-500 dark:text-rose-400 mt-1">
                      تکایە ژوورێک هەڵبژێرە بۆ بینینی ئامێرەکان
                    </p>
                  </div>
                </div>
              </div>

            {/* Instruction Banner for Step 2 removed to save space */}

            {/* Department Summary Cards wrapped in an Alert Container */}
            <div className="bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl p-5 border-2 border-blue-100 dark:border-blue-800/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-xl text-blue-600 dark:text-blue-300">
                  <Info size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">
                    {systemType === 'EXTERNAL'
                      ? `ئەم ئامارانەی خوارەوە کۆی گشتی سەرجەم ئامێرە تۆمارکراوەکانی ${selectedDepartment?.name}یە`
                      : `ئەم ئامارانەی خوارەوە کۆی گشتی سەرجەم ئامێرە تۆمارکراوەکانی بەشی ${selectedDepartment?.name}یە`
                    }
                  </h4>
                </div>
              </div>
              {(() => {
                const allDeptDevices = [
                  ...(selectedDepartment?.devices || []),
                  ...(selectedDepartment?.rooms?.flatMap(r => r.devices || []) || [])
                ];
                return renderSummaryCards(allDeptDevices);
              })()}
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {(!selectedDepartment?.rooms || selectedDepartment.rooms.length === 0) ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800">
                  <DoorOpen size={64} className="mb-4 opacity-20" />
                  <p className="text-xl font-bold">هیچ ژوورێک لەم بەشەدا نییە.</p>
                </div>
              ) : (
                selectedDepartment.rooms.map(room => (
                  <motion.button
                    key={room.id}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectRoom(room)}
                    className="group flex flex-col items-center justify-center gap-4 rounded-3xl bg-slate-50 dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-emerald-300 dark:hover:ring-emerald-500 hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20 transition-all"
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
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 3: DEVICES TABLE */}
        {isTableView && (
          <motion.div 
            key="table"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-6"
          >
            {/* Prominent Section Title */}
            {!showGlobalSearch && selectedRoom ? (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleBack}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors"
                    title="گەڕانەوە"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Cpu size={24} />
                  </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                    ئامێرەکانی ژووری {selectedRoom?.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">سەرجەم ئامێرە تۆمارکراوەکانی ئەم ژوورە</p>
                </div>
                </div>
                <Button 
                  variant="outline" 
                  className="gap-2 border-primary-200 text-primary-600 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-400 dark:hover:bg-primary-900/30"
                  onClick={() => setIsPrintRoomModalOpen(true)}
                >
                  <Printer size={18} />
                  چاپکردنی لیستی ژوور
                </Button>
              </div>
            ) : showGlobalSearch ? (
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Cpu size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                    ئەنجامی گەڕان
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">سەرجەم ئەو ئامێرانەی کە دۆزراونەتەوە</p>
                </div>
              </div>
            ) : null}

            {/* Render Analytics above table */}
            {!showGlobalSearch && selectedRoom && (
              <div className="bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl p-5 border-2 border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-xl text-blue-600 dark:text-blue-300">
                    <Info size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">
                      ئەم ئامارانەی خوارەوە کۆی گشتی سەرجەم ئامێرە تۆمارکراوەکانی ژووری {selectedRoom?.name}یە
                    </h4>
                  </div>
                </div>
                {renderRoomAnalytics()}
              </div>
            )}

            <div className="rounded-3xl bg-slate-50 dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
              <div className="overflow-x-auto pb-48">
                <table className="w-full text-sm text-center min-w-[1200px]">
                <thead className="bg-slate-700 dark:bg-slate-800 border-b-4 border-slate-600 dark:border-slate-700 shadow-md">
                  <tr>
                    <th className="px-4 py-4 w-16 font-bold text-slate-100 text-center rounded-tr-xl">#</th>
                    <th className="px-4 py-4 font-bold text-slate-100">جۆر</th>
                    <th className="px-4 py-4 font-bold text-slate-100">براند</th>
                    <th className="px-4 py-4 font-bold text-slate-100 cursor-pointer hover:bg-slate-600 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('serialNumber')}>
                      <div className="flex items-center justify-center gap-1">کۆدی ئامێر (S/N) {renderSortIcon('serialNumber')}</div>
                    </th>
                    <th className="px-4 py-4 font-bold text-slate-100 cursor-pointer hover:bg-slate-600 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('ram')}>
                      <div className="flex items-center justify-center gap-1">ڕام {renderSortIcon('ram')}</div>
                    </th>
                    <th className="px-4 py-4 font-bold text-slate-100 cursor-pointer hover:bg-slate-600 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('hdd')}>
                      <div className="flex items-center justify-center gap-1">هارد {renderSortIcon('hdd')}</div>
                    </th>
                    <th className="px-4 py-4 font-bold text-slate-100 cursor-pointer hover:bg-slate-600 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('cpu')}>
                      <div className="flex items-center justify-center gap-1">پرۆسێسەر {renderSortIcon('cpu')}</div>
                    </th>
                    <th className="px-4 py-4 font-bold text-slate-100 cursor-pointer hover:bg-slate-600 dark:hover:bg-slate-700 transition-colors" onClick={() => handleSort('gpu')}>
                      <div className="flex items-center justify-center gap-1">گرافیک {renderSortIcon('gpu')}</div>
                    </th>
                    <th className="px-4 py-4 font-bold text-slate-100">UPS</th>
                    <th className="px-4 py-4 font-bold text-slate-100">باری ئامێر</th>
                    <th className="px-4 py-4 font-bold text-slate-100 w-[120px] rounded-tl-xl">کردارەکان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="text-center py-20">
                        <div className="flex flex-col justify-center items-center gap-4">
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                          <span className="font-bold text-slate-500 dark:text-slate-400">دەهێنرێت...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedDevices.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-20">
                        <div className="flex flex-col items-center justify-center opacity-50">
                          <Cpu size={48} className="mb-4 text-slate-400" />
                          <p className="font-bold text-lg text-slate-500 dark:text-slate-400">هیچ ئامێرێک نەدۆزرایەوە.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedDevices.map((device, index) => (
                      <Fragment key={device.id}>
                        <tr 
                          className={clsx(
                            "group border-t border-slate-200 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors",
                            expandedDeviceId === device.id && "bg-slate-50/80 dark:bg-slate-800/80 border-b-0"
                          )}
                        >
                          <td className="px-4 py-4 font-bold text-slate-500 dark:text-slate-400 text-center">{index + 1}</td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center rounded-lg bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 text-xs font-bold text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-800">
                              {device.category?.name || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4" dir="ltr">
                            <div className="font-bold text-slate-700 dark:text-slate-300">{device.brand || '-'}</div>
                          </td>
                        <td className="px-4 py-4 font-bold text-slate-500 dark:text-slate-400" dir="ltr">{device.serialNumber || '-'}</td>
                        <td className="px-4 py-4 font-bold text-slate-500 dark:text-slate-400" dir="ltr">{device.ram || '-'}</td>
                        <td className="px-4 py-4 font-bold text-slate-500 dark:text-slate-400" dir="ltr">{device.hdd || device.ssd || '-'}</td>
                        <td className="px-4 py-4 font-bold text-slate-500 dark:text-slate-400" dir="ltr">{device.cpu || '-'}</td>
                        <td className="px-4 py-4 font-bold text-slate-500 dark:text-slate-400" dir="ltr">{device.gpu || '-'}</td>
                        <td className="px-4 py-4">
                          {device.ups ? (
                            <span className={clsx(
                              "inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold border",
                              device.ups === 'هەیە' && 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
                              device.ups === 'نیەتی' && 'bg-slate-50 text-slate-700 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
                              device.ups === 'سوتاوە' && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                            )}>
                              {device.ups}
                            </span>
                          ) : (
                            <span className="font-bold text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={clsx(
                            "inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold border",
                            device.status === 'ACTIVE' && 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
                            device.status === 'BROKEN' && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
                            device.status === 'UNDER_MAINTENANCE' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
                            device.status === 'DISPOSED' && 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          )}>
                            {device.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1 opacity-100 transition-opacity">
                            <div className="relative">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={clsx(
                                  "h-8 w-8 rounded-lg transition-colors",
                                  expandedDeviceId === device.id 
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" 
                                    : "bg-slate-100 text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-900/30"
                                )} 
                                onClick={() => handleExpandDevice(device)}
                                title="چاکردنەوەکان"
                              >
                                {expandedDeviceId === device.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </Button>
                              {device.maintenanceCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                                  {device.maintenanceCount}
                                </span>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg" onClick={() => handlePrint(device)}>
                              <Printer size={16} />
                            </Button>
                            {(['ADMIN', 'IT_STAFF'].includes(user?.role?.toUpperCase())) && (
                              <>
                                <Button variant="ghost" size="icon" title="گواستنەوە" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg" onClick={() => setDeviceToTransfer(device)}>
                                  <MapPin size={16} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg" onClick={() => handleEdit(device)}>
                                  <Edit size={16} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg" onClick={() => handleDelete(device.id)}>
                                  <Trash2 size={16} />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Maintenance Row */}
                      <AnimatePresence>
                        {expandedDeviceId === device.id && (
                          <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/50">
                            <td colSpan={10} className="p-0">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6">
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                      <Zap size={16} />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">وردەکاری چاکردنەوەکان</h4>
                                    {loadingMaintenances && <div className="mr-4 w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>}
                                  </div>
                                  
                                  {!loadingMaintenances && deviceMaintenances[device.id] && deviceMaintenances[device.id].length === 0 && (
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                                      <p className="text-slate-500 dark:text-slate-400 font-medium">هیچ چاکردنەوەیەک تۆمار نەکراوە بۆ ئەم ئامێرە.</p>
                                    </div>
                                  )}
                                  
                                  {!loadingMaintenances && deviceMaintenances[device.id] && deviceMaintenances[device.id].length > 0 && (
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                      <table className="w-full text-sm text-right">
                                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                          <tr>
                                            <th className="px-4 py-3 font-bold">بەروار</th>
                                            <th className="px-4 py-3 font-bold">لایەنی داواکار</th>
                                            <th className="px-4 py-3 font-bold">کاری ئەنجامدراو</th>
                                            <th className="px-4 py-3 font-bold">تەکنیکار</th>
                                            <th className="px-4 py-3 font-bold">تێبینی</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                          {deviceMaintenances[device.id].map(m => (
                                            <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium" dir="ltr">{new Date(m.visitDate).toLocaleDateString()}</td>
                                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{m.requesterName || '-'}</td>
                                              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{m.maintenanceTask || '-'}</td>
                                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{m.technician?.name || '-'}</td>
                                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{m.notes || '-'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  ))
                )}
                  {/* Inline Add Row (Only shown when inside a room) */}
                  {!loading && !showGlobalSearch && selectedRoom && (
                    <tr className="bg-primary-50/50 dark:bg-primary-900/20 border-t border-primary-100 dark:border-primary-800/50 hover:bg-primary-50/70 transition-colors">
                      <td className="px-2 py-3 text-center text-primary-400">
                        <Plus size={16} className="mx-auto" />
                      </td>
                      <td className="px-2 py-3">
                        <CustomCategoryDropdown
                          categories={categories}
                          value={inlineForm.categoryId}
                          onChange={(val) => setInlineForm({...inlineForm, categoryId: val})}
                          onCategoryAdded={(newCat) => setCategories([...categories, newCat])}
                          onCategoryDeleted={(deletedId) => setCategories(categories.filter(c => c.id !== deletedId))}
                          placeholder="هەڵبژێرە..."
                        />
                      </td>
                      <td className="px-2 py-3" dir="ltr">
                        <div className="flex flex-col gap-1">
                          <CustomSpecDropdown 
                            type="brand"
                            value={inlineForm.brand}
                            onChange={(val) => setInlineForm({...inlineForm, brand: val})}
                            placeholder="Brand"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-3" dir="ltr">
                        <input 
                          placeholder="S/N" 
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white px-3 py-2 text-xs font-bold text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shadow-sm" 
                          value={inlineForm.serialNumber} 
                          onChange={e => {
                            let val = e.target.value.toUpperCase();
                            if (val.length > 0 && !val.startsWith("S/N-")) {
                              if (val.startsWith("S/N")) {
                                val = "S/N-" + val.substring(3).replace(/^[-\s]+/, '');
                              } else {
                                val = "S/N-" + val;
                              }
                            }
                            if (val === "S/N-" || val === "S/N") val = "";
                            setInlineForm({...inlineForm, serialNumber: val});
                          }} 
                        />
                      </td>
                      <td className="px-2 py-3" dir="ltr">
                        {isComputer(inlineForm.categoryId) ? (
                          <CustomSpecDropdown 
                            type="ram"
                            value={inlineForm.ram}
                            onChange={(val) => setInlineForm({...inlineForm, ram: val})}
                            placeholder="RAM"
                          />
                        ) : <div className="text-center text-slate-300 dark:text-slate-600 font-bold">-</div>}
                      </td>
                      <td className="px-2 py-3" dir="ltr">
                        {isComputer(inlineForm.categoryId) ? (
                          <CustomSpecDropdown 
                            type="hdd"
                            value={inlineForm.hdd}
                            onChange={(val) => setInlineForm({...inlineForm, hdd: val})}
                            placeholder="Storage"
                          />
                        ) : <div className="text-center text-slate-300 dark:text-slate-600 font-bold">-</div>}
                      </td>
                      <td className="px-2 py-3" dir="ltr">
                        {isComputer(inlineForm.categoryId) ? (
                          <CustomSpecDropdown 
                            type="cpu"
                            value={inlineForm.cpu}
                            onChange={(val) => setInlineForm({...inlineForm, cpu: val})}
                            placeholder="CPU"
                          />
                        ) : <div className="text-center text-slate-300 dark:text-slate-600 font-bold">-</div>}
                      </td>
                      <td className="px-2 py-3" dir="ltr">
                        {isComputer(inlineForm.categoryId) ? (
                          <CustomSpecDropdown 
                            type="gpu"
                            value={inlineForm.gpu}
                            onChange={(val) => setInlineForm({...inlineForm, gpu: val})}
                            placeholder="GPU"
                          />
                        ) : <div className="text-center text-slate-300 dark:text-slate-600 font-bold">-</div>}
                      </td>
                      <td className="px-2 py-3">
                        {isComputer(inlineForm.categoryId) ? (
                          <select className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white px-3 py-2 text-xs font-bold text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shadow-sm" value={inlineForm.ups} onChange={e => setInlineForm({...inlineForm, ups: e.target.value})}>
                            <option value="">-</option>
                            <option value="هەیە">هەیە</option>
                            <option value="نیەتی">نیەتی</option>
                            <option value="سوتاوە">سوتاوە</option>
                          </select>
                        ) : <div className="text-center text-slate-300 dark:text-slate-600 font-bold">-</div>}
                      </td>
                      <td className="px-2 py-3">
                        <select className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white px-2 py-2 text-xs font-bold text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shadow-sm" value={inlineForm.status} onChange={e => setInlineForm({...inlineForm, status: e.target.value})}>
                          <option value="ACTIVE">کاردەکات</option>
                          <option value="BROKEN">لەکارکەوتوو</option>
                          <option value="UNDER_MAINTENANCE">چاککردنەوە</option>
                          <option value="DISPOSED">فڕێدراو</option>
                        </select>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <Button 
                          onClick={handleInlineSubmit} 
                          disabled={inlineLoading || !inlineForm.categoryId} 
                          className="w-full h-8 px-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 text-xs gap-1"
                        >
                          {inlineLoading ? <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <><Plus size={14} /> پاشەکەوت</>}
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      <EditDeviceModal
        isOpen={!!deviceToEdit}
        onClose={() => setDeviceToEdit(null)}
        onUpdated={() => {
          if (isTableView) fetchDevices();
          fetchDepartments();
        }}
        device={deviceToEdit}
      />

      <TransferDeviceModal
        isOpen={!!deviceToTransfer}
        onClose={() => setDeviceToTransfer(null)}
        onTransfer={() => {
          if (isTableView) fetchDevices();
          fetchDepartments();
        }}
        device={deviceToTransfer}
      />

      <PrintDeviceModal
        isOpen={!!deviceToPrint}
        onClose={() => setDeviceToPrint(null)}
        device={deviceToPrint}
      />

      <PrintRoomModal
        isOpen={isPrintRoomModalOpen}
        onClose={() => setIsPrintRoomModalOpen(false)}
        room={selectedRoom}
        department={selectedDepartment}
        devices={sortedDevices}
      />
    </div>
  );
};

export default DevicesPage;
