import { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { Printer, Filter, Monitor, Wrench, Search } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useSystem } from '../../context/SystemContext';

const ReportsPage = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { systemType } = useSystem();
  
  // Tabs: 'devices' | 'maintenance'
  const [activeTab, setActiveTab] = useState('devices');
  const [loading, setLoading] = useState(false);
  
  // Device Report State
  const [deviceReports, setDeviceReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Maintenance Report State
  const [maintenanceReports, setMaintenanceReports] = useState(null);
  const [users, setUsers] = useState([]); // For technicians

  // Filters
  const [deviceFilters, setDeviceFilters] = useState({
    departmentId: '',
    roomId: '',
    categoryId: '',
    fromDate: '',
    toDate: ''
  });

  const [maintenanceFilters, setMaintenanceFilters] = useState({
    technicianId: '',
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    // Fetch common filter data
    const fetchFilterData = async () => {
      try {
        const [deptRes, catRes, usersRes] = await Promise.all([
          axios.get('/departments'),
          axios.get('/devices/categories').catch(() => ({ data: { data: [] } })), // Fallback if wrong endpoint
          axios.get('/users').catch(() => ({ data: { data: [] } }))
        ]);
        
        if (deptRes.data?.success) setDepartments(deptRes.data.data);
        if (catRes.data?.success) setCategories(catRes.data.data);
        if (usersRes.data?.success) {
          // Filter only IT_STAFF for technicians if needed, or keep all
          setUsers(usersRes.data.data.filter(u => u.role === 'IT_STAFF' || u.role === 'ADMIN'));
        }
      } catch (error) {
        console.error("Error fetching filter data", error);
      }
    };
    fetchFilterData();
  }, []);

  const handleDeviceFilterChange = (e) => {
    setDeviceFilters({ ...deviceFilters, [e.target.name]: e.target.value });
  };

  const handleMaintenanceFilterChange = (e) => {
    setMaintenanceFilters({ ...maintenanceFilters, [e.target.name]: e.target.value });
  };

  const generateDeviceReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(deviceFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`/reports/devices?${params.toString()}`);
      if (response.data?.success) {
        setDeviceReports(response.data.data);
      }
    } catch (error) {
      alert("هەڵەیەک ڕوویدا لە وەرگرتنی ڕاپۆرتەکە");
    } finally {
      setLoading(false);
    }
  };

  const generateMaintenanceReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(maintenanceFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`/reports/maintenance?${params.toString()}`);
      if (response.data?.success) {
        setMaintenanceReports(response.data.data);
      }
    } catch (error) {
      alert("هەڵەیەک ڕوویدا لە وەرگرتنی ڕاپۆرتەکە");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-0 print:m-0">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 print:hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-primary-800/10 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-tr from-blue-100 to-primary-50 dark:from-blue-900/20 dark:to-primary-800/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400">
                <Printer size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">ڕاپۆرتەکان</h1>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              لێرەوە دەتوانیت ڕاپۆرتی گشتی بۆ ئامێرەکان و کاری چاککردنەوەکان دەربهێنیت بەپێی فلتەرە جیاوازەکان.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-4 border-b border-slate-200 dark:border-slate-700 relative z-10">
          <button
            onClick={() => setActiveTab('devices')}
            className={`pb-4 px-4 font-bold text-sm flex items-center gap-2 transition-colors ${activeTab === 'devices' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Monitor size={18} />
            ڕاپۆرتی ئامێرەکان
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`pb-4 px-4 font-bold text-sm flex items-center gap-2 transition-colors ${activeTab === 'maintenance' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Wrench size={18} />
            ڕاپۆرتی چاککردنەوەکان
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="print:m-0 print:p-0">
        
        {/* Printable Header (Only shows on print) */}
        <div className="hidden print:flex items-start justify-between border-b-4 border-black pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-black mb-2">{settings?.orgName || 'ناوی فەرمانگە'}</h1>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{activeTab === 'devices' ? 'ڕاپۆرتی ئامێرەکان' : 'ڕاپۆرتی چاککردنەوەکان'}</h2>
            <p className="text-sm text-slate-600 font-bold">بەرواری چاپ: {new Date().toLocaleDateString('en-GB')}</p>
          </div>
          <div>
            {settings?.orgLogo ? (
              <img src={settings.orgLogo} alt="Logo" className="w-24 h-24 object-contain mb-2 ml-auto" />
            ) : (
              <div className="w-24 h-24 bg-slate-100 rounded-xl mb-2 flex items-center justify-center border-2 border-dashed border-slate-300">
                <span className="text-slate-400 font-medium text-xs">لۆگۆ</span>
              </div>
            )}
          </div>
        </div>

        {/* ---------------- DEVICES TAB ---------------- */}
        {activeTab === 'devices' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 print:hidden">
              <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-100">
                <Filter size={20} />
                <h3 className="font-bold">فلتەرەکان</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {systemType === 'EXTERNAL' ? 'ناوی شارەوانی' : 'بەش'}
                  </label>
                  <select 
                    name="departmentId" 
                    value={deviceFilters.departmentId} 
                    onChange={handleDeviceFilterChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">{systemType === 'EXTERNAL' ? 'هەموو شارەوانییەکان' : 'هەموو بەشەکان'}</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">جۆری ئامێر</label>
                  <select 
                    name="categoryId" 
                    value={deviceFilters.categoryId} 
                    onChange={handleDeviceFilterChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">هەموو جۆرەکان</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">ژوور</label>
                  <select 
                    name="roomId" 
                    value={deviceFilters.roomId} 
                    onChange={handleDeviceFilterChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">هەموو ژوورەکان</option>
                    {deviceFilters.departmentId 
                      ? departments.find(d => d.id == deviceFilters.departmentId)?.rooms?.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))
                      : departments.flatMap(d => (d.rooms || []).map(r => ({...r, deptName: d.name}))).map(r => (
                          <option key={r.id} value={r.id}>{r.name} ({r.deptName})</option>
                        ))
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">لە بەرواری</label>
                  <input 
                    type="date"
                    name="fromDate"
                    value={deviceFilters.fromDate}
                    onChange={handleDeviceFilterChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">بۆ بەرواری</label>
                  <input 
                    type="date"
                    name="toDate"
                    value={deviceFilters.toDate}
                    onChange={handleDeviceFilterChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={generateDeviceReport}
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2"
                >
                  <Search size={18} />
                  دەرهێنانی ڕاپۆرت
                </Button>
              </div>
            </div>

            {/* Results */}
            {deviceReports.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden print:ring-0 print:shadow-none">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center print:hidden">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    ئەنجامەکان ({deviceReports.length} ئامێر)
                  </h3>
                  <Button 
                    onClick={handlePrint}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2"
                  >
                    <Printer size={18} />
                    پرینتکردن
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 print:bg-transparent print:border-b-2 print:border-black print:text-black">
                      <tr>
                        <th className="py-4 px-6">کۆدی ئامێر (S/N)</th>
                        <th className="py-4 px-6">جۆر</th>
                        <th className="py-4 px-6">براند</th>
                        <th className="py-4 px-6">پرۆسێسەر</th>
                        <th className="py-4 px-6">هارد</th>
                        <th className="py-4 px-6">{systemType === 'EXTERNAL' ? 'ناوی شارەوانی' : 'بەش'}</th>
                        <th className="py-4 px-6">ژوور</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-black">
                      {deviceReports.map(device => (
                        <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300 print:text-black">
                          <td className="py-3 px-6 font-bold" dir="ltr">{device.serialNumber || '-'}</td>
                          <td className="py-3 px-6">{device.category?.name || '-'}</td>
                          <td className="py-3 px-6">{device.brand || '-'}</td>
                          <td className="py-3 px-6" dir="ltr">{device.cpu || '-'}</td>
                          <td className="py-3 px-6" dir="ltr">{device.hdd || device.ssd || '-'}</td>
                          <td className="py-3 px-6">{device.department?.name || '-'}</td>
                          <td className="py-3 px-6">{device.room?.name || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- MAINTENANCE TAB ---------------- */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 print:hidden">
              <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-100">
                <Filter size={20} />
                <h3 className="font-bold">فلتەرەکان</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">تەکنیکار (ئایتی)</label>
                  <select 
                    name="technicianId" 
                    value={maintenanceFilters.technicianId} 
                    onChange={handleMaintenanceFilterChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">هەموو تەکنیکارەکان</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">لە بەرواری</label>
                  <input 
                    type="date"
                    name="fromDate"
                    value={maintenanceFilters.fromDate}
                    onChange={handleMaintenanceFilterChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">بۆ بەرواری</label>
                  <input 
                    type="date"
                    name="toDate"
                    value={maintenanceFilters.toDate}
                    onChange={handleMaintenanceFilterChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={generateMaintenanceReport}
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2"
                >
                  <Search size={18} />
                  دەرهێنانی ڕاپۆرت
                </Button>
              </div>
            </div>

            {/* Results */}
            {maintenanceReports && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden print:ring-0 print:shadow-none">
                
                {/* Stats Summary */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col md:flex-row md:items-center justify-between gap-4 print:bg-transparent print:border-b-2 print:border-black">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1 print:text-black">
                      پوختەی چاککردنەوەکان
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      کۆی گشتی: <span className="font-bold text-slate-700 dark:text-slate-300 print:text-black">{maintenanceReports.logsCount}</span> پڕۆسە
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={handlePrint}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 print:hidden"
                    >
                      <Printer size={18} />
                      پرینت
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 print:bg-transparent print:border-b-2 print:border-black print:text-black">
                      <tr>
                        <th className="py-4 px-6">بەستراوە بە</th>
                        <th className="py-4 px-6">داواکار</th>
                        <th className="py-4 px-6">چاککردن</th>
                        <th className="py-4 px-6">تەکنیکار</th>
                        <th className="py-4 px-6">تێبینی</th>
                        <th className="py-4 px-6">بەروار</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-black">
                      {maintenanceReports.logs.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-500 dark:text-slate-400">هیچ چاککردنەوەیەک نەدۆزرایەوە</td>
                        </tr>
                      ) : (
                        maintenanceReports.logs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300 print:text-black">
                            <td className="py-3 px-6 font-medium">
                              {log.department ? <div>{systemType === 'EXTERNAL' ? 'شارەوانی' : 'بەش'}: {log.department.name}</div> : '-'}
                              {log.room && <div>ژوور: {log.room.name}</div>}
                            </td>
                            <td className="py-3 px-6">{log.requesterName || '-'}</td>
                            <td className="py-3 px-6">{log.maintenanceTask || '-'}</td>
                            <td className="py-3 px-6">{log.technician?.name || '-'}</td>
                            <td className="py-3 px-6 line-clamp-1 max-w-[200px]" title={log.notes}>{log.notes || '-'}</td>
                            <td className="py-3 px-6">{new Date(log.visitDate).toLocaleDateString('en-GB')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportsPage;
