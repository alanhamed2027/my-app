import { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { Wrench, Plus, PenTool, Printer, Trash2, Edit, ArrowUpDown, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import AddMaintenanceModal from '../../components/maintenance/AddMaintenanceModal';

const MaintenancePage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLog, setEditLog] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'visitDate', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="opacity-40 transition-opacity group-hover:opacity-100 print:hidden" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} className="text-emerald-500 print:hidden" /> 
      : <ChevronDown size={14} className="text-emerald-500 print:hidden" />;
  };

  const sortedLogs = [...logs].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = '', bValue = '';
    
    switch(sortConfig.key) {
      case 'departmentRoom':
        aValue = `${a.department?.name || ''} ${a.room?.name || ''}`;
        bValue = `${b.department?.name || ''} ${b.room?.name || ''}`;
        break;
      case 'device':
        aValue = `${a.deviceBrandModel || ''} ${a.deviceSerialNumber || ''}`;
        bValue = `${b.deviceBrandModel || ''} ${b.deviceSerialNumber || ''}`;
        break;
      case 'requesterName':
        aValue = a.requesterName || '';
        bValue = b.requesterName || '';
        break;
      case 'maintenanceTask':
        aValue = a.maintenanceTask || '';
        bValue = b.maintenanceTask || '';
        break;
      case 'technician':
        aValue = a.technician?.name || '';
        bValue = b.technician?.name || '';
        break;
      case 'visitDate':
        aValue = new Date(a.visitDate).getTime();
        bValue = new Date(b.visitDate).getTime();
        break;
      default:
        aValue = '';
        bValue = '';
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handlePrintDocument = (url) => {
    const isPdf = url.toLowerCase().endsWith('.pdf');
    
    if (isPdf) {
      // PDFs usually open in browser's PDF viewer which has its own print button
      window.open(url, '_blank');
      return;
    }

    // Open a new tab for printing with explicit controls
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("تکایە ڕێگە بە (Pop-ups) بدە بۆ ئەوەی پەنجەرەی پرینت بکرێتەوە.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>پرینتکردنی بەڵگەنامە</title>
          <style>
            body { 
              margin: 0; 
              display: flex; 
              flex-direction: column; 
              justify-content: flex-start; 
              align-items: center; 
              min-height: 100vh; 
              background-color: #f1f5f9; 
              font-family: system-ui, -apple-system, sans-serif;
            }
            .controls { 
              width: 100%; 
              padding: 15px; 
              background: white; 
              box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
              display: flex; 
              justify-content: center; 
              gap: 15px;
              position: sticky;
              top: 0;
            }
            .btn { 
              border: none; 
              padding: 10px 24px; 
              font-size: 16px; 
              border-radius: 8px; 
              cursor: pointer; 
              font-weight: bold; 
              transition: opacity 0.2s;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .btn:hover { opacity: 0.9; }
            .btn-print { background: #10b981; color: white; }
            .btn-close { background: #ef4444; color: white; }
            .img-container { 
              flex-grow: 1; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              padding: 20px; 
              box-sizing: border-box; 
              width: 100%;
            }
            img { 
              max-width: 100%; 
              max-height: calc(100vh - 120px); 
              object-fit: contain; 
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); 
              background: white;
            }
            @media print {
              .controls { display: none !important; }
              body, html { height: 100%; width: 100%; margin: 0; padding: 0; background-color: white; }
              .img-container { padding: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
              img { max-width: 100%; max-height: 100%; width: auto; height: auto; box-shadow: none; page-break-inside: avoid; }
              @page { margin: 0; }
            }
          </style>
        </head>
          <div class="img-container">
            <img src="${url}" onload="setTimeout(function(){ window.print(); window.close(); }, 500);" />
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('دڵنیایت لە سڕینەوەی ئەم تۆمارە؟')) return;
    try {
      const res = await axios.delete(`/maintenance/${id}`);
      if (res.data.success) {
        setLogs(prev => prev.filter(log => log.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'هەڵەیەک ڕوویدا لە کاتی سڕینەوە');
    }
  };

  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = '/maintenance';
      const params = [];
      if (selectedDepartmentId) params.push(`departmentId=${selectedDepartmentId}`);
      if (selectedRoomId) params.push(`roomId=${selectedRoomId}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await axios.get(url);
      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch maintenance logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/departments');
        if (res.data.success) {
          const fetchedDepartments = res.data.data;
          setDepartments(fetchedDepartments);
        }
      } catch (err) {
        console.error("Error fetching departments", err);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [selectedDepartmentId, selectedRoomId]);

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Simple Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">ڕاپۆرتی چاککردنەوەکان</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base mt-1">
            مێژووی چاککردنەوەی ئامێرەکان و تێچووەکانیان
          </p>
        </div>
        
        {/* Actions & Filters */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* Inline Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-2xl border border-emerald-200 dark:border-emerald-800 print:hidden shadow-sm">
            <div className="flex items-center gap-2 px-2 text-emerald-700 dark:text-emerald-400">
              <Filter size={16} />
              <span className="text-sm font-black">فلتەر:</span>
            </div>
            
            <select 
              className="appearance-none w-full sm:w-40 rounded-xl border border-emerald-200/50 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer hover:border-emerald-300 transition-colors text-center shadow-sm"
              value={selectedDepartmentId}
              onChange={(e) => {
                setSelectedDepartmentId(e.target.value);
                setSelectedRoomId('');
              }}
            >
              <option value="">گشت بەشەکان</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            
            {selectedDepartmentId && (
              <>
                <div className="hidden sm:block w-px h-6 bg-emerald-200 dark:bg-emerald-800/50"></div>
                <select 
                  className="appearance-none w-full sm:w-40 rounded-xl border border-emerald-200/50 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer hover:border-emerald-300 transition-colors animate-in fade-in text-center shadow-sm"
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                >
                  <option value="">گشت ژوورەکان</option>
                  {departments.find(d => d.id === parseInt(selectedDepartmentId))?.rooms?.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* Action Button */}
          <div className="flex w-full md:w-auto gap-2 print:hidden">
            <Button 
              className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl px-5 h-11"
              onClick={() => window.print()}
              title="چاپکردنی ڕاپۆرت"
            >
              <Printer size={20} className="ml-2" />
              چاپکردن
            </Button>
            
            {(user?.role === 'ADMIN' || user?.role === 'IT_STAFF') && (
              <Button 
                className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 rounded-xl px-5 h-11"
                onClick={() => {
                  setEditLog(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={20} className="ml-2" />
                زیادکردنی چاکردنەوە
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl print:rounded-none bg-slate-50 dark:bg-slate-900 shadow-sm print:shadow-none ring-1 print:ring-0 ring-slate-200 dark:ring-slate-800 overflow-hidden print:overflow-visible">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-sm print:text-xs text-right">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-start gap-2 print:block print:text-right">بەش و ژوور</div>
                </th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-start gap-2 print:block print:text-right">جۆری ئامێر</div>
                </th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-start gap-2 print:block print:text-right">ئامێر</div>
                </th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-start gap-2 print:block print:text-right">داواکار</div>
                </th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-start gap-2 print:block print:text-right">تەکنیکار</div>
                </th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-start gap-2 print:block print:text-right">بەروار</div>
                </th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-start gap-2 print:block print:text-right">چاککردن</div>
                </th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 print:hidden">بەڵگەنامە</th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-right print:hidden">کردارەکان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <div className="flex justify-center items-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
                      <span className="font-semibold text-slate-500 dark:text-slate-400">دەهێنرێت...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <p className="font-semibold text-slate-500 dark:text-slate-400">هیچ ڕاپۆرتێک نەدۆزرایەوە.</p>
                  </td>
                </tr>
              ) : (
                sortedLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="print:block print:text-right">{log.department ? <div className="font-bold text-slate-700 dark:text-slate-300">{log.department.name}</div> : <span className="text-slate-400">-</span>}
                      {log.room && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">ژووری {log.room.name}</div>}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 print:block print:text-right">
                        <span className="font-bold text-slate-700 dark:text-slate-300 print:block">{log.deviceType || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 print:block print:text-right">
                        <span className="font-bold text-slate-700 dark:text-slate-300 print:block">{log.deviceBrandModel || '-'}</span>
                        {log.deviceSerialNumber && <span className="text-xs font-mono text-slate-500 dark:text-slate-400 print:block" dir="ltr">{log.deviceSerialNumber}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 print:block print:text-right">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{log.requesterName || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 print:block print:text-right">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{log.technician?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-start print:block print:text-right">
                        <div className="inline-flex print:block items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 text-sm font-black text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 print:bg-transparent print:border-none print:p-0" dir="ltr">
                          {new Date(log.visitDate).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 print:w-32 print:max-w-[150px] max-w-[200px]">
                      <div className="flex flex-col gap-1 print:block print:text-right">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-sm print:text-[10px] whitespace-pre-wrap print:whitespace-normal print:overflow-visible print:max-w-none">{log.maintenanceTask || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center print:hidden">
                      {log.documentUrl ? (
                        <button 
                          onClick={() => handlePrintDocument(log.documentUrl)} 
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold transition-colors"
                        >
                          <Printer size={16} />
                          پرینت
                        </button>
                      ) : (
                        <span className="text-slate-400 text-sm">نییە</span>
                      )}
                    </td>
                    <td className="px-6 py-4 print:hidden">
                      <div className="flex items-center gap-2 justify-end">
                        <button 
                          onClick={() => {
                            setEditLog(log);
                            setIsModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 transition-colors"
                          title="دەستکاریکردن"
                        >
                          <Edit size={16} />
                        </button>
                        {user?.role?.toUpperCase() === 'ADMIN' && (
                          <button 
                            onClick={() => handleDelete(log.id)}
                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                            title="سڕینەوە"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddMaintenanceModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditLog(null);
        }}
        onAdded={(newLog) => {
          fetchLogs();
          setIsModalOpen(false);
        }}
        editData={editLog}
        onUpdated={(updatedLog) => {
          fetchLogs();
          setIsModalOpen(false);
          setEditLog(null);
        }}
      />
    </div>
  );
};

export default MaintenancePage;
